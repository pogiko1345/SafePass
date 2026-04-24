import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },

  mainScrollView: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 164,
  },

  dashboardShell: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    paddingBottom: 26,
  },

  dashboardShellWide: {
    maxWidth: 1200,
  },

  // ============ HEADER ============
  header: {
    paddingHorizontal: width <= 390 ? 16 : 20,
    paddingTop: Platform.select({ ios: 38, android: 10, web: 10 }),
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },

  greeting: {
    fontSize: 11,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  homeBrandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 8,
  },

  homeBrandLogoWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  homeBrandLogo: {
    width: 18,
    height: 18,
  },

  homeBrandCopy: {
    gap: 1,
  },

  homeBrandTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  homeBrandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.76)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  userName: {
    fontSize: width <= 390 ? 18 : 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.7,
  },

  headerSupportText: {
    fontSize: 11,
    lineHeight: 15,
    color: "rgba(255,255,255,0.82)",
    marginTop: 4,
    maxWidth: width <= 390 ? 210 : 250,
  },

  headerActions: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 8,
  },

  miniBrandHeaderWrap: {
    paddingHorizontal: width <= 390 ? 16 : 20,
    paddingTop: Platform.select({ ios: 14, android: 10, web: 10 }),
    paddingBottom: 6,
    backgroundColor: "#F4F7FB",
  },

  miniBrandHeader: {
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE7F4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 10px 22px rgba(15,23,42,0.05)" },
    }),
  },

  miniBrandIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  miniBrandLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  miniBrandLogo: {
    width: 24,
    height: 24,
    borderRadius: 10,
  },

  miniBrandCopy: {
    justifyContent: "center",
    gap: 1,
  },

  miniBrandTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  miniBrandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  miniBrandHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 12,
  },

  miniBrandSectionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },

  miniBrandSectionPillText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },

  miniBrandProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D7E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  miniBrandProfileText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0A3D91",
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  profileGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  profileInitials: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Status Card in Header
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  statusValue: {
    fontSize: 13.5,
    fontWeight: "900",
  },

  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timerText: {
    fontSize: 12,
    fontWeight: "500",
  },

  commandDeckCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D8E6F5",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 22,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 18px 34px rgba(15,23,42,0.08)" },
    }),
  },

  commandDeckCardInline: {
    marginTop: 4,
  },

  commandDeckAnimatedWrap: {
    zIndex: 2,
  },

  commandDeckAccentOrb: {
    position: "absolute",
    top: -40,
    right: -16,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(28, 109, 208, 0.08)",
  },

  commandDeckAccentOrbSecondary: {
    position: "absolute",
    bottom: -44,
    left: -18,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(15, 118, 110, 0.08)",
  },

  commandDeckHeader: {
    gap: 6,
    marginBottom: 10,
  },

  commandDeckHeaderWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  commandDeckTitleWrap: {
    gap: 4,
    flex: 1,
    maxWidth: 620,
  },

  commandDeckSectionTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E8FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },

  commandDeckSectionTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
  },

  commandDeckEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0A3D91",
  },

  commandDeckTitle: {
    fontSize: width <= 390 ? 17 : 19,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: width <= 390 ? 22 : 25,
  },

  commandDeckSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
    color: "#5D6B80",
  },

  commandDeckBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  commandDeckBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  commandDeckBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  commandMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 7,
  },

  commandMetricCard: {
    minHeight: 74,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#E4EDF8",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  commandMetricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  commandMetricLabel: {
    fontSize: width <= 390 ? 8 : 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#7C8EA3",
    marginBottom: 3,
    textAlign: "left",
  },

  commandMetricValue: {
    fontSize: width <= 390 ? 10.5 : 11.5,
    lineHeight: 15,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "left",
  },

  phoneTrackingCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  phoneTrackingCardActive: {
    backgroundColor: "#EEF5FF",
    borderColor: "#A7F3D0",
  },

  phoneTrackingCardInactive: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },

  phoneTrackingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  phoneTrackingCopy: {
    flex: 1,
  },

  phoneTrackingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },

  phoneTrackingText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  commandActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  commandPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#0A3D91",
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 12px 24px rgba(15,118,110,0.18)" },
    }),
  },

  commandPrimaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  commandSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#B7D5F6",
  },

  commandSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#041E42",
  },

  sectionIntroCard: {
    gap: 14,
    backgroundColor: "#FCFEFF",
    marginTop: 0,
    marginBottom: 14,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E3EDF8",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 14px 28px rgba(15,23,42,0.06)" },
    }),
  },

  sectionIntroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  sectionIntroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionIntroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },

  sectionIntroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  sectionIntroCopy: {
    flex: 1,
  },

  sectionIntroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  sectionIntroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },

  sectionIntroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  sectionIntroHighlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  sectionIntroHighlightPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.88)",
  },

  sectionIntroHighlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  sectionIntroHighlightText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  homeDiscoveryShell: {
    marginBottom: 14,
  },

  homeDiscoveryCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    overflow: "hidden",
  },

  homeDiscoverySearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  homeDiscoverySearchBar: {
    flex: 1,
    minHeight: 50,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  homeDiscoverySearchText: {
    flex: 1,
    fontSize: 13.5,
    color: "#6B7280",
    fontWeight: "500",
  },

  homeDiscoveryAction: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F6F8EF",
    alignItems: "center",
    justifyContent: "center",
  },

  homeDiscoveryLocationWrap: {
    alignItems: "center",
    marginBottom: 20,
  },

  homeDiscoveryLocationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.68)",
    marginBottom: 4,
  },

  homeDiscoveryLocationValue: {
    fontSize: width <= 390 ? 20 : 24,
    fontWeight: "900",
    color: "#EAF8F5",
    textAlign: "center",
  },

  homeDiscoveryCategoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },

  homeDiscoveryCategoryItem: {
    minWidth: 72,
    alignItems: "center",
    gap: 8,
    flexGrow: 1,
  },

  homeDiscoveryCategoryCapsule: {
    width: width <= 390 ? 78 : 92,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#041E42",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 10px 20px rgba(4,30,66,0.10)" },
    }),
  },

  homeDiscoveryCategoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },

  homeDiscoveryCategoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  homeSpotlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginBottom: 12,
    gap: 8,
  },

  homeSpotlightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2ECF8",
    padding: 14,
    minHeight: 120,
    justifyContent: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 8px 18px rgba(15,23,42,0.05)" },
    }),
  },

  homeSpotlightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  homeSpotlightCopy: {
    flex: 1,
    justifyContent: "space-between",
    gap: 4,
  },

  homeSpotlightLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#7C8EA3",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  homeSpotlightValue: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },

  homeSpotlightHelper: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#64748B",
  },

  // ============ NFC CARD ============
  nfcCard: {
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" },
    }),
  },

  nfcCardGradient: {
    padding: 20,
  },

  nfcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  nfcTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },

  nfcSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  nfcChipIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },

  nfcBody: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  visitorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  visitorInitials: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  visitorInfo: {
    flex: 1,
  },

  visitorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  visitorId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },

  nfcChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  nfcChipText: {
    fontSize: 10,
    color: "#FFD700",
    fontWeight: "600",
  },

  nfcFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 15,
  },

  nfcDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  nfcDetailText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // ============ NFC STATUS (ADD THESE) ============
  nfcStatusContainer: {
    marginVertical: 12,
    paddingHorizontal: 8,
  },

  nfcStatusIndicator: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },

  nfcStatusSuccess: {
    backgroundColor: "rgba(16,185,129,0.3)",
  },

  nfcStatusError: {
    backgroundColor: "rgba(239,68,68,0.3)",
  },

  nfcStatusProcessing: {
    backgroundColor: "rgba(245,158,11,0.3)",
  },

  nfcStatusText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },

  // ============ QUICK ACTIONS ============
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },

  quickAction: {
    flex: 1,
    alignItems: "center",
  },

  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" },
    }),
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  // ============ DETAILS CARD ============
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  detailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },

  // ============ HISTORY ITEM ============
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  historyInfo: {
    flex: 1,
  },

  historyLocation: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },

  historyTime: {
    fontSize: 11,
    color: "#94A3B8",
  },

  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  historyStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // ============ NFC INSTRUCTIONS CARD (ADD THIS) ============
  nfcInstructionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },

  nfcInstructionsText: {
    flex: 1,
    fontSize: 12,
    color: "#0A3D91",
    lineHeight: 18,
    fontWeight: "500",
  },

  // ============ MAP CARD ============
  mapCard: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 14px 30px rgba(15,23,42,0.1)" },
    }),
  },

  mapGradient: {
    padding: 20,
    borderRadius: 24,
  },

  mapContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mapTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  mapTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#041E42",
    marginBottom: 4,
  },

  mapSubtitle: {
    fontSize: 13,
    color: "#0A3D91",
    lineHeight: 19,
    marginBottom: 12,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  mapButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A3D91",
  },

  mapIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(10, 61, 145, 0.12)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ PENDING APPROVAL ============ 
  pendingApprovalCard: {
    marginTop: -18,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2ECF8",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 14px 30px rgba(15,23,42,0.08)" },
    }),
  },

  pendingApprovalEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
  },

  pendingApprovalGradient: {
    padding: 22,
  },

  pendingApprovalIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
  },

  pendingApprovalTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },

  pendingApprovalSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 14,
  },

  pendingApprovalBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 18,
  },

  pendingApprovalBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  pendingApprovalBadgeText: {
    fontSize: 13,
    fontWeight: "900",
  },

  pendingApprovalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },

  pendingApprovalInfoCard: {
    flexGrow: 1,
    flexBasis: width <= 560 ? "100%" : "31%",
    minHeight: 120,
    backgroundColor: "#F8FBFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E3EDF8",
    padding: 16,
    justifyContent: "space-between",
    gap: 10,
  },

  pendingApprovalInfoBox: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },

  pendingApprovalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  pendingApprovalInfoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7C8EA3",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  pendingApprovalInfoValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: "#0F172A",
  },

  pendingApprovalPrimaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
  },

  pendingApprovalPrimaryButtonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  pendingStepsCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  pendingStepsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },

  pendingStepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },

  pendingStepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  // ============ APPROVED EXPERIENCE ============
  approvedHeroCard: {
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 10px 28px rgba(15,23,42,0.16)" },
    }),
  },

  approvedHeroGradient: {
    padding: 22,
  },

  approvedHeroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    marginBottom: 18,
  },

  approvedHeroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },

  approvedHeroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  approvedHeroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  approvedHeroInitials: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  approvedHeroTextWrap: {
    flex: 1,
  },

  approvedHeroTitle: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    color: "#FFFFFF",
    marginBottom: 6,
  },

  approvedHeroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
  },

  approvedHeroFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 12,
  },

  approvedHeroFactCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 14,
    minWidth: 0,
  },

  approvedHeroFactLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },

  approvedHeroFactValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  approvedActionSection: {
    marginTop: 20,
  },

  approvedSectionHeader: {
    marginBottom: 14,
  },

  approvedSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  approvedSectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },

  approvedActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 14,
  },

  approvedActionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 3px 10px rgba(15,23,42,0.06)" },
    }),
    minWidth: 0,
  },

  approvedActionIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  approvedActionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  approvedActionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  approvedVirtualNfcCard: {
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0px 10px 28px rgba(15,23,42,0.14)" },
    }),
  },

  approvedVirtualNfcCardGradient: {
    padding: 20,
    gap: 18,
  },

  approvedVirtualNfcHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
  },

  approvedVirtualNfcBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },

  approvedVirtualNfcBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EEF5FF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  approvedVirtualNfcTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  approvedVirtualNfcSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.84)",
    maxWidth: 260,
  },

  approvedVirtualNfcIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  approvedVirtualNfcCardNumberRow: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },

  approvedVirtualNfcCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  approvedVirtualNfcCardNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  approvedVirtualNfcFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  approvedVirtualNfcFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  approvedVirtualNfcFooterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EEF5FF",
  },

  approvedStatusBanner: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF5FF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  approvedStatusBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0A3D91",
  },

  approvedInfoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  approvedGridSectionReset: {
    marginHorizontal: 20,
  },

  approvedInfoList: {
    gap: 14,
  },

  approvedInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  approvedInfoLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#94A3B8",
  },

  approvedInfoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  approvedTipsCard: {
    backgroundColor: "#F8FBFE",
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  approvedTipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },

  approvedTipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },

  approvedTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "500",
  },

  // ============ LOGOUT BUTTON ============
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },

  // ============ EMPTY STATE ============
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    marginHorizontal: 20,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  registerButton: {
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
  },

  registerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // ============ QR MODAL ============
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  qrModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "86%",
    maxWidth: 340,
    overflow: "hidden",
  },

  qrModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  qrModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  qrContainer: {
    padding: 20,
    alignItems: "center",
  },

  qrPlaceholder: {
    width: 184,
    height: 184,
    backgroundColor: "#F8FBFE",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },

  qrVisitorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },

  qrVisitorId: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },

  qrDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  qrDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },

  qrDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  qrDetailText: {
    fontSize: 12,
    color: "#475569",
  },

  qrFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  qrNote: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "500",
  },

  virtualNfcModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "88%",
    maxWidth: 660,
    overflow: "hidden",
  },

  virtualNfcModalContentCompact: {
    width: "92%",
    maxWidth: 380,
    borderRadius: 22,
  },

  virtualNfcModalHeader: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },

  virtualNfcModalHeaderCompact: {
    padding: 18,
    gap: 12,
  },

  virtualNfcModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  virtualNfcModalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 280,
  },

  virtualNfcModalBody: {
    padding: 16,
    gap: 14,
  },

  virtualNfcModalBodyCompact: {
    padding: 14,
    gap: 12,
  },

  virtualNfcDisplayRow: {
    alignItems: "center",
  },

  virtualNfcDisplayRowCompact: {
    alignItems: "stretch",
  },

  virtualNfcPreviewCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 18px 42px rgba(15,23,42,0.18)" },
    }),
  },

  virtualNfcPreviewCardCompact: {
    maxWidth: "100%",
    borderRadius: 24,
  },

  virtualNfcCardGradient: {
    padding: 22,
    gap: 18,
  },

  virtualNfcCardTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  virtualNfcCardIdentity: {
    gap: 6,
  },

  virtualNfcPreviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },

  virtualNfcPreviewBrand: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  virtualNfcPreviewSchool: {
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.72)",
    maxWidth: 220,
  },

  virtualNfcPreviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  virtualNfcPreviewName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  virtualNfcPreviewChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.22)",
  },

  virtualNfcIdBand: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  virtualNfcPreviewId: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  virtualNfcDetailsGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },

  virtualNfcDetailCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  virtualNfcDetailCardWide: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  virtualNfcPreviewMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  virtualNfcPreviewMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  virtualNfcTapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FBFE",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  virtualNfcTapHintIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
  },

  virtualNfcTapHintCopy: {
    flex: 1,
  },

  virtualNfcTapHintTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  virtualNfcTapHintText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  checkoutSummaryCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  checkoutSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  checkoutSummaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9A3412",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  checkoutSummaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#7C2D12",
  },

  virtualNfcInfoCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  virtualNfcInfoCardCompact: {
    padding: 14,
    borderRadius: 16,
  },

  virtualNfcInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  virtualNfcInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "500",
  },

  virtualNfcModalFooter: {
    flexDirection: "row",
    gap: 12,
  },

  virtualNfcModalFooterCompact: {
    flexDirection: "column",
  },

  virtualNfcSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  virtualNfcSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },

  virtualNfcPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#041E42",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  checkoutPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  virtualNfcPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accessFlowModalContent: {
    width: "88%",
    maxWidth: 388,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
  },

  accessFlowHero: {
    padding: 18,
    gap: 10,
  },

  accessFlowHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },

  accessFlowHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  accessFlowHeroBadgeDanger: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  accessFlowHeroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  accessFlowHeroBadgeTextDanger: {
    color: "#991B1B",
  },

  accessFlowTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accessFlowSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
  },

  accessFlowBody: {
    padding: 16,
    gap: 14,
  },

  checkInArrivalCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 22,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  checkInArrivalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  checkInArrivalIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  checkInArrivalAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },

  checkInArrivalInitials: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A3D91",
  },

  checkInArrivalCopy: {
    flex: 1,
    gap: 3,
  },

  checkInArrivalName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  checkInArrivalPurpose: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  checkInArrivalStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  checkInArrivalStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  checkInArrivalMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  checkInArrivalMetaCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  checkInArrivalMetaCardWide: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  checkInArrivalMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  checkInArrivalMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },

  checkInArrivalGuideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  checkInArrivalGuideTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  checkInArrivalGuideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  checkInArrivalGuideIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },

  checkInArrivalGuideText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "500",
  },

  accessFlowSummaryCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  accessFlowSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  accessFlowSummaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  accessFlowSummaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  accessFlowTimelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  accessFlowTimelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  accessFlowTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1C6DD0",
    marginTop: 5,
  },

  accessFlowTimelineDotDanger: {
    backgroundColor: "#DC2626",
  },

  accessFlowTimelineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "500",
  },

  accessFlowFooter: {
    flexDirection: "row",
    gap: 12,
  },

  accessFlowSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  accessFlowSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },

  accessFlowPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#041E42",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  accessFlowDangerButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  accessFlowPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accessFlowSuccessContent: {
    width: "90%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  accessFlowSuccessIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  accessFlowSuccessIconWrapDanger: {
    backgroundColor: "#FEF2F2",
  },

  accessFlowSuccessTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },

  accessFlowSuccessText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },

  checkInSuccessStamp: {
    width: "100%",
    backgroundColor: "#EEF5FF",
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 18,
  },

  checkInSuccessStampHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  checkInSuccessStampLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  checkInSuccessStampStatus: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  checkInSuccessStampName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  checkInSuccessStampSubtext: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  accessFlowSuccessMetaCard: {
    width: "100%",
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },

  accessFlowSuccessMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  accessFlowSuccessMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  accessFlowSuccessMetaValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  virtualNfcSuccessContent: {
    width: "90%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  virtualNfcSuccessIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  checkoutSuccessIconWrap: {
    backgroundColor: "#FEF2F2",
  },

  virtualNfcSuccessTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },

  virtualNfcSuccessText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },

  virtualNfcSuccessMetaCard: {
    width: "100%",
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },

  virtualNfcSuccessMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  virtualNfcSuccessMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  virtualNfcSuccessMetaValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  adjustedStatusBanner: {
    backgroundColor: "#EEF5FF",
  },

  adjustedStatusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#041E42",
  },

  reappointmentHeroCard: {
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 10px 28px rgba(15,23,42,0.16)" },
    }),
  },

  reappointmentHeroGradient: {
    padding: 20,
    minHeight: 210,
  },

  reappointmentHeroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    marginBottom: 18,
  },

  reappointmentHeroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },

  reappointmentHeroTitle: {
    fontSize: width <= 390 ? 24 : 27,
    fontWeight: "900",
    lineHeight: width <= 390 ? 29 : 32,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  reappointmentHeroText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 18,
  },

  reappointmentMetaGrid: {
    marginTop: 4,
    gap: 12,
  },

  reappointmentMetaCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
  },

  reappointmentMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },

  reappointmentMetaValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  reappointmentCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E1EAF5",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 26px rgba(15,23,42,0.08)" },
    }),
  },

  reappointmentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },

  reappointmentCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },

  reappointmentCardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },

  reappointmentPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: "#0A3D91",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 20px rgba(15,118,110,0.18)" },
    }),
  },

  reappointmentPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  reappointmentChecklist: {
    gap: 12,
    paddingTop: 6,
  },

  reappointmentChecklistRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  reappointmentChecklistText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  appointmentModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "88%",
    maxWidth: 400,
    maxHeight: "82%",
    overflow: "hidden",
  },

  appointmentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  appointmentModalHeaderContent: {
    flex: 1,
    gap: 8,
  },

  appointmentModalHeaderCopy: {
    gap: 4,
  },

  appointmentHeaderBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F4F0",
    alignItems: "center",
    justifyContent: "center",
  },

  appointmentModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  appointmentModalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  appointmentModalBodyScroll: {
    flexGrow: 0,
  },

  appointmentModalBody: {
    padding: 20,
    gap: 16,
    paddingBottom: 24,
  },

  appointmentScreenShell: {
    gap: 18,
  },

  appointmentScreenCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDE7F3",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 14px 34px rgba(15,23,42,0.08)" },
    }),
  },

  appointmentInlineBody: {
    padding: 20,
    gap: 18,
  },

  appointmentRequestInfoPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
  },

  appointmentRequestInfoPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  appointmentLoadingCard: {
    minHeight: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE7F3",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 14px 34px rgba(15,23,42,0.08)" },
    }),
  },

  appointmentLoadingIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  appointmentLoadingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },

  appointmentLoadingText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 340,
  },

  appointmentMenuHero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#DDE7F3",
    gap: 16,
  },

  appointmentMenuHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  appointmentMenuHeroCopy: {
    flex: 1,
    maxWidth: 520,
  },

  appointmentMenuHeroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D7E8FF",
  },

  appointmentMenuHeroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  appointmentSegmentBar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF5FF",
    borderRadius: 999,
    padding: 4,
    gap: 6,
    flexWrap: "wrap",
  },

  appointmentSegmentButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  appointmentSegmentButtonActive: {
    backgroundColor: "#0A3D91",
  },

  appointmentSegmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  appointmentSegmentTextActive: {
    color: "#FFFFFF",
  },

  appointmentMenuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  appointmentMenuCard: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DDE7F3",
    minHeight: 220,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 22,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 12px 28px rgba(15,23,42,0.06)" },
    }),
  },

  appointmentMenuCardIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  appointmentMenuCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  appointmentMenuCardText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  appointmentMenuCardChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
  },

  appointmentMenuCardChipMuted: {
    backgroundColor: "#EAF3FF",
  },

  appointmentMenuCardChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    letterSpacing: 0.3,
  },

  appointmentMenuCardFooter: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8EEF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  appointmentMenuCardFooterText: {
    flex: 1,
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },

  appointmentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    padding: 20,
    paddingBottom: 0,
    flexWrap: "wrap",
  },

  appointmentHistoryHeaderCopy: {
    flex: 1,
    minWidth: 240,
  },

  appointmentHistoryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0A3D91",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },

  appointmentHistoryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  appointmentHistoryBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },

  appointmentHistoryCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FEFEFC",
    borderWidth: 1,
    borderColor: "#DDE7F3",
    gap: 16,
  },

  appointmentHistoryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  appointmentHistoryStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  appointmentHistoryCopy: {
    flex: 1,
    gap: 4,
  },

  appointmentHistoryTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  appointmentHistoryDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  appointmentHistoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  appointmentHistoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  appointmentHistoryMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  appointmentHistoryMetaItem: {
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  appointmentHistoryMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  appointmentHistoryMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  appointmentHistoryProgressWrap: {
    gap: 8,
  },

  appointmentHistoryProgressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    backgroundColor: "#E8EDF3",
    overflow: "hidden",
  },

  appointmentHistoryProgressFill: {
    height: "100%",
    borderRadius: 999,
  },

  appointmentHistoryProgressText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
  },

  appointmentHistoryEmpty: {
    minHeight: 260,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 10,
  },

  appointmentHistoryEmptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  appointmentHistoryEmptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 360,
  },

  appointmentField: {
    gap: 8,
  },

  appointmentFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#475569",
    textTransform: "uppercase",
  },

  appointmentQuickInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  appointmentQuickInfoCard: {
    flexGrow: 1,
    flexBasis: 160,
    backgroundColor: "#FBFCF6",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ECEFDE",
  },

  appointmentQuickInfoLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  appointmentQuickInfoValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  appointmentPickerField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  appointmentPickerFieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  appointmentPickerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E6F4F1",
    justifyContent: "center",
    alignItems: "center",
  },

  appointmentPickerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  appointmentPickerValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  purposeDropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    overflow: "hidden",
  },

  pickerDropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    overflow: "hidden",
  },

  pickerDropdownScroll: {
    maxHeight: 220,
  },

  pickerOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  pickerOptionItemActive: {
    backgroundColor: "#EEF5FF",
  },

  pickerOptionItemDisabled: {
    backgroundColor: "#FEF2F2",
    opacity: 0.74,
  },

  pickerOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  pickerOptionTextActive: {
    color: "#0A3D91",
  },

  pickerOptionTextDisabled: {
    color: "#991B1B",
  },

  pickerOptionMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  pickerOptionMetaFull: {
    color: "#DC2626",
  },

  purposeOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  purposeOptionItemActive: {
    backgroundColor: "#EEF5FF",
  },

  purposeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  purposeOptionTextActive: {
    color: "#0A3D91",
  },

  appointmentFieldInput: {
    backgroundColor: "#F7FAFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
  },

  appointmentFieldTextarea: {
    minHeight: 110,
    paddingTop: 14,
  },

  appointmentReadOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  appointmentReadOnlyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  appointmentAutoHint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    fontWeight: "600",
    marginTop: -2,
  },

  appointmentIdUploadCard: {
    minHeight: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    backgroundColor: "#F7FAFE",
    overflow: "hidden",
  },

  appointmentIdPreview: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },

  appointmentIdPlaceholder: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 6,
  },

  appointmentIdPlaceholderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  appointmentIdPlaceholderText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },

  appointmentChangeIdButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
  },

  appointmentChangeIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
  },

  appointmentPrivacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FBFE",
  },

  appointmentPrivacyCardAccepted: {
    borderColor: "#10B981",
    backgroundColor: "#EEF5FF",
  },

  appointmentPrivacyCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  appointmentPrivacyCheckboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  appointmentPrivacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "700",
  },

  appointmentModalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  appointmentSecondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  appointmentSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  appointmentPrimaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#0A3D91",
  },

  appointmentPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  appointmentSuccessCard: {
    backgroundColor: "#EEF5FF",
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  appointmentSuccessHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  appointmentSuccessIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  appointmentSuccessTextWrap: {
    flex: 1,
  },

  appointmentSuccessTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#041E42",
    marginBottom: 4,
  },

  appointmentSuccessText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#0A3D91",
  },

  appointmentSuccessMetaRow: {
    marginTop: 12,
    gap: 4,
  },

  appointmentSuccessMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#041E42",
  },

  visitorModuleCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    marginBottom: 14,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E1EAF5",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 20px rgba(15,23,42,0.06)" },
    }),
  },

  visitorModuleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  visitorModuleEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  visitorModuleTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },

  visitorModuleHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  visitorModuleHeaderBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  visitorModuleIntroText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#5B6B80",
    marginBottom: 14,
  },

  visitorAboutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  visitorAboutCard: {
    flexGrow: 1,
    flexBasis: width <= 640 ? "100%" : "31%",
    minWidth: width <= 640 ? "100%" : 220,
    backgroundColor: "#F8FBFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    padding: 14,
    gap: 8,
  },

  visitorAboutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  visitorAboutTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
  },

  visitorAboutText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  visitorAboutAction: {
    marginTop: 14,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  visitorAboutActionText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  visitorModuleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  visitorModuleButton: {
    flexGrow: 1,
    flexBasis: width <= 540 ? "100%" : "47%",
    minWidth: width <= 540 ? "100%" : 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#F7FAFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  visitorModuleButtonActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  visitorModuleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  visitorModuleIconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  visitorModuleCopy: {
    flex: 1,
    gap: 3,
  },

  visitorModuleButtonTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  visitorModuleButtonTitleActive: {
    color: "#FFFFFF",
  },

  visitorModuleButtonText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  visitorModuleButtonTextActive: {
    color: "rgba(255,255,255,0.82)",
  },

  visitorFlowPanel: {
    backgroundColor: "#FFFFFF",
    marginTop: 0,
    marginBottom: 18,
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#DDEBFA",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 22,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 14px 30px rgba(15,23,42,0.06)" },
    }),
  },

  visitorMapPanel: {
    backgroundColor: "#FFFFFF",
    marginTop: 0,
    marginBottom: 18,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#DDEBFA",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 22,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 14px 30px rgba(15,23,42,0.06)" },
    }),
  },

  mapSummaryCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE4F0",
    padding: 16,
    marginBottom: 16,
  },

  mapSummaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },

  mapSummaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },

  mapSummaryCopy: {
    flex: 1,
  },

  mapSummaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  mapSummaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  mapSummaryMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  mapSummaryMetricCard: {
    flexGrow: 1,
    flexBasis: width <= 520 ? "100%" : "47%",
    minWidth: width <= 520 ? "100%" : 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },

  mapSummaryMetricLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  mapSummaryMetricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },

  visitorFlowPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  visitorFlowPanelIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  visitorFlowPanelTitleWrap: {
    flex: 1,
  },

  visitorFlowPanelEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  visitorFlowPanelTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 5,
  },

  visitorFlowPanelSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  visitorFlowChecklist: {
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },

  visitorFlowChecklistRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  visitorFlowChecklistText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "500",
  },

  visitorFlowPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#0A3D91",
  },

  visitorFlowPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  visitorFlowSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#D9E4F2",
    marginTop: 14,
  },

  visitorFlowSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#041E42",
  },

  appointmentStatusHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#F8FBFE",
    marginBottom: 14,
  },

  appointmentStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  appointmentStatusCopy: {
    flex: 1,
  },

  appointmentStatusLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  appointmentStatusText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  appointmentStatusDetails: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  appointmentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    backgroundColor: "#FFFFFF",
  },

  appointmentStatusRowLabel: {
    flex: 0.42,
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  appointmentStatusRowValue: {
    flex: 0.58,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },

  visitorFloorTabsScroll: {
    marginBottom: 12,
  },

  visitorFloorTabsContent: {
    paddingRight: 6,
  },

  visitorFloorTabs: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },

  visitorFloorTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  visitorFloorTabActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  visitorFloorTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },

  visitorFloorTabTextActive: {
    color: "#FFFFFF",
  },

  visitorMapNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  visitorMapNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#0A3D91",
    fontWeight: "600",
  },

  accountPanelCard: {
    backgroundColor: "#F7FAFE",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 16,
  },

  accountHeroCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#1E3A8A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 16px 30px rgba(30,58,138,0.16)" },
    }),
  },

  accountHeroTopRow: {
    gap: 14,
    marginBottom: 16,
  },

  accountHeroIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  accountHeroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  accountHeroInitials: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accountHeroCopy: {
    flex: 1,
  },

  accountHeroName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  accountHeroSubtext: {
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.84)",
  },

  accountHeroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  accountHeroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  accountStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  accountStatCard: {
    flexGrow: 1,
    flexBasis: width <= 520 ? "100%" : "47%",
    minWidth: width <= 520 ? "100%" : 150,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  accountStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  accountStatValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accountPanelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  accountPanelLabel: {
    flex: 0.42,
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  accountPanelValue: {
    flex: 0.58,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },

  accountActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  accountActionCard: {
    flexGrow: 1,
    flexBasis: width <= 520 ? "100%" : "47%",
    minWidth: width <= 520 ? "100%" : 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  accountActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 18,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  accountActionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },

  accountActionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    fontWeight: "600",
  },

  accountVisitSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,
  },

  accountVisitSummaryEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },

  accountVisitSummaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },

  accountVisitSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginBottom: 14,
  },

  accountVisitSummaryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF7ED",
    marginBottom: 16,
  },

  accountVisitSummaryBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  accountVisitSummaryBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  accountVisitSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  accountVisitSummaryMetric: {
    flexGrow: 1,
    flexBasis: 160,
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  accountVisitSummaryMetricLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  accountVisitSummaryMetricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  accountLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 14,
  },

  accountLogoutButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },

  bottomNavShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: width <= 390 ? 12 : 18,
    paddingBottom: Platform.select({ ios: 22, android: 16, default: 16 }),
    backgroundColor: "transparent",
    pointerEvents: "box-none",
    alignItems: "center",
  },

  bottomNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "#DCE7F3",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: { boxShadow: "0px 16px 34px rgba(15,23,42,0.17)" },
    }),
  },

  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 22,
  },

  bottomNavItemActive: {
    backgroundColor: "#061A2E",
  },

  bottomNavLabel: {
    fontSize: width <= 390 ? 10 : 10.5,
    fontWeight: "900",
    color: "#64748B",
  },

  bottomNavLabelActive: {
    color: "#FFFFFF",
  },
});
