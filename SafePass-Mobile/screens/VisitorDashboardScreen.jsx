import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Vibration,
  TextInput,
  useWindowDimensions,
  Animated,
  Easing,
  AppState,
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
  MONITORING_MAP_LABELS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";

const visitorBrandLogo = require("../assets/LogoSapphireAppIcon.png");
const Storage =
  Platform.OS === "web" ? require("../utils/webStorage").default : AsyncStorage;

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
  "Guidance",
  "Administration",
  "Cashier",
  "Flight Operations",
  "Training",
  "I.T Room",
  "Faculty Room",
  "Laboratory",
  "TESDA",
  "Workshop",
  "Library",
  "Student Services",
  "STO",
];

const DEFAULT_APPOINTMENT_TIME_SLOTS = [];
for (let hour = 7; hour <= 18; hour += 1) {
  for (const minute of [0, 30]) {
    DEFAULT_APPOINTMENT_TIME_SLOTS.push({
      id: `slot-${String(hour).padStart(2, "0")}-${String(minute).padStart(2, "0")}`,
      label: "",
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      hour,
      minute,
      enabled: true,
    });
  }
}

const APPOINTMENT_ID_TYPE_OPTIONS = [
  "School ID",
  "National ID",
  "Driver's License",
  "Passport",
  "UMID",
  "PhilHealth ID",
  "Voter's ID",
  "PRC ID",
  "Postal ID",
  "Senior Citizen ID",
  "Company ID",
  "Other Government ID",
];

const VISITOR_MODULES = [
  {
    id: "home",
    label: "Home",
    description: "Overview and quick actions",
    icon: "home-outline",
  },
  {
    id: "appointment",
    label: "Appointment",
    description: "Request and track visits",
    icon: "calendar-outline",
  },
  {
    id: "map",
    label: "Campus Map",
    description: "Ground, mezzanine, second, and third floor guide",
    icon: "map-outline",
  },
  {
    id: "account",
    label: "Account",
    description: "Profile details and account tools",
    icon: "person-circle-outline",
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

const getStoredVisitorIdType = (visitorRecord = {}) => {
  const explicitType = String(visitorRecord?.idType || "").trim();
  if (APPOINTMENT_ID_TYPE_OPTIONS.includes(explicitType)) {
    return explicitType;
  }

  const legacyValue = String(visitorRecord?.idNumber || "").trim();
  if (APPOINTMENT_ID_TYPE_OPTIONS.includes(legacyValue)) {
    return legacyValue;
  }

  return "";
};

const PHONE_TRACKING_INTERVAL_MS = 15000;
const PHONE_TRACKING_DISTANCE_METERS = 8;
const VISITOR_PENDING_REFRESH_INTERVAL_MS = 30000;
const VISITOR_CONNECTIVITY_REMINDER_KEY = "visitorConnectivityReminderShown";
const VISITOR_SELECTED_SECTION_KEY = "visitorDashboardSelectedSection";
const VISITOR_APPOINTMENT_SCREEN_KEY = "visitorDashboardAppointmentScreen";
const VISITOR_MAP_FLOOR_KEY = "visitorDashboardMapFloor";
const VISITOR_APPOINTMENT_SCREENS = ["menu", "request", "history", "status"];

const getEnabledAppointmentOptionLabels = (items = [], fallback = []) => {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  const labels = items
    .filter((item) => item?.enabled !== false)
    .map((item) => String(item?.label || item?.value || "").trim())
    .filter(Boolean);
  return labels;
};

const getDateFromTimeSlot = (slot = {}) => {
  const option = new Date();
  option.setHours(Number(slot.hour), Number(slot.minute), 0, 0);
  return option;
};

const VISITOR_OFFICE_MAP_ALIASES = {
  Registrar: "ground-registrar",
  Accounting: "ground-accounting",
  Cashier: "ground-cashier",
  "Information Desk": "ground-lobby",
  Guidance: "ground-offices",
  Administration: "ground-offices",
  "Flight Operations": "flight-operations",
  Training: "head-of-training-room",
  "I.T Room": "it-room",
  "Faculty Room": "faculty-room",
  Laboratory: "second-laboratory",
  TESDA: "second-tesda",
  Workshop: "third-workshop",
  Library: "third-library",
  "Student Services": "ground-staff",
  STO: "sto",
};

const getVisitorDestinationInfo = (visitorRecord = {}) => {
  const requestedOffice = String(
    visitorRecord?.appointmentDepartment ||
      visitorRecord?.assignedOffice ||
      visitorRecord?.host ||
      "",
  ).trim();
  const officeId =
    VISITOR_OFFICE_MAP_ALIASES[requestedOffice] ||
    MONITORING_MAP_OFFICES.find(
      (office) => office.name.toLowerCase() === requestedOffice.toLowerCase(),
    )?.id ||
    "ground-lobby";
  const office = MONITORING_MAP_OFFICES.find((item) => item.id === officeId) || MONITORING_MAP_OFFICES[0];
  const floor = MONITORING_MAP_FLOORS.find((item) => item.id === office?.floor) || MONITORING_MAP_FLOORS[0];

  return {
    officeId,
    officeName: requestedOffice || office?.name || "Lobby",
    floorId: floor?.id || "ground",
    floorName: floor?.name || "Ground Floor",
    icon: office?.icon || "navigate-outline",
    position: MONITORING_MAP_OFFICE_POSITIONS[officeId],
  };
};

const buildVisitorRouteSteps = (destination = {}) => {
  const officeName = destination.officeName || "your assigned office";
  const floorName = destination.floorName || "Ground Floor";
  const steps = [
    "Enter through the main gate and present your SafePass approval with your selected valid ID.",
    "Proceed to the security or information point for confirmation before entering the office area.",
  ];

  if (destination.floorId === "ground") {
    steps.push(`Stay on the ground floor and follow the office labels toward ${officeName}.`);
  } else if (destination.floorId === "first") {
    steps.push(`Use the stairs to reach the mezzanine, then follow the room labels toward ${officeName}.`);
  } else {
    steps.push(`Use the approved stair route to reach the ${floorName}, then follow the room labels toward ${officeName}.`);
  }

  steps.push("Wait at the office reception or doorway until staff confirms your appointment.");
  return steps;
};

// NFC Configuration
// For web: Use Web NFC API
// For mobile: Use react-native-nfc-manager
let NfcManager = null;
let NfcEvents = null;
if (Platform.OS !== 'web') {
  try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default || nfcModule;
    NfcEvents = nfcModule.NfcEvents;
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
  const [selectedAppointmentScreen, setSelectedAppointmentScreen] = useState("menu");
  const [selectedVisitorMapFloor, setSelectedVisitorMapFloor] = useState("ground");
  const visitorScreenRestoreReadyRef = useRef(false);
  const [appointmentFeedback, setAppointmentFeedback] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAppointmentDatePicker, setShowAppointmentDatePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);
  const [showVirtualNfcModal, setShowVirtualNfcModal] = useState(false);
  const [showVirtualNfcSuccessModal, setShowVirtualNfcSuccessModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckInSuccessModal, setShowCheckInSuccessModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showCheckOutSuccessModal, setShowCheckOutSuccessModal] = useState(false);
  const [checkOutTargetVisitor, setCheckOutTargetVisitor] = useState(null);
  const [visitorPushNotice, setVisitorPushNotice] = useState(null);
  const [isVisitorDarkMode, setIsVisitorDarkMode] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [isVirtualTapLoading, setIsVirtualTapLoading] = useState(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [appointmentAvailability, setAppointmentAvailability] = useState(null);
  const [isLoadingAppointmentSlots, setIsLoadingAppointmentSlots] = useState(false);
  const [appointmentOptions, setAppointmentOptions] = useState({
    offices: APPOINTMENT_DEPARTMENT_OPTIONS.map((label) => ({ label, enabled: true })),
    purposes: APPOINTMENT_PURPOSE_OPTIONS.map((label) => ({ label, enabled: true })),
    timeSlots: DEFAULT_APPOINTMENT_TIME_SLOTS,
  });
  const [appointmentForm, setAppointmentForm] = useState({
    preferredDate: null,
    preferredTime: null,
    department: "",
    purposeSelection: "",
    customPurpose: "",
    idType: "",
    idImage: null,
    privacyAccepted: false,
  });
  const [hasAppointmentDraft, setHasAppointmentDraft] = useState(false);
  const [isAppointmentScreenTransitioning, setIsAppointmentScreenTransitioning] = useState(false);
  const [appointmentTransitionLabel, setAppointmentTransitionLabel] = useState("Loading appointment module...");
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
  const isVisitorHomeSection = selectedVisitorSection === "home";
  const nfcListenerRef = useRef(null);
  const nfcTapProcessingRef = useRef(false);
  const dashboardScrollRef = useRef(null);
  const phoneLocationSubscriptionRef = useRef(null);
  const appointmentTransitionTimeoutRef = useRef(null);
  const visitorPushNoticeTimeoutRef = useRef(null);
  const appointmentWebDateInputRef = useRef(null);
  const shownVisitorWarningIdsRef = useRef(new Set());
  const visitorWarningCheckInFlightRef = useRef(false);
  const dashboardHeroAnim = useRef(new Animated.Value(0)).current;
  const dashboardContentAnim = useRef(new Animated.Value(0)).current;
  const isCompactVirtualCardView = viewportWidth <= 540;
  const commandMetricCardWidth = isWideVisitorDashboard
    ? "31.8%"
    : isTabletVisitorDashboard
      ? "48.5%"
      : "100%";
  const compactCommandMetricCardWidth = viewportWidth <= 560 ? "31%" : commandMetricCardWidth;
  const approvedFactCardWidth = isWideVisitorDashboard
    ? "31.8%"
    : isTabletVisitorDashboard
      ? "48.5%"
      : "100%";
  const approvedActionCardWidth = isTabletVisitorDashboard ? "48.5%" : "100%";
  const compactApprovedActionCardWidth = viewportWidth <= 560 ? "100%" : approvedActionCardWidth;

  const loadManagedAppointmentOptions = async () => {
    try {
      const response = await ApiService.getAppointmentOptions();
      if (response?.success && response?.options) {
        setAppointmentOptions(response.options);
      }
    } catch (error) {
      console.log("Load appointment options error:", error);
    }
  };

  useEffect(() => {
    if (!currentUser?._id) return;

    let isMounted = true;

    ApiService.getAppointmentOptions()
      .then((response) => {
        if (isMounted && response?.success && response?.options) {
          setAppointmentOptions(response.options);
        }
      })
      .catch((error) => {
        console.log("Load appointment options error:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);

  useEffect(() => {
    let isMounted = true;

    const restoreVisitorScreen = async () => {
      try {
        const [savedSection, savedAppointmentScreen, savedMapFloor] = await Promise.all([
          Storage.getItem(VISITOR_SELECTED_SECTION_KEY),
          Storage.getItem(VISITOR_APPOINTMENT_SCREEN_KEY),
          Storage.getItem(VISITOR_MAP_FLOOR_KEY),
        ]);

        if (!isMounted) return;

        if (VISITOR_MODULES.some((module) => module.id === savedSection)) {
          setSelectedVisitorSection(savedSection);
        }

        if (VISITOR_APPOINTMENT_SCREENS.includes(savedAppointmentScreen)) {
          setSelectedAppointmentScreen(savedAppointmentScreen);
        }

        if (MONITORING_MAP_FLOORS.some((floor) => floor.id === savedMapFloor)) {
          setSelectedVisitorMapFloor(savedMapFloor);
        }
      } finally {
        if (isMounted) {
          visitorScreenRestoreReadyRef.current = true;
        }
      }
    };

    restoreVisitorScreen();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!visitorScreenRestoreReadyRef.current) return;

    Storage.multiSet([
      [VISITOR_SELECTED_SECTION_KEY, selectedVisitorSection],
      [VISITOR_APPOINTMENT_SCREEN_KEY, selectedAppointmentScreen],
      [VISITOR_MAP_FLOOR_KEY, selectedVisitorMapFloor],
    ]).catch((error) => {
      console.log("Save visitor screen state error:", error);
    });
  }, [selectedVisitorSection, selectedAppointmentScreen, selectedVisitorMapFloor]);

  const isVisitorAccessApproved = (visitorRecord = visitor) => {
    const approvalPending =
      visitorRecord?.status === "pending" || visitorRecord?.approvalStatus === "pending";
    const normalizedStatus = String(visitorRecord?.status || "").toLowerCase();
    const pendingStaffReview =
      !approvalPending &&
      visitorRecord?.approvalFlow === "staff" &&
      visitorRecord?.appointmentStatus === "pending";

    return (
      !approvalPending &&
      !pendingStaffReview &&
      (normalizedStatus === "approved" || normalizedStatus === "checked_in")
    );
  };

  const isSafePassCardActive = (visitorRecord = visitor, accountRecord = currentUser) => {
    const safePassId = String(
      visitorRecord?.nfcCardId ||
        accountRecord?.nfcCardId ||
        "",
    ).trim();
    const accountStatus = String(accountRecord?.status || "").toLowerCase();
    const cardActive =
      accountRecord?.cardActive ??
      accountRecord?.accessPermissions?.cardActive ??
      true;

    return Boolean(safePassId) && accountStatus === "active" && cardActive !== false;
  };

  const getVisitorAccessBlockedMessage = (visitorRecord = visitor, accountRecord = currentUser) => {
    if (!isSafePassCardActive(visitorRecord, accountRecord)) {
      return "Your SafePass card is not active yet. Please contact admin or security.";
    }

    if (!isVisitorAccessApproved(visitorRecord)) {
      return "This visit must be approved before check-in and check-out are available.";
    }

    return "";
  };
  const activeAppointmentPurposeOptions = useMemo(
    () => getEnabledAppointmentOptionLabels(appointmentOptions.purposes, APPOINTMENT_PURPOSE_OPTIONS),
    [appointmentOptions.purposes],
  );
  const activeAppointmentDepartmentOptions = useMemo(
    () => getEnabledAppointmentOptionLabels(appointmentOptions.offices, APPOINTMENT_DEPARTMENT_OPTIONS),
    [appointmentOptions.offices],
  );
  const appointmentTimeOptions = useMemo(() => {
    const configuredSlots = Array.isArray(appointmentOptions.timeSlots) ? appointmentOptions.timeSlots : [];
    const activeSlots = configuredSlots.filter((slot) => slot?.enabled !== false);
    const slots = configuredSlots.length ? activeSlots : DEFAULT_APPOINTMENT_TIME_SLOTS;
    return slots.map(getDateFromTimeSlot).filter((option) => !Number.isNaN(option.getTime()));
  }, [appointmentOptions.timeSlots]);

  useEffect(() => {
    setAppointmentForm((prev) => {
      const selectedTime = getValidDate(prev.preferredTime);
      const timeStillEnabled =
        !selectedTime ||
        appointmentTimeOptions.some(
          (option) =>
            option.getHours() === selectedTime.getHours() &&
            option.getMinutes() === selectedTime.getMinutes(),
        );
      const nextDepartment = activeAppointmentDepartmentOptions.includes(prev.department)
        ? prev.department
        : "";
      const nextPurpose = activeAppointmentPurposeOptions.includes(prev.purposeSelection)
        ? prev.purposeSelection
        : "";

      if (nextDepartment === prev.department && nextPurpose === prev.purposeSelection && timeStillEnabled) {
        return prev;
      }

      return {
        ...prev,
        department: nextDepartment,
        purposeSelection: nextPurpose,
        customPurpose: nextPurpose === "Other" ? prev.customPurpose : "",
        preferredTime: timeStillEnabled ? prev.preferredTime : appointmentTimeOptions[0] || null,
      };
    });
  }, [activeAppointmentDepartmentOptions, activeAppointmentPurposeOptions, appointmentTimeOptions]);

  useEffect(() => {
    const isAppointmentSection = selectedVisitorSection === "appointment";
    const heroDuration = isVisitorHomeSection ? 180 : isAppointmentSection ? 210 : 160;
    const contentDuration = isVisitorHomeSection ? 190 : isAppointmentSection ? 240 : 180;

    dashboardHeroAnim.setValue(0);
    dashboardContentAnim.setValue(0);

    Animated.parallel([
      Animated.timing(dashboardHeroAnim, {
        toValue: 1,
        duration: heroDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(dashboardContentAnim, {
        toValue: 1,
        duration: contentDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [
    selectedVisitorSection,
    selectedAppointmentScreen,
    isVisitorHomeSection,
    dashboardHeroAnim,
    dashboardContentAnim,
  ]);
  const dashboardShellResponsiveStyle = {
    paddingHorizontal: dashboardHorizontalGutter,
    paddingBottom: isCompactVisitorDashboard ? 10 : 16,
  };
  const dashboardCardResponsiveStyle = {
    marginHorizontal: 0,
    padding: isCompactVisitorDashboard && isVisitorHomeSection ? 14 : dashboardCardPadding,
  };
  const dashboardHeroCardResponsiveStyle = {
    marginHorizontal: 0,
  };
  const dashboardSectionResponsiveStyle = {
    marginHorizontal: 0,
  };
  const commandActionRowResponsiveStyle = viewportWidth <= 560 ? { gap: 10 } : null;
  const commandActionButtonResponsiveStyle = viewportWidth <= 560 ? { width: "100%" } : null;
  const compactHomeHeaderStyle = isCompactVisitorDashboard && isVisitorHomeSection
    ? visitorDashboardStyles.headerCompactHome
    : null;
  const compactHomeSupportStyle = isCompactVisitorDashboard && isVisitorHomeSection
    ? visitorDashboardStyles.headerSupportTextCompact
    : null;
  const compactCommandDeckStyle = isCompactVisitorDashboard && isVisitorHomeSection
    ? visitorDashboardStyles.commandDeckCardCompactHome
    : null;
  const compactApprovedHeroStyle = isCompactVisitorDashboard
    ? visitorDashboardStyles.approvedHeroCardCompact
    : null;
  const compactApprovedGradientStyle = isCompactVisitorDashboard
    ? visitorDashboardStyles.approvedHeroGradientCompact
    : null;
  const approvedSectionHeaderResponsiveStyle = viewportWidth <= 560
    ? { marginBottom: 12 }
    : null;

  const loadVisitorPreferences = async () => {
    try {
      const savedDarkMode = await Storage.getItem("darkModeEnabled");
      setIsVisitorDarkMode(savedDarkMode === "true");
    } catch (error) {
      console.log("Load visitor preferences error:", error);
    }
  };

  useEffect(() => {
    loadVisitorPreferences();
    const unsubscribe = navigation?.addListener?.("focus", loadVisitorPreferences);
    return unsubscribe || undefined;
  }, [navigation]);

  const scrollDashboardToTop = (animated = true) => {
    requestAnimationFrame(() => {
      dashboardScrollRef.current?.scrollTo?.({ y: 0, animated });
    });
  };

  const handleAppointmentScreenNavigation = (targetScreen, loadingLabel = "Loading appointment module...") => {
    if (
      selectedVisitorSection === "appointment" &&
      selectedAppointmentScreen === targetScreen &&
      !isAppointmentScreenTransitioning
    ) {
      scrollDashboardToTop(true);
      return;
    }

    if (appointmentTransitionTimeoutRef.current) {
      clearTimeout(appointmentTransitionTimeoutRef.current);
    }

    scrollDashboardToTop(false);
    setAppointmentTransitionLabel(loadingLabel);
    setIsAppointmentScreenTransitioning(true);
    setShowAppointmentDatePicker(false);
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);
    setShowIdTypeDropdown(false);

    appointmentTransitionTimeoutRef.current = setTimeout(() => {
      setSelectedAppointmentScreen(targetScreen);
      setIsAppointmentScreenTransitioning(false);
      appointmentTransitionTimeoutRef.current = null;
      scrollDashboardToTop(false);
    }, 420);
  };

  const handleVisitorSectionChange = (sectionId) => {
    scrollDashboardToTop(false);

    if (sectionId === "appointment") {
      if (selectedVisitorSection === "appointment") {
        if (selectedAppointmentScreen !== "menu") {
          handleAppointmentScreenNavigation("menu", "Opening appointment center...");
        }
        return;
      }

      setSelectedVisitorSection("appointment");
      handleAppointmentScreenNavigation("menu", "Opening appointment center...");
      return;
    }

    if (appointmentTransitionTimeoutRef.current) {
      clearTimeout(appointmentTransitionTimeoutRef.current);
      appointmentTransitionTimeoutRef.current = null;
    }
    setIsAppointmentScreenTransitioning(false);
    setSelectedVisitorSection(sectionId);
  };

  useEffect(() => {
    if (!isAppointmentScreenTransitioning) {
      scrollDashboardToTop(false);
    }
  }, [selectedVisitorSection, selectedAppointmentScreen, isAppointmentScreenTransitioning]);

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
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        loadVisitorData({ silent: true });
        checkNfcSupport();
      }
    });

    return () => {
      appStateSubscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    const status = String(visitor?.status || "").toLowerCase();
    const approvalStatus = String(visitor?.approvalStatus || "").toLowerCase();
    const appointmentStatus = String(visitor?.appointmentStatus || "").toLowerCase();
    const isWaitingForVisitUpdate =
      !visitor?._id ||
      status === "pending" ||
      approvalStatus === "pending" ||
      appointmentStatus === "pending";

    if (!isWaitingForVisitUpdate) {
      return undefined;
    }

    const refreshTimer = setInterval(() => {
      loadVisitorData({ silent: true });
    }, VISITOR_PENDING_REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshTimer);
  }, [visitor?._id, visitor?.status, visitor?.approvalStatus, visitor?.appointmentStatus]);

  useEffect(() => () => {
    if (appointmentTransitionTimeoutRef.current) {
      clearTimeout(appointmentTransitionTimeoutRef.current);
    }
    if (visitorPushNoticeTimeoutRef.current) {
      clearTimeout(visitorPushNoticeTimeoutRef.current);
    }
  }, []);

  const showVisitorPushNotice = ({ title, message, type = "info" }) => {
    if (visitorPushNoticeTimeoutRef.current) {
      clearTimeout(visitorPushNoticeTimeoutRef.current);
    }

    setVisitorPushNotice({
      id: `${type}-${Date.now()}`,
      title,
      message,
      type,
    });

    visitorPushNoticeTimeoutRef.current = setTimeout(() => {
      setVisitorPushNotice(null);
      visitorPushNoticeTimeoutRef.current = null;
    }, 6000);
  };

  useEffect(() => {
    if (visitor?.status === "checked_in") {
      startPhoneLocationTracking(visitor);
    } else {
      stopPhoneLocationTracking();
    }
  }, [visitor?._id, visitor?.status]);

  useEffect(() => {
    const maybeShowConnectivityReminder = async () => {
      const appointmentStatus = String(visitor?.appointmentStatus || "").toLowerCase();
      const isStaffApprovedVisit =
        String(visitor?.approvalFlow || "").toLowerCase() === "staff" &&
        ["approved", "adjusted"].includes(appointmentStatus);

      if (!isStaffApprovedVisit || !visitor?._id || !visitor?.visitTime) {
        return;
      }

      const reminderToken = `${visitor._id}:${appointmentStatus}:${new Date(visitor.visitTime).toISOString()}`;
      const shownReminderToken = await Storage.getItem(VISITOR_CONNECTIVITY_REMINDER_KEY);

      if (shownReminderToken === reminderToken) {
        return;
      }

      await Storage.setItem(VISITOR_CONNECTIVITY_REMINDER_KEY, reminderToken);

      showVisitorPushNotice({
        type: "success",
        title: "Appointment Approved",
        message:
          "Before visiting, please turn on Wi-Fi or cellular data so check-in, notifications, and live visitor tracking can work properly.",
      });
    };

    maybeShowConnectivityReminder();
  }, [visitor?._id, visitor?.appointmentStatus, visitor?.approvalFlow, visitor?.visitTime]);

  useEffect(() => {
    if (isVisitorAccessApproved(visitor)) {
      return;
    }

    setShowVirtualNfcModal(false);
    setShowVirtualNfcSuccessModal(false);
    setShowCheckInModal(false);
    setShowCheckInSuccessModal(false);
    setShowCheckOutModal(false);
  }, [visitor?.status, visitor?.approvalStatus, visitor?.approvalFlow, visitor?.appointmentStatus]);

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

  const maybeShowVisitorWarning = async (activeUser = currentUser) => {
    if (!activeUser?._id || String(activeUser?.role || "").toLowerCase() !== "visitor") {
      return;
    }

    if (visitorWarningCheckInFlightRef.current) {
      return;
    }

    visitorWarningCheckInFlightRef.current = true;

    try {
      const response = await ApiService.getNotifications({ read: "false", limit: 10 });
      const unreadNotifications = Array.isArray(response?.notifications) ? response.notifications : [];
      const latestWarning = unreadNotifications.find((notification) => {
        const notificationId = String(notification?._id || "");
        const notificationType = String(notification?.type || "").toLowerCase();
        const severity = String(notification?.severity || "").toLowerCase();
        const notificationText = `${notification?.title || ""} ${notification?.message || ""}`.toLowerCase();

        return (
          notificationId &&
          !shownVisitorWarningIdsRef.current.has(notificationId) &&
          (
            notificationType === "warning" ||
            notificationType === "alert" ||
            severity === "high" ||
            notificationText.includes("reported")
          )
        );
      });

      if (!latestWarning?._id) {
        return;
      }

      const warningId = String(latestWarning._id);
      shownVisitorWarningIdsRef.current.add(warningId);

      Alert.alert(
        latestWarning.title || "Security Report Warning",
        latestWarning.message || "A new notice has been added to your visitor account.",
        [
          {
            text: "I Understand",
            onPress: async () => {
              try {
                await ApiService.markNotificationAsRead(warningId);
              } catch (error) {
                console.error("Mark visitor warning as read error:", error);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Load visitor warning error:", error);
    } finally {
      visitorWarningCheckInFlightRef.current = false;
    }
  };

  const loadVisitorData = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser) {
        navigation.replace("Login");
        return;
      }
      setCurrentUser(currentUser);

      const profileResponse = await ApiService.getVisitorProfile();
      if (profileResponse?.account) {
        setCurrentUser((previousUser) => ({
          ...(previousUser || currentUser || {}),
          ...profileResponse.account,
          accessPermissions: {
            ...((previousUser || currentUser || {}).accessPermissions || {}),
            ...(profileResponse.account.accessPermissions || {}),
          },
        }));
      }
      if (profileResponse.success && profileResponse.visitor) {
        const accountSafePassId =
          profileResponse?.account?.nfcCardId ||
          currentUser?.nfcCardId ||
          profileResponse.visitor?.nfcCardId ||
          "";
        setVisitor({
          ...profileResponse.visitor,
          nfcCardId: accountSafePassId || profileResponse.visitor?.nfcCardId,
        });
        setAppointmentHistory(Array.isArray(profileResponse.appointments) ? profileResponse.appointments : []);
      } else {
        setVisitor(null);
        setAppointmentHistory(Array.isArray(profileResponse.appointments) ? profileResponse.appointments : []);
      }

      await maybeShowVisitorWarning(currentUser);
    } catch (error) {
      console.error("Load visitor data error:", error);
      const isProfileMissing =
        error?.status === 404 ||
        String(error?.message || "").includes("404") ||
        String(error?.message || "").toLowerCase().includes("profile not found") ||
        String(error?.message || "").toLowerCase().includes("visitor not found");

      if (isProfileMissing) {
        setVisitor(null);
      } else {
        Alert.alert("Error", "Failed to load visitor data");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const refreshNfcAvailability = async ({ showDisabledAlert = false } = {}) => {
    if (Platform.OS === 'web') {
      const webSupported =
        typeof window !== "undefined" && ("NDEFReader" in window || "nfc" in navigator);
      setIsNfcSupported(webSupported);
      setIsNfcEnabled(webSupported);
      return {
        moduleAvailable: webSupported,
        supported: webSupported,
        enabled: webSupported,
      };
    }

    const hasNativeNfcApi =
      NfcManager &&
      typeof NfcManager.isSupported === "function" &&
      typeof NfcManager.isEnabled === "function" &&
      typeof NfcManager.start === "function";

    if (!hasNativeNfcApi) {
      setIsNfcSupported(false);
      setIsNfcEnabled(false);
      return {
        moduleAvailable: false,
        supported: false,
        enabled: false,
      };
    }

    try {
      const isSupported = Boolean(await NfcManager.isSupported());
      setIsNfcSupported(isSupported);

      if (!isSupported) {
        setIsNfcEnabled(false);
        return {
          moduleAvailable: true,
          supported: false,
          enabled: false,
        };
      }

      await NfcManager.start();
      const isEnabled = Boolean(await NfcManager.isEnabled());
      setIsNfcEnabled(isEnabled);

      if (showDisabledAlert && !isEnabled) {
        Alert.alert(
          "NFC Disabled",
          "Please enable NFC in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === 'android') {
                  NfcManager?.goToNfcSetting?.();
                }
              },
            },
          ],
        );
      }

      return {
        moduleAvailable: true,
        supported: true,
        enabled: isEnabled,
      };
    } catch (error) {
      const errorMessage = String(error?.message || error || "");
      console.log("NFC check unavailable:", errorMessage);
      setIsNfcSupported(false);
      setIsNfcEnabled(false);
      return {
        moduleAvailable: false,
        supported: false,
        enabled: false,
        error,
      };
    }
  };

  // NFC Support Check
  const checkNfcSupport = async () => {
    await refreshNfcAvailability();
  };

  // Start NFC Reading
  const startNfcReading = async () => {
    const blockedMessage = getVisitorAccessBlockedMessage(visitor, currentUser);
    if (blockedMessage) {
      Alert.alert(
        blockedMessage.includes("card") ? "Card Not Active" : "Approval Required",
        blockedMessage,
      );
      return false;
    }

    const nfcAvailability = await refreshNfcAvailability({ showDisabledAlert: true });

    if (!nfcAvailability.moduleAvailable) {
      Alert.alert(
        "NFC Module Unavailable",
        "This app build does not include the native NFC module. Install the SafePass development or release APK, then try again.",
      );
      return false;
    }

    if (!nfcAvailability.supported) {
      Alert.alert(
        "NFC Not Supported",
        "Your device doesn't support NFC. Please use the digital access card or manual check-in."
      );
      return false;
    }

    if (Platform.OS !== 'web' && !nfcAvailability.enabled) {
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
    if (!NfcManager || !NfcEvents) {
      setNfcStatus({
        type: "error",
        message: "Native NFC is not available in this app build.",
      });
      return false;
    }

    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        handleNfcTagRead(tag);
      });
      
      NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
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
    if (nfcTapProcessingRef.current) {
      return;
    }

    nfcTapProcessingRef.current = true;

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
    
    try {
      // Process the tap - send to server
      await processNfcTap(readerId, gateId);
    } finally {
      setTimeout(() => {
        nfcTapProcessingRef.current = false;
      }, 1200);
    }
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
        source: "virtual_nfc_card",
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
          setShowVirtualNfcModal(false);
          setShowVirtualNfcSuccessModal(false);
          setSelectedVisitorSection("home");
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
      } else if (NfcManager && NfcEvents) {
        try {
          await NfcManager.unregisterTagEvent();
        } catch (error) {
          console.log("NFC unregister skipped:", error?.message || error);
        }

        NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {});
        NfcManager.setEventListener(NfcEvents.SessionClosed, () => {});
      }
    } catch (error) {
      console.error("Stop NFC error:", error);
    }
  };

  const getValidDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const getNextAvailableAppointmentDate = (inputDate = new Date()) => {
    const nextDate = new Date(inputDate);
    nextDate.setHours(12, 0, 0, 0);

    while (nextDate.getDay() === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
  };

  const getDefaultAppointmentDate = () => {
    const visitorDate = getValidDate(visitor?.visitDate);
    if (visitorDate) return getNextAvailableAppointmentDate(visitorDate);
    const nextVisitDate = new Date();
    nextVisitDate.setDate(nextVisitDate.getDate() + 1);
    nextVisitDate.setHours(9, 0, 0, 0);
    return getNextAvailableAppointmentDate(nextVisitDate);
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
    const today = getNextAvailableAppointmentDate(new Date());
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

  const getAppointmentSlotInfo = (timeOption) => {
    const optionDate = getValidDate(timeOption);
    if (!optionDate || !appointmentAvailability?.slots?.length) return null;

    return appointmentAvailability.slots.find(
      (slot) =>
        Number(slot.hour) === optionDate.getHours() &&
        Number(slot.minute) === optionDate.getMinutes(),
    );
  };

  const isAppointmentTimeSlotFull = (timeOption) =>
    Boolean(getAppointmentSlotInfo(timeOption)?.isFull);

  const getAppointmentSlotStatusText = (timeOption) => {
    const slot = getAppointmentSlotInfo(timeOption);
    if (!slot) {
      return isLoadingAppointmentSlots ? "Checking..." : "3 slots";
    }

    if (slot.isFull) return "Full";
    return `${slot.available} left`;
  };

  const loadAppointmentAvailability = async () => {
    const date = getValidDate(appointmentForm.preferredDate);
    const department = String(appointmentForm.department || "").trim();
    const isViewingAppointmentRequest =
      selectedVisitorSection === "appointment" && selectedAppointmentScreen === "request";

    if (!isViewingAppointmentRequest || !date || !department) {
      setAppointmentAvailability(null);
      return;
    }

    setIsLoadingAppointmentSlots(true);
    try {
      const response = await ApiService.getAppointmentAvailability({
        date: date.toISOString(),
        department,
      });
      if (response?.success) {
        setAppointmentAvailability(response);
      } else {
        setAppointmentAvailability(null);
      }
    } catch (error) {
      setAppointmentAvailability(null);
    } finally {
      setIsLoadingAppointmentSlots(false);
    }
  };

  const applyAppointmentDateSelection = (selectedValue) => {
    const selectedDate = getValidDate(selectedValue);
    if (!selectedDate) return;

    selectedDate.setHours(12, 0, 0, 0);
    if (selectedDate.getDay() === 0) {
      const adjustedDate = getNextAvailableAppointmentDate(selectedDate);
      Alert.alert(
        "Sunday Unavailable",
        `Appointments are only available from Monday to Saturday. We moved your date to ${formatDate(adjustedDate)}.`,
      );
      selectedDate.setTime(adjustedDate.getTime());
    }

    setHasAppointmentDraft(true);
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

  const buildAppointmentForm = (visitorRecord = visitor) => {
    return {
      preferredDate: getDefaultAppointmentDate(),
      preferredTime: getDefaultAppointmentTime(),
      department: "",
      purposeSelection: "",
      customPurpose: "",
      idType: getStoredVisitorIdType(visitorRecord),
      idImage: null,
      privacyAccepted: false,
    };
  };

  const populateAppointmentForm = (visitorRecord = visitor) => {
    setAppointmentForm(buildAppointmentForm(visitorRecord));
    setHasAppointmentDraft(false);
  };

  const handlePickAppointmentIdImage = async () => {
    try {
      if (!appointmentForm.idType) {
        Alert.alert(
          "Choose ID Type First",
          "Please choose which valid ID you will present before uploading its picture.",
        );
        return;
      }

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

      setHasAppointmentDraft(true);
      setAppointmentForm((prev) => ({
        ...prev,
        idImage: imageValue,
      }));
      Alert.alert(
        "ID Image Saved",
        `Your ${appointmentForm.idType} picture was saved. Please make sure the uploaded photo matches the ID type you selected.`,
      );
    } catch (error) {
      console.error("Pick appointment ID image error:", error);
      Alert.alert("Upload Failed", "Unable to select the ID image. Please try again.");
    }
  };

  const openAppointmentRequestScreen = () => {
    loadManagedAppointmentOptions();
    if (!hasAppointmentDraft) {
      populateAppointmentForm();
    }
    setShowAppointmentDatePicker(false);
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);
    setShowIdTypeDropdown(false);
    setSelectedVisitorSection("appointment");
    handleAppointmentScreenNavigation(
      "request",
      hasAppointmentDraft ? "Opening your appointment draft..." : "Preparing appointment request...",
    );
  };

  const closeAppointmentRequestScreen = () => {
    setShowAppointmentDatePicker(false);
    setShowAppointmentTimePicker(false);
    setShowPurposeDropdown(false);
    setShowDepartmentDropdown(false);
    setShowIdTypeDropdown(false);
    handleAppointmentScreenNavigation("menu", "Returning to appointment menu...");
  };

  useEffect(() => {
    loadAppointmentAvailability();
  }, [
    selectedVisitorSection,
    selectedAppointmentScreen,
    appointmentForm.preferredDate,
    appointmentForm.department,
  ]);

  const handleRequestAppointment = async () => {
    const preferredDate = appointmentForm.preferredDate;
    const preferredTime = appointmentForm.preferredTime;
    const isOtherPurpose = appointmentForm.purposeSelection === "Other";
    const purposeCategory = String(appointmentForm.purposeSelection || "").trim();
    const customPurposeOfVisit = String(appointmentForm.customPurpose || "").trim();
    const purposeOfVisit = isOtherPurpose ? customPurposeOfVisit : purposeCategory;
    const department = String(appointmentForm.department || "").trim();
    const idType = String(appointmentForm.idType || "").trim();
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

    if (new Date(preferredDate).getDay() === 0) {
      Alert.alert(
        "Sunday Unavailable",
        "Appointments are only available from Monday to Saturday. Please choose another date.",
      );
      return;
    }

    if (isLoadingAppointmentSlots) {
      Alert.alert("Checking Slots", "Please wait while we confirm available appointment slots.");
      return;
    }

    if (appointmentAvailability && appointmentAvailability.assignedStaff === null) {
      Alert.alert(
        "No Staff Available",
        appointmentAvailability.message ||
          "No active staff account is assigned to this office yet. Please choose another office or contact admin.",
      );
      return;
    }

    if (isAppointmentTimeSlotFull(preferredTime)) {
      Alert.alert(
        "Time Slot Full",
        `${department} already has 3 appointments for ${formatTime(preferredTime)}. Please choose another time.`,
      );
      return;
    }

    if (!department) {
      Alert.alert("Missing Details", "Please provide the office or department to visit.");
      return;
    }

    if (!idType) {
      Alert.alert("Missing Valid ID", "Please choose the valid ID type you will present on campus.");
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

    if (combinedDateTime < new Date(Date.now() - 60 * 1000)) {
      Alert.alert("Invalid Schedule", "Appointment schedule cannot be in the past.");
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
        idType,
        idNumber: idType,
        idImage,
        dataPrivacyAccepted: true,
        dataPrivacyAcceptedAt: new Date().toISOString(),
      });

      if (response?.success) {
        setHasAppointmentDraft(false);
        setAppointmentForm(buildAppointmentForm({
          ...visitor,
          visitDate: preferredDate,
          visitTime: combinedDateTime,
          purposeOfVisit,
          purposeCategory,
          customPurposeOfVisit: isOtherPurpose ? customPurposeOfVisit : "",
          appointmentDepartment: department,
          assignedOffice: department,
          host: department,
          idType,
          idNumber: idType,
          idImage,
        }));
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
        handleAppointmentScreenNavigation("history", "Opening appointment history...");
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

    if (isNfcReading) {
      await stopNfcReading();
      return;
    }

    const blockedMessage = getVisitorAccessBlockedMessage(visitor, currentUser);
    if (blockedMessage) {
      Alert.alert(
        blockedMessage.includes("card") ? "Card Not Active" : "Approval Required",
        blockedMessage,
      );
      return;
    }

    if (String(visitor?.status || "").toLowerCase() === "checked_out") {
      Alert.alert(
        "Visit Completed",
        "This SafePass card has already been checked out and can no longer be used.",
      );
      return;
    }

    setIsVirtualTapLoading(true);

    try {
      const nfcAvailability = await refreshNfcAvailability();
      if (!nfcAvailability.moduleAvailable || !nfcAvailability.supported) {
        setNfcStatus({
          type: "processing",
          message: "Confirming your virtual SafePass card...",
        });
        await processNfcTap("virtual-card", "visitor-app");
        return;
      }

      const started = await startNfcReading();
      if (!started) {
        return;
      }

      setNfcStatus({
        type: "info",
        message:
          visitor?.status === "checked_in"
            ? "Confirm departure from this phone to check out."
            : "Confirm arrival from this phone to check in.",
      });
    } catch (error) {
      console.error("Virtual NFC card tap error:", error);
      setNfcStatus({
        type: "error",
        message: error?.message || "Unable to start the NFC tap flow. Please try again.",
      });
      Alert.alert("NFC Unavailable", error?.message || "Unable to start the NFC tap flow right now.");
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
    const blockedMessage = getVisitorAccessBlockedMessage(visitor, currentUser);
    if (blockedMessage) {
      Alert.alert(
        blockedMessage.includes("card") ? "Card Not Active" : "Approval Required",
        blockedMessage,
      );
      return;
    }

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

  const handleCheckOutAction = (targetVisitor = visitor) => {
    const blockedMessage = getVisitorAccessBlockedMessage(targetVisitor, currentUser);
    if (blockedMessage) {
      Alert.alert(
        blockedMessage.includes("card") ? "Card Not Active" : "Approval Required",
        blockedMessage,
      );
      return;
    }

    if (String(targetVisitor?.status || "").toLowerCase() !== "checked_in") {
      Alert.alert("Check-Out Unavailable", "Only a checked-in visit can be checked out.");
      return;
    }

    if (!targetVisitor || isCheckOutLoading) return;
    setCheckOutTargetVisitor(targetVisitor);
    setShowCheckOutModal(true);
  };

  const confirmCheckOut = async () => {
    const targetVisitor = checkOutTargetVisitor || visitor;
    if (!targetVisitor || isCheckOutLoading) return;

    setIsCheckOutLoading(true);
    try {
      const response = await ApiService.visitorCheckOut(targetVisitor._id, {
        source: "visitor_dashboard",
      });

      if (response?.success) {
        setShowCheckOutModal(false);
        setCheckOutTargetVisitor(null);
        setShowVirtualNfcModal(false);
        setShowVirtualNfcSuccessModal(false);
        setShowCheckOutSuccessModal(true);
        setSelectedVisitorSection("home");
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
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "adjusted") return "#0A3D91";
    if (visitor?.approvalFlow === "staff" && visitor?.appointmentStatus === "rejected") return "#DC2626";
    switch(visitor?.status) {
      case 'checked_in': return '#10B981';
      case 'approved': return '#0A3D91';
      case 'pending': return '#F59E0B';
      case 'checked_out': return '#6B7280';
      case 'expired': return '#EF4444';
      case 'rejected': return '#DC2626';
      default: return '#0A3D91';
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

  const getAppointmentStatusText = (record = {}) => {
    if (record?.approvalStatus === "pending") return "Pending Admin Approval";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "pending") return "Pending Staff Review";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "adjusted") return "Time Adjusted";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "rejected") return "Appointment Declined";
    switch (record?.status) {
      case "checked_in": return "Checked In";
      case "approved": return "Approved";
      case "pending": return "Pending Approval";
      case "checked_out": return "Checked Out";
      case "expired": return "Expired";
      case "rejected": return "Rejected";
      default: return "Active";
    }
  };

  const getAppointmentStatusColor = (record = {}) => {
    if (record?.approvalStatus === "pending") return "#F59E0B";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "pending") return "#F59E0B";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "adjusted") return "#0A3D91";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "rejected") return "#DC2626";
    switch (record?.status) {
      case "checked_in": return "#10B981";
      case "approved": return "#0A3D91";
      case "pending": return "#F59E0B";
      case "checked_out": return "#6B7280";
      case "expired": return "#EF4444";
      case "rejected": return "#DC2626";
      default: return "#0A3D91";
    }
  };

  const getAppointmentStatusIcon = (record = {}) => {
    if (record?.approvalStatus === "pending") return "time-outline";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "pending") return "briefcase-outline";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "adjusted") return "swap-horizontal-outline";
    if (record?.approvalFlow === "staff" && record?.appointmentStatus === "rejected") return "close-circle";
    switch (record?.status) {
      case "checked_in": return "checkmark-circle";
      case "approved": return "checkmark-circle";
      case "pending": return "time-outline";
      case "checked_out": return "log-out";
      case "expired": return "alert-circle";
      case "rejected": return "close-circle";
      default: return "id-card";
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
            try {
              await ApiService.logout();
            } catch (error) {
              console.log("Visitor logout API error ignored:", error);
              await ApiService.clearAuth();
            } finally {
              await Storage.multiRemove([
                VISITOR_SELECTED_SECTION_KEY,
                VISITOR_APPOINTMENT_SCREEN_KEY,
                VISITOR_MAP_FLOOR_KEY,
              ]);
              if (onLogout) onLogout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={visitorDashboardStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A3D91" />
        <ActivityIndicator size="large" color="#0A3D91" />
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
    isVisitorAccessApproved(visitor);
  const isCheckedOutVisitor = String(visitor?.status || "").toLowerCase() === "checked_out";
  const canRequestNewAppointment =
    visitor?.approvalStatus === "approved" &&
    !isApprovedVisitor &&
    !isPendingStaffReview &&
    visitor?.status !== "checked_in";
  const canCreateFreshAppointment =
    !visitor &&
    String(currentUser?.role || "").toLowerCase() === "visitor" &&
    String(currentUser?.status || "").toLowerCase() === "active";
  const isCompactHistoryLayout = viewportWidth <= 760;
  const approvedActionLabel = isNfcReading ? "Stop NFC" : "Start NFC";
  const approvedActionIcon = isNfcReading ? "pause-circle" : "radio";
  const appointmentSourceRecords = [
    ...appointmentHistory,
    ...(visitor ? [visitor] : []),
  ].filter(Boolean);
  const uniqueAppointmentRecords = Array.from(
    new Map(
      appointmentSourceRecords.map((record) => [
        String(record?._id || `${record?.visitDate}-${record?.visitTime}-${record?.purposeOfVisit}`),
        record,
      ]),
    ).values(),
  ).sort((left, right) => {
    const leftDate = new Date(left?.visitTime || left?.visitDate || left?.registeredAt || 0).getTime();
    const rightDate = new Date(right?.visitTime || right?.visitDate || right?.registeredAt || 0).getTime();
    return rightDate - leftDate;
  });
  const appointmentHistoryEntries = uniqueAppointmentRecords.map((record) => {
    const recordStatusText = getAppointmentStatusText(record);
    const recordStatusColor = getAppointmentStatusColor(record);
    return {
      id: record?._id || `${record?.visitDate}-${record?.visitTime}`,
      record,
      rawStatus: String(record?.status || "").toLowerCase(),
      title: record?.purposeOfVisit || "Campus Appointment",
      office:
        record?.appointmentDepartment ||
        record?.assignedOffice ||
        record?.host ||
        "Not assigned",
      dateLabel: record?.visitDate ? formatDate(record.visitDate) : "Not scheduled",
      timeLabel: record?.visitTime ? formatTime(record.visitTime) : "Not scheduled",
      statusLabel: recordStatusText,
      statusIcon: getAppointmentStatusIcon(record),
      statusColor: recordStatusColor,
      description:
        record?.staffApprovalNote ||
        record?.staffRejectionReason ||
        record?.approvalNotes ||
        "Track the latest status of your submitted visit request here.",
    };
  });

  if (appointmentFeedback) {
    appointmentHistoryEntries.unshift({
      id: `feedback-${appointmentFeedback.date || "latest"}-${appointmentFeedback.time || "latest"}`,
      title: appointmentFeedback?.purpose || "Appointment Request",
      office: appointmentFeedback?.department || "Pending assignment",
      dateLabel: appointmentFeedback?.date || "Pending schedule",
      timeLabel: appointmentFeedback?.time || "Pending schedule",
      statusLabel: "Submitted",
      statusIcon: "paper-plane-outline",
      statusColor: "#0A3D91",
      description: appointmentFeedback?.message || "Your latest request was sent to staff for review.",
    });
  }
  const visitorDestinationInfo = getVisitorDestinationInfo(visitor);
  const visitorRouteSteps = buildVisitorRouteSteps(visitorDestinationInfo);
  const visitorDestinationMarker = {
    id: "visitor-appointment-destination",
    officeId: visitorDestinationInfo.officeId,
    floor: visitorDestinationInfo.floorId,
    label: visitorDestinationInfo.officeName,
    icon: "navigate",
    position: visitorDestinationInfo.position,
  };
  const recentAppointmentEntries = appointmentHistoryEntries.slice(0, 3);
  const approvedAppointmentCount = appointmentHistoryEntries.filter((entry) =>
    String(entry.statusLabel || "").toLowerCase().includes("approved"),
  ).length;
  const pendingAppointmentCount = appointmentHistoryEntries.filter((entry) => {
    const normalizedStatus = String(entry.statusLabel || "").toLowerCase();
    return normalizedStatus.includes("pending") || normalizedStatus.includes("review");
  }).length;
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
        : isCheckedOutVisitor
          ? "Visit Completed"
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
        ? "Your pass and NFC tools are active."
        : isCheckedOutVisitor
          ? "Your last pass is closed. Review approval history or request your next visit from the appointment module."
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
          target: "appointment",
        },
        {
          label: "Visit Time",
          value: formatTime(visitor.visitTime),
          icon: "time-outline",
          target: "appointment",
        },
        {
          label: "Purpose",
          value: visitor.purposeOfVisit || "Pending details",
          icon: "document-text-outline",
          target: "appointment",
        },
      ]
    : [
        {
          label: "Account",
          value: String(currentUser?.status || "Active").toUpperCase(),
          icon: "person-circle-outline",
          target: "account",
        },
        {
          label: "Role",
          value: "Visitor",
          icon: "id-card-outline",
          target: "account",
        },
        {
          label: "Next Step",
          value: canCreateFreshAppointment ? "Request Visit" : "Register",
          icon: "arrow-forward-circle-outline",
          target: canCreateFreshAppointment ? "appointment" : "home",
        },
      ];
  const homeQuickCategories = [
    {
      label: "Appointment",
      icon: "calendar-outline",
      accent: "#EAF3FF",
      iconColor: "#0A3D91",
      target: "appointment",
    },
    {
      label: "Campus Map",
      icon: "map-outline",
      accent: "#DCEBFF",
      iconColor: "#0B4EA2",
      target: "map",
    },
    {
      label: "Account",
      icon: "person-outline",
      accent: "#EEF5FF",
      iconColor: "#174EA6",
      target: "account",
    },
    {
      label: "Visit Pass",
      icon: "card-outline",
      accent: "#E4EAFE",
      iconColor: "#0A3D91",
      target: "home",
    },
  ];
  const appointmentScreenTabs = [
    { id: "menu", label: "Overview", icon: "apps-outline" },
    { id: "request", label: "Request", icon: "create-outline" },
    { id: "history", label: "History", icon: "time-outline" },
  ];
  const dashboardHeroAnimatedStyle = {
    opacity: dashboardHeroAnim,
    transform: [
      {
        translateY: dashboardHeroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [5, 0],
        }),
      },
    ],
  };
  const dashboardContentAnimatedStyle = {
    opacity: dashboardContentAnim,
    transform: [
      {
        translateY: dashboardContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [selectedVisitorSection === "appointment" ? 16 : 7, 0],
        }),
      },
      {
        scale: dashboardContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [selectedVisitorSection === "appointment" ? 0.985 : 0.995, 1],
        }),
      },
    ],
  };

  const renderHomeDiscoveryStrip = () => (
    <Animated.View
      style={[
        visitorDashboardStyles.homeDiscoveryShell,
        dashboardSectionResponsiveStyle,
        dashboardContentAnimatedStyle,
      ]}
    >
      <LinearGradient
        colors={["#041E42", "#0A3D91", "#1B5FC1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={visitorDashboardStyles.homeDiscoveryCard}
      >
        <View style={visitorDashboardStyles.homeDiscoverySearchRow}>
          <View style={visitorDashboardStyles.homeDiscoverySearchBar}>
            <Ionicons name="search-outline" size={18} color="#0A3D91" />
            <Text style={visitorDashboardStyles.homeDiscoverySearchText}>
              Search your visit, office, or request
            </Text>
          </View>
          <TouchableOpacity
            style={visitorDashboardStyles.homeDiscoveryAction}
            activeOpacity={0.88}
            onPress={() => handleVisitorSectionChange("appointment")}
          >
            <Ionicons name="options-outline" size={18} color="#041E42" />
          </TouchableOpacity>
        </View>

        <View style={visitorDashboardStyles.homeDiscoveryLocationWrap}>
          <Text style={visitorDashboardStyles.homeDiscoveryLocationLabel}>Current Visitor View</Text>
          <Text style={visitorDashboardStyles.homeDiscoveryLocationValue}>
            {visitor?.appointmentDepartment || visitor?.assignedOffice || "SafePass Visitor Portal"}
          </Text>
        </View>

        <View style={visitorDashboardStyles.homeDiscoveryCategoryRow}>
          {homeQuickCategories.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={visitorDashboardStyles.homeDiscoveryCategoryItem}
              activeOpacity={0.86}
              onPress={() => handleVisitorSectionChange(item.target)}
            >
              <View
                style={[
                  visitorDashboardStyles.homeDiscoveryCategoryCapsule,
                  { backgroundColor: item.accent },
                ]}
              >
                <View style={visitorDashboardStyles.homeDiscoveryCategoryIcon}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
              </View>
              <Text style={visitorDashboardStyles.homeDiscoveryCategoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderAppointmentSegmentBar = (activeScreen) => (
    <View style={visitorDashboardStyles.appointmentSegmentBar}>
      {appointmentScreenTabs.map((tab) => {
        const isActive = tab.id === activeScreen;
        const onPress =
          tab.id === "menu"
            ? () => handleAppointmentScreenNavigation("menu", "Loading appointment menu...")
            : tab.id === "request"
              ? openAppointmentRequestScreen
              : () => handleAppointmentScreenNavigation("history", "Loading appointment history...");

        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              visitorDashboardStyles.appointmentSegmentButton,
              isActive && visitorDashboardStyles.appointmentSegmentButtonActive,
            ]}
            activeOpacity={0.88}
            onPress={onPress}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={isActive ? "#FFFFFF" : "#475569"}
            />
            <Text
              style={[
                visitorDashboardStyles.appointmentSegmentText,
                isActive && visitorDashboardStyles.appointmentSegmentTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderAppointmentInsightsCard = () => (
    <View
      style={[
        visitorDashboardStyles.appointmentInsightsCard,
        dashboardSectionResponsiveStyle,
        isVisitorDarkMode && visitorDashboardStyles.darkSurfaceCard,
      ]}
    >
      <View style={visitorDashboardStyles.appointmentInsightsHeader}>
        <View>
          <Text style={visitorDashboardStyles.appointmentInsightsEyebrow}>Visitor Summary</Text>
          <Text style={[visitorDashboardStyles.appointmentInsightsTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            Appointment Snapshot
          </Text>
        </View>
        <TouchableOpacity
          style={visitorDashboardStyles.appointmentInsightsAction}
          activeOpacity={0.86}
          onPress={() => handleVisitorSectionChange("appointment")}
        >
          <Text style={visitorDashboardStyles.appointmentInsightsActionText}>Open Module</Text>
          <Ionicons name="arrow-forward-outline" size={16} color="#0A3D91" />
        </TouchableOpacity>
      </View>

      <View style={visitorDashboardStyles.appointmentInsightsGrid}>
        <View style={[visitorDashboardStyles.appointmentInsightsMetricCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <Text style={visitorDashboardStyles.appointmentInsightsMetricLabel}>Requests</Text>
          <Text style={[visitorDashboardStyles.appointmentInsightsMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {appointmentHistoryEntries.length || 0}
          </Text>
        </View>
        <View style={[visitorDashboardStyles.appointmentInsightsMetricCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <Text style={visitorDashboardStyles.appointmentInsightsMetricLabel}>Approved</Text>
          <Text style={[visitorDashboardStyles.appointmentInsightsMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {approvedAppointmentCount}
          </Text>
        </View>
        <View style={[visitorDashboardStyles.appointmentInsightsMetricCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <Text style={visitorDashboardStyles.appointmentInsightsMetricLabel}>In Review</Text>
          <Text style={[visitorDashboardStyles.appointmentInsightsMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {pendingAppointmentCount}
          </Text>
        </View>
      </View>

      <View style={[visitorDashboardStyles.appointmentInsightsStatusCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
        <View style={visitorDashboardStyles.appointmentInsightsStatusIcon}>
          <Ionicons name="sparkles-outline" size={18} color="#0A3D91" />
        </View>
        <View style={visitorDashboardStyles.appointmentInsightsStatusCopy}>
          <Text style={[visitorDashboardStyles.appointmentInsightsStatusTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {recentAppointmentEntries[0]?.statusLabel || journeyTitle}
          </Text>
          <Text style={[visitorDashboardStyles.appointmentInsightsStatusText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
            {recentAppointmentEntries[0]?.description || journeySubtitle}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderRecentAppointmentRail = () => {
    if (!recentAppointmentEntries.length) {
      return null;
    }

    return (
      <View
        style={[
          visitorDashboardStyles.recentActivityCard,
          dashboardSectionResponsiveStyle,
          isVisitorDarkMode && visitorDashboardStyles.darkSurfaceCard,
        ]}
      >
        <View style={visitorDashboardStyles.recentActivityHeader}>
          <View>
            <Text style={visitorDashboardStyles.recentActivityEyebrow}>Recent Activity</Text>
            <Text style={[visitorDashboardStyles.recentActivityTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
              Latest Appointment Trail
            </Text>
          </View>
          <TouchableOpacity
            style={visitorDashboardStyles.recentActivityAction}
            activeOpacity={0.86}
            onPress={() => {
              setSelectedVisitorSection("appointment");
              handleAppointmentScreenNavigation("history", "Loading appointment history...");
            }}
          >
            <Text style={visitorDashboardStyles.recentActivityActionText}>View all</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#0A3D91" />
          </TouchableOpacity>
        </View>

        <View style={visitorDashboardStyles.recentActivityList}>
          {recentAppointmentEntries.map((entry) => (
            <View key={entry.id} style={[visitorDashboardStyles.recentActivityItem, isVisitorDarkMode && visitorDashboardStyles.darkDividerBorder]}>
              <View
                style={[
                  visitorDashboardStyles.recentActivityStatusDot,
                  { backgroundColor: entry.statusColor },
                ]}
              />
              <View style={visitorDashboardStyles.recentActivityCopy}>
                <Text
                  style={[visitorDashboardStyles.recentActivityItemTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}
                  numberOfLines={1}
                >
                  {entry.title}
                </Text>
                <Text
                  style={[visitorDashboardStyles.recentActivityItemMeta, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}
                  numberOfLines={2}
                >
                  {entry.office} · {entry.dateLabel} · {entry.timeLabel}
                </Text>
              </View>
              <View
                style={[
                  visitorDashboardStyles.recentActivityPill,
                  { backgroundColor: `${entry.statusColor}14` },
                ]}
              >
                <Text
                  style={[
                    visitorDashboardStyles.recentActivityPillText,
                    { color: entry.statusColor },
                  ]}
                  numberOfLines={1}
                >
                  {entry.statusLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderVisitorModuleNavigation = () => (
    <View
      style={[
        visitorDashboardStyles.visitorModuleCard,
        dashboardSectionResponsiveStyle,
        isVisitorDarkMode && visitorDashboardStyles.darkSurfaceCard,
      ]}
    >
      <View style={visitorDashboardStyles.visitorModuleHeader}>
        <View>
          <Text style={visitorDashboardStyles.visitorModuleEyebrow}>About the School</Text>
          <Text style={[visitorDashboardStyles.visitorModuleTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            Plan Your Campus Visit
          </Text>
        </View>
        <View style={visitorDashboardStyles.visitorModuleHeaderBadge}>
          <Ionicons name="school-outline" size={14} color="#0A3D91" />
          <Text style={visitorDashboardStyles.visitorModuleHeaderBadgeText}>Visitor Guide</Text>
        </View>
      </View>

      <Text style={[visitorDashboardStyles.visitorModuleIntroText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
        SafePass helps visitors coordinate appointments, access campus directions, and prepare requirements before arrival.
      </Text>

      <View style={visitorDashboardStyles.visitorAboutGrid}>
        <View style={[visitorDashboardStyles.visitorAboutCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <View style={[visitorDashboardStyles.visitorAboutIconWrap, { backgroundColor: "#EEF5FF" }]}>
            <Ionicons name="calendar-clear-outline" size={18} color="#0A3D91" />
          </View>
          <Text style={[visitorDashboardStyles.visitorAboutTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Appointments</Text>
          <Text style={[visitorDashboardStyles.visitorAboutText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
            Request a schedule, wait for staff review, and track approval updates here.
          </Text>
        </View>

        <View style={[visitorDashboardStyles.visitorAboutCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <View style={[visitorDashboardStyles.visitorAboutIconWrap, { backgroundColor: "#EAF3FF" }]}>
            <Ionicons name="map-outline" size={18} color="#0B4EA2" />
          </View>
          <Text style={[visitorDashboardStyles.visitorAboutTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Campus Guide</Text>
          <Text style={[visitorDashboardStyles.visitorAboutText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
            Review the floors and offices first so you can head directly to the right destination.
          </Text>
        </View>

        <View style={[visitorDashboardStyles.visitorAboutCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <View style={[visitorDashboardStyles.visitorAboutIconWrap, { backgroundColor: "#DCEBFF" }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#174EA6" />
          </View>
          <Text style={[visitorDashboardStyles.visitorAboutTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Visit Reminders</Text>
          <Text style={[visitorDashboardStyles.visitorAboutText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
            Bring a valid ID and keep Wi-Fi or mobile data on when visiting the campus.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={visitorDashboardStyles.visitorAboutAction}
        onPress={() => handleVisitorSectionChange("map")}
        activeOpacity={0.86}
      >
        <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
        <Text style={visitorDashboardStyles.visitorAboutActionText}>Open Campus Map</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAccountPanel = () => (
    <View
      style={[
        visitorDashboardStyles.visitorFlowPanel,
        dashboardSectionResponsiveStyle,
        isCompactVisitorDashboard && visitorDashboardStyles.accountMobilePanel,
        isVisitorDarkMode && visitorDashboardStyles.darkSurfaceCard,
      ]}
    >
      <View
        style={[
          visitorDashboardStyles.visitorFlowPanelHeader,
          isCompactVisitorDashboard && visitorDashboardStyles.accountMobileHeader,
        ]}
      >
        <View style={[visitorDashboardStyles.visitorFlowPanelIcon, isCompactVisitorDashboard && visitorDashboardStyles.accountMobileHeaderIcon]}>
          <Ionicons name="person-circle-outline" size={24} color="#0A3D91" />
        </View>
        <View style={visitorDashboardStyles.visitorFlowPanelTitleWrap}>
          <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Account Management</Text>
          <Text
            style={[
              visitorDashboardStyles.visitorFlowPanelTitle,
              isCompactVisitorDashboard && visitorDashboardStyles.accountMobileTitle,
              isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText,
            ]}
          >
            Your Visitor Account
          </Text>
          <Text
            style={[
              visitorDashboardStyles.visitorFlowPanelSubtitle,
              isCompactVisitorDashboard && visitorDashboardStyles.accountMobileSubtitle,
              isVisitorDarkMode && visitorDashboardStyles.darkMutedText,
            ]}
          >
            Review your visitor details, open your profile, or sign out securely.
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#0F172A", "#1E3A8A", "#0A3D91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          visitorDashboardStyles.accountHeroCard,
          isCompactVisitorDashboard && visitorDashboardStyles.accountHeroCardMobile,
        ]}
      >
        <View style={[visitorDashboardStyles.accountHeroTopRow, isCompactVisitorDashboard && visitorDashboardStyles.accountHeroTopRowMobile]}>
          <View style={visitorDashboardStyles.accountHeroIdentity}>
            <View style={[visitorDashboardStyles.accountHeroAvatar, isCompactVisitorDashboard && visitorDashboardStyles.accountHeroAvatarMobile]}>
              <Text style={visitorDashboardStyles.accountHeroInitials}>
                {(visitor?.fullName || displayName || "Visitor")
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={visitorDashboardStyles.accountHeroCopy}>
              <Text style={[visitorDashboardStyles.accountHeroName, isCompactVisitorDashboard && visitorDashboardStyles.accountHeroNameMobile]}>
                {visitor?.fullName || displayName}
              </Text>
              <Text style={[visitorDashboardStyles.accountHeroSubtext, isCompactVisitorDashboard && visitorDashboardStyles.accountHeroSubtextMobile]}>
                Manage your visitor profile, appointment status, and secure access session.
              </Text>
            </View>
          </View>
          <View style={visitorDashboardStyles.accountHeroBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#0F172A" />
            <Text style={visitorDashboardStyles.accountHeroBadgeText}>{statusText}</Text>
          </View>
        </View>

        <View style={visitorDashboardStyles.accountStatGrid}>
          <View style={[visitorDashboardStyles.accountStatCard, isCompactVisitorDashboard && visitorDashboardStyles.accountStatCardMobile]}>
            <Text style={visitorDashboardStyles.accountStatLabel}>Role</Text>
            <Text style={visitorDashboardStyles.accountStatValue}>Visitor</Text>
          </View>
          <View style={[visitorDashboardStyles.accountStatCard, isCompactVisitorDashboard && visitorDashboardStyles.accountStatCardMobile]}>
            <Text style={visitorDashboardStyles.accountStatLabel}>Access State</Text>
            <Text style={visitorDashboardStyles.accountStatValue}>
              {visitor?.status === "checked_in" ? "On Site" : "Off Site"}
            </Text>
          </View>
          <View style={[visitorDashboardStyles.accountStatCard, isCompactVisitorDashboard && visitorDashboardStyles.accountStatCardWideMobile]}>
            <Text style={visitorDashboardStyles.accountStatLabel}>SafePass ID</Text>
            <Text style={visitorDashboardStyles.accountStatValue} numberOfLines={1}>
              {visitorSafePassId}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[visitorDashboardStyles.accountPanelCard, isCompactVisitorDashboard && visitorDashboardStyles.accountMobileCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
        <Text style={[visitorDashboardStyles.accountSectionTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
          Account Details
        </Text>
        <View style={[visitorDashboardStyles.accountPanelRow, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelRowMobile, isVisitorDarkMode && visitorDashboardStyles.darkDividerBorder]}>
          <Text style={visitorDashboardStyles.accountPanelLabel}>Full Name</Text>
          <Text style={[visitorDashboardStyles.accountPanelValue, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelValueMobile, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {visitor?.fullName || displayName}
          </Text>
        </View>
        <View style={[visitorDashboardStyles.accountPanelRow, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelRowMobile, isVisitorDarkMode && visitorDashboardStyles.darkDividerBorder]}>
          <Text style={visitorDashboardStyles.accountPanelLabel}>Email</Text>
          <Text style={[visitorDashboardStyles.accountPanelValue, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelValueMobile, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {currentUser?.email || visitor?.email || "Not available"}
          </Text>
        </View>
        <View style={[visitorDashboardStyles.accountPanelRow, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelRowMobile, isVisitorDarkMode && visitorDashboardStyles.darkDividerBorder]}>
          <Text style={visitorDashboardStyles.accountPanelLabel}>Role</Text>
          <Text style={[visitorDashboardStyles.accountPanelValue, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelValueMobile, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Visitor</Text>
        </View>
        <View style={[visitorDashboardStyles.accountPanelRow, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelRowMobile, isVisitorDarkMode && visitorDashboardStyles.darkDividerBorder]}>
          <Text style={visitorDashboardStyles.accountPanelLabel}>Status</Text>
          <Text style={[visitorDashboardStyles.accountPanelValue, isCompactVisitorDashboard && visitorDashboardStyles.accountPanelValueMobile, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={[visitorDashboardStyles.accountVisitSummaryCard, isCompactVisitorDashboard && visitorDashboardStyles.accountMobileCard, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
        <Text style={visitorDashboardStyles.accountVisitSummaryEyebrow}>Visitor Pass</Text>
        <Text style={[visitorDashboardStyles.accountVisitSummaryTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
          {journeyTitle}
        </Text>
        <Text style={[visitorDashboardStyles.accountVisitSummaryText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
          {journeySubtitle}
        </Text>

        <View style={visitorDashboardStyles.accountVisitSummaryBadge}>
          <View
            style={[
              visitorDashboardStyles.accountVisitSummaryBadgeDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text style={[visitorDashboardStyles.accountVisitSummaryBadgeText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        <View style={visitorDashboardStyles.accountVisitSummaryGrid}>
          <View style={[visitorDashboardStyles.accountVisitSummaryMetric, isVisitorDarkMode && visitorDashboardStyles.darkInsetCard]}>
            <Text style={visitorDashboardStyles.accountVisitSummaryMetricLabel}>Visit Date</Text>
            <Text style={[visitorDashboardStyles.accountVisitSummaryMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
              {visitor?.visitDate ? formatDate(visitor.visitDate) : "Not scheduled"}
            </Text>
          </View>
          <View style={[visitorDashboardStyles.accountVisitSummaryMetric, isVisitorDarkMode && visitorDashboardStyles.darkInsetCard]}>
            <Text style={visitorDashboardStyles.accountVisitSummaryMetricLabel}>Visit Time</Text>
            <Text style={[visitorDashboardStyles.accountVisitSummaryMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
              {visitor?.visitTime ? formatTime(visitor.visitTime) : "Not scheduled"}
            </Text>
          </View>
          <View style={[visitorDashboardStyles.accountVisitSummaryMetric, isVisitorDarkMode && visitorDashboardStyles.darkInsetCard]}>
            <Text style={visitorDashboardStyles.accountVisitSummaryMetricLabel}>Purpose</Text>
            <Text style={[visitorDashboardStyles.accountVisitSummaryMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
              {visitor?.purposeOfVisit || "Pending purpose"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[visitorDashboardStyles.accountActionGrid, isCompactVisitorDashboard && visitorDashboardStyles.accountActionGridMobile]}>
        <View style={[visitorDashboardStyles.accountActionCard, isCompactVisitorDashboard && visitorDashboardStyles.accountActionCardMobile, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <View style={[visitorDashboardStyles.accountActionIcon, isCompactVisitorDashboard && visitorDashboardStyles.accountActionCardMobileIcon]}>
            <Ionicons name="mail-outline" size={18} color="#0A3D91" />
          </View>
          <View style={visitorDashboardStyles.accountActionCopy}>
            <Text style={[visitorDashboardStyles.accountActionTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Verification</Text>
            <Text style={[visitorDashboardStyles.accountActionText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
              Keep your email active so appointment updates and approval notices reach you.
            </Text>
          </View>
        </View>
        <View style={[visitorDashboardStyles.accountActionCard, isCompactVisitorDashboard && visitorDashboardStyles.accountActionCardMobile, isVisitorDarkMode && visitorDashboardStyles.darkNestedCard]}>
          <View style={[visitorDashboardStyles.accountActionIcon, isCompactVisitorDashboard && visitorDashboardStyles.accountActionCardMobileIcon]}>
            <Ionicons name="document-text-outline" size={18} color="#0A3D91" />
          </View>
          <View style={visitorDashboardStyles.accountActionCopy}>
            <Text style={[visitorDashboardStyles.accountActionTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>Appointment Records</Text>
            <Text style={[visitorDashboardStyles.accountActionText, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
              Your active visit status and assigned office appear here once requests are processed.
            </Text>
          </View>
        </View>
      </View>

      <View style={visitorDashboardStyles.accountButtonDock}>
        <TouchableOpacity
          style={[visitorDashboardStyles.visitorFlowPrimaryButton, visitorDashboardStyles.accountDockPrimaryButton]}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.88}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={visitorDashboardStyles.visitorFlowPrimaryButtonText}>
            Open Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[visitorDashboardStyles.accountLogoutButton, visitorDashboardStyles.accountDockLogoutButton]}
          onPress={handleLogout}
          activeOpacity={0.88}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={visitorDashboardStyles.accountLogoutButtonText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomNavigation = () => (
    <View style={visitorDashboardStyles.bottomNavShell}>
      <View style={[visitorDashboardStyles.bottomNavBar, isVisitorDarkMode && visitorDashboardStyles.darkBottomNavBar]}>
        {VISITOR_MODULES.map((module) => {
          const isActive = selectedVisitorSection === module.id;

          return (
            <TouchableOpacity
              key={module.id}
              style={[
                visitorDashboardStyles.bottomNavItem,
                isActive && visitorDashboardStyles.bottomNavItemActive,
              ]}
              onPress={() => handleVisitorSectionChange(module.id)}
              activeOpacity={0.9}
            >
              <Ionicons
                name={module.icon}
                size={20}
                color={isActive ? "#FFFFFF" : isVisitorDarkMode ? "#CBD5E1" : "#64748B"}
              />
              <Text
                style={[
                  visitorDashboardStyles.bottomNavLabel,
                  isVisitorDarkMode && visitorDashboardStyles.darkBottomNavLabel,
                  isActive && visitorDashboardStyles.bottomNavLabelActive,
                ]}
              >
                {module.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const sectionIntro = {
    home: {
      eyebrow: "Visitor Workspace",
      title: "Home",
      subtitle:
        "Check your approval progress, prepare your next visit, and access your active pass in one place.",
      icon: "grid-outline",
      accent: "#0A3D91",
      accentSoft: "#EAF3FF",
      badge: "Overview",
      highlights: ["Live status", "Quick actions"],
    },
    map: {
      eyebrow: "Visitor Workspace",
      title: "Campus Map",
      subtitle:
        "Review the floor layout before arrival so you know exactly where to go on site.",
      icon: "map-outline",
      accent: "#0B4EA2",
      accentSoft: "#EAF3FF",
      badge: "Guide",
      highlights: ["Floor views", "Office guide"],
    },
    appointment: {
      eyebrow: "Visitor Workspace",
      title: "Appointment",
      subtitle:
        "Create a visit request and track whether it is pending, approved, or rejected.",
      icon: "calendar-outline",
      accent: "#0A3D91",
      accentSoft: "#EEF5FF",
      badge: "Schedule",
      highlights: ["Request visit", "Track progress"],
    },
    account: {
      eyebrow: "Visitor Workspace",
      title: "Account Management",
      subtitle:
        "Review your visitor account details, open your profile, and manage your sign-in session securely.",
      icon: "person-circle-outline",
      accent: "#174EA6",
      accentSoft: "#EAF3FF",
      badge: "Profile",
      highlights: ["Visitor info", "Access tools"],
    },
  }[selectedVisitorSection];

  const visitorPresentedIdLabel = visitor?.idType || visitor?.idNumber || "Not provided";
  const visitorSafePassId =
    visitor?.nfcCardId ||
    currentUser?.nfcCardId ||
    visitor?.safePassId ||
    currentUser?.safePassId ||
    "Assigned on account creation";

  const renderSectionIntro = () => (
    <View
      style={[
        visitorDashboardStyles.sectionIntroCard,
        dashboardSectionResponsiveStyle,
        { backgroundColor: sectionIntro.accentSoft },
      ]}
    >
      <View style={visitorDashboardStyles.sectionIntroTopRow}>
        <View
          style={[
            visitorDashboardStyles.sectionIntroIconWrap,
            { backgroundColor: `${sectionIntro.accent}18` },
          ]}
        >
          <Ionicons name={sectionIntro.icon} size={20} color={sectionIntro.accent} />
        </View>
        <View
          style={[
            visitorDashboardStyles.sectionIntroBadge,
            { backgroundColor: `${sectionIntro.accent}12` },
          ]}
        >
          <Text style={[visitorDashboardStyles.sectionIntroBadgeText, { color: sectionIntro.accent }]}>
            {sectionIntro.badge}
          </Text>
        </View>
      </View>

      <View style={visitorDashboardStyles.sectionIntroCopy}>
        <Text style={[visitorDashboardStyles.sectionIntroEyebrow, { color: sectionIntro.accent }]}>
          {sectionIntro.eyebrow}
        </Text>
        <Text style={visitorDashboardStyles.sectionIntroTitle}>{sectionIntro.title}</Text>
        <Text style={visitorDashboardStyles.sectionIntroSubtitle}>{sectionIntro.subtitle}</Text>
      </View>

      <View style={visitorDashboardStyles.sectionIntroHighlightRow}>
        {sectionIntro.highlights.map((item) => (
          <View key={item} style={visitorDashboardStyles.sectionIntroHighlightPill}>
            <View
              style={[
                visitorDashboardStyles.sectionIntroHighlightDot,
                { backgroundColor: sectionIntro.accent },
              ]}
            />
            <Text style={visitorDashboardStyles.sectionIntroHighlightText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderVisitorEmptyState = () => (
    <View style={visitorDashboardStyles.emptyState}>
      <View style={visitorDashboardStyles.emptyIconContainer}>
        <Ionicons name="id-card-outline" size={80} color="#9CA3AF" />
      </View>
      {appointmentFeedback ? (
        <View style={visitorDashboardStyles.appointmentSuccessCard}>
          <View style={visitorDashboardStyles.appointmentSuccessHeader}>
            <View style={visitorDashboardStyles.appointmentSuccessIconWrap}>
              <Ionicons name="checkmark-circle" size={22} color="#0A3D91" />
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
        {isCheckedOutVisitor
          ? "Your Visit Is Complete"
          : canCreateFreshAppointment
            ? "Request Your Next Visit"
            : "No Active Visit Yet"}
      </Text>
      <Text style={visitorDashboardStyles.emptyText}>
        {isCheckedOutVisitor
          ? "The NFC pass for that visit is now disabled. You can review your approval trail or request another appointment when you need to return."
          : canCreateFreshAppointment
            ? "Your visitor account is already active. Submit a new preferred date, time, and purpose here instead of registering again."
            : "Your visitor account is active. Submit an appointment request so your approved pass can appear here."}
      </Text>
      <TouchableOpacity
        style={visitorDashboardStyles.registerButton}
        onPress={
          canRequestNewAppointment || canCreateFreshAppointment
            ? openAppointmentRequestScreen
            : () => navigation.navigate("VisitorRegister")
        }
      >
        <LinearGradient
          colors={["#0A3D91", "#1C6DD0"]}
          style={visitorDashboardStyles.registerGradient}
        >
          <Ionicons
            name={canRequestNewAppointment || canCreateFreshAppointment ? "calendar-outline" : "person-add"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={visitorDashboardStyles.registerButtonText}>
            {canRequestNewAppointment || canCreateFreshAppointment ? "Request Appointment" : "Register as Visitor"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderApprovedVisitorDashboard = () => (
    <>
      <View
        style={[
          visitorDashboardStyles.approvedHeroCard,
          compactApprovedHeroStyle,
          dashboardSectionResponsiveStyle,
          dashboardHeroCardResponsiveStyle,
        ]}
      >
        <LinearGradient
          colors={["#0A3D91", "#1C6DD0", "#0A3D91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[visitorDashboardStyles.approvedHeroGradient, compactApprovedGradientStyle]}
        >
          <View style={visitorDashboardStyles.approvedHeroBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#0A3D91" />
            <Text style={visitorDashboardStyles.approvedHeroBadgeText}>Approved Access</Text>
          </View>

          <View style={visitorDashboardStyles.approvedHeroHeader}>
            <View style={visitorDashboardStyles.approvedHeroAvatar}>
              <Text style={visitorDashboardStyles.approvedHeroInitials}>
                {visitor?.fullName
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase() || "VP"}
              </Text>
            </View>
            <View style={visitorDashboardStyles.approvedHeroTextWrap}>
              <Text style={visitorDashboardStyles.approvedHeroTitle}>Your SafePass Is Ready</Text>
              <Text style={visitorDashboardStyles.approvedHeroSubtitle}>
                Open your digital pass, review your schedule, and stay connected before arriving on campus.
              </Text>
            </View>
          </View>

          <View style={visitorDashboardStyles.approvedHeroFacts}>
            <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
              <Text style={visitorDashboardStyles.approvedHeroFactLabel}>Visit Date</Text>
              <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                {formatDate(visitor?.visitDate)}
              </Text>
            </View>
            <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
              <Text style={visitorDashboardStyles.approvedHeroFactLabel}>Arrival Time</Text>
              <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                {formatTime(visitor?.visitTime)}
              </Text>
            </View>
            <View style={[visitorDashboardStyles.approvedHeroFactCard, { width: approvedFactCardWidth }]}>
              <Text style={visitorDashboardStyles.approvedHeroFactLabel}>Assigned Office</Text>
              <Text style={visitorDashboardStyles.approvedHeroFactValue}>
                {visitor?.appointmentDepartment || visitor?.assignedOffice || visitor?.host || "Front Office"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={[visitorDashboardStyles.approvedActionSection, dashboardSectionResponsiveStyle]}>
        <View
          style={[
            visitorDashboardStyles.approvedSectionHeader,
            approvedSectionHeaderResponsiveStyle,
          ]}
        >
          <Text style={visitorDashboardStyles.approvedSectionTitle}>Access Tools</Text>
          <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
            Use your pass, manage your visit, and keep your arrival flow ready.
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
              colors={["#0F172A", "#041E42", "#0A3D91"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={visitorDashboardStyles.approvedVirtualNfcCardGradient}
            >
              <View style={visitorDashboardStyles.approvedVirtualNfcHeader}>
                <View>
                  <View style={visitorDashboardStyles.approvedVirtualNfcBadge}>
                    <Ionicons name="radio" size={14} color="#EEF5FF" />
                    <Text style={visitorDashboardStyles.approvedVirtualNfcBadgeText}>
                      Virtual NFC Card
                    </Text>
                  </View>
                  <Text style={visitorDashboardStyles.approvedVirtualNfcTitle}>View Access Card</Text>
                  <Text style={visitorDashboardStyles.approvedVirtualNfcSubtitle}>
                    Open your digital SafePass card and confirm check-in or check-out from this phone.
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
                <Text style={visitorDashboardStyles.approvedVirtualNfcCardLabel}>SafePass ID</Text>
                <Text style={visitorDashboardStyles.approvedVirtualNfcCardNumber}>
                  {visitorSafePassId}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={visitorDashboardStyles.approvedCompactActionsColumn}>
            <TouchableOpacity
              style={[visitorDashboardStyles.approvedCompactActionCard, { width: compactApprovedActionCardWidth }]}
              onPress={handleCheckInAction}
              activeOpacity={0.9}
              disabled={isCheckInLoading || visitor?.status === "checked_in"}
            >
              <View style={[visitorDashboardStyles.approvedCompactActionIcon, { backgroundColor: "#DCFCE7" }]}>
                {isCheckInLoading ? (
                  <ActivityIndicator size="small" color="#166534" />
                ) : (
                  <Ionicons name="log-in-outline" size={18} color="#166534" />
                )}
              </View>
              <View style={visitorDashboardStyles.approvedCompactActionCopy}>
                <Text style={visitorDashboardStyles.approvedCompactActionTitle}>
                  {visitor?.status === "checked_in" ? "Checked In" : "Check In"}
                </Text>
                <Text style={visitorDashboardStyles.approvedCompactActionText}>
                  Confirm arrival and notify security monitoring.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[visitorDashboardStyles.approvedCompactActionCard, { width: compactApprovedActionCardWidth }]}
              onPress={() => handleCheckOutAction()}
              activeOpacity={0.9}
              disabled={isCheckOutLoading || visitor?.status !== "checked_in"}
            >
              <View style={[visitorDashboardStyles.approvedCompactActionIcon, { backgroundColor: "#FEE2E2" }]}>
                {isCheckOutLoading ? (
                  <ActivityIndicator size="small" color="#B91C1C" />
                ) : (
                  <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
                )}
              </View>
              <View style={visitorDashboardStyles.approvedCompactActionCopy}>
                <Text style={visitorDashboardStyles.approvedCompactActionTitle}>Check Out</Text>
                <Text style={visitorDashboardStyles.approvedCompactActionText}>
                  Close your visit once your appointment is complete.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[visitorDashboardStyles.approvedTimelineSection, dashboardSectionResponsiveStyle]}>
        <View
          style={[
            visitorDashboardStyles.approvedSectionHeader,
            approvedSectionHeaderResponsiveStyle,
          ]}
        >
          <Text style={visitorDashboardStyles.approvedSectionTitle}>Visit Snapshot</Text>
          <Text style={visitorDashboardStyles.approvedSectionSubtitle}>
            Review your purpose, office, and key reminders before arriving.
          </Text>
        </View>

        <View style={visitorDashboardStyles.approvedSnapshotGrid}>
          <View style={visitorDashboardStyles.approvedSnapshotCard}>
            <Text style={visitorDashboardStyles.approvedSnapshotLabel}>Purpose</Text>
            <Text style={visitorDashboardStyles.approvedSnapshotValue}>
              {visitor?.purposeOfVisit || "Campus visit"}
            </Text>
          </View>
          <View style={visitorDashboardStyles.approvedSnapshotCard}>
            <Text style={visitorDashboardStyles.approvedSnapshotLabel}>ID Presented</Text>
            <Text style={visitorDashboardStyles.approvedSnapshotValue}>
              {visitorPresentedIdLabel}
            </Text>
          </View>
          <View style={visitorDashboardStyles.approvedSnapshotCard}>
            <Text style={visitorDashboardStyles.approvedSnapshotLabel}>Connectivity</Text>
            <Text style={visitorDashboardStyles.approvedSnapshotValue}>Wi-Fi or data on</Text>
          </View>
        </View>
      </View>

      {renderRecentAppointmentRail()}
    </>
  );

  const renderActiveVisitorPanel = () => {
    if (selectedVisitorSection === "home") {
      return (
        <Animated.View style={dashboardContentAnimatedStyle}>
          {visitor ? (
            isPendingApproval ? (
              <>
                <View
                  style={[
                    visitorDashboardStyles.pendingApprovalCard,
                    dashboardSectionResponsiveStyle,
                    dashboardHeroCardResponsiveStyle,
                  ]}
                >
                  <Text style={visitorDashboardStyles.pendingApprovalEyebrow}>Visitor Pass</Text>
                  <Text style={visitorDashboardStyles.pendingApprovalTitle}>{journeyTitle}</Text>
                  <Text style={visitorDashboardStyles.pendingApprovalSubtitle}>{journeySubtitle}</Text>
                  <View style={[visitorDashboardStyles.pendingApprovalBadge, { backgroundColor: `${statusColor}16` }]}>
                    <View style={[visitorDashboardStyles.pendingApprovalBadgeDot, { backgroundColor: statusColor }]} />
                    <Text style={[visitorDashboardStyles.pendingApprovalBadgeText, { color: statusColor }]}>
                      {statusText}
                    </Text>
                  </View>
                  <View style={visitorDashboardStyles.pendingApprovalGrid}>
                    <View style={visitorDashboardStyles.pendingApprovalInfoCard}>
                      <Ionicons name="calendar-clear-outline" size={18} color="#0A3D91" />
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visit Date</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>
                        {visitor?.visitDate ? formatDate(visitor.visitDate) : "Pending"}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoCard}>
                      <Ionicons name="time-outline" size={18} color="#0A3D91" />
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Visit Time</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>
                        {visitor?.visitTime ? formatTime(visitor.visitTime) : "Pending"}
                      </Text>
                    </View>
                    <View style={visitorDashboardStyles.pendingApprovalInfoCard}>
                      <Ionicons name="document-text-outline" size={18} color="#0A3D91" />
                      <Text style={visitorDashboardStyles.pendingApprovalInfoLabel}>Purpose</Text>
                      <Text style={visitorDashboardStyles.pendingApprovalInfoValue}>
                        {visitor?.purposeOfVisit || "Pending"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={visitorDashboardStyles.pendingApprovalPrimaryButton}
                    onPress={openAppointmentRequestScreen}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                    <Text style={visitorDashboardStyles.pendingApprovalPrimaryButtonText}>
                      Register Appointment
                    </Text>
                  </TouchableOpacity>
                </View>
                {renderAppointmentInsightsCard()}
                {renderVisitorModuleNavigation()}
                {renderRecentAppointmentRail()}
              </>
            ) : isApprovedVisitor ? (
              renderApprovedVisitorDashboard()
            ) : (
              <>
                {renderAppointmentInsightsCard()}
                {renderVisitorModuleNavigation()}
                {renderRecentAppointmentRail()}
                {renderVisitorEmptyState()}
              </>
            )
          ) : (
            <>
              {renderAppointmentInsightsCard()}
              {renderVisitorModuleNavigation()}
              {renderVisitorEmptyState()}
            </>
          )}
        </Animated.View>
      );
    }

    return (
      <Animated.View style={dashboardContentAnimatedStyle}>
        {selectedVisitorSection === "appointment" ? (
          isAppointmentScreenTransitioning ? renderAppointmentNavigationSplash() : (
            selectedAppointmentScreen === "request"
              ? renderAppointmentRequestPanel()
              : selectedAppointmentScreen === "history"
                ? renderAppointmentHistoryPanel()
                : renderAppointmentMenuPanel()
          )
        ) : selectedVisitorSection === "map" ? (
          renderVisitorMapPanel()
        ) : (
          renderAccountPanel()
        )}
      </Animated.View>
    );
  };

  const renderAppointmentNavigationSplash = () => (
    <View style={[visitorDashboardStyles.appointmentScreenShell, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.appointmentLoadingCard}>
        <View style={visitorDashboardStyles.appointmentLoadingIconWrap}>
          <ActivityIndicator size="small" color="#0A3D91" />
        </View>
        <Text style={visitorDashboardStyles.appointmentLoadingTitle}>Preparing Appointment Module</Text>
        <Text style={visitorDashboardStyles.appointmentLoadingText}>{appointmentTransitionLabel}</Text>
      </View>
    </View>
  );

  const renderAppointmentMenuPanel = () => (
    <View style={[visitorDashboardStyles.appointmentScreenShell, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.appointmentMenuHero}>
        <View style={visitorDashboardStyles.appointmentMenuHeroTop}>
          <View style={visitorDashboardStyles.appointmentMenuHeroCopy}>
            <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Appointment Module</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Manage Your Visit</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
              Use a cleaner flow for new requests and keep your latest appointment progress in one place.
            </Text>
          </View>
          <View style={visitorDashboardStyles.appointmentMenuHeroBadge}>
            <Text style={visitorDashboardStyles.appointmentMenuHeroBadgeText}>
              {appointmentHistoryEntries.length ? `${appointmentHistoryEntries.length} Active` : "Ready"}
            </Text>
          </View>
        </View>
        {renderAppointmentSegmentBar("menu")}
      </View>

      <View style={visitorDashboardStyles.appointmentMenuGrid}>
        <TouchableOpacity
          style={visitorDashboardStyles.appointmentMenuCard}
          activeOpacity={0.9}
          onPress={openAppointmentRequestScreen}
        >
          <View style={visitorDashboardStyles.appointmentMenuCardIcon}>
            <Ionicons name="create-outline" size={22} color="#0A3D91" />
          </View>
          <View style={visitorDashboardStyles.appointmentMenuCardChip}>
            <Text style={visitorDashboardStyles.appointmentMenuCardChipText}>Start here</Text>
          </View>
          <Text style={visitorDashboardStyles.appointmentMenuCardTitle}>Appointment Request</Text>
          <Text style={visitorDashboardStyles.appointmentMenuCardText}>
            Open the full appointment form and submit a new campus visit request.
          </Text>
          <View style={visitorDashboardStyles.appointmentMenuCardFooter}>
            <Text style={visitorDashboardStyles.appointmentMenuCardFooterText}>Purpose, office, date, time</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#0A3D91" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={visitorDashboardStyles.appointmentMenuCard}
          activeOpacity={0.9}
          onPress={() =>
            handleAppointmentScreenNavigation("history", "Loading appointment history...")
          }
        >
          <View style={visitorDashboardStyles.appointmentMenuCardIcon}>
            <Ionicons name="time-outline" size={22} color="#0A3D91" />
          </View>
          <View
            style={[
              visitorDashboardStyles.appointmentMenuCardChip,
              visitorDashboardStyles.appointmentMenuCardChipMuted,
            ]}
          >
            <Text style={visitorDashboardStyles.appointmentMenuCardChipText}>
              Latest trail
            </Text>
          </View>
          <Text style={visitorDashboardStyles.appointmentMenuCardTitle}>Appointment History</Text>
          <Text style={visitorDashboardStyles.appointmentMenuCardText}>
            Review your latest appointment details, approval progress, and request trail.
          </Text>
          <View style={visitorDashboardStyles.appointmentMenuCardFooter}>
            <Text style={visitorDashboardStyles.appointmentMenuCardFooterText}>Status, office, and timeline</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#0A3D91" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppointmentRequestPanel = () => (
    <View style={[visitorDashboardStyles.appointmentScreenShell, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.appointmentScreenCard}>
        <LinearGradient
          colors={["#FFFDF8", "#FFFFFF"]}
          style={visitorDashboardStyles.appointmentModalHeader}
        >
          <View style={visitorDashboardStyles.appointmentModalHeaderContent}>
            <View style={visitorDashboardStyles.appointmentModalHeaderCopy}>
              <Text style={visitorDashboardStyles.appointmentModalTitle}>Appointment Request</Text>
              <Text style={visitorDashboardStyles.appointmentModalSubtitle}>
                Send your preferred schedule directly to the office staff.
              </Text>
            </View>
            <View style={visitorDashboardStyles.appointmentRequestInfoPill}>
              <Ionicons name="flash-outline" size={14} color="#0A3D91" />
              <Text style={visitorDashboardStyles.appointmentRequestInfoPillText}>
                Smart form
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={closeAppointmentRequestScreen}
            style={visitorDashboardStyles.appointmentHeaderBackButton}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={visitorDashboardStyles.appointmentInlineBody}>
          {renderAppointmentSegmentBar("request")}

          {appointmentFeedback ? (
            <View style={visitorDashboardStyles.appointmentSuccessCard}>
              <View style={visitorDashboardStyles.appointmentSuccessHeader}>
                <View style={visitorDashboardStyles.appointmentSuccessIconWrap}>
                  <Ionicons name="checkmark-circle" size={22} color="#0A3D91" />
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

          <View style={visitorDashboardStyles.appointmentQuickInfoRow}>
            <View style={visitorDashboardStyles.appointmentQuickInfoCard}>
              <Text style={visitorDashboardStyles.appointmentQuickInfoLabel}>Availability</Text>
              <Text style={visitorDashboardStyles.appointmentQuickInfoValue}>3 slots / time</Text>
            </View>
            <View style={visitorDashboardStyles.appointmentQuickInfoCard}>
              <Text style={visitorDashboardStyles.appointmentQuickInfoLabel}>Days</Text>
              <Text style={visitorDashboardStyles.appointmentQuickInfoValue}>Mon - Sat</Text>
            </View>
            <View style={visitorDashboardStyles.appointmentQuickInfoCard}>
              <Text style={visitorDashboardStyles.appointmentQuickInfoLabel}>Review</Text>
              <Text style={visitorDashboardStyles.appointmentQuickInfoValue}>Staff approval</Text>
            </View>
          </View>

          <View style={visitorDashboardStyles.visitorFlowChecklist}>
            {[
              "Choose your purpose. If you select Other, type the exact reason.",
              "Select the office you want to visit and keep your chosen schedule while updating other fields.",
              "Pick your preferred date and time before sending the request.",
            ].map((item) => (
              <View key={item} style={visitorDashboardStyles.visitorFlowChecklistRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#0A3D91" />
                <Text style={visitorDashboardStyles.visitorFlowChecklistText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={visitorDashboardStyles.appointmentField}>
            <Text style={visitorDashboardStyles.appointmentFieldLabel}>Preferred Date</Text>
            <TouchableOpacity
              style={visitorDashboardStyles.appointmentPickerField}
              onPress={handleAppointmentDatePress}
              activeOpacity={0.85}
            >
              <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                  <Ionicons name="calendar-outline" size={18} color="#0A3D91" />
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
                minimumDate={getNextAvailableAppointmentDate(new Date())}
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
                  <Ionicons name="time-outline" size={18} color="#0A3D91" />
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
                    const slotInfo = getAppointmentSlotInfo(option);
                    const isFull = Boolean(slotInfo?.isFull);
                    return (
                      <TouchableOpacity
                        key={`${option.getHours()}-${option.getMinutes()}`}
                        style={[
                          visitorDashboardStyles.pickerOptionItem,
                          isSelected && visitorDashboardStyles.pickerOptionItemActive,
                          isFull && visitorDashboardStyles.pickerOptionItemDisabled,
                        ]}
                        disabled={isFull}
                        onPress={() => {
                          setHasAppointmentDraft(true);
                          setAppointmentForm((prev) => ({ ...prev, preferredTime: option }));
                          setShowAppointmentTimePicker(false);
                        }}
                      >
                        <View>
                          <Text
                            style={[
                              visitorDashboardStyles.pickerOptionText,
                              isSelected && visitorDashboardStyles.pickerOptionTextActive,
                              isFull && visitorDashboardStyles.pickerOptionTextDisabled,
                            ]}
                          >
                            {formatTime(option)}
                          </Text>
                          <Text
                            style={[
                              visitorDashboardStyles.pickerOptionMeta,
                              isFull && visitorDashboardStyles.pickerOptionMetaFull,
                            ]}
                          >
                            {getAppointmentSlotStatusText(option)}
                          </Text>
                        </View>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={18} color="#0A3D91" />
                        ) : isFull ? (
                          <Ionicons name="lock-closed-outline" size={18} color="#DC2626" />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <Text style={visitorDashboardStyles.appointmentAutoHint}>
              {isLoadingAppointmentSlots
                ? "Checking staff slot availability..."
                : appointmentAvailability?.assignedStaff
                  ? `Slots are limited to 3 visitors per time for ${appointmentAvailability.assignedStaff.name}.`
                  : "Choose an office first so we can check available staff slots."}
            </Text>
          </View>

          <View style={visitorDashboardStyles.appointmentField}>
            <Text style={visitorDashboardStyles.appointmentFieldLabel}>Office to Visit</Text>
            <TouchableOpacity
              style={visitorDashboardStyles.appointmentPickerField}
              onPress={() => {
                setShowDepartmentDropdown((current) => !current);
                setShowPurposeDropdown(false);
                setShowAppointmentDatePicker(false);
                setShowAppointmentTimePicker(false);
              }}
              activeOpacity={0.85}
            >
              <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                  <Ionicons name="business-outline" size={18} color="#0A3D91" />
                </View>
                <View>
                  <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose an office</Text>
                  <Text style={visitorDashboardStyles.appointmentPickerValue}>
                    {appointmentForm.department || "Select office to visit"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={showDepartmentDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {showDepartmentDropdown ? (
              <View style={visitorDashboardStyles.purposeDropdownMenu}>
                {activeAppointmentDepartmentOptions.map((option) => {
                  const isSelected = appointmentForm.department === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        visitorDashboardStyles.purposeOptionItem,
                        isSelected && visitorDashboardStyles.purposeOptionItemActive,
                      ]}
                      onPress={() => {
                        setHasAppointmentDraft(true);
                        setAppointmentForm((prev) => ({
                          ...prev,
                          department: option,
                        }));
                        setShowDepartmentDropdown(false);
                      }}
                      activeOpacity={0.85}
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
                        <Ionicons name="checkmark-circle" size={18} color="#0A3D91" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            <Text style={visitorDashboardStyles.appointmentAutoHint}>
              Choose the office that should review your appointment. Each staff member accepts up to 3 visitors per time slot.
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
                  <Ionicons name="list-outline" size={18} color="#0A3D91" />
                </View>
                <View>
                  <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose a purpose</Text>
                  <Text style={visitorDashboardStyles.appointmentPickerValue}>
                    {appointmentForm.purposeSelection || "Select purpose of visit"}
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
                {activeAppointmentPurposeOptions.map((option) => {
                  const isSelected = appointmentForm.purposeSelection === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        visitorDashboardStyles.purposeOptionItem,
                        isSelected && visitorDashboardStyles.purposeOptionItemActive,
                      ]}
                      onPress={() => {
                        setHasAppointmentDraft(true);
                        setAppointmentForm((prev) => ({
                          ...prev,
                          purposeSelection: option,
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
                        <Ionicons name="checkmark-circle" size={18} color="#0A3D91" />
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
                onChangeText={(text) => {
                  setHasAppointmentDraft(true);
                  setAppointmentForm((prev) => ({ ...prev, customPurpose: text }));
                }}
                multiline
                textAlignVertical="top"
              />
            ) : null}
          </View>

          <View style={visitorDashboardStyles.appointmentField}>
            <Text style={visitorDashboardStyles.appointmentFieldLabel}>Valid ID To Present</Text>
            <TouchableOpacity
              style={visitorDashboardStyles.appointmentPickerField}
              onPress={() => {
                setShowIdTypeDropdown((current) => !current);
                setShowPurposeDropdown(false);
                setShowDepartmentDropdown(false);
                setShowAppointmentDatePicker(false);
                setShowAppointmentTimePicker(false);
              }}
              activeOpacity={0.85}
            >
              <View style={visitorDashboardStyles.appointmentPickerFieldLeft}>
                <View style={visitorDashboardStyles.appointmentPickerIconWrap}>
                  <Ionicons name="card-outline" size={18} color="#0A3D91" />
                </View>
                <View>
                  <Text style={visitorDashboardStyles.appointmentPickerLabel}>Choose your ID type</Text>
                  <Text style={visitorDashboardStyles.appointmentPickerValue}>
                    {appointmentForm.idType || "Select the ID you will use"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={showIdTypeDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {showIdTypeDropdown ? (
              <View style={visitorDashboardStyles.purposeDropdownMenu}>
                {APPOINTMENT_ID_TYPE_OPTIONS.map((option) => {
                  const isSelected = appointmentForm.idType === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        visitorDashboardStyles.purposeOptionItem,
                        isSelected && visitorDashboardStyles.purposeOptionItemActive,
                      ]}
                      onPress={() => {
                        setHasAppointmentDraft(true);
                        setAppointmentForm((prev) => ({
                          ...prev,
                          idType: option,
                          idImage: prev.idType && prev.idType !== option ? null : prev.idImage,
                        }));
                        setShowIdTypeDropdown(false);
                      }}
                      activeOpacity={0.85}
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
                        <Ionicons name="checkmark-circle" size={18} color="#0A3D91" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            <Text style={visitorDashboardStyles.appointmentAutoHint}>
              Select the ID you will bring on campus. The uploaded image must match this selected ID type.
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
                <Ionicons name="refresh-outline" size={16} color="#0A3D91" />
                <Text style={visitorDashboardStyles.appointmentChangeIdText}>
                  Change ID picture
                </Text>
              </TouchableOpacity>
            ) : null}
            <Text style={visitorDashboardStyles.appointmentAutoHint}>
              Upload the same ID type you selected above. Staff or security will complete the final review.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              visitorDashboardStyles.appointmentPrivacyCard,
              appointmentForm.privacyAccepted &&
                visitorDashboardStyles.appointmentPrivacyCardAccepted,
            ]}
            onPress={() => {
              setHasAppointmentDraft(true);
              setAppointmentForm((prev) => ({
                ...prev,
                privacyAccepted: !prev.privacyAccepted,
              }));
            }}
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
              onPress={closeAppointmentRequestScreen}
              disabled={isSubmittingAppointment}
            >
              <Text style={visitorDashboardStyles.appointmentSecondaryButtonText}>Back</Text>
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
  );

  const renderAppointmentHistoryPanel = () => (
    <View style={[visitorDashboardStyles.appointmentScreenShell, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.appointmentScreenCard}>
        <View style={visitorDashboardStyles.appointmentHistoryHeader}>
          <View style={visitorDashboardStyles.appointmentHistoryHeaderCopy}>
            <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Appointment Module</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Appointment History</Text>
            <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
              Review your latest appointment details and create a new request when needed.
            </Text>
          </View>
          <TouchableOpacity
            style={visitorDashboardStyles.appointmentHistoryAction}
            activeOpacity={0.88}
            onPress={openAppointmentRequestScreen}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={visitorDashboardStyles.appointmentHistoryActionText}>New Appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={visitorDashboardStyles.appointmentHistoryBody}>
          {renderAppointmentSegmentBar("history")}

          {appointmentHistoryEntries.length ? (
            isCompactHistoryLayout ? (
              <View style={visitorDashboardStyles.appointmentHistoryCards}>
                {appointmentHistoryEntries.map((entry) => (
                  <View key={entry.id} style={visitorDashboardStyles.appointmentHistoryCardItem}>
                    <View style={visitorDashboardStyles.appointmentHistoryCardTop}>
                      <View style={visitorDashboardStyles.appointmentHistoryCardCopy}>
                        <Text style={visitorDashboardStyles.appointmentHistoryCardTitle} numberOfLines={2}>
                          {entry.title}
                        </Text>
                        <Text style={visitorDashboardStyles.appointmentHistoryCardOffice} numberOfLines={2}>
                          {entry.office}
                        </Text>
                      </View>
                      <View
                        style={[
                          visitorDashboardStyles.appointmentHistoryCardPill,
                          { backgroundColor: `${entry.statusColor}14` },
                        ]}
                      >
                        <View style={[visitorDashboardStyles.appointmentHistoryStatusDot, { backgroundColor: entry.statusColor }]} />
                        <Text
                          style={[visitorDashboardStyles.appointmentHistoryCardPillText, { color: entry.statusColor }]}
                          numberOfLines={1}
                        >
                          {entry.statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={visitorDashboardStyles.appointmentHistoryCardMetaRow}>
                      <View style={visitorDashboardStyles.appointmentHistoryCardMetaItem}>
                        <Ionicons name="calendar-outline" size={15} color="#0A3D91" />
                        <Text style={visitorDashboardStyles.appointmentHistoryCardMetaText}>
                          {entry.dateLabel}
                        </Text>
                      </View>
                      <View style={visitorDashboardStyles.appointmentHistoryCardMetaItem}>
                        <Ionicons name="time-outline" size={15} color="#0A3D91" />
                        <Text style={visitorDashboardStyles.appointmentHistoryCardMetaText}>
                          {entry.timeLabel}
                        </Text>
                      </View>
                    </View>

                    <Text style={visitorDashboardStyles.appointmentHistoryCardDescription} numberOfLines={3}>
                      {entry.description}
                    </Text>
                    {entry.rawStatus === "checked_in" ? (
                      <TouchableOpacity
                        style={visitorDashboardStyles.appointmentHistoryCheckOutButton}
                        activeOpacity={0.88}
                        onPress={() => handleCheckOutAction(entry.record)}
                        disabled={isCheckOutLoading}
                      >
                        {isCheckOutLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="log-out-outline" size={17} color="#FFFFFF" />
                        )}
                        <Text style={visitorDashboardStyles.appointmentHistoryCheckOutButtonText}>
                          Check Out This Visit
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={visitorDashboardStyles.appointmentHistoryTable}>
                <View style={visitorDashboardStyles.appointmentHistoryTableHeader}>
                  <Text style={[visitorDashboardStyles.appointmentHistoryTableHeadText, visitorDashboardStyles.appointmentHistoryPurposeCell]}>Purpose</Text>
                  <Text style={[visitorDashboardStyles.appointmentHistoryTableHeadText, visitorDashboardStyles.appointmentHistoryOfficeCell]}>Office</Text>
                  <Text style={[visitorDashboardStyles.appointmentHistoryTableHeadText, visitorDashboardStyles.appointmentHistoryDateCell]}>Date</Text>
                  <Text style={[visitorDashboardStyles.appointmentHistoryTableHeadText, visitorDashboardStyles.appointmentHistoryTimeCell]}>Time</Text>
                  <Text style={[visitorDashboardStyles.appointmentHistoryTableHeadText, visitorDashboardStyles.appointmentHistoryStatusCell]}>Status</Text>
                </View>
                {appointmentHistoryEntries.map((entry) => (
                  <View key={entry.id} style={visitorDashboardStyles.appointmentHistoryTableRow}>
                    <Text style={[visitorDashboardStyles.appointmentHistoryTableText, visitorDashboardStyles.appointmentHistoryPurposeCell]} numberOfLines={2}>
                      {entry.title}
                    </Text>
                    <Text style={[visitorDashboardStyles.appointmentHistoryTableText, visitorDashboardStyles.appointmentHistoryOfficeCell]} numberOfLines={2}>
                      {entry.office}
                    </Text>
                    <Text style={[visitorDashboardStyles.appointmentHistoryTableText, visitorDashboardStyles.appointmentHistoryDateCell]} numberOfLines={2}>
                      {entry.dateLabel}
                    </Text>
                    <Text style={[visitorDashboardStyles.appointmentHistoryTableText, visitorDashboardStyles.appointmentHistoryTimeCell]} numberOfLines={1}>
                      {entry.timeLabel}
                    </Text>
                    <View style={[visitorDashboardStyles.appointmentHistoryStatusCell, visitorDashboardStyles.appointmentHistoryStatusPillWrap]}>
                      <View style={[visitorDashboardStyles.appointmentHistoryStatusDot, { backgroundColor: entry.statusColor }]} />
                      <Text style={[visitorDashboardStyles.appointmentHistoryStatusPillText, { color: entry.statusColor }]} numberOfLines={2}>
                        {entry.statusLabel}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )
          ) : (
            <View style={visitorDashboardStyles.appointmentHistoryEmpty}>
              <Ionicons name="calendar-clear-outline" size={34} color="#94A3B8" />
              <Text style={visitorDashboardStyles.appointmentHistoryEmptyTitle}>No appointments yet</Text>
              <Text style={visitorDashboardStyles.appointmentHistoryEmptyText}>
                Your submitted and approved visit requests will appear here once you start using the appointment module.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderVisitorMapPanel = () => (
    <View style={[visitorDashboardStyles.visitorMapPanel, dashboardSectionResponsiveStyle]}>
      <View style={visitorDashboardStyles.visitorFlowPanelHeader}>
        <View style={visitorDashboardStyles.visitorFlowPanelIcon}>
          <Ionicons name="map-outline" size={22} color="#0A3D91" />
        </View>
        <View style={visitorDashboardStyles.visitorFlowPanelTitleWrap}>
          <Text style={visitorDashboardStyles.visitorFlowPanelEyebrow}>Map Module</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelTitle}>Campus Map And Directions</Text>
          <Text style={visitorDashboardStyles.visitorFlowPanelSubtitle}>
            Follow your in-app route to the office assigned for your appointment.
          </Text>
        </View>
      </View>

      <View style={visitorDashboardStyles.mapSummaryCard}>
        <View style={visitorDashboardStyles.mapSummaryHeader}>
          <View style={visitorDashboardStyles.mapSummaryIconWrap}>
            <Ionicons name="compass-outline" size={18} color="#041E42" />
          </View>
          <View style={visitorDashboardStyles.mapSummaryCopy}>
            <Text style={visitorDashboardStyles.mapSummaryTitle}>Arrival Guide</Text>
            <Text style={visitorDashboardStyles.mapSummaryText}>
              {isCheckedOutVisitor
                ? "Your completed visit is no longer shown on the live map. Request another appointment to see a new route."
                : "Review your assigned floor and route steps before arrival so you know exactly where to go."}
            </Text>
          </View>
        </View>

        <View style={visitorDashboardStyles.mapSummaryMetricRow}>
          <View style={visitorDashboardStyles.mapSummaryMetricCard}>
            <Text style={visitorDashboardStyles.mapSummaryMetricLabel}>Current Floor</Text>
            <Text style={visitorDashboardStyles.mapSummaryMetricValue}>
              {visitorDestinationInfo.floorName}
            </Text>
          </View>
          <View style={visitorDashboardStyles.mapSummaryMetricCard}>
            <Text style={visitorDashboardStyles.mapSummaryMetricLabel}>Assigned Office</Text>
            <Text style={visitorDashboardStyles.mapSummaryMetricValue}>
              {visitorDestinationInfo.officeName}
            </Text>
          </View>
        </View>
      </View>

      <View style={visitorDashboardStyles.visitorRouteCard}>
        <View style={visitorDashboardStyles.visitorRouteHeader}>
          <View style={visitorDashboardStyles.visitorRouteIconWrap}>
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
          </View>
          <View style={visitorDashboardStyles.visitorRouteHeaderCopy}>
            <Text style={visitorDashboardStyles.visitorRouteTitle}>Directions To {visitorDestinationInfo.officeName}</Text>
            <Text style={visitorDashboardStyles.visitorRouteSubtitle}>
              {visitorDestinationInfo.floorName} route based on your latest appointment.
            </Text>
          </View>
        </View>
        <View style={visitorDashboardStyles.visitorRouteSteps}>
          {(isCheckedOutVisitor
            ? ["Thank you for visiting. Your previous route has been closed after checkout."]
            : visitorRouteSteps
          ).map((step, index) => (
            <View key={`visitor-route-${index}`} style={visitorDashboardStyles.visitorRouteStepRow}>
              <View style={visitorDashboardStyles.visitorRouteStepIndex}>
                <Text style={visitorDashboardStyles.visitorRouteStepIndexText}>{index + 1}</Text>
              </View>
              <Text style={visitorDashboardStyles.visitorRouteStepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={visitorDashboardStyles.visitorFloorTabsScroll}
        contentContainerStyle={visitorDashboardStyles.visitorFloorTabsContent}
        nestedScrollEnabled
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
        selectedFloor={visitorDestinationInfo.floorId || selectedVisitorMapFloor}
        selectedOffice="all"
        destinationMarkers={isCheckedOutVisitor ? [] : [visitorDestinationMarker]}
        showVisitorMarkers={false}
        showActiveVisitorsBadge={false}
        mapBlueprints={MONITORING_MAP_BLUEPRINTS}
        mapLabels={MONITORING_MAP_LABELS}
        officePositions={MONITORING_MAP_OFFICE_POSITIONS}
        onFloorChange={setSelectedVisitorMapFloor}
        showFloorNavigation={false}
      />

      <View style={visitorDashboardStyles.visitorMapNote}>
        <Ionicons name="information-circle-outline" size={18} color="#0A3D91" />
        <Text style={visitorDashboardStyles.visitorMapNoteText}>
          Use pinch/zoom controls and drag the map to inspect the floor. The blue pin marks the office you should go to.
        </Text>
      </View>

      <TouchableOpacity
        style={visitorDashboardStyles.visitorFlowSecondaryButton}
        onPress={() => navigation.navigate("WebMapScreen", { destinationOffice: visitorDestinationInfo.officeName })}
        activeOpacity={0.86}
      >
        <Ionicons name="navigate-outline" size={18} color="#0A3D91" />
        <Text style={visitorDashboardStyles.visitorFlowSecondaryButtonText}>View Full In-App Directions</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[visitorDashboardStyles.safeArea, isVisitorDarkMode && visitorDashboardStyles.darkSafeArea]}>
      <StatusBar barStyle="light-content" backgroundColor="#061A2E" />

      {isVisitorHomeSection ? (
        <LinearGradient
          colors={["#061A2E", "#0F3A5F", "#0A3D91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[visitorDashboardStyles.header, compactHomeHeaderStyle]}
        >
          <View style={visitorDashboardStyles.headerTop}>
            <View>
              <View style={visitorDashboardStyles.homeBrandRow}>
                <View style={visitorDashboardStyles.homeBrandLogoWrap}>
                  <Image
                    source={visitorBrandLogo}
                    style={visitorDashboardStyles.homeBrandLogo}
                    resizeMode="contain"
                  />
                </View>
                <View style={visitorDashboardStyles.homeBrandCopy}>
                  <Text style={visitorDashboardStyles.homeBrandTitle}>SafePass</Text>
                  <Text style={visitorDashboardStyles.homeBrandSubtitle}>Visitor Portal</Text>
                </View>
              </View>
              <Text style={visitorDashboardStyles.greeting}>{greeting},</Text>
              <Text style={visitorDashboardStyles.userName}>
                {displayName.split(' ')[0] || 'Visitor'}!
              </Text>
              <Text style={[visitorDashboardStyles.headerSupportText, compactHomeSupportStyle]}>
                Visitor access, appointments, and campus guidance
              </Text>
            </View>
            <View style={visitorDashboardStyles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Profile")}
                style={visitorDashboardStyles.profileButton}
                activeOpacity={0.86}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.24)", "rgba(255,255,255,0.1)"]}
                  style={visitorDashboardStyles.profileGradient}
                >
                  <Text style={visitorDashboardStyles.profileInitials}>
                    {visitor?.fullName?.charAt(0) || "V"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

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
      ) : null}

      {!isVisitorHomeSection ? (
          <View style={visitorDashboardStyles.miniBrandHeaderWrap}>
          <View
            style={[
              visitorDashboardStyles.miniBrandHeader,
              {
                backgroundColor: isVisitorDarkMode ? "#0F172A" : sectionIntro.accentSoft,
                borderColor: `${sectionIntro.accent}26`,
              },
              isVisitorDarkMode && visitorDashboardStyles.darkMiniBrandHeader,
            ]}
          >
            <View style={visitorDashboardStyles.miniBrandIdentity}>
              <View
                style={[
                  visitorDashboardStyles.miniBrandLogoWrap,
                  { backgroundColor: `${sectionIntro.accent}18` },
                ]}
              >
                <Image
                  source={visitorBrandLogo}
                  style={visitorDashboardStyles.miniBrandLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={visitorDashboardStyles.miniBrandCopy}>
                <Text style={[visitorDashboardStyles.miniBrandTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>SafePass</Text>
                <Text style={[visitorDashboardStyles.miniBrandSubtitle, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
                  {sectionIntro.title}
                </Text>
              </View>
            </View>
            <View style={visitorDashboardStyles.miniBrandHeaderRight}>
              <View
                style={[
                  visitorDashboardStyles.miniBrandSectionPill,
                  { backgroundColor: `${sectionIntro.accent}14`, borderColor: `${sectionIntro.accent}24` },
                ]}
              >
                <Ionicons name={sectionIntro.icon} size={14} color={sectionIntro.accent} />
                <Text
                  style={[
                    visitorDashboardStyles.miniBrandSectionPillText,
                    { color: sectionIntro.accent },
                  ]}
                >
                  {sectionIntro.badge}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Profile")}
                style={[
                  visitorDashboardStyles.miniBrandProfileButton,
                  { backgroundColor: `${sectionIntro.accent}14`, borderColor: `${sectionIntro.accent}26` },
                ]}
                activeOpacity={0.86}
              >
                <Text
                  style={[
                    visitorDashboardStyles.miniBrandProfileText,
                    { color: sectionIntro.accent },
                  ]}
                >
                  {visitor?.fullName?.charAt(0) || "V"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <ScrollView
        ref={dashboardScrollRef}
        style={[visitorDashboardStyles.mainScrollView, isVisitorDarkMode && visitorDashboardStyles.darkMainScrollView]}
        showsVerticalScrollIndicator
        contentContainerStyle={visitorDashboardStyles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="always"
        persistentScrollbar={Platform.OS === "android"}
      >
        <View
          style={[
            visitorDashboardStyles.dashboardShell,
            isWideVisitorDashboard && visitorDashboardStyles.dashboardShellWide,
            dashboardShellResponsiveStyle,
          ]}
        >
          <Animated.View
            style={[
              visitorDashboardStyles.commandDeckAnimatedWrap,
              dashboardHeroAnimatedStyle,
            ]}
          >
          <View
            style={[
              visitorDashboardStyles.commandDeckCard,
              !isVisitorHomeSection && visitorDashboardStyles.commandDeckCardInline,
              compactCommandDeckStyle,
              dashboardCardResponsiveStyle,
              isVisitorDarkMode && visitorDashboardStyles.darkSurfaceCard,
            ]}
          >
            <View style={[visitorDashboardStyles.commandDeckHeader, isWideVisitorDashboard && visitorDashboardStyles.commandDeckHeaderWide]}>
              <View style={visitorDashboardStyles.commandDeckTitleWrap}>
                <Text style={[visitorDashboardStyles.commandDeckTitle, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]}>
                  {journeyTitle}
                </Text>
                <Text style={[visitorDashboardStyles.commandDeckSubtitle, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]}>
                  {journeySubtitle}
                </Text>
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
                <TouchableOpacity
                  key={item.label}
                  style={[
                    visitorDashboardStyles.commandMetricCard,
                    { width: compactCommandMetricCardWidth },
                    isVisitorDarkMode && visitorDashboardStyles.darkNestedCard,
                  ]}
                  onPress={() => item.target && handleVisitorSectionChange(item.target)}
                  activeOpacity={0.86}
                >
                  <View style={visitorDashboardStyles.commandMetricIcon}>
                    <Ionicons name={item.icon} size={16} color="#0A3D91" />
                  </View>
                  <Text style={[visitorDashboardStyles.commandMetricLabel, isVisitorDarkMode && visitorDashboardStyles.darkMutedText]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[visitorDashboardStyles.commandMetricValue, isVisitorDarkMode && visitorDashboardStyles.darkPrimaryText]} numberOfLines={1}>
                    {item.value}
                  </Text>
                </TouchableOpacity>
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
                    color={phoneTrackingStatus.active ? "#0A3D91" : "#B45309"}
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
                  onPress={() => handleVisitorSectionChange("appointment")}
                  activeOpacity={0.9}
                >
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                  <Text style={visitorDashboardStyles.commandPrimaryButtonText}>
                    {isApprovedVisitor ? "Register Another Appointment" : "Register Appointment"}
                  </Text>
                </TouchableOpacity>

              </View>
            ) : null}
          </View>
          </Animated.View>

          {!isVisitorHomeSection ? (
            <Animated.View style={dashboardContentAnimatedStyle}>
              {renderSectionIntro()}
            </Animated.View>
          ) : null}
          {renderActiveVisitorPanel()}
        </View>
      </ScrollView>

      {visitorPushNotice ? (
        <TouchableOpacity
          style={[
            visitorDashboardStyles.visitorPushNotice,
            visitorPushNotice.type === "success" && visitorDashboardStyles.visitorPushNoticeSuccess,
          ]}
          activeOpacity={0.92}
          onPress={() => setVisitorPushNotice(null)}
        >
          <View style={visitorDashboardStyles.visitorPushNoticeIcon}>
            <Ionicons
              name={visitorPushNotice.type === "success" ? "checkmark-circle" : "notifications-outline"}
              size={18}
              color="#0A3D91"
            />
          </View>
          <View style={visitorDashboardStyles.visitorPushNoticeCopy}>
            <Text style={visitorDashboardStyles.visitorPushNoticeTitle}>
              {visitorPushNotice.title}
            </Text>
            <Text style={visitorDashboardStyles.visitorPushNoticeText}>
              {visitorPushNotice.message}
            </Text>
          </View>
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      ) : null}

      {renderBottomNavigation()}

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
              colors={["#0F172A", "#041E42", "#0A3D91"]}
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
                  Use this phone as your virtual SafePass card for check-in and check-out.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowVirtualNfcModal(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView
              style={visitorDashboardStyles.virtualNfcModalScroll}
              contentContainerStyle={[
                visitorDashboardStyles.virtualNfcModalBody,
                isCompactVirtualCardView && visitorDashboardStyles.virtualNfcModalBodyCompact,
              ]}
              showsVerticalScrollIndicator={false}
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
                    colors={["#0F172A", "#041E42", "#0A3D91"]}
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
                          <ActivityIndicator size="small" color="#EEF5FF" />
                        ) : (
                          <Ionicons name="radio" size={16} color="#EEF5FF" />
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
                        {visitorSafePassId}
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
                          Use This Virtual Card
                        </Text>
                        <Text style={visitorDashboardStyles.virtualNfcTapHintText}>
                          The system will check you in or out from this phone based on your current visit status.
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
                  "Use the card view above to confirm your approved visitor details before continuing.",
                  "Confirm from this phone to process campus entry or exit.",
                  "Security and admin monitoring will record the virtual card event automatically.",
                ].map((item) => (
                  <View key={item} style={visitorDashboardStyles.virtualNfcInfoRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#0A3D91" />
                    <Text style={visitorDashboardStyles.virtualNfcInfoText}>{item}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

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
                    <Ionicons name={isNfcReading ? "pause-circle-outline" : "log-in-outline"} size={18} color="#FFFFFF" />
                    <Text style={visitorDashboardStyles.virtualNfcPrimaryButtonText}>
                      {isNfcReading ? "Stop NFC" : "Use Virtual Card"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
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
              colors={["#0A3D91", "#1C6DD0", "#0A3D91"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={visitorDashboardStyles.accessFlowHero}
            >
              <View style={visitorDashboardStyles.accessFlowHeroTop}>
                <View style={visitorDashboardStyles.accessFlowHeroBadge}>
                  <Ionicons name="log-in-outline" size={15} color="#0A3D91" />
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

            <ScrollView
              style={visitorDashboardStyles.accessFlowScroll}
              contentContainerStyle={visitorDashboardStyles.accessFlowBody}
              showsVerticalScrollIndicator={false}
            >
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
                    <Ionicons name="shield-checkmark-outline" size={14} color="#0A3D91" />
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
                      <Ionicons name="checkmark" size={12} color="#0A3D91" />
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
            </ScrollView>
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
              <Ionicons name="checkmark-circle" size={54} color="#0A3D91" />
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
              <Ionicons name="checkmark-circle" size={54} color="#0A3D91" />
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
        onRequestClose={() => {
          setShowCheckOutModal(false);
          setCheckOutTargetVisitor(null);
        }}
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
                <TouchableOpacity
                  onPress={() => {
                    setShowCheckOutModal(false);
                    setCheckOutTargetVisitor(null);
                  }}
                >
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
                    {(checkOutTargetVisitor || visitor)?.fullName || "Visitor"}
                  </Text>
                </View>
                <View style={visitorDashboardStyles.accessFlowSummaryRow}>
                  <Text style={visitorDashboardStyles.accessFlowSummaryLabel}>Status</Text>
                  <Text style={visitorDashboardStyles.accessFlowSummaryValue}>Checked In</Text>
                </View>
                <View style={visitorDashboardStyles.accessFlowSummaryRow}>
                  <Text style={visitorDashboardStyles.accessFlowSummaryLabel}>Visit Schedule</Text>
                  <Text style={visitorDashboardStyles.accessFlowSummaryValue}>
                    {formatDate((checkOutTargetVisitor || visitor)?.visitDate)} at {formatTime((checkOutTargetVisitor || visitor)?.visitTime)}
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
                  onPress={() => {
                    setShowCheckOutModal(false);
                    setCheckOutTargetVisitor(null);
                  }}
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
              Thank you for visiting. Your visit has been completed and you have been removed from active monitoring.
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
              colors={['#0A3D91', '#1C6DD0']}
              style={visitorDashboardStyles.qrModalHeader}
            >
              <Text style={visitorDashboardStyles.qrModalTitle}>Your Visitor Pass</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={visitorDashboardStyles.qrContainer}>
              <View style={visitorDashboardStyles.qrPlaceholder}>
                <Ionicons name="qr-code" size={180} color="#0A3D91" />
              </View>
              <Text style={visitorDashboardStyles.qrVisitorName}>{visitor?.fullName}</Text>
              <Text style={visitorDashboardStyles.qrVisitorId}>ID Used: {visitorPresentedIdLabel}</Text>
              
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
                  Show this visitor pass at the security gate
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
