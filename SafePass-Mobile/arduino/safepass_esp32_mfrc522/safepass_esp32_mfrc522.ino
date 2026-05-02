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

const char* wifiSsid = "De Guzman";
const char* wifiPassword = "hmhR4fFe";

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
const unsigned long duplicateCooldownMs = 3000;

void connectToWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(wifiSsid, wifiPassword);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. IP: ");
  Serial.println(WiFi.localIP());
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
  connectToWifi();

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
  SPI.begin();
  rfid.PCD_Init();
  connectToWifi();
  Serial.println("SafePass RFID reader is ready.");
}

void loop() {
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
