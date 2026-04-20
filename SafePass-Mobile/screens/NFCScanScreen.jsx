import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  Vibration,
  Animated,
  Dimensions,
} from "react-native";
import styles from "../styles/mainStyles";
import nfcStyles from "../styles/NFCScanStyles";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";

const { width } = Dimensions.get("window");

export default function NFCScanScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("Main Gate");
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Available locations
  const locations = [
    { id: 1, name: "Main Gate", icon: "business-outline", zone: "Entry" },
    { id: 2, name: "Library Entrance", icon: "library-outline", zone: "Academic" },
    { id: 3, name: "Flight Simulator Lab", icon: "airplane-outline", zone: "Restricted" },
    { id: 4, name: "Administration Building", icon: "business-outline", zone: "Admin" },
    { id: 5, name: "Cafeteria", icon: "restaurant-outline", zone: "Common" },
    { id: 6, name: "Parking Area", icon: "car-outline", zone: "Facility" },
    { id: 7, name: "Security Office", icon: "shield-outline", zone: "Security" },
    { id: 8, name: "Maintenance Bay", icon: "construct-outline", zone: "Restricted" },
  ];

  useEffect(() => {
    loadUser();
    checkNFCSupport();
  }, []);

  useEffect(() => {
    let pulseAnimation;
    let rotateAnimation;
    let scanLineAnimation;
    
    if (isScanning) {
      // Pulse animation
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Rotation animation
      rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Scan line animation
      scanLineAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      scanLineAnimation.start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      scanLineAnim.setValue(0);
    }

    return () => {
      pulseAnimation?.stop();
      rotateAnimation?.stop();
      scanLineAnimation?.stop();
    };
  }, [isScanning]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser) {
        navigation.replace("Login");
        return;
      }
      setUser(currentUser);
      
      // Load recent scan history
      const logs = await ApiService.getAccessLogs(1, 5);
      setScanHistory(logs.accessLogs || []);
    } catch (error) {
      console.error("Load user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNFCSupport = async () => {
    // Check if device supports NFC
    if (Platform.OS === 'web') {
      setNfcSupported(false);
    } else {
      try {
        // You can add actual NFC SDK here (e.g., react-native-nfc-manager)
        // For now, we'll simulate support
        setNfcSupported(true);
      } catch (error) {
        setNfcSupported(false);
      }
    }
  };

  const performNFCSimulate = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanResult(null);
    
    // Vibrate to indicate scan start
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await ApiService.simulateNfcScan(selectedLocation, "entry");
      
      const result = {
        success: response.status === "granted",
        message: response.message,
        location: selectedLocation,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        accessType: "entry",
        cardId: user.nfcCardId || "N/A"
      };
      
      setScanResult(result);
      
      // Add to local history
      setScanHistory(prev => [result, ...prev.slice(0, 4)]);
      
      // Success/Denied haptic feedback
      if (Platform.OS !== 'web') {
        Vibration.vibrate(result.success ? [0, 50, 50, 50] : [0, 100, 50, 100]);
      }
      
      // Show alert with more details
      Alert.alert(
        result.success ? "✅ Access Granted" : "❌ Access Denied",
        `${result.location}\n${result.message}\n\nCard: ${user.nfcCardId?.substring(0, 8)}...`,
        [
          { 
            text: "View Logs", 
            onPress: () => navigation.navigate("AccessLog") 
          },
          { 
            text: "OK", 
            style: "cancel" 
          }
        ]
      );
      
    } catch (error) {
      console.error("NFC scan error:", error);
      Alert.alert("Error", "Failed to complete NFC scan. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const formatCardId = (cardId) => {
    if (!cardId) return "NO CARD ASSIGNED";
    if (cardId.length > 12) {
      return `${cardId.substring(0, 8)}...${cardId.substring(cardId.length - 4)}`;
    }
    return cardId;
  };

  if (isLoading && !user) {
    return (
      <View style={nfcStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A3D91" />
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={nfcStyles.loadingText}>Loading NFC reader...</Text>
      </View>
    );
  }

  if (!user) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <SafeAreaView style={nfcStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D91" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={nfcStyles.scrollContainer}
      >
        {/* Header */}
        <View style={nfcStyles.header}>
          <TouchableOpacity
            style={nfcStyles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isScanning}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={nfcStyles.headerContent}>
            <Text style={nfcStyles.headerTitle}>NFC Scanner</Text>
            <Text style={nfcStyles.headerSubtitle}>Tap or simulate NFC card</Text>
          </View>
          
          <TouchableOpacity
            style={nfcStyles.historyButton}
            onPress={() => navigation.navigate("AccessLog")}
          >
            <Ionicons name="time-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* NFC Card Info */}
        <View style={nfcStyles.cardInfo}>
          <View style={nfcStyles.cardHeader}>
            <View style={nfcStyles.cardIconContainer}>
              <Ionicons name="card" size={28} color="#FFFFFF" />
            </View>
            <View style={nfcStyles.cardStatus}>
              <View style={nfcStyles.statusDot} />
              <Text style={nfcStyles.statusText}>Active</Text>
            </View>
          </View>
          
          <Text style={nfcStyles.cardNumber}>
            {formatCardId(user.nfcCardId)}
          </Text>
          
          <View style={nfcStyles.cardFooter}>
            <View>
              <Text style={nfcStyles.cardLabel}>Card Holder</Text>
              <Text style={nfcStyles.cardValue}>
                {user.firstName} {user.lastName}
              </Text>
            </View>
            <View>
              <Text style={nfcStyles.cardLabel}>Type</Text>
              <Text style={nfcStyles.cardValue}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Selection */}
        <View style={nfcStyles.locationSection}>
          <Text style={nfcStyles.sectionTitle}>Select Location</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={nfcStyles.locationScroll}
          >
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  nfcStyles.locationCard,
                  selectedLocation === location.name && nfcStyles.locationCardActive
                ]}
                onPress={() => setSelectedLocation(location.name)}
                disabled={isScanning}
              >
                <View style={[
                  nfcStyles.locationIcon,
                  selectedLocation === location.name && nfcStyles.locationIconActive
                ]}>
                  <Ionicons 
                    name={location.icon} 
                    size={24} 
                    color={selectedLocation === location.name ? "#FFFFFF" : "#6B7280"} 
                  />
                </View>
                <Text style={[
                  nfcStyles.locationName,
                  selectedLocation === location.name && nfcStyles.locationNameActive
                ]}>
                  {location.name}
                </Text>
                <Text style={nfcStyles.locationZone}>{location.zone}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* NFC Scanner Animation */}
        <View style={nfcStyles.scannerContainer}>
          <Animated.View 
            style={[
              nfcStyles.scannerRing,
              { transform: [{ scale: pulseAnim }] }
            ]} 
          />
          
          <Animated.View 
            style={[
              nfcStyles.scannerRing2,
              { transform: [{ scale: Animated.multiply(pulseAnim, 1.5) }] }
            ]} 
          />
          
          <View style={nfcStyles.scannerInner}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons 
                name={isScanning ? "radio" : "scan-outline"} 
                size={60} 
                color={isScanning ? "#0A3D91" : "#9CA3AF"} 
              />
            </Animated.View>
            
            {isScanning && (
              <Animated.View 
                style={[
                  nfcStyles.scanLine,
                  { transform: [{ translateY }] }
                ]} 
              />
            )}
          </View>

          <Text style={nfcStyles.scannerStatus}>
            {isScanning 
              ? "Scanning NFC Card..." 
              : nfcSupported 
                ? "Ready to Scan" 
                : "NFC Not Supported (Simulation Mode)"}
          </Text>
          
          {!nfcSupported && (
            <Text style={nfcStyles.simulateBadge}>
              SIMULATION MODE
            </Text>
          )}
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={[
            nfcStyles.scanButton,
            isScanning && nfcStyles.scanButtonDisabled
          ]}
          onPress={performNFCSimulate}
          disabled={isScanning}
          activeOpacity={0.7}
        >
          {isScanning ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="scan" size={24} color="#FFFFFF" />
              <Text style={nfcStyles.scanButtonText}>Tap to Scan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Scan Result */}
        {scanResult && (
          <View style={[
            nfcStyles.resultCard,
            { borderLeftColor: scanResult.success ? "#10B981" : "#EF4444" }
          ]}>
            <View style={nfcStyles.resultHeader}>
              <View style={nfcStyles.resultIconContainer}>
                <Ionicons 
                  name={scanResult.success ? "checkmark-circle" : "close-circle"} 
                  size={32} 
                  color={scanResult.success ? "#10B981" : "#EF4444"} 
                />
              </View>
              <View style={nfcStyles.resultTitleContainer}>
                <Text style={nfcStyles.resultTitle}>
                  {scanResult.success ? "Access Granted" : "Access Denied"}
                </Text>
                <Text style={nfcStyles.resultLocation}>
                  {scanResult.location}
                </Text>
              </View>
            </View>

            <View style={nfcStyles.resultDetails}>
              <View style={nfcStyles.resultRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={nfcStyles.resultLabel}>Time:</Text>
                <Text style={nfcStyles.resultValue}>{scanResult.timestamp}</Text>
              </View>
              
              <View style={nfcStyles.resultRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={nfcStyles.resultLabel}>Date:</Text>
                <Text style={nfcStyles.resultValue}>{scanResult.date}</Text>
              </View>
              
              <View style={nfcStyles.resultRow}>
                <Ionicons name="card-outline" size={16} color="#6B7280" />
                <Text style={nfcStyles.resultLabel}>Card:</Text>
                <Text style={nfcStyles.resultValue}>{formatCardId(scanResult.cardId)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={nfcStyles.viewLogButton}
              onPress={() => navigation.navigate("AccessLog")}
            >
              <Text style={nfcStyles.viewLogText}>View Access Logs</Text>
              <Ionicons name="arrow-forward" size={16} color="#0A3D91" />
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Scans */}
        {scanHistory.length > 0 && (
          <View style={nfcStyles.historySection}>
            <View style={nfcStyles.historyHeader}>
              <Text style={nfcStyles.historyTitle}>Recent Scans</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AccessLog")}>
                <Text style={nfcStyles.historyLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {scanHistory.slice(0, 3).map((scan, index) => (
              <View key={index} style={nfcStyles.historyItem}>
                <View style={[
                  nfcStyles.historyIcon,
                  { backgroundColor: scan.status === "granted" ? "#E3F2E9" : "#FEE2E2" }
                ]}>
                  <Ionicons 
                    name={scan.status === "granted" ? "checkmark" : "close"} 
                    size={16} 
                    color={scan.status === "granted" ? "#0A3D91" : "#DC2626"} 
                  />
                </View>
                <View style={nfcStyles.historyInfo}>
                  <Text style={nfcStyles.historyLocation}>
                    {scan.location || "Unknown Location"}
                  </Text>
                  <Text style={nfcStyles.historyTime}>
                    {new Date(scan.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <View style={[
                  nfcStyles.historyBadge,
                  { backgroundColor: scan.status === "granted" ? "#E3F2E9" : "#FEE2E2" }
                ]}>
                  <Text style={[
                    nfcStyles.historyBadgeText,
                    { color: scan.status === "granted" ? "#0A3D91" : "#DC2626" }
                  ]}>
                    {scan.status?.toUpperCase() || "UNKNOWN"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={nfcStyles.instructionsCard}>
          <View style={nfcStyles.instructionsHeader}>
            <Ionicons name="information-circle-outline" size={22} color="#0A3D91" />
            <Text style={nfcStyles.instructionsTitle}>How NFC Works</Text>
          </View>
          
          <View style={nfcStyles.instructionsList}>
            <View style={nfcStyles.instructionItem}>
              <View style={nfcStyles.instructionDot} />
              <Text style={nfcStyles.instructionText}>
                Hold your device near the NFC reader
              </Text>
            </View>
            <View style={nfcStyles.instructionItem}>
              <View style={nfcStyles.instructionDot} />
              <Text style={nfcStyles.instructionText}>
                Each scan is logged in the system
              </Text>
            </View>
            <View style={nfcStyles.instructionItem}>
              <View style={nfcStyles.instructionDot} />
              <Text style={nfcStyles.instructionText}>
                Access is granted based on your role
              </Text>
            </View>
            <View style={nfcStyles.instructionItem}>
              <View style={nfcStyles.instructionDot} />
              <Text style={nfcStyles.instructionText}>
                Report lost cards immediately
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}