import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const webHover = (styles) => (isWeb ? styles : {});

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  dashboardLayout: {
    flex: 1,
    flexDirection: width > 960 ? "row" : "column",
    backgroundColor: "#F4F8FC",
  },

  sidebar: {
    width: width > 960 ? 296 : "100%",
    backgroundColor: "#F8FBFE",
    borderRightWidth: width > 960 ? 1 : 0,
    borderBottomWidth: width > 960 ? 0 : 1,
    borderColor: "#E2E8F0",
    padding: 18,
    gap: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
      web: width > 960 ? { boxShadow: "8px 0px 24px rgba(15, 23, 42, 0.04)" } : {},
    }),
  },

  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E6F5",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: "0px 12px 22px rgba(15, 23, 42, 0.06)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        ":hover": {
          borderColor: "#B7D5F6",
          boxShadow: "0px 16px 28px rgba(15, 23, 42, 0.08)",
        },
      },
    }),
  },

  sidebarAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0A3D91",
    justifyContent: "center",
    alignItems: "center",
  },

  sidebarAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  sidebarUserCopy: {
    flex: 1,
  },

  sidebarUserName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  sidebarUserRole: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  sidebarScroll: {
    flexGrow: 0,
  },

  sidebarHoverSurface: {
    cursor: "pointer",
    transformOrigin: "center",
  },

  sidebarModuleCard: {
    marginBottom: 10,
  },

  sidebarModuleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#D9E4F0",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#EEF5FF",
        borderColor: "#9EC5F8",
        transform: "translateX(3px)",
      },
    }),
  },

  sidebarModuleButtonActive: {
    backgroundColor: "#EEF5FF",
    borderColor: "#9EC5F8",
  },

  sidebarModuleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...webHover({
      transition: "transform 0.18s ease",
      ":hover": {
        transform: "scale(1.05)",
      },
    }),
  },

  sidebarModuleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  sidebarModuleLabelActive: {
    color: "#0F172A",
  },

  sidebarSubmoduleList: {
    marginLeft: 18,
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    gap: 8,
  },

  sidebarSubmoduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#EEF5FF",
        transform: "translateX(3px)",
      },
    }),
  },

  sidebarSubmoduleButtonActive: {
    backgroundColor: "#EEF5FF",
  },

  sidebarSubmoduleLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  sidebarSubmoduleLabelActive: {
    color: "#041E42",
  },

  sidebarSubmoduleBadge: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  sidebarSubmoduleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },

  contentArea: {
    flex: 1,
  },

  contentScroll: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  loadingSubtext: {
    marginTop: 6,
    paddingHorizontal: 24,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
    gap: 18,
  },

  pageHeaderCard: {
    backgroundColor: "#FCFEFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 16px 30px rgba(15, 23, 42, 0.05)" },
    }),
  },

  pageEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  pageTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  pageSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    maxWidth: 720,
  },

  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.18,
        shadowRadius: 26,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 18px 36px rgba(10, 61, 145, 0.20)" },
    }),
  },

  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  heroCopy: {
    flex: 1,
  },

  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.74)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.82)",
    marginTop: 10,
    maxWidth: 620,
  },

  profileInitials: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },

  homeInsightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  homeInsightCard: {
    flex: 1,
    minWidth: width > 720 ? 220 : "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: "0px 14px 28px rgba(15, 23, 42, 0.05)",
        cursor: "default",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-3px)",
          boxShadow: "0px 18px 34px rgba(15, 23, 42, 0.09)",
          borderColor: "#B7D5F6",
        },
      },
    }),
  },

  homeInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  homeInsightIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#DCE8F4",
    marginBottom: 12,
  },

  homeInsightLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  homeInsightValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  homeInsightMeta: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  todayScheduleList: {
    gap: 12,
  },

  todayScheduleCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    backgroundColor: "#F8FBFE",
    padding: 16,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#FFFFFF",
        borderColor: "#B7D5F6",
        transform: "translateY(-2px)",
        boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.08)",
      },
    }),
  },

  todayScheduleTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  todayScheduleName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  todayScheduleMeta: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },

  todaySchedulePurpose: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  homeInsightAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  homeInsightActionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  heroStat: {
    minWidth: 108,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  heroStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  recordToolbar: {
    flexDirection: width > 980 ? "row" : "column",
    alignItems: "stretch",
    gap: 14,
    marginBottom: 16,
  },

  recordToolbarCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },

  recordToolbarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  recordToolbarTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },

  recordToolbarClear: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F8FBFE",
  },

  recordToolbarClearText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
  },

  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  quickActionCard: {
    flex: 1,
    minWidth: width > 640 ? 220 : undefined,
    width: width > 640 ? undefined : "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: "0px 14px 26px rgba(15, 23, 42, 0.05)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 20px 38px rgba(15, 23, 42, 0.10)",
          borderColor: "#B7D5F6",
        },
      },
    }),
  },

  quickActionMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  quickActionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  quickActionBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  quickActionIconBlue: {
    backgroundColor: "#EEF5FF",
  },

  quickActionIconGreen: {
    backgroundColor: "#DCFCE7",
  },

  quickActionIconPurple: {
    backgroundColor: "#EDE9FE",
  },

  quickActionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  quickActionSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  quickActionFooterText: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },

  filterChipActive: {
    backgroundColor: "#0A3D91",
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBE3F0",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 0,
  },

  searchBarInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 22,
      },
      android: { elevation: 3 },
      web: {
        boxShadow: "0px 16px 32px rgba(15, 23, 42, 0.06)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        ":hover": {
          boxShadow: "0px 20px 38px rgba(15, 23, 42, 0.08)",
          borderColor: "#CFE0F2",
        },
      },
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  sectionActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  sectionActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EEF5FF",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#DCEBFF",
        transform: "translateY(-1px)",
      },
    }),
  },

  sectionActionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
  },

  sectionActionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8F4",
    backgroundColor: "#F8FBFE",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#EEF5FF",
        borderColor: "#B7D5F6",
        transform: "translateY(-1px)",
      },
    }),
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 26,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },

  emptyRefreshButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E6F5",
  },

  emptyRefreshButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
  },

  appointmentCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F8FBFE",
  },

  appointmentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  appointmentInfo: {
    flex: 1,
  },

  appointmentName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  appointmentPurpose: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
    lineHeight: 19,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },

  metaItem: {
    width: width > 900 ? "23%" : width > 640 ? "48%" : "100%",
  },

  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 4,
  },

  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
  },

  noteBoxReject: {
    backgroundColor: "#FEF2F2",
  },

  noteBoxComplete: {
    backgroundColor: "#F1F5F9",
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#9A3412",
  },

  noteTextReject: {
    color: "#991B1B",
  },

  noteTextComplete: {
    color: "#334155",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },

  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 118,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#0A3D91",
  },

  primaryActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 126,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
  },

  secondaryActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#041E42",
  },

  rejectAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 102,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
  },

  rejectActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },

  completeAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 180,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#475569",
  },

  completeActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabledAction: {
    opacity: 0.7,
  },

  notificationItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E5EDF5",
    marginBottom: 10,
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#FFFFFF",
        borderColor: "#B7D5F6",
        transform: "translateX(3px)",
        boxShadow: "0px 10px 22px rgba(15, 23, 42, 0.07)",
      },
    }),
  },

  notificationItemUnread: {
    backgroundColor: "#EEF5FF",
    borderColor: "#BFDBFE",
  },

  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#1C6DD0",
  },

  notificationDotUnread: {
    backgroundColor: "#0A3D91",
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  notificationBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  notificationTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  notificationTypeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  notificationUnreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  notificationUnreadBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1D4ED8",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  notificationMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  notificationActionHint: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  notificationFooterRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  notificationTimestamp: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  tableCard: {
    minWidth: width > 960 ? 0 : 1060,
    width: width > 960 ? "100%" : 1060,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  tableScroll: {
    marginHorizontal: -2,
  },

  tableScrollContent: {
    paddingBottom: 2,
  },

  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 18,
    paddingVertical: 0,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  tableHeaderColumnWide: {
    justifyContent: "center",
    paddingRight: 14,
  },

  tableHeaderColumn: {
    justifyContent: "center",
    paddingRight: 14,
  },

  tableHeaderColumnActions: {
    width: width > 900 ? 250 : 220,
    justifyContent: "center",
  },

  tableHeaderCellWide: {
    paddingVertical: 14,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  tableHeaderCell: {
    paddingVertical: 14,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  tableHeaderCellActions: {
    paddingVertical: 14,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    textAlign: "right",
  },

  tableBodyRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 18,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  tableEmptyState: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  tableCellWide: {
    justifyContent: "flex-start",
    paddingVertical: 16,
    paddingRight: 14,
  },

  tableCell: {
    justifyContent: "flex-start",
    paddingVertical: 16,
    paddingRight: 14,
  },

  tableCellActions: {
    width: width > 900 ? 250 : 220,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    alignContent: "flex-start",
    gap: 8,
    flexWrap: "wrap",
    paddingVertical: 14,
  },

  tableColumnVisitor: {
    width: 300,
  },

  tableColumnSchedule: {
    width: 170,
  },

  tableColumnOffice: {
    width: 210,
  },

  tableColumnStatus: {
    width: 120,
  },

  tablePrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  tableSecondaryText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  tableHelperText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  tableMutedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },

  tableActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    minWidth: 78,
    alignItems: "center",
  },

  tableActionButtonPrimary: {
    backgroundColor: "#0A3D91",
  },

  tableActionButtonDanger: {
    backgroundColor: "#FEE2E2",
  },

  tableActionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#041E42",
  },

  tableActionButtonPrimaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  tableActionButtonDangerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },

  accountInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    padding: 16,
  },

  accountInfoBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#5B21B6",
  },

  accountProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },

  accountProfileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  accountProfileActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  accountTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },

  accountTabButtonActive: {
    backgroundColor: "#0A3D91",
  },

  accountTabButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },

  accountTabButtonTextActive: {
    color: "#FFFFFF",
  },

  accountProfileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0A3D91",
    justifyContent: "center",
    alignItems: "center",
  },

  accountProfileAvatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accountProfileCopy: {
    flex: 1,
  },

  accountProfileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  accountProfileRole: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  accountHeroStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  accountHeroMetric: {
    flex: 1,
    minWidth: width > 900 ? 180 : 150,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  accountHeroMetricLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  accountHeroMetricValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  accountSectionHeader: {
    marginBottom: 16,
  },

  accountSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  accountSectionSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  accountInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  accountInfoItem: {
    width: width > 900 ? "31%" : width > 640 ? "48%" : "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    padding: 14,
  },

  accountInfoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  accountInfoValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  accountEditForm: {
    gap: 18,
  },

  accountEditGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  accountField: {
    width: width > 900 ? "48%" : "100%",
  },

  accountFieldFull: {
    width: "100%",
  },

  accountReadOnlyCard: {
    width: width > 900 ? "48%" : "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    padding: 14,
  },

  accountReadOnlyLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  accountReadOnlyValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  accountFieldLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  accountFieldInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBE3F0",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  accountFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  accountPrimaryButton: {
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#0A3D91",
  },

  accountPrimaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  accountSecondaryButton: {
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#EEF2F7",
  },

  accountSecondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  accountNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  accountNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  accountSecurityTipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  accountSecurityTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 16,
  },

  detailScroll: {
    marginTop: 8,
    maxHeight: 520,
  },

  detailScrollContent: {
    paddingBottom: 4,
    gap: 14,
  },

  detailPanelCard: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    backgroundColor: "#FFFFFF",
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 22,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 16px 32px rgba(15, 23, 42, 0.06)" },
    }),
  },

  detailPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },

  detailPanelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  detailPanelSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  detailPanelCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8F4",
    backgroundColor: "#F8FBFE",
    alignItems: "center",
    justifyContent: "center",
  },

  detailItem: {
    width: width > 900 ? "48%" : "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    padding: 14,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  detailValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },

  detailNoteCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FBFE",
    padding: 14,
  },

  detailNoteText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },

  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  detailTimelineSection: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },

  detailTimelineList: {
    marginTop: 12,
    gap: 12,
  },

  detailTimelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  detailTimelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#94A3B8",
    marginTop: 4,
  },

  detailTimelineDotApproved: {
    backgroundColor: "#0A3D91",
  },

  detailTimelineDotCheckedIn: {
    backgroundColor: "#0F9D58",
  },

  detailTimelineDotCompleted: {
    backgroundColor: "#475569",
  },

  detailTimelineDotCheckedOut: {
    backgroundColor: "#7C3AED",
  },

  detailTimelineContent: {
    flex: 1,
  },

  detailTimelineLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  detailTimelineValue: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
    flexWrap: "wrap",
  },

  paginationInfo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  paginationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  paginationButton: {
    minWidth: 108,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  paginationButtonDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  paginationButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  paginationButtonTextDisabled: {
    color: "#94A3B8",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    ...webHover({
      cursor: "pointer",
      transition: "all 0.18s ease",
      ":hover": {
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        transform: "translateY(-1px)",
      },
    }),
  },

  logoutButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  modalField: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBE3F0",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 14,
  },

  modalFieldTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  modalFieldIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  modalFieldIconWarm: {
    backgroundColor: "#FEF3C7",
  },

  modalFieldBody: {
    flex: 1,
  },

  modalFieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  modalFieldValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalFieldHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    marginTop: 14,
  },

  modalTextarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  modalCancel: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },

  modalSubmit: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#041E42",
    alignItems: "center",
  },

  modalSubmitText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  modalReject: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },

  modalRejectText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
