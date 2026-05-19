#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

#define SDA_PIN 21
#define SCL_PIN 22

Adafruit_PN532 nfc(SDA_PIN, SCL_PIN);

const char* WIFI_NAME = "PLDTHOMEFIBRUh5BN_2.4G";
const char* WIFI_PASS = "Pacer115_";

const char* API_URL = "https://safepass-052h.onrender.com/api/device/location-tap";
const char* DEVICE_KEY = "71eb2b8fbdfa47b2b2334fde89cc99b583a39709997d4434859ad645dbce89e4";

const char* READER_ID = "pn532_reader";
const char* ACTION = "auto";

unsigned long lastTapTime = 0;
String lastUid = "";
const unsigned long TAP_COOLDOWN_MS = 3000;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("SafePass ESP32 PN532 Reader Starting...");

  Wire.begin(SDA_PIN, SCL_PIN);

  connectToWifi();
  setupPN532();

  Serial.println("Ready. Tap NFC card...");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWifi();
  }

  uint8_t uid[7];
  uint8_t uidLength;

  bool cardFound = nfc.readPassiveTargetID(
    PN532_MIFARE_ISO14443A,
    uid,
    &uidLength,
    1000
  );

  if (cardFound) {
    String uidString = uidToString(uid, uidLength);

    if (uidString == lastUid && millis() - lastTapTime < TAP_COOLDOWN_MS) {
      return;
    }

    lastUid = uidString;
    lastTapTime = millis();

    Serial.println();
    Serial.print("Card UID: ");
    Serial.println(uidString);

    sendTapToSafePass(uidString);
  }
}

void connectToWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASS);

  Serial.print("Connecting to WiFi SSID: ");
  Serial.println(WIFI_NAME);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi failed.");
    Serial.println("Make sure this Wi-Fi is 2.4GHz. ESP32 cannot connect to 5GHz.");
  }
}

void setupPN532() {
  nfc.begin();

  uint32_t versiondata = nfc.getFirmwareVersion();

  if (!versiondata) {
    Serial.println("PN532 not found. Check wiring.");
    while (1) {
      delay(1000);
    }
  }

  Serial.print("PN532 found. Firmware version: ");
  Serial.print((versiondata >> 16) & 0xFF, DEC);
  Serial.print(".");
  Serial.println((versiondata >> 8) & 0xFF, DEC);

  nfc.SAMConfig();
}

String uidToString(uint8_t *uid, uint8_t uidLength) {
  String uidString = "";

  for (uint8_t i = 0; i < uidLength; i++) {
    if (uid[i] < 0x10) {
      uidString += "0";
    }
    uidString += String(uid[i], HEX);
  }

  uidString.toUpperCase();
  return uidString;
}

void sendTapToSafePass(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send. WiFi not connected.");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  String body = "{";
  body += "\"pn532Uid\":\"" + uid + "\",";
  body += "\"readerId\":\"" + String(READER_ID) + "\",";
  body += "\"deviceId\":\"esp32-pn532-01\",";
  body += "\"action\":\"" + String(ACTION) + "\"";
  body += "}";

  Serial.println("Sending to SafePass...");
  Serial.println(body);

  int httpCode = http.POST(body);
  String response = http.getString();

  Serial.print("HTTP Code: ");
  Serial.println(httpCode);

  Serial.println("Response:");
  Serial.println(response);

  if (httpCode == 200) {
    Serial.println("Tap sent successfully.");
  } else {
    Serial.println("Tap failed. Check UID assignment, device key, visitor approval, or backend logs.");
  }

  http.end();
}