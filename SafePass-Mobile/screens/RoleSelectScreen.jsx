import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SocialDock from "../components/SocialDock";
import roleSelectStyles from "../styles/RoleSelectStyles";
import { brandColors, sapphireGradient } from "../styles/brandColors";
import Logo from "../assets/LogoSapphire.jpg";

const isWeb = Platform.OS === "web";

const platformHighlights = [
  {
    title: "Students",
    description: "Virtual campus ID, attendance history, tap-in activity, and parent notifications.",
    icon: "id-card-outline",
  },
  {
    title: "Staff",
    description: "NFC attendance, office check-ins, office presence, and assigned access.",
    icon: "briefcase-outline",
  },
  {
    title: "Visitors",
    description: "Appointment requests, visit tracking, visitor passes, and guided check-in.",
    icon: "person-outline",
  },
  {
    title: "Security",
    description: "Checkpoint validation, access monitoring, campus logs, and live oversight.",
    icon: "shield-checkmark-outline",
  },
  {
    title: "Admins",
    description: "User management, reports, notifications, and smart campus supervision.",
    icon: "settings-outline",
  },
];

const metrics = [
  ["Campus ID", "Virtual NFC"],
  ["Attendance", "Tap in/out"],
  ["Monitoring", "Real time"],
];

export default function RoleSelectScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isCompact = width < 720;
  const isPhone = width < 480;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const mobileFeatureAnim = useRef(new Animated.Value(0)).current;
  const mobileVisitorAnim = useRef(new Animated.Value(0)).current;
  const desktopFeatureAnim = useRef(new Animated.Value(0)).current;
  const schoolCardFloatAnim = useRef(new Animated.Value(0)).current;
  const mobileBadgePulseAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;
  const mobileLoginPressAnim = useRef(new Animated.Value(1)).current;
  const mobileContactPressAnim = useRef(new Animated.Value(1)).current;
  const mobileVisitorPressAnim = useRef(new Animated.Value(1)).current;
  const loginHoverAnim = useRef(new Animated.Value(0)).current;
  const contactHoverAnim = useRef(new Animated.Value(0)).current;
  const visitorLinkHoverAnim = useRef(new Animated.Value(0)).current;
  const visitorLinkPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 560,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.parallel([
        Animated.timing(mobileVisitorAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(mobileFeatureAnim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(desktopFeatureAnim, {
          toValue: 1,
          duration: 440,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    ]).start();

    const schoolFloat = Animated.loop(
      Animated.sequence([
        Animated.timing(schoolCardFloatAnim, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(schoolCardFloatAnim, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    const badgePulse = Animated.loop(
      Animated.sequence([
        Animated.timing(mobileBadgePulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(mobileBadgePulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    schoolFloat.start();
    badgePulse.start();

    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = "SafePass Smart Campus | Sapphire International Aviation Academy";
    }

    return () => {
      schoolFloat.stop();
      badgePulse.stop();
    };
  }, [desktopFeatureAnim, heroAnim, mobileBadgePulseAnim, mobileFeatureAnim, mobileVisitorAnim, schoolCardFloatAnim]);

  const handleLogin = () => {
    navigation.navigate("Login", {
      role: "campus",
      timestamp: Date.now(),
    });
  };

  const handleContact = () => {
    navigation.navigate("Help");
  };

  const handleVisitorRegister = () => {
    navigation.navigate("VisitorRegister", {
      timestamp: Date.now(),
    });
  };

  const handleKeyPress = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };

  const animatePress = (toValue) => {
    Animated.spring(buttonPressAnim, {
      toValue,
      friction: 7,
      tension: 90,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const animatePressValue = (animatedValue, toValue) => {
    Animated.spring(animatedValue, {
      toValue,
      friction: 7,
      tension: 92,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const animateHover = (animatedValue, toValue) => {
    Animated.spring(animatedValue, {
      toValue,
      friction: 8,
      tension: 90,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const openExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      // The Help screen remains available if an external link cannot open.
    }
  };

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

  const entranceStyle = {
    opacity: heroAnim,
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  };
  const mobileVisitorEntranceStyle = {
    opacity: mobileVisitorAnim,
    transform: [
      {
        translateY: mobileVisitorAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };
  const mobileFeatureEntranceStyle = {
    opacity: mobileFeatureAnim,
    transform: [
      {
        translateY: mobileFeatureAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  };
  const desktopFeatureEntranceStyle = {
    opacity: desktopFeatureAnim,
    transform: [
      {
        translateY: desktopFeatureAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };
  const schoolCardFloatStyle = {
    transform: [
      {
        translateY: schoolCardFloatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  };
  const mobileBadgePulseStyle = {
    transform: [
      {
        scale: mobileBadgePulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.025],
        }),
      },
    ],
  };

  const loginButtonMotion = {
    transform: [
      { scale: buttonPressAnim },
      {
        translateY: loginHoverAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  const contactButtonMotion = {
    transform: [
      {
        translateY: contactHoverAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };
  const visitorLinkMotion = {
    transform: [
      {
        translateY: visitorLinkHoverAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
      { scale: visitorLinkPressAnim },
    ],
  };

  if (isPhone) {
    return (
      <SafeAreaView style={roleSelectStyles.mobileSafeArea}>
        <StatusBar barStyle="light-content" backgroundColor={brandColors.navy} />
        <ScrollView
          style={roleSelectStyles.mobilePage}
          contentContainerStyle={roleSelectStyles.mobileScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={entranceStyle}>
            <LinearGradient
              colors={sapphireGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={roleSelectStyles.mobileHero}
            >
            <View style={roleSelectStyles.mobileBrandRow}>
              <Image source={Logo} style={roleSelectStyles.mobileLogo} resizeMode="contain" />
              <View style={roleSelectStyles.mobileBrandCopy}>
                <Text style={roleSelectStyles.mobileSchoolName}>Sapphire International Aviation Academy</Text>
                <Text style={roleSelectStyles.mobilePlatform}>SafePass Smart Campus</Text>
              </View>
            </View>

            <Animated.View style={[roleSelectStyles.mobileHeroBadge, mobileBadgePulseStyle]}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#D8E8FF" />
              <Text style={roleSelectStyles.mobileHeroBadgeText}>Secure campus portal</Text>
            </Animated.View>

            <Text style={roleSelectStyles.mobileTitle}>Smart Campus Access</Text>
            <Text style={roleSelectStyles.mobileSubtitle}>
              One portal for campus ID, attendance, visitor access, and security monitoring.
            </Text>

            <View style={roleSelectStyles.mobileTrustGrid}>
              <View style={roleSelectStyles.mobileTrustPill}>
                <Ionicons name="id-card-outline" size={15} color="#FFFFFF" />
                <Text style={roleSelectStyles.mobileTrustText}>Campus ID</Text>
              </View>
              <View style={roleSelectStyles.mobileTrustPill}>
                <Ionicons name="radio-outline" size={15} color="#FFFFFF" />
                <Text style={roleSelectStyles.mobileTrustText}>NFC Ready</Text>
              </View>
              <View style={roleSelectStyles.mobileTrustPill}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#FFFFFF" />
                <Text style={roleSelectStyles.mobileTrustText}>Secure</Text>
              </View>
            </View>

            <View style={roleSelectStyles.mobileActionStack}>
              <Animated.View style={{ transform: [{ scale: mobileLoginPressAnim }] }}>
                <TouchableOpacity
                  style={roleSelectStyles.mobilePrimaryButton}
                  onPress={handleLogin}
                  onPressIn={() => animatePressValue(mobileLoginPressAnim, 0.98)}
                  onPressOut={() => animatePressValue(mobileLoginPressAnim, 1)}
                  activeOpacity={0.86}
                >
                  <Ionicons name="log-in-outline" size={18} color={brandColors.blue} />
                  <Text style={roleSelectStyles.mobilePrimaryText}>Login</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: mobileContactPressAnim }] }}>
                <TouchableOpacity
                  style={roleSelectStyles.mobileSecondaryButton}
                  onPress={handleContact}
                  onPressIn={() => animatePressValue(mobileContactPressAnim, 0.98)}
                  onPressOut={() => animatePressValue(mobileContactPressAnim, 1)}
                  activeOpacity={0.84}
                >
                  <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
                  <Text style={roleSelectStyles.mobileSecondaryText}>Contact Help</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[roleSelectStyles.mobileSection, mobileFeatureEntranceStyle]}>
            <Animated.View
              style={[
                roleSelectStyles.mobileVisitorCard,
                mobileVisitorEntranceStyle,
                { transform: [...mobileVisitorEntranceStyle.transform, { scale: mobileVisitorPressAnim }] },
              ]}
            >
              <View style={roleSelectStyles.mobileVisitorIcon}>
                <Ionicons name="person-add-outline" size={19} color={brandColors.blue} />
              </View>
              <View style={roleSelectStyles.mobileVisitorCopy}>
                <Text style={roleSelectStyles.mobileVisitorTitle}>Need visitor access?</Text>
                <Text style={roleSelectStyles.mobileVisitorText}>Create an account before requesting appointments.</Text>
              </View>
              <TouchableOpacity
                style={roleSelectStyles.mobileVisitorButton}
                onPress={handleVisitorRegister}
                onPressIn={() => animatePressValue(mobileVisitorPressAnim, 0.97)}
                onPressOut={() => animatePressValue(mobileVisitorPressAnim, 1)}
                activeOpacity={0.78}
              >
                <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <Text style={roleSelectStyles.mobileSectionKicker}>Platform Coverage</Text>
            <Text style={roleSelectStyles.mobileSectionTitle}>Built for every campus role</Text>
            <View style={roleSelectStyles.mobileFeatureList}>
              {platformHighlights.map((item) => (
                <View key={item.title} style={roleSelectStyles.mobileFeatureItem}>
                  <View style={roleSelectStyles.mobileFeatureIcon}>
                    <Ionicons name={item.icon} size={20} color={brandColors.blue} />
                  </View>
                  <View style={roleSelectStyles.mobileFeatureCopy}>
                    <Text style={roleSelectStyles.mobileFeatureTitle}>{item.title}</Text>
                    <Text style={roleSelectStyles.mobileFeatureText}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={roleSelectStyles.mobileFooter}>
            <SocialDock links={socialLinks} />
            <Text style={roleSelectStyles.mobileVersionText}>SafePass Smart Campus v2.1.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={roleSelectStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={brandColors.navy} />
      <ScrollView
        style={roleSelectStyles.page}
        contentContainerStyle={roleSelectStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={roleSelectStyles.navShell}>
          <View style={[roleSelectStyles.navBar, isPhone && roleSelectStyles.navBarPhone]}>
            <View style={[roleSelectStyles.navBrand, isPhone && roleSelectStyles.navBrandHidden]}>
              <Image source={Logo} style={roleSelectStyles.navLogo} resizeMode="contain" />
              <View>
                <Text style={roleSelectStyles.navBrandTitle}>Sapphire International Aviation Academy</Text>
                <Text style={roleSelectStyles.navBrandSubtitle}>SafePass Smart Campus</Text>
              </View>
            </View>
            <View style={[roleSelectStyles.navActions, isPhone && roleSelectStyles.navActionsPhone]}>
              <TouchableOpacity
                style={roleSelectStyles.navLink}
                onPress={handleContact}
                activeOpacity={0.75}
              >
                <Text style={roleSelectStyles.navLinkText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={roleSelectStyles.navLoginButton}
                onPress={handleLogin}
                activeOpacity={0.82}
              >
                <Text style={roleSelectStyles.navLoginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Animated.View style={[roleSelectStyles.heroSection, isPhone && roleSelectStyles.heroSectionPhone, entranceStyle]}>
          <View style={[roleSelectStyles.heroGrid, !isWide && roleSelectStyles.heroGridStacked]}>
            <View style={[roleSelectStyles.heroCopy, !isWide && roleSelectStyles.heroCopyCentered]}>
              <Text style={[roleSelectStyles.heroEyebrow, !isWide && roleSelectStyles.heroTextCentered]}>
                SafePass Smart Campus
              </Text>
              <Text style={[roleSelectStyles.heroTitle, !isWide && roleSelectStyles.heroTextCentered]}>
                Sapphire International Aviation Academy
              </Text>
              <Text style={[roleSelectStyles.heroDescription, !isWide && roleSelectStyles.heroTextCentered]}>
                One secure platform for campus ID, attendance, visitor access, staff office presence,
                and security monitoring.
              </Text>

              <View
                style={[
                  roleSelectStyles.heroActions,
                  !isWide && roleSelectStyles.heroActionsCentered,
                  isPhone && roleSelectStyles.heroActionsPhone,
                ]}
              >
                <Animated.View style={loginButtonMotion}>
                  <TouchableOpacity
                    style={[roleSelectStyles.primaryButton, isPhone && roleSelectStyles.heroButtonPhone]}
                    onPress={handleLogin}
                    onPressIn={() => animatePress(0.98)}
                    onPressOut={() => animatePress(1)}
                    activeOpacity={0.86}
                    {...(isWeb && {
                      onMouseEnter: () => animateHover(loginHoverAnim, 1),
                      onMouseLeave: () => animateHover(loginHoverAnim, 0),
                      onKeyPress: (event) => handleKeyPress(event, handleLogin),
                      tabIndex: 0,
                    })}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                    <Text style={roleSelectStyles.primaryButtonText}>Login</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={contactButtonMotion}>
                  <TouchableOpacity
                    style={[roleSelectStyles.secondaryButton, isPhone && roleSelectStyles.heroButtonPhone]}
                    onPress={handleContact}
                    activeOpacity={0.82}
                    {...(isWeb && {
                      onMouseEnter: () => animateHover(contactHoverAnim, 1),
                      onMouseLeave: () => animateHover(contactHoverAnim, 0),
                      onKeyPress: (event) => handleKeyPress(event, handleContact),
                      tabIndex: 0,
                    })}
                  >
                    <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
                    <Text style={roleSelectStyles.secondaryButtonText}>Contact Help</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <Animated.View style={visitorLinkMotion}>
                <TouchableOpacity
                  style={[roleSelectStyles.visitorLink, !isWide && roleSelectStyles.visitorLinkCentered]}
                  onPress={handleVisitorRegister}
                  onPressIn={() => animatePressValue(visitorLinkPressAnim, 0.98)}
                  onPressOut={() => animatePressValue(visitorLinkPressAnim, 1)}
                  activeOpacity={0.78}
                  {...(isWeb && {
                    onMouseEnter: () => animateHover(visitorLinkHoverAnim, 1),
                    onMouseLeave: () => animateHover(visitorLinkHoverAnim, 0),
                    onKeyPress: (event) => handleKeyPress(event, handleVisitorRegister),
                    tabIndex: 0,
                  })}
                >
                  <Ionicons name="person-add-outline" size={16} color="#D8E8FF" />
                  <Text style={roleSelectStyles.visitorLinkText}>Need visitor access? Create an account</Text>
                  <Ionicons name="arrow-forward-outline" size={15} color="#D8E8FF" />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Animated.View
              style={[
                roleSelectStyles.heroVisual,
                !isWide && roleSelectStyles.heroVisualCentered,
                isPhone && roleSelectStyles.heroVisualPhone,
                schoolCardFloatStyle,
              ]}
            >
              <View style={roleSelectStyles.schoolCard}>
                <Image source={Logo} style={roleSelectStyles.schoolLogo} resizeMode="contain" />
                <Text style={roleSelectStyles.schoolCardLabel}>Sapphire International Aviation Academy</Text>
                <Text style={roleSelectStyles.schoolCardTitle}>Smart campus access is ready</Text>
                <View style={roleSelectStyles.schoolCardDivider} />
                <View style={roleSelectStyles.statusRow}>
                  <View style={roleSelectStyles.statusDot} />
                  <Text style={roleSelectStyles.statusText}>Server-connected campus workflow</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={[roleSelectStyles.metricDock, isCompact && roleSelectStyles.metricDockCompact]}>
            {metrics.map(([label, value]) => (
              <View key={label} style={roleSelectStyles.metricItem}>
                <Text style={roleSelectStyles.metricValue}>{value}</Text>
                <Text style={roleSelectStyles.metricLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[roleSelectStyles.platformSection, desktopFeatureEntranceStyle]}>
          <Text style={roleSelectStyles.sectionKicker}>Platform Coverage</Text>
          <Text style={roleSelectStyles.sectionTitle}>Built for every campus role</Text>
          <Text style={roleSelectStyles.sectionSubtitle}>
            SafePass opens the right dashboard after login, while this home page keeps the whole
            system easy to understand.
          </Text>

          <View style={roleSelectStyles.featureGrid}>
            {platformHighlights.map((item) => (
              <Animated.View key={item.title} style={[roleSelectStyles.featureCard, desktopFeatureEntranceStyle]}>
                <View style={roleSelectStyles.featureIcon}>
                  <Ionicons name={item.icon} size={22} color={brandColors.blue} />
                </View>
                <Text style={roleSelectStyles.featureTitle}>{item.title}</Text>
                <Text style={roleSelectStyles.featureText}>{item.description}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={roleSelectStyles.footerBand}>
          <View style={roleSelectStyles.footerCard}>
            <View style={roleSelectStyles.footerTextWrap}>
              <Text style={roleSelectStyles.footerTitle}>Need help getting in?</Text>
              <Text style={roleSelectStyles.footerText}>
                Contact support for login, visitor registration, OTP, or account access questions.
              </Text>
            </View>
            <TouchableOpacity style={roleSelectStyles.footerButton} onPress={handleContact} activeOpacity={0.84}>
              <Ionicons name="headset-outline" size={18} color={brandColors.blue} />
              <Text style={roleSelectStyles.footerButtonText}>Open Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={roleSelectStyles.socialWrap}>
          <SocialDock links={socialLinks} />
          <Text style={roleSelectStyles.versionText}>SafePass Smart Campus v2.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
