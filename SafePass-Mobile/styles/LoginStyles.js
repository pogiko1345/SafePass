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

  loginSplashOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 30, 66, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loginSplashCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0px 24px 60px rgba(15, 23, 42, 0.18)",
      },
    }),
  },

  loginSplashLogoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF5FF",
    borderWidth: 4,
    borderColor: "#D8E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loginSplashLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
  },

  loginSplashTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },

  loginSplashMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    textAlign: "center",
    marginBottom: 18,
  },

  loginSplashLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FBFE",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DCE5F0",
  },

  loginSplashLoadingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A3D91",
  },

  header: {
    backgroundColor: "#041E42",
    paddingHorizontal: 24,
    paddingTop: Platform.select({
      ios: 52,
      android: 44,
      web: 46,
    }),
    paddingBottom: 62,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
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
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginBottom: 14,
    ...Platform.select({
      web: { backdropFilter: "blur(10px)" },
    }),
  },

  brandBadgeLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },

  headerGlowOne: {
    position: "absolute",
    top: -26,
    right: -14,
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  headerGlowTwo: {
    position: "absolute",
    bottom: -52,
    left: -28,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(56,189,248,0.12)",
  },

  brandBadgeTextWrap: {
    justifyContent: "center",
  },

  brandBadgeEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  brandBadgeTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  logoImage: {
    width: isSmallPhone ? 78 : 92,
    height: isSmallPhone ? 78 : 92,
    borderRadius: isSmallPhone ? 39 : 46,
    marginBottom: 12,
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
    fontSize: isSmallPhone ? 18 : isTablet ? 24 : 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: isSmallPhone ? 24 : 28,
    marginBottom: 8,
    letterSpacing: 0,
  },

  headerTagline: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 380,
    marginBottom: 14,
  },

  flightAccent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginTop: -32,
    marginHorizontal: isSmallPhone ? 16 : 20,
    padding: isSmallPhone ? 20 : 24,
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EDF7",
    marginBottom: 18,
  },

  roleIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 8,
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
    letterSpacing: 0,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    letterSpacing: 0,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },

  backLinkText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  infoBox: {
    marginTop: 16,
    borderRadius: 8,
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

  footerContactCard: {
    marginTop: 14,
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6EDF7",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 10px 22px rgba(15, 23, 42, 0.05)" },
    }),
  },

  footerContactTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },

  footerContactLine: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },

  footerLinkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  footerLinkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F4F7FB",
    borderWidth: 1,
    borderColor: "#E5EDF6",
    ...(isWeb && { cursor: "pointer" }),
  },

  footerLinkText: {
    fontSize: 12,
    color: "#0A3D91",
    fontWeight: "700",
  },

  footerCopyright: {
    marginTop: 12,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 30, 66, 0.42)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 520,
    minHeight: isSmallPhone ? 420 : 460,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: "#E6EDF7",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 16px 36px rgba(15, 23, 42, 0.14)" },
    }),
  },

  modalHero: {
    backgroundColor: "#041E42",
    paddingHorizontal: isSmallPhone ? 18 : 24,
    paddingTop: isSmallPhone ? 18 : 22,
    paddingBottom: isSmallPhone ? 18 : 22,
  },

  modalHeroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },

  modalBrandBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  modalBrandBadgeLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },

  modalBrandBadgeTextWrap: {
    justifyContent: "center",
    flex: 1,
  },

  modalBrandBadgeEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  modalBrandBadgeTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalHeroContent: {
    alignItems: "center",
  },

  modalHeroIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "rgba(255,255,255,0.82)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },

  modalStepRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    width: "100%",
  },

  modalStepChip: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  modalStepChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  modalStepChipComplete: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  modalStepChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.76)",
  },

  modalStepChipTextActive: {
    color: "#041E42",
  },

  modalBody: {
    width: "100%",
    flexGrow: 0,
  },

  modalBodyContent: {
    padding: isSmallPhone ? 18 : 24,
    paddingBottom: isSmallPhone ? 24 : 28,
    flexGrow: 1,
  },

  modalInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#D8E8FF",
    backgroundColor: "#F8FBFE",
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
  },

  modalInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
    fontWeight: "600",
  },

  modalPhone: {
    fontSize: isSmallPhone ? 16 : 18,
    fontWeight: "800",
    color: "#0A3D91",
    marginBottom: 20,
    textAlign: "center",
    flexWrap: "wrap",
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
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: isSmallPhone ? 24 : 28,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    letterSpacing: isSmallPhone ? 4 : 8,
    backgroundColor: "#F9FAFB",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  loginSuccessText: {
    color: "#166534",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 16,
    fontWeight: "700",
    backgroundColor: "#F0FDF4",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  demoHelper: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
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
