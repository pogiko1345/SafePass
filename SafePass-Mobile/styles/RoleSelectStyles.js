// RoleSelectStyles.js - Updated with Side-by-Side Box Styles
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Device breakpoints
const isSmallPhone = width <= 375;
const isMediumPhone = width > 375 && width <= 414;
const isLargePhone = width > 414 && width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

// Responsive font sizes
const fontSizes = {
  xs: isSmallPhone ? 11 : 12,
  sm: isSmallPhone ? 13 : 14,
  base: isSmallPhone ? 15 : 16,
  lg: isSmallPhone ? 18 : 20,
  xl: isSmallPhone ? 22 : 24,
  xxl: isSmallPhone ? 28 : 32,
  xxxl: isSmallPhone ? 32 : 36,
};

// Responsive spacing
const spacing = {
  xs: isSmallPhone ? 6 : 8,
  sm: isSmallPhone ? 12 : 16,
  base: isSmallPhone ? 16 : 20,
  lg: isSmallPhone ? 20 : 24,
  xl: isSmallPhone ? 24 : 32,
  xxl: isSmallPhone ? 32 : 40,
  xxxl: isSmallPhone ? 40 : 48,
  md: isSmallPhone ? 18 : 22,
};

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },

  // ============ HERO SECTION ============
  heroWrapper: {
    width: "100%",
  },

  hero: {
    paddingTop: Platform.select({
      ios: isSmallPhone ? 60 : 80,
      android: isSmallPhone ? 50 : 70,
      web: isSmallPhone ? 40 : 60,
    }),
    paddingBottom: isSmallPhone ? 40 : 50,
    borderBottomLeftRadius: isSmallPhone ? 28 : 32,
    borderBottomRightRadius: isSmallPhone ? 28 : 32,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 8px 24px rgba(10, 61, 145, 0.2)" },
    }),
  },

  heroContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: spacing.base,
  },

  logoContainer: {
    marginBottom: spacing.lg,
  },

  logoGradient: {
    width: isSmallPhone ? 80 : 100,
    height: isSmallPhone ? 80 : 100,
    borderRadius: isSmallPhone ? 40 : 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  heroTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: isSmallPhone ? 34 : 38,
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.95,
  },

  heroDivider: {
    width: isSmallPhone ? 50 : 60,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginVertical: spacing.md,
  },

  heroDescription: {
    fontSize: fontSizes.sm,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ============ CONTENT SECTION ============
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },

  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: fontSizes.base,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },

  // ============ CARDS CONTAINER - NEW SIDE-BY-SIDE LAYOUT ============
  cardsContainer: {
    flexDirection: "column",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },

  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.lg,
  },

  cardWrapper: {
    flex: 1,
    minWidth: 280,
  },

  cardWrapperRow: {
    flex: 1,
    maxWidth: isTablet ? 340 : 380,
  },

  card: {
    borderRadius: isSmallPhone ? 20 : 24,
    overflow: "hidden",
    height: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        cursor: "pointer",
        transition: "all 0.3s ease",
        ":hover": {
          transform: "translateY(-4px)",
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
      },
    }),
  },

  cardGradient: {
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    minHeight: isSmallPhone ? 280 : 320,
    justifyContent: "space-between",
  },

  cardIconWrapper: {
    marginBottom: spacing.md,
    alignItems: "center",
  },

  cardIconGradient: {
    width: isSmallPhone ? 56 : 64,
    height: isSmallPhone ? 56 : 64,
    borderRadius: isSmallPhone ? 16 : 18,
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    marginBottom: spacing.md,
  },

  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  cardDescription: {
    fontSize: fontSizes.sm,
    color: "#6B7280",
    marginBottom: spacing.md,
    lineHeight: 20,
    textAlign: "center",
  },

  cardFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },

  featurePillText: {
    fontSize: fontSizes.xs,
    color: "#4B5563",
    fontWeight: "500",
  },

  cardArrow: {
    alignSelf: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  // ============ INFO GRID ============
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 30,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.04)" },
    }),
  },

  infoCardText: {
    fontSize: fontSizes.xs,
    color: "#4B5563",
    fontWeight: "500",
  },

  // ============ HELP LINK ============
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
    ...(isWeb && {
      cursor: "pointer",
      transition: "opacity 0.2s ease",
      ":hover": {
        opacity: 0.7,
      },
    }),
  },

  helpText: {
    fontSize: fontSizes.sm,
    color: "#6B7280",
    fontWeight: "500",
  },

  versionText: {
    textAlign: "center",
    fontSize: fontSizes.xs,
    color: "#9CA3AF",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // ============ MODAL STYLES ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  privacyModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallPhone ? 24 : 28,
    width: '90%',
    maxWidth: isTablet ? 600 : 500,
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
      web: { boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)' },
    }),
  },

  privacyModalHeader: {
    backgroundColor: '#F9FAFB',
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  privacyIconContainer: {
    marginBottom: spacing.base,
    borderRadius: isSmallPhone ? 25 : 30,
    overflow: 'hidden',
  },

  privacyIconGradient: {
    width: isSmallPhone ? 50 : 60,
    height: isSmallPhone ? 50 : 60,
    borderRadius: isSmallPhone ? 25 : 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  privacyModalTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },

  privacyModalSubtitle: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },

  privacyModalContent: {
    padding: spacing.lg,
    maxHeight: isSmallPhone ? 350 : 400,
  },

  privacySection: {
    marginBottom: spacing.lg,
  },

  privacySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },

  privacySectionTitle: {
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: '600',
    color: '#111827',
  },

  privacySectionText: {
    fontSize: fontSizes.sm,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 2,
    paddingLeft: 28,
  },

  privacyCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },

  privacyCheckbox: {
    width: isSmallPhone ? 22 : 24,
    height: isSmallPhone ? 22 : 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0A3D91',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: '#FFFFFF',
  },

  privacyCheckboxChecked: {
    backgroundColor: '#0A3D91',
    borderColor: '#0A3D91',
  },

  privacyCheckboxText: {
    fontSize: isSmallPhone ? 13 : 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },

  privacyLinkText: {
    color: '#0A3D91',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  privacyModalActions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  privacyDeclineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: isSmallPhone ? 12 : 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  privacyDeclineText: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  privacyAcceptButton: {
    flex: 2,
    borderRadius: isSmallPhone ? 12 : 14,
    overflow: 'hidden',
  },

  privacyAcceptButtonDisabled: {
    opacity: 0.6,
  },

  privacyAcceptGradient: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  privacyAcceptText: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ============ WEB SPECIFIC ============
  ...(isWeb && {
    content: {
      maxWidth: 1000,
      marginHorizontal: "auto",
      width: "100%",
    },
    card: {
      transition: "all 0.3s ease",
    },
  }),
});