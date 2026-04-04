// styles/CampusMapStyles.js (Simplified)
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default StyleSheet.create({
  mapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
    }),
  },

  mapContainerFullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    zIndex: 1000,
  },

  floorNavigationScroll: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
  },

  floorNavigation: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },

  floorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#F3F4F6",
        },
      },
    }),
  },

  floorButtonActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },

  floorButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  floorButtonTextActive: {
    color: "#FFFFFF",
  },

  mapCanvas: {
    position: "relative",
    width: "100%",
    minHeight: 500,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },

  floorPlanImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },

  floorPlanPlaceholder: {
    width: "100%",
    minHeight: 500,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  floorPlanContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  floorPlanTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },

  floorPlanSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  floorPlanFeatures: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" },
    }),
  },

  featureText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },

  visitorMarker: {
    position: "absolute",
    width: 30,
    height: 30,
    zIndex: 10,
  },

  visitorMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.15)" },
    }),
  },

  visitorMarkerPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -6,
    left: -6,
  },

  officeLabel: {
    position: "absolute",
    backgroundColor: "#0A3D91",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 5,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "scale(1.05)",
        },
      },
    }),
  },

  officeLabelContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  officeLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  mapControls: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "column",
    gap: 8,
    zIndex: 20,
  },

  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          transform: "scale(1.05)",
        },
      },
    }),
  },

  activeVisitorsBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 20,
  },

  activeVisitorsBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  floorLegend: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 20,
  },

  floorLegendTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },

  floorLegendItems: {
    flexDirection: "row",
    gap: 12,
  },

  floorLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  floorLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },

  floorLegendText: {
    fontSize: 10,
    color: "#4B5563",
  },

  hoverCard: {
    position: "absolute",
    bottom: 30,
    left: -60,
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    marginBottom: 10,
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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  hoverCardInfo: {
    flex: 1,
  },

  hoverCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },

  hoverCardPurpose: {
    fontSize: 11,
    color: "#6B7280",
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
    gap: 6,
    marginBottom: 10,
  },

  hoverCardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  hoverCardDetailText: {
    fontSize: 11,
    color: "#4B5563",
  },

  hoverCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#B91C1C",
        },
      },
    }),
  },

  hoverCardButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});