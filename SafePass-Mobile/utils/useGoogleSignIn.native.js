import Constants from "expo-constants";
import { Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

let configuredClientId;

export default function useGoogleSignIn() {
  const googleClientId = Constants.expoConfig?.extra?.googleClientId;
  const iosClientId = Constants.expoConfig?.extra?.googleIosClientId;

  const promptGoogleSignIn = async () => {
    if (!googleClientId || (Platform.OS === "ios" && !iosClientId)) {
      throw new Error("Google sign-in is not available yet. Please use your username and password.");
    }
    try {
      if (configuredClientId !== googleClientId) {
        GoogleSignin.configure({ webClientId: googleClientId, ...(iosClientId ? { iosClientId } : {}) });
        configuredClientId = googleClientId;
      }
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Always show the account chooser, including when linking another account.
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
      if (response.type !== "success") return { type: "cancel" };
      if (!response.data?.idToken) throw new Error("Google did not return an ID token. Please try again.");
      return { type: "success", params: { id_token: response.data.idToken } };
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return { type: "cancel" };
      if (error.code === statusCodes.IN_PROGRESS) return { type: "cancel" };
      if (String(error.code) === "10") {
        throw new Error("Google sign-in is not available for this app version yet. Please use your username and password or contact support.");
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Update or enable Google Play services, then try again.");
      }
      throw error;
    }
  };

  return { googleClientId, googleRequest: Boolean(googleClientId), promptGoogleSignIn };
}
