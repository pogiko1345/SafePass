#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// Install the "MFRC522" library from the Arduino Library Manager.
// Wiring for many ESP32 dev boards:
// SDA/SS -> GPIO 5, SCK -> GPIO 18, MOSI -> GPIO 23, MISO -> GPIO 19, RST -> GPIO 22.

#define SS_PIN 5
#define RST_PIN 22

const char* wifiSsid = "GlobeAtHome_21AB1_2.4";
const char* wifiPassword = "ypwD4U4R";

const char* apiUrl = "https://safepass-052h.onrender.com/api/device/location-tap";
const char* deviceKey = "71eb2b8fbdfa47b2b2334fde89cc99b583a39709997d4434859ad645dbce89e4";

// Reader identity. The backend maps these IDs to the exact Floor3 map position.
// For the entrance/lobby reader, keep this as reader_1/main_gate.
// For room readers, change readerId/checkpointId to values like registrar,
// accounting, conference_room, it_room, faculty_room, etc.
const char* deviceId = "arduino-reader-01";
const char* readerId = "reader_1";
const char* gateId = "gate_1";
const char* checkpointId = "main_gate";
const char* locationName = "Entrance / Lobby";

MFRC522 rfid(SS_PIN, RST_PIN);

String lastUid = "";
unsigned long lastTapAt = 0;
unsigned long lastWifiRetryAt = 0;
const unsigned long duplicateCooldownMs = 3000;
const unsigned long wifiConnectTimeoutMs = 20000;
const unsigned long wifiRetryIntervalMs = 5000;

String wifiStatusLabel(wl_status_t status) {
  switch (status) {
    case WL_IDLE_STATUS: return "IDLE";
    case WL_NO_SSID_AVAIL: return "SSID NOT FOUND";
    case WL_SCAN_COMPLETED: return "SCAN COMPLETED";
    case WL_CONNECTED: return "CONNECTED";
    case WL_CONNECT_FAILED: return "CONNECT FAILED";
    case WL_CONNECTION_LOST: return "CONNECTION LOST";
    case WL_DISCONNECTED: return "DISCONNECTED";
    default: return "UNKNOWN";
  }
}

void printNearbyNetworks() {
  Serial.println("Scanning nearby Wi-Fi networks...");
  int networkCount = WiFi.scanNetworks();
  if (networkCount <= 0) {
    Serial.println("No Wi-Fi networks found. Check antenna, board, and router distance.");
    return;
  }

  for (int i = 0; i < networkCount; i++) {
    Serial.print("  ");
    Serial.print(i + 1);
    Serial.print(". ");
    Serial.print(WiFi.SSID(i));
    Serial.print(" | RSSI ");
    Serial.print(WiFi.RSSI(i));
    Serial.print(" dBm | Channel ");
    Serial.println(WiFi.channel(i));
  }
}

bool connectToWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.disconnect(true);
  delay(250);

  Serial.println();
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(wifiSsid);
  WiFi.begin(wifiSsid, wifiPassword);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < wifiConnectTimeoutMs) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Wi-Fi failed. Status: ");
    Serial.println(wifiStatusLabel(WiFi.status()));
    Serial.println("Tip: ESP32 only connects to 2.4GHz Wi-Fi. Use the router SSID without 5G/5GHz.");
    printNearbyNetworks();
    return false;
  }

  Serial.print("Connected. IP: ");
  Serial.println(WiFi.localIP());
  return true;
}

String readUid() {
  String uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }

  uid.toUpperCase();
  return uid;
}

String buildJsonPayload(const String& uid) {
  String payload = "{";
  payload += "\"nfcCardId\":\"" + uid + "\",";
  payload += "\"deviceId\":\"" + String(deviceId) + "\",";
  payload += "\"readerId\":\"" + String(readerId) + "\",";
  payload += "\"gateId\":\"" + String(gateId) + "\",";
  payload += "\"checkpointId\":\"" + String(checkpointId) + "\",";
  payload += "\"location\":\"" + String(locationName) + "\",";
  payload += "\"deviceKey\":\"" + String(deviceKey) + "\",";
  payload += "\"action\":\"auto\",";
  payload += "\"tapAction\":\"auto\",";
  payload += "\"source\":\"arduino_tap\"";
  payload += "}";
  return payload;
}

void postTap(const String& uid) {
  if (!connectToWifi()) {
    Serial.println("Tap not sent because Wi-Fi is not connected.");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", deviceKey);

  String payload = buildJsonPayload(uid);
  int statusCode = http.POST(payload);
  String response = http.getString();

  Serial.print("UID: ");
  Serial.println(uid);
  Serial.print("Reader: ");
  Serial.print(readerId);
  Serial.print(" / Checkpoint: ");
  Serial.println(checkpointId);
  Serial.print("HTTP ");
  Serial.println(statusCode);
  Serial.println(response);

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1200);
  Serial.println();
  Serial.println("Booting SafePass ESP32 RFID reader...");
  SPI.begin();
  rfid.PCD_Init();
  byte readerVersion = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print("MFRC522 firmware version: 0x");
  Serial.println(readerVersion, HEX);
  if (readerVersion == 0x00 || readerVersion == 0xFF) {
    Serial.println("RFID reader not detected. Check SDA/SS, SCK, MOSI, MISO, RST, 3.3V, and GND wiring.");
  }

  connectToWifi();
  Serial.println("SafePass RFID reader is ready.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED && millis() - lastWifiRetryAt > wifiRetryIntervalMs) {
    lastWifiRetryAt = millis();
    connectToWifi();
  }

  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String uid = readUid();
  unsigned long now = millis();

  if (uid != lastUid || now - lastTapAt > duplicateCooldownMs) {
    lastUid = uid;
    lastTapAt = now;
    postTap(uid);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
