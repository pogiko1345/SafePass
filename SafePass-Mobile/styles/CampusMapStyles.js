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

  mapZoomLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 500,
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

  visitorMarkerSourceBadge: {
    position: "absolute",
    right: -13,
    bottom: -13,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  visitorMarkerSourceText: {
    fontSize: 8,
    fontWeight: "900",
  },

  destinationMarker: {
    position: "absolute",
    alignItems: "center",
    zIndex: 18,
    transform: [{ translateX: -18 }, { translateY: -36 }],
  },

  destinationMarkerPulse: {
    position: "absolute",
    top: 7,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(10, 61, 145, 0.20)",
  },

  destinationMarkerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A3D91",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 8px 20px rgba(15, 23, 42, 0.22)" },
    }),
  },

  destinationMarkerLabel: {
    marginTop: 6,
    maxWidth: 130,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  destinationMarkerLabelText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0A3D91",
  },

  mapEmptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 12,
  },

  mapEmptyStateCard: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.12)" },
    }),
  },

  mapEmptyStateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  mapEmptyStateTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 5,
    textAlign: "center",
  },

  mapEmptyStateText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  officeLabel: {
    position: "absolute",
    backgroundColor: "#0A3D91",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 96,
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
    maxWidth: "100%",
  },

  officeLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    flexShrink: 1,
  },

  mapTextLabel: {
    position: "absolute",
    minWidth: 34,
    minHeight: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },

  mapTextLabelEmphasis: {
    minHeight: 20,
  },

  mapTextLabelText: {
    width: "100%",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    textTransform: "uppercase",
    includeFontPadding: false,
    textShadowColor: "rgba(255, 255, 255, 0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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

  zoomLevelBadge: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    zIndex: 20,
  },

  zoomLevelText: {
    fontSize: 11,
    fontWeight: "800",
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
