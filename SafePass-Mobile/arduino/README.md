# SafePass Arduino RFID Reader

SafePass already accepts Arduino/NFC checkpoint taps through:

```text
POST /api/device/location-tap
```

The request must include the same secret as `ARDUINO_DEVICE_KEY` in `backend/.env`.

## Hardware

Recommended setup:

- ESP32 or ESP8266 board with Wi-Fi
- MFRC522 RFID/NFC reader
- MIFARE card/tag whose UID is assigned to a SafePass visitor account as `nfcCardId`

The included sketch is for ESP32 + MFRC522. For ESP8266, change the Wi-Fi and HTTP includes as needed, or use the same payload shape from your own firmware.

## Backend Setup

Add this to `SafePass-Mobile/backend/.env`:

```text
ARDUINO_DEVICE_KEY=change-this-to-a-long-random-secret
```

Restart the backend after changing `.env`.

For local testing, the Arduino and computer must be on the same network. Use your computer LAN IP, not `localhost`, in the sketch:

```cpp
const char* apiUrl = "http://192.168.1.25:5000/api/device/location-tap";
```

For deployed testing, use your deployed backend URL:

```cpp
const char* apiUrl = "https://safepass-052h.onrender.com/api/device/location-tap";
```

## Payload

The Arduino sends:

```json
{
  "nfcCardId": "04A1B2C3D4",
  "deviceId": "main-gate-reader-01",
  "checkpointId": "main_gate",
  "floor": "ground",
  "office": "Main Gate",
  "coordinates": { "x": 50, "y": 92 },
  "action": "auto",
  "source": "arduino_tap"
}
```

SafePass will:

- Reject unknown card IDs.
- Check in an approved visitor when the card is tapped at the main gate.
- Check out a checked-in visitor when the same card is tapped again at the main gate.
- Update the active visitor's `currentLocation`.
- Add an `AccessLog` entry for the tap.

## Assign a Physical Card UID

When the serial monitor prints a UID such as `087E2396`, assign it to the visitor account:

```powershell
cd SafePass-Mobile/backend
npm run assign:nfc -- --email=visitor@email.com --card=087E2396
```

Or call the admin API:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/admin/nfc-cards/assign" `
  -Method Post `
  -Headers @{ Authorization = "Bearer YOUR_ADMIN_TOKEN" } `
  -ContentType "application/json" `
  -Body '{"email":"visitor@email.com","cardId":"087E2396"}'
```

## Quick API Test

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/device/location-tap" `
  -Method Post `
  -Headers @{ "x-device-key" = "change-this-to-a-long-random-secret" } `
  -ContentType "application/json" `
  -Body '{"nfcCardId":"2026-000001","deviceId":"test-reader","checkpointId":"main_gate","floor":"ground","office":"Main Gate","coordinates":{"x":50,"y":92},"action":"auto","source":"arduino_tap"}'
```
