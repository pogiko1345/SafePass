import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const sidebarWidth = 284;
const isWeb = Platform.OS === "web";

export default StyleSheet.create({
  // 1. CONTAINERS - Main layout containers
  
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
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
    color: "#475569",
    fontWeight: "600",
  },

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F8FC",
  },

  // ============================================
  // 2. SIDEBAR - Left navigation panel
  // ============================================

  sidebar: {
    width: sidebarWidth,
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: "8px 0px 24px rgba(15, 23, 42, 0.04)",
      },
    }),
  },

  sidebarContent: {
    paddingBottom: 18,
  },

  sidebarHeader: {
    padding: 14,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8E6F5",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 12px 22px rgba(15, 23, 42, 0.06)" },
    }),
  },

  sidebarLogoImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D8E6F5",
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
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
  },

  sidebarRoleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#B7D5F6",
    marginBottom: 18,
  },

  sidebarRoleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0A3D91",
    letterSpacing: 0.8,
  },

  sidebarStats: {
    flexDirection: "row",
    backgroundColor: "#F8FBFE",
    borderRadius: 18,
    padding: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sidebarStat: {
    flex: 1,
    alignItems: "center",
  },

  sidebarStatNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  sidebarStatLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  sidebarStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },

  sidebarMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
  },

  sidebarMenuItemActive: {
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#9EC5F8",
  },

  sidebarMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sidebarMenuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  sidebarMenuLabelActive: {
    color: "#0F172A",
    fontWeight: "600",
  },

  sidebarMenuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1C6DD0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  sidebarMenuBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
  },

  sidebarOverviewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#D9E4F0",
  },

  sidebarOverviewButtonActive: {
    backgroundColor: "#EEF5FF",
    borderColor: "#9EC5F8",
  },

  sidebarModuleGroup: {
    paddingHorizontal: 0,
    gap: 12,
  },

  sidebarModuleCard: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#D9E4F0",
    overflow: "hidden",
  },

  sidebarModuleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  sidebarModuleButtonActive: {
    backgroundColor: "#EEF5FF",
    borderColor: "#9EC5F8",
  },

  sidebarModuleCopy: {
    flex: 1,
  },

  sidebarModuleHint: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },

  sidebarSubmoduleList: {
    paddingHorizontal: 10,
    paddingBottom: 12,
    gap: 8,
  },

  sidebarSubmoduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
  },

  sidebarSubmoduleButtonActive: {
    backgroundColor: "#EEF5FF",
  },

  sidebarSubmoduleLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  sidebarSubmoduleLabelActive: {
    color: "#041E42",
  },

  sidebarSubmoduleBadge: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  sidebarSubmoduleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },

  sidebarUtilityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#D9E4F0",
  },

  sidebarUtilityButtonActive: {
    backgroundColor: "#EEF5FF",
    borderColor: "#9EC5F8",
  },

  sidebarUserSection: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D9E4F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  sidebarUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  sidebarUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
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
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },

  sidebarUserEmail: {
    fontSize: 10,
    color: "#64748B",
  },

  sidebarLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 12,
  },

  sidebarLogoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },

  sidebarFooter: {
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 20,
  },

  sidebarFooterText: {
    fontSize: 10,
    color: "#94A3B8",
    marginBottom: 2,
    textAlign: "center",
  },

  sidebarFooterVersion: {
    fontSize: 9,
    color: "#CBD5E1",
  },

  // ============================================
  // 3. CONTENT AREA - Main content section
  // ============================================

  contentArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  adminContentShell: {
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  adminMonitoringDock: {
    width: 420,
    borderLeftWidth: 1,
    backgroundColor: "rgba(255,255,255,0.94)",
  },

  adminMonitoringDockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  adminMonitoringDockBody: {
    flex: 1,
    padding: 18,
  },

  contentScrollView: {
    flex: 1,
  },

  dashboardScrollContent: {
    paddingBottom: 40,
  },

  pageContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 26,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  adminSectionShell: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 16px 40px rgba(15,23,42,0.08)" },
    }),
  },

  adminSectionShellHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
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
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  adminFeedbackBanner: {
    marginHorizontal: 22,
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
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
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },

  modularCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  appointmentOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },

  appointmentOptionCard: {
    flex: 1,
    flexBasis: 320,
    minWidth: width < 760 ? "100%" : 300,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 2,
  },

  appointmentOptionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },

  appointmentOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
  },

  appointmentOptionTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  appointmentOptionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  appointmentOptionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  appointmentOptionCountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  appointmentOptionCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
  },

  appointmentOptionAddRow: {
    flexDirection: width < 760 ? "column" : "row",
    gap: 8,
    marginBottom: 14,
  },

  appointmentOptionInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === "web" ? 9 : 10,
    fontSize: 13,
    color: "#0F172A",
    backgroundColor: "#F8FBFE",
  },

  appointmentOptionAddButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#0A3D91",
  },

  appointmentOptionAddText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  appointmentOptionList: {
    gap: 9,
  },

  appointmentOptionItem: {
    flexDirection: width < 760 ? "column" : "row",
    alignItems: width < 760 ? "stretch" : "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
  },

  appointmentOptionItemMain: {
    flex: 1,
    minWidth: 0,
  },

  appointmentOptionItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 5,
  },

  appointmentOptionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  appointmentOptionStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  appointmentOptionEditInput: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: Platform.OS === "web" ? 7 : 8,
    fontSize: 13,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  appointmentOptionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: width < 760 ? "flex-start" : "flex-end",
    gap: 6,
  },

  appointmentOptionMiniButton: {
    minHeight: 32,
    minWidth: 34,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
  },

  appointmentOptionMiniText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
  },

  appointmentOptionEmpty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  appointmentOptionEmptyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  modularActionCard: {
    minWidth: 220,
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },

  modularActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modularActionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  modularActionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginBottom: 14,
  },

  modularActionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  modularActionBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  modularInfoPanel: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  modularInfoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  modularInfoStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  modularInfoStatCard: {
    minWidth: 120,
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  modularInfoStatValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },

  modularInfoStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  modularTwoColumnLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  modularMapColumn: {
    flex: 1.45,
    minWidth: 340,
  },

  modularEditorCard: {
    flex: 1,
    minWidth: 300,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  modularRoomsPanel: {
    maxWidth: 420,
  },

  modularEditorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  modularEditorHint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 12,
  },

  modularEditorSecondaryTitle: {
    marginTop: 18,
  },

  modularTextInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FBFE",
    marginBottom: 10,
  },

  modularSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  modularSwitchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  modularEditorActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  modularListStack: {
    gap: 12,
  },

  modularRoomTable: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  modularRoomTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  modularRoomTableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  modularRoomTableActionsHeader: {
    flex: 0,
    width: 88,
    textAlign: "center",
  },

  modularRoomTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  modularRoomTableNameCell: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  modularRoomTablePositionCell: {
    flex: 1,
    textAlign: "left",
    paddingRight: 10,
  },

  modularRoomTableActionsCell: {
    width: 88,
    justifyContent: "flex-end",
    flexShrink: 0,
  },

  modularListCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },

  modularListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  modularListCopy: {
    flex: 1,
    minWidth: 0,
  },

  modularListTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  modularListMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  modularInlineActions: {
    flexDirection: "row",
    gap: 8,
  },

  modularInlineButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  modularEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  modularEmptyStateText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#64748B",
  },

  modularStatCard: {
    minWidth: 160,
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  modularStatValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },

  modularStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  adminTableScroll: {
    marginTop: 14,
    alignSelf: "stretch",
    overflow: "visible",
  },

  adminTableScrollContent: {
    alignItems: "flex-start",
    alignSelf: "stretch",
  },

  adminTable: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  adminTableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F8FBFE",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  adminTableRow: {
    flexDirection: "row",
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  adminTableCell: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    justifyContent: "center",
  },

  adminTableHeaderCell: {
    paddingVertical: 12,
  },

  adminTableFlexCell: {
    flex: 1,
    minWidth: 100,
  },

  adminTableHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  adminTableCellText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#0F172A",
  },

  adminTablePrimaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },

  adminTableSecondaryText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  adminTableIdentityCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  adminTableIdentityCopy: {
    flex: 1,
  },

  adminTableActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  adminTableActionButton: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  adminTableActionText: {
    fontSize: 11,
    fontWeight: "700",
  },

  recordListActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  recordListPrintButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },

  recordListPrintButtonDisabled: {
    opacity: 0.58,
  },

  recordListPrintButtonText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // ============================================
  // 4. HEADER - Top bar with title and profile
  // ============================================

  header: {
<<<<<<< HEAD
    backgroundColor: "#0A3D91",
    paddingHorizontal: 28,
=======
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 24,
>>>>>>> 1900747baa350e6bde5fb7eb1082e647f59aebd4
    paddingTop: Platform.select({ ios: 50, android: 20, web: 20 }),
    paddingBottom: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#B7D5F6",
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 12px 30px rgba(10,61,145,0.18)" },
    }),
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },

  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#DCEBFF",
    marginTop: 6,
    lineHeight: 20,
  },

  headerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  headerMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B7D5F6",
  },

  headerMetaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0A3D91",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },

  headerPrintButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: "0px 10px 24px rgba(15,23,42,0.08)" },
    }),
  },

  headerPrintButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(14,165,233,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1C6DD0",
    justifyContent: "center",
    alignItems: "center",
  },

  pageRefreshButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E1EC",
    ...Platform.select({
      web: { boxShadow: "0px 10px 24px rgba(15,23,42,0.08)" },
    }),
  },

  dashboardHeroCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 18px 40px rgba(15,23,42,0.08)" },
    }),
  },

  dashboardHeroLeft: {
    flex: 1,
  },

  dashboardHeroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 7,
    letterSpacing: -0.3,
  },

  dashboardHeroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.78)",
    marginBottom: 8,
  },

  dashboardHeroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 20,
    maxWidth: 680,
  },

  dashboardHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  dashboardHeroBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  hoverBubble: {
    ...Platform.select({
      web: {
        cursor: "pointer",
        transitionProperty: "box-shadow, filter",
        transitionDuration: "180ms",
      },
    }),
  },

  dashboardStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },

  dashboardStatCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },

  dashboardStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dashboardStatLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  dashboardStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  dashboardStatValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 14,
    letterSpacing: -0.4,
  },

  dashboardNotificationCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 3,
  },

  dashboardNotificationLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dashboardNotificationIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },

  dashboardNotificationTextWrap: {
    flex: 1,
  },

  dashboardNotificationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 3,
  },

  dashboardNotificationText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },

  dashboardNotificationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF7ED",
  },

  dashboardNotificationBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1C6DD0",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  dashboardSectionCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 3,
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
    color: "#0A3D91",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },

  adminMapSection: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },

  adminMapFilters: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
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
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  adminMapFilterChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
  },

  adminMapFilterChipActive: {
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
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
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  adminMapSideCard: {
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
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
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },

  adminMapFocusCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
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
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
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
    backgroundColor: "#1C6DD0",
    margin: 20,
    marginTop: 16,
    padding: 22,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#1C6DD0",
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
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
      },
      android: { elevation: 3 },
      web: {
        boxShadow: "0px 14px 32px rgba(15,23,42,0.07)",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
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
    gap: 12,
    marginTop: 2,
    marginBottom: 14,
  },

  quickActionCard: {
    minWidth: 220,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    minHeight: 132,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },

  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  quickActionContent: {
    marginTop: 12,
    marginBottom: 12,
  },

  quickActionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 2,
  },

  quickActionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 17,
  },

  quickActionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
    ...Platform.select({
      ios: {
        shadowColor: "#1C6DD0",
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
    color: "#1C6DD0",
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
    minWidth: 0,
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
    color: "#1C6DD0",
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
    color: "#1C6DD0",
  },

  userActions: {
    flexDirection: "row",
    gap: 16,
  },

  userManagementList: {
    marginTop: 10,
    flex: 1,
  },

  userManagementModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    width: "100%",
    maxWidth: 500,
    height: Math.min(height * 0.86, 720),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  userManagementModalBody: {
    flex: 1,
    padding: 20,
    minHeight: 0,
  },

  userManagementTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  userStatusBadgeActive: {
    backgroundColor: "rgba(16,185,129,0.15)",
  },

  userStatusBadgeInactive: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },

  userStatusTextActive: {
    color: "#1C6DD0",
  },

  userStatusTextInactive: {
    color: "#EF4444",
  },

  managementHeroCard: {
    borderWidth: 1,
    borderRadius: 16,
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
    borderRadius: 12,
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
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF5FF",
    backgroundColor: "#EFF6FF",
  },

  managementSecondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C6DD0",
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
    borderRadius: 12,
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
    borderRadius: 16,
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
    borderColor: "#EEF5FF",
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
    backgroundColor: "#F8FBFE",
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
    backgroundColor: "#F8FBFE",
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
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  filterChipTextActive: {
    color: "#FFF",
  },

  recordsToolPanel: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 14,
  },

  recordsFilterPanel: {
    marginBottom: 18,
  },

  recordsToolHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },

  recordsToolIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  recordsToolCopy: {
    flex: 1,
  },

  recordsResetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  recordsResetButtonText: {
    fontSize: 11,
    fontWeight: "800",
  },

  recordsToolTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },

  recordsToolSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  recordsSearchRow: {
    flexDirection: width < 760 ? "column" : "row",
    alignItems: width < 760 ? "stretch" : "center",
    gap: 10,
  },

  recordsSearchInputWrap: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 12,
  },

  recordsSearchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    paddingVertical: Platform.OS === "web" ? 10 : 8,
  },

  recordsSearchButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    paddingHorizontal: 18,
  },

  recordsSearchButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  recordsFilterChips: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 8,
  },

  recordsFilterFooter: {
    marginTop: 10,
  },

  recordsFilterAccordion: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  recordsFilterAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  recordsFilterAccordionLabel: {
    marginBottom: 0,
  },

  recordsFilterGroup: {
    marginTop: 8,
  },

  recordsFilterGroupLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },

  recordsFilterChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  recordsDateRangeWrap: {
    marginTop: 2,
  },

  recordsDateRangeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },

  recordsDateButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  recordsDateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  recordsDateClearButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  recordsDateClearText: {
    fontSize: 12,
    fontWeight: "700",
  },

  recordsFilterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },

  recordsFilterChipTextActive: {
    color: "#FFFFFF",
  },

  dataManagementToolbar: {
    marginTop: 14,
    marginBottom: 10,
    flexDirection: width < 760 ? "column" : "row",
    alignItems: width < 760 ? "stretch" : "center",
    gap: 8,
  },

  dataManagementSearchBox: {
    flex: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 11,
  },

  dataManagementSearchInput: {
    flex: 1,
    fontSize: 12,
    color: "#0F172A",
    paddingVertical: Platform.OS === "web" ? 8 : 7,
  },

  dataManagementPrimaryButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#0A3D91",
  },

  dataManagementPrimaryButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  dataManagementGhostButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF5FF",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
  },

  dataManagementGhostButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
  },

  dataManagementFilterBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FBFE",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 10,
  },

  dataManagementFilterRow: {
    flexDirection: width < 760 ? "column" : "row",
    alignItems: width < 760 ? "stretch" : "center",
    gap: 8,
  },

  dataManagementFilterLabel: {
    width: width < 760 ? "auto" : 54,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.55,
    textTransform: "uppercase",
    color: "#64748B",
  },

  dataManagementChipRow: {
    gap: 7,
    paddingRight: 8,
  },

  dataManagementChip: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  dataManagementChipActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  dataManagementChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },

  dataManagementChipTextActive: {
    color: "#FFFFFF",
  },

  userDataBottomPanel: {
    borderWidth: 1,
    borderColor: "#EEF5FF",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 18,
  },

  userDataPanelHeader: {
    flexDirection: width < 760 ? "column" : "row",
    justifyContent: "space-between",
    alignItems: width < 760 ? "stretch" : "flex-start",
    gap: 12,
    marginBottom: 14,
  },

  userDataPanelIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  userDataPanelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },

  userDataPanelTitleBlock: {
    flex: 1,
  },

  userDataPanelTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 3,
  },

  userDataPanelSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    marginBottom: 8,
  },

  userDataPanelActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: width < 760 ? "flex-start" : "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },

  userDataInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  userDataInfoCard: {
    flexGrow: 1,
    flexBasis: width < 900 ? 180 : 220,
    minWidth: 170,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  userDataInfoCopy: {
    flex: 1,
  },

  userDataEditGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  userDataCompactOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  userDataCompactOption: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 999,
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  userDataCompactOptionActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },

  userDataCompactOptionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },

  userDataCompactOptionTextActive: {
    color: "#FFFFFF",
  },

  userDataPanelFooter: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
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
    borderRadius: 16,
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

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
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

  pendingRequestsModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 760,
    maxHeight: "86%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pendingRequestsModalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  pendingRequestsModalList: {
    maxHeight: 520,
  },

  pendingRequestsModalListContent: {
    padding: 16,
    gap: 12,
  },

  pendingRequestsModalEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 42,
    paddingHorizontal: 20,
  },

  pendingRequestsModalEmptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  pendingRequestsModalEmptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },

  userProfileModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
    borderColor: "#B7D5F6",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  userProfileCalloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#041E42",
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
    backgroundColor: "#F8FBFE",
    marginBottom: 12,
  },

  userEditorReadonlyText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },

  staffDropdownTrigger: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FBFE",
  },

  staffDropdownValueWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  staffDropdownValue: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },

  staffDropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  staffDropdownOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  staffDropdownOptionActive: {
    backgroundColor: "#1C6DD0",
    borderBottomColor: "#1C6DD0",
  },

  staffDropdownOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },

  staffDropdownOptionTextActive: {
    color: "#FFFFFF",
  },

  staffDropdownOptionMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  staffDropdownOptionMetaActive: {
    color: "rgba(255,255,255,0.82)",
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
    backgroundColor: "#F8FBFE",
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: "#F8FBFE",
    marginBottom: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
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
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1C6DD0",
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },

  confirmModal: {
    backgroundColor: "#FFF",
    borderRadius: 16,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  createSuccessSummary: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#F8FBFE",
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
    borderColor: "#B7D5F6",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },

  createSuccessNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#041E42",
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
    backgroundColor: "#F8FBFE",
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
    color: "#1C6DD0",
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
    color: "#1C6DD0",
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
    backgroundColor: "#F8FBFE",
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
    backgroundColor: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
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
    color: "#0A3D91",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
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
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  trendBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1C6DD0",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
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
    backgroundColor: "#F8FBFE",
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
    backgroundColor: "#F8FBFE",
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
    color: "#1C6DD0",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
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
    color: "#1C6DD0",
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
    color: "#1C6DD0",
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
    backgroundColor: "#1C6DD0",
    borderColor: "#1C6DD0",
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
    backgroundColor: "#F8FBFE",
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

  staffCreationLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "flex-start",
  },

  staffCreationFormCard: {
    flex: 1,
    minWidth: 320,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 18,
  },

  staffCreationAside: {
    width: 320,
    gap: 18,
  },

  managementQuickStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  managementQuickStatCard: {
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },

  managementQuickStatIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  managementQuickStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },

  managementQuickStatLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  managementQuickStatMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  staffChecklist: {
    gap: 12,
    marginTop: 8,
  },

  staffChecklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  staffChecklistText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  inlineCreateFooter: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },

  inputErrorState: {
    borderColor: "#EF4444",
  },

  formErrorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    color: "#DC2626",
  },
});
