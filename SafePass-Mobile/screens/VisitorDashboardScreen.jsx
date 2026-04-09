import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
  Vibration,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import ApiService from "../utils/ApiService";
import visitorDashboardStyles from "../styles/VisitorDashboardStyles";

const { width } = Dimensions.get("window");
const isSmallPhone = width <= 375;

// NFC Configuration
// For web: Use Web NFC API
// For mobile: Use react-native-nfc-manager
let NfcManager = null;
if (Platform.OS !== 'web') {
  try {
    NfcManager = require('react-native-nfc-manager').default;
  } catch (e) {
    console.log('NFC module not available:', e);
  }
}

export default function VisitorDashboardScreen({ navigation, onLogout }) {
  const [visitor, setVisitor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [appointmentFeedback, setAppointmentFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    preferredDate: "",
    preferredTime: "",
    purposeOfVisit: "",
  });
  const [accessLogs, setAccessLogs] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isNfcEnabled, setIsNfcEnabled] = useState(false);
  const [isNfcReading, setIsNfcReading] = useState(false);
  const [nfcStatus, setNfcStatus] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const nfcListenerRef = useRef(null);

  useEffect(() => {
    loadVisitorData();
    setGreetingMessage();
    checkNfcSupport();
    
    return () => {
      stopNfcReading();
    };
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const loadVisitorData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser) {
        navigation.replace("Login");
        return;
      }
      setCurrentUser(currentUser);

      const profileResponse = await ApiService.getVisitorProfile();
      if (profileResponse.success && profileResponse.visitor) {
        setVisitor(profileResponse.visitor);

        const pendingVisitor =
          profileResponse.visitor.status === "pending" ||
          profileResponse.visitor.approvalStatus === "pending";

        if (!pendingVisitor) {
          const logsResponse = await ApiService.getVisitorAccessLogs(profileResponse.visitor._id);
          if (logsResponse.success) {
            setAccessLogs(logsResponse.logs);
          }
        } else {
          setAccessLogs([]);
        }
      } else {
        setVisitor(null);
      }
    } catch (error) {
      console.error("Load visitor data error:", error);
      const isProfileMissing =
        error?.status === 404 ||
        String(error?.message || "").includes("404") ||
        String(error?.message || "").toLowerCase().includes("profile not found");

      if (isProfileMissing) {
        setVisitor(null);
        setAccessLogs([]);
      } else {
        Alert.alert("Error", "Failed to load visitor data");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // NFC Support Check
  const checkNfcSupport = async () => {
    if (Platform.OS === 'web') {
      // Check for Web NFC API
      if ('NDEFReader' in window || 'nfc' in navigator) {
        setIsNfcSupported(true);
        try {
          // @ts-ignore
          const ndef = new window.NDEFReader();
          if (ndef) setIsNfcSupported(true);
        } catch (e) {
          setIsNfcSupported(false);
        }
      } else {
        setIsNfcSupported(false);
      }
    } else if (NfcManager) {
      try {
        await NfcManager.start();
        const isSupported = await NfcManager.isSupported();
        setIsNfcSupported(isSupported);
        if (isSupported) {
          const isEnabled = await NfcManager.isEnabled();
          setIsNfcEnabled(isEnabled);
          if (!isEnabled) {
            Alert.alert(
              "NFC Disabled",
              "Please enable NFC in your device settings to use tap-to-check-in feature.",
              [{ text: "OK" }]
            );
          }
        }
      } catch (error) {
        console.log("NFC check error:", error);
        setIsNfcSupported(false);
      }
    }
  };

  // Start NFC Reading
  const startNfcReading = async () => {
    if (!isNfcSupported) {
      Alert.alert(
        "NFC Not Supported",
        "Your device doesn't support NFC. Please use the QR code or manual check-in."
      );
      return false;
    }

    if (Platform.OS !== 'web' && !isNfcEnabled) {
      Alert.alert(
        "NFC Disabled",
        "Please enable NFC in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Open Settings", 
            onPress: () => {
              if (Platform.OS === 'android') {
                // @ts-ignore
                NfcManager?.goToNfcSetting();
              }
            }
          }
        ]
      );
      return false;
    }

    setIsNfcReading(true);
    setNfcStatus({ type: 'info', message: 'Tap your device to the NFC reader...' });

    try {
      if (Platform.OS === 'web') {
        return await startWebNfc();
      } else {
        return await startMobileNfc();
      }
    } catch (error) {
      console.error("NFC start error:", error);
      setNfcStatus({ type: 'error', message: 'Failed to start NFC. Please try again.' });
      setIsNfcReading(false);
      return false;
    }
  };

  // Web NFC Implementation
  const startWebNfc = async () => {
    try {
      // @ts-ignore
      if (!('NDEFReader' in window)) {
        throw new Error('Web NFC not supported');
      }

      // @ts-ignore
      const ndef = new window.NDEFReader();
      
      nfcListenerRef.current = ndef;
      
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        handleNfcTagRead(message, serialNumber);
      });
      
      ndef.addEventListener("readingerror", (err) => {
        console.error("NFC read error:", err);
        setNfcStatus({ type: 'error', message: 'Failed to read NFC tag. Please try again.' });
      });
      
      return true;
    } catch (error) {
      console.error("Web NFC error:", error);
      setNfcStatus({ type: 'error', message: 'Web NFC not available or permission denied.' });
      return false;
    }
  };

  // Mobile NFC Implementation
  const startMobileNfc = async () => {
    try {
      await NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        handleNfcTagRead(tag);
      });
      
      await NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
        console.log('NFC session closed');
        setIsNfcReading(false);
        setNfcStatus(null);
      });
      
      await NfcManager.registerTagEvent();
      
      return true;
    } catch (error) {
      console.error("Mobile NFC error:", error);
      return false;
    }
  };

  // Handle NFC Tag Read
  const handleNfcTagRead = async (tagData, serialNumber = null) => {
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
    
    setTapCount(prev => prev + 1);
    setLastTapTime(Date.now());
    
    // Extract data from NFC tag
    let readerId = null;
    let gateId = null;
    
    if (Platform.OS === 'web' && tagData) {
      // Parse NDEF message
      for (const record of tagData.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder(record.encoding);
          const text = textDecoder.decode(record.data);
          try {
            const data = JSON.parse(text);
            readerId = data.readerId;
            gateId = data.gateId;
          } catch (e) {
            readerId = text;
          }
        }
      }
    } else if (tagData) {
      // Parse mobile NFC tag data
      const payload = tagData.ndefMessage?.[0]?.payload;
      if (payload) {
        const text = String.fromCharCode.apply(null, new Uint8Array(payload));
        try {
          const data = JSON.parse(text);
          readerId = data.readerId;
          gateId = data.gateId;
        } catch (e) {
          readerId = text;
        }
      }
    }
    
    // Process the tap - send to server
    await processNfcTap(readerId, gateId);
  };

  // Process NFC Tap (Send to Arduino via API)
  const processNfcTap = async (readerId, gateId) => {
    if (!visitor) {
      setNfcStatus({ type: 'error', message: 'No visitor data found. Please refresh.' });
      stopNfcReading();
      return;
    }

    setNfcStatus({ type: 'processing', message: 'Processing tap...' });

    try {
      // Send tap data to your backend
      const response = await ApiService.processNfcTap({
        visitorId: visitor._id,
        visitorName: visitor.fullName,
        visitorEmail: visitor.email,
        timestamp: new Date().toISOString(),
        readerId: readerId,
        gateId: gateId,
        status: visitor.status,
      });

      if (response.success) {
        // Provide success feedback
        setNfcStatus({ type: 'success', message: '✓ Access granted! Gate opening...' });
        
        // Play success sound/feedback
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Check if this is a check-in or check-out
        if (response.action === 'check_in') {
          Alert.alert(
            "✓ Checked In Successfully",
            `Welcome ${visitor.fullName}! Gate is opening.`,
            [{ text: "OK", onPress: () => loadVisitorData() }]
          );
        } else if (response.action === 'check_out') {
          Alert.alert(
            "✓ Checked Out Successfully",
            `Goodbye ${visitor.fullName}! Thank you for visiting.`,
            [{ text: "OK", onPress: () => loadVisitorData() }]
          );
        } else {
          Alert.alert(
            "Access Granted",
            `Welcome ${visitor.fullName}! Gate is opening.`,
            [{ text: "OK" }]
          );
        }
        
        // Refresh visitor data to update status
        loadVisitorData();
        
        // Auto stop reading after successful tap
        setTimeout(() => {
          stopNfcReading();
        }, 2000);
      } else {
        // Access denied
        setNfcStatus({ type: 'error', message: response.message || 'Access denied' });
        
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        Alert.alert(
          "Access Denied",
          response.message || "Your visit request has not been approved yet.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("NFC tap processing error:", error);
      setNfcStatus({ type: 'error', message: 'Failed to process tap. Please try again.' });
      
      Alert.alert(
        "Error",
        "Failed to process NFC tap. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Stop NFC Reading
  const stopNfcReading = async () => {
    setIsNfcReading(false);
    setNfcStatus(null);
    
    try {
      if (Platform.OS === 'web' && nfcListenerRef.current) {
        // @ts-ignore
        nfcListenerRef.current.removeEventListener?.('reading', handleNfcTagRead);
        nfcListenerRef.current = null;
      } else if (NfcManager) {
        await NfcManager.unregisterTagEvent();
        await NfcManager.setEventListener(null);
      }
    } catch (error) {
      console.error("Stop NFC error:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVisitorData();
  };

  const formatDateInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const formatTimeInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const populateAppointmentForm = () => {
    setAppointmentForm({
      preferredDate: formatDateInput(visitor?.visitDate),
      preferredTime: formatTimeInput(visitor?.visitTime),
      purposeOfVisit: visitor?.purposeOfVisit || "",
    });
  };

  const openAppointmentModal = () => {
    populateAppointmentForm();
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
  };

  const handleRequestAppointment = async () => {
    const preferredDate = appointmentForm.preferredDate.trim();
    const preferredTime = appointmentForm.preferredTime.trim();
    const purposeOfVisit = appointmentForm.purposeOfVisit.trim();

    if (!currentUser?._id) {
      Alert.alert("Login Required", "Please sign in again before requesting a new appointment.");
      return;
    }

    if (!preferredDate || !preferredTime || !purposeOfVisit) {
      Alert.alert("Missing Details", "Please complete the preferred date, time, and purpose of visit.");
      return;
    }

    const combinedDateTime = new Date(`${preferredDate}T${preferredTime}:00`);
    if (Number.isNaN(combinedDateTime.getTime())) {
      Alert.alert("Invalid Schedule", "Please enter a valid preferred date and time.");
      return;
    }

    setIsSubmittingAppointment(true);
    try {
      const response = await ApiService.requestVisitorAppointment(currentUser._id, {
        preferredDate: new Date(`${preferredDate}T00:00:00`).toISOString(),
        preferredTime: combinedDateTime.toISOString(),
        purposeOfVisit,
      });

      if (response?.success) {
        setShowAppointmentModal(false);
        setAppointmentFeedback({
          title: "Appointment Submitted Successfully",
          message:
            "Your new visit request has been sent to staff for review. You can track approval, time adjustments, or rejection updates from this dashboard.",
          date: preferredDate,
          time: preferredTime,
          purpose: purposeOfVisit,
        });
        Alert.alert("Appointment Submitted", "Your request was sent to staff for review.");
        await loadVisitorData();
        return;
      }

      Alert.alert("Request Failed", response?.message || "Failed to send your appointment request.");
    } catch (error) {
      console.error("Request appointment error:", error);
      Alert.alert("Request Failed", error?.message || "Failed to send your appointment request.");
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor) return;
    
    Alert.alert(
      "Check In",
      "Are you ready to check in for your visit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check In",
          onPress: async () => {
            try {
              const response = await ApiService.visitorCheckIn(visitor._id);
              if (response.success) {
                Alert.alert("✅ Success", "You have been checked in!");
                loadVisitorData();
              } else {
                Alert.alert("Error", response.message || "Failed to check in");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to check in");
            }
          }
        }
      ]
    );
  };

  const handleCheckOut = async () => {
    if (!visitor) return;
    
    Alert.alert(
      "Check Out",
      "Are you sure you want to check out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          onPress: async () => {
            try {
              const response = await ApiService.visitorCheckOut(visitor._id);
              if (response.success) {
                Alert.alert("✅ Success", "You have been checked out. Thank you for visiting!");
                loadVisitorData();
              } else {
                Alert.alert("Error", response.message || "Failed to check out");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to check out");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = () => {
    if (!visitor?.visitDate) return null;
    
    const now = new Date();
    const visitTime = new Date(visitor.visitDate);
    const diffMs = visitTime - now;
    
    if (diffMs < 0) {
      return { text: 'Visit time passed', color: '#EF4444', icon: 'time' };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return { text: `${days} day${days > 1 ? 's' : ''} until visit`, color: '#10B981', icon: 'calendar' };
    } else if (diffHours > 0) {
      return { text: `${diffHours}h ${diffMins}m until visit`, color: '#10B981', icon: 'time' };
    } else if (diffMins > 0) {
      return { text: `${diffMins} minutes until visit`, color: '#F59E0B', icon: 'hourglass' };
    } else {
      return { text: 'Visit time now!', color: '#10B981', icon: 'checkmark-circle' };
    }
  };

  const getStatusColor = () => {
    if (visitor?.approvalStatus === "pending") return "#F59E0B";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "pending") return "#F59E0B";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "adjusted") return "#2563EB";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "rejected") return "#DC2626";
    switch(visitor?.status) {
      case 'checked_in': return '#10B981';
      case 'approved': return '#4F46E5';
      case 'pending': return '#F59E0B';
      case 'checked_out': return '#6B7280';
      case 'expired': return '#EF4444';
      case 'rejected': return '#DC2626';
      default: return '#4F46E5';
    }
  };

  const getStatusText = () => {
    if (visitor?.approvalStatus === "pending") return "Pending Admin Approval";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "pending") return "Pending Staff Review";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "adjusted") return "Time Adjusted";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "rejected") return "Appointment Declined";
    switch(visitor?.status) {
      case 'checked_in': return 'Checked In';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Approval';
      case 'checked_out': return 'Checked Out';
      case 'expired': return 'Expired';
      case 'rejected': return 'Rejected';
      default: return 'Active';
    }
  };

  const getStatusIcon = () => {
    if (visitor?.approvalStatus === "pending") return "time-outline";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "pending") return "briefcase-outline";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "adjusted") return "swap-horizontal-outline";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "rejected") return "close-circle";
    switch(visitor?.status) {
      case 'checked_in': return 'checkmark-circle';
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'checked_out': return 'log-out';
      case 'expired': return 'alert-circle';
      case 'rejected': return 'close-circle';
      default: return 'id-card';
    }
  };

  const handleLogout = async () => {
    await stopNfcReading();
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await ApiService.logout();
            if (onLogout) onLogout();
            navigation.reset({
              index: 0,
              routes: [{ name: "RoleSelect" }],
            });
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={visitorDashboardStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={visitorDashboardStyles.loadingText}>Loading your pass...</Text>
      </SafeAreaView>
    );
  }

  const timeRemaining = getTimeRemaining();
  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const statusIcon = getStatusIcon();
  const isPendingApproval =
    visitor?.status === "pending" || visitor?.approvalStatus === "pending";
  const isPendingStaffReview =
    !isPendingApproval &&
    visitor?.approvalFlow === "staff" &&
    visitor?.appointmentStatus === "pending";
  const isAdjustedAppointment =
    visitor?.approvalFlow === "staff" &&
    visitor?.appointmentStatus === "adjusted" &&
    visitor?.status === "approved";
  const isApprovedVisitor =
    !isPendingApproval && !isPendingStaffReview && visitor?.status === "approved";
  const canRequestNewAppointment =
    visitor?.approvalStatus === "approved" &&
    !isApprovedVisitor &&
    !isPendingStaffReview &&
    visitor?.status !== "checked_in";
  const canCreateFreshAppointment =
    !visitor &&
    String(currentUser?.role || "").toLowerCase() === "visitor" &&
    String(currentUser?.status || "").toLowerCase() === "active";
  const approvedActionLabel = isNfcReading ? "Stop NFC" : "Start NFC";
  const approvedActionIcon = isNfcReading ? "pause-circle" : "radio";

  return (
    <SafeAreaView style={visitorDashboardStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={visitorDashboardStyles.header}
      >
        <View style={visitorDashboardStyles.headerTop}>
          <View>
            <Text style={visitorDashboardStyles.greeting}>{greeting},</Text>
            <Text style={visitorDashboardStyles.userName}>
              {visitor?.fullName?.split(' ')[0] || 'Visitor'}!
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile")}
            style={visitorDashboardStyles.profileButton}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={visitorDashboardStyles.profileGradient}
            >
              <Text style={visitorDashboardStyles.profileInitials}>
                {visitor?.fullName?.charAt(0) || 'V'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={[visitorDashboardStyles.statusCard, { backgroundColor: `${statusColor}15` }]}>
          <View style={visitorDashboardStyles.statusRow}>
            <View style={[visitorDashboardStyles.statusIcon, { backgroundColor: statusColor }]}>
              <Ionicons name={statusIcon} size={20} color="#FFFFFF" />
            </View>
            <Text style={[visitorDashboardStyles.statusValue, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          {timeRemaining && (
            <View style={visitorDashboardStyles.timerRow}>
              <Ionicons name={timeRemaining.icon} size={16} color={timeRemaining.color} />
              <Text style={[visitorDashboardStyles.timerText, { color: timeRemaining.color }]}>
                {timeRemaining.text}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={visitorDashboardStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
      >
        {visitor ? (
          isPendingApproval ? (
            <>
              <View style={visitorDashboardStyles.pendingApprovalCard}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={visitorDashboardStyles.pendingApprovalGradient}
                >
                  <View style={visitorDashboardStyles.pendingApprovalIconWrap}>
                    <Ionicons name="hourglass-outline" size={38} color="#FFFFFF" />
                  </View>
                  <Text style={visitorDashboardStyles.pendingApprovalTitle}>
                    Waiting for Admin Approval
                  </Text>
                  <Text style={visitorDashboardStyles.pendingApprovalText}>
                    Your visitor account has been created successfully. An admin still needs to approve
                    your visit request before your SafePass and check-in features become active.
                  </Text>

                  <View style={visitorDashboardStyles.pendingApprovalInfoBox}>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visitor</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{visitor.fullName}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Email</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{visitor.email}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visit Date</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{formatDate(visitor.visitDate)}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visit Time</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{formatTime(visitor.visitTime)}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Purpose</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>
                        {visitor.purposeOfVisit || "Visit request submitted"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={visitorDashboardStyles.pendingStepsCard}>
                <Text style={visitorDashboardStyles.pendingStepsTitle}>What happens next?</Text>
                {[
                  "Your registration has already been sent to the admin for review.",
                  "Once approved, your visitor pass and access tools will appear here automatically.",
                  "Until then, you can sign in and track your approval status from this dashboard.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.pendingStepItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#F59E0B" />
                    <Text style={visitorDashboardStyles.pendingStepText}>{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={visitorDashboardStyles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={visitorDashboardStyles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : isPendingStaffReview ? (
            <>
              {appointmentFeedback ? (
                <View style={visitorDashboardStyles.appointmentSuccessCard}>
                  <View style={visitorDashboardStyles.appointmentSuccessHeader}>
                    <View style={visitorDashboardStyles.appointmentSuccessIconWrap}>
                      <Ionicons name="checkmark-circle" size={22} color="#0F766E" />
                    </View>
                    <View style={visitorDashboardStyles.appointmentSuccessTextWrap}>
                      <Text style={visitorDashboardStyles.appointmentSuccessTitle}>
                        {appointmentFeedback.title}
                      </Text>
                      <Text style={visitorDashboardStyles.appointmentSuccessText}>
                        {appointmentFeedback.message}
                      </Text>
                    </View>
                  </View>

                  <View style={visitorDashboardStyles.appointmentSuccessMetaRow}>
                    <Text style={visitorDashboardStyles.appointmentSuccessMeta}>
                      {appointmentFeedback.date} at {appointmentFeedback.time}
                    </Text>
                    <Text style={visitorDashboardStyles.appointmentSuccessMeta}>
                      {appointmentFeedback.purpose}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={visitorDashboardStyles.pendingApprovalCard}>
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  style={visitorDashboardStyles.pendingApprovalGradient}
                >
                  <View style={visitorDashboardStyles.pendingApprovalIconWrap}>
                    <Ionicons name="briefcase-outline" size={38} color="#FFFFFF" />
                  </View>
                  <Text style={visitorDashboardStyles.pendingApprovalTitle}>
                    Waiting for Staff Response
                  </Text>
                  <Text style={visitorDashboardStyles.pendingApprovalText}>
                    Your reappointment request is now with the staff team. They can approve it, adjust
                    your preferred time, or decline it from their dashboard.
                  </Text>

                  <View style={visitorDashboardStyles.pendingApprovalInfoBox}>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visitor</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{visitor.fullName}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Preferred Date</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{formatDate(visitor.visitDate)}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Preferred Time</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>{formatTime(visitor.visitTime)}</Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoRow}>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Purpose</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>
                        {visitor.purposeOfVisit || "Appointment request submitted"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={visitorDashboardStyles.pendingStepsCard}>
                <Text style={visitorDashboardStyles.pendingStepsTitle}>What happens next?</Text>
                {[
                  "Staff will review your preferred date, time, and visit purpose.",
                  "If needed, they can adjust the time and you will see the update here after refresh.",
                  "Once approved, your SafePass tools will appear again for check-in and gate access.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.pendingStepItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#3B82F6" />
                    <Text style={visitorDashboardStyles.pendingStepText}>{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={visitorDashboardStyles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={visitorDashboardStyles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : isApprovedVisitor ? (
            <>
              <View style={visitorDashboardStyles.approvedHeroCard}>
                <LinearGradient
                  colors={["#0F766E", "#0EA5A4", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={visitorDashboardStyles.approvedHeroGradient}
                >
                  <View style={visitorDashboardStyles.approvedHeroBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#0F766E" />
                    <Text style={visitorDashboardStyles.approvedHeroBadgeText}>
                      Approved Access
                    </Text>
                  </View>

                  <View style={visitorDashboardStyles.approvedHeroHeader}>
                    <View style={visitorDashboardStyles.approvedHeroAvatar}>
                      <Text style={visitorDashboardStyles.approvedHeroInitials}>
                        {visitor.fullName
                          ?.split(" ")
                          .map((name) => name[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.approvedHeroTextWrap}>
                      <Text style={visitorDashboardStyles.approvedHeroTitle}>
                        Your SafePass is Ready
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroSubtitle}>
                        Present your QR code or use NFC at the gate when you arrive on campus.
                      </Text>
                    </View>
                  </View>

                  <View style={visitorDashboardStyles.approvedHeroFacts}>
                    <View style={visitorDashboardStyles.approvedHeroFactCard}>
                      <Text style={visitorDashboardStyles.approvedHeroFactLabel}>
                        Visit Date
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                        {formatDate(visitor.visitDate)}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.approvedHeroFactCard}>
                      <Text style={visitorDashboardStyles.approvedHeroFactLabel}>
                        Arrival Time
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                        {formatTime(visitor.visitTime)}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.approvedHeroFactCard}>
                      <Text style={visitorDashboardStyles.approvedHeroFactLabel}>
                        Access ID
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                        {visitor.idNumber}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={visitorDashboardStyles.approvedActionSection}>
                <View style={visitorDashboardStyles.approvedSectionHeader}>
                  <Text style={visitorDashboardStyles.approvedSectionTitle}>
                    Access Tools
                  </Text>
                  <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
                    Choose the fastest way to enter campus.
                  </Text>
                </View>

                <View style={visitorDashboardStyles.approvedActionGrid}>
                  <TouchableOpacity
                    style={visitorDashboardStyles.approvedActionCard}
                    onPress={() => setShowQRModal(true)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      style={visitorDashboardStyles.approvedActionIconWrap}
                    >
                      <Ionicons name="qr-code" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={visitorDashboardStyles.approvedActionTitle}>
                      Show QR Pass
                    </Text>
                    <Text style={visitorDashboardStyles.approvedActionText}>
                      Open your visitor pass for gate scanning.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={visitorDashboardStyles.approvedActionCard}
                    onPress={isNfcReading ? stopNfcReading : startNfcReading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={isNfcReading ? ["#2563EB", "#1D4ED8"] : ["#4F46E5", "#7C3AED"]}
                      style={visitorDashboardStyles.approvedActionIconWrap}
                    >
                      <Ionicons name={approvedActionIcon} size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={visitorDashboardStyles.approvedActionTitle}>
                      {approvedActionLabel}
                    </Text>
                    <Text style={visitorDashboardStyles.approvedActionText}>
                      {isNfcReading
                        ? "Your phone is ready to tap on the reader."
                        : isNfcSupported
                          ? "Activate tap-to-check-in before reaching the gate."
                          : "NFC is not available on this device."}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={visitorDashboardStyles.approvedActionCard}
                    onPress={handleCheckIn}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#F59E0B", "#D97706"]}
                      style={visitorDashboardStyles.approvedActionIconWrap}
                    >
                      <Ionicons name="log-in" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={visitorDashboardStyles.approvedActionTitle}>
                      Check In
                    </Text>
                    <Text style={visitorDashboardStyles.approvedActionText}>
                      Manually confirm your arrival if needed.
                    </Text>
                  </TouchableOpacity>
                </View>

                {nfcStatus && (
                  <View style={visitorDashboardStyles.approvedStatusBanner}>
                    <Ionicons
                      name={
                        nfcStatus.type === "success"
                          ? "checkmark-circle"
                          : nfcStatus.type === "error"
                            ? "alert-circle"
                            : "sync-circle"
                      }
                      size={18}
                      color="#4F46E5"
                    />
                    <Text style={visitorDashboardStyles.approvedStatusBannerText}>
                      {nfcStatus.message}
                    </Text>
                  </View>
                )}

                {isAdjustedAppointment && (
                  <View style={[visitorDashboardStyles.approvedStatusBanner, visitorDashboardStyles.adjustedStatusBanner]}>
                    <Ionicons name="swap-horizontal-outline" size={18} color="#1D4ED8" />
                    <Text style={visitorDashboardStyles.adjustedStatusText}>
                      {visitor.staffAdjustmentNote
                        ? `Staff updated your schedule: ${visitor.staffAdjustmentNote}`
                        : "Staff approved your visit with an updated schedule."}
                    </Text>
                  </View>
                )}
              </View>

              <View style={visitorDashboardStyles.approvedInfoCard}>
                <View style={visitorDashboardStyles.approvedSectionHeader}>
                  <Text style={visitorDashboardStyles.approvedSectionTitle}>
                    Visit Snapshot
                  </Text>
                  <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
                    Everything you need before arrival.
                  </Text>
                </View>

                <View style={visitorDashboardStyles.approvedInfoList}>
                  <View style={visitorDashboardStyles.approvedInfoRow}>
                    <Text style={visitorDashboardStyles.approvedInfoLabel}>Visitor</Text>
                    <Text style={visitorDashboardStyles.approvedInfoValue}>{visitor.fullName}</Text>
                  </View>
                  <View style={visitorDashboardStyles.approvedInfoRow}>
                    <Text style={visitorDashboardStyles.approvedInfoLabel}>Purpose</Text>
                    <Text style={visitorDashboardStyles.approvedInfoValue}>
                      {visitor.purposeOfVisit}
                    </Text>
                  </View>
                  <View style={visitorDashboardStyles.approvedInfoRow}>
                    <Text style={visitorDashboardStyles.approvedInfoLabel}>Phone</Text>
                    <Text style={visitorDashboardStyles.approvedInfoValue}>{visitor.phoneNumber}</Text>
                  </View>
                  <View style={visitorDashboardStyles.approvedInfoRow}>
                    <Text style={visitorDashboardStyles.approvedInfoLabel}>Assigned Staff</Text>
                    <Text style={visitorDashboardStyles.approvedInfoValue}>
                      {visitor.assignedStaffName || visitor.host || "Front Office"}
                    </Text>
                  </View>
                  <View style={visitorDashboardStyles.approvedInfoRow}>
                    <Text style={visitorDashboardStyles.approvedInfoLabel}>Vehicle</Text>
                    <Text style={visitorDashboardStyles.approvedInfoValue}>
                      {visitor.vehicleNumber || "No vehicle registered"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={visitorDashboardStyles.approvedTipsCard}>
                <View style={visitorDashboardStyles.approvedSectionHeader}>
                  <Text style={visitorDashboardStyles.approvedSectionTitle}>
                    Arrival Checklist
                  </Text>
                  <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
                    A quick guide for a smooth gate entry.
                  </Text>
                </View>

                {[
                  "Bring the same ID you used during registration.",
                  "Arrive a few minutes before your scheduled visit time.",
                  "Use your QR pass or NFC tap first before asking for manual assistance.",
                ].map((tip) => (
                  <View key={tip} style={visitorDashboardStyles.approvedTipRow}>
                    <View style={visitorDashboardStyles.approvedTipBullet}>
                      <Ionicons name="checkmark" size={14} color="#0F766E" />
                    </View>
                    <Text style={visitorDashboardStyles.approvedTipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={visitorDashboardStyles.mapCard}
                onPress={() => navigation.navigate("WebMapScreen")}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#FEF3C7", "#FFFBEB"]}
                  style={visitorDashboardStyles.mapGradient}
                >
                  <View style={visitorDashboardStyles.mapContent}>
                    <View style={visitorDashboardStyles.mapTextContainer}>
                      <Text style={visitorDashboardStyles.mapTitle}>Campus Map</Text>
                      <Text style={visitorDashboardStyles.mapSubtitle}>
                        Plan your route before you arrive at Sapphire International Aviation Academy.
                      </Text>
                      <View style={visitorDashboardStyles.mapButton}>
                        <Text style={visitorDashboardStyles.mapButtonText}>View Map</Text>
                        <Ionicons name="arrow-forward" size={16} color="#D97706" />
                      </View>
                    </View>
                    <View style={visitorDashboardStyles.mapIconContainer}>
                      <Ionicons name="map-outline" size={48} color="#D97706" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {accessLogs.length > 0 && (
                <View style={visitorDashboardStyles.detailsCard}>
                  <View style={visitorDashboardStyles.detailsHeader}>
                    <Ionicons name="time-outline" size={20} color="#4F46E5" />
                    <Text style={visitorDashboardStyles.detailsTitle}>Recent Access Activity</Text>
                  </View>

                  {accessLogs.slice(0, 3).map((log, index) => (
                    <View key={index} style={visitorDashboardStyles.historyItem}>
                      <View
                        style={[
                          visitorDashboardStyles.historyIcon,
                          {
                            backgroundColor:
                              log.status === "granted" ? "#E3F2E9" : "#FEE2E2",
                          },
                        ]}
                      >
                        <Ionicons
                          name={log.status === "granted" ? "checkmark" : "close"}
                          size={14}
                          color={log.status === "granted" ? "#10B981" : "#EF4444"}
                        />
                      </View>
                      <View style={visitorDashboardStyles.historyInfo}>
                        <Text style={visitorDashboardStyles.historyLocation}>
                          {log.location || "Main Gate"}
                        </Text>
                        <Text style={visitorDashboardStyles.historyTime}>
                          {formatDateTime(log.timestamp)}
                        </Text>
                      </View>
                      <View
                        style={[
                          visitorDashboardStyles.historyStatus,
                          {
                            backgroundColor:
                              log.status === "granted" ? "#E3F2E9" : "#FEE2E2",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            visitorDashboardStyles.historyStatusText,
                            {
                              color:
                                log.status === "granted" ? "#10B981" : "#EF4444",
                            },
                          ]}
                        >
                          {log.status === "granted" ? "Granted" : "Denied"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={visitorDashboardStyles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={visitorDashboardStyles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : canRequestNewAppointment ? (
            <>
              {appointmentFeedback ? (
                <View style={visitorDashboardStyles.appointmentSuccessCard}>
                  <View style={visitorDashboardStyles.appointmentSuccessHeader}>
                    <View style={visitorDashboardStyles.appointmentSuccessIconWrap}>
                      <Ionicons name="checkmark-circle" size={22} color="#0F766E" />
                    </View>
                    <View style={visitorDashboardStyles.appointmentSuccessTextWrap}>
                      <Text style={visitorDashboardStyles.appointmentSuccessTitle}>
                        {appointmentFeedback.title}
                      </Text>
                      <Text style={visitorDashboardStyles.appointmentSuccessText}>
                        {appointmentFeedback.message}
                      </Text>
                    </View>
                  </View>

                  <View style={visitorDashboardStyles.appointmentSuccessMetaRow}>
                    <Text style={visitorDashboardStyles.appointmentSuccessMeta}>
                      {appointmentFeedback.date} at {appointmentFeedback.time}
                    </Text>
                    <Text style={visitorDashboardStyles.appointmentSuccessMeta}>
                      {appointmentFeedback.purpose}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={visitorDashboardStyles.reappointmentHeroCard}>
                <LinearGradient
                  colors={visitor?.appointmentStatus === "rejected" ? ["#DC2626", "#B91C1C"] : ["#0F766E", "#2563EB"]}
                  style={visitorDashboardStyles.reappointmentHeroGradient}
                >
                  <View style={visitorDashboardStyles.reappointmentHeroBadge}>
                    <Ionicons
                      name={visitor?.appointmentStatus === "rejected" ? "alert-circle-outline" : "calendar-outline"}
                      size={16}
                      color={visitor?.appointmentStatus === "rejected" ? "#991B1B" : "#0F766E"}
                    />
                    <Text style={visitorDashboardStyles.reappointmentHeroBadgeText}>
                      {visitor?.appointmentStatus === "rejected" ? "Appointment Declined" : "Ready for Another Visit"}
                    </Text>
                  </View>
                  <Text style={visitorDashboardStyles.reappointmentHeroTitle}>
                    {visitor?.appointmentStatus === "rejected"
                      ? "Request A New Schedule"
                      : "Book Your Next Appointment"}
                  </Text>
                  <Text style={visitorDashboardStyles.reappointmentHeroText}>
                    {visitor?.appointmentStatus === "rejected"
                      ? visitor?.staffRejectionReason || "Your previous appointment was declined. You can submit a new request here without registering again."
                      : "Your visitor account is active. Enter your preferred date, time, and purpose to send a new request directly to staff."}
                  </Text>

                  <View style={visitorDashboardStyles.reappointmentMetaGrid}>
                    <View style={visitorDashboardStyles.reappointmentMetaCard}>
                      <Text style={visitorDashboardStyles.reappointmentMetaLabel}>Last Schedule</Text>
                      <Text style={visitorDashboardStyles.reappointmentMetaValue}>{formatDate(visitor.visitDate)}</Text>
                    </View>
                    <View style={visitorDashboardStyles.reappointmentMetaCard}>
                      <Text style={visitorDashboardStyles.reappointmentMetaLabel}>Last Time</Text>
                      <Text style={visitorDashboardStyles.reappointmentMetaValue}>{formatTime(visitor.visitTime)}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={visitorDashboardStyles.reappointmentCard}>
                <View style={visitorDashboardStyles.reappointmentCardHeader}>
                  <View>
                    <Text style={visitorDashboardStyles.reappointmentCardTitle}>New Appointment Request</Text>
                    <Text style={visitorDashboardStyles.reappointmentCardSubtitle}>
                      Staff will receive your preferred schedule and visit purpose.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={visitorDashboardStyles.reappointmentPrimaryButton}
                    onPress={openAppointmentModal}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={visitorDashboardStyles.reappointmentPrimaryButtonText}>Request Visit</Text>
                  </TouchableOpacity>
                </View>

                <View style={visitorDashboardStyles.reappointmentChecklist}>
                  {[
                    "Use your existing visitor account. No need to register again.",
                    "Choose your preferred date and time for the next visit.",
                    "Staff will approve, adjust, or reject the request from their dashboard.",
                  ].map((item) => (
                    <View key={item} style={visitorDashboardStyles.reappointmentChecklistRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#0F766E" />
                      <Text style={visitorDashboardStyles.reappointmentChecklistText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {accessLogs.length > 0 && (
                <View style={visitorDashboardStyles.detailsCard}>
                  <View style={visitorDashboardStyles.detailsHeader}>
                    <Ionicons name="time-outline" size={20} color="#4F46E5" />
                    <Text style={visitorDashboardStyles.detailsTitle}>Recent Access Activity</Text>
                  </View>

                  {accessLogs.slice(0, 3).map((log, index) => (
                    <View key={index} style={visitorDashboardStyles.historyItem}>
                      <View
                        style={[
                          visitorDashboardStyles.historyIcon,
                          {
                            backgroundColor: log.status === "granted" ? "#E3F2E9" : "#FEE2E2",
                          },
                        ]}
                      >
                        <Ionicons
                          name={log.status === "granted" ? "checkmark" : "close"}
                          size={14}
                          color={log.status === "granted" ? "#10B981" : "#EF4444"}
                        />
                      </View>
                      <View style={visitorDashboardStyles.historyInfo}>
                        <Text style={visitorDashboardStyles.historyLocation}>
                          {log.location || "Main Gate"}
                        </Text>
                        <Text style={visitorDashboardStyles.historyTime}>
                          {formatDateTime(log.timestamp)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={visitorDashboardStyles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={visitorDashboardStyles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
          <>
            {/* NFC Tap Card - Interactive Tap to Check In/Out */}
            <TouchableOpacity 
              style={visitorDashboardStyles.nfcCard}
              onPress={isNfcReading ? stopNfcReading : startNfcReading}
              activeOpacity={0.95}
              disabled={!isNfcSupported}
            >
              <LinearGradient
                colors={isNfcReading ? ['#10B981', '#059669'] : ['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={visitorDashboardStyles.nfcCardGradient}
              >
                <View style={visitorDashboardStyles.nfcHeader}>
                  <View>
                    <Text style={visitorDashboardStyles.nfcTitle}>
                      {isNfcReading ? 'READY TO TAP' : 'TAP TO CHECK IN'}
                    </Text>
                    <Text style={visitorDashboardStyles.nfcSubtitle}>
                      {isNfcReading 
                        ? 'Hold your device near the NFC reader' 
                        : isNfcSupported 
                          ? 'Tap your phone to the gate reader' 
                          : 'NFC not supported on this device'}
                    </Text>
                  </View>
                  <View style={visitorDashboardStyles.nfcChipIcon}>
                    <Ionicons 
                      name={isNfcReading ? "radio" : "nfc"} 
                      size={28} 
                      color="#FFD700" 
                    />
                  </View>
                </View>

                {/* NFC Status Indicator */}
                {nfcStatus && (
                  <View style={visitorDashboardStyles.nfcStatusContainer}>
                    <View style={[
                      visitorDashboardStyles.nfcStatusIndicator,
                      nfcStatus.type === 'success' && visitorDashboardStyles.nfcStatusSuccess,
                      nfcStatus.type === 'error' && visitorDashboardStyles.nfcStatusError,
                      nfcStatus.type === 'processing' && visitorDashboardStyles.nfcStatusProcessing,
                    ]}>
                      <Text style={visitorDashboardStyles.nfcStatusText}>
                        {nfcStatus.message}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={visitorDashboardStyles.nfcBody}>
                  <View style={visitorDashboardStyles.visitorAvatar}>
                    <Text style={visitorDashboardStyles.visitorInitials}>
                      {visitor.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={visitorDashboardStyles.visitorInfo}>
                    <Text style={visitorDashboardStyles.visitorName}>{visitor.fullName}</Text>
                    <Text style={visitorDashboardStyles.visitorId}>ID: {visitor.idNumber}</Text>
                    <View style={visitorDashboardStyles.nfcChip}>
                      <Ionicons 
                        name={isNfcReading ? "radio" : "nfc"} 
                        size={12} 
                        color="#FFD700" 
                      />
                      <Text style={visitorDashboardStyles.nfcChipText}>
                        {isNfcReading ? 'Listening for NFC...' : 'Tap to Activate NFC'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={visitorDashboardStyles.nfcFooter}>
                  <View style={visitorDashboardStyles.nfcDetail}>
                    <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={visitorDashboardStyles.nfcDetailText}>
                      {formatDate(visitor.visitDate)}
                    </Text>
                  </View>
                  <View style={visitorDashboardStyles.nfcDetail}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={visitorDashboardStyles.nfcDetailText}>
                      {formatTime(visitor.visitTime)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={visitorDashboardStyles.quickActions}>
              <TouchableOpacity 
                style={visitorDashboardStyles.quickAction}
                onPress={() => setShowQRModal(true)}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={visitorDashboardStyles.quickActionGradient}
                >
                  <Ionicons name="qr-code" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={visitorDashboardStyles.quickActionText}>Show QR</Text>
              </TouchableOpacity>

              {visitor.status !== 'checked_in' && visitor.status !== 'checked_out' && visitor.status === 'approved' && (
                <TouchableOpacity 
                  style={visitorDashboardStyles.quickAction}
                  onPress={handleCheckIn}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={visitorDashboardStyles.quickActionGradient}
                  >
                    <Ionicons name="log-in" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={visitorDashboardStyles.quickActionText}>Check In</Text>
                </TouchableOpacity>
              )}

              {visitor.status === 'checked_in' && (
                <TouchableOpacity 
                  style={visitorDashboardStyles.quickAction}
                  onPress={handleCheckOut}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={visitorDashboardStyles.quickActionGradient}
                  >
                    <Ionicons name="log-out" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={visitorDashboardStyles.quickActionText}>Check Out</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={visitorDashboardStyles.quickAction}
                onPress={onRefresh}
              >
                <LinearGradient
                  colors={['#6B7280', '#4B5563']}
                  style={visitorDashboardStyles.quickActionGradient}
                >
                  <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={visitorDashboardStyles.quickActionText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Campus Map Card */}
            <TouchableOpacity
              style={visitorDashboardStyles.mapCard}
              onPress={() => navigation.navigate("WebMapScreen")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FFFBEB']}
                style={visitorDashboardStyles.mapGradient}
              >
                <View style={visitorDashboardStyles.mapContent}>
                  <View style={visitorDashboardStyles.mapTextContainer}>
                    <Text style={visitorDashboardStyles.mapTitle}>Campus Map</Text>
                    <Text style={visitorDashboardStyles.mapSubtitle}>
                      Find your way around Sapphire International Aviation Academy
                    </Text>
                    <View style={visitorDashboardStyles.mapButton}>
                      <Text style={visitorDashboardStyles.mapButtonText}>View Map</Text>
                      <Ionicons name="arrow-forward" size={16} color="#D97706" />
                    </View>
                  </View>
                  <View style={visitorDashboardStyles.mapIconContainer}>
                    <Ionicons name="map-outline" size={48} color="#D97706" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Visit Details Card */}
            <View style={visitorDashboardStyles.detailsCard}>
              <View style={visitorDashboardStyles.detailsHeader}>
                <Ionicons name="calendar" size={20} color="#4F46E5" />
                <Text style={visitorDashboardStyles.detailsTitle}>Visit Details</Text>
              </View>
              
              <View style={visitorDashboardStyles.detailItem}>
                <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                <View style={visitorDashboardStyles.detailContent}>
                  <Text style={visitorDashboardStyles.detailLabel}>Purpose</Text>
                  <Text style={visitorDashboardStyles.detailValue}>{visitor.purposeOfVisit}</Text>
                </View>
              </View>

              {visitor.vehicleNumber && (
                <View style={visitorDashboardStyles.detailItem}>
                  <Ionicons name="car-outline" size={18} color="#6B7280" />
                  <View style={visitorDashboardStyles.detailContent}>
                    <Text style={visitorDashboardStyles.detailLabel}>Vehicle</Text>
                    <Text style={visitorDashboardStyles.detailValue}>{visitor.vehicleNumber}</Text>
                  </View>
                </View>
              )}

              <View style={visitorDashboardStyles.detailItem}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <View style={visitorDashboardStyles.detailContent}>
                  <Text style={visitorDashboardStyles.detailLabel}>Date & Time</Text>
                  <Text style={visitorDashboardStyles.detailValue}>
                    {formatDate(visitor.visitDate)} at {formatTime(visitor.visitTime)}
                  </Text>
                </View>
              </View>

              <View style={visitorDashboardStyles.detailItem}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <View style={visitorDashboardStyles.detailContent}>
                  <Text style={visitorDashboardStyles.detailLabel}>Contact</Text>
                  <Text style={visitorDashboardStyles.detailValue}>{visitor.phoneNumber}</Text>
                </View>
              </View>
            </View>

            {/* Access History */}
            {accessLogs.length > 0 && (
              <View style={visitorDashboardStyles.detailsCard}>
                <View style={visitorDashboardStyles.detailsHeader}>
                  <Ionicons name="time-outline" size={20} color="#4F46E5" />
                  <Text style={visitorDashboardStyles.detailsTitle}>Access History</Text>
                </View>
                
                {accessLogs.slice(0, 5).map((log, index) => (
                  <View key={index} style={visitorDashboardStyles.historyItem}>
                    <View style={[visitorDashboardStyles.historyIcon, { 
                      backgroundColor: log.status === 'granted' ? '#E3F2E9' : '#FEE2E2' 
                    }]}>
                      <Ionicons 
                        name={log.status === 'granted' ? "checkmark" : "close"} 
                        size={14} 
                        color={log.status === 'granted' ? '#10B981' : '#EF4444'} 
                      />
                    </View>
                    <View style={visitorDashboardStyles.historyInfo}>
                      <Text style={visitorDashboardStyles.historyLocation}>{log.location || 'Main Gate'}</Text>
                      <Text style={visitorDashboardStyles.historyTime}>
                        {formatDateTime(log.timestamp)}
                      </Text>
                    </View>
                    <View style={[visitorDashboardStyles.historyStatus, { 
                      backgroundColor: log.status === 'granted' ? '#E3F2E9' : '#FEE2E2' 
                    }]}>
                      <Text style={[visitorDashboardStyles.historyStatusText, { 
                        color: log.status === 'granted' ? '#10B981' : '#EF4444' 
                      }]}>
                        {log.status === 'granted' ? 'Granted' : 'Denied'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* NFC Instructions */}
            {isNfcSupported && (
              <View style={visitorDashboardStyles.nfcInstructionsCard}>
                <Ionicons name="information-circle" size={20} color="#4F46E5" />
                <Text style={visitorDashboardStyles.nfcInstructionsText}>
                  Tap your phone to any NFC reader at the gate to automatically check in/out
                </Text>
              </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity
              style={visitorDashboardStyles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={visitorDashboardStyles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
          )
        ) : (
          <View style={visitorDashboardStyles.emptyState}>
            <View style={visitorDashboardStyles.emptyIconContainer}>
              <Ionicons name="id-card-outline" size={80} color="#9CA3AF" />
            </View>
            {appointmentFeedback ? (
              <View style={visitorDashboardStyles.appointmentSuccessCard}>
                <View style={visitorDashboardStyles.appointmentSuccessHeader}>
                  <View style={visitorDashboardStyles.appointmentSuccessIconWrap}>
                    <Ionicons name="checkmark-circle" size={22} color="#0F766E" />
                  </View>
                  <View style={visitorDashboardStyles.appointmentSuccessTextWrap}>
                    <Text style={visitorDashboardStyles.appointmentSuccessTitle}>
                      {appointmentFeedback.title}
                    </Text>
                    <Text style={visitorDashboardStyles.appointmentSuccessText}>
                      {appointmentFeedback.message}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
            <Text style={visitorDashboardStyles.emptyTitle}>
              {canCreateFreshAppointment ? "Request Your Next Visit" : "No Visitor Pass Found"}
            </Text>
            <Text style={visitorDashboardStyles.emptyText}>
              {canCreateFreshAppointment
                ? "Your visitor account is already active. Submit a new preferred date, time, and purpose here instead of registering again."
                : "You don't have an active visitor pass yet. Please register as a visitor first."}
            </Text>
            <TouchableOpacity
              style={visitorDashboardStyles.registerButton}
              onPress={canCreateFreshAppointment ? openAppointmentModal : () => navigation.navigate("VisitorRegister")}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={visitorDashboardStyles.registerGradient}
              >
                <Ionicons name={canCreateFreshAppointment ? "calendar-outline" : "person-add"} size={20} color="#FFFFFF" />
                <Text style={visitorDashboardStyles.registerButtonText}>
                  {canCreateFreshAppointment ? "Request Appointment" : "Register as Visitor"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAppointmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAppointmentModal}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.appointmentModalContent}>
            <LinearGradient
              colors={["#0F766E", "#2563EB"]}
              style={visitorDashboardStyles.appointmentModalHeader}
            >
              <View>
                <Text style={visitorDashboardStyles.appointmentModalTitle}>New Appointment Request</Text>
                <Text style={visitorDashboardStyles.appointmentModalSubtitle}>
                  Send your preferred schedule directly to staff.
                </Text>
              </View>
              <TouchableOpacity onPress={closeAppointmentModal}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={visitorDashboardStyles.appointmentModalBody}>
              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Preferred Date</Text>
                <TextInput
                  style={visitorDashboardStyles.appointmentFieldInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={appointmentForm.preferredDate}
                  onChangeText={(text) =>
                    setAppointmentForm((prev) => ({ ...prev, preferredDate: text }))
                  }
                  autoCapitalize="none"
                />
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Preferred Time</Text>
                <TextInput
                  style={visitorDashboardStyles.appointmentFieldInput}
                  placeholder="HH:MM"
                  placeholderTextColor="#94A3B8"
                  value={appointmentForm.preferredTime}
                  onChangeText={(text) =>
                    setAppointmentForm((prev) => ({ ...prev, preferredTime: text }))
                  }
                  autoCapitalize="none"
                />
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Purpose Of Visit</Text>
                <TextInput
                  style={[visitorDashboardStyles.appointmentFieldInput, visitorDashboardStyles.appointmentFieldTextarea]}
                  placeholder="Describe why you need to visit the campus"
                  placeholderTextColor="#94A3B8"
                  value={appointmentForm.purposeOfVisit}
                  onChangeText={(text) =>
                    setAppointmentForm((prev) => ({ ...prev, purposeOfVisit: text }))
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={visitorDashboardStyles.appointmentModalFooter}>
                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentSecondaryButton}
                  onPress={closeAppointmentModal}
                  disabled={isSubmittingAppointment}
                >
                  <Text style={visitorDashboardStyles.appointmentSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentPrimaryButton}
                  onPress={handleRequestAppointment}
                  disabled={isSubmittingAppointment}
                >
                  {isSubmittingAppointment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                      <Text style={visitorDashboardStyles.appointmentPrimaryButtonText}>Send Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.qrModalContent}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={visitorDashboardStyles.qrModalHeader}
            >
              <Text style={visitorDashboardStyles.qrModalTitle}>Your Visitor Pass</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={visitorDashboardStyles.qrContainer}>
              <View style={visitorDashboardStyles.qrPlaceholder}>
                <Ionicons name="qr-code" size={180} color="#4F46E5" />
              </View>
              <Text style={visitorDashboardStyles.qrVisitorName}>{visitor?.fullName}</Text>
              <Text style={visitorDashboardStyles.qrVisitorId}>ID: {visitor?.idNumber}</Text>
              
              <View style={visitorDashboardStyles.qrDivider} />
              
              <View style={visitorDashboardStyles.qrDetails}>
                <View style={visitorDashboardStyles.qrDetailRow}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text style={visitorDashboardStyles.qrDetailText}>
                    {formatDate(visitor?.visitDate)}
                  </Text>
                </View>
                <View style={visitorDashboardStyles.qrDetailRow}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={visitorDashboardStyles.qrDetailText}>
                    {formatTime(visitor?.visitTime)}
                  </Text>
                </View>
              </View>
              
              <View style={visitorDashboardStyles.qrFooter}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={visitorDashboardStyles.qrNote}>
                  Show this QR code at the security gate
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
