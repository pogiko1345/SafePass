// ProfileStyles.js (Mobile & Web Separate Styles - Complete)
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isMobile = Platform.OS !== "web";

// Common colors
const colors = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#60A5FA",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  dark: "#1E293B",
  gray: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
  white: "#FFFFFF",
  black: "#000000",
};

// ============ MOBILE STYLES ============
const mobileStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: "500",
  },

  // Mobile Header
  headerGradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 50, android: 40 }),
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Mobile Success Toast
  successToast: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 50,
    overflow: "hidden",
  },
  successToastGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  successToastText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },

  // Mobile Offline Banner
  offlineBanner: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    marginTop: 100,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offlineBannerText: {
    color: "#92400E",
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
  },
  offlineRetryText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  // Mobile Hero Section
  heroSection: {
    marginTop: 100,
    marginHorizontal: 20,
  },
  heroGradient: {
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeEmoji: {
    fontSize: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  heroId: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },

  // Mobile Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[800],
    marginTop: 4,
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 10,
    color: colors.gray[500],
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },

  // Mobile NFC Card
  nfcCardPremium: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
  },
  nfcCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  nfcCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  nfcCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  nfcChipPremium: {
    width: 36,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
  },
  nfcCardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 1,
    marginBottom: 16,
  },
  nfcCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nfcCardName: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
  },
  nfcCardExpiry: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
  },

  // Mobile Section Navigation
  sectionNav: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: colors.white,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  navItemActive: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  navIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
  },
  navLabelActive: {
    color: colors.white,
  },

  // Mobile Content Area
  contentArea: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  // Mobile Form Fields
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
    marginBottom: 6,
  },
  formValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[800],
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.gray[800],
    backgroundColor: colors.gray[50],
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },

  // Mobile Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[800],
  },

  // Mobile Preferences
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[800],
  },
  preferenceDesc: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Mobile Action Buttons
  actionContainer: {
    marginTop: 24,
    marginBottom: 16,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[500],
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
  versionText: {
    textAlign: "center",
    fontSize: 10,
    color: colors.gray[400],
    marginBottom: 20,
  },

  // Mobile Error States
  errorContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  errorHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 50, android: 40 }),
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  errorBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
};

// ============ WEB STYLES ============
const webStyles = {
  // Web Container
  webContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.gray[50],
  },

  // Web Sidebar
  webSidebar: {
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    overflow: "hidden",
  },
  webSidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  webLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  webLogoText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  webSidebarToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  },
  webSidebarContent: {
    flex: 1,
    padding: 16,
  },
  webUserInfo: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    marginBottom: 16,
  },
  webUserAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  webUserAvatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.white,
  },
  webUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 4,
  },
  webUserRole: {
    fontSize: 12,
    color: colors.gray[500],
  },
  webNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[100],
    },
  },
  webNavItemActive: {
    backgroundColor: colors.gray[100],
  },
  webNavItemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  webNavIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  webNavLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  webNavLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  webLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[100],
    },
  },
  webLogoutButtonCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  webLogoutText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.danger,
  },

  // Web Main Content
  webMainContent: {
    flex: 1,
    overflow: "auto",
  },
  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  webHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  webHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  webBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[200],
    },
  },
  webHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[800],
  },
  webShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[200],
    },
  },
  webEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#DBEAFE",
    },
  },
  webEditButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },

  // Web Content
  webContent: {
    flex: 1,
    padding: 24,
  },

  // Web Success Toast
  webSuccessToast: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: "hidden",
  },
  webSuccessGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  webSuccessText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },

  // Web Offline Banner
  webOfflineBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  webOfflineText: {
    color: "#92400E",
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
  },
  webOfflineRetry: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
    cursor: "pointer",
  },

  // Web Hero Card
  webHeroCard: {
    marginBottom: 24,
  },
  webHeroGradient: {
    borderRadius: 24,
    padding: 32,
  },
  webHeroContent: {
    alignItems: "center",
  },
  webAvatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  webAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.white,
  },
  webAvatarInitials: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  webAvatarText: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.white,
  },
  webAvatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    cursor: "pointer",
  },
  webHeroName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  webHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 8,
    marginBottom: 8,
  },
  webHeroBadgeEmoji: {
    fontSize: 14,
  },
  webHeroBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  webHeroId: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  // Web Stats Row
  webStatsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  webStatCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  webStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray[800],
    marginTop: 8,
    marginBottom: 4,
  },
  webStatLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  webStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginTop: 4,
  },

  // Web NFC Card
  webNfcCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  webNfcHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  webNfcTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginLeft: 12,
    flex: 1,
  },
  webNfcChip: {
    width: 44,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  webNfcNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 24,
  },
  webNfcFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  webNfcName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
  },
  webNfcExpiry: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  // Web Section Card
  webSectionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 24,
  },
  webSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  // Web Form Fields
  webField: {
    marginBottom: 20,
  },
  webFieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[500],
    marginBottom: 6,
  },
  webFieldValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray[800],
  },
  webInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.gray[800],
    backgroundColor: colors.gray[50],
    outline: "none",
    transition: "all 0.2s ease",
    ":focus": {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`,
    },
  },
  webNameRow: {
    flexDirection: "row",
    gap: 12,
  },
  webHalfInput: {
    flex: 1,
  },

  // Web Info Rows
  webInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  webInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  webInfoContent: {
    flex: 1,
  },
  webInfoLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  webInfoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray[800],
  },

  // Web Preferences
  webPreferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  webPreferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  webPreferenceTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray[800],
  },
  webPreferenceDesc: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Web Action Buttons
  webActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  webSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.primaryDark,
      transform: "translateY(-2px)",
      boxShadow: `0px 4px 12px ${colors.primary}40`,
    },
  },
  webSaveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  webCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[200],
    },
  },
  webCancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[500],
  },
  webDangerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#FEE2E2",
      transform: "translateY(-2px)",
      borderColor: colors.danger,
      boxShadow: `0px 4px 12px ${colors.danger}40`,
    },
  },
  webDangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.danger,
  },
  webVersion: {
    textAlign: "center",
    fontSize: 12,
    color: colors.gray[400],
    marginBottom: 20,
  },

  // Web Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  errorHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  errorBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.primaryDark,
    },
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
};

// ============ COMMON MODAL STYLES ============
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalGradient: {
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[800],
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: colors.gray[200],
    },
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[500],
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.danger,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#DC2626",
      transform: "scale(1.02)",
    },
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },
};

// ============ EXPORT ============
export default StyleSheet.create({
  ...(isMobile ? mobileStyles : webStyles),
  ...modalStyles,
});