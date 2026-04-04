import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768 && width < 1024;

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  scrollContainer: {
    flexGrow: 1,
  },

  header: {
    paddingTop: Platform.select({
      ios: 60,
      android: 50,
      web: 50,
    }),
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },

  backButton: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 50, web: 50 }),
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.3)",
      },
    }),
  },

  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  title: {
    fontSize: isSmallPhone ? 24 : isTablet ? 32 : 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: isSmallPhone ? 14 : isTablet ? 18 : 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
  },

  contactSection: {
    padding: isSmallPhone ? 16 : 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: isSmallPhone ? 16 : 20,
    marginTop: -20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
      },
    }),
  },

  sectionTitle: {
    fontSize: isSmallPhone ? 16 : 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  contactCards: {
    gap: 12,
  },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: isSmallPhone ? 12 : 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.2s ease, transform 0.2s ease",
      ":hover": {
        backgroundColor: "#F3F4F6",
        transform: "translateY(-1px)",
      },
    }),
  },

  contactIcon: {
    width: isSmallPhone ? 40 : 48,
    height: isSmallPhone ? 40 : 48,
    borderRadius: isSmallPhone ? 20 : 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactInfo: {
    flex: 1,
  },

  contactLabel: {
    fontSize: isSmallPhone ? 11 : 12,
    color: "#6B7280",
    marginBottom: 2,
  },

  contactValue: {
    fontSize: isSmallPhone ? 13 : 14,
    fontWeight: "600",
    color: "#111827",
  },

  faqSection: {
    padding: isSmallPhone ? 16 : 20,
    marginHorizontal: isSmallPhone ? 16 : 20,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
      },
    }),
  },

  faqItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  questionText: {
    flex: 1,
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "600",
    color: "#111827",
  },

  answerText: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: isSmallPhone ? 30 : 30,
  },

  footer: {
    padding: isSmallPhone ? 20 : 30,
    alignItems: "center",
  },

  footerText: {
    fontSize: isSmallPhone ? 11 : 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
});