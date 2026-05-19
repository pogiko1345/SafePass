import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CampusMap from "./CampusMap";
import { MONITORING_MAP_LABELS } from "../utils/monitoringMapConfig";

export default function SharedMonitoringMap({
  title = "Monitoring Map",
  subtitle = "",
  iconName = "map-outline",
  iconColor = "#10B981",
  actionLabel = "",
  onActionPress,
  controls = null,
  visitors = [],
  floors = [],
  offices = [],
  selectedFloor = "all",
  selectedOffice = "all",
  mapBlueprints = null,
  mapLabels = MONITORING_MAP_LABELS,
  officePositions = {},
  onFloorChange,
  onVisitorHover,
  onVisitorLeave,
  onVisitorSelect,
  hoveredVisitor,
  renderHoverCard,
  fullscreen = false,
  initialScale = 1,
  backgroundColor = "#FFFFFF",
  borderColor = "#E2E8F0",
  mapBackgroundColor = "#FFFFFF",
  textPrimary = "#0F172A",
  textSecondary = "#64748B",
  summaryItems = [],
  statusLabel = "Live monitoring",
  showFloorNavigation = true,
  containerStyle,
  mapWrapperStyle,
}) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor, borderColor },
        fullscreen && styles.sectionFullscreen,
        containerStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: iconColor }]} />
            <Text style={[styles.statusText, { color: textSecondary }]}>{statusLabel}</Text>
          </View>
          <View style={styles.titleRow}>
            <Ionicons name={iconName} size={20} color={iconColor} />
            <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
          </View>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>

        {actionLabel && onActionPress ? (
          <TouchableOpacity onPress={onActionPress}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {summaryItems.length > 0 ? (
        <View style={styles.summaryRow}>
          {summaryItems.map((item) => (
            <View key={item.label} style={[styles.summaryPill, { borderColor, backgroundColor: mapBackgroundColor }]}>
              <View style={styles.summaryLabelRow}>
                <View style={[styles.summaryDot, { backgroundColor: item.color || iconColor }]} />
                <Text style={[styles.summaryLabel, { color: textSecondary }]}>{item.label}</Text>
              </View>
              <Text style={[styles.summaryValue, { color: textPrimary }]}>{item.value}</Text>
              {item.helper ? (
                <Text style={[styles.summaryHelper, { color: textSecondary }]}>{item.helper}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {controls}

      <View
        style={[
          styles.mapWrapper,
          { backgroundColor: mapBackgroundColor, borderColor },
          fullscreen && styles.mapWrapperFullscreen,
          mapWrapperStyle,
        ]}
      >
        <CampusMap
          visitors={visitors}
          floors={floors}
          offices={offices}
          selectedFloor={selectedFloor}
          selectedOffice={selectedOffice}
          mapBlueprints={mapBlueprints}
          mapLabels={mapLabels}
          officePositions={officePositions}
          onFloorChange={onFloorChange}
          onVisitorHover={onVisitorHover}
          onVisitorLeave={onVisitorLeave}
          onVisitorSelect={onVisitorSelect}
          hoveredVisitor={hoveredVisitor}
          renderHoverCard={renderHoverCard}
          fullscreen={fullscreen}
          initialScale={initialScale}
          showFloorNavigation={showFloorNavigation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  sectionFullscreen: {
    borderRadius: 20,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  titleBlock: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  summaryPill: {
    minWidth: 118,
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryHelper: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  mapWrapper: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  mapWrapperFullscreen: {
    borderRadius: 0,
    flex: 1,
    minHeight: 0,
  },
});
