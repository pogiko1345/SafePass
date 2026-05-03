// VerificationStyles.js
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768;
const isDesktop = width >= 1100;

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FBFE",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FBFE",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  animatedContainer: {
    flex: 1,
  },

  backgroundOrbTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(79,70,229,0.12)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -110,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(59,130,246,0.10)",
  },

  pageShell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: isSmallPhone ? 14 : 20,
    paddingVertical: isSmallPhone ? 16 : 24,
    gap: 18,
    ...(isDesktop
      ? {
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
          maxWidth: 1180,
          width: "100%",
          alignSelf: "center",
          paddingTop: 28,
        }
      : {}),
  },

  // ============ HEADER ============
  heroPanel: {
    width: "100%",
    paddingTop: Platform.select({ ios: 52, android: 44, web: 46 }),
    paddingBottom: 62,
    paddingHorizontal: 24,
    borderRadius: 26,
    overflow: "hidden",
    minHeight: isDesktop ? 420 : undefined,
    ...(isDesktop ? { width: 420 } : {}),
    ...Platform.select({
      ios: {
        shadowColor: "#041E42",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 18px 40px rgba(4, 30, 66, 0.22)" },
    }),
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginBottom: 14,
  },

  heroBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.78)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  headerContent: {
    alignItems: isDesktop ? "flex-start" : "center",
  },

  iconContainer: {
    marginBottom: 12,
  },

  iconGradient: {
    width: isSmallPhone ? 78 : 92,
    height: isSmallPhone ? 78 : 92,
    borderRadius: isSmallPhone ? 39 : 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
  },

  heroGlowOne: {
    position: "absolute",
    top: -26,
    right: -14,
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: -52,
    left: -28,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(56,189,248,0.12)",
  },

  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
  },

  headerTitle: {
    fontSize: isSmallPhone ? 18 : isTablet ? 24 : 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: isSmallPhone ? 24 : 28,
    letterSpacing: 0,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.86)",
    textAlign: isDesktop ? "left" : "center",
    lineHeight: 19,
    paddingHorizontal: 0,
    maxWidth: 380,
  },

  flightAccent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 0,
  },

  flightAccentLine: {
    width: 34,
    height: 1.5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.34)",
  },

  flightAccentDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.78)",
  },

  panelMetaRow: {
    flexDirection: isSmallPhone ? "column" : "row",
    flexWrap: isSmallPhone ? "nowrap" : "wrap",
    gap: 12,
    marginBottom: 20,
  },

  panelMetaCard: {
    width: isSmallPhone ? "100%" : undefined,
    minWidth: 120,
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: "#F7FAFD",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6EDF7",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  panelMetaLabel: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "700",
    marginBottom: 4,
  },

  panelMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  // ============ CONTENT ============
  panelCard: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    padding: isSmallPhone ? 18 : 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...(isDesktop ? { maxWidth: 680 } : {}),
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0px 18px 40px rgba(15,23,42,0.08)" },
    }),
  },

  panelHeader: {
    marginBottom: 20,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  progressStep: {
    alignItems: "center",
    gap: 8,
  },

  progressDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  progressDotActive: {
    backgroundColor: "#0A3D91",
  },

  progressLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
  },

  progressLabelActive: {
    color: "#041E42",
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },

  progressLineActive: {
    backgroundColor: "#0A3D91",
  },

  // ============ USER INFO CARD ============
  userInfoCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  avatarContainer: {
    marginRight: 16,
  },

  userInfoCopy: {
    flex: 1,
  },

  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  userEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  userMessage: {
    fontSize: 13,
    color: "#6B7280",
  },

  // ============ CARDS ============
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: isSmallPhone ? 18 : 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" },
    }),
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  // ============ INPUTS ============
  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      web: {
        transition: "all 0.2s ease",
        outlineStyle: "none",
      },
    }),
  },

  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FBFE",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },

  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, android: 12, web: 12 }),
  },

  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },

  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    fontWeight: "500",
  },

  // ============ METHOD SELECTION ============
  methodContainer: {
    marginBottom: 24,
  },

  methodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  methodButtons: {
    flexDirection: isSmallPhone ? "column" : "row",
    gap: 12,
    flexWrap: "nowrap",
  },

  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    gap: 8,
  },

  methodButtonActive: {
    backgroundColor: "#0A3D91",
  },

  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  methodButtonTextActive: {
    color: "#FFFFFF",
  },

  // ============ BUTTONS ============
  sendButton: {
    backgroundColor: "#041E42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  // ============ OTP CARD ============
  otpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: isSmallPhone ? 18 : 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" },
    }),
  },

  otpHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  otpIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  otpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  otpSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  phoneNumberDisplay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A3D91",
    marginTop: 4,
  },

  otpInputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  otpInput: {
    width: "100%",
    height: isSmallPhone ? 60 : 68,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: isSmallPhone ? 28 : 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    letterSpacing: isSmallPhone ? 8 : 12,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        transition: "border-color 0.2s ease",
        outlineStyle: "none",
        outlineWidth: 0,
        ":focus": {
          borderColor: "#0A3D91",
        },
      },
    }),
  },

  otpInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  otpErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },

  timerText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  timerExpired: {
    color: "#EF4444",
  },

  verifyButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },

  verifyGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F8FBFE",
    gap: 8,
    marginBottom: 16,
  },

  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  resendButtonTextActive: {
    color: "#0A3D91",
  },

  changeMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },

  changeMethodText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ SECURITY NOTE ============
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 4,
    gap: 8,
  },

  securityNoteText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
});
