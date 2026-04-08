import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768 && width < 1024;

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  splashContainer: {
    flex: 1,
    backgroundColor: "#041E42",
    justifyContent: "center",
    alignItems: "center",
  },

  splashText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  header: {
    backgroundColor: "#041E42",
    paddingHorizontal: 24,
    paddingTop: Platform.select({
      ios: 60,
      android: 50,
      web: 54,
    }),
    paddingBottom: 88,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#041E42",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
      },
      android: { elevation: 6 },
      web: {
        backgroundImage: "linear-gradient(135deg, #041E42 0%, #0A3D91 62%, #1C6DD0 100%)",
        boxShadow: "0px 18px 40px rgba(4, 30, 66, 0.22)",
      },
    }),
  },

  headerContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },

  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
    ...Platform.select({
      web: { backdropFilter: "blur(10px)" },
    }),
  },

  brandBadgeLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },

  brandBadgeTextWrap: {
    justifyContent: "center",
  },

  brandBadgeEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  brandBadgeTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  logoImage: {
    width: isSmallPhone ? 92 : 108,
    height: isSmallPhone ? 92 : 108,
    borderRadius: isSmallPhone ? 46 : 54,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0px 6px 18px rgba(0,0,0,0.18)" },
    }),
  },

  appName: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 21 : isTablet ? 26 : 24,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: isSmallPhone ? 28 : 32,
    marginBottom: 10,
    letterSpacing: -0.4,
  },

  headerTagline: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 460,
    marginBottom: 18,
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginTop: -42,
    marginHorizontal: isSmallPhone ? 16 : 20,
    padding: isSmallPhone ? 20 : 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E6EDF7",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 14px 32px rgba(15, 23, 42, 0.08)" },
    }),
    ...(isWeb && {
      maxWidth: 520,
      alignSelf: "center",
      width: "100%",
    }),
  },

  backToRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: "#F3F7FB",
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E4EBF5",
    ...(isWeb && { cursor: "pointer" }),
  },

  backToRoleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A3D91",
  },

  roleHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFD",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EDF7",
    marginBottom: 18,
  },

  roleIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  roleHeroText: {
    flex: 1,
  },

  roleEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  rolePanel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  welcomeTitle: {
    fontSize: isSmallPhone ? 24 : 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  welcomeSubtitle: {
    fontSize: isSmallPhone ? 14 : 15,
    color: "#5B667A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 21,
  },

  inputBox: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DCE5F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({
      ios: 14,
      android: 10,
      web: 12,
    }),
    backgroundColor: "#F8FBFE",
    gap: 12,
    ...(isWeb && {
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      outline: "none",
    }),
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    padding: 0,
    outline: "none",
  },

  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "600",
  },

  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
    marginLeft: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  rememberBox: {
    flexDirection: "row",
    alignItems: "center",
    ...(isWeb && { cursor: "pointer" }),
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },

  checkboxChecked: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  rememberText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },

  forgotText: {
    fontSize: 14,
    color: "#0A3D91",
    fontWeight: "700",
  },

  loginButton: {
    backgroundColor: "#0A3D91",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "transform 0.2s ease, background-color 0.2s ease",
      },
    }),
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  buttonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.78,
  },

  twoFactorInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8E8FF",
  },

  twoFactorText: {
    fontSize: 13,
    color: "#0A3D91",
    fontWeight: "600",
  },

  verificationHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  verificationTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  verificationSubtitle: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  methodContainer: {
    marginBottom: 24,
  },

  methodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },

  methodButtons: {
    flexDirection: "row",
    gap: 12,
  },

  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },

  methodButtonActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  methodButtonTextActive: {
    color: "#FFFFFF",
  },

  otpButton: {
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },

  otpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },

  backLinkText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  infoBox: {
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  infoText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  footer: {
    alignItems: "center",
    paddingVertical: 22,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 30, 66, 0.42)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: isSmallPhone ? 20 : 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EDF7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 16px 36px rgba(15, 23, 42, 0.14)" },
    }),
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginLeft: 12,
  },

  modalSubtitle: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 20,
  },

  modalPhone: {
    fontSize: isSmallPhone ? 16 : 18,
    fontWeight: "800",
    color: "#0A3D91",
    marginBottom: 24,
  },

  otpInputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  otpInput: {
    width: "100%",
    height: isSmallPhone ? 56 : 64,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: isSmallPhone ? 24 : 28,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    letterSpacing: isSmallPhone ? 8 : 10,
    backgroundColor: "#F9FAFB",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },

  timerText: {
    fontSize: 14,
    color: "#64748B",
  },

  otpButtons: {
    width: "100%",
  },

  otpVerifyButton: {
    backgroundColor: "#0A3D91",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  otpVerifyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  otpResendButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#F3F7FB",
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },

  otpResendText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "700",
  },

  passwordRequirements: {
    backgroundColor: "#F8FBFE",
    padding: isSmallPhone ? 16 : 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    width: "100%",
  },

  requirementsTitle: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 14,
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },

  requirementText: {
    fontSize: isSmallPhone ? 12 : 13,
    color: "#64748B",
  },

  requirementMet: {
    color: "#10B981",
    textDecorationLine: "line-through",
  },

  passwordStrengthContainer: {
    marginTop: 10,
    marginBottom: 16,
    width: "100%",
  },

  passwordStrengthBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: "#E5E7EB",
  },

  passwordStrengthSegment: {
    flex: 1,
    marginHorizontal: 1,
  },

  passwordStrengthText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },

  passwordMatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },

  passwordMatchText: {
    fontSize: isSmallPhone ? 12 : 13,
    fontWeight: "600",
  },

  loginErrorText: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "600",
    backgroundColor: "#FEF2F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  demoHelper: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },

  demoHelperText: {
    fontSize: 13,
    color: "#0369A1",
    marginBottom: 8,
    textAlign: "center",
  },

  demoButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0A3D91",
    alignItems: "center",
  },

  demoButtonText: {
    fontSize: 13,
    color: "#0A3D91",
    fontWeight: "700",
  },
});
