// RoleSelectScreen.jsx - Side-by-Side Boxes Design
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  AccessibilityInfo,
  useWindowDimensions,
  ScrollView,
  Keyboard,
  Alert,
  Image, // Added Image import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import roleSelectStyles from "../styles/RoleSelectStyles";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;

export default function RoleSelectScreen({ navigation, route }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  // ============ USEFFECT - Animation & Keyboard ============
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // Entrance animations
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
        friction: 10,
        tension: 35,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.stagger(100, [
        Animated.timing(card1Anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(card2Anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Announce screen for screen readers
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility("Role selection screen. Choose visitor registration or login to access your account.");
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // ============ SUCCESS MESSAGE FROM REGISTRATION ============
  useEffect(() => {
    if (route?.params?.registrationSuccess && route?.params?.message) {
      const timer = setTimeout(() => {
        Alert.alert(
          "Registration Submitted! 🎉",
          route.params.message,
          [{ text: "OK, Got it!" }]
        );
        navigation.setParams({ 
          registrationSuccess: undefined, 
          message: undefined 
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [route?.params, navigation]);

  // ============ ROLE HANDLERS ============
  const handleVisitorSelect = () => {
    navigation.navigate("VisitorRegister", {
      timestamp: Date.now(),
    });
  };

  const handleLoginSelect = () => {
    navigation.navigate("Login", { 
      timestamp: Date.now(),
    });
  };

  const handleKeyPress = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };

  // Determine if we should use row layout (side-by-side)
  const isRowLayout = windowWidth >= 768 && !keyboardVisible;

  return (
    <SafeAreaView style={roleSelectStyles.safeArea}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0A3D91"
        translucent={false}
      />
      
      <ScrollView 
        contentContainerStyle={roleSelectStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            roleSelectStyles.heroWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#0A3D91", "#1E4A8C", "#2B5A9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={roleSelectStyles.hero}
          >
            <View style={roleSelectStyles.heroContent}>
              {/* Logo */}
              <View style={roleSelectStyles.logoContainer}>
                <Image 
                  source={require('../assets/LogoSapphire.jpg')}
                  style={roleSelectStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              {/* Title */}
              <Text style={roleSelectStyles.heroTitle}>
                Sapphire Aviation
              </Text>
              <Text style={roleSelectStyles.heroSubtitle}>
                Visitor Management System
              </Text>
              
              <View style={roleSelectStyles.heroDivider} />
              
              <Text style={roleSelectStyles.heroDescription}>
                Smart • Secure • Seamless
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            roleSelectStyles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={roleSelectStyles.sectionTitle}>
            Welcome to SafePass
          </Text>
          <Text style={roleSelectStyles.sectionSubtitle}>
            Enterprise visitor tracking and appointment-based access management
          </Text>

          {/* Cards Container - Row layout for tablet/desktop, Column for mobile */}
          <View style={[
            roleSelectStyles.cardsContainer,
            isRowLayout && roleSelectStyles.cardsRow
          ]}>
            {/* Visitor Registration Card */}
            <Animated.View
              style={[
                roleSelectStyles.cardWrapper,
                isRowLayout && roleSelectStyles.cardWrapperRow,
                {
                  opacity: card1Anim,
                  transform: [{ translateY: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }) }],
                },
              ]}
            >
              <TouchableOpacity
                style={roleSelectStyles.card}
                onPress={handleVisitorSelect}
                activeOpacity={0.7}
                accessibilityLabel="Visitor registration"
                accessibilityHint="Create a new visitor account to schedule your visit"
                accessibilityRole="button"
                {...(isWeb && {
                  onKeyPress: (e) => handleKeyPress(e, handleVisitorSelect),
                  tabIndex: 0,
                })}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8FAFC"]}
                  style={roleSelectStyles.cardGradient}
                >
                  <View style={roleSelectStyles.cardIconWrapper}>
                    <LinearGradient
                      colors={["#7C3AED", "#8B5CF6"]}
                      style={roleSelectStyles.cardIconGradient}
                    >
                      <Ionicons name="person-add-outline" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={roleSelectStyles.cardContent}>
                    <Text style={roleSelectStyles.cardTitle}>New Visitor</Text>
                    <Text style={roleSelectStyles.cardDescription}>
                      Register for a new visitor account to schedule your visit and receive your virtual NFC card
                    </Text>
                    <View style={roleSelectStyles.cardFeatures}>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="card-outline" size={12} color="#7C3AED" />
                        <Text style={roleSelectStyles.featurePillText}>Virtual NFC Card</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="calendar-outline" size={12} color="#7C3AED" />
                        <Text style={roleSelectStyles.featurePillText}>Schedule Visit</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="location-outline" size={12} color="#7C3AED" />
                        <Text style={roleSelectStyles.featurePillText}>GPS Tracking</Text>
                      </View>
                    </View>
                  </View>
                  <View style={roleSelectStyles.cardArrow}>
                    <Ionicons name="arrow-forward" size={20} color="#7C3AED" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Card */}
            <Animated.View
              style={[
                roleSelectStyles.cardWrapper,
                isRowLayout && roleSelectStyles.cardWrapperRow,
                {
                  opacity: card2Anim,
                  transform: [{ translateY: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }) }],
                },
              ]}
            >
              <TouchableOpacity
                style={roleSelectStyles.card}
                onPress={handleLoginSelect}
                activeOpacity={0.7}
                accessibilityLabel="Login"
                accessibilityHint="Login to your existing account"
                accessibilityRole="button"
                {...(isWeb && {
                  onKeyPress: (e) => handleKeyPress(e, handleLoginSelect),
                  tabIndex: 0,
                })}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F0F9FF"]}
                  style={roleSelectStyles.cardGradient}
                >
                  <View style={roleSelectStyles.cardIconWrapper}>
                    <LinearGradient
                      colors={["#0A3D91", "#1E4A8C"]}
                      style={roleSelectStyles.cardIconGradient}
                    >
                      <Ionicons name="log-in-outline" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={roleSelectStyles.cardContent}>
                    <Text style={roleSelectStyles.cardTitle}>Existing User</Text>
                    <Text style={roleSelectStyles.cardDescription}>
                      Login to your account to check approval status, access your dashboard, and manage your visits
                    </Text>
                    <View style={roleSelectStyles.cardFeatures}>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="checkmark-circle-outline" size={12} color="#0A3D91" />
                        <Text style={roleSelectStyles.featurePillText}>Check Status</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="dashboard-outline" size={12} color="#0A3D91" />
                        <Text style={roleSelectStyles.featurePillText}>Dashboard</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="settings-outline" size={12} color="#0A3D91" />
                        <Text style={roleSelectStyles.featurePillText}>Manage Visit</Text>
                      </View>
                    </View>
                  </View>
                  <View style={roleSelectStyles.cardArrow}>
                    <Ionicons name="arrow-forward" size={20} color="#0A3D91" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Feature Highlights */}
          <View style={roleSelectStyles.infoGrid}>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={19} color="#10B981" />
              <Text style={roleSelectStyles.infoCardText}>Secure Access</Text>
            </View>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="location-outline" size={19} color="#F59E0B" />
              <Text style={roleSelectStyles.infoCardText}>GPS Tracking</Text>
            </View>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="notifications-outline" size={19} color="#3B82F6" />
              <Text style={roleSelectStyles.infoCardText}>Real-time Alerts</Text>
            </View>
          </View>

          {/* Help Link */}
          <TouchableOpacity 
            style={roleSelectStyles.helpLink}
            onPress={() => navigation.navigate("Help")}
            accessibilityLabel="Need help?"
            accessibilityRole="link"
            activeOpacity={0.6}
          >
            <Ionicons name="help-circle-outline" size={18} color="#6B7280" />
            <Text style={roleSelectStyles.helpText}>Need help?</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={roleSelectStyles.versionText}>SafePass v2.1.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}