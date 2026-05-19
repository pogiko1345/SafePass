#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

// SafePass ESP32 + PN532 Reader
// Wiring:
// PN532 VCC -> ESP32 3.3V
// PN532 GND -> ESP32 GND
// PN532 SDA -> ESP32 GPIO 26
// PN532 SCL -> ESP32 GPIO 25

#define SDA_PIN 26
#define SCL_PIN 25

Adafruit_PN532 nfc(SDA_PIN, SCL_PIN);

// Wi-Fi
const char* WIFI_NAME = "PLDTHOMEFIBRUh5BN_2.4G";
const char* WIFI_PASS = "Pacer115_";

// SafePass backend
const char* API_URL = "https://safepass-052h.onrender.com/api/device/location-tap";
const char* DEVICE_KEY = "71eb2b8fbdfa47b2b2334fde89cc99b583a39709997d4434859ad645dbce89e4";

// Reader setup
const char* READER_ID = "pn532_reader";
const char* DEVICE_ID = "esp32-pn532-01";
const char* ACTION = "auto";

// Tap cooldown
unsigned long lastTapTime = 0;
String lastTapKey = "";
const unsigned long TAP_COOLDOWN_MS = 3000;

// Android HCE AID: F0 + ASCII "SAFEPASS"
uint8_t SELECT_SAFEPASS_AID[] = {
  0x00, 0xA4, 0x04, 0x00, 0x09,
  0xF0, 0x53, 0x41, 0x46, 0x45, 0x50, 0x41, 0x53, 0x53,
  0x00
};

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==================================");
  Serial.println(" SafePass ESP32 PN532 Reader");
  Serial.println("==================================");

  Wire.begin(SDA_PIN, SCL_PIN);

  connectToWifi();
  setupPN532();

  Serial.println();
  Serial.println("Ready. Tap NFC card...");
}

void loop() {
  ensureWifiConnected();

  uint8_t uid[7];
  uint8_t uidLength;

  bool cardFound = nfc.readPassiveTargetID(
    PN532_MIFARE_ISO14443A,
    uid,
    &uidLength,
    1000
  );

  if (!cardFound) {
    return;
  }

  String uidString = uidToString(uid, uidLength);

  Serial.println();
  Serial.println("Card detected");
  Serial.print("UID: ");
  Serial.println(uidString);

  String virtualCardToken = readSafePassVirtualCardToken();
  if (virtualCardToken.length() > 0) {
    Serial.print("Virtual SafePass token: ");
    Serial.println(virtualCardToken);
  } else {
    Serial.println("No virtual SafePass token found. Falling back to UID.");
  }

  String tapKey = virtualCardToken.length() > 0 ? virtualCardToken : uidString;
  if (isDuplicateTap(tapKey)) {
    return;
  }

  lastTapKey = tapKey;
  lastTapTime = millis();

  sendTapToSafePass(uidString, virtualCardToken);
}

void ensureWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println("Wi-Fi disconnected. Reconnecting...");
  connectToWifi();
}

void connectToWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASS);

  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_NAME);

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    return;
  }

  Serial.println("Wi-Fi failed.");
  Serial.println("Check SSID/password and make sure Wi-Fi is 2.4GHz.");
}

void setupPN532() {
  nfc.begin();

  uint32_t versionData = nfc.getFirmwareVersion();

  if (!versionData) {
    Serial.println("PN532 not found. Check wiring and I2C mode.");
    while (true) {
      delay(1000);
    }
  }

  Serial.print("PN532 found. Firmware version: ");
  Serial.print((versionData >> 16) & 0xFF, DEC);
  Serial.print(".");
  Serial.println((versionData >> 8) & 0xFF, DEC);

  nfc.SAMConfig();
}

String uidToString(uint8_t* uid, uint8_t uidLength) {
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

bool isDuplicateTap(String tapKey) {
  return tapKey == lastTapKey && millis() - lastTapTime < TAP_COOLDOWN_MS;
}

bool isSafePassTokenChar(char c) {
  return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
}

String readSafePassVirtualCardToken() {
  uint8_t response[64];
  uint8_t responseLength = sizeof(response);

  bool ok = nfc.inDataExchange(
    SELECT_SAFEPASS_AID,
    sizeof(SELECT_SAFEPASS_AID),
    response,
    &responseLength
  );

  if (!ok || responseLength < 3) {
    return "";
  }

  if (response[responseLength - 2] != 0x90 || response[responseLength - 1] != 0x00) {
    return "";
  }

  String token = "";
  for (uint8_t i = 0; i < responseLength - 2; i++) {
    char c = (char)response[i];
    if (isSafePassTokenChar(c)) {
      token += c;
    }
  }

  token.toUpperCase();
  return token;
}

void sendTapToSafePass(String uid, String virtualCardToken) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send tap. Wi-Fi is not connected.");
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
  body += "\"uid\":\"" + uid + "\",";
  if (virtualCardToken.length() > 0) {
    body += "\"virtualCardToken\":\"" + virtualCardToken + "\",";
  }
  body += "\"readerId\":\"" + String(READER_ID) + "\",";
  body += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  body += "\"action\":\"" + String(ACTION) + "\"";
  body += "}";

  Serial.println();
  Serial.println("Sending tap to SafePass...");
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
    Serial.println("Tap failed.");
    Serial.println("Check UID assignment, device key, appointment approval, or backend logs.");
  }

  http.end();
}
