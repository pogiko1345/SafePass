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
  Dimensions,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import loginStyles from "../styles/LoginStyles";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";
import Logo from "../assets/LogoSapphire.jpg";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;

export default function LoginScreen({ navigation, route }) {
  // Get role from navigation params
  const { role } = route?.params || { role: 'visitor' };
  
  // ============ STATE MANAGEMENT ============
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ============ FORGOT PASSWORD STATES ============
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetOtpError, setResetOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetToken, setResetToken] = useState(null);
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
      
      const isNewRegistration = await AsyncStorage.getItem('isNewRegistration');
      
      if (isNewRegistration === 'true') {
        console.log("📝 New registration detected - clearing token");
        await AsyncStorage.multiRemove(['authToken', 'userToken', 'currentUser', 'isNewRegistration']);
        setIsCheckingAuth(false);
        return;
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('currentUser');
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        console.log("🔑 Auto-login detected for:", user.email);
        
        // Check if visitor is pending
        if (user.role === 'visitor' && user.status === 'pending') {
          console.log("Visitor pending - clearing token");
          await ApiService.clearAuth();
          setIsCheckingAuth(false);
          return;
        }
        
        const route = getInitialRoute(user);
        navigation.reset({
          index: 0,
          routes: [{ name: route }],
        });
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
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear login error when user starts typing
  const handleEmailChange = (text) => {
    setEmail(text);
    setLoginError("");
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setLoginError("");
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  // ============ FORGOT PASSWORD VALIDATION ============
  const validateResetEmailField = () => {
    if (!resetEmail.trim()) {
      setResetEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetEmailError("Please enter a valid email address");
      return false;
    }
    setResetEmailError("");
    return true;
  };

  const validateResetOtpField = () => {
    if (!resetOtp.trim()) {
      setResetOtpError("Verification code is required");
      return false;
    }
    if (resetOtp.length !== 6) {
      setResetOtpError("Code must be 6 digits");
      return false;
    }
    if (!/^\d+$/.test(resetOtp)) {
      setResetOtpError("Code must contain only numbers");
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
    setShowForgotPassword(true);
    setResetStep(1);
    setResetEmail("");
    setResetEmailError("");
    setResetOtp("");
    setResetOtpError("");
    setNewPassword("");
    setNewPasswordError("");
    setConfirmNewPassword("");
    setConfirmNewPasswordError("");
    setResetTimer(60);
    setCanResendReset(false);
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
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail("");
    setResetEmailError("");
    setResetOtp("");
    setResetOtpError("");
    setNewPassword("");
    setNewPasswordError("");
    setConfirmNewPassword("");
    setConfirmNewPasswordError("");
  };

  const handleSendResetOtp = async () => {
    if (!validateResetEmailField()) return;
    
    setIsLoading(true);
    try {
      const emailExists = await ApiService.checkEmailExists(resetEmail);
      
      if (!emailExists) {
        Alert.alert(
          "Email Not Found",
          "No account found with this email address.",
          [{ text: "OK", style: "cancel" }]
        );
        setIsLoading(false);
        return;
      }
      
      const response = await ApiService.requestPasswordReset(resetEmail);
      
      if (response.success) {
        setResetStep(2);
        setResetToken(response.resetToken);
        setResetTimer(60);
        setCanResendReset(false);
        Alert.alert(
          "✅ Reset Code Sent",
          `A 6-digit verification code has been sent to ${resetEmail}.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      Alert.alert("Error", "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!validateResetOtpField()) return;

    setIsLoading(true);
    try {
      const response = await ApiService.verifyPasswordResetOtp(resetEmail, resetOtp, resetToken);
      
      if (response.success) {
        setResetStep(3);
        Alert.alert("✅ Code Verified", "Please enter your new password.");
      } else {
        setResetOtpError("Invalid verification code");
        Alert.alert("Error", response.message || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
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
      const response = await ApiService.resetPassword(resetEmail, newPassword, resetToken);
      
      if (response.success) {
        Alert.alert(
          "✅ Password Reset Successful",
          "Your password has been changed successfully. Please login with your new password.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                setShowForgotPassword(false);
                setResetStep(1);
                setEmail(resetEmail);
                setPassword("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PASSWORD STRENGTH UI ============
  const getPasswordStrengthColor = () => {
    const colors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#059669', '#0A3D91'];
    return colors[passwordStrength] || colors[0];
  };

  const getPasswordStrengthText = () => {
    const texts = ['Enter password', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return texts[passwordStrength] || texts[0];
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
    setLoginError("");
    
    try {
      console.log('🔑 Attempting login for:', email);
      const verifyResponse = await ApiService.verifyCredentials(email, password);
      console.log('📥 Verify response:', verifyResponse);
      
      if (verifyResponse.success) {
        // Check if user is pending
        if (verifyResponse.user?.status === 'pending') {
          console.log('⏳ User account is pending');
          Alert.alert(
            "Account Pending Approval",
            "Your account is pending admin approval. You will receive an email once approved.",
            [{ text: "OK" }]
          );
          setIsLoading(false);
          return;
        }
        
        // 2FA for EVERYONE - always require verification
        navigation.navigate("Verification", {
          email: email,
          password: password,
          rememberMe: rememberMe,
          tempToken: verifyResponse.tempToken,
          user: verifyResponse.user
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("pending")) {
        setLoginError("Your account is pending approval. Please wait for admin approval.");
      } else if (error.message.includes("Invalid email") || error.message.includes("password")) {
        setLoginError("Incorrect email or password. Please try again.");
      } else if (error.message.includes("Network request failed")) {
        setLoginError("Cannot connect to server. Please check your connection.");
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialRoute = (user) => {
    switch(user?.role) {
      case 'security': 
        return "SecurityDashboard";
      case 'admin': 
        return "AdminDashboard";
      case 'visitor': 
        return "VisitorDashboard";
      default: 
        return "RoleSelect";
    }
  };

  // ============ WEB KEYBOARD NAVIGATION ============
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
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
              <View style={loginStyles.header}>
                <View style={loginStyles.headerContent}>
                  {/* Logo Image */}
                  <Image 
                    source={Logo} 
                    style={loginStyles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={loginStyles.appName}>
                    Sapphire International{"\n"}Aviation Academy
                  </Text>
                  
                  {/* API Status Badge */}
                  <View style={[
                    loginStyles.statusBadge,
                    { backgroundColor: apiConnected ? '#10B981' : '#EF4444' }
                  ]}>
                    <View style={loginStyles.statusDot} />
                    <Text style={loginStyles.statusText}>
                      {apiConnected ? '● SYSTEM ONLINE' : '● SERVER OFFLINE'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Login Card */}
              <View style={loginStyles.card}>
                {/* Back to Role Select */}
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

                <Text style={loginStyles.welcomeTitle}>Welcome Back</Text>
                <Text style={loginStyles.welcomeSubtitle}>
                  {role === 'visitor' ? 'Visitor Login' : 
                   role === 'security' ? 'Security Login' : 
                   role === 'admin' ? 'Admin Login' : 'System Access'}
                </Text>

                {/* STANDARD LOGIN FORM */}
                <>
                  {/* Email Input */}
                  <View style={loginStyles.inputBox}>
                    <Text style={loginStyles.label}>Email Address</Text>
                    <View style={[
                      loginStyles.inputContainer,
                      errors.email && loginStyles.inputError
                    ]}>
                      <Ionicons name="mail-outline" size={20} color="#6B7280" />
                      <TextInput
                        ref={emailInputRef}
                        style={loginStyles.input}
                        placeholder="your.email@sapphire.edu"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={handleEmailChange}
                        onBlur={() => validateForm()}
                        keyboardType="email-address"
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
                  <View style={loginStyles.row}>
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
              <View style={loginStyles.footer}>
                <Text style={loginStyles.footerText}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date().toLocaleDateString()}
                </Text>
                <Text style={loginStyles.footerText}>Secure Campus Access System v2.0</Text>
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
            <View style={loginStyles.modalContent}>
              <View style={loginStyles.modalHeader}>
                <Ionicons name="lock-open-outline" size={32} color="#1A2A6C" />
                <Text style={loginStyles.modalTitle}>
                  {resetStep === 1 ? 'Reset Password' : 
                   resetStep === 2 ? 'Verify Code' : 
                   'Create New Password'}
                </Text>
                <TouchableOpacity onPress={handleCloseForgotPassword}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {resetStep === 1 && (
                // STEP 1: Enter Email
                <>
                  <Text style={loginStyles.modalSubtitle}>
                    Enter your email to receive a password reset code.
                  </Text>

                  <View style={loginStyles.inputBox}>
                    <Text style={loginStyles.label}>Email Address</Text>
                    <View style={[
                      loginStyles.inputContainer,
                      resetEmailError ? loginStyles.inputError : null
                    ]}>
                      <Ionicons name="mail-outline" size={20} color="#6B7280" />
                      <TextInput
                        style={loginStyles.input}
                        placeholder="your.email@sapphire.edu"
                        placeholderTextColor="#9CA3AF"
                        value={resetEmail}
                        onChangeText={(text) => {
                          setResetEmail(text);
                          setResetEmailError("");
                        }}
                        onBlur={validateResetEmailField}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </View>
                    {resetEmailError ? (
                      <Text style={loginStyles.errorText}>{resetEmailError}</Text>
                    ) : (
                      <Text style={loginStyles.helperText}>
                        We'll send a verification code to this email
                      </Text>
                    )}
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
                // STEP 2: Enter OTP
                <>
                  <Text style={loginStyles.modalSubtitle}>
                    Enter the 6-digit verification code sent to
                  </Text>
                  <Text style={loginStyles.modalPhone}>
                    {resetEmail}
                  </Text>

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
                          const numericValue = text.replace(/[^0-9]/g, '');
                          setResetOtp(numericValue);
                          setResetOtpError("");
                        }}
                        onBlur={validateResetOtpField}
                        keyboardType="numeric"
                        maxLength={6}
                        autoFocus={!isWeb}
                        editable={!isLoading}
                      />
                    </View>
                    {resetOtpError && (
                      <Text style={loginStyles.errorText}>{resetOtpError}</Text>
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
                      (isLoading || resetOtp.length !== 6) && loginStyles.buttonDisabled
                    ]}
                    onPress={handleVerifyResetOtp}
                    disabled={isLoading || resetOtp.length !== 6}
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
                // STEP 3: New Password
                <>
                  <Text style={loginStyles.modalSubtitle}>
                    Create a strong password for your account.
                  </Text>

                  {/* Password Requirements */}
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

                  {/* New Password Input */}
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

                  {/* Confirm Password Input */}
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

                  {/* Password Match Indicator */}
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
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}