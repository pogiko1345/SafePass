import Constants from "expo-constants";
import { Platform } from "react-native";

const APP_VARIANTS = {
  FULL: "full",
  VISITOR: "visitor",
};

const normalizeVariant = (value) => {
  const variant = String(value || "").toLowerCase().trim();
  return variant === APP_VARIANTS.VISITOR ? APP_VARIANTS.VISITOR : APP_VARIANTS.FULL;
};

const getExpoExtra = () => {
  if (Constants?.expoConfig?.extra) {
    return Constants.expoConfig.extra;
  }

  if (Constants?.manifest2?.extra?.expoClient?.extra) {
    return Constants.manifest2.extra.expoClient.extra;
  }

  if (Constants?.manifest?.extra) {
    return Constants.manifest.extra;
  }

  return {};
};

const resolveVariant = () => {
  if (Platform.OS === "web") {
    return APP_VARIANTS.FULL;
  }

  const extra = getExpoExtra();
  return normalizeVariant(process.env.EXPO_PUBLIC_APP_VARIANT || extra.appVariant);
};

export const APP_VARIANT = resolveVariant();
export const IS_VISITOR_ONLY_APP = APP_VARIANT === APP_VARIANTS.VISITOR;
export const APP_VARIANT_LABEL = IS_VISITOR_ONLY_APP ? "Visitor" : "Full";
export const APP_DISPLAY_NAME = IS_VISITOR_ONLY_APP ? "SafePass Visitor" : "SafePass";
export const APP_ORGANIZATION_NAME =
  "Sapphire International Aviation Academy";

export const normalizeAppRole = (role) => String(role || "").toLowerCase().trim();

export const isRoleAllowedInCurrentVariant = (role) => {
  const normalizedRole = normalizeAppRole(role);
  if (!IS_VISITOR_ONLY_APP) {
    return true;
  }

  return normalizedRole === "visitor";
};

export const getVariantInitialRoute = ({ currentUser, isNewRegistration }) => {
  if (currentUser) {
    return "VisitorDashboard";
  }

  if (IS_VISITOR_ONLY_APP) {
    return isNewRegistration ? "Login" : "Login";
  }

  return "RoleSelect";
};

export const getVariantBlockedRoleMessage = (role) => {
  const normalizedRole = normalizeAppRole(role);

  if (!IS_VISITOR_ONLY_APP) {
    return "";
  }

  if (!normalizedRole) {
    return "This app is configured for visitor accounts only.";
  }

  return `This app is for visitor accounts only. Please use the main SafePass app for ${normalizedRole} access.`;
};

export const getVisitorBuildNavigationParams = () => ({
  role: "visitor",
});
