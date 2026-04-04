import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ HEADER ============
  header: {
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ NFC CARD INFO ============
  cardInfo: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0A3D91",
    justifyContent: "center",
    alignItems: "center",
  },
  
  cardStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  
  statusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 2,
    marginBottom: 16,
  },
  
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  cardLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  // ============ LOCATION SELECTION ============
  locationSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  
  locationScroll: {
    paddingRight: 20,
  },
  
  locationCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  locationCardActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  
  locationIconActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  
  locationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 2,
  },
  
  locationNameActive: {
    color: "#FFFFFF",
  },
  
  locationZone: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  // ============ NFC SCANNER ============
  scannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  
  scannerRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "rgba(10, 61, 145, 0.1)",
  },
  
  scannerRing2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(10, 61, 145, 0.2)",
  },
  
  scannerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  
  scanLine: {
    position: "absolute",
    width: 180,
    height: 2,
    backgroundColor: "#0A3D91",
    opacity: 0.5,
  },
  
  scannerStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  
  simulateBadge: {
    fontSize: 11,
    color: "#F59E0B",
    fontWeight: "700",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    overflow: "hidden",
  },

  // ============ SCAN BUTTON ============
  scanButton: {
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  scanButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  // ============ RESULT CARD ============
  resultCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  
  resultIconContainer: {
    marginRight: 12,
  },
  
  resultTitleContainer: {
    flex: 1,
  },
  
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  
  resultLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
  
  resultDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  resultLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 8,
    width: 45,
  },
  
  resultValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
  },
  
  viewLogButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  
  viewLogText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A3D91",
    marginRight: 4,
  },

  // ============ HISTORY SECTION ============
  historySection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  
  historyLink: {
    fontSize: 14,
    color: "#0A3D91",
    fontWeight: "600",
  },
  
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  
  historyInfo: {
    flex: 1,
  },
  
  historyLocation: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  
  historyTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ============ INSTRUCTIONS ============
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  
  instructionsList: {
    marginLeft: 8,
  },
  
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0A3D91",
    marginRight: 10,
  },
  
  instructionText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
});