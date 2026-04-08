// VerificationScreen.jsx - COMPLETELY FIXED with proper AsyncStorage
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
// FIXED: Import AsyncStorage correctly for Webpack
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from "../utils/ApiService";
import verificationStyles from "../styles/VerificationStyles";

// Helper function to safely store data
const storeData = async (key, value) => {
  try {
    if (!AsyncStorage || typeof AsyncStorage.setItem !== 'function') {
      console.error('AsyncStorage is not available');
      // Fallback for web - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
      return false;
    }
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return false;
  }
};

const getData = async (key) => {
  try {
    if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
      console.error('AsyncStorage is not available');
      // Fallback for web - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

export default function VerificationScreen({ navigation, route }) {
  // Properly extract params with defaults
  const { email, password, rememberMe, tempToken, user: userData } = route.params || {};
  
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
    
    if (numericValue.length === 6 && !isLoading) {
      setTimeout(() => verifyOtp(), 100);
    }
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
      const finalUser = verificationResponse?.user || userData;
      
      if (!finalUser) {
        console.error("No user data available");
        Alert.alert("Error", "Unable to complete login. Please try again.");
        return;
      }
      
      console.log("💾 Storing user data:", finalUser.email, "Role:", finalUser.role);
      
      // FIXED: Use safe storage functions
      // Store the auth token
      if (verificationResponse?.token) {
        await ApiService.setToken(verificationResponse.token);
<<<<<<< HEAD
        console.log("✅ Auth token stored");
      } else if (tempToken) {
        await ApiService.setToken(tempToken);
=======
        await storeData("userToken", verificationResponse.token);
        console.log("✅ Auth token stored");
      } else if (tempToken) {
        await ApiService.setToken(tempToken);
        await storeData("userToken", tempToken);
>>>>>>> f735fcfb39f1a77210269c587a689128e37f12a1
        console.log("✅ Temp token stored");
      }
      
      const userRole = String(finalUser.role || "visitor").toLowerCase();

      // Store user data
      await storeData("currentUser", JSON.stringify({ ...finalUser, role: userRole }));
      console.log("✅ User data stored");
      
      // Store email if remember me is checked
      if (rememberMe && email) {
        await storeData("rememberedEmail", email);
        console.log("✅ Remembered email stored");
      }
      
      // Clear new registration flag
      await storeData("isNewRegistration", "false");
      
      // Determine dashboard route based on user role
      let dashboardRoute = 'VisitorDashboard';
      
      if (userRole === 'admin') {
        dashboardRoute = 'AdminDashboard';
      } else if (userRole === 'security' || userRole === 'guard') {
        dashboardRoute = 'SecurityDashboard';
      } else if (userRole === 'staff') {
        dashboardRoute = 'RoleSelect';
      } else {
        dashboardRoute = 'VisitorDashboard';
      }
      
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
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      <KeyboardAvoidingView
        style={verificationStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[verificationStyles.animatedContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={verificationStyles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={verificationStyles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={verificationStyles.headerContent}>
              <View style={verificationStyles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={verificationStyles.iconGradient}
                >
                  <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={verificationStyles.headerTitle}>Verify Your Identity</Text>
              <Text style={verificationStyles.headerSubtitle}>
                Two-factor authentication adds an extra layer of security
              </Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <Animated.View style={[
            verificationStyles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}>
            {!otpVerified && (
              <>
                {/* User Info Card */}
                <View style={verificationStyles.userInfoCard}>
                  <View style={verificationStyles.avatarContainer}>
                    <LinearGradient
                      colors={['#EEF2FF', '#E0E7FF']}
                      style={verificationStyles.avatarGradient}
                    >
                      <Ionicons name="person" size={32} color="#4F46E5" />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={verificationStyles.userEmail}>{email || "User"}</Text>
                    <Text style={verificationStyles.userMessage}>
                      We need to verify it's really you
                    </Text>
                  </View>
                </View>

                {showPhoneInput ? (
                  // Phone Number Input Section
                  <Animated.View style={[verificationStyles.card, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={verificationStyles.sectionTitle}>Verify with Phone</Text>
                    <Text style={verificationStyles.sectionSubtitle}>
                      We'll send a verification code to your mobile number
                    </Text>

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
                          Enter your 10-digit mobile number (e.g., 9123456789)
                        </Text>
                      )}
                    </View>

                    {/* Method Selection */}
                    <View style={verificationStyles.methodContainer}>
                      <Text style={verificationStyles.methodLabel}>Receive code via:</Text>
                      <View style={verificationStyles.methodButtons}>
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

                    {/* Send Button */}
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
                  </Animated.View>
                ) : (
                  // OTP Input Section
                  <Animated.View style={[verificationStyles.otpCard, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={verificationStyles.otpHeader}>
                      <LinearGradient
                        colors={['#EEF2FF', '#E0E7FF']}
                        style={verificationStyles.otpIconContainer}
                      >
                        <Ionicons name="key-outline" size={32} color="#4F46E5" />
                      </LinearGradient>
                      <Text style={verificationStyles.otpTitle}>Enter Verification Code</Text>
                      <Text style={verificationStyles.otpSubtitle}>
                        We've sent a 6-digit code to
                      </Text>
                      <Text style={verificationStyles.phoneNumberDisplay}>
                        {formatPhoneDisplay(phoneNumber)}
                      </Text>
                    </View>

                    <View style={verificationStyles.otpInputContainer}>
                      <TextInput
                        style={[
                          verificationStyles.otpInput,
                          otpError && verificationStyles.otpInputError
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
                        (isLoading || otpCode.length !== 6) && verificationStyles.buttonDisabled
                      ]}
                      onPress={verifyOtp}
                      disabled={isLoading || otpCode.length !== 6}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
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
                      <Ionicons name="refresh-outline" size={18} color={canResend ? "#4F46E5" : "#9CA3AF"} />
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
                  </Animated.View>
                )}
              </>
            )}

            {/* Security Note */}
            <View style={verificationStyles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#9CA3AF" />
              <Text style={verificationStyles.securityNoteText}>
                Your information is encrypted and secure
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
