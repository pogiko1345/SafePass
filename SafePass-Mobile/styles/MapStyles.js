import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },

  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },

  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.76)",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },

  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  heroCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.8)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 12px 32px rgba(15, 23, 42, 0.10)" },
    }),
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(15,118,110,0.14)",
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  heroSupportText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A3D91",
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 34,
    letterSpacing: -0.8,
    marginBottom: 10,
  },

  heroSubtitle: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 18,
  },

  heroStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

  heroStatsRowStacked: {
    flexDirection: "column",
  },

  heroStatCard: {
    flex: 1,
    minWidth: 170,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF5FF",
  },

  heroStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748B",
    marginBottom: 6,
  },

  heroStatValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  heroActionRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },

  heroActionRowStacked: {
    flexDirection: "column",
  },

  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    minHeight: 52,
    flex: 1,
  },

  primaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D7E4FF",
    flex: 1,
  },

  secondaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  workspaceGrid: {
    marginTop: 18,
    gap: 18,
  },

  workspaceGridWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  mapCard: {
    flex: 1.15,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.07)" },
    }),
  },

  routeCard: {
    flex: 0.85,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.07)" },
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#0A3D91",
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 16,
  },

  sectionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },

  sectionChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },

  routeIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#B7D5F6",
  },

  routeDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 14,
  },

  routeNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 18,
  },

  routeNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#115E59",
    fontWeight: "600",
  },

  stepsSection: {
    marginBottom: 18,
  },

  stepsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },

  stepIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },

  routeActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#041E42",
  },

  routeActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  locationsSection: {
    marginTop: 18,
    marginBottom: 18,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.07)" },
    }),
  },

  locationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap",
  },

  locationsEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#0A3D91",
    marginBottom: 5,
  },

  locationsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
  },

  locationCount: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0px 4px 14px rgba(15, 23, 42, 0.05)" },
    }),
  },

  locationCardSelected: {
    borderColor: "#93C5FD",
    backgroundColor: "#F8FBFF",
  },

  locationIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  locationIconContainerSelected: {
    backgroundColor: "#041E42",
  },

  locationInfo: {
    flex: 1,
  },

  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },

  locationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  locationDescription: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },

  locationSelectedPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
  },

  locationSelectedPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#041E42",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  directionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FBFE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 6,
  },

  footerNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 19,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
});
