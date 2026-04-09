import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  // ============ CONTAINERS ============
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
    color: "#64748B",
    fontWeight: "500",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // ============ HEADER ============
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },

  profileGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  profileInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Status Card in Header
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timerText: {
    fontSize: 14,
    fontWeight: "500",
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
    marginHorizontal: 20,
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
    backgroundColor: "#EDE9FE",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },

  nfcInstructionsText: {
    flex: 1,
    fontSize: 12,
    color: "#4F46E5",
    lineHeight: 18,
    fontWeight: "500",
  },

  // ============ MAP CARD ============
  mapCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" },
    }),
  },

  mapGradient: {
    padding: 20,
    borderRadius: 20,
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
    fontWeight: "700",
    color: "#D97706",
    marginBottom: 4,
  },

  mapSubtitle: {
    fontSize: 13,
    color: "#92400E",
    marginBottom: 12,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  mapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },

  mapIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(217, 119, 6, 0.1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ PENDING APPROVAL ============ 
  pendingApprovalCard: {
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
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },

  pendingApprovalText: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    marginBottom: 18,
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
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  pendingApprovalInfoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  pendingStepsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
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
    color: "#0F766E",
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
    gap: 12,
  },

  approvedHeroFactCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 14,
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
    marginHorizontal: 20,
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

  approvedStatusBanner: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  approvedStatusBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#4338CA",
  },

  approvedInfoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
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
    backgroundColor: "#F8FAFC",
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
    padding: 20,
  },

  qrModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    width: "90%",
    maxWidth: 380,
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
    padding: 24,
    alignItems: "center",
  },

  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: "#F8FAFC",
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

  adjustedStatusBanner: {
    backgroundColor: "#DBEAFE",
  },

  adjustedStatusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8",
  },

  reappointmentHeroCard: {
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 26,
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

  reappointmentHeroGradient: {
    padding: 22,
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
    color: "#0F766E",
  },

  reappointmentHeroTitle: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  reappointmentHeroText: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 18,
  },

  reappointmentMetaGrid: {
    gap: 12,
  },

  reappointmentMetaCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
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
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
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
  },

  reappointmentCardHeader: {
    gap: 14,
    marginBottom: 18,
  },

  reappointmentCardTitle: {
    fontSize: 18,
    fontWeight: "800",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0F766E",
    borderRadius: 14,
  },

  reappointmentPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  reappointmentChecklist: {
    gap: 12,
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
    borderRadius: 28,
    width: "92%",
    maxWidth: 460,
    overflow: "hidden",
  },

  appointmentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    gap: 16,
  },

  appointmentModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  appointmentModalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.88)",
  },

  appointmentModalBody: {
    padding: 20,
    gap: 16,
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

  appointmentFieldInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
  },

  appointmentFieldTextarea: {
    minHeight: 110,
    paddingTop: 14,
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#2563EB",
  },

  appointmentPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  appointmentSuccessCard: {
    backgroundColor: "#ECFDF5",
    marginHorizontal: 20,
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
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },

  appointmentSuccessTextWrap: {
    flex: 1,
  },

  appointmentSuccessTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 4,
  },

  appointmentSuccessText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#047857",
  },

  appointmentSuccessMetaRow: {
    marginTop: 12,
    gap: 4,
  },

  appointmentSuccessMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
});
