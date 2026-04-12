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
  Linking,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import visitorRegisterStyles from "../styles/VisitorRegisterStyles";
import ApiService from "../utils/ApiService";
import IDScannerService from "../utils/IDScannerService";
import Logo from "../assets/LogoSapphire.jpg";
import {
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
} from "../utils/monitoringMapConfig";

let DateTimePickerComponent = null;
if (Platform.OS !== "web") {
  try {
    const DateTimePickerModule = require("@react-native-community/datetimepicker");
    DateTimePickerComponent = DateTimePickerModule.default;
  } catch (error) {
    console.warn("DateTimePicker not available:", error);
  }
}

const purposeOptions = [
  "Enrollment",
  "Meeting with Staff",
  "Maintenance Work",
  "Package Delivery",
  "Guest Visit",
  "Tour of Campus",
  "Emergency",
  "Interview",
  "Event Participation",
  "Other",
];

const officeOptions = MONITORING_MAP_OFFICES.map((office) => {
  const floor = MONITORING_MAP_FLOORS.find((item) => item.id === office.floor);
  return {
    ...office,
    floorName: floor?.name || "Campus",
  };
});

// ================= SUCCESS MODAL COMPONENT =================
const SuccessModal = ({ visible, credentials, onConfirm, onVerifySimulation }) => {
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
              colors={["#10B981", "#059669"]}
              style={visitorRegisterStyles.successIconGradient}
            >
              <Ionicons name="checkmark-done" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={visitorRegisterStyles.successTitle}>Registration Successful</Text>
          <Text style={visitorRegisterStyles.successMessage}>
            Please verify your account first before logging in.
          </Text>
          <View style={visitorRegisterStyles.credentialsBox}>
            <View style={visitorRegisterStyles.credentialsTitleRow}>
              <Ionicons name="person-circle-outline" size={16} color="#059669" />
              <Text style={visitorRegisterStyles.credentialsTitle}>
                Login Credentials
              </Text>
            </View>
            <Text style={visitorRegisterStyles.credentialsInfo}>
              This is a simulation only. You can verify the account first, then use
              these credentials to sign in.
            </Text>
            {credentials && (
              <>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Username:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>
                    {credentials.username}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(credentials.username, "Username")}
                    style={visitorRegisterStyles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Email:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>
                    {credentials.email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(credentials.email, "Email")}
                    style={visitorRegisterStyles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Password:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>
                    {credentials.password}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(credentials.password, "Password")}
                    style={visitorRegisterStyles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          {credentials?.verificationLink ? (
            <TouchableOpacity
              style={visitorRegisterStyles.successButton}
              onPress={onVerifySimulation}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={visitorRegisterStyles.successGradient}
              >
                <Text style={visitorRegisterStyles.successButtonText}>
                  Verify Account
                </Text>
                <Ionicons name="mail-open-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={visitorRegisterStyles.successButton}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#059669", "#047857"]}
                style={visitorRegisterStyles.successGradient}
              >
                <Text style={visitorRegisterStyles.successButtonText}>
                  Continue to Login
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
                colors={["#059669", "#047857"]}
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
                <Ionicons name="information-circle" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  Information We Collect
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                • Full name, email address, username, and your password for account access.
              </Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="shield" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  How We Use Your Data
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                • To create your visitor account and securely link future appointments to you.
              </Text>
              <Text style={visitorRegisterStyles.privacySectionText}>
                • To let you log in, request appointments, and track approval status.
              </Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="lock-closed" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>
                  Data Protection
                </Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>
                • Your account details are stored securely and used only inside the SafePass system.
              </Text>
              <Text style={visitorRegisterStyles.privacySectionText}>
                • Only authorized personnel can view appointment-related records when needed.
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
    paddingBottom: isCompactRegister ? 34 : 42,
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
    width: isCompactRegister ? 64 : 72,
    height: isCompactRegister ? 64 : 72,
    borderRadius: isCompactRegister ? 32 : 36,
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
    password: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [completedFields, setCompletedFields] = useState({});
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title =
        "Visitor Registration | Sapphire International Aviation Academy";
    }
  }, []);

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email address is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateUsername = (username) => {
    if (!username.trim()) return "Username is required";
    if (username.trim().length < 4) return "Username must be at least 4 characters";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const showValidationAlert = (errorsList) => {
    Alert.alert(
      "Missing Information",
      `Please fix the following:\n\n${errorsList.join("\n")}`,
      [{ text: "OK" }],
    );
  };

  const handleInputChange = (field, value) => {
    let nextValue = value;
    let error = "";

    if (field === "fullName") {
      nextValue = value.replace(/[^A-Za-z\s\-']/g, "");
      error = validateName(nextValue);
    } else if (field === "email") {
      nextValue = value.trim().toLowerCase();
      error = validateEmail(nextValue);
    } else if (field === "username") {
      nextValue = value.replace(/\s+/g, "").toLowerCase();
      error = validateUsername(nextValue);
    } else if (field === "password") {
      error = validatePassword(nextValue);
    }

    setFormData((previous) => ({ ...previous, [field]: nextValue }));
    setErrors((previous) => ({ ...previous, [field]: error }));
    setCompletedFields((previous) => ({
      ...previous,
      [field]: Boolean(nextValue && !error),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      fullName: validateName(formData.fullName),
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
    };

    setErrors(nextErrors);

    const labels = {
      fullName: "Full Name",
      email: "Email",
      username: "Username",
      password: "Password",
    };

    const errorMessages = Object.entries(nextErrors)
      .filter(([, message]) => Boolean(message))
      .map(([field, message]) => `• ${labels[field]}: ${message}`);

    if (errorMessages.length > 0) {
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
      const emailExists = await ApiService.checkEmailExists(formData.email);
      if (emailExists) {
        Alert.alert(
          "Email Already Registered",
          "An account with this email already exists. Please log in instead.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                setIsSubmitting(false);
                navigation.navigate("Login", {
                  role: "visitor",
                  initialEmail: formData.email,
                });
              },
            },
            { text: "OK", style: "cancel" },
          ],
        );
        return;
      }

      const response = await ApiService.registerVisitor({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        privacyAccepted: true,
        privacyAcceptedAt: new Date().toISOString(),
      });

      if (response?.success) {
        setRegisteredVisitor({
          username: response.credentials?.username || formData.username,
          userEmail: response.credentials?.email || formData.email,
          userPassword: response.credentials?.password || formData.password,
          verificationLink: response.verificationLink || "",
        });
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
                navigation.navigate("Login", {
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
      registeredVisitor?.username ||
      registeredVisitor?.userEmail ||
      formData.username;
    const loginPassword =
      registeredVisitor?.userPassword || formData.password;

    setShowSuccess(false);

    await AsyncStorage.multiRemove([
      "pendingVisitor",
      "authToken",
      "userToken",
      "currentUser",
    ]);
    await AsyncStorage.setItem("isNewRegistration", "true");

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Login",
          params: {
            role: "visitor",
            initialEmail: loginIdentifier,
            initialPassword: loginPassword,
          },
        },
      ],
    });
  };

  const handleVerifySimulation = async () => {
    const verificationLink = registeredVisitor?.verificationLink;

    if (!verificationLink) {
      Alert.alert(
        "Simulation Link Missing",
        "No verification link was returned. Please check the backend logs.",
      );
      return;
    }

    try {
      if (Platform.OS === "web") {
        window.open(verificationLink, "_blank", "noopener,noreferrer");
      } else {
        await Linking.openURL(verificationLink);
      }

      Alert.alert(
        "Verification Opened",
        "Open the verification page, complete the simulation, then return here and log in.",
      );
    } catch (error) {
      Alert.alert(
        "Unable to Open Verification",
        "Please copy the verification link from the backend logs and open it manually.",
      );
    }
  };

  const completionCount = [
    completedFields.fullName,
    completedFields.email,
    completedFields.username,
    completedFields.password,
  ].filter(Boolean).length;

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
    password: {
      label: "Password",
      icon: "lock-closed",
      placeholder: "Create a password",
      keyboard: "default",
      autoCapitalize: "none",
      secureTextEntry: true,
    },
  };

  const renderStepInsights = () => (
    <View style={visitorRegisterStyles.stepInsightCard}>
      <View style={visitorRegisterStyles.stepInsightHeader}>
        <View style={visitorRegisterStyles.stepInsightIcon}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#047857" />
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
          <Text style={visitorRegisterStyles.stepInsightStatValue}>{completionCount}/4</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
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
            colors={["#063B34", "#047857", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[visitorRegisterStyles.header, headerResponsiveStyle]}
          >
            <View style={[visitorRegisterStyles.headerButtons, headerButtonsResponsiveStyle]}>
              <TouchableOpacity
                style={visitorRegisterStyles.backButton}
                onPress={() => navigation.goBack()}
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
            </View>
          </LinearGradient>

          <View style={[visitorRegisterStyles.formShell, formShellResponsiveStyle]}>
            <View style={[visitorRegisterStyles.progressContainer, sectionCardResponsiveStyle]}>
              <View style={visitorRegisterStyles.progressHeader}>
                <Text style={visitorRegisterStyles.progressTitle}>
                  Registration Progress
                </Text>
                <Text style={visitorRegisterStyles.progressPercentage}>100%</Text>
              </View>
              <View style={visitorRegisterStyles.progressBarContainer}>
                <View style={[visitorRegisterStyles.progressBar, { width: "100%" }]} />
              </View>
            </View>

            <View
              style={[
                visitorRegisterStyles.stepIndicatorContainer,
                sectionCardResponsiveStyle,
              ]}
            >
              <View style={visitorRegisterStyles.stepWrapper}>
                <View
                  style={[
                    visitorRegisterStyles.stepCircle,
                    visitorRegisterStyles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      visitorRegisterStyles.stepCircleText,
                      visitorRegisterStyles.stepCircleTextActive,
                    ]}
                  >
                    1
                  </Text>
                </View>
              </View>
              <View style={visitorRegisterStyles.stepLabels}>
                <Text
                  style={[
                    visitorRegisterStyles.stepLabel,
                    visitorRegisterStyles.stepLabelActive,
                  ]}
                >
                  Account
                </Text>
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
                  <Ionicons name="person-circle-outline" size={14} color="#047857" />
                  <Text style={visitorRegisterStyles.sectionBadgeText}>Step 1/1</Text>
                </View>
              </View>

              {renderStepInsights()}

              <View style={visitorRegisterStyles.formGrid}>
                {Object.entries(fieldConfig).map(([field, config]) => (
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
                          { backgroundColor: "#ECFDF5" },
                        ]}
                      >
                        <Ionicons name={config.icon} size={20} color="#059669" />
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
                        onBlur={() => {
                          setFocusedField(null);
                          handleInputChange(field, formData[field]);
                        }}
                        keyboardType={config.keyboard}
                        autoCapitalize={config.autoCapitalize}
                        secureTextEntry={config.secureTextEntry}
                      />
                    </View>
                    {errors[field] && (
                      <Text style={visitorRegisterStyles.errorText}>{errors[field]}</Text>
                    )}
                  </View>
                ))}
              </View>

              <View style={[visitorRegisterStyles.actionRow, actionRowResponsiveStyle]}>
                <TouchableOpacity
                  style={[
                    visitorRegisterStyles.secondaryActionButton,
                    actionButtonResponsiveStyle,
                  ]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={18} color="#475569" />
                  <Text style={visitorRegisterStyles.secondaryActionText}>
                    Back to Portal
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
                    colors={["#059669", "#047857"]}
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
        credentials={
          registeredVisitor
            ? {
                username: registeredVisitor.username,
                email: registeredVisitor.userEmail,
                password: registeredVisitor.userPassword,
                verificationLink: registeredVisitor.verificationLink,
              }
            : null
        }
        onConfirm={handleSuccessConfirm}
        onVerifySimulation={handleVerifySimulation}
      />
    </SafeAreaView>
  );
}

