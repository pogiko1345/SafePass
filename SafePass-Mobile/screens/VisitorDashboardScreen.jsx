import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Vibration,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import ApiService from "../utils/ApiService";
import CampusMap from "../components/CampusMap";
import visitorDashboardStyles from "../styles/VisitorDashboardStyles";
import {
  MONITORING_MAP_BLUEPRINTS,
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";

let DateTimePickerComponent = null;
if (Platform.OS !== "web") {
  try {
    const DateTimePickerModule = require("@react-native-community/datetimepicker");
    DateTimePickerComponent = DateTimePickerModule.default;
  } catch (error) {
    console.warn("DateTimePicker not available:", error);
  }
}

const APPOINTMENT_PURPOSE_OPTIONS = [
  "Enrollment",
  "Payment",
  "Inquiry",
  "Document Request",
  "Other",
];

const APPOINTMENT_DEPARTMENT_OPTIONS = [
  "Registrar",
  "Accounting",
  "Information Desk",
];

const VISITOR_MODULES = [
  {
    id: "home",
    label: "Home",
    description: "Overview and quick actions",
    icon: "home-outline",
  },
  {
    id: "appointment-request",
    label: "Appointment Request",
    description: "Create a new visit request",
    icon: "calendar-outline",
  },
  {
    id: "appointment-status",
    label: "Appointment Status",
    description: "Track pending, approved, or rejected visits",
    icon: "list-circle-outline",
  },
  {
    id: "map",
    label: "Campus Map",
    description: "Ground, mezzanine, second, and third floor guide",
    icon: "map-outline",
  },
];

const getDefaultDepartmentForPurpose = (purpose = "") => {
  switch (purpose) {
    case "Enrollment":
    case "Document Request":
      return "Registrar";
    case "Payment":
      return "Accounting";
    case "Inquiry":
      return "Information Desk";
    default:
      return "";
  }
};

const PHONE_TRACKING_INTERVAL_MS = 15000;
const PHONE_TRACKING_DISTANCE_METERS = 8;

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
  const { width: viewportWidth } = useWindowDimensions();
  const isWideVisitorDashboard = viewportWidth >= 960;
  const isTabletVisitorDashboard = viewportWidth >= 680;
  const isCompactVisitorDashboard = viewportWidth <= 420;
  const dashboardHorizontalGutter = isCompactVisitorDashboard ? 12 : viewportWidth <= 680 ? 16 : 20;
  const dashboardCardPadding = isCompactVisitorDashboard ? 16 : 22;
  const [visitor, setVisitor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedVisitorSection, setSelectedVisitorSection] = useState("home");
  const [selectedVisitorMapFloor, setSelectedVisitorMapFloor] = useState("ground");
  const [appointmentFeedback, setAppointmentFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAppointmentDatePicker, setShowAppointmentDatePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showVirtualNfcModal, setShowVirtualNfcModal] = useState(false);
  const [showVirtualNfcSuccessModal, setShowVirtualNfcSuccessModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckInSuccessModal, setShowCheckInSuccessModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showCheckOutSuccessModal, setShowCheckOutSuccessModal] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [isVirtualTapLoading, setIsVirtualTapLoading] = useState(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    preferredDate: null,
    preferredTime: null,
    department: "Registrar",
    purposeSelection: "Enrollment",
    customPurpose: "",
    idNumber: "",
    idImage: null,
    privacyAccepted: false,
  });
  const [accessLogs, setAccessLogs] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isNfcEnabled, setIsNfcEnabled] = useState(false);
  const [isNfcReading, setIsNfcReading] = useState(false);
  const [nfcStatus, setNfcStatus] = useState(null);
  const [phoneTrackingStatus, setPhoneTrackingStatus] = useState({
    active: false,
    permission: "unknown",
    message: "Phone GPS tracking starts after check-in.",
    lastSentAt: null,
  });
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const nfcListenerRef = useRef(null);
  const phoneLocationSubscriptionRef = useRef(null);
  const appointmentWebDateInputRef = useRef(null);
  const isCompactVirtualCardView = viewportWidth <= 540;
  const commandMetricCardWidth = isWideVisitorDashboard
    ? "31.8%"
    : isTabletVisitorDashboard
      ? "48.5%"
      : "100%";
  const compactCommandMetricCardWidth = viewportWidth <= 560 ? "100%" : commandMetricCardWidth;
  const approvedFactCardWidth = isWideVisitorDashboard
    ? "31.8%"
    : isTabletVisitorDashboard
      ? "48.5%"
      : "100%";
  const approvedActionCardWidth = isTabletVisitorDashboard ? "48.5%" : "100%";
  const compactApprovedActionCardWidth = viewportWidth <= 560 ? "100%" : approvedActionCardWidth;
  const appointmentTimeOptions = useMemo(() => {
    const options = [];
    for (let hour = 7; hour <= 18; hour += 1) {
      for (const minute of [0, 30]) {
        const option = new Date();
        option.setHours(hour, minute, 0, 0);
        options.push(option);
      }
    }
    return options;
  }, []);
  const dashboardShellResponsiveStyle = {
    paddingHorizontal: dashboardHorizontalGutter,
    paddingBottom: isCompactVisitorDashboard ? 24 : 16,
  };
  const dashboardCardResponsiveStyle = {
    marginHorizontal: 0,
    padding: dashboardCardPadding,
  };
  const dashboardHeroCardResponsiveStyle = {
    marginHorizontal: 0,
  };
  const dashboardSectionResponsiveStyle = {
    marginHorizontal: 0,
  };
  const commandActionRowResponsiveStyle = viewportWidth <= 560 ? { gap: 10 } : null;
  const commandActionButtonResponsiveStyle = viewportWidth <= 560 ? { width: "100%" } : null;
  const approvedSectionHeaderResponsiveStyle = viewportWidth <= 560
    ? { marginBottom: 12 }
    : null;

  useEffect(() => {
    loadVisitorData();
    setGreetingMessage();
    checkNfcSupport();
    
    return () => {
      stopNfcReading();
      stopPhoneLocationTracking();
    };
  }, []);

  useEffect(() => {
    if (visitor?.status === "checked_in") {
      startPhoneLocationTracking(visitor);
    } else {
      stopPhoneLocationTracking();
    }
  }, [visitor?._id, visitor?.status]);

  const stopPhoneLocationTracking = async () => {
    if (phoneLocationSubscriptionRef.current) {
      phoneLocationSubscriptionRef.current.remove();
      phoneLocationSubscriptionRef.current = null;
    }

    setPhoneTrackingStatus((current) => ({
      ...current,
      active: false,
      message:
        current.permission === "denied"
          ? "Location permission is disabled."
          : "Phone GPS tracking is off.",
    }));
  };

  const sendPhoneLocationUpdate = async (visitorRecord, location) => {
    const coords = location?.coords;
    if (!visitorRecord?._id || !coords) return;

    await ApiService.updateVisitorPhoneLocation(visitorRecord._id, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      heading: coords.heading,
      speed: coords.speed,
      floor: visitorRecord.currentLocation?.floor || "ground",
      office: visitorRecord.currentLocation?.office || "Phone GPS",
      deviceId: `visitor-phone-${visitorRecord._id}`,
    });

    setPhoneTrackingStatus({
      active: true,
      permission: "granted",
      message: `Last phone GPS update sent at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`,
      lastSentAt: new Date().toISOString(),
    });
  };

  const startPhoneLocationTracking = async (visitorRecord = visitor) => {
    if (Platform.OS === "web" || !visitorRecord?._id || phoneLocationSubscriptionRef.current) {
      return;
    }

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setPhoneTrackingStatus({
          active: false,
          permission: "disabled",
          message: "Turn on Location Services to allow live visitor tracking.",
          lastSentAt: null,
        });
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setPhoneTrackingStatus({
          active: false,
          permission: "denied",
          message: "Location permission is required for live visitor tracking.",
          lastSentAt: null,
        });
        return;
      }

      setPhoneTrackingStatus({
        active: true,
        permission: "granted",
        message: "Phone GPS tracking is active while you are checked in.",
        lastSentAt: null,
      });

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await sendPhoneLocationUpdate(visitorRecord, currentPosition);

      phoneLocationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: PHONE_TRACKING_INTERVAL_MS,
          distanceInterval: PHONE_TRACKING_DISTANCE_METERS,
        },
        async (position) => {
          try {
            await sendPhoneLocationUpdate(visitorRecord, position);
          } catch (error) {
            console.error("Phone GPS tracking update error:", error);
            setPhoneTrackingStatus((current) => ({
              ...current,
              active: false,
              message: "Unable to send phone GPS update. It will retry while this screen is open.",
            }));
          }
        },
      );
    } catch (error) {
      console.error("Start phone GPS tracking error:", error);
      setPhoneTrackingStatus({
        active: false,
        permission: "error",
        message: "Phone GPS tracking could not start.",
        lastSentAt: null,
      });
    }
  };

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

  const getValidDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const getDefaultAppointmentDate = () => {
    const visitorDate = getValidDate(visitor?.visitDate);
    if (visitorDate) return visitorDate;
    const nextVisitDate = new Date();
    nextVisitDate.setDate(nextVisitDate.getDate() + 1);
    nextVisitDate.setHours(9, 0, 0, 0);
    return nextVisitDate;
  };

  const getDefaultAppointmentTime = () => {
    const visitorTime = getValidDate(visitor?.visitTime);
    if (visitorTime) return visitorTime;
    const nextVisitTime = new Date();
    nextVisitTime.setHours(9, 0, 0, 0);
    return nextVisitTime;
  };

  const formatAppointmentPickerDate = (dateValue) => {
    const date = getValidDate(dateValue);
    if (!date) return "Select preferred date";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getAppointmentMinDateValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getAppointmentWebDateValue = () => {
    const date = getValidDate(appointmentForm.preferredDate) || getDefaultAppointmentDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyAppointmentDateSelection = (selectedValue) => {
    const selectedDate = getValidDate(selectedValue);
    if (!selectedDate) return;

    selectedDate.setHours(12, 0, 0, 0);
    setAppointmentForm((prev) => ({
      ...prev,
      preferredDate: selectedDate,
    }));
  };

  const handleAppointmentDatePress = () => {
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);

    if (Platform.OS === "web") {
      const input = appointmentWebDateInputRef.current;
      if (input?.showPicker) {
        input.showPicker();
        return;
      }
      input?.click?.();
      return;
    }

    setShowAppointmentDatePicker(true);
  };

  const handleAppointmentDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowAppointmentDatePicker(false);
    }

    if (event?.type === "dismissed" || !selectedDate) {
      return;
    }

    applyAppointmentDateSelection(selectedDate);
  };

  const handleAppointmentWebDateChange = (event) => {
    const nextValue = event?.target?.value;
    if (!nextValue) return;

    const [year, month, day] = nextValue.split("-").map(Number);
    if (!year || !month || !day) return;

    applyAppointmentDateSelection(new Date(year, month - 1, day));
  };

  const populateAppointmentForm = () => {
    const existingCategory = String(visitor?.purposeCategory || "").trim();
    const existingPurpose = String(visitor?.purposeOfVisit || "").trim();
    const matchedPurpose = APPOINTMENT_PURPOSE_OPTIONS.includes(existingCategory)
      ? existingCategory
      : APPOINTMENT_PURPOSE_OPTIONS.includes(existingPurpose)
        ? existingPurpose
        : existingPurpose
          ? "Other"
          : "Enrollment";
    const existingDepartment = String(
      visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || "",
    ).trim();
    const mappedDepartment =
      matchedPurpose === "Other"
        ? existingDepartment
        : getDefaultDepartmentForPurpose(matchedPurpose) || existingDepartment;

    setAppointmentForm({
      preferredDate: getDefaultAppointmentDate(),
      preferredTime: getDefaultAppointmentTime(),
      department: mappedDepartment,
      purposeSelection: matchedPurpose,
      customPurpose:
        matchedPurpose === "Other"
          ? String(visitor?.customPurposeOfVisit || existingPurpose || "").trim()
          : "",
      idNumber: String(visitor?.idNumber || "").startsWith("VIS-")
        ? ""
        : String(visitor?.idNumber || "").trim(),
      idImage: visitor?.idImage || null,
      privacyAccepted: false,
    });
  };

  const handlePickAppointmentIdImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Needed",
          "Please allow photo access so you can upload a valid ID picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.75,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const imageValue = asset.base64
        ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
        : asset.uri;

      setAppointmentForm((prev) => ({
        ...prev,
        idImage: imageValue,
      }));
    } catch (error) {
      console.error("Pick appointment ID image error:", error);
      Alert.alert("Upload Failed", "Unable to select the ID image. Please try again.");
    }
  };

  const openAppointmentModal = () => {
    populateAppointmentForm();
    setShowAppointmentDatePicker(false);
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentDatePicker(false);
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);
    setShowAppointmentModal(false);
  };

  const handleRequestAppointment = async () => {
    const preferredDate = appointmentForm.preferredDate;
    const preferredTime = appointmentForm.preferredTime;
    const isOtherPurpose = appointmentForm.purposeSelection === "Other";
    const purposeCategory = String(appointmentForm.purposeSelection || "").trim();
    const customPurposeOfVisit = String(appointmentForm.customPurpose || "").trim();
    const purposeOfVisit = isOtherPurpose ? customPurposeOfVisit : purposeCategory;
    const department = isOtherPurpose
      ? String(appointmentForm.department || "").trim()
      : getDefaultDepartmentForPurpose(purposeCategory);
    const idNumber = String(appointmentForm.idNumber || "").trim();
    const idImage = appointmentForm.idImage;

    if (!currentUser?._id) {
      Alert.alert("Login Required", "Please sign in again before requesting a new appointment.");
      return;
    }

    if (!purposeCategory) {
      Alert.alert("Missing Details", "Please select a purpose of visit.");
      return;
    }

    if (isOtherPurpose && !customPurposeOfVisit) {
      Alert.alert("Missing Details", "Please enter your purpose of visit.");
      return;
    }

    if (!preferredDate || !preferredTime) {
      Alert.alert("Missing Details", "Please select the preferred date and time.");
      return;
    }

    if (!department) {
      Alert.alert("Missing Details", "Please provide the office or department to visit.");
      return;
    }

    if (!idNumber) {
      Alert.alert("Missing Valid ID", "Please enter the ID number shown on your valid ID.");
      return;
    }

    if (!idImage) {
      Alert.alert("Missing Valid ID Picture", "Please upload a clear picture of your valid ID before submitting.");
      return;
    }

    if (!appointmentForm.privacyAccepted) {
      Alert.alert(
        "Data Privacy Confirmation",
        "Please confirm that you allow Sapphire SafePass to collect your appointment and ID information for visit verification.",
      );
      return;
    }

    const combinedDateTime = new Date(preferredDate);
    combinedDateTime.setHours(preferredTime.getHours(), preferredTime.getMinutes(), 0, 0);
    if (Number.isNaN(combinedDateTime.getTime())) {
      Alert.alert("Invalid Schedule", "Please choose a valid preferred date and time.");
      return;
    }

    setIsSubmittingAppointment(true);
    try {
      const response = await ApiService.requestVisitorAppointment(currentUser._id, {
        preferredDate: new Date(preferredDate).toISOString(),
        preferredTime: combinedDateTime.toISOString(),
        purposeCategory,
        customPurposeOfVisit: isOtherPurpose ? customPurposeOfVisit : "",
        department,
        officeToVisit: department,
        assignedOffice: department,
        appointmentDepartment: department,
        purposeOfVisit,
        idNumber,
        idImage,
        dataPrivacyAccepted: true,
        dataPrivacyAcceptedAt: new Date().toISOString(),
      });

      if (response?.success) {
        setShowAppointmentModal(false);
        setAppointmentFeedback({
          title: "Appointment Submitted Successfully",
          message:
            "Your new visit request has been sent to staff for review. You can track approval, time adjustments, or rejection updates from this dashboard.",
          date: formatDate(preferredDate),
          time: formatTime(preferredTime),
          department,
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

  const handleVirtualNfcCardTap = async () => {
    if (!visitor || isVirtualTapLoading) return;

    setIsVirtualTapLoading(true);
    setNfcStatus({
      type: "processing",
      message: "Processing your virtual NFC tap and notifying the operations team...",
    });

    try {
      const response = await ApiService.visitorCheckIn(visitor._id, {
        source: "virtual_nfc_card",
      });

      if (response?.success) {
        setShowVirtualNfcModal(false);
        setShowVirtualNfcSuccessModal(true);
        setNfcStatus({
          type: "success",
          message: "Virtual NFC card accepted. Security and admin have been notified of your check-in.",
        });
        await loadVisitorData();
        return;
      }

      setNfcStatus({
        type: "error",
        message: response?.message || "Your virtual NFC tap could not be completed.",
      });
      Alert.alert("Check-In Failed", response?.message || "Unable to check in right now.");
    } catch (error) {
      console.error("Virtual NFC card tap error:", error);
      setNfcStatus({
        type: "error",
        message: error?.message || "Virtual NFC card tap failed. Please try again.",
      });
      Alert.alert("Check-In Failed", error?.message || "Unable to check in right now.");
    } finally {
      setIsVirtualTapLoading(false);
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

  const handleCheckInAction = () => {
    if (!visitor || isCheckInLoading) return;
    setShowCheckInModal(true);
  };

  const confirmCheckIn = async () => {
    if (!visitor || isCheckInLoading) return;

    setIsCheckInLoading(true);
    try {
      const response = await ApiService.visitorCheckIn(visitor._id, {
        source: "visitor_dashboard",
      });

      if (response?.success) {
        setShowCheckInModal(false);
        setShowCheckInSuccessModal(true);
        await loadVisitorData();
        return;
      }

      Alert.alert("Check-In Failed", response?.message || "Failed to check in.");
    } catch (error) {
      console.error("Visitor check-in error:", error);
      Alert.alert("Check-In Failed", error?.message || "Failed to check in.");
    } finally {
      setIsCheckInLoading(false);
    }
  };

  const handleCheckOutAction = () => {
    if (!visitor || isCheckOutLoading) return;
    setShowCheckOutModal(true);
  };

  const confirmCheckOut = async () => {
    if (!visitor || isCheckOutLoading) return;

    setIsCheckOutLoading(true);
    try {
      const response = await ApiService.visitorCheckOut(visitor._id, {
        source: "visitor_dashboard",
      });

      if (response?.success) {
        setShowCheckOutModal(false);
        setShowCheckOutSuccessModal(true);
        await loadVisitorData();
        return;
      }

      Alert.alert("Check-Out Failed", response?.message || "Failed to check out.");
    } catch (error) {
      console.error("Visitor check-out error:", error);
      Alert.alert("Check-Out Failed", error?.message || "Failed to check out.");
    } finally {
      setIsCheckOutLoading(false);
    }
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
      hour12: true,
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
  const displayName =
    visitor?.fullName ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    "Visitor";
  const journeyTitle = isPendingApproval
    ? "Registration Review In Progress"
    : isPendingStaffReview
      ? "Staff Review In Progress"
      : isApprovedVisitor
        ? "Access Ready"
        : canRequestNewAppointment
          ? "Schedule Your Next Visit"
          : canCreateFreshAppointment
            ? "Visitor Account Active"
            : "Start Your SafePass";
  const journeySubtitle = isPendingApproval
    ? "An admin is reviewing your first visitor request."
    : isPendingStaffReview
      ? "Staff is evaluating your preferred schedule."
      : isApprovedVisitor
        ? "Your pass, QR access, and NFC tools are active."
        : canRequestNewAppointment
          ? "Use this site to request another appointment without registering again."
          : canCreateFreshAppointment
            ? "Submit a new preferred date, time, and purpose from this dashboard."
            : "Create your first visitor registration to unlock access tools.";
  const commandMetrics = visitor
    ? [
        {
          label: "Visit Date",
          value: formatDate(visitor.visitDate),
          icon: "calendar-outline",
        },
        {
          label: "Visit Time",
          value: formatTime(visitor.visitTime),
          icon: "time-outline",
        },
        {
          label: "Purpose",
          value: visitor.purposeOfVisit || "Pending details",
          icon: "document-text-outline",
        },
      ]
    : [
        {
          label: "Account",
          value: String(currentUser?.status || "Active").toUpperCase(),
          icon: "person-circle-outline",
        },
        {
          label: "Role",
          value: "Visitor",
          icon: "id-card-outline",
        },
        {
          label: "Next Step",
          value: canCreateFreshAppointment ? "Request Visit" : "Register",
          icon: "arrow-forward-circle-outline",
        },
      ];

  const renderVisitorModuleNavigation = () => (
    <View style={[visitorDashboardStyles.visitorModuleCard, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.visitorModuleHeader}>
        <View>
          <Text style={visitorDashboardStyles.visitorModuleEyebrow}>Visitor System</Text>
          <Text style={visitorDashboardStyles.visitorModuleTitle}>Choose What You Need</Text>
        </View>
        <View style={visitorDashboardStyles.visitorModuleHeaderBadge}>
          <Ionicons name="phone-portrait-outline" size={14} color="#0F766E" />
          <Text style={visitorDashboardStyles.visitorModuleHeaderBadgeText}>Mobile Flow</Text>
        </View>
      </View>

      <View style={visitorDashboardStyles.visitorModuleGrid}>
        {VISITOR_MODULES.map((module) => {
          const isActive = selectedVisitorSection === module.id;

          return (
            <TouchableOpacity
              key={module.id}
              style={[
                visitorDashboardStyles.visitorModuleButton,
                isActive && visitorDashboardStyles.visitorModuleButtonActive,
              ]}
              onPress={() => setSelectedVisitorSection(module.id)}
              activeOpacity={0.86}
            >
              <View
                style={[
                  visitorDashboardStyles.visitorModuleIconWrap,
                  isActive && visitorDashboardStyles.visitorModuleIconWrapActive,
                ]}
              >
                <Ionicons
                  name={module.icon}
                  size={19}
                  color={isActive ? "#FFFFFF" : "#2563EB"}
                />
              </View>
              <View style={visitorDashboardStyles.visitorModuleCopy}>
                <Text
                  style={[
                    visitorDashboardStyles.visitorModuleButtonTitle,
                    isActive && visitorDashboardStyles.visitorModuleButtonTitleActive,
                  ]}
                >
                  {module.label}
                </Text>
                <Text
                  style={[
                    visitorDashboardStyles.visitorModuleButtonText,
                    isActive && visitorDashboardStyles.visitorModuleButtonTextActive,
                  ]}
                >
                  {module.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderAppointmentRequestPanel = () => (
    <View style={[visitorDashboardStyles.visitorFlowPanel, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.visitorFlowPanelHeader}>
        <View style={visitorDashboardStyles.visitorFlowPanelIcon}>
          <Ionicons name="calendar-outline" size={22} color="#2563EB" />
        </View>
        <View style={visitorDashboardStyles.visitorFlowPanelTitleWrap}>
          <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Appointment Module</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Appointment Request</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
            Create a visit request with purpose, office, preferred date, and time.
          </Text>
        </View>
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

      <View style={visitorDashboardStyles.visitorFlowChecklist}>
        {[
          "Choose your purpose. If you select Other, type the exact reason.",
          "Office will be assigned based on purpose. Choose manually for Other.",
          "Pick your preferred date and time before sending the request.",
        ].map((item) => (
          <View key={item} style={visitorDashboardStyles.visitorFlowChecklistRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#0F766E" />
            <Text style={visitorDashboardStyles.visitorFlowChecklistText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={visitorDashboardStyles.visitorFlowPrimaryButton}
        onPress={openAppointmentModal}
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={visitorDashboardStyles.visitorFlowPrimaryButtonText}>
          Create Appointment Request
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentStatusPanel = () => {
    const appointmentStatusLabel = visitor
      ? statusText
      : canCreateFreshAppointment
        ? "No Active Appointment"
        : "Register Required";
    const appointmentStatusDescription = visitor
      ? isPendingApproval
        ? "Your first visit is pending admin approval."
        : isPendingStaffReview
          ? "Your request is pending staff review."
          : visitor?.appointmentStatus === "rejected"
            ? visitor?.staffRejectionReason || "Your previous request was rejected."
            : isApprovedVisitor
              ? "Your appointment is approved and your SafePass tools are available."
              : "Your appointment details are shown below."
      : canCreateFreshAppointment
        ? "You can create a new appointment request from this account."
        : "Create a visitor account first to track appointment status.";

    return (
      <View style={[visitorDashboardStyles.visitorFlowPanel, dashboardSectionResponsiveStyle]}>
        <View style={visitorDashboardStyles.visitorFlowPanelHeader}>
          <View style={[visitorDashboardStyles.visitorFlowPanelIcon, { backgroundColor: `${statusColor}16` }]}>
            <Ionicons name={statusIcon} size={22} color={statusColor} />
          </View>
          <View style={visitorDashboardStyles.visitorFlowPanelTitleWrap}>
            <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Appointment Module</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Appointment Status</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
              See whether your appointment is pending, approved, or rejected.
            </Text>
          </View>
        </View>

        <View style={[visitorDashboardStyles.appointmentStatusHero, { borderColor: `${statusColor}44` }]}>
          <View style={[visitorDashboardStyles.appointmentStatusIcon, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={24} color="#FFFFFF" />
          </View>
          <View style={visitorDashboardStyles.appointmentStatusCopy}>
            <Text style={visitorDashboardStyles.appointmentStatusLabel}>{appointmentStatusLabel}</Text>
            <Text style={visitorDashboardStyles.appointmentStatusText}>{appointmentStatusDescription}</Text>
          </View>
        </View>

        <View style={visitorDashboardStyles.appointmentStatusDetails}>
          <View style={visitorDashboardStyles.appointmentStatusRow}>
            <Text style={visitorDashboardStyles.appointmentStatusRowLabel}>Purpose</Text>
            <Text style={visitorDashboardStyles.appointmentStatusRowValue}>
              {visitor?.purposeOfVisit || appointmentFeedback?.purpose || "Not set"}
            </Text>
          </View>
          <View style={visitorDashboardStyles.appointmentStatusRow}>
            <Text style={visitorDashboardStyles.appointmentStatusRowLabel}>Office / Department</Text>
            <Text style={visitorDashboardStyles.appointmentStatusRowValue}>
              {visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || appointmentFeedback?.department || "Not assigned"}
            </Text>
          </View>
          <View style={visitorDashboardStyles.appointmentStatusRow}>
            <Text style={visitorDashboardStyles.appointmentStatusRowLabel}>Date</Text>
            <Text style={visitorDashboardStyles.appointmentStatusRowValue}>
              {visitor?.visitDate ? formatDate(visitor.visitDate) : appointmentFeedback?.date || "Not scheduled"}
            </Text>
          </View>
          <View style={visitorDashboardStyles.appointmentStatusRow}>
            <Text style={visitorDashboardStyles.appointmentStatusRowLabel}>Time</Text>
            <Text style={visitorDashboardStyles.appointmentStatusRowValue}>
              {visitor?.visitTime ? formatTime(visitor.visitTime) : appointmentFeedback?.time || "Not scheduled"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={visitorDashboardStyles.visitorFlowSecondaryButton}
          onPress={onRefresh}
          activeOpacity={0.86}
        >
          <Ionicons name="refresh-outline" size={18} color="#2563EB" />
          <Text style={visitorDashboardStyles.visitorFlowSecondaryButtonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderVisitorMapPanel = () => (
    <View style={[visitorDashboardStyles.visitorMapPanel, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.visitorFlowPanelHeader}>
        <View style={visitorDashboardStyles.visitorFlowPanelIcon}>
          <Ionicons name="map-outline" size={22} color="#2563EB" />
        </View>
        <View style={visitorDashboardStyles.visitorFlowPanelTitleWrap}>
          <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Map Module</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Campus Map And Directions</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
            View floor layouts only. Editing rooms stays with admin.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={visitorDashboardStyles.visitorFloorTabsScroll}
      >
        <View style={visitorDashboardStyles.visitorFloorTabs}>
          {MONITORING_MAP_FLOORS.map((floor) => {
            const isActive = selectedVisitorMapFloor === floor.id;

            return (
              <TouchableOpacity
                key={floor.id}
                style={[
                  visitorDashboardStyles.visitorFloorTab,
                  isActive && visitorDashboardStyles.visitorFloorTabActive,
                ]}
                onPress={() => setSelectedVisitorMapFloor(floor.id)}
                activeOpacity={0.86}
              >
                <Ionicons
                  name={floor.icon}
                  size={15}
                  color={isActive ? "#FFFFFF" : "#64748B"}
                />
                <Text
                  style={[
                    visitorDashboardStyles.visitorFloorTabText,
                    isActive && visitorDashboardStyles.visitorFloorTabTextActive,
                  ]}
                >
                  {floor.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <CampusMap
        visitors={[]}
        floors={MONITORING_MAP_FLOORS}
        offices={MONITORING_MAP_OFFICES}
        selectedFloor={selectedVisitorMapFloor}
        selectedOffice="all"
        mapBlueprints={MONITORING_MAP_BLUEPRINTS}
        officePositions={MONITORING_MAP_OFFICE_POSITIONS}
        onFloorChange={setSelectedVisitorMapFloor}
      />

      <View style={visitorDashboardStyles.visitorMapNote}>
        <Ionicons name="information-circle-outline" size={18} color="#0F766E" />
        <Text style={visitorDashboardStyles.visitorMapNoteText}>
          Use pinch/zoom controls and drag the map to inspect the floor. For external directions,
          open the full campus map.
        </Text>
      </View>

      <TouchableOpacity
        style={visitorDashboardStyles.visitorFlowSecondaryButton}
        onPress={() => navigation.navigate("WebMapScreen")}
        activeOpacity={0.86}
      >
        <Ionicons name="navigate-outline" size={18} color="#2563EB" />
        <Text style={visitorDashboardStyles.visitorFlowSecondaryButtonText}>Open Full Directions</Text>
      </TouchableOpacity>
    </View>
  );

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
            <View style={visitorDashboardStyles.headerPill}>
              <Ionicons name="airplane-outline" size={14} color="#FFFFFF" />
              <Text style={visitorDashboardStyles.headerPillText}>SafePass Visitor Portal</Text>
            </View>
            <Text style={visitorDashboardStyles.greeting}>{greeting},</Text>
            <Text style={visitorDashboardStyles.userName}>
              {displayName.split(' ')[0] || 'Visitor'}!
            </Text>
            <Text style={visitorDashboardStyles.headerSupportText}>
              Sapphire International Aviation Academy
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
        <View
          style={[
            visitorDashboardStyles.dashboardShell,
            isWideVisitorDashboard && visitorDashboardStyles.dashboardShellWide,
            dashboardShellResponsiveStyle,
          ]}
        >
          <View style={[visitorDashboardStyles.commandDeckCard, dashboardCardResponsiveStyle]}>
            <View style={[visitorDashboardStyles.commandDeckHeader, isWideVisitorDashboard && visitorDashboardStyles.commandDeckHeaderWide]}>
              <View style={visitorDashboardStyles.commandDeckTitleWrap}>
                <Text style={visitorDashboardStyles.commandDeckEyebrow}>Visit Command</Text>
                <Text style={visitorDashboardStyles.commandDeckTitle}>{journeyTitle}</Text>
                <Text style={visitorDashboardStyles.commandDeckSubtitle}>{journeySubtitle}</Text>
              </View>
              <View style={[visitorDashboardStyles.commandDeckBadge, { backgroundColor: `${statusColor}18` }]}>
                <View style={[visitorDashboardStyles.commandDeckBadgeDot, { backgroundColor: statusColor }]} />
                <Text style={[visitorDashboardStyles.commandDeckBadgeText, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
            </View>

            <View style={visitorDashboardStyles.commandMetricsGrid}>
              {commandMetrics.map((item) => (
                <View
                  key={item.label}
                  style={[
                    visitorDashboardStyles.commandMetricCard,
                    { width: compactCommandMetricCardWidth },
                  ]}
                >
                  <View style={visitorDashboardStyles.commandMetricIcon}>
                    <Ionicons name={item.icon} size={16} color="#4F46E5" />
                  </View>
                  <Text style={visitorDashboardStyles.commandMetricLabel}>{item.label}</Text>
                  <Text style={visitorDashboardStyles.commandMetricValue} numberOfLines={2}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {visitor?.status === "checked_in" ? (
              <View
                style={[
                  visitorDashboardStyles.phoneTrackingCard,
                  phoneTrackingStatus.active
                    ? visitorDashboardStyles.phoneTrackingCardActive
                    : visitorDashboardStyles.phoneTrackingCardInactive,
                ]}
              >
                <View style={visitorDashboardStyles.phoneTrackingIconWrap}>
                  <Ionicons
                    name={phoneTrackingStatus.active ? "location" : "location-outline"}
                    size={18}
                    color={phoneTrackingStatus.active ? "#047857" : "#B45309"}
                  />
                </View>
                <View style={visitorDashboardStyles.phoneTrackingCopy}>
                  <Text style={visitorDashboardStyles.phoneTrackingTitle}>
                    Phone GPS Tracking
                  </Text>
                  <Text style={visitorDashboardStyles.phoneTrackingText}>
                    {phoneTrackingStatus.message}
                  </Text>
                </View>
              </View>
            ) : null}

            {(isApprovedVisitor || canRequestNewAppointment || canCreateFreshAppointment) ? (
              <View
                style={[
                  visitorDashboardStyles.commandActionRow,
                  commandActionRowResponsiveStyle,
                ]}
              >
                <TouchableOpacity
                  style={[
                    visitorDashboardStyles.commandPrimaryButton,
                    commandActionButtonResponsiveStyle,
                  ]}
                  onPress={isApprovedVisitor ? openAppointmentModal : openAppointmentModal}
                  activeOpacity={0.9}
                >
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                  <Text style={visitorDashboardStyles.commandPrimaryButtonText}>
                    {isApprovedVisitor ? "Plan Another Visit" : "Open Re-appointment"}
                  </Text>
                </TouchableOpacity>

                {isApprovedVisitor ? (
                  <TouchableOpacity
                    style={[
                      visitorDashboardStyles.commandSecondaryButton,
                      commandActionButtonResponsiveStyle,
                    ]}
                    onPress={() => setShowQRModal(true)}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="qr-code-outline" size={18} color="#4F46E5" />
                    <Text style={visitorDashboardStyles.commandSecondaryButtonText}>Show QR</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>

          {renderVisitorModuleNavigation()}

        {selectedVisitorSection === "home" ? (
          visitor ? (
          isPendingApproval ? (
            <>
              <View
                style={[
                  visitorDashboardStyles.pendingApprovalCard,
                  dashboardHeroCardResponsiveStyle,
                ]}
              >
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

              <View style={[visitorDashboardStyles.pendingStepsCard, dashboardSectionResponsiveStyle]}>
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

            </>
          ) : isPendingStaffReview ? (
            <>
              {appointmentFeedback ? (
                <View
                  style={[
                    visitorDashboardStyles.appointmentSuccessCard,
                    dashboardSectionResponsiveStyle,
                  ]}
                >
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
                      Office: {appointmentFeedback.department || "Assigned office"}
                    </Text>
                    <Text style={visitorDashboardStyles.appointmentSuccessMeta}>
                      {appointmentFeedback.purpose}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View
                style={[
                  visitorDashboardStyles.pendingApprovalCard,
                  dashboardHeroCardResponsiveStyle,
                ]}
              >
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

              <View style={[visitorDashboardStyles.pendingStepsCard, dashboardSectionResponsiveStyle]}>
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

            </>
          ) : isApprovedVisitor ? (
            <>
              <View
                style={[
                  visitorDashboardStyles.approvedHeroCard,
                  dashboardHeroCardResponsiveStyle,
                ]}
              >
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
                    <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
                      <Text style={visitorDashboardStyles.approvedHeroFactLabel}>
                        Visit Date
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                        {formatDate(visitor.visitDate)}
                      </Text>
                    </View>
                    <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
                      <Text style={visitorDashboardStyles.approvedHeroFactLabel}>
                        Arrival Time
                      </Text>
                      <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                        {formatTime(visitor.visitTime)}
                      </Text>
                    </View>
                    <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
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

              <View
                style={[
                  visitorDashboardStyles.approvedActionSection,
                  dashboardSectionResponsiveStyle,
                ]}
              >
                <View
                  style={[
                    visitorDashboardStyles.approvedSectionHeader,
                    approvedSectionHeaderResponsiveStyle,
                  ]}
                >
                  <Text style={visitorDashboardStyles.approvedSectionTitle}>
                    Access Tools
                  </Text>
                  <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
                    Open your virtual access card, or switch to reader mode if you are already at the gate.
                  </Text>
                </View>

                <View style={visitorDashboardStyles.approvedActionGrid}>
                  <TouchableOpacity
                    style={visitorDashboardStyles.approvedVirtualNfcCard}
                    onPress={() => setShowVirtualNfcModal(true)}
                    activeOpacity={0.9}
                    disabled={isVirtualTapLoading}
                  >
                    <LinearGradient
                      colors={["#0F172A", "#1D4ED8", "#2563EB"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={visitorDashboardStyles.approvedVirtualNfcCardGradient}
                    >
                      <View style={visitorDashboardStyles.approvedVirtualNfcHeader}>
                        <View>
                          <View style={visitorDashboardStyles.approvedVirtualNfcBadge}>
                            <Ionicons name="radio" size={14} color="#DBEAFE" />
                            <Text style={visitorDashboardStyles.approvedVirtualNfcBadgeText}>
                              Virtual NFC Card
                            </Text>
                          </View>
                          <Text style={visitorDashboardStyles.approvedVirtualNfcTitle}>
                            View Access Card
                          </Text>
                          <Text style={visitorDashboardStyles.approvedVirtualNfcSubtitle}>
                            Open your digital SafePass card in a clean portrait card view.
                          </Text>
                        </View>
                        <View style={visitorDashboardStyles.approvedVirtualNfcIconWrap}>
                          {isVirtualTapLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Ionicons name="card-outline" size={28} color="#FFFFFF" />
                          )}
                        </View>
                      </View>

                      <View style={visitorDashboardStyles.approvedVirtualNfcCardNumberRow}>
                        <Text style={visitorDashboardStyles.approvedVirtualNfcCardLabel}>
                          SafePass ID
                        </Text>
                        <Text style={visitorDashboardStyles.approvedVirtualNfcCardNumber}>
                          {visitor.nfcCardId || visitor.idNumber || "Assigned on approval"}
                        </Text>
                      </View>

                      <View style={visitorDashboardStyles.approvedVirtualNfcFooter}>
                        <View style={visitorDashboardStyles.approvedVirtualNfcFooterItem}>
                          <Ionicons name="shield-checkmark-outline" size={15} color="#DBEAFE" />
                          <Text style={visitorDashboardStyles.approvedVirtualNfcFooterText}>
                            Security notified
                          </Text>
                        </View>
                        <View style={visitorDashboardStyles.approvedVirtualNfcFooterItem}>
                          <Ionicons name="desktop-outline" size={15} color="#DBEAFE" />
                          <Text style={visitorDashboardStyles.approvedVirtualNfcFooterText}>
                            Admin monitored
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      visitorDashboardStyles.approvedActionCard,
                      { width: compactApprovedActionCardWidth },
                    ]}
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
                    style={[
                      visitorDashboardStyles.approvedActionCard,
                      { width: compactApprovedActionCardWidth },
                    ]}
                    onPress={handleCheckInAction}
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

              <View
                style={[
                  visitorDashboardStyles.approvedInfoCard,
                  dashboardSectionResponsiveStyle,
                  { padding: dashboardCardPadding },
                ]}
              >
                <View
                  style={[
                    visitorDashboardStyles.approvedSectionHeader,
                    approvedSectionHeaderResponsiveStyle,
                  ]}
                >
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
                      {visitor.assignedStaffName || visitor.appointmentDepartment || visitor.assignedOffice || visitor.host || "Front Office"}
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

              <View
                style={[
                  visitorDashboardStyles.reappointmentCard,
                  dashboardSectionResponsiveStyle,
                  { padding: dashboardCardPadding },
                ]}
              >
                <View style={visitorDashboardStyles.reappointmentCardHeader}>
                  <View>
                    <Text style={visitorDashboardStyles.reappointmentCardTitle}>
                      Need Another Visit?
                    </Text>
                    <Text style={visitorDashboardStyles.reappointmentCardSubtitle}>
                      You can request a new appointment from this account without registering again.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={visitorDashboardStyles.reappointmentPrimaryButton}
                    onPress={openAppointmentModal}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                    <Text style={visitorDashboardStyles.reappointmentPrimaryButtonText}>
                      Re-appoint
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={visitorDashboardStyles.reappointmentChecklist}>
                  {[
                    "Choose your next preferred date and time from the site.",
                    "Staff will review the request and may approve, adjust, or reject it.",
                    "Submitting a new request will replace the current visit schedule on your account.",
                  ].map((item) => (
                    <View key={item} style={visitorDashboardStyles.reappointmentChecklistRow}>
                      <Ionicons name="arrow-forward-circle-outline" size={18} color="#0F766E" />
                      <Text style={visitorDashboardStyles.reappointmentChecklistText}>{item}</Text>
                    </View>
                  ))}
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
                      Office: {appointmentFeedback.department || "Assigned office"}
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
                      {visitor?.appointmentStatus === "rejected" ? "Appointment Declined" : "Ready to Register an Appointment"}
                    </Text>
                  </View>
                  <Text style={visitorDashboardStyles.reappointmentHeroTitle}>
                    {visitor?.appointmentStatus === "rejected"
                      ? "Register a New Appointment"
                      : "Register an Appointment"}
                  </Text>
                  <Text style={visitorDashboardStyles.reappointmentHeroText}>
                    {visitor?.appointmentStatus === "rejected"
                      ? visitor?.staffRejectionReason || "Your previous appointment was declined. You can register a new appointment here without creating another visitor account."
                      : "Your visitor account is active. Enter your preferred date, time, and purpose to register an appointment and send it directly to staff."}
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

              <View
                style={[
                  visitorDashboardStyles.reappointmentCard,
                  dashboardSectionResponsiveStyle,
                  { padding: dashboardCardPadding },
                ]}
              >
                <View style={visitorDashboardStyles.reappointmentCardHeader}>
                  <View>
                    <Text style={visitorDashboardStyles.reappointmentCardTitle}>Register an Appointment</Text>
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
                    <Text style={visitorDashboardStyles.reappointmentPrimaryButtonText}>Register Appointment</Text>
                  </TouchableOpacity>
                </View>

                <View style={visitorDashboardStyles.reappointmentChecklist}>
                  {[
                    "Use your existing visitor account. No need to register again.",
                    "Choose your preferred date and time for the appointment.",
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
                  onPress={handleCheckInAction}
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
                  onPress={handleCheckOutAction}
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
          )
        ) : selectedVisitorSection === "appointment-request" ? (
          renderAppointmentRequestPanel()
        ) : selectedVisitorSection === "appointment-status" ? (
          renderAppointmentStatusPanel()
        ) : (
          renderVisitorMapPanel()
        )}
        </View>
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
                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentPickerField}
                  onPress={handleAppointmentDatePress}
                  activeOpacity={0.85}
                >
                  <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                    <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                      <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose a date</Text>
                      <Text style={visitorDashboardStyles.appointmentPickerValue}>
                        {formatAppointmentPickerDate(appointmentForm.preferredDate)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={Platform.OS === "web" ? "calendar-clear-outline" : showAppointmentDatePicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                {Platform.OS === "web" ? (
                  <input
                    ref={appointmentWebDateInputRef}
                    type="date"
                    value={getAppointmentWebDateValue()}
                    min={getAppointmentMinDateValue()}
                    onChange={handleAppointmentWebDateChange}
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                    aria-label="Preferred appointment date"
                  />
                ) : null}

                {Platform.OS !== "web" && showAppointmentDatePicker && DateTimePickerComponent ? (
                  <DateTimePickerComponent
                    value={getValidDate(appointmentForm.preferredDate) || getDefaultAppointmentDate()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleAppointmentDateChange}
                    minimumDate={new Date()}
                  />
                ) : null}
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Preferred Time</Text>
                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentPickerField}
                  onPress={() => {
                    setShowAppointmentTimePicker((current) => !current);
                    setShowAppointmentDatePicker(false);
                    setShowPurposeDropdown(false);
                    setShowDepartmentDropdown(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                    <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                      <Ionicons name="time-outline" size={18} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose a time</Text>
                      <Text style={visitorDashboardStyles.appointmentPickerValue}>
                        {appointmentForm.preferredTime ? formatTime(appointmentForm.preferredTime) : "Select preferred time"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={showAppointmentTimePicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                {showAppointmentTimePicker ? (
                  <View style={visitorDashboardStyles.pickerDropdownMenu}>
                    <ScrollView
                      style={visitorDashboardStyles.pickerDropdownScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    >
                      {appointmentTimeOptions.map((option) => {
                        const isSelected =
                          appointmentForm.preferredTime &&
                          new Date(appointmentForm.preferredTime).getHours() === option.getHours() &&
                          new Date(appointmentForm.preferredTime).getMinutes() === option.getMinutes();
                        return (
                          <TouchableOpacity
                            key={`${option.getHours()}-${option.getMinutes()}`}
                            style={[
                              visitorDashboardStyles.pickerOptionItem,
                              isSelected && visitorDashboardStyles.pickerOptionItemActive,
                            ]}
                            onPress={() => {
                              setAppointmentForm((prev) => ({ ...prev, preferredTime: option }));
                              setShowAppointmentTimePicker(false);
                            }}
                          >
                            <Text
                              style={[
                                visitorDashboardStyles.pickerOptionText,
                                isSelected && visitorDashboardStyles.pickerOptionTextActive,
                              ]}
                            >
                              {formatTime(option)}
                            </Text>
                            {isSelected ? (
                              <Ionicons name="checkmark-circle" size={18} color="#4F46E5" />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Office to Visit</Text>
                {appointmentForm.purposeSelection === "Other" ? (
                  <TextInput
                    style={visitorDashboardStyles.appointmentFieldInput}
                    placeholder="Enter office or department"
                    placeholderTextColor="#94A3B8"
                    value={appointmentForm.department}
                    onChangeText={(text) =>
                      setAppointmentForm((prev) => ({ ...prev, department: text }))
                    }
                  />
                ) : (
                  <View style={visitorDashboardStyles.appointmentReadOnlyField}>
                    <Ionicons name="business-outline" size={18} color="#475569" />
                    <Text style={visitorDashboardStyles.appointmentReadOnlyText}>
                      {getDefaultDepartmentForPurpose(appointmentForm.purposeSelection) || "Assigned automatically"}
                    </Text>
                  </View>
                )}
                <Text style={visitorDashboardStyles.appointmentAutoHint}>
                  {appointmentForm.purposeSelection === "Other"
                    ? "You can type the office or department for custom visits."
                    : "This is automatically assigned based on the selected purpose."}
                </Text>
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Purpose Of Visit</Text>
                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentPickerField}
                  onPress={() => {
                    setShowPurposeDropdown((current) => !current);
                    setShowDepartmentDropdown(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                    <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                      <Ionicons name="list-outline" size={18} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose a purpose</Text>
                      <Text style={visitorDashboardStyles.appointmentPickerValue}>
                        {appointmentForm.purposeSelection}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={showPurposeDropdown ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                {showPurposeDropdown ? (
                  <View style={visitorDashboardStyles.purposeDropdownMenu}>
                    {APPOINTMENT_PURPOSE_OPTIONS.map((option) => {
                      const isSelected = appointmentForm.purposeSelection === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            visitorDashboardStyles.purposeOptionItem,
                            isSelected && visitorDashboardStyles.purposeOptionItemActive,
                          ]}
                          onPress={() => {
                            const nextDepartment =
                              option === "Other"
                                ? ""
                                : getDefaultDepartmentForPurpose(option);
                            setAppointmentForm((prev) => ({
                              ...prev,
                              purposeSelection: option,
                              department: nextDepartment,
                              customPurpose: option === "Other" ? prev.customPurpose : "",
                            }));
                            setShowPurposeDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              visitorDashboardStyles.purposeOptionText,
                              isSelected && visitorDashboardStyles.purposeOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                          {isSelected ? (
                            <Ionicons name="checkmark-circle" size={18} color="#4F46E5" />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}

                {appointmentForm.purposeSelection === "Other" ? (
                  <TextInput
                    style={[visitorDashboardStyles.appointmentFieldInput, visitorDashboardStyles.appointmentFieldTextarea]}
                    placeholder="Type your purpose of visit"
                    placeholderTextColor="#94A3B8"
                    value={appointmentForm.customPurpose}
                    onChangeText={(text) =>
                      setAppointmentForm((prev) => ({ ...prev, customPurpose: text }))
                    }
                    multiline
                    textAlignVertical="top"
                  />
                ) : null}
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Valid ID Number</Text>
                <TextInput
                  style={visitorDashboardStyles.appointmentFieldInput}
                  placeholder="Enter the ID number shown on your valid ID"
                  placeholderTextColor="#94A3B8"
                  value={appointmentForm.idNumber}
                  onChangeText={(text) =>
                    setAppointmentForm((prev) => ({ ...prev, idNumber: text }))
                  }
                  autoCapitalize="characters"
                />
                <Text style={visitorDashboardStyles.appointmentAutoHint}>
                  This ID will be checked by security when you arrive on site.
                </Text>
              </View>

              <View style={visitorDashboardStyles.appointmentField}>
                <Text style={visitorDashboardStyles.appointmentFieldLabel}>Valid ID Picture</Text>
                <TouchableOpacity
                  style={visitorDashboardStyles.appointmentIdUploadCard}
                  onPress={handlePickAppointmentIdImage}
                  activeOpacity={0.85}
                >
                  {appointmentForm.idImage ? (
                    <Image
                      source={{ uri: appointmentForm.idImage }}
                      style={visitorDashboardStyles.appointmentIdPreview}
                    />
                  ) : (
                    <View style={visitorDashboardStyles.appointmentIdPlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#64748B" />
                      <Text style={visitorDashboardStyles.appointmentIdPlaceholderTitle}>
                        Upload valid ID picture
                      </Text>
                      <Text style={visitorDashboardStyles.appointmentIdPlaceholderText}>
                        Use a clear school, government, or company ID image.
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {appointmentForm.idImage ? (
                  <TouchableOpacity
                    style={visitorDashboardStyles.appointmentChangeIdButton}
                    onPress={handlePickAppointmentIdImage}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#0F766E" />
                    <Text style={visitorDashboardStyles.appointmentChangeIdText}>
                      Change ID picture
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  visitorDashboardStyles.appointmentPrivacyCard,
                  appointmentForm.privacyAccepted &&
                    visitorDashboardStyles.appointmentPrivacyCardAccepted,
                ]}
                onPress={() =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    privacyAccepted: !prev.privacyAccepted,
                  }))
                }
                activeOpacity={0.85}
              >
                <View
                  style={[
                    visitorDashboardStyles.appointmentPrivacyCheckbox,
                    appointmentForm.privacyAccepted &&
                      visitorDashboardStyles.appointmentPrivacyCheckboxChecked,
                  ]}
                >
                  {appointmentForm.privacyAccepted ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={visitorDashboardStyles.appointmentPrivacyText}>
                  I confirm that the information and valid ID picture I provide are accurate,
                  and I allow Sapphire SafePass to use them for appointment and visit verification.
                </Text>
              </TouchableOpacity>

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

      <Modal
        visible={showVirtualNfcModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVirtualNfcModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View
            style={[
              visitorDashboardStyles.virtualNfcModalContent,
              isCompactVirtualCardView && visitorDashboardStyles.virtualNfcModalContentCompact,
            ]}
          >
            <LinearGradient
              colors={["#0F172A", "#1D4ED8", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                visitorDashboardStyles.virtualNfcModalHeader,
                isCompactVirtualCardView && visitorDashboardStyles.virtualNfcModalHeaderCompact,
              ]}
            >
              <View>
                <Text style={visitorDashboardStyles.virtualNfcModalTitle}>Virtual NFC Card</Text>
                <Text style={visitorDashboardStyles.virtualNfcModalSubtitle}>
                  Rotate your phone sideways, present the pass to the reader, then confirm check-in when ready.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowVirtualNfcModal(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View
              style={[
                visitorDashboardStyles.virtualNfcModalBody,
                isCompactVirtualCardView && visitorDashboardStyles.virtualNfcModalBodyCompact,
              ]}
            >
              <View
                style={[
                  visitorDashboardStyles.virtualNfcDisplayRow,
                  isCompactVirtualCardView && visitorDashboardStyles.virtualNfcDisplayRowCompact,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={handleVirtualNfcCardTap}
                  disabled={isVirtualTapLoading}
                  style={[
                    visitorDashboardStyles.virtualNfcPreviewCard,
                    isCompactVirtualCardView && visitorDashboardStyles.virtualNfcPreviewCardCompact,
                  ]}
                >
                  <LinearGradient
                    colors={["#0F172A", "#1D4ED8", "#2563EB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={visitorDashboardStyles.virtualNfcCardGradient}
                  >
                    <View style={visitorDashboardStyles.virtualNfcCardTopBar}>
                      <View>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewBrand}>
                          SafePass
                        </Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewSchool}>
                          Sapphire International Aviation Academy
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcPreviewChip}>
                        {isVirtualTapLoading ? (
                          <ActivityIndicator size="small" color="#DBEAFE" />
                        ) : (
                          <Ionicons name="radio" size={16} color="#DBEAFE" />
                        )}
                      </View>
                    </View>

                    <View style={visitorDashboardStyles.virtualNfcCardIdentity}>
                      <Text style={visitorDashboardStyles.virtualNfcPreviewLabel}>Visitor Name</Text>
                      <Text style={visitorDashboardStyles.virtualNfcPreviewName}>
                        {visitor?.fullName || "Visitor"}
                      </Text>
                    </View>

                    <View style={visitorDashboardStyles.virtualNfcIdBand}>
                      <Text style={visitorDashboardStyles.virtualNfcPreviewLabel}>SafePass ID</Text>
                      <Text style={visitorDashboardStyles.virtualNfcPreviewId}>
                        {visitor?.nfcCardId || visitor?.idNumber || "Assigned on approval"}
                      </Text>
                    </View>

                    <View style={visitorDashboardStyles.virtualNfcDetailsGrid}>
                      <View style={visitorDashboardStyles.virtualNfcDetailCard}>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaLabel}>Purpose</Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaValue}>
                          {visitor?.purposeOfVisit || "Approved visit"}
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcDetailCard}>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaLabel}>Status</Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaValue}>
                          Approved
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcDetailCard}>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaLabel}>Visit Date</Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaValue}>
                          {formatDate(visitor?.visitDate)}
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcDetailCard}>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaLabel}>Arrival Time</Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaValue}>
                          {formatTime(visitor?.visitTime)}
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcDetailCardWide}>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaLabel}>Assigned Staff</Text>
                        <Text style={visitorDashboardStyles.virtualNfcPreviewMetaValue}>
                          {visitor?.assignedStaffName || visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || "Front Office"}
                        </Text>
                      </View>
                    </View>

                    <View style={visitorDashboardStyles.virtualNfcTapHint}>
                      <View style={visitorDashboardStyles.virtualNfcTapHintIcon}>
                        <Ionicons name="finger-print-outline" size={18} color="#0F172A" />
                      </View>
                      <View style={visitorDashboardStyles.virtualNfcTapHintCopy}>
                        <Text style={visitorDashboardStyles.virtualNfcTapHintTitle}>
                          Tap This Card To Check In
                        </Text>
                        <Text style={visitorDashboardStyles.virtualNfcTapHintText}>
                          Present this digital pass and tap once you are ready to enter campus.
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  visitorDashboardStyles.virtualNfcInfoCard,
                  isCompactVirtualCardView && visitorDashboardStyles.virtualNfcInfoCardCompact,
                ]}
              >
                {[
                  "Use the card view above to verify your approved access details.",
                  "Security will receive the visitor check-in notification.",
                  "Admin monitoring will also record this check-in event.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.virtualNfcInfoRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#2563EB" />
                    <Text style={visitorDashboardStyles.virtualNfcInfoText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View
                style={[
                  visitorDashboardStyles.virtualNfcModalFooter,
                  isCompactVirtualCardView && visitorDashboardStyles.virtualNfcModalFooterCompact,
                ]}
              >
                <TouchableOpacity
                  style={visitorDashboardStyles.virtualNfcSecondaryButton}
                  onPress={() => setShowVirtualNfcModal(false)}
                  disabled={isVirtualTapLoading}
                >
                  <Text style={visitorDashboardStyles.virtualNfcSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={visitorDashboardStyles.virtualNfcPrimaryButton}
                  onPress={handleVirtualNfcCardTap}
                  disabled={isVirtualTapLoading}
                >
                  {isVirtualTapLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                      <Text style={visitorDashboardStyles.virtualNfcPrimaryButtonText}>
                        Check In With Card
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCheckInModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.accessFlowModalContent}>
            <LinearGradient
              colors={["#0F766E", "#0EA5A4", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={visitorDashboardStyles.accessFlowHero}
            >
              <View style={visitorDashboardStyles.accessFlowHeroTop}>
                <View style={visitorDashboardStyles.accessFlowHeroBadge}>
                  <Ionicons name="log-in-outline" size={15} color="#0F766E" />
                  <Text style={visitorDashboardStyles.accessFlowHeroBadgeText}>Arrival Flow</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCheckInModal(false)}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={visitorDashboardStyles.accessFlowTitle}>Ready To Check In?</Text>
              <Text style={visitorDashboardStyles.accessFlowSubtitle}>
                Confirm your arrival to activate your visit and notify the monitoring team.
              </Text>
            </LinearGradient>

            <View style={visitorDashboardStyles.accessFlowBody}>
              <View style={visitorDashboardStyles.checkInArrivalCard}>
                <View style={visitorDashboardStyles.checkInArrivalTopRow}>
                  <View style={visitorDashboardStyles.checkInArrivalIdentity}>
                    <View style={visitorDashboardStyles.checkInArrivalAvatar}>
                      <Text style={visitorDashboardStyles.checkInArrivalInitials}>
                        {visitor?.fullName
                          ?.split(" ")
                          .map((name) => name[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() || "VP"}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.checkInArrivalCopy}>
                      <Text style={visitorDashboardStyles.checkInArrivalName}>
                        {visitor?.fullName || "Visitor"}
                      </Text>
                      <Text style={visitorDashboardStyles.checkInArrivalPurpose}>
                        {visitor?.purposeOfVisit || "Approved visit"}
                      </Text>
                    </View>
                  </View>
                  <View style={visitorDashboardStyles.checkInArrivalStatusPill}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#0F766E" />
                    <Text style={visitorDashboardStyles.checkInArrivalStatusText}>Approved</Text>
                  </View>
                </View>

                <View style={visitorDashboardStyles.checkInArrivalMetaGrid}>
                  <View style={visitorDashboardStyles.checkInArrivalMetaCard}>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaLabel}>Visit Date</Text>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaValue}>{formatDate(visitor?.visitDate)}</Text>
                  </View>
                  <View style={visitorDashboardStyles.checkInArrivalMetaCard}>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaLabel}>Arrival Time</Text>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaValue}>{formatTime(visitor?.visitTime)}</Text>
                  </View>
                  <View style={visitorDashboardStyles.checkInArrivalMetaCardWide}>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaLabel}>Assigned Staff</Text>
                    <Text style={visitorDashboardStyles.checkInArrivalMetaValue}>
                      {visitor?.assignedStaffName || visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || "Front Office"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={visitorDashboardStyles.checkInArrivalGuideCard}>
                <Text style={visitorDashboardStyles.checkInArrivalGuideTitle}>What happens after check-in?</Text>
                {[
                  "Your visitor status will switch to checked in.",
                  "Security and admin monitoring will receive your arrival event.",
                  "Your access activity will be recorded in the dashboard history.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.checkInArrivalGuideRow}>
                    <View style={visitorDashboardStyles.checkInArrivalGuideIcon}>
                      <Ionicons name="checkmark" size={12} color="#0F766E" />
                    </View>
                    <Text style={visitorDashboardStyles.checkInArrivalGuideText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={visitorDashboardStyles.accessFlowFooter}>
                <TouchableOpacity
                  style={visitorDashboardStyles.accessFlowSecondaryButton}
                  onPress={() => setShowCheckInModal(false)}
                  disabled={isCheckInLoading}
                >
                  <Text style={visitorDashboardStyles.accessFlowSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={visitorDashboardStyles.accessFlowPrimaryButton}
                  onPress={confirmCheckIn}
                  disabled={isCheckInLoading}
                >
                  {isCheckInLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                      <Text style={visitorDashboardStyles.accessFlowPrimaryButtonText}>Confirm Check In</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showVirtualNfcSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVirtualNfcSuccessModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.accessFlowSuccessContent}>
            <View style={visitorDashboardStyles.accessFlowSuccessIconWrap}>
              <Ionicons name="checkmark-circle" size={54} color="#0F766E" />
            </View>
            <Text style={visitorDashboardStyles.accessFlowSuccessTitle}>Checked In Successfully</Text>
            <Text style={visitorDashboardStyles.accessFlowSuccessText}>
              Your virtual NFC card was accepted. Security and admin have been notified of your arrival.
            </Text>

            <View style={visitorDashboardStyles.accessFlowSuccessMetaCard}>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Visitor</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>
                  {visitor?.fullName || "Visitor"}
                </Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Checked In Via</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>Virtual NFC Card</Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Visit Time</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>
                  {formatTime(visitor?.visitTime)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={visitorDashboardStyles.accessFlowPrimaryButton}
              onPress={() => setShowVirtualNfcSuccessModal(false)}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              <Text style={visitorDashboardStyles.accessFlowPrimaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCheckInSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckInSuccessModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.accessFlowSuccessContent}>
            <View style={visitorDashboardStyles.accessFlowSuccessIconWrap}>
              <Ionicons name="checkmark-circle" size={54} color="#0F766E" />
            </View>
            <Text style={visitorDashboardStyles.accessFlowSuccessTitle}>Arrival Confirmed</Text>
            <Text style={visitorDashboardStyles.accessFlowSuccessText}>
              Your visitor access is now active and the system has recorded your check-in.
            </Text>

            <View style={visitorDashboardStyles.checkInSuccessStamp}>
              <View style={visitorDashboardStyles.checkInSuccessStampHeader}>
                <Text style={visitorDashboardStyles.checkInSuccessStampLabel}>Campus Access Active</Text>
                <Text style={visitorDashboardStyles.checkInSuccessStampStatus}>Checked In</Text>
              </View>
              <Text style={visitorDashboardStyles.checkInSuccessStampName}>
                {visitor?.fullName || "Visitor"}
              </Text>
              <Text style={visitorDashboardStyles.checkInSuccessStampSubtext}>
                Proceed to your destination and keep your SafePass ready if requested by staff or security.
              </Text>
            </View>

            <View style={visitorDashboardStyles.accessFlowSuccessMetaCard}>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Arrival Time</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>{formatTime(visitor?.visitTime)}</Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Visit Date</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>{formatDate(visitor?.visitDate)}</Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Assigned Staff</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>
                  {visitor?.assignedStaffName || visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || "Front Office"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={visitorDashboardStyles.accessFlowPrimaryButton}
              onPress={() => setShowCheckInSuccessModal(false)}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              <Text style={visitorDashboardStyles.accessFlowPrimaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCheckOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckOutModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.accessFlowModalContent}>
            <LinearGradient
              colors={["#7F1D1D", "#DC2626", "#EF4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={visitorDashboardStyles.accessFlowHero}
            >
              <View style={visitorDashboardStyles.accessFlowHeroTop}>
                <View style={[visitorDashboardStyles.accessFlowHeroBadge, visitorDashboardStyles.accessFlowHeroBadgeDanger]}>
                  <Ionicons name="log-out-outline" size={15} color="#991B1B" />
                  <Text style={[visitorDashboardStyles.accessFlowHeroBadgeText, visitorDashboardStyles.accessFlowHeroBadgeTextDanger]}>
                    Departure Flow
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowCheckOutModal(false)}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={visitorDashboardStyles.accessFlowTitle}>Check Out</Text>
              <Text style={visitorDashboardStyles.accessFlowSubtitle}>
                  Confirm that you are leaving campus so your visit can be completed properly.
              </Text>
            </LinearGradient>

            <View style={visitorDashboardStyles.accessFlowBody}>
              <View style={visitorDashboardStyles.accessFlowSummaryCard}>
                <View style={visitorDashboardStyles.accessFlowSummaryRow}>
                  <Text style={visitorDashboardStyles.accessFlowSummaryLabel}>Visitor</Text>
                  <Text style={visitorDashboardStyles.accessFlowSummaryValue}>
                    {visitor?.fullName || "Visitor"}
                  </Text>
                </View>
                <View style={visitorDashboardStyles.accessFlowSummaryRow}>
                  <Text style={visitorDashboardStyles.accessFlowSummaryLabel}>Status</Text>
                  <Text style={visitorDashboardStyles.accessFlowSummaryValue}>Checked In</Text>
                </View>
                <View style={visitorDashboardStyles.accessFlowSummaryRow}>
                  <Text style={visitorDashboardStyles.accessFlowSummaryLabel}>Visit Schedule</Text>
                  <Text style={visitorDashboardStyles.accessFlowSummaryValue}>
                    {formatDate(visitor?.visitDate)} at {formatTime(visitor?.visitTime)}
                  </Text>
                </View>
              </View>

              <View style={visitorDashboardStyles.accessFlowTimelineCard}>
                {[
                  "This will mark your visit as completed in the system.",
                  "Security and admin monitoring can track that you have checked out.",
                  "Your account will remain active for future appointments.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.accessFlowTimelineRow}>
                    <View style={[visitorDashboardStyles.accessFlowTimelineDot, visitorDashboardStyles.accessFlowTimelineDotDanger]} />
                    <Text style={visitorDashboardStyles.accessFlowTimelineText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={visitorDashboardStyles.accessFlowFooter}>
                <TouchableOpacity
                  style={visitorDashboardStyles.accessFlowSecondaryButton}
                  onPress={() => setShowCheckOutModal(false)}
                  disabled={isCheckOutLoading}
                >
                  <Text style={visitorDashboardStyles.accessFlowSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={visitorDashboardStyles.accessFlowDangerButton}
                  onPress={confirmCheckOut}
                  disabled={isCheckOutLoading}
                >
                  {isCheckOutLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                      <Text style={visitorDashboardStyles.accessFlowPrimaryButtonText}>
                        Confirm Check Out
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCheckOutSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckOutSuccessModal(false)}
      >
        <View style={visitorDashboardStyles.modalOverlay}>
          <View style={visitorDashboardStyles.accessFlowSuccessContent}>
            <View style={[visitorDashboardStyles.accessFlowSuccessIconWrap, visitorDashboardStyles.accessFlowSuccessIconWrapDanger]}>
              <Ionicons name="log-out-outline" size={46} color="#DC2626" />
            </View>
            <Text style={visitorDashboardStyles.accessFlowSuccessTitle}>Checked Out Successfully</Text>
            <Text style={visitorDashboardStyles.accessFlowSuccessText}>
              Your visit has been completed. The monitoring system can now see that you have checked out.
            </Text>

            <View style={visitorDashboardStyles.accessFlowSuccessMetaCard}>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Visitor</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>
                  {visitor?.fullName || "Visitor"}
                </Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Status</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>Checked Out</Text>
              </View>
              <View style={visitorDashboardStyles.accessFlowSuccessMetaRow}>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaLabel}>Account</Text>
                <Text style={visitorDashboardStyles.accessFlowSuccessMetaValue}>Still active for reappointment</Text>
              </View>
            </View>

            <TouchableOpacity
              style={visitorDashboardStyles.accessFlowDangerButton}
              onPress={() => setShowCheckOutSuccessModal(false)}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              <Text style={visitorDashboardStyles.accessFlowPrimaryButtonText}>Continue</Text>
            </TouchableOpacity>
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
