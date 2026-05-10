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
  return APP_VARIANTS.FULL;
};

export const APP_VARIANT = resolveVariant();
export const IS_VISITOR_ONLY_APP = APP_VARIANT === APP_VARIANTS.VISITOR;
export const APP_VARIANT_LABEL = IS_VISITOR_ONLY_APP ? "Visitor" : "Full";
export const APP_DISPLAY_NAME = "SafePass Smart Campus";
export const APP_ORGANIZATION_NAME =
  "Sapphire International Aviation Academy";

export const normalizeAppRole = (role) => String(role || "").toLowerCase().trim();

export const isRoleAllowedInCurrentVariant = (role) => {
  return true;
};

export const getVariantInitialRoute = ({ currentUser, isNewRegistration }) => {
  if (currentUser) {
    const role = normalizeAppRole(currentUser.role);
    if (role === "admin") return "AdminDashboard";
    if (role === "staff") return "StaffDashboard";
    if (role === "security" || role === "guard") return "SecurityDashboard";
    if (role === "student" || role === "teacher") return "StudentDashboard";
    if (role === "visitor") return "VisitorDashboard";
    return "RoleSelect";
  }

  return "RoleSelect";
};

export const getVariantBlockedRoleMessage = (role) => {
  return "";
};

export const getVisitorBuildNavigationParams = () => ({
  role: "campus",
});
