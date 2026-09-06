import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";

// Browser implementation. Metro selects useGoogleSignIn.native.js for the APK.
export default function useGoogleSignIn(options = {}) {
  const googleClientId = Constants.expoConfig?.extra?.googleClientId;
  const [request, , prompt] = Google.useIdTokenAuthRequest({ webClientId: googleClientId, ...options });
  return { googleClientId, googleRequest: request, promptGoogleSignIn: prompt };
}
