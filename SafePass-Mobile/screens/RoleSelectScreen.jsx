import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  AccessibilityInfo,
  useWindowDimensions,
  ScrollView,
  Keyboard,
  Alert,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SocialDock from "../components/SocialDock";
import roleSelectStyles from "../styles/RoleSelectStyles";
import { brandColors, sapphireGradient } from "../styles/brandColors";

const isWeb = Platform.OS === "web";

export default function RoleSelectScreen({ navigation, route }) {
  const { width: windowWidth } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0.96)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  const visitorPressAnim = useRef(new Animated.Value(1)).current;
  const loginPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 35,
        useNativeDriver: Platform.OS !== "web",
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

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    floatAnimation.start();

    if (Platform.OS !== "web") {
      AccessibilityInfo.announceForAccessibility(
        "Role selection screen. Choose visitor registration or login to access your account."
      );
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      floatAnimation.stop();
    };
  }, [card1Anim, card2Anim, fadeAnim, logoFloatAnim, scaleAnim, slideAnim]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = "Sapphire International Aviation Academy";
    }
  }, []);

  useEffect(() => {
    if (route?.params?.registrationSuccess && route?.params?.message) {
      const timer = setTimeout(() => {
        Alert.alert("Registration Submitted!", route.params.message, [{ text: "OK, Got it!" }]);
        navigation.setParams({
          registrationSuccess: undefined,
          message: undefined,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [route?.params, navigation]);

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

  const animateCardPress = (animatedValue, toValue) => {
    Animated.spring(animatedValue, {
      toValue,
      friction: 7,
      tension: 90,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const isRowLayout = windowWidth >= 768 && !keyboardVisible;
  const socialLinks = [
    {
      label: "Website",
      icon: "globe-outline",
      onPress: () => openExternalLink("https://sapphireaviationacademy.edu.ph/"),
    },
    {
      label: "Facebook",
      icon: "logo-facebook",
      onPress: () => openExternalLink("https://www.facebook.com/sapphireaviationacademy/"),
    },
    {
      label: "YouTube",
      icon: "logo-youtube",
      onPress: () => openExternalLink("https://www.youtube.com/@sapphireaviation5105"),
    },
  ];
  const logoFloatStyle = {
    transform: [
      {
        translateY: logoFloatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={roleSelectStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={brandColors.navy} translucent={false} />

      <ScrollView
        contentContainerStyle={roleSelectStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
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
            colors={sapphireGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={roleSelectStyles.hero}
          >
            <View style={roleSelectStyles.heroGlowOne} />
            <View style={roleSelectStyles.heroGlowTwo} />

            <View style={roleSelectStyles.heroContent}>
              <View style={roleSelectStyles.brandBadge}>
                <Image
                  source={require("../assets/LogoSapphire.jpg")}
                  style={roleSelectStyles.brandBadgeLogo}
                  resizeMode="contain"
                />
                <View style={roleSelectStyles.brandBadgeTextWrap}>
                  <Text style={roleSelectStyles.brandBadgeEyebrow}>Entry Portal</Text>
                  <Text style={roleSelectStyles.brandBadgeTitle}>SafePass Command Center</Text>
                </View>
              </View>

              <Animated.View style={[roleSelectStyles.logoContainer, logoFloatStyle]}>
                <Image
                  source={require("../assets/LogoSapphire.jpg")}
                  style={roleSelectStyles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>

              <Text style={roleSelectStyles.heroTitle}>
                Sapphire International Aviation Academy
              </Text>
              <Text style={roleSelectStyles.heroSubtitle}>
                Secure Arrival and Access Control
              </Text>

              <Text style={roleSelectStyles.heroDescription}>
                Visitor access and checkpoint sign-in in one secure entry flow.
              </Text>
              <View style={roleSelectStyles.flightAccent}>
                <View style={roleSelectStyles.flightAccentLine} />
                <Ionicons name="airplane" size={13} color={brandColors.surface} />
                <View style={roleSelectStyles.flightAccentDot} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            roleSelectStyles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={roleSelectStyles.sectionTitle}>Welcome to SafePass</Text>
          <Text style={roleSelectStyles.sectionSubtitle}>
            Choose how you want to enter the system and continue with visitor registration or secure
            sign-in.
          </Text>

          <View
            style={[
              roleSelectStyles.cardsContainer,
              isRowLayout && roleSelectStyles.cardsRow,
            ]}
          >
            <Animated.View
              style={[
                roleSelectStyles.cardWrapper,
                isRowLayout && roleSelectStyles.cardWrapperRow,
                {
                  opacity: card1Anim,
                  transform: [
                    {
                      translateY: card1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    { scale: visitorPressAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={roleSelectStyles.card}
                onPress={handleVisitorSelect}
                onPressIn={() => animateCardPress(visitorPressAnim, 0.98)}
                onPressOut={() => animateCardPress(visitorPressAnim, 1)}
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
                  colors={[brandColors.surface, brandColors.surfaceSoft]}
                  style={roleSelectStyles.cardGradient}
                >
                  <View style={roleSelectStyles.cardIconWrapper}>
                    <LinearGradient
                      colors={[brandColors.blue, brandColors.sky]}
                      style={roleSelectStyles.cardIconGradient}
                    >
                      <Ionicons name="person-add-outline" size={28} color={brandColors.surface} />
                    </LinearGradient>
                  </View>
                  <View style={roleSelectStyles.cardContent}>
                    <Text style={roleSelectStyles.cardTitle}>New Visitor</Text>
                    <Text style={roleSelectStyles.cardDescription}>
                      Register for a new visitor account, plan your visit, and receive your virtual
                      NFC access profile.
                    </Text>
                    <View style={roleSelectStyles.cardFeatures}>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="card-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Virtual NFC Card</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="calendar-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Schedule Visit</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="document-text-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Fast Check-In</Text>
                      </View>
                    </View>
                  </View>
                  <View style={roleSelectStyles.cardArrow}>
                    <Ionicons name="arrow-forward" size={20} color={brandColors.blue} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                roleSelectStyles.cardWrapper,
                isRowLayout && roleSelectStyles.cardWrapperRow,
                {
                  opacity: card2Anim,
                  transform: [
                    {
                      translateY: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    { scale: loginPressAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={roleSelectStyles.card}
                onPress={handleLoginSelect}
                onPressIn={() => animateCardPress(loginPressAnim, 0.98)}
                onPressOut={() => animateCardPress(loginPressAnim, 1)}
                activeOpacity={0.7}
                accessibilityLabel="Login"
                accessibilityHint="Go to the login screen for your account"
                accessibilityRole="button"
                {...(isWeb && {
                  onKeyPress: (e) => handleKeyPress(e, handleLoginSelect),
                  tabIndex: 0,
                })}
              >
                <LinearGradient
                  colors={[brandColors.surface, brandColors.blueSoft]}
                  style={roleSelectStyles.cardGradient}
                >
                  <View style={roleSelectStyles.cardIconWrapper}>
                    <LinearGradient
                      colors={[brandColors.navy, brandColors.blue]}
                      style={roleSelectStyles.cardIconGradient}
                    >
                      <Ionicons name="log-in-outline" size={28} color={brandColors.surface} />
                    </LinearGradient>
                  </View>
                  <View style={roleSelectStyles.cardContent}>
                    <Text style={roleSelectStyles.cardTitle}>Login</Text>
                    <Text style={roleSelectStyles.cardDescription}>
                      Sign in to review approvals, open your dashboard, manage appointments, and
                      continue your access flow.
                    </Text>
                    <View style={roleSelectStyles.cardFeatures}>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="checkmark-circle-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Check Status</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="shield-checkmark-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Secure Access</Text>
                      </View>
                      <View style={roleSelectStyles.featurePill}>
                        <Ionicons name="settings-outline" size={12} color={brandColors.blue} />
                        <Text style={roleSelectStyles.featurePillText}>Manage Visit</Text>
                      </View>
                    </View>
                  </View>
                  <View style={roleSelectStyles.cardArrow}>
                    <Ionicons name="arrow-forward" size={20} color={brandColors.blue} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={roleSelectStyles.infoGrid}>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={19} color={brandColors.success} />
              <Text style={roleSelectStyles.infoCardText}>Secure Access</Text>
            </View>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="location-outline" size={19} color={brandColors.warning} />
              <Text style={roleSelectStyles.infoCardText}>GPS Tracking</Text>
            </View>
            <View style={roleSelectStyles.infoCard}>
              <Ionicons name="notifications-outline" size={19} color={brandColors.sky} />
              <Text style={roleSelectStyles.infoCardText}>Real-time Alerts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={roleSelectStyles.helpLink}
            onPress={() => navigation.navigate("Help")}
            accessibilityLabel="Need help?"
            accessibilityRole="link"
            activeOpacity={0.6}
          >
            <Ionicons name="help-circle-outline" size={18} color={brandColors.textMuted} />
            <Text style={roleSelectStyles.helpText}>Need help?</Text>
          </TouchableOpacity>

          <View style={roleSelectStyles.contactCard}>
            <View style={roleSelectStyles.contactHeader}>
              <View style={roleSelectStyles.contactHeaderIcon}>
                <Ionicons name="call-outline" size={18} color={brandColors.blue} />
              </View>
              <View style={roleSelectStyles.contactHeaderText}>
                <Text style={roleSelectStyles.contactTitle}>School Contact Details</Text>
                <Text style={roleSelectStyles.contactSubtitle}>
                  Sapphire International Aviation Academy
                </Text>
              </View>
            </View>

            <View style={roleSelectStyles.contactList}>
              <View style={roleSelectStyles.contactRow}>
                <Text style={roleSelectStyles.contactLabel}>Website</Text>
                <Text style={roleSelectStyles.contactValue}>sapphireaviationacademy.edu.ph</Text>
              </View>
              <View style={roleSelectStyles.contactRow}>
                <Text style={roleSelectStyles.contactLabel}>Tel No.</Text>
                <Text style={roleSelectStyles.contactValue}>(02) 7091 - 3362</Text>
              </View>
              <View style={roleSelectStyles.contactRow}>
                <Text style={roleSelectStyles.contactLabel}>Mobile No.</Text>
                <Text style={roleSelectStyles.contactValue}>0917 580 4858</Text>
              </View>
            </View>

            <SocialDock links={socialLinks} />

            <Text style={roleSelectStyles.contactCopyright}>
              Copyright 2024. Sapphire International Aviation Academy
            </Text>
          </View>

          <Text style={roleSelectStyles.versionText}>SafePass v2.1.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
