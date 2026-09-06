# CentrixMobile mobile audit

Tested 6 September 2026 against the existing release APK, version code 2, package `com.anonymous.SafePassMobile`. This is an audit; the issues below have not been fixed.

## Confirmed in the Android emulator

### 1. Google sign-in is blocked — high priority

Open Login and tap Sign in with Google. Google displays **Error 400: invalid_request**, with the explanation that custom scheme URIs are not allowed for a WEB client. Sign-in cannot proceed.

`screens/LoginScreen.jsx:199–201` supplies the same configured client ID as both the web and Android client. Registration repeats this configuration at `screens/VisitorRegisterScreen.jsx:561–563`. Configure the Android Google authorization flow and its callback correctly, then retest login and registration in the signed APK.

Evidence: [Google authorization error](dist/mobile-audit/08-google-sign-in.png).

### 2. Password-reset email field disappears behind the keyboard — medium priority

At 360 × 640 dp, open Login → Forgot Password and tap the email field. The keyboard covers the field while the large recovery header stays visible, preventing the user from seeing what they type. Dragging dismisses the keyboard rather than establishing a usable typing layout.

The modal in `screens/LoginScreen.jsx:2372` puts its large header outside the scrolling body. Make the modal respond to keyboard height and allow the header and form to scroll together, or reduce the header while typing.

Evidence: [Before keyboard](dist/mobile-audit/22-small-reset.png), [keyboard covering input](dist/mobile-audit/23-small-reset-keyboard.png).

### 3. Login connection badge becomes misleading — medium priority

Open Login while online, then disable networking: SERVER CONNECTED remains visible. Reopen Login while offline, restore networking, and wait: SERVER CHECK FAILED remains visible. The check runs on mount at `screens/LoginScreen.jsx:482–484` and is not refreshed as connectivity changes.

Refresh the health check on reconnection/app focus or provide a retry action. This finding concerns the indicator; it does not establish that credential login fails after reconnection.

Evidence: [Offline but connected badge](dist/mobile-audit/10-offline-stale-connected.png), [online but failed badge](dist/mobile-audit/12-online-stale-offline.png).

### 4. Status-bar icons have poor contrast — low priority

The login and registration screens display light status-bar text over a pale top inset. The time and system icons are difficult to read. Their StatusBar declarations use `light-content` (`screens/LoginScreen.jsx:1744`, `screens/VisitorRegisterScreen.jsx:1457`). Match icon brightness to the actual inset background.

Evidence: [Login screen](dist/mobile-audit/02-login-top.png).

## Confirmed through isolated code execution

These findings were reproduced with mocked dependencies, without signing in or changing live records.

### 5. Standalone Attendance Records screen throws after loading — medium priority

`screens/AttendanceRecordsScreen.jsx:443` renders `<Modal>` without importing Modal. Rendering the component after loading produces **Modal is not defined**. Import Modal from React Native.

The route is registered at `App.js:928`, but no mobile navigation button to this standalone route was found. Admin and security dashboard attendance views use separate implementations; this finding does not establish that those tabs crash.

Related source-only finding: the standalone screen's CSV and print buttons use browser-only APIs (`AttendanceRecordsScreen.jsx:180–205` and `:245–255`) with no native fallback. After the render fix, they still need native export/print support or platform-specific visibility.

### 6. Admin duplicate academic-ID handling throws — medium priority

If account creation receives a duplicate student/teacher ID error from the server, `screens/AdminDashboardScreen.jsx:4704` references `isAcademicStaffAccount` inside the catch block. That variable is declared inside the try block at line 4557 and is out of scope. Executing the exact error handler produces **isAcademicStaffAccount is not defined**, replacing the intended field validation error.

Derive the role flag in a scope shared by the try and catch blocks. This can occur when a duplicate reaches the server despite the local precheck, such as with a stale account list.

Evidence for both exceptions: [Reproduction output](dist/mobile-audit/code-error-reproductions.json), [isolated reproduction script](dist/mobile-audit/reproduce-code-errors.cjs).

## Verification and limits

- Tested the installed release in a Pixel 5 emulator reporting Android 17, at its normal size and a 360 × 640 dp override.
- Exercised home/login navigation, help screen opening and scrolling, empty login/reset/registration validation, registration keyboard behavior, Google authorization launch, and loss/restoration of connectivity.
- All **19 existing backend tests passed**, covering security utilities, settings utilities, and mocked route integrations. Database dependencies were mocked and dotenv loading disabled for this run.
- No AndroidRuntime crash was logged during the exercised public flows. React Native logged the expected failed health request during the deliberate offline test.
- No test account was supplied. Successful credential login, authenticated dashboards, OTP delivery, account creation, and visitor/attendance changes remain unverified end to end. Physical NFC/ESP32, camera, and GPS behavior were not tested.
- No live records were created or edited. Temporary screen and network overrides were restored. Screenshots and reproduction tools are local artifacts under the ignored `dist/mobile-audit/` directory.
