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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloorBlueprintDiagram from "./FloorBlueprintDiagram";
import styles from "../styles/CampusMapStyles";

const { width, height } = Dimensions.get("window");

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
}) => {
  const defaultFloorId = floors[0]?.id || "ground";
  const [mapScale, setMapScale] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState(selectedFloor || defaultFloorId);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panAnim = useRef(new Animated.ValueXY()).current;

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
    setImageLoading(true);
    setImageError(false);
  }, [defaultFloorId, selectedFloor]);

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
            onPress={() => setActiveFloor(floor.id)}
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
  const renderVisitorMarkers = () => {
    if (!visitors || visitors.length === 0) return null;

    const normalizedActiveFloor = normalizeFloorId(activeFloor);
    const visibleVisitors = visitors.filter((visitor) => {
      const visitorFloor = normalizeFloorId(visitor?.location?.floor);
      return !visitorFloor || visitorFloor === normalizedActiveFloor;
    });

    return visibleVisitors.map((visitor) => {
      const statusColor = getVisitorStatusColor(visitor.status);
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
          </TouchableOpacity>
          {isHovered && renderHoverCard?.()}
        </Animated.View>
      );
    });
  };

  // Handle zoom
  const handleZoomIn = () => {
    const newScale = Math.min(mapScale + 0.2, 3);
    setMapScale(newScale);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(mapScale - 0.2, 0.5);
    setMapScale(newScale);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  const handleReset = () => {
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

  return (
    <View style={[styles.mapContainer, fullscreen && styles.mapContainerFullscreen]}>
      {renderFloorNavigation()}
      
      <View style={styles.mapCanvas}>
        {/* Floor Plan Image or Placeholder */}
        {hasBlueprint ? (
          isDiagramBlueprint ? (
            <FloorBlueprintDiagram floorId={floorPlanImage.floorId} />
          ) : (
            <Image
              source={floorPlanImage}
              style={styles.floorPlanImage}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
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
                {!mapBlueprints ? "Upload map blueprints to start tracking" : "Loading map blueprint..."}
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
        {renderVisitorMarkers()}
        
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
            {visitors.length} Active
          </Text>
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
