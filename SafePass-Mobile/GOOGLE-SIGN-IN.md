# Google sign-in for CentrixMobile

The Android app now uses native Google sign-in instead of sending a custom-scheme browser redirect with a web OAuth client. Login, visitor registration, and profile linking share the implementation. The existing backend still verifies the Google ID token against its configured web client ID.

## Google Cloud configuration

In the Google Cloud project containing the existing web OAuth client, check that an **Android** OAuth client exists with these exact values for the current sideload APK:

| Setting | Value |
| --- | --- |
| Package name | `com.anonymous.SafePassMobile` |
| SHA-1 signing certificate | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |
| Web client used for the ID token | `369133705906-690ch64mj2drgqhk25d7caiia419s7jv.apps.googleusercontent.com` |

The SHA-1 was read from the APK using Android's `apksigner verify --print-certs`. The app retains its existing signing certificate so it can update the previously installed APK.

Open [Google Cloud credentials](https://console.cloud.google.com/apis/credentials), select the project for the web client above, and create or verify an OAuth client of type Android using the package and SHA-1 above. The native library uses the web client ID to request an ID token for the backend; do not replace the app's `googleClientId` with the Android client ID. Render's `GOOGLE_CLIENT_ID` must match that web client. If the consent screen is in testing mode, the account used to verify sign-in must be allowed as a test user.

The separate visitor flavor uses package `com.anonymous.SafePassMobile.visitor` and needs its own Android OAuth client. A future APK signed with a different certificate also needs that certificate registered. No client secret belongs in the APK.

This repository change does not create or verify Cloud credentials. Complete the account chooser and sign in with a permitted test account to verify the full flow against Render. Canceling the chooser should return to the app without an error or an account change. A configuration mismatch produces a readable message instead of the old browser error page.

Android is the tested target for this change. iOS requires its own client and URL-scheme setup before testing an iOS build.

Implementation references: [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/), [native sign-in configuration and token response](https://react-native-google-signin.github.io/docs/original), and [Android package/certificate configuration](https://react-native-google-signin.github.io/docs/setting-up/get-config-file).
