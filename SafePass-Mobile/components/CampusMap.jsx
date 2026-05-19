// components/CampusMap.jsx (Simplified - No Demo Data)
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Image,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/CampusMapStyles";

const TRACKING_FRESHNESS = {
  LIVE: "live",
  RECENT: "recent",
  AGING: "aging",
  STALE: "stale",
};

const FLOOR_BLUEPRINT_ASPECT_RATIOS = {
  ground: 940 / 280,
  first: 940 / 280,
  mezzanine: 940 / 280,
  second: 940 / 280,
  third: 940 / 280,
};

const getCompactOfficeLabel = (label, maxLength = 16) => {
  const normalizedLabel = String(label || "").trim();
  if (normalizedLabel.length <= maxLength) {
    return normalizedLabel;
  }

  return `${normalizedLabel.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MapPressable = ({ children, style, onPress, disabled = false, ...props }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const animatePress = (toValue, duration = 120) => {
    Animated.timing(pressAnim, {
      toValue,
      duration,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      disabled={disabled}
      accessibilityRole={props.accessibilityRole || "button"}
      activeOpacity={0.88}
      style={[style, { transform: [{ scale: pressAnim }] }]}
      onPress={onPress}
      onPressIn={() => !disabled && animatePress(0.96, 80)}
      onPressOut={() => !disabled && animatePress(1, 130)}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

const CampusMap = ({
  visitors = [],
  floors = [],
  offices = [],
  selectedFloor = "ground",
  selectedOffice = "all",
  destinationMarkers = [],
  showVisitorMarkers = true,
  showActiveVisitorsBadge = true,
  onVisitorHover,
  onVisitorLeave,
  onVisitorSelect,
  hoveredVisitor,
  renderHoverCard,
  fullscreen = false,
  initialScale = 1,
  mapBlueprints = null,
  mapLabels = {},
  officePositions = {}, 
  onFloorChange,
  showFloorNavigation = true,
  routeStartLabel = "Start",
}) => {
  const { width: viewportWidth } = useWindowDimensions();
  const defaultFloorId = floors[0]?.id || "ground";
  const maxMapScale = viewportWidth < 480 && !fullscreen ? 2.2 : 3;
  const safeInitialScale = Math.max(0.5, Math.min(Number(initialScale) || 1, maxMapScale));
  const [mapScale, setMapScale] = useState(safeInitialScale);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState(selectedFloor || defaultFloorId);
  const [imageError, setImageError] = useState(false);
  const [hoveredVisitorGroupKey, setHoveredVisitorGroupKey] = useState(null);
  
  const scaleAnim = useRef(new Animated.Value(safeInitialScale)).current;
  const panAnim = useRef(new Animated.ValueXY()).current;
  const floorFadeAnim = useRef(new Animated.Value(1)).current;
  const routePulseAnim = useRef(new Animated.Value(0)).current;
  const mapScaleRef = useRef(safeInitialScale);
  const mapPanRef = useRef({ x: 0, y: 0 });
  const gestureStartPanRef = useRef({ x: 0, y: 0 });
  const gestureStartScaleRef = useRef(safeInitialScale);
  const gestureStartDistanceRef = useRef(null);
  const mapSizeRef = useRef({ width: 0, height: 500 });
  const hasMountedRef = useRef(false);
  const markerInverseScale = scaleAnim.interpolate({
    inputRange: [0.5, 1, 3],
    outputRange: [2, 1, 0.333],
    extrapolate: "clamp",
  });

  useEffect(() => {
    mapScaleRef.current = mapScale;
  }, [mapScale]);

  const clampPan = (pan, scale = mapScaleRef.current) => {
    const mapWidth = mapSizeRef.current.width || viewportWidth || 320;
    const mapHeight = mapSizeRef.current.height || 500;
    const expandedMapWidth = mapWidth * (fullscreen ? 1.6 : 1);
    const expandedMapHeight = fullscreen
      ? Math.max(
          mapHeight,
          expandedMapWidth / (FLOOR_BLUEPRINT_ASPECT_RATIOS[activeFloor] || 940 / 280),
        )
      : mapHeight;
    const limitX = Math.max(0, (expandedMapWidth * scale - mapWidth) / 2);
    const limitY = Math.max(0, (expandedMapHeight * scale - mapHeight) / 2);

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
        useNativeDriver: Platform.OS !== "web",
      }).start();
      return;
    }

    panAnim.setValue(clampedPan);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event) =>
        fullscreen || (event.nativeEvent?.touches?.length || 0) >= 2,
      onStartShouldSetPanResponderCapture: (event) =>
        fullscreen || (event.nativeEvent?.touches?.length || 0) >= 2,
      onMoveShouldSetPanResponder: (event, gestureState) => {
        const touchCount = event.nativeEvent?.touches?.length || 0;
        const movedEnough = Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
        return touchCount >= 2 || (fullscreen && movedEnough) || (mapScaleRef.current > 1 && movedEnough);
      },
      onMoveShouldSetPanResponderCapture: (event, gestureState) => {
        const touchCount = event.nativeEvent?.touches?.length || 0;
        const movedEnough = Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
        return touchCount >= 2 || (fullscreen && movedEnough) || (mapScaleRef.current > 1 && movedEnough);
      },
      onPanResponderGrant: (event) => {
        panAnim.stopAnimation();
        scaleAnim.stopAnimation();
        gestureStartPanRef.current = mapPanRef.current;
        gestureStartScaleRef.current = mapScaleRef.current;
        gestureStartDistanceRef.current = getTouchDistance(event.nativeEvent?.touches);
      },
      onPanResponderMove: (event, gestureState) => {
        const touches = event.nativeEvent?.touches || [];
        let nextScale = mapScaleRef.current;

        if (touches.length >= 2) {
          const nextDistance = getTouchDistance(touches);
          if (nextDistance) {
            if (!gestureStartDistanceRef.current) {
              gestureStartDistanceRef.current = nextDistance;
              gestureStartScaleRef.current = mapScaleRef.current;
            }
            nextScale = clampScale(
              gestureStartScaleRef.current * (nextDistance / gestureStartDistanceRef.current),
            );
            mapScaleRef.current = nextScale;
            scaleAnim.setValue(nextScale);
          }
        }

        const nextPan = clampPan(
          {
            x: gestureStartPanRef.current.x + gestureState.dx,
            y: gestureStartPanRef.current.y + gestureState.dy,
          },
          nextScale,
        );
        panAnim.setValue(nextPan);
      },
      onPanResponderRelease: (_, gestureState) => {
        const nextScale = clampScale(scaleAnim.__getValue?.() ?? mapScaleRef.current);
        mapScaleRef.current = nextScale;
        setMapScale(nextScale);
        scaleAnim.setValue(nextScale);
        setPanPosition({
          x: gestureStartPanRef.current.x + gestureState.dx,
          y: gestureStartPanRef.current.y + gestureState.dy,
        });
        gestureStartDistanceRef.current = null;
      },
      onPanResponderTerminate: (_, gestureState) => {
        const nextScale = clampScale(scaleAnim.__getValue?.() ?? mapScaleRef.current);
        mapScaleRef.current = nextScale;
        setMapScale(nextScale);
        scaleAnim.setValue(nextScale);
        setPanPosition({
          x: gestureStartPanRef.current.x + gestureState.dx,
          y: gestureStartPanRef.current.y + gestureState.dy,
        });
        gestureStartDistanceRef.current = null;
      },
      onPanResponderTerminationRequest: () => !fullscreen,
      onShouldBlockNativeResponder: () => fullscreen,
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
    const nextFloor = selectedFloor || defaultFloorId;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setActiveFloor(nextFloor);
      setImageError(false);
      resetMapView();
      return;
    }
    if (nextFloor === activeFloor) return;

    Animated.timing(floorFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setActiveFloor(nextFloor);
      setImageError(false);
      resetMapView();
      Animated.timing(floorFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    });
  }, [defaultFloorId, selectedFloor]);

  const resetMapView = () => {
    mapScaleRef.current = safeInitialScale;
    mapPanRef.current = { x: 0, y: 0 };
    setMapScale(safeInitialScale);
    setMapPan({ x: 0, y: 0 });
    scaleAnim.setValue(safeInitialScale);
    panAnim.setValue({ x: 0, y: 0 });
  };

  const handleFloorSelect = (floorId) => {
    if (!floorId || floorId === activeFloor) return;
    Animated.timing(floorFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setActiveFloor(floorId);
      setImageError(false);
      resetMapView();
      onFloorChange?.(floorId);
      Animated.timing(floorFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    });
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(routePulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(routePulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [routePulseAnim]);

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

  const getFloorLabels = () => {
    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    return (
      mapLabels?.[activeFloor] ||
      mapLabels?.[normalizedActiveFloor] ||
      (normalizedActiveFloor === "first" ? mapLabels?.mezzanine : null) ||
      []
    );
  };

  const getVisitorCoordinates = (visitor) => {
    if (visitor.location?.coordinates) {
      const { x, y } = visitor.location.coordinates;
      return {
        x: Number.isFinite(Number(x)) ? Number(x) : 50,
        y: Number.isFinite(Number(y)) ? Number(y) : 50,
      };
    }

    return { x: 50, y: 50 };
  };

  // Get visitor position style based on coordinates
  const getVisitorPositionStyle = (visitor) => {
    const { x, y } = getVisitorCoordinates(visitor);
    return {
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      transform: [{ translateX: -9 }, { translateY: -9 }],
    };
  };

  const getTouchDistance = (touches = []) => {
    if (!touches || touches.length < 2) return null;
    const [firstTouch, secondTouch] = touches;
    const deltaX = firstTouch.pageX - secondTouch.pageX;
    const deltaY = firstTouch.pageY - secondTouch.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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

  const getVisitorMovementAction = (visitor = {}) =>
    String(
      visitor?.location?.action ||
        visitor?.currentLocation?.action ||
        visitor?.sourceVisitor?.currentLocation?.action ||
        "",
    ).toLowerCase();

  const getVisitorMarkerColor = (visitor, freshness) => {
    if (visitor?.wrongLocationAlerts?.length) return "#DC2626";
    const action = getVisitorMovementAction(visitor);
    if (action === "office_departure") return "#F59E0B";
    if (["check_in", "location_update"].includes(action)) return "#0A3D91";
    if (visitor.status === "checked_in" || visitor.status === "active") {
      return freshness?.color || "#10B981";
    }
    return getVisitorStatusColor(visitor.status);
  };

  const getVisitorInitials = (visitor = {}) => {
    const name = String(visitor?.name || visitor?.fullName || visitor?.email || "V").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
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
      return { label: `${Math.max(1, Math.floor(diffSeconds / 60))}m ago`, state: TRACKING_FRESHNESS.RECENT, color: "#0A3D91" };
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

  const getVisitorGroupKey = (visitor) => {
    const floor = normalizeFloorId(visitor?.location?.floor || activeFloor);
    const { x, y } = getVisitorCoordinates(visitor);
    return `${floor}:${Math.round(x * 2) / 2}:${Math.round(y * 2) / 2}`;
  };

  const groupVisibleVisitors = (visibleVisitors) => {
    const groups = new Map();
    visibleVisitors.forEach((visitor) => {
      const key = getVisitorGroupKey(visitor);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(visitor);
    });

    return Array.from(groups.entries()).map(([key, groupVisitors]) => ({
      key,
      visitors: groupVisitors,
      primaryVisitor: groupVisitors[0],
    }));
  };

  const renderMapEmptyState = (visibleVisitors) => {
    if (visibleVisitors.length > 0) return null;
    return (
      <View style={styles.mapEmptyState} pointerEvents="none">
        <View style={styles.mapEmptyStateCard}>
          <View style={styles.mapEmptyStateIcon}>
            <Ionicons name="location-outline" size={22} color="#0A3D91" />
          </View>
          <Text style={styles.mapEmptyStateTitle}>No live visitors on this floor</Text>
          <Text style={styles.mapEmptyStateText}>
            Visitor markers appear after NFC gate or office taps.
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
          <MapPressable
            key={floor.id}
            style={[
              styles.floorButton,
              activeFloor === floor.id && styles.floorButtonActive,
            ]}
            onPress={() => handleFloorSelect(floor.id)}
            accessibilityLabel={`Show ${floor.name} map`}
            accessibilityState={{ selected: activeFloor === floor.id }}
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
          </MapPressable>
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
        <MapPressable
          key={office.id}
          style={[
            styles.officeLabel,
            { left: position.x, top: position.y }
          ]}
          onPress={() => onVisitorSelect?.({ office: office.name })}
          accessibilityLabel={`Office ${office.name}`}
        >
          <View style={styles.officeLabelContent}>
            <Ionicons name={office.icon} size={12} color="#FFFFFF" />
            <Text style={styles.officeLabelText} numberOfLines={1} ellipsizeMode="tail">
              {getCompactOfficeLabel(office.name)}
            </Text>
          </View>
        </MapPressable>
      );
    });
  };

  const renderMapLabels = () => {
    const labels = getFloorLabels();
    if (!labels.length) return null;

    return labels.map((label) => {
      const labelText = String(label.text || "");
      const lineCount = Math.max(1, label.numberOfLines || labelText.split("\n").length);
      const fontSize = Math.min(Number(label.size) || 6, lineCount > 1 ? 6.5 : 7);
      const left =
        typeof label.x === "number" && typeof label.width === "number"
          ? `${label.x - label.width / 2}%`
          : typeof label.x === "number"
            ? `${label.x}%`
            : label.x;
      const top = typeof label.y === "number" ? `${label.y}%` : label.y;
      const width = typeof label.width === "number" ? `${label.width}%` : label.width;

      return (
        <Animated.View
          key={label.id || `${label.text}-${left}-${top}`}
          style={[
            styles.mapTextLabel,
            { pointerEvents: "none" },
            {
              left,
              top,
              width,
              minHeight: Math.max(10, lineCount * (fontSize + 1)),
              transform: [{ scale: markerInverseScale }],
            },
            label.emphasis && styles.mapTextLabelEmphasis,
            label.style,
          ]}
        >
          <Text
            style={[
              styles.mapTextLabelText,
              { fontSize, lineHeight: fontSize + 2 },
              label.color ? { color: label.color } : null,
              label.textStyle,
            ]}
            numberOfLines={lineCount}
            adjustsFontSizeToFit
            minimumFontScale={0.35}
            allowFontScaling={false}
          >
            {labelText}
          </Text>
        </Animated.View>
      );
    });
  };

  const renderDefaultHoverCard = (groupVisitors) => (
    <View style={[styles.hoverCard, groupVisitors.length > 1 && styles.hoverCardWide]}>
      <Text style={styles.hoverCardGroupTitle}>
        {groupVisitors.length > 1 ? `${groupVisitors.length} visitors here` : "Visitor details"}
      </Text>
      <View style={styles.hoverVisitorGrid}>
        {groupVisitors.slice(0, 3).map((visitor) => {
          const freshness = getVisitorFreshness(visitor);
          return (
            <TouchableOpacity
              key={visitor.id}
              style={styles.hoverVisitorTile}
              onPress={() => onVisitorSelect?.(visitor)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${visitor.name || "visitor"} details`}
            >
              <Text style={styles.hoverCardName} numberOfLines={1}>{visitor.name}</Text>
              <Text style={styles.hoverCardPurpose} numberOfLines={1}>{visitor.purpose || "On-site visitor"}</Text>
              <View style={styles.hoverCardDetails}>
                <View style={styles.hoverCardDetail}>
                  <Ionicons name="time-outline" size={13} color="#6B7280" />
                  <Text style={styles.hoverCardDetailText} numberOfLines={1}>{freshness.label}</Text>
                </View>
                <View style={styles.hoverCardDetail}>
                  <Ionicons name="navigate-outline" size={13} color="#6B7280" />
                  <Text style={styles.hoverCardDetailText} numberOfLines={1}>{getTrackingSourceLabel(visitor)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render visitor markers
  const renderVisitorMarkers = (visibleVisitors) => {
    if (!showVisitorMarkers) return null;
    if (visibleVisitors.length === 0) return null;

    return groupVisibleVisitors(visibleVisitors).map(({ key, visitors: groupVisitors, primaryVisitor }) => {
      const visitor = primaryVisitor;
      const freshness = getVisitorFreshness(visitor);
      const statusColor = getVisitorMarkerColor(visitor, freshness);
      const positionStyle = getVisitorPositionStyle(visitor);
      const markerTransform = [
        ...(Array.isArray(positionStyle.transform) ? positionStyle.transform : []),
        { scale: markerInverseScale },
      ];
      const isHovered =
        hoveredVisitorGroupKey === key ||
        groupVisitors.some((groupVisitor) => hoveredVisitor?.id === groupVisitor.id);
      
      return (
        <Animated.View
          key={key}
          style={[styles.visitorMarker, positionStyle, { transform: markerTransform }]}
          onMouseEnter={() => {
            setHoveredVisitorGroupKey(key);
            onVisitorHover?.(visitor);
          }}
          onMouseLeave={() => {
            setHoveredVisitorGroupKey(null);
            onVisitorLeave?.();
          }}
        >
          <TouchableOpacity
            style={[
              styles.visitorMarkerDot, 
              groupVisitors.length > 1 && styles.visitorMarkerDotCluster,
              visitor.isSelfMarker && styles.visitorMarkerDotSelf,
              { backgroundColor: statusColor }
            ]}
            onPress={() => groupVisitors.length === 1 && onVisitorSelect?.(visitor)}
            accessibilityRole="button"
            accessibilityLabel={
              groupVisitors.length > 1
                ? `${groupVisitors.length} visitors at this map marker`
                : `Open ${visitor.name || "visitor"} map marker`
            }
          >
            <View style={[styles.visitorMarkerPulse, { backgroundColor: statusColor + "40" }]} />
            <Text style={styles.visitorMarkerCountText}>
              {groupVisitors.length > 1 ? groupVisitors.length : getVisitorInitials(visitor)}
            </Text>
          </TouchableOpacity>
          {visitor.isSelfMarker ? (
            <View style={styles.visitorMarkerSelfLabel}>
              <Text style={styles.visitorMarkerSelfLabelText} numberOfLines={1}>
                You
              </Text>
            </View>
          ) : null}
          {isHovered && (renderHoverCard?.(groupVisitors, visitor) || renderDefaultHoverCard(groupVisitors))}
        </Animated.View>
      );
    });
  };

  const renderDestinationMarkers = () => {
    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    const visibleDestinations = destinationMarkers.filter(
      (marker) => normalizeFloorId(marker.floor) === normalizedActiveFloor
    );

    if (!visibleDestinations.length) return null;

    return visibleDestinations.map((marker) => {
      const position = marker.position || getOfficePosition(marker.officeId);
      if (!position) return null;
      const left = typeof position.x === "number" ? `${position.x}%` : position.x;
      const top = typeof position.y === "number" ? `${position.y}%` : position.y;

      return (
        <Animated.View
          key={marker.id || marker.officeId || marker.label}
          style={[
            styles.destinationMarker,
            { left, top },
            {
              transform: [
                { translateX: -13 },
                { translateY: -28 },
                { scale: markerInverseScale },
                {
                  scale: routePulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.destinationMarkerPulse,
              {
                opacity: routePulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 0.1],
                }),
                transform: [
                  {
                    scale: routePulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.55],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.destinationMarkerPin}>
            <Ionicons name={marker.icon || "navigate"} size={13} color="#FFFFFF" />
          </View>
          <View style={styles.destinationMarkerLabel}>
            <Text style={styles.destinationMarkerLabelText} numberOfLines={1}>
              {marker.label || "Go here"}
            </Text>
          </View>
        </Animated.View>
      );
    });
  };

  const renderRouteGuide = () => {
    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    const marker = destinationMarkers.find(
      (item) => normalizeFloorId(item.floor) === normalizedActiveFloor,
    );
    if (!marker) return null;

    const position = marker.position || getOfficePosition(marker.officeId);
    if (!position) return null;

    const activeSelfMarker = visibleVisitors.find(
      (visitor) =>
        visitor?.isSelfMarker &&
        normalizeFloorId(visitor?.location?.floor || activeFloor) === normalizedActiveFloor,
    );
    const selfCoordinates = activeSelfMarker ? getVisitorCoordinates(activeSelfMarker) : null;
    const fallbackStartPosition =
      officePositions?.["ground-lobby"] ||
      officePositions?.["main-gate"] ||
      { x: 6.8, y: 40 };
    const start =
      selfCoordinates &&
      Number.isFinite(Number(selfCoordinates.x)) &&
      Number.isFinite(Number(selfCoordinates.y))
        ? { x: Number(selfCoordinates.x), y: Number(selfCoordinates.y) }
        : normalizedActiveFloor === "ground"
          ? fallbackStartPosition
          : { x: 84, y: 70 };
    const end = {
      x: typeof position.x === "number" ? position.x : Number.parseFloat(position.x),
      y: typeof position.y === "number" ? position.y : Number.parseFloat(position.y),
    };
    if (!Number.isFinite(end.x) || !Number.isFinite(end.y)) return null;

    const horizontalLeft = Math.min(start.x, end.x);
    const horizontalWidth = Math.max(Math.abs(end.x - start.x), 1.5);
    const verticalTop = Math.min(start.y, end.y);
    const verticalHeight = Math.max(Math.abs(end.y - start.y), 1.5);

    return (
      <View style={[styles.routeGuideLayer, { pointerEvents: "none" }]}>
        <Animated.View
          style={[
            styles.routeGuideSegment,
            {
              left: `${horizontalLeft}%`,
              top: `${start.y}%`,
              width: `${horizontalWidth}%`,
              transform: [{ scaleY: markerInverseScale }],
              opacity: routePulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.42, 0.82],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.routeGuideSegment,
            styles.routeGuideSegmentVertical,
            {
              left: `${end.x}%`,
              top: `${verticalTop}%`,
              height: `${verticalHeight}%`,
              transform: [{ scaleX: markerInverseScale }],
              opacity: routePulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.42, 0.82],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.routeStartMarker,
            {
              left: `${start.x}%`,
              top: `${start.y}%`,
              transform: [{ translateX: -18 }, { translateY: -18 }, { scale: markerInverseScale }],
            },
          ]}
        >
          <Text style={styles.routeStartMarkerText}>{routeStartLabel}</Text>
        </Animated.View>
      </View>
    );
  };

  // Handle zoom
  const clampScale = (scale) => Math.max(0.5, Math.min(maxMapScale, scale));

  const handleZoomIn = () => {
    const newScale = clampScale(mapScale + 0.2);
    mapScaleRef.current = newScale;
    setMapScale(newScale);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = clampScale(mapScale - 0.2);
    mapScaleRef.current = newScale;
    setMapScale(newScale);
    const nextPan = clampPan(mapPanRef.current, newScale);
    mapPanRef.current = nextPan;
    setMapPan(nextPan);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: newScale,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(panAnim, {
        toValue: nextPan,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const handleReset = () => {
    mapScaleRef.current = safeInitialScale;
    mapPanRef.current = { x: 0, y: 0 };
    setMapScale(safeInitialScale);
    setMapPan({ x: 0, y: 0 });
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: safeInitialScale,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const floorPlanImage = getFloorPlanImage();
  const isDiagramBlueprint =
    floorPlanImage &&
    typeof floorPlanImage === "object" &&
    floorPlanImage.type === "diagram";
  const hasBlueprint = floorPlanImage !== null && !isDiagramBlueprint && !imageError;
  const shouldShowOfficeLabels = !hasBlueprint;
  const shouldShowMapLabels = hasBlueprint && getFloorLabels().length > 0;
  const visibleVisitors = getVisibleVisitors();
  const normalizedActiveFloor = normalizeFloorId(activeFloor);
  const blueprintAspectRatio =
    FLOOR_BLUEPRINT_ASPECT_RATIOS[activeFloor] ||
    FLOOR_BLUEPRINT_ASPECT_RATIOS[normalizedActiveFloor] ||
    (normalizedActiveFloor === "first"
      ? FLOOR_BLUEPRINT_ASPECT_RATIOS.mezzanine
      : null) ||
    940 / 280;

  return (
    <View style={[styles.mapContainer, fullscreen && styles.mapContainerFullscreen]}>
      {showFloorNavigation ? renderFloorNavigation() : null}
      
      <View
        style={[styles.mapCanvas, fullscreen && styles.mapCanvasFullscreen]}
        onLayout={(event) => {
          mapSizeRef.current = event.nativeEvent.layout;
          setPanPosition(mapPanRef.current, false);
        }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.mapZoomLayer,
            fullscreen && styles.mapZoomLayerFullscreen,
            {
              opacity: floorFadeAnim,
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
            <View
              style={[
                styles.floorPlanStage,
                fullscreen && styles.floorPlanStageFullscreen,
                { aspectRatio: blueprintAspectRatio },
              ]}
            >
              <Image
                source={floorPlanImage}
                style={styles.floorPlanImage}
                resizeMode="stretch"
                onError={() => setImageError(true)}
              />

              {/* Text labels, visitors, and destinations share the blueprint coordinate space. */}
              {shouldShowMapLabels ? renderMapLabels() : null}
              {renderRouteGuide()}
              {renderVisitorMarkers(visibleVisitors)}
              {renderDestinationMarkers()}
            </View>
          ) : (
            <>
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

              {/* Office pills are still used only when there is no real blueprint image. */}
              {shouldShowOfficeLabels ? renderOfficeLabels() : null}
              {renderRouteGuide()}
              {renderVisitorMarkers(visibleVisitors)}
              {renderDestinationMarkers()}
            </>
          )}
        </Animated.View>

        {renderMapEmptyState(visibleVisitors)}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <MapPressable
            style={[styles.mapControlButton, styles.mapControlButtonPrimary]}
            onPress={handleZoomIn}
            accessibilityLabel="Zoom map in"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </MapPressable>
          <MapPressable
            style={styles.mapControlButton}
            onPress={handleZoomOut}
            accessibilityLabel="Zoom map out"
          >
            <Ionicons name="remove" size={20} color="#0A3D91" />
          </MapPressable>
          <MapPressable
            style={styles.mapControlButton}
            onPress={handleReset}
            accessibilityLabel="Reset map view"
          >
            <Ionicons name="scan-outline" size={19} color="#0A3D91" />
          </MapPressable>
        </View>
        
        {/* Active Visitors Count */}
        {showActiveVisitorsBadge ? (
          <View style={styles.activeVisitorsBadge}>
            <Ionicons name="people" size={16} color="#FFFFFF" />
            <Text style={styles.activeVisitorsBadgeText}>
              {visibleVisitors.length} Active
            </Text>
          </View>
        ) : null}

        <View style={styles.zoomLevelBadge}>
          <Text style={styles.zoomLevelText}>{Math.round(mapScale * 100)}%</Text>
        </View>
      </View>
      
      {/* Floor Guide */}
      <View style={styles.floorLegend}>
        <Text style={styles.floorLegendTitle}>Floor Guide</Text>
        <View style={styles.floorLegendItems}>
          {floors.map((floor) => (
            <View key={floor.id} style={styles.floorLegendItem}>
              <View style={[
                styles.floorLegendColor, 
                { backgroundColor: 
                  floor.id === "ground" ? "#2563EB" :
                  floor.id === "first" || floor.id === "mezzanine" ? "#10B981" :
                  floor.id === "second" ? "#F59E0B" : "#7C3AED"
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
