// components/CampusMap.jsx (Simplified - No Demo Data)
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Image,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloorBlueprintDiagram from "./FloorBlueprintDiagram";
import styles from "../styles/CampusMapStyles";

const { width, height } = Dimensions.get("window");

const TRACKING_FRESHNESS = {
  LIVE: "live",
  RECENT: "recent",
  AGING: "aging",
  STALE: "stale",
};

const CampusMap = ({
  visitors = [],
  floors = [],
  offices = [],
  selectedFloor = "ground",
  selectedOffice = "all",
  onVisitorHover,
  onVisitorLeave,
  onVisitorSelect,
  hoveredVisitor,
  renderHoverCard,
  fullscreen = false,
  mapBlueprints = null,
  officePositions = {}, 
  onFloorChange,
  showFloorNavigation = true,
}) => {
  const defaultFloorId = floors[0]?.id || "ground";
  const [mapScale, setMapScale] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState(selectedFloor || defaultFloorId);
  const [imageError, setImageError] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panAnim = useRef(new Animated.ValueXY()).current;
  const mapScaleRef = useRef(1);
  const mapPanRef = useRef({ x: 0, y: 0 });
  const mapSizeRef = useRef({ width: 0, height: 500 });

  useEffect(() => {
    mapScaleRef.current = mapScale;
  }, [mapScale]);

  const clampPan = (pan, scale = mapScaleRef.current) => {
    const mapWidth = mapSizeRef.current.width || width || 320;
    const mapHeight = mapSizeRef.current.height || 500;
    const limitX = Math.max(0, (mapWidth * (scale - 1)) / 2);
    const limitY = Math.max(0, (mapHeight * (scale - 1)) / 2);

    return {
      x: Math.max(-limitX, Math.min(limitX, pan.x)),
      y: Math.max(-limitY, Math.min(limitY, pan.y)),
    };
  };

  const setPanPosition = (nextPan, animated = true) => {
    const clampedPan = clampPan(nextPan);
    mapPanRef.current = clampedPan;
    setMapPan(clampedPan);

    if (animated) {
      Animated.spring(panAnim, {
        toValue: clampedPan,
        useNativeDriver: true,
      }).start();
      return;
    }

    panAnim.setValue(clampedPan);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        panAnim.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const nextPan = clampPan({
          x: mapPanRef.current.x + gestureState.dx,
          y: mapPanRef.current.y + gestureState.dy,
        });
        panAnim.setValue(nextPan);
      },
      onPanResponderRelease: (_, gestureState) => {
        setPanPosition({
          x: mapPanRef.current.x + gestureState.dx,
          y: mapPanRef.current.y + gestureState.dy,
        });
      },
      onPanResponderTerminate: (_, gestureState) => {
        setPanPosition({
          x: mapPanRef.current.x + gestureState.dx,
          y: mapPanRef.current.y + gestureState.dy,
        });
      },
    }),
  ).current;

  const normalizeFloorId = (floorId) => {
    if (floorId === "mezzanine") {
      return "first";
    }
    return floorId;
  };

  const getDisplayFloorName = (floorId) => {
    const normalizedFloorId = normalizeFloorId(floorId);
    const matchingFloor = floors.find((floor) => normalizeFloorId(floor.id) === normalizedFloorId);

    if (matchingFloor?.name) {
      return matchingFloor.name;
    }

    return `${normalizedFloorId.charAt(0).toUpperCase()}${normalizedFloorId.slice(1)} Floor`;
  };

  // Update active floor when selected floor changes
  useEffect(() => {
    setActiveFloor(selectedFloor || defaultFloorId);
    setImageError(false);
    resetMapView();
  }, [defaultFloorId, selectedFloor]);

  const resetMapView = () => {
    mapScaleRef.current = 1;
    mapPanRef.current = { x: 0, y: 0 };
    setMapScale(1);
    setMapPan({ x: 0, y: 0 });
    scaleAnim.setValue(1);
    panAnim.setValue({ x: 0, y: 0 });
  };

  const handleFloorSelect = (floorId) => {
    if (!floorId || floorId === activeFloor) return;
    setActiveFloor(floorId);
    setImageError(false);
    resetMapView();
    onFloorChange?.(floorId);
  };

  // Get floor plan image based on selected floor from blueprints
  const getFloorPlanImage = () => {
    if (!mapBlueprints) {
      return null;
    }

    if (mapBlueprints[activeFloor]) {
      return mapBlueprints[activeFloor];
    }

    const normalizedFloorId = normalizeFloorId(activeFloor);
    const aliasFloorId = normalizedFloorId === "first" ? "mezzanine" : normalizedFloorId;

    if (mapBlueprints[normalizedFloorId]) {
      return mapBlueprints[normalizedFloorId];
    }

    if (mapBlueprints[aliasFloorId]) {
      return mapBlueprints[aliasFloorId];
    }

    return null;
  };

  // Get office position from blueprint data
  const getOfficePosition = (officeId) => {
    if (officePositions && officePositions[officeId]) {
      const pos = officePositions[officeId];
      return { x: `${pos.x}%`, y: `${pos.y}%` };
    }
    // Return null if no position data available - office won't be rendered
    return null;
  };

  // Get visitor position style based on coordinates
  const getVisitorPositionStyle = (visitor) => {
    // If visitor has actual coordinates from tracking, use them
    if (visitor.location?.coordinates) {
      const { x, y } = visitor.location.coordinates;
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: [{ translateX: -15 }, { translateY: -15 }],
      };
    }
    
    // Default position at center if no coordinates available
    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: [{ translateX: -15 }, { translateY: -15 }],
    };
  };

  // Get visitor status color
  const getVisitorStatusColor = (status) => {
    switch(status) {
      case "active":
      case "checked_in":
        return "#10B981";
      case "moving":
        return "#F59E0B";
      case "alert":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  const getVisitorLastSeenAt = (visitor) =>
    visitor?.lastUpdate ||
    visitor?.location?.timestamp ||
    visitor?.location?.lastSeenAt ||
    visitor?.sourceVisitor?.currentLocation?.lastSeenAt ||
    visitor?.sourceVisitor?.updatedAt;

  const formatFreshnessLabel = (dateValue) => {
    const timestamp = new Date(dateValue).getTime();
    if (!Number.isFinite(timestamp)) {
      return { label: "No recent update", state: TRACKING_FRESHNESS.STALE, color: "#64748B" };
    }

    const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSeconds < 45) {
      return { label: "Live now", state: TRACKING_FRESHNESS.LIVE, color: "#10B981" };
    }
    if (diffSeconds < 180) {
      return { label: `${Math.max(1, Math.floor(diffSeconds / 60))}m ago`, state: TRACKING_FRESHNESS.RECENT, color: "#2563EB" };
    }
    if (diffSeconds < 900) {
      return { label: `${Math.floor(diffSeconds / 60)}m ago`, state: TRACKING_FRESHNESS.AGING, color: "#F59E0B" };
    }

    return { label: "Stale", state: TRACKING_FRESHNESS.STALE, color: "#64748B" };
  };

  const getVisitorFreshness = (visitor) => formatFreshnessLabel(getVisitorLastSeenAt(visitor));

  const getTrackingSourceLabel = (visitor) => {
    const source = String(
      visitor?.trackingSource ||
        visitor?.location?.source ||
        visitor?.sourceVisitor?.currentLocation?.source ||
        "",
    ).toLowerCase();

    if (source.includes("phone")) return "Phone GPS";
    if (source.includes("arduino") || source.includes("tap") || source.includes("nfc")) return "Tap checkpoint";
    if (source.includes("manual")) return "Manual";
    if (source.includes("estimate")) return "Estimated";
    return "Tracking";
  };

  const getVisibleVisitors = () => {
    if (!visitors || visitors.length === 0) return [];

    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    return visitors.filter((visitor) => {
      const visitorFloor = normalizeFloorId(visitor?.location?.floor);
      return !visitorFloor || visitorFloor === normalizedActiveFloor;
    });
  };

  const renderMapEmptyState = (visibleVisitors) => {
    if (visibleVisitors.length > 0) return null;

    const floorName = getDisplayFloorName(activeFloor);
    const officeLabel = selectedOffice !== "all" ? selectedOffice : floorName;

    return (
      <View style={[styles.mapEmptyState, { pointerEvents: "none" }]}>
        <View style={styles.mapEmptyStateCard}>
          <View style={styles.mapEmptyStateIcon}>
            <Ionicons name="location-outline" size={22} color="#64748B" />
          </View>
          <Text style={styles.mapEmptyStateTitle}>No active markers here</Text>
          <Text style={styles.mapEmptyStateText}>
            No checked-in visitors are currently showing for {officeLabel}. Try another floor or office.
          </Text>
        </View>
      </View>
    );
  };

  // Render floor navigation
  const renderFloorNavigation = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorNavigationScroll}>
      <View style={styles.floorNavigation}>
        {floors.map((floor) => (
          <TouchableOpacity
            key={floor.id}
            style={[
              styles.floorButton,
              activeFloor === floor.id && styles.floorButtonActive,
            ]}
            onPress={() => handleFloorSelect(floor.id)}
          >
            <Ionicons 
              name={floor.icon} 
              size={16} 
              color={activeFloor === floor.id ? "#FFFFFF" : "#6B7280"} 
            />
            <Text
              style={[
                styles.floorButtonText,
                activeFloor === floor.id && styles.floorButtonTextActive,
              ]}
            >
              {floor.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Render office labels - only if we have actual office positions
  const renderOfficeLabels = () => {
    // Don't render if no office positions provided
    if (!officePositions || Object.keys(officePositions).length === 0) {
      return null;
    }
    
    let displayOffices = offices.filter(o => o.id !== "all");
    
    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    displayOffices = displayOffices.filter(
      (office) => normalizeFloorId(office.floor) === normalizedActiveFloor
    );
    
    // Filter by selected office
    if (selectedOffice !== "all") {
      displayOffices = displayOffices.filter(o => o.name === selectedOffice);
    }
    
    return displayOffices.map((office) => {
      const position = getOfficePosition(office.id);
      if (!position) return null;
      
      return (
        <TouchableOpacity
          key={office.id}
          style={[
            styles.officeLabel,
            { left: position.x, top: position.y }
          ]}
          onPress={() => onVisitorSelect?.({ office: office.name })}
        >
          <View style={styles.officeLabelContent}>
            <Ionicons name={office.icon} size={12} color="#FFFFFF" />
            <Text style={styles.officeLabelText}>{office.name}</Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  // Render visitor markers
  const renderVisitorMarkers = (visibleVisitors) => {
    if (visibleVisitors.length === 0) return null;

    return visibleVisitors.map((visitor) => {
      const freshness = getVisitorFreshness(visitor);
      const statusColor =
        visitor.status === "checked_in" || visitor.status === "active"
          ? freshness.color
          : getVisitorStatusColor(visitor.status);
      const positionStyle = getVisitorPositionStyle(visitor);
      const isHovered = hoveredVisitor?.id === visitor.id;
      
      return (
        <Animated.View
          key={visitor.id}
          style={[styles.visitorMarker, positionStyle]}
        >
          <TouchableOpacity
            style={[
              styles.visitorMarkerDot, 
              { backgroundColor: statusColor }
            ]}
            onPress={() => onVisitorSelect?.(visitor)}
            onMouseEnter={() => onVisitorHover?.(visitor)}
            onMouseLeave={() => onVisitorLeave?.()}
          >
            <View style={[styles.visitorMarkerPulse, { backgroundColor: statusColor + "40" }]} />
            <View style={[styles.visitorMarkerSourceBadge, { borderColor: statusColor }]}>
              <Text style={[styles.visitorMarkerSourceText, { color: statusColor }]}>
                {getTrackingSourceLabel(visitor).charAt(0)}
              </Text>
            </View>
          </TouchableOpacity>
          {isHovered && (renderHoverCard?.() || (
            <View style={styles.hoverCard}>
              <Text style={styles.hoverCardName}>{visitor.name}</Text>
              <Text style={styles.hoverCardPurpose}>{visitor.purpose || "On-site visitor"}</Text>
              <View style={styles.hoverCardDetails}>
                <View style={styles.hoverCardDetail}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.hoverCardDetailText}>{freshness.label}</Text>
                </View>
                <View style={styles.hoverCardDetail}>
                  <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                  <Text style={styles.hoverCardDetailText}>{getTrackingSourceLabel(visitor)}</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      );
    });
  };

  // Handle zoom
  const handleZoomIn = () => {
    const newScale = Math.min(mapScale + 0.2, 3);
    mapScaleRef.current = newScale;
    setMapScale(newScale);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(mapScale - 0.2, 0.5);
    mapScaleRef.current = newScale;
    setMapScale(newScale);
    const nextPan = clampPan(mapPanRef.current, newScale);
    mapPanRef.current = nextPan;
    setMapPan(nextPan);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: newScale,
        useNativeDriver: true,
      }),
      Animated.spring(panAnim, {
        toValue: nextPan,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReset = () => {
    mapScaleRef.current = 1;
    mapPanRef.current = { x: 0, y: 0 };
    setMapScale(1);
    setMapPan({ x: 0, y: 0 });
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
    ]).start();
  };

  const floorPlanImage = getFloorPlanImage();
  const isDiagramBlueprint =
    floorPlanImage &&
    typeof floorPlanImage === "object" &&
    floorPlanImage.type === "diagram";
  const hasBlueprint = floorPlanImage !== null && (isDiagramBlueprint || !imageError);
  const shouldShowOfficeLabels = !hasBlueprint || isDiagramBlueprint;
  const visibleVisitors = getVisibleVisitors();

  return (
    <View style={[styles.mapContainer, fullscreen && styles.mapContainerFullscreen]}>
      {showFloorNavigation ? renderFloorNavigation() : null}
      
      <View
        style={styles.mapCanvas}
        onLayout={(event) => {
          mapSizeRef.current = event.nativeEvent.layout;
          setPanPosition(mapPanRef.current, false);
        }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.mapZoomLayer,
            {
              transform: [
                { translateX: panAnim.x },
                { translateY: panAnim.y },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Floor Plan Image or Placeholder */}
          {hasBlueprint ? (
            isDiagramBlueprint ? (
              <FloorBlueprintDiagram floorId={floorPlanImage.floorId} />
            ) : (
              <Image
                source={floorPlanImage}
                style={styles.floorPlanImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <View style={styles.floorPlanPlaceholder}>
              <View style={styles.floorPlanContent}>
                <Ionicons 
                  name="map-outline" 
                  size={64} 
                  color="#9CA3AF" 
                />
                <Text style={styles.floorPlanTitle}>
                  {getDisplayFloorName(activeFloor)}
                </Text>
                <Text style={styles.floorPlanSubtitle}>
                  {!mapBlueprints
                    ? "Upload map blueprints to start tracking"
                    : "Floor blueprint not uploaded yet."}
                </Text>
                <View style={styles.floorPlanFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="people-outline" size={14} color="#6B7280" />
                    <Text style={styles.featureText}>
                      {visitors.length} Active Visitors
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="layers-outline" size={14} color="#6B7280" />
                    <Text style={styles.featureText}>
                      {floors.length} Floors
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {/* Office labels are suppressed on real blueprint images to avoid duplicating printed room names. */}
          {shouldShowOfficeLabels ? renderOfficeLabels() : null}
          
          {/* Visitor Markers */}
          {renderVisitorMarkers(visibleVisitors)}
        </Animated.View>

        {renderMapEmptyState(visibleVisitors)}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={handleZoomIn}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={handleZoomOut}
          >
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={handleReset}
          >
            <Ionicons name="compass" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Active Visitors Count */}
        <View style={styles.activeVisitorsBadge}>
          <Ionicons name="people" size={16} color="#FFFFFF" />
          <Text style={styles.activeVisitorsBadgeText}>
            {visibleVisitors.length} Active
          </Text>
        </View>

        <View style={styles.zoomLevelBadge}>
          <Text style={styles.zoomLevelText}>{Math.round(mapScale * 100)}%</Text>
        </View>
      </View>
      
      {/* Floor Legend */}
      <View style={styles.floorLegend}>
        <Text style={styles.floorLegendTitle}>Floor Legend</Text>
        <View style={styles.floorLegendItems}>
          {floors.map((floor) => (
            <View key={floor.id} style={styles.floorLegendItem}>
              <View style={[
                styles.floorLegendColor, 
                { backgroundColor: 
                  floor.id === "ground" ? "#EFF6FF" :
                  floor.id === "first" || floor.id === "mezzanine" ? "#ECFDF5" :
                  floor.id === "second" ? "#FEF3C7" : "#EDE9FE"
                }
              ]} />
              <Text style={styles.floorLegendText}>{floor.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CampusMap;
