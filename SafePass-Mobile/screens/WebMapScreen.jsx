// screens/WebMapScreen.jsx
import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import MapStyles from "../styles/MapStyles";
import CampusMap from "../components/CampusMap";

export default function WebMapScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const locations = [
    { 
      name: "Main Gate", 
      description: "Visitor Entrance & Security Checkpoint", 
      icon: "business",
      coordinates: { lat: 14.5995, lng: 120.9842 },
      mapPosition: { x: 18, y: 78 },
    },
    { 
      name: "Administration Building", 
      description: "Visitor Registration & Admin Office", 
      icon: "business",
      coordinates: { lat: 14.6001, lng: 120.9850 },
      mapPosition: { x: 78, y: 22 },
    },
    { 
      name: "Library", 
      description: "Student Resource Center & Study Hall", 
      icon: "library",
      coordinates: { lat: 14.5988, lng: 120.9848 },
      mapPosition: { x: 58, y: 48 },
    },
    { 
      name: "Cafeteria", 
      description: "Food Court & Dining Area", 
      icon: "restaurant",
      coordinates: { lat: 14.5992, lng: 120.9835 },
      mapPosition: { x: 34, y: 58 },
    },
    { 
      name: "Aviation Hangar", 
      description: "Flight Training Center & Aircraft Storage", 
      icon: "airplane",
      coordinates: { lat: 14.6005, lng: 120.9825 },
      mapPosition: { x: 46, y: 70 },
    },
    { 
      name: "Flight Simulator Lab", 
      description: "Simulator Training & Practice Area", 
      icon: "desktop",
      coordinates: { lat: 14.5978, lng: 120.9855 },
      mapPosition: { x: 68, y: 58 },
    },
    { 
      name: "Security Office", 
      description: "Main Security Office & Check-in Point", 
      icon: "shield",
      coordinates: { lat: 14.5990, lng: 120.9838 },
      mapPosition: { x: 24, y: 30 },
    },
    { 
      name: "Parking Area", 
      description: "Visitor & Staff Parking", 
      icon: "car",
      coordinates: { lat: 14.5985, lng: 120.9828 },
      mapPosition: { x: 24, y: 64 },
    },
  ];

  const campusMapVisitors = locations.map((location) => ({
    id: location.name,
    name: location.name,
    purpose: location.description,
    status: "active",
    location: {
      coordinates: location.mapPosition,
    },
  }));

  const openGoogleMaps = () => {
    setLoading(true);
    // Open Google Maps with Sapphire Aviation School location
    const url = "https://maps.google.com/?q=Sapphire+Aviation+School+Philippines";
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open Google Maps");
    }).finally(() => {
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
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={MapStyles.loadingText}>Opening Maps...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={MapStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={MapStyles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={MapStyles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={MapStyles.headerTitle}>Campus Map</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={MapStyles.scrollContent}
      >
        <View style={MapStyles.mapSectionCard}>
          <View style={MapStyles.mapSectionHeader}>
            <View>
              <Text style={MapStyles.mapSectionTitle}>Campus Map Overview</Text>
              <Text style={MapStyles.mapSectionSubtitle}>
                View key school locations in the in-app campus map.
              </Text>
            </View>
            <TouchableOpacity 
              style={MapStyles.mapLaunchChip}
              onPress={openGoogleMaps}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={16} color="#4F46E5" />
              <Text style={MapStyles.mapLaunchChipText}>Open External Map</Text>
            </TouchableOpacity>
          </View>

          <CampusMap
            visitors={campusMapVisitors}
            floors={[{ id: "all", name: "Campus", icon: "map-outline" }]}
            offices={[]}
            selectedFloor="all"
            selectedOffice="all"
          />
        </View>

        {/* Campus Locations List */}
        <View style={MapStyles.locationsSection}>
          <View style={MapStyles.locationsHeader}>
            <Text style={MapStyles.locationsTitle}>Campus Locations</Text>
            <Text style={MapStyles.locationCount}>{locations.length} places</Text>
          </View>
          
          {locations.map((location, index) => (
            <TouchableOpacity 
              key={index} 
              style={MapStyles.locationCard}
              onPress={() => openDirections(location)}
              activeOpacity={0.7}
            >
              <View style={MapStyles.locationIconContainer}>
                <Ionicons name={location.icon} size={24} color="#4F46E5" />
              </View>
              <View style={MapStyles.locationInfo}>
                <Text style={MapStyles.locationName}>{location.name}</Text>
                <Text style={MapStyles.locationDescription}>{location.description}</Text>
              </View>
              <View style={MapStyles.directionButton}>
                <Ionicons name="navigate-outline" size={20} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Note */}
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            The campus map shows the main school areas, and each location card can still open directions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
