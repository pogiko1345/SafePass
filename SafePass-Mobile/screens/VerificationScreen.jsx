// VerificationScreen.jsx - COMPLETELY FIXED with proper AsyncStorage
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from "../utils/ApiService";
import { getDashboardRoute, normalizeRole } from "../utils/authFlow";
import {
  IS_VISITOR_ONLY_APP,
  getVariantBlockedRoleMessage,
  isRoleAllowedInCurrentVariant,
} from "../utils/appVariant";
import verificationStyles from "../styles/VerificationStyles";
import Logo from "../assets/LogoSapphire.jpg";

const Storage = Platform.OS === "web"
  ? require("../utils/webStorage").default
  : require("@react-native-async-storage/async-storage").default;

// Helper function to safely store data
const storeData = async (key, value) => {
  try {
    if (!Storage || typeof Storage.setItem !== 'function') {
      console.error("Storage is not available");
      // Fallback for web - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
      return false;
    }
    await Storage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return false;
  }
};

const getData = async (key) => {
  try {
    if (!Storage || typeof Storage.getItem !== 'function') {
      console.error("Storage is not available");
      // Fallback for web - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await Storage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

export default function VerificationScreen({ navigation, route }) {
  // Properly extract params with defaults
  const { email, password, rememberMe, tempToken, user: userData } = route.params || {};
  const { width: viewportWidth } = useWindowDimensions();
  const isDesktopLayout = viewportWidth >= 1100;
  const isTabletLayout = viewportWidth >= 768;
  const isCompactWidth = viewportWidth <= 520;
  const isPhoneWidth = viewportWidth <= 420;
  
  console.log("📱 VerificationScreen mounted with:", { email, hasTempToken: !!tempToken, userRole: userData?.role });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpMethod, setOtpMethod] = useState('sms');
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");

  // Animations on mount
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!userData?.phone) return;

    let cleanPhone = String(userData.phone).replace(/[^\d]/g, "");
    if (cleanPhone.startsWith("63")) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
    setPhoneNumber(cleanPhone.slice(0, 10));
  }, [userData?.phone]);

  // Timer for OTP
  useEffect(() => {
    let interval;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const validatePhoneNumber = () => {
    setPhoneError("");
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      return false;
    }
    
    const cleanPhone = phoneNumber.replace(/[\s\.\-]/g, '');
    const philippinePatterns = [
      /^09\d{9}$/,
      /^639\d{9}$/,
      /^9\d{9}$/,
    ];
    
    const isValid = philippinePatterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValid) {
      setPhoneError("Enter a valid Philippine mobile number (e.g., 09123456789)");
      return false;
    }
    return true;
  };

  const requestOtp = async () => {
    if (!validatePhoneNumber()) return;
    
    setIsLoading(true);
    try {
      let cleanPhone = phoneNumber.replace(/[\s\.\-]/g, '');
      
      if (cleanPhone.startsWith('63')) {
        cleanPhone = '0' + cleanPhone.slice(2);
      } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
        cleanPhone = '0' + cleanPhone;
      }
      
      if (!cleanPhone.startsWith('09')) {
        cleanPhone = '09' + cleanPhone.slice(-9);
      }
      
      const response = await ApiService.requestOtp(cleanPhone, otpMethod);
      
      if (response.success) {
        setOtpSent(true);
        setShowPhoneInput(false);
        setOtpTimer(60);
        setCanResend(false);
        
        Alert.alert(
          "📱 Verification Code Sent",
          `A 6-digit code has been sent to ${cleanPhone}\n\nCheck your terminal/console for the OTP code.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("OTP request error:", error);
      Alert.alert("Error", "Unable to send verification code. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text) => {
    setOtpError("");
    const numericValue = text.replace(/[^0-9]/g, '');
    setOtpCode(numericValue);
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      let cleanPhone = phoneNumber.replace(/[\s\.\-]/g, '');
      
      if (cleanPhone.startsWith('63')) {
        cleanPhone = '0' + cleanPhone.slice(2);
      } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
        cleanPhone = '0' + cleanPhone;
      }
      
      if (!cleanPhone.startsWith('09')) {
        cleanPhone = '09' + cleanPhone.slice(-9);
      }
      
      const response = await ApiService.verifyOtp(cleanPhone, otpCode, tempToken);
      
      if (response.success) {
        setOtpVerified(true);
        await completeLogin(response);
      } else {
        setOtpError(response.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = () => {
    if (canResend) {
      setOtpTimer(60);
      setCanResend(false);
      setOtpCode("");
      setOtpError("");
      requestOtp();
    }
  };

  // FIXED: Complete login with safe storage
  const completeLogin = async (verificationResponse) => {
    try {
      setIsLoading(true);
      
      // Use the user data from the verification response or from route params
      let finalUser = verificationResponse?.user || userData;
      
      if (!finalUser) {
        console.error("No user data available");
        Alert.alert("Error", "Unable to complete login. Please try again.");
        return;
      }
      
      console.log("💾 Storing user data:", finalUser.email, "Role:", finalUser.role);
      
      // Reuse the token returned during credential verification to avoid a second login request.
      let sessionToken = verificationResponse?.token || tempToken || null;
      if (!sessionToken && email && password) {
        const loginResponse = await ApiService.login(email, password);
        sessionToken = loginResponse?.token || null;
        if (loginResponse?.user) {
          finalUser = loginResponse.user;
        }
      }
      if (sessionToken) {
        await ApiService.setToken(sessionToken);
        console.log("✅ Auth token stored");
      } else if (tempToken) {
        await ApiService.setToken(tempToken);
        console.log("⚠️ Using temporary token fallback");
      }
      
      const userRole = normalizeRole(finalUser.role) || "visitor";

      if (!isRoleAllowedInCurrentVariant(userRole)) {
        await ApiService.clearAuth();
        await Storage.removeItem("currentUser");
        Alert.alert("Visitor App Only", getVariantBlockedRoleMessage(userRole), [
          {
            text: "Back to Login",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              }),
          },
        ]);
        return;
      }

      // Store user data
      await storeData("currentUser", JSON.stringify({ ...finalUser, role: userRole }));
      console.log("✅ User data stored");
      
      // Treat remember-me as a trusted device so future logins can follow the faster path.
      if (rememberMe && email) {
        await storeData("rememberedEmail", email);
        await ApiService.trustDevice();
        console.log("✅ Remembered email stored");
      } else if (email) {
        await Storage.removeItem("rememberedEmail");
      }
      
      // Clear new registration flag
      await Storage.removeItem("isNewRegistration");
      
      const dashboardRoute = IS_VISITOR_ONLY_APP ? "VisitorDashboard" : getDashboardRoute(userRole);
      
      console.log('✅ Verification complete - Navigating to:', dashboardRoute, 'Role:', userRole);
      
      // Small delay to ensure storage is complete
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: dashboardRoute }],
        });
      }, 500);
    } catch (error) {
      console.error("Complete login error:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangeMethod = () => {
    setShowPhoneInput(true);
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
    setPhoneError("");
    setPhoneNumber("");
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    const clean = phone.replace(/[\s\.\-]/g, '');
    if (clean.length >= 10) {
      return clean.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  return (
    <SafeAreaView style={verificationStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D91" />
      
      <KeyboardAvoidingView
        style={verificationStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={verificationStyles.backgroundOrbTop} />
        <View style={verificationStyles.backgroundOrbBottom} />
        <ScrollView
          style={verificationStyles.scrollView}
          contentContainerStyle={verificationStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[verificationStyles.animatedContainer, { opacity: fadeAnim }]}>
            <View
              style={[
                verificationStyles.pageShell,
                !isDesktopLayout && {
                  flexDirection: "column",
                  maxWidth: 760,
                  width: "100%",
                },
                isPhoneWidth && {
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                },
              ]}
            >
              <LinearGradient
                colors={['#041E42', '#0A3D91', '#1C6DD0']}
                style={[
                  verificationStyles.heroPanel,
                  !isDesktopLayout && {
                    width: "100%",
                    minHeight: undefined,
                  },
                  isCompactWidth && {
                    paddingHorizontal: 16,
                    paddingBottom: 22,
                  },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  style={verificationStyles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={verificationStyles.heroBadge}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#EEF5FF" />
                  <Text style={verificationStyles.heroBadgeText}>Two-Step Verification</Text>
                </View>

                <View
                  style={[
                    verificationStyles.headerContent,
                    !isDesktopLayout && { alignItems: "center" },
                    isDesktopLayout && { alignItems: "flex-start" },
                  ]}
                >
                  <View style={verificationStyles.iconContainer}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.08)']}
                      style={verificationStyles.iconGradient}
                    >
                      <Image
                        source={Logo}
                        style={verificationStyles.logoImage}
                        resizeMode="contain"
                      />
                    </LinearGradient>
                  </View>
                  <Text
                    style={[
                      verificationStyles.headerTitle,
                      isPhoneWidth && { fontSize: 24, lineHeight: 30 },
                    ]}
                  >
                    Verify Your Identity
                  </Text>
                  <Text
                    style={[
                      verificationStyles.headerSubtitle,
                      !isDesktopLayout && { textAlign: "center", paddingHorizontal: 6 },
                      isDesktopLayout && { textAlign: "left", paddingHorizontal: 0 },
                    ]}
                  >
                    Secure access to your SafePass account with a one-time verification code.
                  </Text>
                </View>

                <View
                  style={[
                    verificationStyles.heroMetaRow,
                    isCompactWidth && { flexDirection: "column", flexWrap: "nowrap" },
                  ]}
                >
                  <View
                    style={[
                      verificationStyles.heroMetaCard,
                      isCompactWidth && { width: "100%" },
                    ]}
                  >
                    <Text style={verificationStyles.heroMetaLabel}>Account</Text>
                    <Text style={verificationStyles.heroMetaValue}>{email || "User"}</Text>
                  </View>
                  <View
                    style={[
                      verificationStyles.heroMetaCard,
                      isCompactWidth && { width: "100%" },
                    ]}
                  >
                    <Text style={verificationStyles.heroMetaLabel}>Method</Text>
                    <Text style={verificationStyles.heroMetaValue}>
                      {otpSent ? (otpMethod === "sms" ? "SMS Code" : "Voice Call") : "Phone Setup"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <Animated.View
                style={[
                  verificationStyles.panelCard,
                  !isDesktopLayout && {
                    maxWidth: "100%",
                    width: "100%",
                  },
                  isPhoneWidth && {
                    padding: 16,
                    borderRadius: 28,
                  },
                  {
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                  },
                ]}
              >
                <View style={verificationStyles.progressRow}>
                  <View style={verificationStyles.progressStep}>
                    <View style={[verificationStyles.progressDot, verificationStyles.progressDotActive]}>
                      <Ionicons name="phone-portrait-outline" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={[verificationStyles.progressLabel, verificationStyles.progressLabelActive]}>
                      Setup
                    </Text>
                  </View>
                  <View style={[verificationStyles.progressLine, otpSent && verificationStyles.progressLineActive]} />
                  <View style={verificationStyles.progressStep}>
                    <View style={[verificationStyles.progressDot, otpSent && verificationStyles.progressDotActive]}>
                      <Ionicons name="key-outline" size={14} color={otpSent ? "#FFFFFF" : "#94A3B8"} />
                    </View>
                    <Text style={[verificationStyles.progressLabel, otpSent && verificationStyles.progressLabelActive]}>
                      Confirm
                    </Text>
                  </View>
                  <View style={[verificationStyles.progressLine, otpVerified && verificationStyles.progressLineActive]} />
                  <View style={verificationStyles.progressStep}>
                    <View style={[verificationStyles.progressDot, otpVerified && verificationStyles.progressDotActive]}>
                      <Ionicons name="checkmark-outline" size={14} color={otpVerified ? "#FFFFFF" : "#94A3B8"} />
                    </View>
                    <Text style={[verificationStyles.progressLabel, otpVerified && verificationStyles.progressLabelActive]}>
                      Access
                    </Text>
                  </View>
                </View>

                {!otpVerified && (
                  <>
                    <View style={verificationStyles.userInfoCard}>
                      <View style={verificationStyles.avatarContainer}>
                        <LinearGradient
                          colors={['#EEF5FF', '#D8E8FF']}
                          style={verificationStyles.avatarGradient}
                        >
                          <Ionicons name="person" size={28} color="#0A3D91" />
                        </LinearGradient>
                      </View>
                      <View style={verificationStyles.userInfoCopy}>
                        <Text style={verificationStyles.userEmail}>{email || "User"}</Text>
                        <Text style={verificationStyles.userMessage}>
                          We need a quick verification before opening your dashboard.
                        </Text>
                      </View>
                    </View>

                    {showPhoneInput ? (
                      <View style={verificationStyles.card}>
                        <View style={verificationStyles.panelHeader}>
                          <Text style={verificationStyles.sectionTitle}>Verify with Phone</Text>
                          <Text style={verificationStyles.sectionSubtitle}>
                            Choose how you want to receive your one-time access code.
                          </Text>
                        </View>

                        <View style={verificationStyles.inputGroup}>
                          <Text style={verificationStyles.label}>Mobile Number</Text>
                          <View style={[
                            verificationStyles.inputContainer,
                            phoneError && verificationStyles.inputError
                          ]}>
                            <View style={verificationStyles.countryCode}>
                              <Text style={verificationStyles.countryCodeText}>+63</Text>
                            </View>
                            <TextInput
                              style={verificationStyles.input}
                              placeholder="912 345 6789"
                              placeholderTextColor="#9CA3AF"
                              value={phoneNumber}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setPhoneNumber(cleaned);
                                setPhoneError("");
                              }}
                              keyboardType="phone-pad"
                              maxLength={10}
                              editable={!isLoading}
                            />
                          </View>
                          {phoneError ? (
                            <Text style={verificationStyles.errorText}>{phoneError}</Text>
                          ) : (
                            <Text style={verificationStyles.helperText}>
                              Enter your 10-digit mobile number to receive a secure OTP code.
                            </Text>
                          )}
                        </View>

                        <View style={verificationStyles.methodContainer}>
                          <Text style={verificationStyles.methodLabel}>Receive code via</Text>
                          <View
                            style={[
                              verificationStyles.methodButtons,
                              isCompactWidth && { flexDirection: "column" },
                            ]}
                          >
                            <TouchableOpacity
                              style={[
                                verificationStyles.methodButton,
                                otpMethod === 'sms' && verificationStyles.methodButtonActive
                              ]}
                              onPress={() => setOtpMethod('sms')}
                              activeOpacity={0.7}
                            >
                              <Ionicons 
                                name="chatbubble-outline" 
                                size={20} 
                                color={otpMethod === 'sms' ? '#FFFFFF' : '#6B7280'} 
                              />
                              <Text style={[
                                verificationStyles.methodButtonText,
                                otpMethod === 'sms' && verificationStyles.methodButtonTextActive
                              ]}>SMS</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[
                                verificationStyles.methodButton,
                                otpMethod === 'call' && verificationStyles.methodButtonActive
                              ]}
                              onPress={() => setOtpMethod('call')}
                              activeOpacity={0.7}
                            >
                              <Ionicons 
                                name="call-outline" 
                                size={20} 
                                color={otpMethod === 'call' ? '#FFFFFF' : '#6B7280'} 
                              />
                              <Text style={[
                                verificationStyles.methodButtonText,
                                otpMethod === 'call' && verificationStyles.methodButtonTextActive
                              ]}>Voice Call</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            verificationStyles.sendButton,
                            isLoading && verificationStyles.buttonDisabled
                          ]}
                          onPress={requestOtp}
                          disabled={isLoading}
                          activeOpacity={0.8}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                              <Text style={verificationStyles.sendButtonText}>Send Verification Code</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={verificationStyles.otpCard}>
                        <View style={verificationStyles.otpHeader}>
                          <LinearGradient
                            colors={['#EEF5FF', '#D8E8FF']}
                            style={verificationStyles.otpIconContainer}
                          >
                            <Ionicons name="key-outline" size={30} color="#0A3D91" />
                          </LinearGradient>
                          <Text style={verificationStyles.otpTitle}>Enter Verification Code</Text>
                          <Text style={verificationStyles.otpSubtitle}>
                            We sent a 6-digit code to
                          </Text>
                          <Text style={verificationStyles.phoneNumberDisplay}>
                            {formatPhoneDisplay(phoneNumber)}
                          </Text>
                        </View>

                        <View style={verificationStyles.otpInputContainer}>
                          <TextInput
                            style={[
                              verificationStyles.otpInput,
                              otpError && verificationStyles.otpInputError,
                              isCompactWidth && {
                                height: 62,
                                fontSize: 28,
                                letterSpacing: 6,
                                paddingHorizontal: 10,
                              },
                            ]}
                            placeholder="000000"
                            placeholderTextColor="#9CA3AF"
                            value={otpCode}
                            onChangeText={handleOtpChange}
                            keyboardType="numeric"
                            maxLength={6}
                            autoFocus={true}
                            editable={!isLoading}
                          />
                          {otpError && (
                            <Text style={verificationStyles.otpErrorText}>{otpError}</Text>
                          )}
                        </View>

                        <View style={verificationStyles.timerContainer}>
                          <Ionicons name="time-outline" size={16} color={canResend ? "#EF4444" : "#6B7280"} />
                          <Text style={[
                            verificationStyles.timerText,
                            canResend && verificationStyles.timerExpired
                          ]}>
                            {canResend ? 'Code expired' : `Resend code in ${formatTimer(otpTimer)}`}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            verificationStyles.verifyButton,
                            isLoading && verificationStyles.buttonDisabled
                          ]}
                          onPress={verifyOtp}
                          disabled={isLoading}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#041E42', '#0A3D91', '#1C6DD0']}
                            style={verificationStyles.verifyGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            {isLoading ? (
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <Text style={verificationStyles.verifyButtonText}>Verify & Continue</Text>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            verificationStyles.resendButton,
                            (!canResend || isLoading) && verificationStyles.buttonDisabled
                          ]}
                          onPress={resendOtp}
                          disabled={!canResend || isLoading}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="refresh-outline" size={18} color={canResend ? "#0A3D91" : "#9CA3AF"} />
                          <Text style={[
                            verificationStyles.resendButtonText,
                            canResend && verificationStyles.resendButtonTextActive
                          ]}>Resend Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={verificationStyles.changeMethodButton}
                          onPress={handleChangeMethod}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="arrow-back-outline" size={14} color="#6B7280" />
                          <Text style={verificationStyles.changeMethodText}>
                            Use a different phone number
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                <View style={verificationStyles.securityNote}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
                  <Text style={verificationStyles.securityNoteText}>
                    Your information is encrypted and verified securely.
                  </Text>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
