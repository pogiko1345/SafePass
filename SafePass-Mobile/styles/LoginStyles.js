import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768 && width < 1024;

export default StyleSheet.create({
  // ============ SAFE AREA ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  // ============ LAYOUT ============
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // ============ SPLASH / LOADING ============
  splashContainer: {
    flex: 1,
    backgroundColor: "#1A2A6C",
    justifyContent: "center",
    alignItems: "center",
  },
  
  splashText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // ============ HEADER ============
  header: {
    backgroundColor: "#1A2A6C",
    paddingHorizontal: 24,
    paddingTop: Platform.select({
      ios: 60,
      android: 50,
      web: 50,
    }),
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...(isWeb && {
      backgroundImage: "linear-gradient(135deg, #1A2A6C 0%, #112240 100%)",
    }),
  },
  
  headerContent: {
    alignItems: "center",
  },
  
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    ...(isWeb && {
      transition: "transform 0.2s ease",
      ":hover": {
        transform: "scale(1.05)",
      },
    }),
  },
  
  appName: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 20 : isTablet ? 24 : 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: isSmallPhone ? 26 : isTablet ? 32 : 28,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // ============ API STATUS BADGE ============
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    ...(isWeb && {
      cursor: "pointer",
      transition: "opacity 0.2s ease",
      ":hover": {
        opacity: 0.9,
      },
    }),
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
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ============ CARDS ============
  card: {
    backgroundColor: "#FFFFFF",
    marginTop: -20,
    marginHorizontal: isSmallPhone ? 16 : 20,
    padding: isSmallPhone ? 20 : 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
      },
    }),
    ...(isWeb && {
      maxWidth: 480,
      alignSelf: "center",
      width: "100%",
    }),
  },

  // ============ BACK TO ROLE BUTTON ============
  backToRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 100,
    gap: 6,
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "#E5E7EB",
      },
    }),
  },
  
  backToRoleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A2A6C",
  },

  // ============ WELCOME TITLES ============
  welcomeTitle: {
    fontSize: isSmallPhone ? 24 : 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  
  welcomeSubtitle: {
    fontSize: isSmallPhone ? 14 : 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  // ============ INPUTS ============
  inputBox: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },
  
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({
      ios: 14,
      android: 10,
      web: 12,
    }),
    backgroundColor: "#F9FAFB",
    gap: 12,
    ...(isWeb && {
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      ":focus-within": {
        borderColor: "#1A2A6C",
        boxShadow: "0 0 0 3px rgba(26, 42, 108, 0.1)",
      },
    }),
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
    outline: "none",
  },
  
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginLeft: 4,
  },

  // ============ OPTIONS ROW ============
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  
  rememberBox: {
    flexDirection: "row",
    alignItems: "center",
    ...(isWeb && {
      cursor: "pointer",
    }),
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    ...(isWeb && {
      transition: "background-color 0.2s ease, border-color 0.2s ease",
    }),
  },
  
  checkboxChecked: {
    backgroundColor: "#1A2A6C",
    borderColor: "#1A2A6C",
  },
  
  rememberText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  
  forgotText: {
    fontSize: 14,
    color: "#1A2A6C",
    fontWeight: "600",
    ...(isWeb && {
      cursor: "pointer",
      transition: "color 0.2s ease",
      ":hover": {
        color: "#112240",
        textDecoration: "underline",
      },
    }),
  },

  // ============ LOGIN BUTTON ============
  loginButton: {
    backgroundColor: "#1A2A6C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#112240",
        transform: "translateY(-1px)",
      },
      ":active": {
        transform: "translateY(0)",
      },
    }),
  },
  
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
    ...(isWeb && {
      ":hover": {
        backgroundColor: "#9CA3AF",
        transform: "none",
      },
    }),
  },

  // ============ 2FA INFO ============
  twoFactorInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  
  twoFactorText: {
    fontSize: 13,
    color: "#1A2A6C",
    fontWeight: "500",
  },

  // ============ VERIFICATION FORM (2FA) ============
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
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#E5E7EB",
      },
    }),
  },
  
  methodButtonActive: {
    backgroundColor: "#1A2A6C",
    borderColor: "#1A2A6C",
    ...(isWeb && {
      ":hover": {
        backgroundColor: "#112240",
      },
    }),
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
    backgroundColor: "#1A2A6C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "#112240",
      },
    }),
  },
  
  otpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    ...(isWeb && {
      cursor: "pointer",
      transition: "opacity 0.2s ease",
      ":hover": {
        opacity: 0.8,
      },
    }),
  },
  
  backLinkText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ INFO BOX (OFFLINE) ============
  infoBox: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  
  infoText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  // ============ FOOTER ============
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  
  footerText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ============ OTP MODAL STYLES ============
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: isSmallPhone ? 20 : 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.12)",
      },
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
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginLeft: 12,
  },
  
  modalSubtitle: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  
  modalPhone: {
    fontSize: isSmallPhone ? 16 : 18,
    fontWeight: "700",
    color: "#1A2A6C",
    marginBottom: 24,
  },

  // ============ OTP INPUT ============
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
    ...(isWeb && {
      transition: "border-color 0.2s ease",
      ":focus": {
        borderColor: "#1A2A6C",
        outline: "none",
      },
    }),
  },
  
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  
  timerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  
  otpButtons: {
    width: "100%",
  },
  
  otpVerifyButton: {
    backgroundColor: "#1A2A6C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "#112240",
      },
    }),
  },
  
  otpVerifyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  
  otpResendButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "#E5E7EB",
      },
    }),
  },
  
  otpResendText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },

  // ============ PASSWORD REQUIREMENTS ============
  passwordRequirements: {
    backgroundColor: "#F9FAFB",
    padding: isSmallPhone ? 16 : 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  
  requirementsTitle: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "600",
    color: "#374151",
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
    color: "#6B7280",
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
    fontWeight: "600",
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
    fontWeight: "500",
  },

  loginErrorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
    backgroundColor: "#FEF2F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },

  demoHelper: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  demoHelperText: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 8,
    textAlign: 'center',
  },

  demoButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2A6C',
    alignItems: 'center',
  },

  demoButtonText: {
    fontSize: 13,
    color: '#1A2A6C',
    fontWeight: '600',
  },

  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" },
    }),
  },
});