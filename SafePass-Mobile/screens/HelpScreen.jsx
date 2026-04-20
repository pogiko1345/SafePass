import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import helpStyles from "../styles/HelpStyles";

const CONTACT_OPTIONS = [
  {
    id: "email",
    label: "Email Support",
    value: "support@sapphireaviation.edu",
    helper: "Best for login, approval, and account recovery concerns",
    icon: "mail-outline",
    accent: "#0A3D91",
    tint: "#CCFBF1",
    url: "mailto:support@sapphireaviation.edu",
  },
  {
    id: "call",
    label: "Security Desk",
    value: "+1 (234) 567-890",
    helper: "Call for gate access concerns and urgent visitor coordination",
    icon: "call-outline",
    accent: "#B45309",
    tint: "#FEF3C7",
    url: "tel:+1234567890",
  },
  {
    id: "site",
    label: "Campus Website",
    value: "sapphireaviation.edu",
    helper: "Visit the academy site for announcements and contact details",
    icon: "globe-outline",
    accent: "#041E42",
    tint: "#EEF5FF",
    url: "https://sapphireaviation.edu",
  },
];

const QUICK_GUIDES = [
  {
    id: "visitor",
    title: "Visitor Access",
    description:
      "Register, wait for admin approval, then sign in to view your visitor pass and status.",
    icon: "person-outline",
    accent: "#0A3D91",
  },
  {
    id: "admin",
    title: "Admin Approval",
    description:
      "Approve visit requests from the dashboard so visitor accounts become active and security is notified.",
    icon: "shield-checkmark-outline",
    accent: "#041E42",
  },
  {
    id: "security",
    title: "Security Flow",
    description:
      "Track approved visitors, monitor notifications, and handle check-in or check-out at arrival time.",
    icon: "scan-outline",
    accent: "#B45309",
  },
];

const FAQS = [
  {
    id: "login",
    question: "How do I sign in to SafePass?",
    answer:
      "Use the Login screen and enter the credentials tied to your role. Visitors can sign in after registration, even while approval is still pending.",
  },
  {
    id: "visitor",
    question: "What happens after visitor registration?",
    answer:
      "Your registration is sent to admin for approval. Once approved, your visitor account becomes active and security receives a visit notification with the scheduled date and time.",
  },
  {
    id: "pending",
    question: "Why does my visitor dashboard say waiting for approval?",
    answer:
      "That means your visitor account exists, but admin has not approved the visit yet. You can still sign in and monitor the status from your dashboard.",
  },
  {
    id: "security",
    question: "How does security tracking work?",
    answer:
      "Security can monitor active visitors from the dashboard map view, review alerts, and manage check-in or check-out once the visitor arrives on campus.",
  },
  {
    id: "password",
    question: "What if I forgot my password?",
    answer:
      "Return to Login and use the password recovery flow if available, or contact support so your account can be reset safely.",
  },
  {
    id: "privacy",
    question: "Is my information protected?",
    answer:
      "Yes. Visitor identity details, access records, and account activity are handled through the secured SafePass backend for approval and monitoring purposes.",
  },
];

export default function HelpScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(FAQS[0].id);
  const isWeb = Platform.OS === "web";

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.replace("Login");
  };

  const handleOpenUrl = async (url, failureMessage) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error("Unsupported link");
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Unable to Open", failureMessage);
    }
  };

  const handleKeyPress = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };

  return (
    <SafeAreaView style={helpStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={helpStyles.scrollContainer}
      >
        <LinearGradient
          colors={["#0F172A", "#123B63", "#0A3D91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={helpStyles.hero}
        >
          <TouchableOpacity
            style={helpStyles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            {...(isWeb && {
              onKeyPress: (e) => handleKeyPress(e, handleBack),
              tabIndex: 0,
            })}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={helpStyles.heroBadge}>
            <Ionicons name="headset-outline" size={16} color="#EEF5FF" />
            <Text style={helpStyles.heroBadgeText}>SafePass Support Center</Text>
          </View>

          <View style={helpStyles.heroBody}>
            <View style={helpStyles.heroIconShell}>
              <Ionicons name="help-buoy-outline" size={38} color="#FFFFFF" />
            </View>
            <Text style={helpStyles.heroTitle}>Help That Matches Your Flow</Text>
            <Text style={helpStyles.heroSubtitle}>
              Get support for visitor registration, admin approval, security
              tracking, and account access from one place.
            </Text>
          </View>

          <View style={helpStyles.heroStats}>
            <View style={helpStyles.heroStatCard}>
              <Text style={helpStyles.heroStatValue}>24/7</Text>
              <Text style={helpStyles.heroStatLabel}>Support window</Text>
            </View>
            <View style={helpStyles.heroStatCard}>
              <Text style={helpStyles.heroStatValue}>3</Text>
              <Text style={helpStyles.heroStatLabel}>Core workflows</Text>
            </View>
            <View style={helpStyles.heroStatCard}>
              <Text style={helpStyles.heroStatValue}>Fast</Text>
              <Text style={helpStyles.heroStatLabel}>Issue guidance</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={helpStyles.pageShell}>
          <View style={helpStyles.sectionCard}>
            <View style={helpStyles.sectionHeader}>
              <Text style={helpStyles.sectionEyebrow}>Support Channels</Text>
              <Text style={helpStyles.sectionTitle}>Reach the right team quickly</Text>
              <Text style={helpStyles.sectionSubtitle}>
                Choose the contact path that best fits the issue you are
                dealing with.
              </Text>
            </View>

            <View style={helpStyles.contactGrid}>
              {CONTACT_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={helpStyles.contactCard}
                  onPress={() =>
                    handleOpenUrl(item.url, `Unable to open ${item.label.toLowerCase()} right now.`)
                  }
                  activeOpacity={0.85}
                  accessibilityLabel={item.label}
                  accessibilityRole="link"
                  {...(isWeb && {
                    onKeyPress: (e) =>
                      handleKeyPress(e, () =>
                        handleOpenUrl(
                          item.url,
                          `Unable to open ${item.label.toLowerCase()} right now.`,
                        ),
                      ),
                    tabIndex: 0,
                  })}
                >
                  <View style={[helpStyles.contactIconWrap, { backgroundColor: item.tint }]}>
                    <Ionicons name={item.icon} size={22} color={item.accent} />
                  </View>
                  <Text style={helpStyles.contactLabel}>{item.label}</Text>
                  <Text style={helpStyles.contactValue}>{item.value}</Text>
                  <Text style={helpStyles.contactHelper}>{item.helper}</Text>
                  <View style={helpStyles.contactLinkRow}>
                    <Text style={[helpStyles.contactLinkText, { color: item.accent }]}>
                      Open
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={item.accent} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={helpStyles.sectionCard}>
            <View style={helpStyles.sectionHeader}>
              <Text style={helpStyles.sectionEyebrow}>Quick Guide</Text>
              <Text style={helpStyles.sectionTitle}>Understand each role flow</Text>
              <Text style={helpStyles.sectionSubtitle}>
                These are the most common SafePass journeys across the app.
              </Text>
            </View>

            <View style={helpStyles.guideGrid}>
              {QUICK_GUIDES.map((item) => (
                <View key={item.id} style={helpStyles.guideCard}>
                  <View
                    style={[
                      helpStyles.guideIconWrap,
                      { backgroundColor: `${item.accent}18` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={20} color={item.accent} />
                  </View>
                  <Text style={helpStyles.guideTitle}>{item.title}</Text>
                  <Text style={helpStyles.guideDescription}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={helpStyles.sectionCard}>
            <View style={helpStyles.sectionHeader}>
              <Text style={helpStyles.sectionEyebrow}>FAQ</Text>
              <Text style={helpStyles.sectionTitle}>Common answers</Text>
              <Text style={helpStyles.sectionSubtitle}>
                Expand a topic below to see the answer.
              </Text>
            </View>

            <View style={helpStyles.faqList}>
              {FAQS.map((faq) => {
                const expanded = expandedFaq === faq.id;
                return (
                  <TouchableOpacity
                    key={faq.id}
                    style={helpStyles.faqItem}
                    onPress={() => setExpandedFaq(expanded ? null : faq.id)}
                    activeOpacity={0.85}
                  >
                    <View style={helpStyles.faqQuestionRow}>
                      <View style={helpStyles.faqQuestionTextWrap}>
                        <Ionicons name="help-circle-outline" size={18} color="#0A3D91" />
                        <Text style={helpStyles.faqQuestion}>{faq.question}</Text>
                      </View>
                      <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#475569"
                      />
                    </View>
                    {expanded && (
                      <Text style={helpStyles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <LinearGradient
            colors={["#FFF7ED", "#EEF5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={helpStyles.ctaCard}
          >
            <View style={helpStyles.ctaTextWrap}>
              <Text style={helpStyles.ctaTitle}>Need to start over?</Text>
              <Text style={helpStyles.ctaSubtitle}>
                Return to login or visitor registration if you need a fresh
                access attempt.
              </Text>
            </View>
            <View style={helpStyles.ctaActions}>
              <TouchableOpacity
                style={helpStyles.secondaryCta}
                onPress={() => navigation.navigate("VisitorRegister")}
                activeOpacity={0.85}
              >
                <Text style={helpStyles.secondaryCtaText}>Visitor Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={helpStyles.primaryCta}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={helpStyles.primaryCtaText}>Go to Login</Text>
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={helpStyles.footer}>
            <Text style={helpStyles.footerText}>
              SafePass support for Sapphire International Aviation Academy
            </Text>
            <Text style={helpStyles.footerSubtext}>
              Visitor approval, security tracking, and account access guidance
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
