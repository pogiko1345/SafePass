import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const sidebarWidth = 260;
const isWeb = Platform.OS === "web";

export default StyleSheet.create({
  // 1. CONTAINERS - Main layout containers
  
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
  },

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
  },

  // ============================================
  // 2. SIDEBAR - Left navigation panel
  // ============================================

  sidebar: {
    width: sidebarWidth,
    backgroundColor: "#0F2A43",
    height: "100%",
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
  },

  sidebarContent: {
    paddingBottom: 30,
  },

  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  sidebarLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
  },

  sidebarLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  sidebarBrand: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },

  sidebarRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    marginBottom: 16,
  },

  sidebarRoleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },

  sidebarStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    width: "100%",
  },

  sidebarStat: {
    flex: 1,
    alignItems: "center",
  },

  sidebarStatNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },

  sidebarStatLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  sidebarStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  sidebarMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },

  sidebarMenuItemActive: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.35)",
  },

  sidebarMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sidebarMenuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
  },

  sidebarMenuLabelActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  sidebarMenuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  sidebarMenuBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
  },

  sidebarUserSection: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  sidebarUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  sidebarUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sidebarUserAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A5F",
  },

  sidebarUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },

  sidebarUserEmail: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
  },

  sidebarLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.15)",
    gap: 12,
  },

  sidebarLogoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FDA4AF",
  },

  sidebarFooter: {
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 20,
  },

  sidebarFooterText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 2,
    textAlign: "center",
  },

  sidebarFooterVersion: {
    fontSize: 9,
    color: "rgba(255,255,255,0.3)",
  },

  // ============================================
  // 3. CONTENT AREA - Main content section
  // ============================================

  contentArea: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  adminContentShell: {
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  adminMonitoringDock: {
    width: 420,
    borderLeftWidth: 1,
    backgroundColor: "#FFFFFF",
  },

  adminMonitoringDockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  adminMonitoringDockTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  adminMonitoringDockSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  adminMonitoringDockClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  adminMonitoringDockBody: {
    flex: 1,
    padding: 16,
  },

  contentScrollView: {
    flex: 1,
  },

  dashboardScrollContent: {
    paddingBottom: 40,
  },

  pageContainer: {
    padding: 22,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  adminSectionShell: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },

  adminSectionShellHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  adminSectionShellCopy: {
    flex: 1,
    minWidth: 220,
  },

  adminSectionShellTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  adminSectionShellBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  adminSectionShellBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  adminSectionShellActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  adminFeedbackBanner: {
    marginHorizontal: 22,
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  adminFeedbackAccent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 999,
  },

  adminFeedbackCopy: {
    flex: 1,
  },

  adminFeedbackTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },

  adminFeedbackMessage: {
    fontSize: 12,
    lineHeight: 18,
  },

  adminFeedbackDismiss: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1E293B",
  },

  // ============================================
  // 4. HEADER - Top bar with title and profile
  // ============================================

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 50, android: 20, web: 20 }),
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 12px rgba(15,23,42,0.08)" },
    }),
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },

  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 19,
  },

  headerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  headerMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  headerMetaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(14,165,233,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },

  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  pageRefreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  dashboardHeroCard: {
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#F0F9FF",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  dashboardHeroLeft: {
    flex: 1,
  },

  dashboardHeroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 5,
  },

  dashboardHeroSubtitle: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },

  dashboardHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
  },

  dashboardHeroBadgeText: {
    fontSize: 11,
    color: "#0369A1",
    fontWeight: "600",
  },

  dashboardStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  dashboardStatCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },

  dashboardStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dashboardStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  dashboardStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  dashboardStatValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },

  dashboardSectionCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    elevation: 2,
  },

  dashboardSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  dashboardSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  dashboardSectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  adminMapSection: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  adminMapFilters: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  adminMapFilterRow: {
    paddingRight: 8,
    paddingBottom: 10,
  },

  adminMapFilterLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  adminMapActivityFilterPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },

  adminMapFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
  },

  adminMapFilterChipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  adminMapFilterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  adminMapFilterChipTextActive: {
    color: "#FFFFFF",
  },

  adminMapLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  adminMapLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  adminMapLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  adminMapLegendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  adminMapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  adminMapSideCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  adminMapSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  adminMapSummaryCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  adminMapFocusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },

  adminMapActivityList: {
    gap: 0,
  },

  adminMapActivityItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  adminMapModalContent: {
    width: "100%",
    maxWidth: 1220,
    maxHeight: "92%",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },

  adminMapModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  adminMapModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  adminMapModalBody: {
    padding: 18,
  },

  adminMapModalMapWrap: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  dashboardSectionEmpty: {
    marginTop: 10,
    color: "#64748B",
  },

  dashboardActionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  dashboardRequestCard: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },

  dashboardRequestCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  dashboardRequestCardInfo: {
    flex: 1,
    paddingRight: 10,
  },

  dashboardRequestName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  dashboardRequestEmail: {
    marginTop: 2,
    color: "#64748B",
  },

  dashboardRequestPurpose: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  dashboardRequestTime: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  dashboardRequestRight: {
    alignItems: "flex-end",
  },

  dashboardStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  dashboardStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  dashboardRequestDate: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
  },

  profileInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },

  // ============================================
  // 5. WELCOME BANNER - Greeting and date display
  // ============================================

  welcomeBanner: {
    backgroundColor: "#3B82F6",
    margin: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 12px rgba(59,130,246,0.2)" },
    }),
  },

  welcomeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  welcomeLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },

  welcomeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },

  welcomeDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  welcomeDateText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "500",
  },

  // ============================================
  // 6. STATS GRID - Dashboard statistics cards
  // ============================================

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    minWidth: (width - sidebarWidth - 56) / 2,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
      },
    }),
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  // ============================================
  // 7. CHART SECTION - Visitor analytics charts
  // ============================================

  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  sectionLink: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },

  lastSection: {
    marginBottom: 40,
  },

  chartTypeSelector: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 30,
    padding: 4,
  },

  chartTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
  },

  chartTypeButtonActive: {
    backgroundColor: "#3B82F6",
  },

  chartTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  chartTypeTextActive: {
    color: "#FFF",
  },

  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  chartContainer: {
    height: 220,
    justifyContent: "center",
  },

  chartBarsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
  },

  chartBarWrapper: {
    alignItems: "center",
    width: (width - sidebarWidth - 100) / 12,
  },

  chartBar: {
    width: (width - sidebarWidth - 100) / 12 - 6,
    borderRadius: 6,
    marginBottom: 8,
    minHeight: 2,
  },

  chartBarLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  chartBarValue: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },

  chartSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  chartSummaryLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },

  chartSummaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  // ============================================
  // 8. LIST ITEMS - Staff, user list items
  // ============================================

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  listItemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  listItemAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },

  listItemInfo: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },

  listItemSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  // ============================================
  // 9. QUICK ACTIONS - Action buttons grid
  // ============================================

  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
    marginBottom: 16,
  },

  quickActionCard: {
    minWidth: 180,
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  quickActionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "center",
  },

  quickActionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 17,
  },

  quickActionBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  quickActionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  dashboardFlowCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  dashboardFlowSteps: {
    gap: 12,
    marginTop: 14,
  },

  dashboardFlowStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  dashboardFlowStepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  dashboardFlowStepCopy: {
    flex: 1,
  },

  dashboardFlowStepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 3,
  },

  dashboardFlowStepSubtitle: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },

  // ============================================
  // 10. OVERVIEW - System overview cards
  // ============================================

  overviewGrid: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },

  overviewCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  overviewValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },

  overviewLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },

  overviewBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  overviewBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#3B82F6",
  },

  // ============================================
  // 11. TABS - Filter tabs for visit requests
  // ============================================

  tabBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    paddingRight: 8,
  },

  tab: {
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  tabActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    ...Platform.select({
      ios: {
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 10px 24px rgba(59, 130, 246, 0.18)",
      },
    }),
  },

  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  tabTextActive: {
    color: "#FFF",
  },

  tabCountBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  tabCountBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  tabCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  tabCountTextActive: {
    color: "#FFFFFF",
  },

  // ============================================
  // 12. VISITOR CARD - Individual request card
  // ============================================

  visitorCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  visitorCardHeader: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },

  visitorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },

  visitorAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F59E0B",
  },

  visitorInfo: {
    flex: 1,
  },

  visitorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },

  visitorEmail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  visitorDate: {
    fontSize: 11,
    color: "#94A3B8",
  },

  visitorPurpose: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 18,
  },

  visitorActions: {
    flexDirection: "row",
    gap: 12,
  },

  // ============================================
  // 13. STATUS BADGES - Status indicators
  // ============================================

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // ============================================
  // 14. USER ROW - User list item for management
  // ============================================

  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },

  userEmail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  userMeta: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.1)",
  },

  roleBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#3B82F6",
  },

  deptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(245,158,11,0.1)",
  },

  deptBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#F59E0B",
  },

  userActions: {
    flexDirection: "row",
    gap: 16,
  },

  userManagementList: {
    marginTop: 10,
    maxHeight: 400,
  },

  userStatusBadgeActive: {
    backgroundColor: "rgba(16,185,129,0.15)",
  },

  userStatusBadgeInactive: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },

  userStatusTextActive: {
    color: "#10B981",
  },

  userStatusTextInactive: {
    color: "#EF4444",
  },

  managementHeroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    gap: 18,
  },

  managementHeroMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },

  managementIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  managementHeroCopy: {
    flex: 1,
    gap: 6,
  },

  managementEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  managementDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  managementHeaderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  managementPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },

  managementPrimaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  managementSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
  },

  managementSecondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },

  managementStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },

  managementStatCard: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: 150,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },

  managementStatIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  managementStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },

  managementStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  userWorkspaceCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 20,
  },

  userWorkspaceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  userWorkspaceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },

  userWorkspaceSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  userRefreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
  },

  userRefreshButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  userSearchBox: {
    marginBottom: 14,
  },

  userCardList: {
    gap: 14,
  },

  userManagementCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },

  userManagementCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  userAvatarInitials: {
    fontSize: 17,
    fontWeight: "800",
  },

  userIdentityBlock: {
    flex: 1,
    gap: 4,
  },

  userIdentityTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  userLiveStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  userLiveStatusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  userManagementMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  userManagementMetaPill: {
    minWidth: 180,
    flexGrow: 1,
    flexBasis: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  userManagementMetaText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
  },

  userManagementActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  userManagementActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },

  userManagementDangerButton: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.16)",
  },

  userManagementActionText: {
    fontSize: 12,
    fontWeight: "700",
  },

  userPaginationRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  userPaginationSummary: {
    fontSize: 12,
    color: "#64748B",
  },

  userPaginationControls: {
    flexDirection: "row",
    gap: 10,
  },

  userPaginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  userPaginationButtonDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  userPaginationButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  userPaginationButtonTextDisabled: {
    color: "#94A3B8",
  },

  userEmptyState: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },

  // ============================================
  // 15. SEARCH & FILTERS - Search and filter UI
  // ============================================

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 44,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },

  filterChips: {
    flexDirection: "row",
    marginBottom: 20,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  filterChipTextActive: {
    color: "#FFF",
  },

  // ============================================
  // 16. PRINT BUTTON - Print functionality
  // ============================================

  printButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // ============================================
  // 17. MODALS - Popup windows
  // ============================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  modalBody: {
    padding: 20,
  },

  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },

  userProfileModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    width: "100%",
    maxWidth: 620,
    maxHeight: "86%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  userProfileHero: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  userProfileHeroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  userProfileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  userProfileAvatarText: {
    fontSize: 24,
    fontWeight: "800",
  },

  userProfileCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148,163,184,0.12)",
  },

  userProfileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  userProfileEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 14,
  },

  userProfileBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  userProfileBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  userProfileBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  userProfileBody: {
    flex: 1,
  },

  userProfileBodyContent: {
    padding: 20,
    gap: 18,
  },

  userProfileSection: {
    gap: 12,
  },

  userProfileSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },

  userProfileInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  userProfileInfoCard: {
    minWidth: 220,
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    gap: 6,
  },

  userProfileInfoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#94A3B8",
  },

  userProfileInfoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 20,
  },

  userProfileCallout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  userProfileCalloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#1D4ED8",
  },

  userEditorModal: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    width: "100%",
    maxWidth: 760,
    maxHeight: "88%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  userEditorSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  userEditorBody: {
    paddingBottom: 6,
  },

  userEditorHero: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  userEditorHeroCopy: {
    flex: 1,
    gap: 6,
  },

  userEditorHeroName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  userEditorHeroEmail: {
    fontSize: 13,
    color: "#64748B",
  },

  userEditorSection: {
    marginBottom: 18,
  },

  userEditorSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12,
  },

  userEditorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  userEditorHalfField: {
    minWidth: 220,
    flexGrow: 1,
    flexBasis: 220,
  },

  userEditorReadonlyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },

  userEditorReadonlyText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },

  userEditorRoleWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },

  userEditorRoleOption: {
    minWidth: 120,
    flexGrow: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  createUserModal: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    width: "100%",
    maxWidth: 760,
    maxHeight: "88%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  createUserSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  createUserBody: {
    paddingBottom: 6,
  },

  createUserHero: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  createUserHeroCopy: {
    flex: 1,
    gap: 6,
  },

  createUserHeroTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  createUserHeroText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  createUserPreviewCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    padding: 16,
    gap: 14,
  },

  createUserPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  createUserPreviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },

  createUserPreviewInfoCard: {
    minWidth: 180,
    flexBasis: 180,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#3B82F6",
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },

  confirmModal: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },

  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 14,
    marginBottom: 6,
  },

  confirmMessage: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },

  confirmButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },

  confirmCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  confirmCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },

  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },

  createSuccessIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  createSuccessSummary: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    padding: 16,
    gap: 12,
    marginBottom: 14,
  },

  createSuccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  createSuccessLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  createSuccessValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },

  createSuccessNote: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },

  createSuccessNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#1D4ED8",
    fontWeight: "600",
  },

  rejectModal: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },

  rejectInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    fontSize: 13,
    textAlignVertical: "top",
    minHeight: 90,
    marginVertical: 20,
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
  },

  detailAvatar: {
    alignItems: "center",
    marginBottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignSelf: "center",
  },

  detailAvatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F59E0B",
  },

  detailSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  detailLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },

  inputHint: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
    marginLeft: 4,
  },

  // ============================================
  // 18. REQUEST CARD - Visit request card
  // ============================================

  requestCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
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

  darkRequestCard: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },

  requestCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  requestAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B82F6",
  },

  requestInfo: {
    flex: 1,
  },

  requestName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },

  requestPurpose: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },

  requestDate: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },

  requestDetails: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  requestDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  requestDetailText: {
    fontSize: 12,
    color: "#475569",
  },

  requestActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 30,
    gap: 6,
  },

  approveButton: {
    backgroundColor: "#10B981",
    flex: 1,
  },

  rejectButton: {
    backgroundColor: "#EF4444",
    flex: 1,
  },

  viewButton: {
    width: 44,
    backgroundColor: "#6B7280",
  },

  actionButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    marginBottom: 20,
    gap: 8,
  },

  roleSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },

  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  roleOptionActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  roleTextActive: {
    color: "#FFF",
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },

  // ============================================
  // 19. ANALYTICS SECTION - Visitor analytics UI
  // ============================================

  analyticsContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  analyticsHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  analyticsEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#6366F1",
    marginBottom: 6,
  },

  analyticsHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },

  analyticsHeaderSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  analyticsActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },

  analyticsActionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
  },

  analyticsHeroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },

  analyticsHeroContent: {
    flex: 1,
  },

  analyticsHeroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },

  analyticsHeroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4F46E5",
  },

  analyticsHeroTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: "#1E293B",
  },

  analyticsHeroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 10,
  },

  analyticsHeroStats: {
    width: 180,
    gap: 12,
  },

  analyticsHeroInsightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  analyticsHeroInsightCard: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: 150,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
  },

  analyticsHeroInsightLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#94A3B8",
  },

  analyticsHeroInsightValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  analyticsHeroStat: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    justifyContent: "center",
  },

  analyticsHeroStatValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E293B",
  },

  analyticsHeroStatLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  refreshButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B82F6",
  },

  keyMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  keyMetricCard: {
    flex: 1,
    minWidth: (width - sidebarWidth - 60) / 4,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.05)" },
    }),
  },

  keyMetricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  keyMetricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },

  keyMetricLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  analyticsMetricContent: {
    flex: 1,
  },

  analyticsMetricHelper: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 16,
  },

  analyticsSplitGrid: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },

  analyticsSplitGridStack: {
    flexDirection: "column",
  },

  analyticsPrimaryColumn: {
    flex: 1.4,
    gap: 16,
  },

  analyticsSideColumn: {
    flex: 1,
    gap: 16,
  },

  analyticsChartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  analyticsChartSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  analyticsDatasetSelector: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 999,
    padding: 4,
  },

  analyticsDatasetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  analyticsDatasetButtonActive: {
    backgroundColor: "#3B82F6",
  },

  analyticsDatasetButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  analyticsQuickStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    flexWrap: "wrap",
  },

  analyticsQuickStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  analyticsQuickStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },

  analyticsQuickStatLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  analyticsBarChart: {
    gap: 12,
  },

  analyticsBarRow: {
    gap: 7,
  },

  analyticsBarMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  analyticsBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  analyticsBarValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },

  analyticsBarTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },

  analyticsBarFill: {
    height: "100%",
    borderRadius: 999,
  },

  mainStatsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },

  mainStatCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.05)" },
    }),
  },

  analyticsChartCallout: {
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },

  analyticsChartCalloutCopy: {
    flex: 1,
    minWidth: 220,
  },

  analyticsChartCalloutTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  analyticsChartCalloutText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  analyticsMiniLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },

  analyticsMiniLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  analyticsMiniLegendDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
  },

  analyticsMiniLegendText: {
    fontSize: 12,
    fontWeight: "700",
  },

  analyticsChartSurface: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
  },

  mainStatCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  mainStatCardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  mainStatCardTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  trendBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },

  todayStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },

  todayStatItem: {
    alignItems: "center",
    flex: 1,
  },

  todayStatValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3B82F6",
  },

  todayStatLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  todayStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },

  weeklyChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 130,
    marginTop: 8,
  },

  weeklyBarWrapper: {
    alignItems: "center",
    flex: 1,
  },

  weeklyBar: {
    width: 28,
    borderRadius: 6,
    marginBottom: 8,
  },

  weeklyBarLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  weeklyBarValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 2,
  },

  distributionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  analyticsPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  analyticsPanelSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 4,
  },

  analyticsPanelPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  analyticsPanelPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  distributionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },

  distributionStats: {
    gap: 16,
  },

  distributionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  distributionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  distributionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1E293B",
    width: 70,
  },

  distributionValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    width: 40,
  },

  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },

  distributionBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  distributionPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    width: 45,
    textAlign: "right",
  },

  analyticsDateSummaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  analyticsDateSummaryCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  analyticsDateSummaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },

  analyticsDateSummaryLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  analyticsDateCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  analyticsDateCalloutTextWrap: {
    flex: 1,
  },

  analyticsDateCalloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  analyticsDateCalloutSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  analyticsDateVisitorsList: {
    gap: 10,
  },

  analyticsDateVisitorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  analyticsDateVisitorInfo: {
    flex: 1,
  },

  analyticsDateVisitorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  analyticsDateVisitorMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  analyticsStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  analyticsStatusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  analyticsDistributionFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  analyticsDistributionCallout: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  analyticsDistributionCalloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  analyticsDistributionStat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  analyticsDistributionValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },

  analyticsDistributionLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  // Visitor History Styles
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.05)" },
    }),
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  historyOverviewRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  historyOverviewCard: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: 150,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  historyOverviewValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },

  historyOverviewLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  historyHeaderRight: {
    flexDirection: "row",
    gap: 12,
  },

  historyRefreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  historyFilters: {
    marginBottom: 16,
    gap: 12,
  },

  historyFilterChips: {
    flexDirection: "row",
    gap: 8,
  },

  historyFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  historyFilterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  historyFilterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  historyFilterChipTextActive: {
    color: "#FFFFFF",
  },

  historySearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  historySearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    paddingVertical: 4,
  },

  historyItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  historyItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },

  historyItemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  historyItemAvatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
  },

  historyItemInfo: {
    flex: 1,
  },

  historyItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },

  historyItemEmail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  historyItemPurpose: {
    fontSize: 12,
    color: "#475569",
  },

  historyItemDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  historyDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  historyDetailText: {
    fontSize: 11,
    color: "#6B7280",
  },

  historyTodayBadge: {
    color: "#10B981",
    fontWeight: "600",
  },

  historyPastBadge: {
    color: "#EF4444",
    fontWeight: "600",
  },

  emptyHistoryState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 4,
  },

  emptyHistorySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },

  // ============================================
  // DARK MODE SPECIFIC STYLES
  // ============================================

  darkText: {
    color: '#F1F5F9',
  },

  darkTextSecondary: {
    color: '#94A3B8',
  },

  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  darkHeader: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },

  darkSidebar: {
    backgroundColor: '#0F172A',
  },

  darkBorder: {
    borderColor: '#334155',
  },

  darkInput: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    color: '#F1F5F9',
  },

  darkStatCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  darkChartCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  darkWelcomeBanner: {
    backgroundColor: '#1E3A5F',
  },

  darkModal: {
    backgroundColor: '#1E293B',
  },

  darkModalHeader: {
    borderBottomColor: '#334155',
  },

  darkModalFooter: {
    borderTopColor: '#334155',
  },

  // ============================================
  // 20. SETTINGS SECTION - System settings UI
  // ============================================

  settingsContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },

  settingsHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },

  settingsHeaderSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  settingsHeaderActions: {
    flexDirection: "row",
    gap: 12,
  },

  settingsResetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  settingsResetButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },

  settingsSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
  },

  settingsSaveButtonDisabled: {
    opacity: 0.7,
  },

  settingsSaveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  settingsTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 16,
  },

  settingsTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "transparent",
  },

  settingsTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  settingsTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },

  settingsTabTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },

  settingsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  settingsCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  settingsCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  profileEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  profileRole: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 2,
  },

  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },

  editProfileButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  passwordChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  passwordChangeInfo: {
    flex: 1,
  },

  passwordChangeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  passwordChangeDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  settingDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  selectGroup: {
    flexDirection: "row",
    gap: 8,
  },

  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  selectOptionActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  selectOptionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  selectOptionTextActive: {
    color: "#FFFFFF",
  },

  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  numberInputButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  numberInput: {
    width: 60,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },

  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#FEE2E2",
  },

  dangerButtonInfo: {
    flex: 1,
  },

  dangerButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },

  dangerButtonDescription: {
    fontSize: 11,
    color: "#FCA5A5",
    marginTop: 2,
  },
});
