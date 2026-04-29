import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  SafeAreaView,
  Animated,
  Image,
  Linking,
  useWindowDimensions,
} from "react-native";
import loginStyles from "../styles/LoginStyles";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";
import { getDashboardRoute, normalizeRole } from "../utils/authFlow";
import {
  APP_ORGANIZATION_NAME,
  IS_VISITOR_ONLY_APP,
  getVariantBlockedRoleMessage,
  isRoleAllowedInCurrentVariant,
} from "../utils/appVariant";
import Logo from "../assets/LogoSapphire.jpg";

const isWeb = Platform.OS === "web";
const Storage = Platform.OS === "web"
  ? require("../utils/webStorage").default
  : require("@react-native-async-storage/async-storage").default;

export default function LoginScreen({ navigation, route }) {
  // Get role from navigation params
  const { role, initialEmail = "", initialPassword = "" } = route?.params || { role: "visitor" };
  const effectiveRole = IS_VISITOR_ONLY_APP ? "visitor" : role;
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const isCompactLogin = viewportWidth <= 420;
  const isTabletLogin = viewportWidth >= 768;
  const loginHorizontalPadding = isCompactLogin ? 12 : 20;
  const loginMaxContentWidth = Math.min(
    520,
    Math.max(viewportWidth - loginHorizontalPadding * 2, 280)
  );
  const headerResponsiveStyle = {
    paddingHorizontal: isCompactLogin ? 18 : isTabletLogin ? 28 : 24,
    paddingBottom: isCompactLogin ? 56 : isTabletLogin ? 68 : 62,
  };
  const logoResponsiveStyle = {
    width: isCompactLogin ? 74 : isTabletLogin ? 100 : 92,
    height: isCompactLogin ? 74 : isTabletLogin ? 100 : 92,
    borderRadius: isCompactLogin ? 37 : isTabletLogin ? 50 : 46,
  };
  const appNameResponsiveStyle = {
    fontSize: isCompactLogin ? 18 : isTabletLogin ? 24 : 22,
    lineHeight: isCompactLogin ? 24 : isTabletLogin ? 30 : 28,
  };
  const cardResponsiveStyle = {
    marginHorizontal: loginHorizontalPadding,
    marginTop: isCompactLogin ? -26 : -32,
    padding: isCompactLogin ? 18 : 24,
    ...(isWeb ? { maxWidth: loginMaxContentWidth } : null),
  };
  const roleHeroResponsiveStyle = isCompactLogin
    ? { padding: 12, alignItems: "flex-start" }
    : null;
  const roleIconResponsiveStyle = isCompactLogin
    ? { width: 42, height: 42, borderRadius: 8, marginRight: 10 }
    : null;
  const welcomeTitleResponsiveStyle = {
    fontSize: isCompactLogin ? 24 : isTabletLogin ? 30 : 28,
    lineHeight: isCompactLogin ? 30 : 34,
  };
  const welcomeSubtitleResponsiveStyle = {
    marginBottom: isCompactLogin ? 20 : 24,
  };
  const authRowResponsiveStyle = isCompactLogin
    ? { flexDirection: "column", alignItems: "flex-start", gap: 12, marginBottom: 20 }
    : null;
  const footerResponsiveStyle = {
    paddingHorizontal: loginHorizontalPadding,
    paddingBottom: isCompactLogin ? 28 : 22,
  };
  const footerContactCardResponsiveStyle = {
    padding: isCompactLogin ? 14 : 16,
    ...(isWeb ? { maxWidth: loginMaxContentWidth } : null),
  };
  const footerLinkRowResponsiveStyle = isCompactLogin ? { width: "100%" } : null;
  const footerLinkChipResponsiveStyle = isCompactLogin
    ? { width: "100%", justifyContent: "center" }
    : null;
  const forgotModalContentResponsiveStyle = {
    maxHeight: viewportHeight <= 760 ? "96%" : "92%",
    borderRadius: isCompactLogin ? 18 : 24,
  };
  const forgotModalHeroResponsiveStyle = {
    paddingHorizontal: isCompactLogin ? 16 : 24,
    paddingTop: isCompactLogin ? 16 : 22,
    paddingBottom: isCompactLogin ? 14 : 22,
  };
  const forgotModalHeroTopRowResponsiveStyle = isCompactLogin
    ? { alignItems: "flex-start", gap: 10 }
    : null;
  const forgotModalBrandBadgeResponsiveStyle = isCompactLogin
    ? { paddingVertical: 7, paddingHorizontal: 10 }
    : null;
  const forgotModalStepRowResponsiveStyle = isCompactLogin
    ? { gap: 6, marginTop: 12 }
    : null;
  const forgotModalBodyContentResponsiveStyle = {
    padding: isCompactLogin ? 16 : 24,
    paddingBottom: isCompactLogin ? 24 : 28,
  };
  
  // ============ STATE MANAGEMENT ============
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginSplash, setShowLoginSplash] = useState(false);
  const [loginSplashMessage, setLoginSplashMessage] = useState("Signing you in...");
  const [apiConnected, setApiConnected] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ============ FORGOT PASSWORD STATES ============
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetOtpError, setResetOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetTimer, setResetTimer] = useState(60);
  const [canResendReset, setCanResendReset] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Refs for web keyboard navigation
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const loginButtonRef = useRef(null);

  // ============ ANIMATIONS ============
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = `Login | ${APP_ORGANIZATION_NAME}`;
    }
  }, []);

  const normalizeLoginIdentifier = (value) => {
    const trimmedValue = String(value || "").trim();
    return trimmedValue.includes("@") ? trimmedValue.toLowerCase() : trimmedValue;
  };

  const normalizeResetEmailValue = (value) => String(value || "").trim().toLowerCase();

  const normalizeResetOtpValue = (value) =>
    String(value || "").replace(/[^0-9]/g, "").slice(0, 6);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setRememberMe(true);
    }
    if (initialPassword) {
      setPassword(initialPassword);
    }
  }, [initialEmail, initialPassword]);

  useEffect(() => {
    const routeResetEmail = route?.params?.resetEmail;
    const routeResetToken = route?.params?.resetToken;
    let linkResetEmail = routeResetEmail;
    let linkResetToken = routeResetToken;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const query = new URLSearchParams(window.location.search || "");
      linkResetEmail = linkResetEmail || query.get("resetEmail");
      linkResetToken = linkResetToken || query.get("resetToken");
    }

    if (linkResetEmail && linkResetToken) {
      setShowForgotPassword(true);
      setResetStep(3);
      setResetEmail(normalizeResetEmailValue(linkResetEmail));
      setResetToken(String(linkResetToken).trim());
      setResetEmailError("");
      setResetOtp("");
      setResetOtpError("");
      setNewPassword("");
      setNewPasswordError("");
      setConfirmNewPassword("");
      setConfirmNewPasswordError("");
    }
  }, [route?.params?.resetEmail, route?.params?.resetToken]);

  // ============ AUTH CHECK ============
  useEffect(() => {
    checkAuthAndConnection();
  }, []);

  // Timer for Reset OTP
  useEffect(() => {
    let interval;
    if (resetStep === 2 && resetTimer > 0) {
      interval = setInterval(() => {
        setResetTimer((prev) => prev - 1);
      }, 1000);
    } else if (resetTimer === 0) {
      setCanResendReset(true);
    }
    return () => clearInterval(interval);
  }, [resetStep, resetTimer]);

  const checkAuthAndConnection = async () => {
    try {
      const connected = await ApiService.testConnection();
      setApiConnected(connected);

      if (!initialEmail) {
        const rememberedEmail = await Storage.getItem("rememberedEmail");
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      }
      
      const isNewRegistration = await Storage.getItem('isNewRegistration');
      
      if (isNewRegistration === 'true') {
        await ApiService.clearAuth();
        setIsCheckingAuth(false);
        return;
      }
      
      const token = await ApiService.getToken();
      const userJson = await Storage.getItem('currentUser');
      
      if (token && userJson) {
        const rememberedSessionActive = await ApiService.isRememberedSessionActive();
        if (!rememberedSessionActive) {
          const rememberedEmail = await Storage.getItem("rememberedEmail");
          await ApiService.clearAuth();
          if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
          }
          return;
        }

        let user;
        try {
          user = JSON.parse(userJson);
        } catch {
          await ApiService.clearAuth();
          setLoginError("Your saved session was invalid. Please sign in again.");
          return;
        }
        const normalizedRole = normalizeRole(user.role);
        if (!isRoleAllowedInCurrentVariant(normalizedRole)) {
          await ApiService.clearAuth();
          setLoginError(getVariantBlockedRoleMessage(normalizedRole));
          return;
        }
        const route = getDashboardRoute({ ...user, role: normalizedRole });
        navigation.reset({
          index: 0,
          routes: [{ name: IS_VISITOR_ONLY_APP ? "VisitorDashboard" : route }],
        });
      } else if (token || userJson) {
        await ApiService.clearAuth();
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // ============ VALIDATION ============
  const validateForm = () => {
    const newErrors = {};
    const normalizedIdentifier = normalizeLoginIdentifier(email);
    
    if (!normalizedIdentifier) {
      newErrors.email = "Username or email is required";
    } else if (normalizedIdentifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailField = () => {
    const normalizedIdentifier = normalizeLoginIdentifier(email);
    const emailError = !normalizedIdentifier
      ? "Username or email is required"
      : normalizedIdentifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)
        ? "Please enter a valid email address"
        : "";
    setErrors((prev) => ({ ...prev, email: emailError }));
    return !emailError;
  };

  const validatePasswordField = () => {
    const passwordError = password.trim() ? "" : "Password is required";
    setErrors((prev) => ({ ...prev, password: passwordError }));
    return !passwordError;
  };

  // Clear login error when user starts typing
  const handleEmailChange = (text) => {
    setEmail(text.replace(/^\s+/, ""));
    setLoginError("");
    setLoginSuccessMessage("");
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setLoginError("");
    setLoginSuccessMessage("");
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  const persistAuthenticatedSession = async ({ token, user, rememberEmail }) => {
    const normalizedUser = {
      ...user,
      role: normalizeRole(user?.role) || "visitor",
    };

    if (token) {
      await ApiService.setToken(token);
    }

    await Storage.setItem("currentUser", JSON.stringify(normalizedUser));

    if (rememberEmail) {
      await Storage.setItem("rememberedEmail", email.trim());
      await ApiService.rememberCurrentSession();
      await ApiService.trustDevice();
    } else {
      await Storage.removeItem("rememberedEmail");
      await ApiService.clearRememberedSession();
      await ApiService.clearTrustedDevice();
    }

    await Storage.removeItem("isNewRegistration");
    return normalizedUser;
  };

  // ============ FORGOT PASSWORD VALIDATION ============
  const validateResetEmailField = () => {
    const normalizedResetEmail = normalizeResetEmailValue(resetEmail);

    if (!normalizedResetEmail) {
      setResetEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedResetEmail)) {
      setResetEmailError("Please enter a valid email address");
      return false;
    }
    setResetEmailError("");
    return true;
  };

  const validateResetOtpField = () => {
    const normalizedResetOtp = normalizeResetOtpValue(resetOtp);

    if (!normalizedResetOtp) {
      setResetOtpError("Verification code is required");
      return false;
    }
    if (normalizedResetOtp.length !== 6) {
      setResetOtpError("Code must be 6 digits");
      return false;
    }
    setResetOtpError("");
    return true;
  };

  const validateNewPasswordField = () => {
    if (!newPassword) {
      setNewPasswordError("Password is required");
      return false;
    }
    if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setNewPasswordError("Must contain at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setNewPasswordError("Must contain at least one lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setNewPasswordError("Must contain at least one number");
      return false;
    }
    setNewPasswordError("");
    return true;
  };

  const validateConfirmPasswordField = () => {
    if (!confirmNewPassword) {
      setConfirmNewPasswordError("Please confirm your password");
      return false;
    }
    if (confirmNewPassword !== newPassword) {
      setConfirmNewPasswordError("Passwords do not match");
      return false;
    }
    setConfirmNewPasswordError("");
    return true;
  };

  // ============ PASSWORD STRENGTH VALIDATION ============
  const validatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    setPasswordChecks(checks);
    
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    return checks;
  };

  // ============ FORGOT PASSWORD FUNCTIONS ============
  const handleForgotPassword = () => {
    clearPasswordResetRouteParams();
    setLoginSuccessMessage("");
    setShowForgotPassword(true);
    setResetStep(1);
    setResetEmail("");
    setResetEmailError("");
    setResetOtp("");
    setResetOtpError("");
    setResetToken("");
    setNewPassword("");
    setNewPasswordError("");
    setConfirmNewPassword("");
    setConfirmNewPasswordError("");
    setResetTimer(60);
    setCanResendReset(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setPasswordStrength(0);
    setPasswordChecks({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });
  };

  const handleCloseForgotPassword = () => {
    clearPasswordResetRouteParams();
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail("");
    setResetEmailError("");
    setResetOtp("");
    setResetOtpError("");
    setResetToken("");
    setNewPassword("");
    setNewPasswordError("");
    setConfirmNewPassword("");
    setConfirmNewPasswordError("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleSendResetOtp = async () => {
    if (!validateResetEmailField()) return;

    const normalizedResetEmail = normalizeResetEmailValue(resetEmail);
    setResetEmail(normalizedResetEmail);
    setResetToken("");
    
    setIsLoading(true);
    try {
      const response = await ApiService.requestPasswordReset(normalizedResetEmail);
      
      if (response.success) {
        setResetStep(2);
        setResetTimer(60);
        setCanResendReset(false);
        Alert.alert(
          "Reset Email Sent",
          `A verification code and secure reset link have been sent to ${normalizedResetEmail}.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to send reset code");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!validateResetOtpField()) return;

    const normalizedResetEmail = normalizeResetEmailValue(resetEmail);
    const normalizedResetOtp = normalizeResetOtpValue(resetOtp);
    setResetEmail(normalizedResetEmail);
    setResetOtp(normalizedResetOtp);

    setIsLoading(true);
    try {
      const response = await ApiService.verifyPasswordResetOtp(
        normalizedResetEmail,
        normalizedResetOtp,
      );
      
      if (response.success) {
        setResetToken("");
        setResetStep(3);
        Alert.alert("Code Verified", "Please enter your new password.");
      } else {
        setResetOtpError("Invalid verification code");
        Alert.alert("Error", response.message || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      setResetOtpError("Verification failed");
      Alert.alert("Error", "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (canResendReset) {
      setResetTimer(60);
      setCanResendReset(false);
      setResetOtp("");
      setResetOtpError("");
      await handleSendResetOtp();
    } else {
      Alert.alert("Please Wait", `Please wait ${resetTimer} seconds before resending.`);
    }
  };

  const handleResetPassword = async () => {
    const isPasswordValid = validateNewPasswordField();
    const isConfirmValid = validateConfirmPasswordField();
    
    if (!isPasswordValid || !isConfirmValid) return;
    
    setIsLoading(true);
    try {
      const response = await ApiService.resetPassword(
        normalizeResetEmailValue(resetEmail),
        newPassword,
        resetToken,
      );
      
      if (response.success) {
        const normalizedResetEmail = normalizeResetEmailValue(resetEmail);
        clearPasswordResetRouteParams();
        setShowForgotPassword(false);
        setResetStep(1);
        setEmail(normalizedResetEmail);
        setPassword("");
        setResetEmail(normalizedResetEmail);
        setResetOtp("");
        setResetOtpError("");
        setResetToken("");
        setNewPassword("");
        setNewPasswordError("");
        setConfirmNewPassword("");
        setConfirmNewPasswordError("");
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
        setPasswordStrength(0);
        setPasswordChecks({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        });
        setLoginError("");
        setLoginSuccessMessage("Thank you. Your password has been changed. Please log in with your new password.");
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PASSWORD STRENGTH UI ============
  const getPasswordStrengthColor = () => {
    const colors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#0A3D91', '#0A3D91'];
    return colors[passwordStrength] || colors[0];
  };

  const getPasswordStrengthText = () => {
    const texts = ['Enter password', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return texts[passwordStrength] || texts[0];
  };

  const clearPasswordResetRouteParams = () => {
    if (typeof navigation?.setParams === "function") {
      navigation.setParams({
        resetEmail: undefined,
        resetToken: undefined,
      });
    }
  };

  // ============ LOGIN HANDLER - 2FA FOR EVERYONE ============
  const handleLogin = async () => {
    if (!validateForm()) return;
    if (!apiConnected) {
      Alert.alert(
        "Connection Error",
        "Cannot connect to server. Please check your connection.",
        [{ text: "Retry", onPress: checkAuthAndConnection }]
      );
      return;
    }

    setIsLoading(true);
    setLoginSplashMessage("Signing you in...");
    setLoginError("");
    setLoginSuccessMessage("");
    
    try {
      const normalizedIdentifier = normalizeLoginIdentifier(email);
      setEmail(normalizedIdentifier);
      const verifyResponse = await ApiService.verifyCredentials(normalizedIdentifier, password);
      
      if (verifyResponse.success) {
        setShowLoginSplash(true);
        const normalizedUser = {
          ...verifyResponse.user,
          role: normalizeRole(verifyResponse.user?.role) || "visitor",
        };

        if (!isRoleAllowedInCurrentVariant(normalizedUser.role)) {
          await ApiService.clearAuth();
          setLoginError(getVariantBlockedRoleMessage(normalizedUser.role));
          return;
        }

        if (normalizedUser.status === "pending" || verifyResponse.status === "pending") {
          await ApiService.clearAuth();
          setLoginError("Your account is pending approval. Please wait for admin approval.");
          return;
        }

        if (verifyResponse.requires2FA === false) {
          await persistAuthenticatedSession({
            token: verifyResponse.tempToken,
            user: normalizedUser,
            rememberEmail: rememberMe,
          });

          navigation.reset({
            index: 0,
            routes: [{ name: IS_VISITOR_ONLY_APP ? "VisitorDashboard" : getDashboardRoute(normalizedUser) }],
          });
          return;
        }

        navigation.navigate("Verification", {
          email: normalizedIdentifier,
          password: password,
          rememberMe: rememberMe,
          tempToken: verifyResponse.tempToken,
          user: normalizedUser
        });
      }
    } catch (error) {
      const errorMessage = String(error?.message || "");
      
      if (
        errorMessage.includes("not yet verified") ||
        errorMessage.includes("verify your email") ||
        errorMessage.toLowerCase().includes("otp")
      ) {
        setLoginError("Your account is not yet verified. Please verify your account using OTP first.");
      } else if (errorMessage.includes("pending")) {
        setLoginError("Your account is pending approval. Please wait for admin approval.");
      } else if (errorMessage.includes("Invalid email") || errorMessage.includes("password")) {
        setLoginError("Incorrect email or password. Please try again.");
      } else if (errorMessage.includes("Network request failed")) {
        setLoginError("Cannot connect to server. Please check your connection.");
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } finally {
      setShowLoginSplash(false);
      setIsLoading(false);
    }
  };

  const getRoleConfig = () => {
    switch (effectiveRole) {
      case "visitor":
        return {
          label: "Visitor Access",
          title: "Continue Your Visit Journey",
          subtitle: "Track approvals, manage appointments, and keep your Sapphire visit details in one secure place.",
          icon: "person-outline",
          accent: "#0A3D91",
          panel: "Visitor Coordination",
        };
      case "security":
      case "guard":
        return {
          label: "Security Access",
          title: "Checkpoint Team Sign-In",
          subtitle: "Enter the secure operations workspace for approvals, arrival monitoring, and access validation.",
          icon: "shield-checkmark-outline",
          accent: "#0A3D91",
          panel: "Operations Console",
        };
      case "staff":
        return {
          label: "Staff Access",
          title: "Appointment Desk Sign-In",
          subtitle: "Review visitor appointments, adjust schedules, and respond to requests from the staff dashboard.",
          icon: "briefcase-outline",
          accent: "#0A3D91",
          panel: "Staff Coordination",
        };
      case "admin":
        return {
          label: "Administrative Access",
          title: "Command and Oversight Login",
          subtitle: "Open the administrative control center for user review, access supervision, and reporting.",
          icon: "settings-outline",
          accent: "#1C6DD0",
          panel: "Admin Control",
        };
      default:
        return {
          label: "System Access",
          title: "Welcome Back",
          subtitle: "Sign in to continue with your secure SafePass workflow.",
          icon: "log-in-outline",
          accent: "#0A3D91",
          panel: "Secure Entry",
        };
    }
  };

  // ============ WEB KEYBOARD NAVIGATION ============
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const openExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Link Unavailable", "This link could not be opened on your device.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Link Error", "Unable to open the school link right now.");
    }
  };

  // ============ SPLASH SCREEN ============
  if (isCheckingAuth) {
    return (
      <View style={loginStyles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1A2A6C" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={loginStyles.splashText}>Loading...</Text>
      </View>
    );
  }

  const roleConfig = getRoleConfig();
  const showVisitorRegisterEntry =
    IS_VISITOR_ONLY_APP || normalizeRole(effectiveRole) === "visitor";
  const resetStepTitle =
    resetStep === 1
      ? "Reset Password"
      : resetStep === 2
        ? "Verify Code"
        : "Create New Password";
  const resetStepSubtitle =
    resetStep === 1
      ? "Use your school email so we can send a password reset code and secure link."
      : resetStep === 2
        ? "Enter the verification code from your inbox to continue."
        : resetToken
          ? "Create a new password from your secure reset link."
          : "Create a new password that matches the same Secure Login standards.";

  return (
    <SafeAreaView style={loginStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2A6C" />
      
      <KeyboardAvoidingView
        style={loginStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView 
            contentContainerStyle={loginStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header with Logo */}
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <View style={[loginStyles.header, headerResponsiveStyle]}>
                <View style={loginStyles.headerGlowOne} />
                <View style={loginStyles.headerGlowTwo} />
                <View style={loginStyles.headerContent}>
                  <View style={loginStyles.brandBadge}>
                    <Image
                      source={Logo}
                      style={loginStyles.brandBadgeLogo}
                      resizeMode="contain"
                    />
                    <View style={loginStyles.brandBadgeTextWrap}>
                      <Text style={loginStyles.brandBadgeEyebrow}>Secure Login Portal</Text>
                      <Text style={loginStyles.brandBadgeTitle}>SafePass Command Center</Text>
                    </View>
                  </View>

                  <Image 
                    source={Logo} 
                    style={[loginStyles.logoImage, logoResponsiveStyle]}
                    resizeMode="contain"
                  />
                  <Text style={[loginStyles.appName, appNameResponsiveStyle]}>
                    Sapphire International{"\n"}Aviation Academy
                  </Text>
                  <Text style={loginStyles.headerTagline}>
                    Secure campus access and visitor sign-in
                  </Text>
                  <View style={loginStyles.flightAccent}>
                    <View style={loginStyles.flightAccentLine} />
                    <Ionicons name="airplane" size={13} color="rgba(255,255,255,0.92)" />
                    <View style={loginStyles.flightAccentDot} />
                  </View>
                  
                  {/* API Status Badge */}
                  <View style={[
                    loginStyles.statusBadge,
                    { backgroundColor: apiConnected ? '#10B981' : '#EF4444' }
                  ]}>
                    <View style={loginStyles.statusDot} />
                    <Text style={loginStyles.statusText}>
                      {apiConnected ? 'SYSTEM ONLINE' : 'SERVER OFFLINE'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Login Card */}
              <View style={[loginStyles.card, cardResponsiveStyle]}>
                {/* Back to Role Select */}
                {!IS_VISITOR_ONLY_APP && (
                  <TouchableOpacity
                    style={loginStyles.backToRoleButton}
                    onPress={() => navigation.navigate("RoleSelect")}
                    activeOpacity={0.7}
                    {...(isWeb && {
                      onKeyPress: (e) => handleKeyPress(e, () => navigation.navigate("RoleSelect")),
                      tabIndex: 0,
                    })}
                  >
                    <Ionicons name="arrow-back" size={20} color="#1A2A6C" />
                    <Text style={loginStyles.backToRoleText}>Change Role</Text>
                  </TouchableOpacity>
                )}

                <View style={[loginStyles.roleHero, roleHeroResponsiveStyle]}>
                  <View
                    style={[
                      loginStyles.roleIconWrap,
                      roleIconResponsiveStyle,
                      { backgroundColor: roleConfig.accent },
                    ]}
                  >
                    <Ionicons name={roleConfig.icon} size={22} color="#FFFFFF" />
                  </View>
                  <View style={loginStyles.roleHeroText}>
                    <Text style={loginStyles.roleEyebrow}>{roleConfig.label}</Text>
                    <Text style={loginStyles.rolePanel}>{roleConfig.panel}</Text>
                  </View>
                </View>

                <Text style={[loginStyles.welcomeTitle, welcomeTitleResponsiveStyle]}>
                  {roleConfig.title}
                </Text>
                <Text style={[loginStyles.welcomeSubtitle, welcomeSubtitleResponsiveStyle]}>
                  {roleConfig.subtitle}
                </Text>

                {/* STANDARD LOGIN FORM */}
                <>
                  {/* Username / Email Input */}
                  <View style={loginStyles.inputBox}>
                    <Text style={loginStyles.label}>Username / Email</Text>
                    <View style={[
                      loginStyles.inputContainer,
                      errors.email && loginStyles.inputError
                    ]}>
                      <Ionicons name="person-outline" size={20} color="#6B7280" />
                      <TextInput
                        ref={emailInputRef}
                        style={loginStyles.input}
                        placeholder="Enter username or email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={handleEmailChange}
                        onBlur={() => {
                          const normalizedIdentifier = normalizeLoginIdentifier(email);
                          setEmail(normalizedIdentifier);
                          validateEmailField();
                        }}
                        keyboardType="default"
                        autoCapitalize="none"
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                      />
                    </View>
                    {errors.email && (
                      <Text style={loginStyles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {loginSuccessMessage ? (
                    <Text style={loginStyles.loginSuccessText}>
                      {loginSuccessMessage}
                    </Text>
                  ) : null}

                  {/* Password Input with Error Message Below */}
                  <View style={loginStyles.inputBox}>
                    <Text style={loginStyles.label}>Password</Text>
                    <View style={[
                      loginStyles.inputContainer,
                      (errors.password || loginError) && loginStyles.inputError
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                      <TextInput
                        ref={passwordInputRef}
                        style={loginStyles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={handlePasswordChange}
                        onBlur={validatePasswordField}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#6B7280" 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={loginStyles.errorText}>{errors.password}</Text>
                    )}
                    {loginError && !errors.password && (
                      <Text style={[loginStyles.errorText, loginStyles.loginErrorText]}>
                        {loginError}
                      </Text>
                    )}
                  </View>

                  {/* Remember Me & Forgot Password */}
                  <View style={[loginStyles.row, authRowResponsiveStyle]}>
                    <TouchableOpacity 
                      style={loginStyles.rememberBox}
                      onPress={() => setRememberMe(!rememberMe)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        loginStyles.checkbox,
                        rememberMe && loginStyles.checkboxChecked
                      ]}>
                        {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={loginStyles.rememberText}>Remember me</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text style={loginStyles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    ref={loginButtonRef}
                    style={[
                      loginStyles.loginButton,
                      (!apiConnected || isLoading) && loginStyles.buttonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={!apiConnected || isLoading}
                    activeOpacity={0.8}
                    {...(isWeb && {
                      onKeyPress: (e) => handleKeyPress(e, handleLogin),
                      tabIndex: 0,
                    })}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                        <Text style={loginStyles.loginButtonText}>
                          {apiConnected ? 'SIGN IN' : 'SERVER OFFLINE'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* 2FA Info */}
                  <View style={loginStyles.twoFactorInfo}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#1A2A6C" />
                    <Text style={loginStyles.twoFactorText}>
                      Secure login with 2-factor authentication
                    </Text>
                  </View>

                  {showVisitorRegisterEntry ? (
                    <View
                      style={{
                        marginBottom: 16,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#DDE7F3",
                        backgroundColor: "#F8FBFE",
                        paddingHorizontal: isCompactLogin ? 14 : 16,
                        paddingVertical: isCompactLogin ? 14 : 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#0F172A",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                      >
                        New Visitor?
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          lineHeight: 19,
                          color: "#64748B",
                          textAlign: "center",
                          marginBottom: 12,
                        }}
                      >
                        Create your visitor account here in the app before signing in.
                      </Text>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: "#B7D5F6",
                          backgroundColor: "#EEF5FF",
                          borderRadius: 8,
                          paddingVertical: 13,
                          paddingHorizontal: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                        onPress={() => navigation.navigate("VisitorRegister")}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="person-add-outline" size={18} color="#0A3D91" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#0A3D91",
                          }}
                        >
                          Create Account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>

                {/* Server Info - Only when offline */}
                {!apiConnected && (
                  <View style={loginStyles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#EF4444" />
                    <Text style={loginStyles.infoText}>
                      Unable to connect to server. Please check your connection.
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer */}
              <View style={[loginStyles.footer, footerResponsiveStyle]}>
                <Text style={loginStyles.footerText}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date().toLocaleDateString()}
                </Text>
                <Text style={loginStyles.footerText}>Secure Campus Access System v2.0</Text>
                <View style={[loginStyles.footerContactCard, footerContactCardResponsiveStyle]}>
                  <Text style={loginStyles.footerContactTitle}>
                    Sapphire International Aviation Academy
                  </Text>
                  <Text style={loginStyles.footerContactLine}>Tel No: (02) 7091 - 3362</Text>
                  <Text style={loginStyles.footerContactLine}>Mobile No: 0917 580 4858</Text>
                  <View style={[loginStyles.footerLinkRow, footerLinkRowResponsiveStyle]}>
                    <TouchableOpacity
                      style={[loginStyles.footerLinkChip, footerLinkChipResponsiveStyle]}
                      onPress={() => openExternalLink("https://sapphireaviationacademy.edu.ph/")}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="globe-outline" size={14} color="#0A3D91" />
                      <Text style={loginStyles.footerLinkText}>Website</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[loginStyles.footerLinkChip, footerLinkChipResponsiveStyle]}
                      onPress={() => openExternalLink("https://www.facebook.com/sapphireaviationacademy/")}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="logo-facebook" size={14} color="#0A3D91" />
                      <Text style={loginStyles.footerLinkText}>Facebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[loginStyles.footerLinkChip, footerLinkChipResponsiveStyle]}
                      onPress={() => openExternalLink("https://www.youtube.com/@sapphireaviation5105")}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="logo-youtube" size={14} color="#0A3D91" />
                      <Text style={loginStyles.footerLinkText}>YouTube</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={loginStyles.footerCopyright}>
                    Copyright 2024. Sapphire International Aviation Academy
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>

        {/* FORGOT PASSWORD MODAL */}
        <Modal
          visible={showForgotPassword}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseForgotPassword}
        >
          <View style={loginStyles.modalOverlay}>
            <View style={[loginStyles.modalContent, forgotModalContentResponsiveStyle]}>
              <View style={[loginStyles.modalHero, forgotModalHeroResponsiveStyle]}>
                <View style={[loginStyles.modalHeroTopRow, forgotModalHeroTopRowResponsiveStyle]}>
                  <View style={[loginStyles.modalBrandBadge, forgotModalBrandBadgeResponsiveStyle]}>
                    <Image
                      source={Logo}
                      style={loginStyles.modalBrandBadgeLogo}
                      resizeMode="contain"
                    />
                    <View style={loginStyles.modalBrandBadgeTextWrap}>
                      <Text style={loginStyles.modalBrandBadgeEyebrow}>Account Recovery</Text>
                      <Text style={loginStyles.modalBrandBadgeTitle}>Sapphire SafePass</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={loginStyles.modalCloseButton}
                    onPress={handleCloseForgotPassword}
                  >
                    <Ionicons name="close" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={loginStyles.modalHeroContent}>
                  <View style={loginStyles.modalHeroIcon}>
                    <Ionicons name="lock-open-outline" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={loginStyles.modalTitle}>{resetStepTitle}</Text>
                  <Text style={loginStyles.modalSubtitle}>{resetStepSubtitle}</Text>
                </View>

                <View style={[loginStyles.modalStepRow, forgotModalStepRowResponsiveStyle]}>
                  {[1, 2, 3].map((stepNumber) => {
                    const isActive = resetStep === stepNumber;
                    const isComplete = resetStep > stepNumber;
                    return (
                      <View
                        key={stepNumber}
                        style={[
                          loginStyles.modalStepChip,
                          isActive && loginStyles.modalStepChipActive,
                          isComplete && loginStyles.modalStepChipComplete,
                        ]}
                      >
                        <Text
                          style={[
                            loginStyles.modalStepChipText,
                            (isActive || isComplete) && loginStyles.modalStepChipTextActive,
                          ]}
                        >
                          {stepNumber === 1 ? "Email" : stepNumber === 2 ? "Code" : "Password"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <ScrollView
                style={loginStyles.modalBody}
                contentContainerStyle={[loginStyles.modalBodyContent, forgotModalBodyContentResponsiveStyle]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                {resetStep === 1 && (
                  <>
                    <View style={loginStyles.inputBox}>
                      <Text style={loginStyles.label}>Email Address</Text>
                      <View style={[
                        loginStyles.inputContainer,
                        resetEmailError ? loginStyles.inputError : null
                      ]}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" />
                        <TextInput
                          style={loginStyles.input}
                          placeholder="your.email@sapphireaviationacademy.edu.ph"
                          placeholderTextColor="#9CA3AF"
                          value={resetEmail}
                          onChangeText={(text) => {
                            setResetEmail(text.replace(/\s+/g, ""));
                            setResetEmailError("");
                          }}
                          onBlur={() => {
                            setResetEmail(normalizeResetEmailValue(resetEmail));
                            validateResetEmailField();
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isLoading}
                        />
                      </View>
                      {resetEmailError ? (
                        <Text style={loginStyles.errorText}>{resetEmailError}</Text>
                      ) : (
                        <Text style={loginStyles.helperText}>
                          We&apos;ll send a verification code and reset link to this email
                        </Text>
                      )}
                    </View>

                    <View style={loginStyles.modalInfoCard}>
                      <Ionicons name="mail-unread-outline" size={18} color="#0A3D91" />
                      <Text style={loginStyles.modalInfoText}>
                        Use the email linked to your SafePass account. We will send a 6-digit verification code and a secure reset link.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        loginStyles.otpButton,
                        isLoading && loginStyles.buttonDisabled
                      ]}
                      onPress={handleSendResetOtp}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                          <Text style={loginStyles.otpButtonText}>Send Reset Code</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {resetStep === 2 && (
                  <>
                    <View style={loginStyles.modalInfoCard}>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#0A3D91" />
                      <Text style={loginStyles.modalInfoText}>
                        Enter the 6-digit verification code sent to the email below.
                      </Text>
                    </View>
                    <Text style={loginStyles.modalPhone}>{resetEmail}</Text>

                    <View style={loginStyles.inputBox}>
                      <View style={[
                        loginStyles.inputContainer,
                        resetOtpError ? loginStyles.inputError : null
                      ]}>
                        <Ionicons name="key-outline" size={20} color="#6B7280" />
                        <TextInput
                          style={loginStyles.input}
                          placeholder="000000"
                          placeholderTextColor="#9CA3AF"
                          value={resetOtp}
                          onChangeText={(text) => {
                            const numericValue = normalizeResetOtpValue(text);
                            setResetOtp(numericValue);
                            setResetOtpError("");
                          }}
                          onBlur={() => {}}
                          keyboardType="numeric"
                          maxLength={6}
                          autoFocus={!isWeb}
                          editable={!isLoading}
                        />
                      </View>
                      {resetOtpError ? (
                        <Text style={loginStyles.errorText}>{resetOtpError}</Text>
                      ) : (
                        <Text style={loginStyles.helperText}>
                          The code will be checked after you press Verify Code.
                        </Text>
                      )}
                    </View>

                    <View style={loginStyles.timerContainer}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={loginStyles.timerText}>
                        {canResendReset ? 'Code expired' : `Resend in ${resetTimer}s`}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        loginStyles.otpVerifyButton,
                        isLoading && loginStyles.buttonDisabled
                      ]}
                      onPress={handleVerifyResetOtp}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={loginStyles.otpVerifyText}>Verify Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        loginStyles.otpResendButton,
                        (!canResendReset || isLoading) && loginStyles.buttonDisabled,
                        { marginTop: 12 }
                      ]}
                      onPress={handleResendResetOtp}
                      disabled={!canResendReset || isLoading}
                      activeOpacity={0.8}
                    >
                      <Text style={loginStyles.otpResendText}>Resend Code</Text>
                    </TouchableOpacity>
                  </>
                )}

                {resetStep === 3 && (
                  <>
                    <View style={loginStyles.modalInfoCard}>
                      <Ionicons name="keypad-outline" size={18} color="#0A3D91" />
                      <Text style={loginStyles.modalInfoText}>
                        {resetToken
                          ? "Create a strong new password from your secure reset link, then confirm it before returning to login."
                          : "Create a strong new password, then confirm it before returning to login."}
                      </Text>
                    </View>

                    <View style={loginStyles.passwordRequirements}>
                      <Text style={loginStyles.requirementsTitle}>Password must contain:</Text>
                      <View style={loginStyles.requirementItem}>
                        <Ionicons 
                          name={passwordChecks.length ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={passwordChecks.length ? "#10B981" : "#9CA3AF"} 
                        />
                        <Text style={[loginStyles.requirementText, passwordChecks.length && loginStyles.requirementMet]}>
                          At least 8 characters
                        </Text>
                      </View>
                      <View style={loginStyles.requirementItem}>
                        <Ionicons 
                          name={passwordChecks.uppercase ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={passwordChecks.uppercase ? "#10B981" : "#9CA3AF"} 
                        />
                        <Text style={[loginStyles.requirementText, passwordChecks.uppercase && loginStyles.requirementMet]}>
                          One uppercase letter
                        </Text>
                      </View>
                      <View style={loginStyles.requirementItem}>
                        <Ionicons 
                          name={passwordChecks.lowercase ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={passwordChecks.lowercase ? "#10B981" : "#9CA3AF"} 
                        />
                        <Text style={[loginStyles.requirementText, passwordChecks.lowercase && loginStyles.requirementMet]}>
                          One lowercase letter
                        </Text>
                      </View>
                      <View style={loginStyles.requirementItem}>
                        <Ionicons 
                          name={passwordChecks.number ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={passwordChecks.number ? "#10B981" : "#9CA3AF"} 
                        />
                        <Text style={[loginStyles.requirementText, passwordChecks.number && loginStyles.requirementMet]}>
                          One number
                        </Text>
                      </View>
                    </View>

                    <View style={loginStyles.inputBox}>
                      <Text style={loginStyles.label}>New Password</Text>
                      <View style={[
                        loginStyles.inputContainer,
                        newPasswordError ? loginStyles.inputError : null
                      ]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                        <TextInput
                          style={loginStyles.input}
                          placeholder="Enter new password"
                          placeholderTextColor="#9CA3AF"
                          value={newPassword}
                          onChangeText={(text) => {
                            setNewPassword(text);
                            setNewPasswordError("");
                            validatePasswordStrength(text);
                            if (confirmNewPassword) {
                              setConfirmNewPasswordError(
                                confirmNewPassword === text ? "" : "Passwords do not match",
                              );
                            }
                          }}
                          onBlur={validateNewPasswordField}
                          secureTextEntry={!showNewPassword}
                          editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                          <Ionicons 
                            name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color="#6B7280" 
                          />
                        </TouchableOpacity>
                      </View>
                      {newPasswordError ? (
                        <Text style={loginStyles.errorText}>{newPasswordError}</Text>
                      ) : (
                        newPassword.length > 0 && (
                          <View style={loginStyles.passwordStrengthContainer}>
                            <View style={loginStyles.passwordStrengthBar}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <View
                                  key={level}
                                  style={[
                                    loginStyles.passwordStrengthSegment,
                                    { backgroundColor: level <= passwordStrength ? getPasswordStrengthColor() : '#E5E7EB' }
                                  ]}
                                />
                              ))}
                            </View>
                            <Text style={[loginStyles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
                              {getPasswordStrengthText()}
                            </Text>
                          </View>
                        )
                      )}
                    </View>

                    <View style={loginStyles.inputBox}>
                      <Text style={loginStyles.label}>Confirm Password</Text>
                      <View style={[
                        loginStyles.inputContainer,
                        confirmNewPasswordError ? loginStyles.inputError : null
                      ]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                        <TextInput
                          style={loginStyles.input}
                          placeholder="Confirm new password"
                          placeholderTextColor="#9CA3AF"
                          value={confirmNewPassword}
                          onChangeText={(text) => {
                            setConfirmNewPassword(text);
                            setConfirmNewPasswordError("");
                          }}
                          onBlur={validateConfirmPasswordField}
                          secureTextEntry={!showConfirmNewPassword}
                          editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                          <Ionicons 
                            name={showConfirmNewPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color="#6B7280" 
                          />
                        </TouchableOpacity>
                      </View>
                      {confirmNewPasswordError && (
                        <Text style={loginStyles.errorText}>{confirmNewPasswordError}</Text>
                      )}
                    </View>

                    {newPassword && confirmNewPassword && !newPasswordError && !confirmNewPasswordError && (
                      <View style={loginStyles.passwordMatchContainer}>
                        <Ionicons 
                          name={newPassword === confirmNewPassword ? "checkmark-circle" : "close-circle"} 
                          size={16} 
                          color={newPassword === confirmNewPassword ? "#10B981" : "#EF4444"} 
                        />
                        <Text style={[
                          loginStyles.passwordMatchText,
                          { color: newPassword === confirmNewPassword ? "#10B981" : "#EF4444" }
                        ]}>
                          {newPassword === confirmNewPassword ? "Passwords match" : "Passwords do not match"}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        loginStyles.otpVerifyButton,
                        (isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) && 
                        loginStyles.buttonDisabled
                      ]}
                      onPress={handleResetPassword}
                      disabled={isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={loginStyles.otpVerifyText}>Reset Password</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={loginStyles.backLink}
                  onPress={() => {
                    if (resetStep === 1) {
                      handleCloseForgotPassword();
                    } else {
                      if (resetStep === 2) {
                        setResetOtp("");
                        setResetOtpError("");
                      }
                      if (resetStep === 3) {
                        setNewPassword("");
                        setNewPasswordError("");
                        setConfirmNewPassword("");
                        setConfirmNewPasswordError("");
                        setShowNewPassword(false);
                        setShowConfirmNewPassword(false);
                        setPasswordStrength(0);
                        setPasswordChecks({
                          length: false,
                          uppercase: false,
                          lowercase: false,
                          number: false,
                          special: false,
                        });
                      }
                      setResetStep(resetStep - 1);  
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color="#6B7280" />
                  <Text style={loginStyles.backLinkText}>
                    {resetStep === 1 ? 'Back to Login' : 'Back'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>

      <Modal
        visible={showLoginSplash}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={loginStyles.loginSplashOverlay}>
          <View style={loginStyles.loginSplashCard}>
            <View style={loginStyles.loginSplashLogoRing}>
              <Image
                source={Logo}
                style={loginStyles.loginSplashLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={loginStyles.loginSplashTitle}>Welcome Back</Text>
            <Text style={loginStyles.loginSplashMessage}>{loginSplashMessage}</Text>
            <View style={loginStyles.loginSplashLoadingRow}>
              <ActivityIndicator size="small" color="#0A3D91" />
              <Text style={loginStyles.loginSplashLoadingText}>
                Securing your account access...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

