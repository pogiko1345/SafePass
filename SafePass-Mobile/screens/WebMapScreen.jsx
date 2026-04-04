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

export default function WebMapScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const locations = [
    { 
      name: "Main Gate", 
      description: "Visitor Entrance & Security Checkpoint", 
      icon: "business",
      coordinates: { lat: 14.5995, lng: 120.9842 }
    },
    { 
      name: "Administration Building", 
      description: "Visitor Registration & Admin Office", 
      icon: "business",
      coordinates: { lat: 14.6001, lng: 120.9850 }
    },
    { 
      name: "Library", 
      description: "Student Resource Center & Study Hall", 
      icon: "library",
      coordinates: { lat: 14.5988, lng: 120.9848 }
    },
    { 
      name: "Cafeteria", 
      description: "Food Court & Dining Area", 
      icon: "restaurant",
      coordinates: { lat: 14.5992, lng: 120.9835 }
    },
    { 
      name: "Aviation Hangar", 
      description: "Flight Training Center & Aircraft Storage", 
      icon: "airplane",
      coordinates: { lat: 14.6005, lng: 120.9825 }
    },
    { 
      name: "Flight Simulator Lab", 
      description: "Simulator Training & Practice Area", 
      icon: "desktop",
      coordinates: { lat: 14.5978, lng: 120.9855 }
    },
    { 
      name: "Security Office", 
      description: "Main Security Office & Check-in Point", 
      icon: "shield",
      coordinates: { lat: 14.5990, lng: 120.9838 }
    },
    { 
      name: "Parking Area", 
      description: "Visitor & Staff Parking", 
      icon: "car",
      coordinates: { lat: 14.5985, lng: 120.9828 }
    },
  ];

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
        {/* Map Placeholder */}
        <View style={MapStyles.mapPlaceholder}>
          <View style={MapStyles.mapPlaceholderIcon}>
            <Ionicons name="map-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={MapStyles.mapPlaceholderText}>Interactive Map</Text>
          <Text style={MapStyles.mapPlaceholderSubtext}>
            Tap the button below to view the full campus map on Google Maps
          </Text>
          <TouchableOpacity 
            style={MapStyles.openMapsButton}
            onPress={openGoogleMaps}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={MapStyles.openMapsGradient}
            >
              <Ionicons name="map" size={20} color="#FFFFFF" />
              <Text style={MapStyles.openMapsText}>Open in Google Maps</Text>
            </LinearGradient>
          </TouchableOpacity>
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
            Tap on any location to get directions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}