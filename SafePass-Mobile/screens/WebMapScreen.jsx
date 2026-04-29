import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapStyles from "../styles/MapStyles";
import CampusMap from "../components/CampusMap";
import {
  MONITORING_MAP_BLUEPRINTS,
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_LABELS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";

const CAMPUS_LOCATIONS = [
  {
    name: "Main Gate",
    floor: "ground",
    description: "Visitor entrance and primary security checkpoint.",
    icon: "business",
    coordinates: { lat: 14.5995, lng: 120.9842 },
    mapPosition: { x: 18, y: 78 },
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
    description: "Visitor registration, approvals, and admin office support.",
    icon: "business",
    coordinates: { lat: 14.6001, lng: 120.985 },
    mapPosition: { x: 78, y: 22 },
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
    description: "Records, enrollment help, and visitor document routing.",
    icon: "document-text",
    coordinates: { lat: 14.5998, lng: 120.9849 },
    mapPosition: { x: 45, y: 44 },
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
    description: "Payment, billing, and finance-related visitor assistance.",
    icon: "calculator",
    coordinates: { lat: 14.5999, lng: 120.9851 },
    mapPosition: { x: 66, y: 42 },
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
    description: "Mezzanine meeting space for scheduled visitor appointments.",
    icon: "people",
    coordinates: { lat: 14.6005, lng: 120.9825 },
    mapPosition: { x: 10, y: 36 },
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
    description: "Mezzanine technology support and IT coordination room.",
    icon: "desktop",
    coordinates: { lat: 14.5978, lng: 120.9855 },
    mapPosition: { x: 57, y: 42 },
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
    description: "Main security office and manual assistance point.",
    icon: "shield",
    coordinates: { lat: 14.599, lng: 120.9838 },
    mapPosition: { x: 24, y: 30 },
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
    description: "Visitor and staff parking zone near the entrance lane.",
    icon: "car",
    coordinates: { lat: 14.5985, lng: 120.9828 },
    mapPosition: { x: 24, y: 64 },
    arrivalNote: "Recommended drop-off and parking zone before proceeding to your destination.",
    steps: [
      "Enter through the main gate and follow the parking guidance signs.",
      "Park in the marked visitor slots closest to the campus entry path.",
      "Walk back to the main pedestrian lane before continuing to your appointment.",
    ],
  },
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
  const [selectedLocationName, setSelectedLocationName] = useState(
    findInitialDestinationName(route?.params?.destinationOffice)
  );
  const { width } = useWindowDimensions();

  const isWideLayout = width >= 1080;
  const isCompactLayout = width < 760;

  const selectedLocation = useMemo(
    () =>
      CAMPUS_LOCATIONS.find(
        (location) => location.name === selectedLocationName
      ) || CAMPUS_LOCATIONS[0],
    [selectedLocationName]
  );

  const destinationMarker = useMemo(
    () => ({
      id: selectedLocation.name,
      floor: selectedLocation.floor,
      label: selectedLocation.name,
      icon: "navigate",
      position: selectedLocation.mapPosition,
    }),
    [selectedLocation]
  );

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
          <Text style={MapStyles.headerEyebrow}>Visitor Directions</Text>
          <Text style={MapStyles.headerTitle}>Campus Wayfinding</Text>
        </View>

        <View style={MapStyles.headerAction}>
          <Ionicons name="map-outline" size={18} color="#FFFFFF" />
        </View>
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
              <Ionicons name="compass-outline" size={16} color="#0A3D91" />
              <Text style={MapStyles.heroBadgeText}>Wayfinding Assistant</Text>
            </View>
            <Text style={MapStyles.heroSupportText}>
              {CAMPUS_LOCATIONS.length} destination points
            </Text>
          </View>

          <Text style={MapStyles.heroTitle}>
            Find the right campus destination before you arrive.
          </Text>
          <Text style={MapStyles.heroSubtitle}>
            Choose a destination and review the route steps inside SafePass.
            No external map app is required.
          </Text>

          <View
            style={[
              MapStyles.heroStatsRow,
              isCompactLayout && MapStyles.heroStatsRowStacked,
            ]}
          >
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Selected Stop</Text>
              <Text style={MapStyles.heroStatValue}>{selectedLocation.name}</Text>
            </View>
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Best Entry</Text>
              <Text style={MapStyles.heroStatValue}>Main Gate</Text>
            </View>
            <View style={MapStyles.heroStatCard}>
              <Text style={MapStyles.heroStatLabel}>Support Point</Text>
              <Text style={MapStyles.heroStatValue}>Security Office</Text>
            </View>
          </View>

          <View
            style={[
              MapStyles.heroActionRow,
              isCompactLayout && MapStyles.heroActionRowStacked,
            ]}
          >
            <TouchableOpacity
              style={MapStyles.primaryActionButton}
              onPress={() => setSelectedLocationName(selectedLocation.name)}
              activeOpacity={0.85}
            >
              <Ionicons name="list" size={18} color="#FFFFFF" />
              <Text style={MapStyles.primaryActionText}>Review Route Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={MapStyles.secondaryActionButton}
              onPress={() => setSelectedLocationName("Security Office")}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#0F172A" />
              <Text style={MapStyles.secondaryActionText}>Security Help Point</Text>
            </TouchableOpacity>
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
                <Text style={MapStyles.sectionEyebrow}>Map Overview</Text>
                <Text style={MapStyles.sectionTitle}>Campus Guide Map</Text>
              </View>
              <View style={MapStyles.sectionChip}>
                <Ionicons name="pin-outline" size={14} color="#0A3D91" />
                <Text style={MapStyles.sectionChipText}>
                  {selectedLocation.name}
                </Text>
              </View>
            </View>

            <Text style={MapStyles.sectionSubtitle}>
              The highlighted destination shows your current selected stop inside
              the school grounds.
            </Text>

            <CampusMap
              visitors={[]}
              floors={MONITORING_MAP_FLOORS}
              offices={MONITORING_MAP_OFFICES}
              selectedFloor={selectedLocation.floor}
              selectedOffice="all"
              destinationMarkers={[destinationMarker]}
              showVisitorMarkers={false}
              showActiveVisitorsBadge={false}
              mapBlueprints={MONITORING_MAP_BLUEPRINTS}
              mapLabels={MONITORING_MAP_LABELS}
              officePositions={MONITORING_MAP_OFFICE_POSITIONS}
              onFloorChange={(floorId) => {
                const firstLocationOnFloor = CAMPUS_LOCATIONS.find(
                  (location) => normalizeMapFloor(location.floor) === normalizeMapFloor(floorId),
                );
                if (firstLocationOnFloor) {
                  setSelectedLocationName(firstLocationOnFloor.name);
                }
              }}
            />
          </View>

          <View style={MapStyles.routeCard}>
            <View style={MapStyles.sectionHeader}>
              <View>
                <Text style={MapStyles.sectionEyebrow}>Route Details</Text>
                <Text style={MapStyles.sectionTitle}>
                  {selectedLocation.name}
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

            <Text style={MapStyles.routeDescription}>
              {selectedLocation.description}
            </Text>

            <View style={MapStyles.routeNoticeCard}>
              <Ionicons name="information-circle-outline" size={18} color="#0A3D91" />
              <Text style={MapStyles.routeNoticeText}>
                {selectedLocation.arrivalNote}
              </Text>
            </View>

            <View style={MapStyles.stepsSection}>
              <Text style={MapStyles.stepsTitle}>Suggested Route</Text>
              {selectedLocation.steps.map((step, index) => (
                <View key={`${selectedLocation.name}-${index}`} style={MapStyles.stepRow}>
                  <View style={MapStyles.stepIndex}>
                    <Text style={MapStyles.stepIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={MapStyles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={MapStyles.routeActionButton}
              onPress={() => setSelectedLocationName(selectedLocation.name)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={MapStyles.routeActionText}>
                Use These Directions To {selectedLocation.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={MapStyles.locationsSection}>
          <View style={MapStyles.locationsHeader}>
            <View>
              <Text style={MapStyles.locationsEyebrow}>Destination List</Text>
              <Text style={MapStyles.locationsTitle}>Choose A Campus Stop</Text>
            </View>
            <Text style={MapStyles.locationCount}>
              {CAMPUS_LOCATIONS.length} places
            </Text>
          </View>

          {CAMPUS_LOCATIONS.map((location) => {
            const isSelected = location.name === selectedLocation.name;

            return (
              <TouchableOpacity
                key={location.name}
                style={[
                  MapStyles.locationCard,
                  isSelected && MapStyles.locationCardSelected,
                ]}
                onPress={() => setSelectedLocationName(location.name)}
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
                  onPress={() => setSelectedLocationName(location.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate-outline" size={18} color="#0F172A" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={MapStyles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
          <Text style={MapStyles.footerNoteText}>
            Use this in-app campus guide for orientation. Ask security for help
            if the office is temporarily moved or restricted.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
