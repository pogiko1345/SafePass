import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import helpStyles from "../styles/HelpStyles";

export default function HelpScreen({ navigation }) {
  const isWeb = Platform.OS === "web";

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@sapphireaviation.edu");
  };

  const handleCallPress = () => {
    Linking.openURL("tel:+1234567890");
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://sapphireaviation.edu");
  };

  const faqs = [
    {
      question: "How do I login as a student?",
      answer: "Click on the 'Login' card and enter your student credentials provided by the administration.",
    },
    {
      question: "How do I register as a visitor?",
      answer: "Click on the 'Visitor' card and fill out the registration form with your details.",
    },
    {
      question: "What is the Virtual NFC Card?",
      answer: "The Virtual NFC Card is a digital ID that allows you to check in/out of campus facilities using your phone.",
    },
    {
      question: "How long are visitor passes valid?",
      answer: "Visitor passes are valid for 24 hours from the time of registration.",
    },
    {
      question: "I forgot my password. What should I do?",
      answer: "On the login screen, click 'Forgot Password' and follow the instructions to reset it.",
    },
    {
      question: "Is the system secure?",
      answer: "Yes, we use 256-bit encryption and two-factor authentication to ensure your data is protected.",
    },
  ];

  const handleKeyPress = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };

  return (
    <SafeAreaView style={helpStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={helpStyles.scrollContainer}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={helpStyles.header}
        >
          <TouchableOpacity
            style={helpStyles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            {...(isWeb && {
              onKeyPress: (e) => handleKeyPress(e, () => navigation.goBack()),
              tabIndex: 0,
            })}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={helpStyles.headerContent}>
            <View style={helpStyles.iconContainer}>
              <Ionicons name="help-circle" size={50} color="#FFFFFF" />
            </View>
            <Text style={helpStyles.title}>Need Assistance?</Text>
            <Text style={helpStyles.subtitle}>We're here to help 24/7</Text>
          </View>
        </LinearGradient>

        {/* Contact Options */}
        <View style={helpStyles.contactSection}>
          <Text style={helpStyles.sectionTitle}>Contact Us</Text>
          
          <View style={helpStyles.contactCards}>
            <TouchableOpacity
              style={helpStyles.contactCard}
              onPress={handleEmailPress}
              activeOpacity={0.7}
              accessibilityLabel="Email support"
              accessibilityRole="link"
              {...(isWeb && {
                onKeyPress: (e) => handleKeyPress(e, handleEmailPress),
                tabIndex: 0,
              })}
            >
              <View style={[helpStyles.contactIcon, { backgroundColor: "#F0F9FF" }]}>
                <Ionicons name="mail" size={24} color="#4F46E5" />
              </View>
              <View style={helpStyles.contactInfo}>
                <Text style={helpStyles.contactLabel}>Email</Text>
                <Text style={helpStyles.contactValue}>support@sapphireaviation.edu</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={helpStyles.contactCard}
              onPress={handleCallPress}
              activeOpacity={0.7}
              accessibilityLabel="Call support"
              accessibilityRole="link"
              {...(isWeb && {
                onKeyPress: (e) => handleKeyPress(e, handleCallPress),
                tabIndex: 0,
              })}
            >
              <View style={[helpStyles.contactIcon, { backgroundColor: "#F0F9FF" }]}>
                <Ionicons name="call" size={24} color="#4F46E5" />
              </View>
              <View style={helpStyles.contactInfo}>
                <Text style={helpStyles.contactLabel}>Phone</Text>
                <Text style={helpStyles.contactValue}>+1 (234) 567-890</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={helpStyles.contactCard}
              onPress={handleWebsitePress}
              activeOpacity={0.7}
              accessibilityLabel="Visit website"
              accessibilityRole="link"
              {...(isWeb && {
                onKeyPress: (e) => handleKeyPress(e, handleWebsitePress),
                tabIndex: 0,
              })}
            >
              <View style={[helpStyles.contactIcon, { backgroundColor: "#F0F9FF" }]}>
                <Ionicons name="globe" size={24} color="#4F46E5" />
              </View>
              <View style={helpStyles.contactInfo}>
                <Text style={helpStyles.contactLabel}>Website</Text>
                <Text style={helpStyles.contactValue}>www.sapphireaviation.edu</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={helpStyles.faqSection}>
          <Text style={helpStyles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <View key={index} style={helpStyles.faqItem}>
              <View style={helpStyles.faqQuestion}>
                <Ionicons name="help-circle-outline" size={20} color="#4F46E5" />
                <Text style={helpStyles.questionText}>{faq.question}</Text>
              </View>
              <Text style={helpStyles.answerText}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={helpStyles.footer}>
          <Text style={helpStyles.footerText}>Available 24/7 for your convenience</Text>
          <Text style={helpStyles.footerText}>Sapphire International Aviation Academy</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}