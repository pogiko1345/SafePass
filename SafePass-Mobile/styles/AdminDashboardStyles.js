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
    backgroundColor: "#1E3A5F",
    height: "100%",
  },

  sidebarContent: {
    paddingBottom: 30,
  },

  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
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
    fontSize: 16,
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
    backgroundColor: "rgba(255,255,255,0.1)",
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },

  sidebarMenuItemActive: {
    backgroundColor: "rgba(59,130,246,0.2)",
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
    backgroundColor: "#F8FAFC",
  },

  contentScrollView: {
    flex: 1,
  },

  dashboardScrollContent: {
    paddingBottom: 40,
  },

  pageContainer: {
    padding: 24,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
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

  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59,130,246,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },

  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
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
    gap: 16,
    marginTop: 12,
  },

  quickActionCard: {
    flex: 1,
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
    gap: 12,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
  },

  tabActive: {
    backgroundColor: "#3B82F6",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  tabTextActive: {
    color: "#FFF",
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

  // Visitor History Styles
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
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
