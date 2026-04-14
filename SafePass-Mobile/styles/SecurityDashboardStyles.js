// SecurityDashboardStyles.js (Complete with All Styles)
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isMediumPhone = width > 375 && width <= 414;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

// Responsive spacing system (8-point grid)
const spacing = {
  xxs: isSmallPhone ? 2 : 4,
  xs: isSmallPhone ? 4 : 6,
  sm: isSmallPhone ? 8 : 10,
  md: isSmallPhone ? 12 : 16,
  lg: isSmallPhone ? 16 : 20,
  xl: isSmallPhone ? 20 : 24,
  xxl: isSmallPhone ? 24 : 32,
  xxxl: isSmallPhone ? 32 : 40,
};

// Responsive font sizes with proper scaling
const fontSize = {
  xxs: isSmallPhone ? 8 : 9,
  xs: isSmallPhone ? 10 : 11,
  sm: isSmallPhone ? 11 : 12,
  base: isSmallPhone ? 12 : 14,
  md: isSmallPhone ? 13 : 15,
  lg: isSmallPhone ? 14 : 16,
  xl: isSmallPhone ? 16 : 18,
  xxl: isSmallPhone ? 18 : 20,
  xxxl: isSmallPhone ? 20 : 24,
  huge: isSmallPhone ? 24 : 28,
};

// Enhanced color palette with semantic naming
const colors = {
  primary: "#DC2626",
  primaryDark: "#B91C1C",
  primaryLight: "#EF4444",
  primarySoft: "#FEE2E2",
  secondary: "#0A3D91",
  secondaryDark: "#1E4A8C",
  secondaryLight: "#3B82F6",
  secondarySoft: "#DBEAFE",
  success: "#10B981",
  successLight: "#D1FAE5",
  successSoft: "#E3F2E9",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningSoft: "#FFF3E0",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  dangerSoft: "#FFE5E5",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  infoSoft: "#E6F0FF",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

const webHover = (styles) => (isWeb ? styles : {});

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },

  loadingText: {
    fontSize: fontSize.xxxl,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginTop: spacing.md,
  },

  scrollView: {
    flex: 1,
  },

  dashboardShell: {
    paddingBottom: spacing.xxxl,
  },

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.gray[50],
  },

  mainContent: {
    flex: 1,
  },

  // ============ HEADER ============
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.select({
      ios: isSmallPhone ? 50 : 60,
      android: isSmallPhone ? 40 : 50,
      web: isSmallPhone ? 30 : 40,
    }),
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: isSmallPhone ? 24 : 32,
    borderBottomRightRadius: isSmallPhone ? 24 : 32,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: `0px 8px 20px ${colors.primary}40` },
    }),
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  burgerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.25)",
      },
    }),
  },

  headerTitle: {
    fontSize: isSmallPhone ? 22 : isTablet ? 28 : 24,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.9)",
    marginTop: spacing.xs,
    fontWeight: "500",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  profileButton: {
    width: isSmallPhone ? 44 : 48,
    height: isSmallPhone ? 44 : 48,
    borderRadius: isSmallPhone ? 22 : 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
    overflow: "hidden",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": { transform: "scale(1.05)" },
    }),
  },

  profileIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
  },

  profileIconText: {
    fontSize: isSmallPhone ? 18 : 20,
    fontWeight: "700",
    color: colors.white,
  },

  notificationBell: {
    position: "relative",
    width: isSmallPhone ? 44 : 48,
    height: isSmallPhone ? 44 : 48,
    borderRadius: isSmallPhone ? 22 : 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.25)",
        transform: "scale(1.05)",
      },
    }),
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.warning,
    borderRadius: 12,
    minWidth: isSmallPhone ? 20 : 22,
    height: isSmallPhone ? 20 : 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },

  notificationBadgeText: {
    color: colors.white,
    fontSize: isSmallPhone ? 9 : 10,
    fontWeight: "bold",
  },

  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
  },

  infoDivider: {
    width: 1,
    height: isSmallPhone ? 30 : 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.xs,
  },

  infoLabel: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: "700",
    color: colors.white,
  },

  statusValue: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: "700",
    color: colors.successLight,
  },

  visitorCount: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: "700",
    color: colors.warningLight,
  },

  securityHeroSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.md,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  securityHeroCard: {
    borderRadius: 28,
    padding: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 14px 32px rgba(127,29,29,0.22)" },
    }),
  },

  securityHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: "wrap",
  },

  securityHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  securityHeroBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: "#FEE2E2",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  securityHeroShiftBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.18)",
  },

  securityHeroShiftText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: "#DCFCE7",
  },

  securityHeroTitle: {
    fontSize: isSmallPhone ? 24 : isTablet ? 32 : 28,
    lineHeight: isSmallPhone ? 30 : 36,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.6,
  },

  securityHeroSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
    marginTop: spacing.sm,
  },

  securityHeroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  securityHeroStatCard: {
    minWidth: 120,
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  securityHeroStatValue: {
    fontSize: isSmallPhone ? 22 : 26,
    fontWeight: "800",
    color: colors.white,
  },

  securityHeroStatLabel: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.82)",
    marginTop: 4,
  },

  securityHeroSideCards: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },

  securityHeroSideCard: {
    flex: 1,
    minWidth: isSmallPhone ? "100%" : 220,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 14px rgba(15,23,42,0.06)" },
    }),
  },

  securityHeroSideIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  securityHeroSideValue: {
    fontSize: isSmallPhone ? 24 : 28,
    fontWeight: "800",
    color: colors.gray[900],
  },

  securityHeroSideLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[700],
    marginTop: 4,
  },

  securityHeroSideMeta: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 6,
    lineHeight: 16,
  },

  // ============ STATS CARDS ============
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },

  statCard: {
    width: isSmallPhone ? (width - 48) / 2 - 2 : (width - 48) / 2 - 2,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        ":hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
        },
      },
    }),
  },

  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  statValue: {
    fontSize: isSmallPhone ? 22 : isTablet ? 28 : 24,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: spacing.xs,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontWeight: "500",
    textAlign: "center",
  },

  // ============ SECTIONS ============
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.gray[800],
    letterSpacing: -0.3,
  },

  securitySectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  viewAll: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: "600",
    ...webHover({
      cursor: "pointer",
      transition: "color 0.2s ease",
      ":hover": {
        color: colors.secondaryDark,
        textDecoration: "underline",
      },
    }),
  },

  viewAllLink: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: "600",
    ...webHover({
      cursor: "pointer",
      transition: "color 0.2s ease",
      ":hover": {
        color: colors.secondaryDark,
        textDecoration: "underline",
      },
    }),
  },

  registerButton: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: "600",
    ...webHover({
      cursor: "pointer",
      transition: "color 0.2s ease",
      ":hover": {
        color: colors.secondaryDark,
        textDecoration: "underline",
      },
    }),
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.secondaryDark,
        transform: "scale(1.02)",
      },
    }),
  },

  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.white,
  },

  // ============ MAP SECTION ============
  mapSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  securityWorkspaceGrid: {
    ...(isWeb && isDesktop
      ? {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.md,
          maxWidth: 1400,
          alignSelf: "center",
          width: "100%",
        }
      : {}),
  },

  securityWorkspacePrimary: {
    flex: 1.35,
  },

  securityWorkspaceSecondary: {
    flex: 0.95,
    marginBottom: 0,
  },

  mapSectionFull: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  mapContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  mapContainerFull: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 500,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  mapFilters: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  filterGroup: {
    marginBottom: spacing.md,
  },

  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },

  filterScroll: {
    flexDirection: "row",
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },

  filterChipActive: {
    backgroundColor: colors.secondary,
  },

  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },

  filterChipTextActive: {
    color: colors.white,
  },

  mapLegend: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },

  // ============ VISITOR SECTION ============
  visitorsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  filterTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.gray[200],
      },
    }),
  },

  filterTabActive: {
    backgroundColor: colors.secondary,
  },

  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.gray[600],
  },

  filterTabTextActive: {
    color: colors.white,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: 12, android: 10, web: 12 }),
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.gray[900],
    padding: 0,
    ...(isWeb && { outlineStyle: "none" }),
  },

  // ============ VISITOR CARDS ============
  visitorCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: {
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-2px)",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
        },
      },
    }),
  },

  visitorCardHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },

  visitorIdImage: {
    width: isSmallPhone ? 56 : 64,
    height: isSmallPhone ? 56 : 64,
    borderRadius: 16,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },

  visitorIdPlaceholder: {
    width: isSmallPhone ? 56 : 64,
    height: isSmallPhone ? 56 : 64,
    borderRadius: 16,
    marginRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[100],
  },

  visitorCardInfo: {
    flex: 1,
    justifyContent: "center",
  },

  visitorCardName: {
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 2,
  },

  visitorCardPurpose: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: 2,
  },

  visitorCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  visitorCardMetaText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },

  visitorCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: spacing.sm,
  },

  visitorCardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  visitorHistoryCountdown: {
    backgroundColor: colors.warningLight,
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },

  visitorCardFooterText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  visitorHistoryCountdownText: {
    fontSize: fontSize.xs,
    color: "#B45309",
    fontWeight: "700",
  },

  visitorCardActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },

  visitorCardAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: 4,
    ...webHover({ cursor: "pointer", transition: "all 0.2s ease" }),
  },

  visitorCardActionPrimary: {
    flex: 1,
    backgroundColor: colors.secondary,
    ...webHover({
      ":hover": { backgroundColor: colors.secondaryDark },
      ":active": { transform: "scale(0.98)" },
    }),
  },

  visitorCardActionSecondary: {
    width: 44,
    backgroundColor: colors.gray[100],
    ...webHover({
      ":hover": { backgroundColor: colors.gray[200] },
    }),
  },

  visitorCardActionText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  readonlyRecordActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },

  readonlyRecordActionText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.secondary,
  },

  readonlyInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.secondarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  readonlyInfoBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.secondaryDark,
  },

  // ============ UPCOMING BANNER ============
  upcomingBanner: {
    backgroundColor: colors.secondarySoft,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
        boxShadow: `0px 4px 12px ${colors.secondary}20`,
      },
    }),
  },

  upcomingBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },

  upcomingBannerText: {
    flex: 1,
  },

  upcomingBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 2,
  },

  upcomingBannerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },

  // ============ ACTIVITY SECTION ============
  activitySection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },

  securityPanelCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(15,23,42,0.06)" },
    }),
  },

  securityMiniStats: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },

  securityMiniStatCard: {
    flex: 1,
    minWidth: 90,
    borderRadius: 16,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },

  securityMiniStatValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.gray[900],
  },

  securityMiniStatLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  activityList: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[100],
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 2,
  },

  activityLocation: {
    fontSize: fontSize.xxs,
    color: colors.gray[500],
  },

  activityTime: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  // ============ ALERTS SECTION ============
  alertsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },

  securityAlertEmpty: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  alertsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  alertIcon: {
    marginRight: spacing.md,
  },

  alertContent: {
    flex: 1,
  },

  alertMessage: {
    fontSize: fontSize.sm,
    color: colors.gray[800],
    marginBottom: 2,
  },

  alertTime: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  alertSeverity: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  alertSeverityText: {
    fontSize: fontSize.xxs,
    fontWeight: "700",
  },

  alertCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  alertCardHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },

  alertCardIcon: {
    marginRight: spacing.md,
  },

  alertCardContent: {
    flex: 1,
  },

  alertCardTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 2,
  },

  alertCardMessage: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: 4,
  },

  alertCardTime: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  resolveButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignSelf: "flex-start",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.successLight,
        transform: "scale(1.02)",
      },
    }),
  },

  resolveButtonText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },

  // ============ LOGS SECTION ============
  logsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  logsList: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[100],
    overflow: "hidden",
  },

  logItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  logContent: {
    flex: 1,
  },

  logTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 2,
  },

  logDetail: {
    fontSize: fontSize.xxs,
    color: colors.gray[500],
    marginTop: 2,
  },

  logTime: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  // ============ REPORTS SECTION ============
  reportsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  reportFormCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  reportFormTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },

  reportFormSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.gray[500],
    marginBottom: spacing.lg,
  },

  reportFormLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },

  reportVisitorChipRow: {
    marginBottom: spacing.md,
  },

  reportVisitorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginRight: spacing.sm,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },

  reportVisitorChipActive: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purple,
  },

  reportVisitorChipText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[600],
  },

  reportVisitorChipTextActive: {
    color: colors.purple,
  },

  reportCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  reportCategoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },

  reportCategoryChipActive: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },

  reportCategoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[600],
  },

  reportCategoryChipTextActive: {
    color: colors.danger,
  },

  reportFormInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 16,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    color: colors.gray[900],
    textAlignVertical: "top",
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  reportFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  reportFormSecondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.gray[100],
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },

  reportFormSecondaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[700],
  },

  reportFormPrimaryButton: {
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.purple,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },

  reportFormPrimaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: colors.white,
  },

  reportStatsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  reportStatCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  reportStatValue: {
    fontSize: fontSize.xxxl,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },

  reportStatLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  reportSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  reportSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },

  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  reportRank: {
    width: 28,
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.gray[500],
  },

  reportName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.gray[700],
  },

  reportCount: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[900],
    marginRight: spacing.sm,
  },

  reportBar: {
    width: 80,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: "hidden",
  },

  reportBarFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },

  reportPercentage: {
    width: 40,
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.gray[600],
    textAlign: "right",
  },

  reportCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  reportCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },

  reportCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[800],
  },

  reportCardDate: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  reportCardVisitor: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    marginBottom: 2,
  },

  reportCardStatus: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.successLight,
        transform: "scale(1.02)",
      },
    }),
  },

  generateButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.white,
  },

  // ============ EMPTY STATES ============
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xxxl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginTop: spacing.md,
  },

  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.gray[700],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  emptyStateSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: "center",
  },

  // ============ QUICK ACTIONS SECTION ============
  quickActionsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  securityCommandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  securityCommandCard: {
    minWidth: isSmallPhone ? "100%" : "47%",
    flexGrow: 1,
    flexBasis: isDesktop ? 240 : 260,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: {
        boxShadow: "0px 4px 12px rgba(15,23,42,0.06)",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-2px)",
          boxShadow: "0px 8px 22px rgba(15,23,42,0.10)",
        },
      },
    }),
  },

  securityCommandIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  securityCommandCopy: {
    flex: 1,
  },

  securityCommandTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.gray[900],
  },

  securityCommandSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 16,
    marginTop: 4,
  },

  quickActionCard: {
    flex: 1,
    minWidth: isSmallPhone ? "100%" : "47%",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
        },
      },
    }),
  },

  quickActionGradient: {
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },

  quickActionTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.white,
    marginTop: spacing.xs,
  },

  quickActionSubtitle: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.8)",
  },

  // ============ SIDEBAR STYLES ============
  sidebar: {
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    overflow: "hidden",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: "2px 0 12px rgba(0,0,0,0.05)" },
    }),
  },

  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  sidebarLogoText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },

  sidebarClose: {
    padding: spacing.xs,
  },

  sidebarContent: {
    flex: 1,
  },

  sidebarUser: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.md,
  },

  sidebarAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  sidebarAvatarText: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
  },

  sidebarUserInfo: {
    flex: 1,
  },

  sidebarUserName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 2,
  },

  sidebarUserRole: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  sidebarNav: {
    padding: spacing.md,
  },

  sidebarNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
    position: "relative",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": { backgroundColor: colors.gray[50] },
    }),
  },

  sidebarNavItemActive: {
    backgroundColor: colors.gray[50],
  },

  sidebarNavIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  sidebarNavLabel: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.gray[700],
    flex: 1,
  },

  sidebarNavLabelActive: {
    fontWeight: "600",
    color: colors.gray[900],
  },

  sidebarNavIndicator: {
    position: "absolute",
    right: 0,
    width: 3,
    height: 20,
    borderRadius: 2,
  },

  sidebarModuleCard: {
    marginBottom: spacing.xs,
  },

  sidebarSubmoduleList: {
    marginLeft: 48,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[200],
    gap: spacing.xs,
  },

  sidebarSubmoduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.white,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": { backgroundColor: colors.gray[50] },
    }),
  },

  sidebarSubmoduleButtonActive: {
    backgroundColor: colors.primarySoft,
  },

  sidebarSubmoduleLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[600],
  },

  sidebarSubmoduleLabelActive: {
    color: colors.primary,
  },

  sidebarSubmoduleBadge: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },

  sidebarSubmoduleBadgeText: {
    fontSize: fontSize.xxs,
    fontWeight: "700",
    color: colors.gray[600],
  },

  sidebarStatsSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
    marginVertical: spacing.sm,
  },

  sidebarStatsTitle: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sidebarStatsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  sidebarStatItem: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[100],
  },

  sidebarStatValue: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.gray[900],
  },

  sidebarStatLabel: {
    fontSize: fontSize.xxs,
    color: colors.gray[500],
    marginTop: 2,
  },

  sidebarSection: {
    padding: spacing.md,
  },

  sidebarSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },

  sidebarRankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },

  sidebarRankNumber: {
    width: 24,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[500],
  },

  sidebarRankName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray[700],
  },

  sidebarRankCount: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[900],
  },

  sidebarLogout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: spacing.md,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    ...Platform.select({
      ios: {
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: colors.danger,
          transform: "translateY(-2px)",
          boxShadow: `0px 4px 12px ${colors.danger}40`,
        },
      },
    }),
  },

  sidebarLogoutText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.danger,
    ...webHover({
      ":hover": {
        color: colors.white,
      },
    }),
  },

  sidebarVersion: {
    textAlign: "center",
    fontSize: fontSize.xxs,
    color: colors.gray[400],
    marginVertical: spacing.lg,
  },

  // ============ MODAL STYLES ============
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 28,
    width: isSmallPhone ? "90%" : 400,
    padding: spacing.xl,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: { boxShadow: "0px 12px 32px rgba(0,0,0,0.2)" },
    }),
  },

  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },

  modalMessage: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },

  modalButtonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": { backgroundColor: colors.gray[200] },
    }),
  },

  modalCancelText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.gray[500],
  },

  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.danger,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.primaryDark,
        transform: "scale(1.02)",
      },
      ":active": { transform: "scale(0.98)" },
    }),
  },

  modalConfirmText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.white,
  },

  // ============ FORM STYLES ============
  inputGroup: {
    marginBottom: spacing.md,
  },

  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 14,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
    ...(isWeb && {
      outlineStyle: "none",
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: colors.secondary,
        boxShadow: `0 0 0 3px ${colors.secondary}20`,
      },
    }),
  },

  // ============ PHOTO UPLOAD ============
  photoUploadSection: {
    marginBottom: spacing.lg,
  },

  idPhotoUploadContainer: {
    width: "100%",
    height: isSmallPhone ? 140 : 160,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: "dashed",
    overflow: "hidden",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: colors.secondary,
        backgroundColor: `${colors.secondary}05`,
      },
    }),
  },

  uploadedIdPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  idPhotoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },

  idPhotoPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    fontWeight: "500",
  },

  idPhotoSubtext: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  // ============ DETAIL MODAL ============
  detailPhotoSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  detailIdPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" },
    }),
  },

  detailIdPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderWidth: 3,
    borderColor: colors.white,
  },

  detailIdPlaceholderText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },

  visitorDetailModalContent: {
    maxWidth: 760,
  },

  visitorDetailHeader: {
    alignItems: "flex-start",
  },

  visitorDetailHeaderSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 4,
    lineHeight: 16,
  },

  visitorDetailBody: {
    gap: spacing.lg,
  },

  visitorHistoryNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningLight,
    borderRadius: 18,
    padding: spacing.md,
  },

  visitorHistoryNoticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: "#92400E",
    fontWeight: "600",
  },

  visitorDetailHero: {
    backgroundColor: colors.gray[50],
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    gap: spacing.lg,
    ...(isWeb && isDesktop ? { flexDirection: "row", alignItems: "center" } : {}),
  },

  visitorDetailHeroCopy: {
    flex: 1,
  },

  visitorDetailBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  visitorDetailStatusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },

  visitorDetailStatusPillText: {
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  visitorDetailAccessPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.infoSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },

  visitorDetailAccessPillText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.secondary,
  },

  visitorDetailPurpose: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  visitorDetailQuickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  visitorDetailQuickInfoCard: {
    minWidth: 120,
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },

  visitorDetailQuickInfoLabel: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "700",
  },

  visitorDetailQuickInfoValue: {
    fontSize: fontSize.sm,
    color: colors.gray[800],
    fontWeight: "700",
    marginTop: 4,
  },

  visitorDetailSection: {
    gap: spacing.sm,
  },

  visitorDetailSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.gray[900],
  },

  visitorDetailInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  visitorDetailInfoCard: {
    minWidth: 180,
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
  },

  visitorDetailInfoLabel: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "700",
    marginBottom: 6,
  },

  visitorDetailInfoValue: {
    fontSize: fontSize.sm,
    color: colors.gray[800],
    fontWeight: "700",
    lineHeight: 18,
  },

  visitorDetailTimeline: {
    backgroundColor: colors.gray[50],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
    gap: spacing.md,
  },

  visitorDetailTimelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  visitorDetailTimelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },

  visitorDetailTimelineCopy: {
    flex: 1,
  },

  visitorDetailTimelineTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[800],
  },

  visitorDetailTimelineText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
    lineHeight: 16,
  },

  detailInfoSection: {
    gap: spacing.md,
  },

  detailName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.gray[900],
    textAlign: "center",
    marginBottom: spacing.md,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  detailText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.gray[700],
  },

  detailDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },

  detailSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  detailActions: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  detailActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 14,
    gap: spacing.xs,
    ...webHover({ cursor: "pointer", transition: "all 0.2s ease" }),
  },

  detailActionPrimary: {
    backgroundColor: colors.secondary,
    ...webHover({
      ":hover": { backgroundColor: colors.secondaryDark },
    }),
  },

  detailActionDanger: {
    backgroundColor: colors.danger,
    ...webHover({
      ":hover": { backgroundColor: colors.primaryDark },
    }),
  },

  detailActionText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  // ============ FULLSCREEN MODAL ============
  fullscreenModal: {
    flex: 1,
    backgroundColor: colors.gray[900],
  },

  fullscreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },

  fullscreenModalTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
  },

  fullscreenMapContainer: {
    flex: 1,
  },

  // ============ NOTIFICATION MODAL ============
  notificationHeaderTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  notificationHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  markAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": { backgroundColor: colors.gray[200] },
    }),
  },

  markAllText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: "600",
  },

  notificationItem: {
    flexDirection: "row",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.md,
    ...webHover({
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      ":hover": { backgroundColor: colors.gray[50] },
    }),
  },

  notificationUnread: {
    backgroundColor: `${colors.secondary}08`,
  },

  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  notificationContent: {
    flex: 1,
  },

  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },

  notificationMessage: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: 4,
    lineHeight: 18,
  },

  notificationTime: {
    fontSize: fontSize.xxs,
    color: colors.gray[400],
  },

  emptyNotifications: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },

  // ============ WELCOME SECTION ============
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },

  welcomeTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },

  welcomeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
    }),
  },

  dateChipText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray[700],
  },

  // ============ MAIN STATS GRID ============
  statsGrid: {
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  statCardLarge: {
    flex: 1.2,
    borderRadius: 24,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0px 8px 20px rgba(220,38,38,0.2)' },
    }),
  },

  statCardLargeContent: {
    alignItems: 'flex-start',
  },

  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  statCardLargeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
  },

  statCardLargeLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
  },

  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },

  statBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '500',
  },

  statsRow: {
    flex: 0.8,
    gap: spacing.sm,
  },

  statCardMedium: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
    }),
  },

  statIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  statValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 2,
  },

  statLabelMedium: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: 4,
  },

  statTrend: {
    fontSize: fontSize.xxs,
    color: colors.success,
    fontWeight: '500',
  },

  securityMetricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    ...(isWeb && {
      maxWidth: isDesktop ? 1200 : isTablet ? 900 : "100%",
      alignSelf: "center",
      width: "100%",
    }),
  },

  securityMetricCard: {
    minWidth: isSmallPhone ? "100%" : 220,
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(15,23,42,0.06)" },
    }),
  },

  securityMetricIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  securityMetricValue: {
    fontSize: isSmallPhone ? 24 : 28,
    fontWeight: "800",
    color: colors.gray[900],
  },

  securityMetricLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.gray[700],
    marginTop: 4,
  },

  securityMetricHelper: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 16,
    marginTop: 6,
  },

  // ============ HOVER CARD ============
  hoverCard: {
    position: "absolute",
    bottom: 30,
    left: -60,
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 4px 16px rgba(0,0,0,0.12)" },
    }),
    zIndex: 100,
  },

  hoverCardHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  hoverCardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  hoverCardImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },

  hoverCardInfo: {
    flex: 1,
  },

  hoverCardName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 2,
  },

  hoverCardPurpose: {
    fontSize: 10,
    color: colors.gray[500],
    marginBottom: 4,
  },

  hoverCardBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },

  hoverCardBadgeText: {
    fontSize: 8,
    fontWeight: "600",
  },

  hoverCardDetails: {
    gap: 4,
    marginBottom: 8,
  },

  hoverCardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  hoverCardDetailText: {
    fontSize: 10,
    color: colors.gray[600],
  },

  hoverCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.secondaryDark,
      },
    }),
  },

  hoverCardButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.white,
  },

  // ============ BUTTON DISABLED ============
  buttonDisabled: {
    opacity: 0.5,
  },

  // ============ MODAL CONTENT (Additional) ============
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 28,
    width: isSmallPhone ? "95%" : "90%",
    maxWidth: 500,
    maxHeight: height * 0.9,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: { boxShadow: "0px 12px 32px rgba(0,0,0,0.2)" },
    }),
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  modalBody: {
    padding: spacing.lg,
  },

  modalFooter: {
    flexDirection: "row",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: spacing.sm,
  },

  modalSubmitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.secondary,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: colors.secondaryDark,
        transform: "scale(1.02)",
      },
      ":active": { transform: "scale(0.98)" },
    }),
  },

  modalSubmitText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.white,
  },
});
