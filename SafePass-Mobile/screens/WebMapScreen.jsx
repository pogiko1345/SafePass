import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapStyles from "../styles/MapStyles";
import CampusMap from "../components/CampusMap";
import {
  MONITORING_MAP_BLUEPRINTS,
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";
import ApiService from "../utils/ApiService";
import {
  buildManagedMapLabels,
  normalizeMapSettingsPayload,
} from "../utils/mapSettingsUtils";

const CAMPUS_LOCATIONS = [
  {
    name: "Main Gate",
    floor: "ground",
    category: "security",
    description: "Visitor entrance and primary security checkpoint.",
    icon: "business",
    coordinates: { lat: 14.5995, lng: 120.9842 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-lobby"],
    arrivalNote: "Present your visitor approval and valid ID at the gate.",
    steps: [
      "Enter through the main gate and proceed to the visitor lane.",
      "Complete security screening before entering the campus grounds.",
      "Wait for guard clearance before moving to your assigned building.",
    ],
  },
  {
    name: "Administration Building",
    floor: "ground",
    category: "admin",
    description: "Visitor registration, approvals, and admin office support.",
    icon: "business",
    coordinates: { lat: 14.6001, lng: 120.985 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-offices"],
    arrivalNote: "Recommended destination for registration, approvals, and admin meetings.",
    steps: [
      "From the main gate, continue straight through the central walkway.",
      "Keep right at the first campus junction toward the admin wing.",
      "Proceed to the reception desk on arrival for visitor confirmation.",
    ],
  },
  {
    name: "Registrar's Office",
    floor: "ground",
    category: "admin",
    description: "Records, enrollment help, and visitor document routing.",
    icon: "document-text",
    coordinates: { lat: 14.5998, lng: 120.9849 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-registrar"],
    arrivalNote: "Best for document-related appointments and records assistance.",
    steps: [
      "Enter through the main gate and proceed toward the administration corridor.",
      "Follow the office signage to the registrar counter.",
      "Prepare your SafePass approval and valid ID before approaching the desk.",
    ],
  },
  {
    name: "Accounting Office",
    floor: "ground",
    category: "admin",
    description: "Payment, billing, and finance-related visitor assistance.",
    icon: "calculator",
    coordinates: { lat: 14.5999, lng: 120.9851 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-accounting"],
    arrivalNote: "Use this stop for official payments and billing concerns.",
    steps: [
      "Proceed from the main gate to the ground-floor office row.",
      "Move past the registrar area toward the accounting counter.",
      "Wait for staff confirmation before submitting documents or payments.",
    ],
  },
  {
    name: "Conference Room",
    floor: "first",
    category: "academic",
    description: "Mezzanine meeting space for scheduled visitor appointments.",
    icon: "people",
    coordinates: { lat: 14.6005, lng: 120.9825 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["conference-room"],
    arrivalNote: "Proceed here only for scheduled meetings or escorted visits.",
    steps: [
      "Complete check-in at the ground-floor security point first.",
      "Use the stair access to reach the mezzanine level.",
      "Proceed to the left-side conference room and wait for your host.",
    ],
  },
  {
    name: "I.T Room",
    floor: "first",
    category: "academic",
    description: "Mezzanine technology support and IT coordination room.",
    icon: "desktop",
    coordinates: { lat: 14.5978, lng: 120.9855 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["it-room"],
    arrivalNote: "Best for approved IT-related appointments and support visits.",
    steps: [
      "Check in at the ground floor before moving upstairs.",
      "Take the stairs to the mezzanine and follow the room labels.",
      "Stop at the I.T Room and wait for staff acknowledgement.",
    ],
  },
  {
    name: "Security Office",
    floor: "ground",
    category: "security",
    description: "Main security office and manual assistance point.",
    icon: "shield",
    coordinates: { lat: 14.599, lng: 120.9838 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-lobby"],
    arrivalNote: "Go here if you need access help, visitor guidance, or manual verification.",
    steps: [
      "After entering the gate, move to the left-hand operations lane.",
      "Continue to the security office marker beside the checkpoint.",
      "A guard can assist with directions, verification, or access issues.",
    ],
  },
  {
    name: "Parking Area",
    floor: "ground",
    category: "security",
    description: "Visitor and staff parking zone near the entrance lane.",
    icon: "car",
    coordinates: { lat: 14.5985, lng: 120.9828 },
    mapPosition: MONITORING_MAP_OFFICE_POSITIONS["ground-lobby"],
    arrivalNote: "Recommended drop-off and parking zone before proceeding to your destination.",
    steps: [
      "Enter through the main gate and follow the parking guidance signs.",
      "Park in the marked visitor slots closest to the campus entry path.",
      "Walk back to the main pedestrian lane before continuing to your appointment.",
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Stops", icon: "apps-outline" },
  { id: "admin", label: "Administration", icon: "business-outline" },
  { id: "academic", label: "Academic / IT", icon: "desktop-outline" },
  { id: "security", label: "Security & Gates", icon: "shield-outline" },
];

const normalizeMapFloor = (floorId) => (floorId === "mezzanine" ? "first" : floorId);

const findInitialDestinationName = (destinationOffice = "") => {
  const normalizedDestination = String(destinationOffice || "").trim().toLowerCase();
  if (!normalizedDestination) return "Administration Building";

  return (
    CAMPUS_LOCATIONS.find((location) =>
      location.name.toLowerCase() === normalizedDestination ||
      location.name.toLowerCase().includes(normalizedDestination) ||
      normalizedDestination.includes(location.name.toLowerCase().replace("'s", ""))
    )?.name || "Administration Building"
  );
};

export default function WebMapScreen({ navigation, route }) {
  const [selectedOriginName, setSelectedOriginName] = useState("Main Gate");
  const [selectedLocationName, setSelectedLocationName] = useState(
    findInitialDestinationName(route?.params?.destinationOffice)
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [mapRooms, setMapRooms] = useState(MONITORING_MAP_OFFICES);
  const [mapRoomPositions, setMapRoomPositions] = useState(MONITORING_MAP_OFFICE_POSITIONS);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const { width } = useWindowDimensions();

  const isWideLayout = width >= 1080;
  const isCompactLayout = width < 760;

  const originLocation = useMemo(
    () =>
      CAMPUS_LOCATIONS.find((loc) => loc.name === selectedOriginName) ||
      CAMPUS_LOCATIONS[0],
    [selectedOriginName]
  );

  const selectedLocation = useMemo(
    () =>
      CAMPUS_LOCATIONS.find(
        (location) => location.name === selectedLocationName
      ) || CAMPUS_LOCATIONS[0],
    [selectedLocationName]
  );

  const mapLabels = useMemo(
    () => buildManagedMapLabels(mapRooms, mapRoomPositions),
    [mapRooms, mapRoomPositions],
  );

  const wayfindingRoute = useMemo(() => {
    const isSameLocation = originLocation.name === selectedLocation.name;
    const isSameFloor = normalizeMapFloor(originLocation.floor) === normalizeMapFloor(selectedLocation.floor);

    let steps = [];
    if (isSameLocation) {
      steps = [`You are currently at ${selectedLocation.name}.`];
    } else if (isSameFloor) {
      steps = [
        `Start at ${originLocation.name} (${originLocation.floor === "ground" ? "Ground Floor" : "Mezzanine Level"}).`,
        `Follow the central corridor path toward ${selectedLocation.name}.`,
        selectedLocation.arrivalNote || `Arrive at ${selectedLocation.name}.`,
      ];
    } else {
      steps = [
        `Start at ${originLocation.name} (${originLocation.floor === "ground" ? "Ground Floor" : "Mezzanine Level"}).`,
        `Proceed to the central staircase / elevator access hub.`,
        `Take stairs to ${selectedLocation.floor === "ground" ? "Ground Floor" : "Mezzanine Level"}.`,
        `Follow the corridor signage to ${selectedLocation.name}.`,
        selectedLocation.arrivalNote || `Arrive at destination desk.`,
      ];
    }

    const estimatedMeters = isSameLocation ? 0 : isSameFloor ? 45 : 85;
    const estimatedMinutes = isSameLocation ? 0 : isSameFloor ? 1.5 : 3;

    return {
      steps,
      distanceMeters: estimatedMeters,
      estimatedMinutes,
      isMultiFloor: !isSameFloor,
    };
  }, [originLocation, selectedLocation]);

  const filteredLocations = useMemo(() => {
    if (selectedCategory === "all") return CAMPUS_LOCATIONS;
    return CAMPUS_LOCATIONS.filter((l) => l.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    let isMounted = true;

    ApiService.getMapSettings()
      .then((response) => {
        if (isMounted && response?.success) {
          const nextMapSettings = normalizeMapSettingsPayload(response.mapSettings);
          setMapRooms(nextMapSettings.rooms);
          setMapRoomPositions(nextMapSettings.roomPositions);
        }
      })
      .catch((error) => {
        console.log("Web map settings load skipped:", error?.message || error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const destinationMarker = useMemo(
    () => ({
      id: selectedLocation.name,
      floor: selectedLocation.floor,
      label: selectedLocation.name,
      icon: "navigate",
      position:
        mapRoomPositions[
          mapRooms.find((office) =>
            selectedLocation.name.toLowerCase().includes(office.name.toLowerCase()) ||
            office.name.toLowerCase().includes(selectedLocation.name.toLowerCase().replace("'s", ""))
          )?.id
        ] || selectedLocation.mapPosition,
    }),
    [mapRoomPositions, mapRooms, selectedLocation]
  );

  const handleFloorChange = (floorId) => {
    const firstLocationOnFloor = CAMPUS_LOCATIONS.find(
      (location) => normalizeMapFloor(location.floor) === normalizeMapFloor(floorId),
    );
    if (firstLocationOnFloor) {
      setSelectedLocationName(firstLocationOnFloor.name);
      setActiveStepIndex(0);
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < wayfindingRoute.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  return (
    <SafeAreaView style={MapStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <LinearGradient
        colors={["#0F172A", "#1E3A8A", "#0A3D91"]}
        style={MapStyles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={MapStyles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={MapStyles.headerTitleWrap}>
          <Text style={MapStyles.headerEyebrow}>Campus Navigation & Wayfinding</Text>
          <Text style={MapStyles.headerTitle}>Interactive Map Guide</Text>
        </View>

        <TouchableOpacity
          style={MapStyles.headerAction}
          onPress={() => setIsMapFullscreen(true)}
        >
          <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={MapStyles.scrollContent}
      >
        <LinearGradient
          colors={["#E0F2FE", "#ECFEFF", "#F8FBFE"]}
          style={MapStyles.heroCard}
        >
          <View style={MapStyles.heroTopRow}>
            <View style={MapStyles.heroBadge}>
              <Ionicons name="navigate-circle-outline" size={16} color="#0A3D91" />
              <Text style={MapStyles.heroBadgeText}>Turn-by-Turn Wayfinder</Text>
            </View>
            <Text style={MapStyles.heroSupportText}>
              ~{wayfindingRoute.estimatedMinutes} min walk • {wayfindingRoute.distanceMeters}m
            </Text>
          </View>

          <Text style={MapStyles.heroTitle}>
            Route Directions to {selectedLocation.name}
          </Text>
          <Text style={MapStyles.heroSubtitle}>
            Select your starting checkpoint and destination to calculate a direct multi-floor route.
          </Text>

          <View style={localStyles.routeSelectBar}>
            <View style={localStyles.routeSelectField}>
              <Text style={localStyles.routeSelectLabel}>Starting Point</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.chipRow}>
                {["Main Gate", "Security Office", "Administration Building"].map((orig) => (
                  <TouchableOpacity
                    key={orig}
                    style={[
                      localStyles.chipPill,
                      selectedOriginName === orig && localStyles.chipPillActive,
                    ]}
                    onPress={() => {
                      setSelectedOriginName(orig);
                      setActiveStepIndex(0);
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color={selectedOriginName === orig ? "#FFFFFF" : "#0A3D91"}
                    />
                    <Text
                      style={[
                        localStyles.chipPillText,
                        selectedOriginName === orig && localStyles.chipPillTextActive,
                      ]}
                    >
                      {orig}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View
            style={[
              MapStyles.heroStatsRow,
              isCompactLayout && MapStyles.heroStatsRowStacked,
            ]}
          >
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Destination Stop</Text>
              <Text style={MapStyles.heroStatValue}>{selectedLocation.name}</Text>
            </View>
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Floor Level</Text>
              <Text style={MapStyles.heroStatValue}>
                {selectedLocation.floor === "ground" ? "Ground Floor" : "Mezzanine Level"}
              </Text>
            </View>
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Floor Switch</Text>
              <Text style={MapStyles.heroStatValue}>
                {wayfindingRoute.isMultiFloor ? "Stairs Required" : "Same Level"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={[
            MapStyles.workspaceGrid,
            isWideLayout && MapStyles.workspaceGridWide,
          ]}
        >
          <View style={MapStyles.mapCard}>
            <View style={MapStyles.sectionHeader}>
              <View>
                <Text style={MapStyles.sectionEyebrow}>Multi-Floor Canvas</Text>
                <Text style={MapStyles.sectionTitle}>Interactive Blueprint</Text>
              </View>
              <TouchableOpacity
                style={MapStyles.sectionChip}
                onPress={() => setIsMapFullscreen(true)}
              >
                <Ionicons name="expand-outline" size={14} color="#0A3D91" />
                <Text style={MapStyles.sectionChipText}>Fullscreen</Text>
              </TouchableOpacity>
            </View>

            <CampusMap
              visitors={[]}
              floors={MONITORING_MAP_FLOORS}
              offices={mapRooms}
              selectedFloor={selectedLocation.floor}
              selectedOffice="all"
              destinationMarkers={[destinationMarker]}
              showVisitorMarkers={false}
              showActiveVisitorsBadge={false}
              mapBlueprints={MONITORING_MAP_BLUEPRINTS}
              mapLabels={mapLabels}
              officePositions={mapRoomPositions}
              onFloorChange={handleFloorChange}
              routeStartLabel={originLocation.name}
            />
          </View>

          <View style={MapStyles.routeCard}>
            <View style={MapStyles.sectionHeader}>
              <View>
                <Text style={MapStyles.sectionEyebrow}>Step-by-Step Directions</Text>
                <Text style={MapStyles.sectionTitle}>
                  Step {activeStepIndex + 1} of {wayfindingRoute.steps.length}
                </Text>
              </View>
              <View style={MapStyles.routeIconBadge}>
                <Ionicons
                  name={selectedLocation.icon}
                  size={20}
                  color="#0F172A"
                />
              </View>
            </View>

            <View style={localStyles.activeStepBox}>
              <View style={localStyles.activeStepHeader}>
                <View style={localStyles.stepIndexBadge}>
                  <Text style={localStyles.stepIndexBadgeText}>{activeStepIndex + 1}</Text>
                </View>
                <Text style={localStyles.activeStepTitle}>
                  {wayfindingRoute.steps[activeStepIndex]}
                </Text>
              </View>
            </View>

            <View style={localStyles.stepperControls}>
              <TouchableOpacity
                style={[
                  localStyles.stepNavBtn,
                  activeStepIndex === 0 && localStyles.stepNavBtnDisabled,
                ]}
                onPress={handlePrevStep}
                disabled={activeStepIndex === 0}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={activeStepIndex === 0 ? "#94A3B8" : "#0A3D91"}
                />
                <Text
                  style={[
                    localStyles.stepNavBtnText,
                    activeStepIndex === 0 && localStyles.stepNavBtnTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  localStyles.stepNavBtn,
                  localStyles.stepNavBtnPrimary,
                  activeStepIndex === wayfindingRoute.steps.length - 1 && localStyles.stepNavBtnSuccess,
                ]}
                onPress={handleNextStep}
                disabled={activeStepIndex === wayfindingRoute.steps.length - 1}
              >
                <Text style={localStyles.stepNavBtnTextPrimary}>
                  {activeStepIndex === wayfindingRoute.steps.length - 1
                    ? "Arrived"
                    : "Next Step"}
                </Text>
                <Ionicons
                  name={
                    activeStepIndex === wayfindingRoute.steps.length - 1
                      ? "checkmark-circle"
                      : "arrow-forward"
                  }
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={MapStyles.routeNoticeCard}>
              <Ionicons name="information-circle-outline" size={18} color="#0A3D91" />
              <Text style={MapStyles.routeNoticeText}>
                {selectedLocation.arrivalNote}
              </Text>
            </View>

            <View style={MapStyles.stepsSection}>
              <Text style={MapStyles.stepsTitle}>Full Route Overview</Text>
              {wayfindingRoute.steps.map((step, index) => (
                <TouchableOpacity
                  key={`step-${index}`}
                  style={[
                    MapStyles.stepRow,
                    index === activeStepIndex && localStyles.stepRowActive,
                  ]}
                  onPress={() => setActiveStepIndex(index)}
                >
                  <View
                    style={[
                      MapStyles.stepIndex,
                      index === activeStepIndex && localStyles.stepIndexActive,
                    ]}
                  >
                    <Text
                      style={[
                        MapStyles.stepIndexText,
                        index === activeStepIndex && localStyles.stepIndexTextActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      MapStyles.stepText,
                      index === activeStepIndex && localStyles.stepTextActive,
                    ]}
                  >
                    {step}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={MapStyles.locationsSection}>
          <View style={MapStyles.locationsHeader}>
            <View>
              <Text style={MapStyles.locationsEyebrow}>Campus Destinations</Text>
              <Text style={MapStyles.locationsTitle}>Select Destination Stop</Text>
            </View>
            <Text style={MapStyles.locationCount}>
              {filteredLocations.length} places
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={localStyles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  localStyles.categoryChip,
                  selectedCategory === cat.id && localStyles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={selectedCategory === cat.id ? "#FFFFFF" : "#0F172A"}
                />
                <Text
                  style={[
                    localStyles.categoryChipText,
                    selectedCategory === cat.id && localStyles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredLocations.map((location) => {
            const isSelected = location.name === selectedLocation.name;

            return (
              <TouchableOpacity
                key={location.name}
                style={[
                  MapStyles.locationCard,
                  isSelected && MapStyles.locationCardSelected,
                ]}
                onPress={() => {
                  setSelectedLocationName(location.name);
                  setActiveStepIndex(0);
                }}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    MapStyles.locationIconContainer,
                    isSelected && MapStyles.locationIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={location.icon}
                    size={22}
                    color={isSelected ? "#FFFFFF" : "#041E42"}
                  />
                </View>

                <View style={MapStyles.locationInfo}>
                  <View style={MapStyles.locationTitleRow}>
                    <Text style={MapStyles.locationName}>{location.name}</Text>
                    {isSelected ? (
                      <View style={MapStyles.locationSelectedPill}>
                        <Text style={MapStyles.locationSelectedPillText}>
                          Selected
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={MapStyles.locationDescription}>
                    {location.description}
                  </Text>
                </View>

                <TouchableOpacity
                  style={MapStyles.directionButton}
                  onPress={() => {
                    setSelectedRoomDetail(location);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#0A3D91" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={MapStyles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
          <Text style={MapStyles.footerNoteText}>
            Use this in-app campus guide for navigation. Check in at security checkpoints
            before entering restricted administrative or academic wings.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selectedRoomDetail)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRoomDetail(null)}
      >
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <View style={localStyles.modalHeader}>
              <View style={localStyles.modalTitleRow}>
                <Ionicons name={selectedRoomDetail?.icon || "business"} size={22} color="#0A3D91" />
                <Text style={localStyles.modalTitle}>{selectedRoomDetail?.name}</Text>
              </View>
              <TouchableOpacity
                style={localStyles.modalCloseBtn}
                onPress={() => setSelectedRoomDetail(null)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={localStyles.modalBody}>
              <Text style={localStyles.modalDescription}>
                {selectedRoomDetail?.description}
              </Text>
              <View style={localStyles.modalMetaGrid}>
                <View style={localStyles.modalMetaItem}>
                  <Text style={localStyles.modalMetaLabel}>Floor Level</Text>
                  <Text style={localStyles.modalMetaValue}>
                    {selectedRoomDetail?.floor === "ground" ? "Ground Floor" : "Mezzanine Level"}
                  </Text>
                </View>
                <View style={localStyles.modalMetaItem}>
                  <Text style={localStyles.modalMetaLabel}>Arrival Instruction</Text>
                  <Text style={localStyles.modalMetaValue}>
                    {selectedRoomDetail?.arrivalNote}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={localStyles.modalRouteBtn}
                onPress={() => {
                  if (selectedRoomDetail) {
                    setSelectedLocationName(selectedRoomDetail.name);
                    setActiveStepIndex(0);
                  }
                  setSelectedRoomDetail(null);
                }}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={localStyles.modalRouteBtnText}>Navigate to this Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isMapFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsMapFullscreen(false)}
      >
        <SafeAreaView style={MapStyles.fullscreenSafeArea}>
          <View style={MapStyles.fullscreenHeader}>
            <View style={MapStyles.fullscreenHeaderCopy}>
              <Text style={MapStyles.fullscreenEyebrow}>Interactive Campus Map</Text>
              <Text style={MapStyles.fullscreenTitle}>{selectedLocation.name}</Text>
            </View>
            <TouchableOpacity
              style={MapStyles.fullscreenCloseButton}
              onPress={() => setIsMapFullscreen(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={MapStyles.fullscreenMapWrap}>
            <CampusMap
              visitors={[]}
              floors={MONITORING_MAP_FLOORS}
              offices={mapRooms}
              selectedFloor={selectedLocation.floor}
              selectedOffice="all"
              destinationMarkers={[destinationMarker]}
              showVisitorMarkers={false}
              showActiveVisitorsBadge={false}
              fullscreen
              mapBlueprints={MONITORING_MAP_BLUEPRINTS}
              mapLabels={mapLabels}
              officePositions={mapRoomPositions}
              onFloorChange={handleFloorChange}
              routeStartLabel={originLocation.name}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  routeSelectBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  routeSelectField: {
    gap: 6,
  },
  routeSelectLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
  },
  chipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  chipPillActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  chipPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  chipPillTextActive: {
    color: "#FFFFFF",
  },
  activeStepBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  activeStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0A3D91",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  activeStepTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },
  stepperControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  stepNavBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 10,
    borderRadius: 12,
  },
  stepNavBtnPrimary: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  stepNavBtnSuccess: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  stepNavBtnDisabled: {
    opacity: 0.4,
  },
  stepNavBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0A3D91",
  },
  stepNavBtnTextDisabled: {
    color: "#94A3B8",
  },
  stepNavBtnTextPrimary: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepRowActive: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 6,
  },
  stepIndexActive: {
    backgroundColor: "#0A3D91",
  },
  stepIndexTextActive: {
    color: "#FFFFFF",
  },
  stepTextActive: {
    color: "#0A3D91",
    fontWeight: "800",
  },
  categoryScroll: {
    flexDirection: "row",
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  modalBody: {
    padding: 18,
  },
  modalDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 14,
  },
  modalMetaGrid: {
    gap: 10,
    marginBottom: 18,
  },
  modalMetaItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
  },
  modalMetaLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  modalMetaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalRouteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0A3D91",
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalRouteBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
