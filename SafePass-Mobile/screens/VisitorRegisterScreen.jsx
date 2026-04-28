import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import visitorRegisterStyles from "../styles/VisitorRegisterStyles";
import ApiService from "../utils/ApiService";
import Logo from "../assets/LogoSapphire.jpg";
import {
  PHILIPPINE_MOBILE_NUMBER_MESSAGE,
  isValidPhilippineMobileNumber,
  normalizePhilippineMobileNumber,
} from "../utils/phoneValidation";

// ================= SUCCESS MODAL COMPONENT =================
const SuccessModal = ({
  visible,
  account,
  isVerified,
  isVerifying,
  otpValue,
  otpError,
  onOtpChange,
  onConfirm,
  onVerifyOtp,
  onResendOtp,
}) => {
  const handleCopy = (text, type) => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    Alert.alert("Copied", `${type} copied to clipboard`);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={visitorRegisterStyles.modalOverlay}>
        <View style={visitorRegisterStyles.successModalContainer}>
          <View style={visitorRegisterStyles.successIconContainer}>
            <LinearGradient
              colors={["#0A3D91", "#041E42"]}
              style={visitorRegisterStyles.successIconGradient}
            >
              <Ionicons name="checkmark-done" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={visitorRegisterStyles.successTitle}>Registration Successful</Text>
          <Text style={visitorRegisterStyles.successMessage}>
            {isVerified
              ? "Your account is verified. Continue to sign in to your visitor account."
              : "Enter the 6-digit OTP sent to your email to verify your visitor account before signing in."}
          </Text>
          <View style={visitorRegisterStyles.credentialsBox}>
            <View style={visitorRegisterStyles.credentialsTitleRow}>
              <Ionicons name="person-circle-outline" size={16} color="#0A3D91" />
              <Text style={visitorRegisterStyles.credentialsTitle}>
                Account Details
              </Text>
            </View>
            <Text style={visitorRegisterStyles.credentialsInfo}>
              Use your account credentials after OTP verification. The 6-digit code
              should arrive in your email inbox from SafePass.
            </Text>
            {account && (
              <>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Username</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>
                    {account.username}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(account.username, "Username")}
                    style={visitorRegisterStyles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={18} color="#0A3D91" />
                  </TouchableOpacity>
                </View>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Email</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>
                    {account.email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(account.email, "Email")}
                    style={visitorRegisterStyles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={18} color="#0A3D91" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          {!isVerified ? (
            <View style={visitorRegisterStyles.otpVerifyBox}>
              <Text style={visitorRegisterStyles.credentialLabel}>Enter OTP Code</Text>
              <TextInput
                style={[
                  visitorRegisterStyles.otpInput,
                  otpError && visitorRegisterStyles.otpInputError,
                ]}
                value={otpValue}
                onChangeText={(value) => onOtpChange(String(value || "").replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
              />
              {otpError ? (
                <Text style={visitorRegisterStyles.otpErrorText}>{otpError}</Text>
              ) : (
                <Text style={visitorRegisterStyles.otpHintText}>
                  We will check the code after you press Verify OTP.
                </Text>
              )}
            </View>
          ) : null}
          {!isVerified ? (
            <TouchableOpacity
              style={[
                visitorRegisterStyles.successButton,
                isVerified && visitorRegisterStyles.successButtonMuted,
              ]}
              onPress={onVerifyOtp}
              disabled={isVerified || isVerifying}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#0A3D91", "#041E42"]}
                style={visitorRegisterStyles.successGradient}
              >
                <Text style={visitorRegisterStyles.successButtonText}>
                  {isVerifying
                    ? "Verifying..."
                    : isVerified
                      ? "Account Verified"
                      : "Verify OTP"}
                </Text>
                <Ionicons
                  name={isVerified ? "checkmark-circle-outline" : "keypad-outline"}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}
          {!isVerified ? (
            <TouchableOpacity
              style={visitorRegisterStyles.resendOtpButton}
              onPress={onResendOtp}
              disabled={isVerifying}
            >
              <Text style={visitorRegisterStyles.resendOtpButtonText}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              visitorRegisterStyles.successButton,
              !isVerified && visitorRegisterStyles.successButtonMuted,
            ]}
            onPress={onConfirm}
            disabled={!isVerified}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isVerified ? ["#0A3D91", "#0A3D91"] : ["#94A3B8", "#64748B"]}
              style={visitorRegisterStyles.successGradient}
            >
              <Text style={visitorRegisterStyles.successButtonText}>
                {isVerified ? "Continue to Sign In" : "Verify OTP First"}
              </Text>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
// ================= DATA PRIVACY MODAL =================
const DataPrivacyModal = ({ visible, onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (visible) {
      setAccepted(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={visitorRegisterStyles.modalOverlay}>
        <View style={visitorRegisterStyles.privacyModalContainer}>
          <View style={visitorRegisterStyles.privacyModalHeader}>
            <View style={visitorRegisterStyles.privacyIconContainer}>
              <LinearGradient
                colors={["#0A3D91", "#0A3D91"]}
                style={visitorRegisterStyles.privacyIconGradient}
              >
                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={visitorRegisterStyles.privacyModalTitle}>
              Data Privacy Agreement
            </Text>
            <Text style={visitorRegisterStyles.privacyModalSubtitle}>
              By registering, you agree that your personal data will be collected and used for visitor monitoring and security purposes.
            </Text>
          </View>
          <ScrollView
            style={visitorRegisterStyles.privacyModalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="information-circle" size={20} color="#0A3D91" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  Information We Collect
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                - Full name, email address, username, and your password for account access.
              </Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="shield" size={20} color="#0A3D91" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  How We Use Your Data
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                - To create your visitor account and securely link future appointments to you.
              </Text>
              <Text style={visitorRegisterStyles.privacySectionText}>
                - To let you log in, request appointments, and track approval status.
              </Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="lock-closed" size={20} color="#0A3D91" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  Data Protection
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                - Your account details are stored securely and used only inside the SafePass system.
              </Text>
              <Text style={visitorRegisterStyles.privacySectionText}>
                - Only authorized personnel can view appointment-related records when needed.
              </Text>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={visitorRegisterStyles.privacyCheckboxRow}
            activeOpacity={0.8}
            onPress={() => setAccepted((previous) => !previous)}
          >
            <View
              style={[
                visitorRegisterStyles.privacyCheckbox,
                accepted && visitorRegisterStyles.privacyCheckboxChecked,
              ]}
            >
              {accepted ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
            </View>
            <Text style={visitorRegisterStyles.privacyCheckboxText}>
              I understand and accept the data privacy policy.
            </Text>
          </TouchableOpacity>
          <View style={visitorRegisterStyles.privacyButtonRow}>
            <TouchableOpacity
              style={visitorRegisterStyles.privacyDeclineButton}
              onPress={onDecline}
            >
              <Text style={visitorRegisterStyles.privacyDeclineButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                visitorRegisterStyles.privacyAcceptButton,
                !accepted && visitorRegisterStyles.privacyAcceptButtonDisabled,
              ]}
              onPress={() => {
                if (accepted) onAccept();
              }}
              disabled={!accepted}
            >
              <Text style={visitorRegisterStyles.privacyAcceptButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default function VisitorRegisterScreen({ navigation }) {
  const { width: viewportWidth } = useWindowDimensions();
  const isCompactRegister = viewportWidth <= 420;
  const isTabletRegister = viewportWidth >= 768;
  const registerHorizontalMargin = isCompactRegister ? 12 : 16;
  const registerShellMaxWidth = Math.min(
    860,
    Math.max(viewportWidth - registerHorizontalMargin * 2, 300),
  );
  const headerResponsiveStyle = {
    paddingBottom: isCompactRegister ? 22 : 28,
  };
  const headerButtonsResponsiveStyle = {
    left: registerHorizontalMargin,
    right: registerHorizontalMargin,
  };
  const headerContentResponsiveStyle = {
    paddingHorizontal: isCompactRegister ? 16 : 22,
    maxWidth: isTabletRegister ? 720 : 640,
  };
  const headerIconGradientResponsiveStyle = {
    width: isCompactRegister ? 48 : 56,
    height: isCompactRegister ? 48 : 56,
    borderRadius: isCompactRegister ? 24 : 28,
  };
  const headerTitleResponsiveStyle = {
    fontSize: isCompactRegister ? 24 : undefined,
    lineHeight: isCompactRegister ? 30 : undefined,
  };
  const headerDescriptionResponsiveStyle = {
    lineHeight: isCompactRegister ? 20 : 22,
  };
  const formShellResponsiveStyle = Platform.OS === "web"
    ? { maxWidth: registerShellMaxWidth }
    : null;
  const sectionCardResponsiveStyle = {
    marginHorizontal: registerHorizontalMargin,
  };
  const contentResponsiveStyle = {
    padding: isCompactRegister ? 16 : 22,
  };
  const sectionHeaderResponsiveStyle = isCompactRegister
    ? { flexDirection: "column", alignItems: "flex-start" }
    : null;
  const actionRowResponsiveStyle = isCompactRegister
    ? { flexDirection: "column", gap: 10 }
    : null;
  const actionButtonResponsiveStyle = isCompactRegister
    ? { width: "100%", flex: 0 }
    : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDataPrivacy, setShowDataPrivacy] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [completedFields, setCompletedFields] = useState({});
  const [registeredVisitor, setRegisteredVisitor] = useState(null);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [registrationOtpError, setRegistrationOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const goToVisitorLogin = (overrides = {}) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Login",
          params: {
            role: "visitor",
            ...overrides,
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title =
        "Visitor Registration | Sapphire International Aviation Academy";
    }
  }, []);

  const normalizeFullName = (name) => name.replace(/\s{2,}/g, " ").trim();

  const normalizeUsername = (username) => username.trim().toLowerCase();

  const validateName = (name) => {
    const normalizedName = normalizeFullName(String(name || ""));

    if (!normalizedName) return "Full name is required";
    if (normalizedName.length < 5) return "Please enter your full name";

    const nameParts = normalizedName.split(" ").filter(Boolean);
    if (nameParts.length < 2) return "Please enter at least first and last name";

    if (!/^[A-Za-z][A-Za-z\s\-']*[A-Za-z]$/.test(normalizedName)) {
      return "Name must start and end with a letter";
    }

    if (/[-']{2,}/.test(normalizedName)) {
      return "Name contains invalid punctuation";
    }

    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email address is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateUsername = (username) => {
    const normalizedUsername = normalizeUsername(String(username || ""));

    if (!normalizedUsername) return "Username is required";
    if (normalizedUsername.length < 4) return "Username must be at least 4 characters";
    if (normalizedUsername.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-z][a-z0-9._]*$/.test(normalizedUsername)) {
      return "Use lowercase letters, numbers, dots, or underscores only";
    }

    return "";
  };

  const validatePhone = (phone) => {
    if (!String(phone || "").trim()) return "Contact number is required";
    if (!isValidPhilippineMobileNumber(phone)) return PHILIPPINE_MOBILE_NUMBER_MESSAGE;
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
    if (!/\d/.test(password)) return "Password must include at least one number";
    return "";
  };

  const passwordChecklist = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const showValidationAlert = (errorsList) => {
    Alert.alert(
      "Missing Information",
      `Please fix the following:\n\n${errorsList.join("\n")}`,
      [{ text: "OK" }],
    );
  };

  const getFieldError = (field, value, nextFormData = formData) => {
    if (field === "fullName") return validateName(value);
    if (field === "email") return validateEmail(value);
    if (field === "username") return validateUsername(value);
    if (field === "phone") return validatePhone(value);
    if (field === "password") return validatePassword(value);
    if (field === "confirmPassword") {
      return validateConfirmPassword(value, nextFormData.password);
    }
    return "";
  };

  const handleInputChange = (field, value) => {
    let nextValue = value;

    if (field === "fullName") {
      nextValue = value.replace(/[^A-Za-z\s\-']/g, "").replace(/\s{2,}/g, " ");
    } else if (field === "email") {
      nextValue = value.trim().toLowerCase();
    } else if (field === "username") {
      nextValue = value.replace(/[^A-Za-z0-9._]/g, "").toLowerCase();
    } else if (field === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 11);
    }

    const nextFormData = { ...formData, [field]: nextValue };
    const nextFieldError = getFieldError(field, nextValue, nextFormData);
    const nextConfirmPasswordError = getFieldError(
      "confirmPassword",
      nextFormData.confirmPassword,
      nextFormData,
    );

    setFormData(nextFormData);
    setErrors((previous) => ({
      ...previous,
      [field]: touchedFields[field] ? nextFieldError : "",
      confirmPassword:
        field === "password"
          ? touchedFields.confirmPassword
            ? nextConfirmPasswordError
            : ""
          : previous.confirmPassword,
    }));
    setCompletedFields((previous) => ({
      ...previous,
      [field]: Boolean(nextValue && !nextFieldError),
      confirmPassword:
        field === "password"
          ? Boolean(nextFormData.confirmPassword && !nextConfirmPasswordError)
          : previous.confirmPassword,
    }));
  };

  const handleFieldBlur = (field) => {
    setFocusedField(null);
    if (field === "fullName") {
      setFormData((previous) => ({
        ...previous,
        fullName: normalizeFullName(previous.fullName),
      }));
    } else if (field === "username") {
      setFormData((previous) => ({
        ...previous,
        username: normalizeUsername(previous.username),
      }));
    }
    setTouchedFields((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({
      ...previous,
      [field]: getFieldError(
        field,
        field === "fullName"
          ? normalizeFullName(formData[field])
          : field === "username"
            ? normalizeUsername(formData[field])
            : formData[field],
        {
          ...formData,
          ...(field === "fullName"
            ? { fullName: normalizeFullName(formData.fullName) }
            : field === "username"
              ? { username: normalizeUsername(formData.username) }
              : {}),
        },
      ),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      fullName: validateName(formData.fullName),
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password,
      ),
    };

    setErrors(nextErrors);

    const labels = {
      fullName: "Full Name",
      email: "Email",
      username: "Username",
      phone: "Contact Number",
      password: "Password",
      confirmPassword: "Confirm Password",
    };

    const errorMessages = Object.entries(nextErrors)
      .filter(([, message]) => Boolean(message))
      .map(([field, message]) => `- ${labels[field]}: ${message}`);

    if (errorMessages.length > 0) {
      setTouchedFields({
        fullName: true,
        email: true,
        username: true,
        phone: true,
        password: true,
        confirmPassword: true,
      });
      showValidationAlert(errorMessages);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowDataPrivacy(true);
    }
  };

  const handlePrivacyAccept = async () => {
    setShowDataPrivacy(false);
    setIsSubmitting(true);

    try {
      const response = await ApiService.registerVisitor({
        fullName: normalizeFullName(formData.fullName),
        email: formData.email,
        username: normalizeUsername(formData.username),
        phone: normalizePhilippineMobileNumber(formData.phone),
        password: formData.password,
        privacyAccepted: true,
        privacyAcceptedAt: new Date().toISOString(),
      });

      if (response?.success) {
        setRegisteredVisitor({
          username: response.credentials?.username || formData.username,
          email: response.credentials?.email || formData.email,
          isVerified: false,
        });
        setRegistrationOtp("");
        setRegistrationOtpError("");
        setTimeout(() => {
          setShowSuccess(true);
        }, Platform.OS === "web" ? 120 : 80);
      } else {
        Alert.alert(
          "Registration Error",
          response?.message || "Failed to create your account. Please try again.",
        );
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || error.message || "Failed to connect to server.";
      const normalizedMessage = errorMessage.toLowerCase();

      if (normalizedMessage.includes("username")) {
        Alert.alert(
          "Username Unavailable",
          "That username is already taken. Please choose another username.",
        );
      } else if (
        normalizedMessage.includes("already exists") ||
        normalizedMessage.includes("duplicate")
      ) {
        Alert.alert(
          "Account Already Exists",
          "A visitor account with this email already exists. Please log in instead.",
          [
            {
              text: "Go to Login",
              onPress: () =>
                goToVisitorLogin({
                  role: "visitor",
                  initialEmail: formData.email,
                }),
            },
            { text: "OK", style: "cancel" },
          ],
        );
      } else if (
        normalizedMessage.includes("network request failed") ||
        normalizedMessage.includes("cannot connect to backend")
      ) {
        Alert.alert(
          "Network Error",
          "Cannot connect to the server. Please check that your backend is running.",
        );
      } else {
        Alert.alert("Registration Error", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyDecline = () => {
    setShowDataPrivacy(false);
    Alert.alert(
      "Privacy Policy Required",
      "You must accept the data privacy policy to create an account.",
    );
  };

  const handleSuccessConfirm = async () => {
    const loginIdentifier =
      registeredVisitor?.email ||
      registeredVisitor?.username ||
      formData.email;
    const loginPassword =
      registeredVisitor?.password || formData.password;

    setShowSuccess(false);

    await ApiService.clearAuth();
    await AsyncStorage.removeItem("pendingVisitor");
    await AsyncStorage.setItem("isNewRegistration", "true");

    goToVisitorLogin({
      initialEmail: loginIdentifier,
      initialPassword: loginPassword,
    });
  };

  const handleVerifyRegistrationOtp = async () => {
    const email = registeredVisitor?.email || formData.email;
    const otpCode = String(registrationOtp || "").replace(/\D/g, "").slice(0, 6);

    if (!email || !otpCode) {
      setRegistrationOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    if (otpCode.length !== 6) {
      setRegistrationOtpError("The OTP must be exactly 6 digits.");
      return;
    }

    try {
      setRegistrationOtpError("");
      setIsVerifyingAccount(true);
      const response = await ApiService.verifyRegistrationOtp(email, otpCode);

      if (response?.success) {
        setRegisteredVisitor((previous) => ({
          ...previous,
          isVerified: true,
        }));
        Alert.alert(
          "Account Verified",
          "Your visitor account is now verified. You will be redirected to login.",
          [
            {
              text: "Continue",
              onPress: () => {
                handleSuccessConfirm();
              },
            },
          ],
        );
        return;
      }

      Alert.alert(
        "OTP Verification Failed",
        response?.message || "Unable to verify the OTP. Please try again.",
      );
    } catch (error) {
      setRegistrationOtpError(error?.message || "Please try again or request a new OTP.");
      Alert.alert(
        "Unable to Verify OTP",
        error?.message || "Please try again or request a new OTP.",
      );
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleResendRegistrationOtp = async () => {
    const email = registeredVisitor?.email || formData.email;
    if (!email) {
      Alert.alert("Email Missing", "Unable to find the visitor email for OTP resend.");
      return;
    }

    try {
      setIsVerifyingAccount(true);
      const response = await ApiService.resendRegistrationOtp(email);
      if (response?.success) {
        setRegisteredVisitor((previous) => ({
          ...previous,
        }));
        setRegistrationOtp("");
        setRegistrationOtpError("");
        Alert.alert(
          "Verification Code Sent",
          "A new OTP has been sent to your email. Please also check your spam folder just in case.",
        );
        return;
      }

      Alert.alert("Unable to Resend OTP", response?.message || "Please try again.");
    } catch (error) {
      Alert.alert("Unable to Resend OTP", error?.message || "Please try again.");
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const registrationFields = [
    { key: "fullName", label: "Name", icon: "person-outline" },
    { key: "email", label: "Email", icon: "mail-outline" },
    { key: "username", label: "Username", icon: "at-outline" },
    { key: "phone", label: "Phone", icon: "call-outline" },
    { key: "password", label: "Password", icon: "lock-closed-outline" },
    { key: "confirmPassword", label: "Confirm", icon: "shield-checkmark-outline" },
  ];
  const fieldCompletion = {
    fullName: Boolean(formData.fullName && !validateName(formData.fullName)),
    email: Boolean(formData.email && !validateEmail(formData.email)),
    username: Boolean(formData.username && !validateUsername(formData.username)),
    phone: Boolean(formData.phone && !validatePhone(formData.phone)),
    password: Boolean(formData.password && !validatePassword(formData.password)),
    confirmPassword: Boolean(
      formData.confirmPassword &&
        !validateConfirmPassword(formData.confirmPassword, formData.password),
    ),
  };
  const totalRegistrationFields = registrationFields.length;
  const completionCount = registrationFields.filter(
    (field) => fieldCompletion[field.key],
  ).length;
  const registrationProgressPercentage = Math.round(
    (completionCount / totalRegistrationFields) * 100,
  );

  const fieldConfig = {
    fullName: {
      label: "Full Name",
      icon: "person",
      placeholder: "Enter your full name",
      keyboard: "default",
      autoCapitalize: "words",
      secureTextEntry: false,
    },
    email: {
      label: "Email Address",
      icon: "mail",
      placeholder: "your@email.com",
      keyboard: "email-address",
      autoCapitalize: "none",
      secureTextEntry: false,
    },
    username: {
      label: "Username",
      icon: "at",
      placeholder: "Choose a username",
      keyboard: "default",
      autoCapitalize: "none",
      secureTextEntry: false,
    },
    phone: {
      label: "Contact Number",
      icon: "call",
      placeholder: "09123456789",
      keyboard: "phone-pad",
      autoCapitalize: "none",
      secureTextEntry: false,
      maxLength: 11,
    },
    password: {
      label: "Password",
      icon: "lock-closed",
      placeholder: "Create a password",
      keyboard: "default",
      autoCapitalize: "none",
      secureTextEntry: !showPassword,
    },
    confirmPassword: {
      label: "Confirm Password",
      icon: "shield-checkmark",
      placeholder: "Re-enter your password",
      keyboard: "default",
      autoCapitalize: "none",
      secureTextEntry: !showConfirmPassword,
    },
  };

  const renderStepInsights = () => (
    <View style={visitorRegisterStyles.stepInsightCard}>
      <View style={visitorRegisterStyles.stepInsightHeader}>
        <View style={visitorRegisterStyles.stepInsightIcon}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0A3D91" />
        </View>
        <View style={visitorRegisterStyles.stepInsightTextWrap}>
          <Text style={visitorRegisterStyles.stepInsightTitle}>Account Setup</Text>
          <Text style={visitorRegisterStyles.stepInsightSubtitle}>
            Create your visitor account first. Appointment requests will only be
            created after login so everything stays tied to your account.
          </Text>
        </View>
      </View>
      <View style={visitorRegisterStyles.stepInsightStats}>
        <View style={visitorRegisterStyles.stepInsightStat}>
          <Text style={visitorRegisterStyles.stepInsightStatValue}>{completionCount}/6</Text>
          <Text style={visitorRegisterStyles.stepInsightStatLabel}>Complete</Text>
        </View>
        <View style={visitorRegisterStyles.stepInsightDivider} />
        <View style={visitorRegisterStyles.stepInsightStat}>
          <Text style={visitorRegisterStyles.stepInsightStatValue}>Login</Text>
          <Text style={visitorRegisterStyles.stepInsightStatLabel}>Ready after signup</Text>
        </View>
        <View style={visitorRegisterStyles.stepInsightDivider} />
        <View style={visitorRegisterStyles.stepInsightStat}>
          <Text style={visitorRegisterStyles.stepInsightStatValue}>Secure</Text>
          <Text style={visitorRegisterStyles.stepInsightStatLabel}>Account-based flow</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={visitorRegisterStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D91" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
        style={visitorRegisterStyles.keyboardView}
      >
        <ScrollView
          style={visitorRegisterStyles.mainScrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={visitorRegisterStyles.scrollContainer}
        >
          <LinearGradient
            colors={["#041E42", "#0A3D91", "#0A3D91"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[visitorRegisterStyles.header, headerResponsiveStyle]}
          >
            <View style={[visitorRegisterStyles.headerButtons, headerButtonsResponsiveStyle]}>
              <TouchableOpacity
                style={visitorRegisterStyles.backButton}
                onPress={() => goToVisitorLogin()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={[visitorRegisterStyles.headerContent, headerContentResponsiveStyle]}>
              <View style={visitorRegisterStyles.headerBadge}>
                <Image
                  source={Logo}
                  style={visitorRegisterStyles.headerBadgeLogo}
                  resizeMode="contain"
                />
                <View style={visitorRegisterStyles.headerBadgeTextWrap}>
                  <Text style={visitorRegisterStyles.headerBadgeEyebrow}>
                    Sapphire Access Portal
                  </Text>
                  <Text style={visitorRegisterStyles.headerBadgeTitle}>
                    SafePass Visitor Registration
                  </Text>
                </View>
              </View>
              <View style={visitorRegisterStyles.headerIconContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                  style={[
                    visitorRegisterStyles.headerIconGradient,
                    headerIconGradientResponsiveStyle,
                  ]}
                >
                  <Ionicons name="person-add" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[visitorRegisterStyles.headerTitle, headerTitleResponsiveStyle]}>
                Create Your Visitor Account
              </Text>
              <Text style={visitorRegisterStyles.headerSubtitle}>Account Registration</Text>
              <Text
                style={[
                  visitorRegisterStyles.headerDescription,
                  headerDescriptionResponsiveStyle,
                ]}
              >
                Register first, then log in to request appointments and view the
                campus map from your visitor dashboard.
              </Text>
              <View style={visitorRegisterStyles.aviationStrip}>
                <View style={visitorRegisterStyles.aviationChip}>
                  <Ionicons name="airplane-outline" size={16} color="#FFFFFF" />
                  <Text style={visitorRegisterStyles.aviationChipText}>
                    Sapphire Aviation
                  </Text>
                </View>
                <View style={visitorRegisterStyles.aviationRoute}>
                  <View style={visitorRegisterStyles.aviationDot} />
                  <View style={visitorRegisterStyles.aviationTrail} />
                  <Ionicons name="airplane" size={16} color="#D6E7FF" />
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={[visitorRegisterStyles.formShell, formShellResponsiveStyle]}>
            <View style={[visitorRegisterStyles.progressContainer, sectionCardResponsiveStyle]}>
              <View style={visitorRegisterStyles.progressHeader}>
                <Text style={visitorRegisterStyles.progressTitle}>
                  Registration Progress
                </Text>
                <Text style={visitorRegisterStyles.progressPercentage}>
                  {registrationProgressPercentage}%
                </Text>
              </View>
              <View style={visitorRegisterStyles.progressBarContainer}>
                <View
                  style={[
                    visitorRegisterStyles.progressBar,
                    { width: `${registrationProgressPercentage}%` },
                  ]}
                />
              </View>
              <View style={visitorRegisterStyles.progressMetaRow}>
                <Text style={visitorRegisterStyles.progressMetaText}>
                  {completionCount} of {totalRegistrationFields} required details complete
                </Text>
                <Text style={visitorRegisterStyles.progressMetaText}>
                  {registrationProgressPercentage === 100
                    ? "Ready to create"
                    : "Complete all fields"}
                </Text>
              </View>
              <View style={visitorRegisterStyles.progressChecklist}>
                {registrationFields.map((field) => {
                  const isComplete = fieldCompletion[field.key];
                  return (
                    <View
                      key={field.key}
                      style={[
                        visitorRegisterStyles.progressChip,
                        isComplete && visitorRegisterStyles.progressChipComplete,
                      ]}
                    >
                      <Ionicons
                        name={isComplete ? "checkmark-circle" : field.icon}
                        size={14}
                        color={isComplete ? "#0A3D91" : "#94A3B8"}
                      />
                      <Text
                        style={[
                          visitorRegisterStyles.progressChipText,
                          isComplete && visitorRegisterStyles.progressChipTextComplete,
                        ]}
                      >
                        {field.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={[visitorRegisterStyles.content, contentResponsiveStyle]}>
              <View style={[visitorRegisterStyles.sectionHeader, sectionHeaderResponsiveStyle]}>
                <View style={visitorRegisterStyles.sectionTextBlock}>
                  <Text style={visitorRegisterStyles.sectionTitle}>
                    Create Visitor Account
                  </Text>
                  <Text style={visitorRegisterStyles.sectionDescription}>
                    Sign up using only your account details. Appointment details
                    will be filled in later after you log in.
                  </Text>
                </View>
                <View style={visitorRegisterStyles.sectionBadge}>
                  <Ionicons name="person-circle-outline" size={14} color="#0A3D91" />
                  <Text style={visitorRegisterStyles.sectionBadgeText}>
                    Account Details
                  </Text>
                </View>
              </View>

              {renderStepInsights()}

              <View style={visitorRegisterStyles.formGrid}>
                {Object.entries(fieldConfig).map(([field, config]) => {
                  const isPasswordField = field === "password" || field === "confirmPassword";
                  const passwordIsVisible =
                    field === "password" ? showPassword : showConfirmPassword;
                  const togglePasswordVisibility =
                    field === "password" ? setShowPassword : setShowConfirmPassword;

                  return (
                  <View
                    key={field}
                    style={[
                      visitorRegisterStyles.formCard,
                      focusedField === field && visitorRegisterStyles.formCardFocused,
                      errors[field] && visitorRegisterStyles.formCardError,
                    ]}
                  >
                    <View style={visitorRegisterStyles.cardHeader}>
                      <View
                        style={[
                          visitorRegisterStyles.cardIcon,
                          { backgroundColor: "#EEF5FF" },
                        ]}
                      >
                        <Ionicons name={config.icon} size={20} color="#0A3D91" />
                      </View>
                      <Text style={visitorRegisterStyles.cardLabel}>{config.label}</Text>
                      <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
                    </View>
                    <View
                      style={[
                        visitorRegisterStyles.inputContainer,
                        focusedField === field && visitorRegisterStyles.inputContainerFocused,
                        errors[field] && visitorRegisterStyles.inputContainerError,
                      ]}
                    >
                      <Ionicons
                        name={`${config.icon}-outline`}
                        size={18}
                        color={errors[field] ? "#EF4444" : "#9CA3AF"}
                      />
                      <TextInput
                        style={visitorRegisterStyles.input}
                        placeholder={config.placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={formData[field]}
                        onChangeText={(text) => handleInputChange(field, text)}
                        onFocus={() => setFocusedField(field)}
                        onBlur={() => handleFieldBlur(field)}
                        keyboardType={config.keyboard}
                        autoCapitalize={config.autoCapitalize}
                        secureTextEntry={config.secureTextEntry}
                        maxLength={config.maxLength}
                      />
                      {isPasswordField ? (
                        <TouchableOpacity
                          onPress={() => togglePasswordVisibility((previous) => !previous)}
                          style={visitorRegisterStyles.passwordToggleButton}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={
                            passwordIsVisible ? "Hide password" : "Show password"
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={passwordIsVisible ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#64748B"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {errors[field] && (
                      <Text style={visitorRegisterStyles.errorText}>{errors[field]}</Text>
                    )}
                    {field === "password" ? (
                      <View style={visitorRegisterStyles.passwordChecklist}>
                        <View style={visitorRegisterStyles.passwordChecklistRow}>
                          <Ionicons
                            name={passwordChecklist.minLength ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={passwordChecklist.minLength ? "#16A34A" : "#94A3B8"}
                          />
                          <Text
                            style={[
                              visitorRegisterStyles.passwordChecklistText,
                              passwordChecklist.minLength && visitorRegisterStyles.passwordChecklistTextComplete,
                            ]}
                          >
                            At least 8 characters
                          </Text>
                        </View>
                        <View style={visitorRegisterStyles.passwordChecklistRow}>
                          <Ionicons
                            name={passwordChecklist.uppercase ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={passwordChecklist.uppercase ? "#16A34A" : "#94A3B8"}
                          />
                          <Text
                            style={[
                              visitorRegisterStyles.passwordChecklistText,
                              passwordChecklist.uppercase && visitorRegisterStyles.passwordChecklistTextComplete,
                            ]}
                          >
                            Has an uppercase letter
                          </Text>
                        </View>
                        <View style={visitorRegisterStyles.passwordChecklistRow}>
                          <Ionicons
                            name={passwordChecklist.lowercase ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={passwordChecklist.lowercase ? "#16A34A" : "#94A3B8"}
                          />
                          <Text
                            style={[
                              visitorRegisterStyles.passwordChecklistText,
                              passwordChecklist.lowercase && visitorRegisterStyles.passwordChecklistTextComplete,
                            ]}
                          >
                            Has a lowercase letter
                          </Text>
                        </View>
                        <View style={visitorRegisterStyles.passwordChecklistRow}>
                          <Ionicons
                            name={passwordChecklist.number ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={passwordChecklist.number ? "#16A34A" : "#94A3B8"}
                          />
                          <Text
                            style={[
                              visitorRegisterStyles.passwordChecklistText,
                              passwordChecklist.number && visitorRegisterStyles.passwordChecklistTextComplete,
                            ]}
                          >
                            Has a number
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                  );
                })}
              </View>

              <View style={[visitorRegisterStyles.actionRow, actionRowResponsiveStyle]}>
                <TouchableOpacity
                  style={[
                    visitorRegisterStyles.secondaryActionButton,
                    actionButtonResponsiveStyle,
                  ]}
                  onPress={() => goToVisitorLogin()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={18} color="#475569" />
                  <Text style={visitorRegisterStyles.secondaryActionText}>
                    Back to Login
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    visitorRegisterStyles.continueButton,
                    actionButtonResponsiveStyle,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={["#0A3D91", "#0A3D91"]}
                    style={visitorRegisterStyles.gradientButton}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={visitorRegisterStyles.continueButtonText}>
                          Create Account
                        </Text>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DataPrivacyModal
        visible={showDataPrivacy}
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
      />
      <SuccessModal
        visible={showSuccess}
        account={
          registeredVisitor
            ? {
                username: registeredVisitor.username,
                email: registeredVisitor.email,
              }
            : null
        }
        isVerified={Boolean(registeredVisitor?.isVerified)}
        isVerifying={isVerifyingAccount}
        otpValue={registrationOtp}
        otpError={registrationOtpError}
        onOtpChange={(value) => {
          setRegistrationOtp(String(value || "").replace(/\D/g, "").slice(0, 6));
          if (registrationOtpError) {
            setRegistrationOtpError("");
          }
        }}
        onConfirm={handleSuccessConfirm}
        onVerifyOtp={handleVerifyRegistrationOtp}
        onResendOtp={handleResendRegistrationOtp}
      />
    </SafeAreaView>
  );
}


