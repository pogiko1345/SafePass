import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  
  scrollContainer: {
    flexGrow: 1,
  },

  // ============ HEADER ============
  header: {
    backgroundColor: "#0A3D91",
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    paddingBottom: 36,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "400",
  },

  // ============ CONTENT ============
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ============ WELCOME ============
  welcomeContainer: {
    marginBottom: 24,
  },
  
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  
  welcomeText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },

  // ============ ROLES SECTION ============
  rolesContainer: {
    marginBottom: 28,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  // ============ ROLE CARD ============
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  
  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  
  roleSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  
  featuresContainer: {
    marginBottom: 20,
  },
  
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  
  featureText: {
    fontSize: 14,
    color: "#4B5563",
  },
  
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  
  registerText: {
    fontSize: 15,
    fontWeight: "600",
  },
  
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ QUICK INFO ============
  quickInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  
  quickInfoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F0F2F5",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  
  quickInfoText: {
    alignItems: "center",
    marginTop: 8,
  },
  
  quickInfoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  
  quickInfoSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  // ============ SIGN IN ============
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  
  signInText: {
    fontSize: 15,
    color: "#4B5563",
  },
  
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F6FC",
  },
  
  signInButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A3D91",
    marginRight: 4,
  },

  // ============ FOOTER ============
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
    textAlign: "center",
    flex: 1,
  },

  // ============ WEB OPTIMIZATIONS ============
  ...(Platform.OS === "web" && {
    container: {
      maxWidth: 800,
      marginHorizontal: "auto",
      width: "100%",
    },
    roleCard: {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    },
    quickInfoCard: {
      cursor: "default",
    },
    signInButton: {
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": {
        backgroundColor: "#E8F0FE",
      },
    },
  }),
});