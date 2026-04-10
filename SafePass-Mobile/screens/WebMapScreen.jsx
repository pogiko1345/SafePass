import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapStyles from "../styles/MapStyles";
import CampusMap from "../components/CampusMap";

const CAMPUS_LOCATIONS = [
  {
    name: "Main Gate",
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
    name: "Library",
    description: "Student resource center and quiet study hall.",
    icon: "library",
    coordinates: { lat: 14.5988, lng: 120.9848 },
    mapPosition: { x: 58, y: 48 },
    arrivalNote: "Best for academic meetings, consultations, and research visits.",
    steps: [
      "Walk past the administration building toward the central corridor.",
      "Turn left at the study wing sign and continue to the library entrance.",
      "Check in with the library desk if your host is meeting you inside.",
    ],
  },
  {
    name: "Cafeteria",
    description: "Dining area and food court for students and staff.",
    icon: "restaurant",
    coordinates: { lat: 14.5992, lng: 120.9835 },
    mapPosition: { x: 34, y: 58 },
    arrivalNote: "Useful for waiting, meetups, and visitor rest stops.",
    steps: [
      "Follow the main path from the gate toward the courtyard.",
      "Turn right at the open dining sign near the parking lane.",
      "Use the side entry if you are meeting staff during meal hours.",
    ],
  },
  {
    name: "Aviation Hangar",
    description: "Flight training center and aircraft storage area.",
    icon: "airplane",
    coordinates: { lat: 14.6005, lng: 120.9825 },
    mapPosition: { x: 46, y: 70 },
    arrivalNote: "Restricted training zone. Wait for staff escort before entering.",
    steps: [
      "Proceed from the gate through the operations path toward the hangar lane.",
      "Stop at the restricted area marker and wait for your assigned staff member.",
      "Enter only after staff confirmation and security clearance.",
    ],
  },
  {
    name: "Flight Simulator Lab",
    description: "Simulator training and guided practice area.",
    icon: "desktop",
    coordinates: { lat: 14.5978, lng: 120.9855 },
    mapPosition: { x: 68, y: 58 },
    arrivalNote: "Ideal for scheduled simulator sessions and guided demonstrations.",
    steps: [
      "Walk past the administration wing toward the training corridor.",
      "Keep left at the simulator signage and continue to the lab entrance.",
      "Show your SafePass appointment to the assigned staff on entry.",
    ],
  },
  {
    name: "Security Office",
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

export default function WebMapScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState(
    "Administration Building"
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

  const campusMapVisitors = useMemo(
    () =>
      CAMPUS_LOCATIONS.map((location) => ({
        id: location.name,
        name: location.name,
        purpose: location.description,
        status: location.name === selectedLocation.name ? "checked_in" : "active",
        location: {
          coordinates: location.mapPosition,
        },
      })),
    [selectedLocation.name]
  );

  const openGoogleMaps = () => {
    setLoading(true);
    const url =
      "https://maps.google.com/?q=Sapphire+International+Aviation+Academy";
    Linking.openURL(url)
      .catch(() => {
        Alert.alert("Error", "Unable to open Google Maps");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const openDirections = (location) => {
    const url = `https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open directions");
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={MapStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={MapStyles.loadingText}>Opening Directions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={MapStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <LinearGradient
        colors={["#0F172A", "#1E3A8A", "#0F766E"]}
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

        <TouchableOpacity
          onPress={openGoogleMaps}
          style={MapStyles.headerAction}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={MapStyles.scrollContent}
      >
        <LinearGradient
          colors={["#E0F2FE", "#ECFEFF", "#F8FAFC"]}
          style={MapStyles.heroCard}
        >
          <View style={MapStyles.heroTopRow}>
            <View style={MapStyles.heroBadge}>
              <Ionicons name="compass-outline" size={16} color="#0F766E" />
              <Text style={MapStyles.heroBadgeText}>Wayfinding Assistant</Text>
            </View>
            <Text style={MapStyles.heroSupportText}>8 destination points</Text>
          </View>

          <Text style={MapStyles.heroTitle}>
            Find the right campus destination before you arrive.
          </Text>
          <Text style={MapStyles.heroSubtitle}>
            Choose a destination, review the route steps, and launch external
            directions only when you need them.
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
              onPress={() => openDirections(selectedLocation)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={MapStyles.primaryActionText}>Get Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={MapStyles.secondaryActionButton}
              onPress={openGoogleMaps}
              activeOpacity={0.85}
            >
              <Ionicons name="globe-outline" size={18} color="#0F172A" />
              <Text style={MapStyles.secondaryActionText}>Open Campus Map</Text>
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
                <Ionicons name="pin-outline" size={14} color="#0F766E" />
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
              visitors={campusMapVisitors}
              floors={[{ id: "all", name: "Campus", icon: "map-outline" }]}
              offices={[]}
              selectedFloor="all"
              selectedOffice="all"
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
              <Ionicons name="information-circle-outline" size={18} color="#0F766E" />
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
              onPress={() => openDirections(selectedLocation)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-circle-outline" size={20} color="#FFFFFF" />
              <Text style={MapStyles.routeActionText}>
                Start Directions To {selectedLocation.name}
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
                    color={isSelected ? "#FFFFFF" : "#1D4ED8"}
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
                  onPress={() => openDirections(location)}
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
            Use the in-app campus guide for orientation, then open external
            directions only if you need turn-by-turn navigation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
