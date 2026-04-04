// VerificationStyles.js
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768;

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  animatedContainer: {
    flex: 1,
  },

  // ============ HEADER ============
  header: {
    paddingTop: Platform.select({ ios: 60, android: 45, web: 45 }),
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  headerContent: {
    alignItems: "center",
  },

  iconContainer: {
    marginBottom: 20,
  },

  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: isSmallPhone ? 26 : 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // ============ CONTENT ============
  content: {
    flex: 1,
    padding: 20,
  },

  // ============ USER INFO CARD ============
  userInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  avatarContainer: {
    marginRight: 16,
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
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
    marginBottom: 24,
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
    backgroundColor: "#F8FAFC",
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
    flexDirection: "row",
    gap: 12,
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
    backgroundColor: "#4F46E5",
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
    backgroundColor: "#4F46E5",
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
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
    color: "#4F46E5",
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
        outline: "none",
        ":focus": {
          borderColor: "#4F46E5",
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
    backgroundColor: "#F8FAFC",
    gap: 8,
    marginBottom: 16,
  },

  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  resendButtonTextActive: {
    color: "#4F46E5",
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
    paddingVertical: 24,
    gap: 8,
  },

  securityNoteText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});