import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
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
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 34,
    gap: 16,
  },

  heroCard: {
    borderRadius: 24,
    padding: 22,
  },

  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.74)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.82)",
    marginTop: 10,
    maxWidth: 560,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  profileInitials: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    flexWrap: "wrap",
  },

  heroStat: {
    minWidth: 92,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
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

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)" },
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
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

  appointmentCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
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

  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#9A3412",
  },

  noteTextReject: {
    color: "#991B1B",
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
    backgroundColor: "#059669",
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
    backgroundColor: "#DBEAFE",
  },

  secondaryActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
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

  disabledAction: {
    opacity: 0.7,
  },

  notificationItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#3B82F6",
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  notificationMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#DBEAFE",
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
    backgroundColor: "#1D4ED8",
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
