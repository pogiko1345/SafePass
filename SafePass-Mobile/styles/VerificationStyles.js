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

  pageShell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: isSmallPhone ? 14 : 20,
    paddingVertical: isSmallPhone ? 12 : 16,
    gap: 14,
    ...(isDesktop
      ? {
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
          maxWidth: 1180,
          width: "100%",
          alignSelf: "center",
          paddingTop: 16,
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
    gap: 10,
    marginBottom: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    padding: isSmallPhone ? 16 : 18,
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
    marginBottom: 14,
  },

  progressStep: {
    alignItems: "center",
    gap: 5,
  },

  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  avatarContainer: {
    marginRight: 12,
  },

  userInfoCopy: {
    flex: 1,
  },

  avatarGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    borderRadius: 18,
    padding: isSmallPhone ? 14 : 16,
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
    marginBottom: 14,
  },

  otpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  otpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
    letterSpacing: 0,
  },

  otpSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },

  phoneNumberDisplay: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A3D91",
    marginTop: 2,
  },

  otpNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 11,
    marginBottom: 12,
  },

  otpNoticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },

  otpNoticeCopy: {
    flex: 1,
    minWidth: 0,
  },

  otpNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#064E3B",
  },

  otpNoticeMessage: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "#065F46",
  },

  otpNoticeDetail: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: "#047857",
  },

  otpNoticeDismiss: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  otpInputContainer: {
    width: "100%",
    marginBottom: 10,
  },

  otpCodeEntry: {
    width: "100%",
    minHeight: isSmallPhone ? 50 : 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isSmallPhone ? 5 : 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: isSmallPhone ? 7 : 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    position: "relative",
    ...Platform.select({
      web: {
        cursor: "text",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
    }),
  },

  otpCodeEntryCompact: {
    gap: 6,
    paddingHorizontal: 8,
  },

  otpDigitBox: {
    flex: 1,
    maxWidth: 46,
    minWidth: isSmallPhone ? 32 : 38,
    height: isSmallPhone ? 38 : 42,
    borderRadius: 10,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  otpDigitBoxCompact: {
    minWidth: 30,
    height: 38,
  },

  otpDigitBoxActive: {
    borderColor: "#0A3D91",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
  },

  otpDigitBoxFilled: {
    borderColor: "#B7D5F6",
    backgroundColor: "#FFFFFF",
  },

  otpDigitText: {
    fontSize: isSmallPhone ? 20 : 23,
    lineHeight: isSmallPhone ? 24 : 28,
    fontWeight: "800",
    color: "#041E42",
    textAlign: "center",
  },

  otpHiddenInput: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.02,
    color: "transparent",
    backgroundColor: "transparent",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },

  otpInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  otpErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    gap: 6,
  },

  timerText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  timerExpired: {
    color: "#EF4444",
  },

  verifyButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  verifyGradient: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#F8FBFE",
    gap: 8,
    marginBottom: 10,
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
    paddingVertical: 5,
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
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },

  securityNoteText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
});
