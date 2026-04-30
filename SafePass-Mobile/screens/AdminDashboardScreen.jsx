import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
  Switch,
  Image,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import ApiService from "../utils/ApiService";
import SharedMonitoringMap from "../components/SharedMonitoringMap";
import { printRecordsTable, printUserList } from "../utils/printUtils";
import {
  MONITORING_MAP_BLUEPRINTS,
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";
import {
  PHILIPPINE_MOBILE_NUMBER_MESSAGE,
  isValidPhilippineMobileNumber,
  normalizePhilippineMobileNumber,
} from "../utils/phoneValidation";
import styles from "../styles/AdminDashboardStyles";

const { width, height } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const Storage = Platform.OS === "web"
  ? require("../utils/webStorage").default
  : require("@react-native-async-storage/async-storage").default;

const HoverBubble = ({ children, style, hoverScale = 1.05, onPress, ...props }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = useCallback((toValue) => {
    if (Platform.OS !== "web") return;
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  }, [scale]);

  return (
    <AnimatedPressable
      {...props}
      onPress={onPress}
      onHoverIn={() => animateScale(hoverScale)}
      onHoverOut={() => animateScale(1)}
      onMouseEnter={() => animateScale(hoverScale)}
      onMouseLeave={() => animateScale(1)}
      style={[
        style,
        Platform.OS === "web" && styles.hoverBubble,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};

const STAFF_DEPARTMENT_OPTIONS = [
  { value: "Admissions", label: "Admissions", area: "Ground Floor" },
  { value: "Lobby", label: "Lobby / Front Desk", area: "Ground Floor" },
  { value: "Cashier", label: "Cashier", area: "Ground Floor" },
  { value: "Registrar", label: "Registrar", area: "Ground Floor" },
  { value: "Accounting", label: "Accounting", area: "Ground Floor" },
  { value: "File Room", label: "File Room", area: "Ground Floor" },
  { value: "Ground Offices", label: "Offices", area: "Ground Floor" },
  { value: "Kitchen", label: "Kitchen", area: "Ground Floor" },
  { value: "Guidance", label: "Guidance", area: "Ground Floor" },
  { value: "Conference Room", label: "Conference Room", area: "Mezzanine" },
  { value: "Chairman", label: "Chairman", area: "Mezzanine" },
  { value: "Flight Operations", label: "Flight Operations", area: "Mezzanine" },
  { value: "Training", label: "Head of Training Room", area: "Mezzanine" },
  { value: "I.T Room", label: "I.T Room", area: "Mezzanine" },
  { value: "Faculty Room", label: "Faculty Room", area: "Mezzanine" },
  { value: "Administration", label: "Administration", area: "Mezzanine" },
  { value: "STO", label: "STO", area: "Mezzanine" },
  { value: "Mock Up", label: "Mock Up", area: "Second Floor" },
  { value: "Laboratory", label: "Laboratory", area: "Second Floor" },
  { value: "TESDA", label: "TESDA", area: "Second Floor" },
  { value: "Workshop", label: "Workshop", area: "Third Floor" },
  { value: "Tools Room", label: "Tools Room", area: "Third Floor" },
  { value: "Library", label: "Library", area: "Third Floor" },
  { value: "Student Services", label: "Students Lounge", area: "Third Floor" },
];

const STAFF_OFFICER_OPTIONS_BY_DEPARTMENT = {
  Admissions: [
    { value: "Admissions Officer", label: "Admissions Officer" },
    { value: "Front Desk Officer", label: "Front Desk Officer" },
  ],
  Lobby: [
    { value: "Front Desk Officer", label: "Front Desk Officer" },
    { value: "Visitor Assistance Officer", label: "Visitor Assistance Officer" },
  ],
  Cashier: [
    { value: "Cashier", label: "Cashier" },
    { value: "Payment Officer", label: "Payment Officer" },
  ],
  Registrar: [
    { value: "Registrar Officer", label: "Registrar Officer" },
    { value: "Records Officer", label: "Records Officer" },
  ],
  Accounting: [
    { value: "Accounting Officer", label: "Accounting Officer" },
    { value: "Cashier", label: "Cashier" },
  ],
  Guidance: [
    { value: "Guidance Officer", label: "Guidance Officer" },
    { value: "Student Services Officer", label: "Student Services Officer" },
  ],
  "File Room": [
    { value: "Records Officer", label: "Records Officer" },
    { value: "Document Custodian", label: "Document Custodian" },
  ],
  "Ground Offices": [
    { value: "Administrative Officer", label: "Administrative Officer" },
    { value: "Office Coordinator", label: "Office Coordinator" },
  ],
  Kitchen: [
    { value: "Kitchen Staff", label: "Kitchen Staff" },
    { value: "Facilities Support", label: "Facilities Support" },
  ],
  "Conference Room": [
    { value: "Meeting Coordinator", label: "Meeting Coordinator" },
    { value: "Administrative Assistant", label: "Administrative Assistant" },
  ],
  Chairman: [
    { value: "Chairman", label: "Chairman" },
    { value: "Executive Assistant", label: "Executive Assistant" },
  ],
  "Flight Operations": [
    { value: "Flight Operations Officer", label: "Flight Operations Officer" },
    { value: "Operations Coordinator", label: "Operations Coordinator" },
  ],
  Training: [
    { value: "Training Officer", label: "Training Officer" },
    { value: "Training Coordinator", label: "Training Coordinator" },
  ],
  "I.T Room": [
    { value: "I.T Officer", label: "I.T Officer" },
    { value: "Technical Support Officer", label: "Technical Support Officer" },
  ],
  "Faculty Room": [
    { value: "Faculty Officer", label: "Faculty Officer" },
    { value: "Faculty Coordinator", label: "Faculty Coordinator" },
  ],
  Administration: [
    { value: "Administrative Officer", label: "Administrative Officer" },
    { value: "Academy Director", label: "Academy Director" },
  ],
  STO: [
    { value: "STO Officer", label: "STO Officer" },
    { value: "Safety Training Officer", label: "Safety Training Officer" },
  ],
  "Mock Up": [
    { value: "Mock Up Instructor", label: "Mock Up Instructor" },
    { value: "Training Assistant", label: "Training Assistant" },
  ],
  Laboratory: [
    { value: "Laboratory Instructor", label: "Laboratory Instructor" },
    { value: "Laboratory Custodian", label: "Laboratory Custodian" },
  ],
  TESDA: [
    { value: "TESDA Coordinator", label: "TESDA Coordinator" },
    { value: "Assessment Officer", label: "Assessment Officer" },
  ],
  Workshop: [
    { value: "Workshop Instructor", label: "Workshop Instructor" },
    { value: "Workshop Supervisor", label: "Workshop Supervisor" },
  ],
  "Tools Room": [
    { value: "Tools Custodian", label: "Tools Custodian" },
    { value: "Maintenance Staff", label: "Maintenance Staff" },
  ],
  Library: [
    { value: "Librarian", label: "Librarian" },
    { value: "Library Assistant", label: "Library Assistant" },
  ],
  "Student Services": [
    { value: "Student Services Officer", label: "Student Services Officer" },
    { value: "Lounge Coordinator", label: "Lounge Coordinator" },
  ],
};

const ADMIN_MODULE_FLOORS = [
  { id: "ground", name: "Ground Floor", icon: "home-outline" },
  { id: "first", name: "Mezzanine", icon: "arrow-up-outline" },
  { id: "second", name: "Second Floor", icon: "business-outline" },
  { id: "third", name: "Third Floor", icon: "layers-outline" },
];

const DEFAULT_DATA_COLLECTION_FIELDS = [
  { id: "full-name", label: "Full Name", type: "text", required: true, enabled: true, scope: "visitor" },
  { id: "email-address", label: "Email Address", type: "email", required: true, enabled: true, scope: "visitor" },
  { id: "phone-number", label: "Phone Number", type: "tel", required: true, enabled: true, scope: "visitor" },
  { id: "purpose-of-visit", label: "Purpose of Visit", type: "text", required: true, enabled: true, scope: "visitor" },
  { id: "office-destination", label: "Office Destination", type: "select", required: true, enabled: true, scope: "visitor" },
];

const normalizeTextToId = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;

const DEFAULT_APPOINTMENT_MANAGEMENT_OPTIONS = {
  offices: [
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
  ].map((label) => ({ id: `office-${normalizeTextToId(label)}`, label, enabled: true })),
  purposes: ["Enrollment", "Payment", "Inquiry", "Document Request", "Other"].map((label) => ({
    id: `purpose-${normalizeTextToId(label)}`,
    label,
    enabled: true,
  })),
  timeSlots: [],
};

for (let hour = 7; hour <= 18; hour += 1) {
  for (const minute of [0, 30]) {
    const hour12 = hour % 12 || 12;
    const suffix = hour >= 12 ? "PM" : "AM";
    DEFAULT_APPOINTMENT_MANAGEMENT_OPTIONS.timeSlots.push({
      id: `slot-${String(hour).padStart(2, "0")}-${String(minute).padStart(2, "0")}`,
      label: `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`,
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      hour,
      minute,
      enabled: true,
    });
  }
}

const ROOM_STORAGE_KEY = "adminManagedRooms";
const ROOM_POSITION_STORAGE_KEY = "adminManagedRoomPositions";
const DATA_FIELDS_STORAGE_KEY = "adminDynamicDataFields";

const FLOOR_VIEW_TO_ID = {
  "map-ground": "ground",
  "map-mezzanine": "first",
  "map-second": "second",
  "map-third": "third",
};

const createRoomDraft = (floor = "ground") => ({
  id: "",
  name: "",
  floor,
  icon: "business-outline",
  x: "50",
  y: "50",
});

const createFieldDraft = () => ({
  id: "",
  label: "",
  type: "text",
  required: false,
  enabled: true,
  scope: "visitor",
});

const storageGetItem = async (key) => {
  if (Storage && typeof Storage.getItem === "function") {
    return Storage.getItem(key);
  }
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
};

const storageSetItem = async (key, value) => {
  if (Storage && typeof Storage.setItem === "function") {
    return Storage.setItem(key, value);
  }
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
};

const storageRemoveItem = async (key) => {
  if (Storage && typeof Storage.removeItem === "function") {
    return Storage.removeItem(key);
  }
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
  }
};

const storageMultiRemove = async (keys) => {
  if (Storage && typeof Storage.multiRemove === "function") {
    return Storage.multiRemove(keys);
  }
  await Promise.all((keys || []).map((key) => storageRemoveItem(key)));
};

const storageClear = async () => {
  if (Storage && typeof Storage.clear === "function") {
    return Storage.clear();
  }
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear();
  }
};

// Helper Functions
const formatDateTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour ago`;
  if (diffDays < 7) return `${diffDays} day ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFilterDateLabel = (date) => {
  if (!date) return "Pick Date";
  const resolvedDate = new Date(date);
  if (Number.isNaN(resolvedDate.getTime())) return "Pick Date";
  return resolvedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getGeneratedEmployeeIdPreview = () => `${new Date().getFullYear()}-******`;

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return { bg: "#FEF3C7", text: "#D97706", label: "PENDING" };
    case "approved":
      return { bg: "#EEF5FF", text: "#0A3D91", label: "APPROVED" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#DC2626", label: "REJECTED" };
    case "checked_in":
      return { bg: "#EEF5FF", text: "#0A3D91", label: "CHECKED IN" };
    case "checked_out":
      return { bg: "#E5E7EB", text: "#6B7280", label: "CHECKED OUT" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", label: "UNKNOWN" };
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "#1B4F72";
    case "staff":
      return "#2980B9";
    case "guard":
      return "#E67E22";
    case "security":
      return "#1C6DD0";
    case "visitor":
      return "#2ECC71";
    default:
      return "#7F8C8D";
  }
};

const getRoleIcon = (role) => {
  switch (role) {
    case "admin":
      return "airplane-outline";
    case "staff":
      return "school-outline";
    case "guard":
      return "shield-outline";
    case "security":
      return "shield-checkmark-outline";
    case "visitor":
      return "person-outline";
    default:
      return "person-circle-outline";
  }
};

const isSecurityRole = (role) => role === "security" || role === "guard";

const isUserActive = (user) => {
  if (!user) return false;
  if (user.status) return user.status === "active";
  return user.isActive === true;
};

const formatRoleLabel = (role) => {
  if (isSecurityRole(role)) return "Security";
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getUserInitials = (user) => {
  const first = String(user?.firstName || "").trim().charAt(0);
  const last = String(user?.lastName || "").trim().charAt(0);
  return `${first}${last}`.trim().toUpperCase() || "U";
};

const getRequestStatus = (request) => {
  if (!request) return "unknown";
  const requestCategory = String(request.requestCategory || "").toLowerCase();
  const appointmentStatus = String(request.appointmentStatus || "").toLowerCase();
  const approvalStatus = String(request.approvalStatus || "").toLowerCase();
  const visitStatus = String(request.status || "").toLowerCase();

  if (requestCategory === "appointment") {
    if (appointmentStatus === "pending") return "pending";
    if (appointmentStatus === "rejected") return "rejected";
    if (appointmentStatus === "approved" || appointmentStatus === "adjusted") {
      return "approved";
    }
  }

  if (approvalStatus === "pending" || visitStatus === "pending") return "pending";
  if (approvalStatus === "rejected" || visitStatus === "rejected") return "rejected";
  if (approvalStatus === "approved" || ["approved", "checked_in", "checked_out"].includes(visitStatus)) {
    return "approved";
  }

  return approvalStatus || visitStatus || "unknown";
};

const AdminSectionShell = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  isDarkMode,
  theme,
}) => (
  <View
    style={[
      styles.adminSectionShell,
      {
        backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
        borderColor: theme.borderColor,
      },
    ]}
  >
    <View style={styles.adminSectionShellHeader}>
      <View style={styles.adminSectionShellCopy}>
        <View style={styles.adminSectionShellTitleRow}>
          <Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>{title}</Text>
          {badge ? (
            <View
              style={[
                styles.adminSectionShellBadge,
                {
                  backgroundColor: isDarkMode ? "#0F172A" : "#EFF6FF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.adminSectionShellBadgeText,
                  { color: isDarkMode ? "#B7D5F6" : "#041E42" },
                ]}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkTextSecondary]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? <View style={styles.adminSectionShellActions}>{actions}</View> : null}
    </View>
    {children}
  </View>
);

const AdminFeedbackBanner = ({ notice, isDarkMode, theme, onDismiss }) => {
  if (!notice) return null;

  const palette =
    notice.type === "success"
      ? { background: isDarkMode ? "#052E16" : "#EEF5FF", border: "#86EFAC", icon: "#16A34A" }
      : notice.type === "error"
        ? { background: isDarkMode ? "#450A0A" : "#FEF2F2", border: "#FECACA", icon: "#DC2626" }
        : { background: isDarkMode ? "#082F49" : "#EFF6FF", border: "#B7D5F6", icon: "#0A3D91" };

  return (
    <View
      style={[
        styles.adminFeedbackBanner,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={[styles.adminFeedbackAccent, { backgroundColor: palette.icon }]} />
      <Ionicons
        name={notice.type === "error" ? "alert-circle-outline" : "checkmark-circle-outline"}
        size={20}
        color={palette.icon}
      />
      <View style={styles.adminFeedbackCopy}>
        <Text style={[styles.adminFeedbackTitle, { color: theme.textPrimary }]}>
          {notice.title}
        </Text>
        {notice.message ? (
          <Text style={[styles.adminFeedbackMessage, { color: theme.textSecondary }]}>
            {notice.message}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.adminFeedbackDismiss}>
        <Ionicons name="close" size={16} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const ADMIN_MAP_FLOORS = ADMIN_MODULE_FLOORS;
const LIVE_MAP_REFRESH_INTERVAL_MS = 5000;
const ADMIN_MAP_ACTIVITY_TYPES = new Set([
  "visitor_registration_request",
  "visitor_appointment_request",
  "admin_approved_registration",
  "admin_rejected_registration",
  "staff_approved_appointment",
  "staff_adjusted_appointment",
  "staff_rejected_appointment",
  "staff_completed_appointment",
  "security_checkin",
  "visitor_self_checkin",
  "security_checkout",
  "visitor_self_checkout",
]);

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeMonitoringFloor = (floorId) => (floorId === "mezzanine" ? "first" : floorId);

const getMapTrackingSourceLabel = (item) => {
  const source = String(
    item?.trackingSource ||
      item?.location?.source ||
      item?.sourceVisitor?.currentLocation?.source ||
      "",
  ).toLowerCase();

  if (source.includes("phone")) return "Phone GPS";
  if (source.includes("arduino") || source.includes("tap") || source.includes("nfc")) return "Tap checkpoint";
  if (source.includes("manual")) return "Manual update";
  if (source.includes("estimate")) return "Estimated location";
  return "Tracking update";
};

const getMapFreshnessLabel = (dateValue) => {
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return "No recent update";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 45) return "Live now";
  if (diffSeconds < 180) return `${Math.max(1, Math.floor(diffSeconds / 60))}m ago`;
  if (diffSeconds < 900) return `${Math.floor(diffSeconds / 60)}m ago`;
  return "Stale update";
};

const getActivityLabel = (activityType) => {
  switch (activityType) {
    case "visitor_appointment_request":
      return "Appointment Request";
    case "visitor_account_registration":
      return "Visitor Account";
    case "admin_approved_registration":
      return "Admin Approval";
    case "admin_rejected_registration":
      return "Admin Rejection";
    case "staff_approved_appointment":
      return "Staff Approval";
    case "staff_adjusted_appointment":
      return "Time Adjusted";
    case "staff_rejected_appointment":
      return "Staff Rejection";
    case "staff_completed_appointment":
      return "Appointment Complete";
    case "security_checkin":
    case "visitor_self_checkin":
      return "Check In";
    case "security_checkout":
    case "visitor_self_checkout":
      return "Check Out";
    case "visitor_registration_request":
      return "Registration Request";
    default:
      return "System Activity";
  }
};

const getActivityMarkerStatus = (activity) => {
  const type = String(activity?.activityType || "").toLowerCase();
  if (type.includes("reject")) return "alert";
  if (type.includes("checkin")) return "checked_in";
  if (type.includes("appointment_request") || type.includes("adjusted")) return "moving";
  if (type.includes("approve")) return "active";
  return "active";
};

const getAdminMapFilterKey = (activityType) => {
  const type = String(activityType || "").toLowerCase();
  if (type.includes("request")) return "requests";
  if (type.includes("approve")) return "approvals";
  if (type.includes("checkin") || type.includes("checkout")) return "movement";
  if (type.includes("reject") || type.includes("adjust")) return "issues";
  return "all";
};

const getActivityCoordinates = (activity, index = 0) => {
  const haystack = [
    activity?.location,
    activity?.notes,
    activity?.activityType,
    activity?.relatedVisitor?.assignedOffice,
    activity?.relatedVisitor?.host,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const zones = [
    { keywords: ["gate", "checkpoint", "entry"], x: 18, y: 78 },
    { keywords: ["admin"], x: 78, y: 22 },
    { keywords: ["staff", "faculty", "office"], x: 64, y: 42 },
    { keywords: ["security"], x: 24, y: 30 },
    { keywords: ["hangar", "aviation", "academy"], x: 46, y: 62 },
    { keywords: ["appointment"], x: 54, y: 28 },
  ];

  const baseZone =
    zones.find((zone) => zone.keywords.some((keyword) => haystack.includes(keyword))) ||
    { x: 48, y: 48 };

  const offsetX = ((index % 4) - 1.5) * 5;
  const offsetY = ((Math.floor(index / 4) % 3) - 1) * 5;

  return {
    x: clampValue(baseZone.x + offsetX, 8, 92),
    y: clampValue(baseZone.y + offsetY, 10, 90),
  };
};

const getActivityFloor = (activity) => {
  const haystack = [
    activity?.location,
    activity?.notes,
    activity?.activityType,
    activity?.relatedVisitor?.assignedOffice,
    activity?.relatedVisitor?.host,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    [
      "conference room",
      "chairman",
      "flight operations",
      "head of training",
      "i.t room",
      "it room",
      "faculty room",
      "academy director",
      "sto",
      "mezzanine",
    ].some((keyword) => haystack.includes(keyword))
  ) {
    return "first";
  }

  if (["hr department", "it department", "second floor"].some((keyword) => haystack.includes(keyword))) {
    return "second";
  }

  if (["library", "cafeteria", "third floor"].some((keyword) => haystack.includes(keyword))) {
    return "third";
  }

  return "ground";
};

const hasVisitorLiveLocation = (visitor) =>
  Boolean(
    visitor?.currentLocation?.isActive &&
      visitor?.currentLocation?.floor &&
      Number.isFinite(Number(visitor?.currentLocation?.coordinates?.x)) &&
      Number.isFinite(Number(visitor?.currentLocation?.coordinates?.y)),
  );

const getVisitorMonitorFloor = (visitor) =>
  hasVisitorLiveLocation(visitor)
    ? visitor.currentLocation.floor
    : getActivityFloor({
    location: visitor?.assignedOffice,
    notes: visitor?.purposeOfVisit,
    relatedVisitor: visitor,
  });

const getVisitorMonitorCoordinates = (visitor, index = 0) =>
  hasVisitorLiveLocation(visitor)
    ? {
        x: Number(visitor.currentLocation.coordinates.x),
        y: Number(visitor.currentLocation.coordinates.y),
      }
    : getActivityCoordinates(
        {
          location: visitor?.assignedOffice,
          notes: visitor?.purposeOfVisit,
          relatedVisitor: visitor,
        },
        index,
      );

export default function AdminDashboardScreen({ navigation, onLogout }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const mainScrollViewRef = useRef(null);
  const sidebarScrollViewRef = useRef(null);
  const dataManagementScrollViewRef = useRef(null);
  const authErrorHandledRef = useRef(false);
  const adminMapRefreshRef = useRef(false);

  // User State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [expandedModule, setExpandedModule] = useState("account-management");
  const [selectedSubmodule, setSelectedSubmodule] = useState("dashboard");
  const [accountRecordsMode, setAccountRecordsMode] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Visit Request States
  const [visitRequests, setVisitRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
  const [requestFilter, setRequestFilter] = useState("pending");
  const [requestDateFilter, setRequestDateFilter] = useState("all");
  const [requestDateRange, setRequestDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [requestOfficeFilter, setRequestOfficeFilter] = useState("all");
  const [requestSortOrder, setRequestSortOrder] = useState("newest");
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestSearchTerm, setRequestSearchTerm] = useState("");

  // Analytics States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateAnalytics, setDateAnalytics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    visitors: [],
  });
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historyDateFilter, setHistoryDateFilter] = useState("all");
  const [historyOfficeFilter, setHistoryOfficeFilter] = useState("all");
  const [historySortOrder, setHistorySortOrder] = useState("newest");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyDateRange, setHistoryDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [activeFilterDateField, setActiveFilterDateField] = useState(null);
  const [expandedFilterSections, setExpandedFilterSections] = useState({});

  // Settings States
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: true,
    autoApprove: false,
    maintenanceMode: false,
    darkMode: false,
    twoFactorAuth: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  const [activeSettingsTab, setActiveSettingsTab] = useState("account");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const getId = (item) => {
    if (!item) return null;
    return item._id || item.id || item.visitorId || null;
  };

  const isDateInShortcutRange = (dateValue, shortcut) => {
    if (!dateValue || shortcut === "all") return shortcut === "all";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayOfWeek = startOfToday.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (shortcut === "today") return date >= startOfToday && date < endOfToday;
    if (shortcut === "week") return date >= startOfWeek && date < endOfWeek;
    if (shortcut === "month") return date >= startOfMonth && date < endOfMonth;
    return true;
  };

  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const normalizeSearchValue = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const recordMatchesSearch = (record = {}, query = "", fields = []) => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return true;

    const tokens = normalizedQuery.split(" ").filter(Boolean);
    const haystack = fields
      .map((field) => (typeof field === "function" ? field(record) : record?.[field]))
      .flat()
      .filter((value) => value !== undefined && value !== null)
      .map((value) => normalizeSearchValue(value))
      .join(" ");

    return tokens.every((token) => haystack.includes(token));
  };

  // User Management States
  const [allUsers, setAllUsers] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [guardUsers, setGuardUsers] = useState([]);
  const [visitorUsers, setVisitorUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [userDepartmentFilter, setUserDepartmentFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userDataPanelMode, setUserDataPanelMode] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dataManagementPage, setDataManagementPage] = useState(1);
  const [dataManagementFieldPage, setDataManagementFieldPage] = useState(1);
  const [dataManagementItemsPerPage] = useState(6);
  const [appointmentRecordsPage, setAppointmentRecordsPage] = useState(1);
  const [roomManagementPage, setRoomManagementPage] = useState(1);
  const [appointmentManagementOptions, setAppointmentManagementOptions] = useState(DEFAULT_APPOINTMENT_MANAGEMENT_OPTIONS);
  const [appointmentOptionDrafts, setAppointmentOptionDrafts] = useState({
    offices: "",
    purposes: "",
    timeSlots: "",
  });
  const [editingAppointmentOption, setEditingAppointmentOption] = useState(null);
  const [isSavingAppointmentOptions, setIsSavingAppointmentOptions] = useState(false);

  // Modal States
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [officeEditValue, setOfficeEditValue] = useState("");
  const [appointmentEditDateValue, setAppointmentEditDateValue] = useState("");
  const [appointmentEditTimeValue, setAppointmentEditTimeValue] = useState("");
  const [isUpdatingOffice, setIsUpdatingOffice] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [userManagementStatusTab, setUserManagementStatusTab] = useState("active");
  const [createUserMessage, setCreateUserMessage] = useState("");
  const [createdUserSummary, setCreatedUserSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitySummary, setActivitySummary] = useState({
    appointmentRequests: 0,
    staffActions: 0,
    completedVisits: 0,
    approvals: 0,
  });
  const [selectedMapActivity, setSelectedMapActivity] = useState(null);
  const [showAdminMapModal, setShowAdminMapModal] = useState(false);
  const [adminMapFilter, setAdminMapFilter] = useState("all");
  const [selectedAdminMapFloor, setSelectedAdminMapFloor] = useState("ground");
  const [selectedAdminMapOffice, setSelectedAdminMapOffice] = useState("all");
  const [showAdminMapDock, setShowAdminMapDock] = useState(false);
  const [managedRooms, setManagedRooms] = useState(MONITORING_MAP_OFFICES);
  const [managedRoomPositions, setManagedRoomPositions] = useState(MONITORING_MAP_OFFICE_POSITIONS);
  const [dataCollectionFields, setDataCollectionFields] = useState(DEFAULT_DATA_COLLECTION_FIELDS);
  const [roomDraft, setRoomDraft] = useState(createRoomDraft("ground"));
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [fieldDraft, setFieldDraft] = useState(createFieldDraft());
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [customizationStateReady, setCustomizationStateReady] = useState(false);

  // Chart Data
  const [visitorStats, setVisitorStats] = useState({
    daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    weekly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [0, 0, 0, 0],
    },
    monthly: {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  });

  const [activeChartDataset, setActiveChartDataset] = useState("daily");

  const createEmptyUserForm = (role = "staff") => ({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    role,
    department: role === "security" ? "Security Department" : "Admissions",
    position: role === "security" ? "Security Personnel" : "Admissions Officer",
    shift: "",
    status: "active",
  });

  // Form States
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    employeeId: "",
    status: "active",
    isActive: true,
  });

  const [newUserData, setNewUserData] = useState(createEmptyUserForm("staff"));
  const [createUserErrors, setCreateUserErrors] = useState({});
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRequests: 0,
    totalStaff: 0,
    totalGuards: 0,
    totalAdmin: 0,
    totalUsers: 0,
    activeUsers: 0,
    todayVisits: 0,
    tomorrowVisits: 0,
    weeklyGrowth: 0,
    totalDepartments: 0,
    activeVisitors: 0,
    upcomingVisits: 0,
    totalAdmins: 0,
    checkedInVisitors: 0,
    completedVisits: 0,
  });
  const [adminNotice, setAdminNotice] = useState(null);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const loadAdminCustomizations = async () => {
      try {
        const [storedRooms, storedRoomPositions, storedFields] = await Promise.all([
          storageGetItem(ROOM_STORAGE_KEY),
          storageGetItem(ROOM_POSITION_STORAGE_KEY),
          storageGetItem(DATA_FIELDS_STORAGE_KEY),
        ]);

        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);
          if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
            const savedRoomIds = new Set(parsedRooms.map((room) => room.id));
            const newDefaultRooms = MONITORING_MAP_OFFICES.filter((room) => !savedRoomIds.has(room.id));
            setManagedRooms([...parsedRooms, ...newDefaultRooms]);
          }
        }

        if (storedRoomPositions) {
          const parsedPositions = JSON.parse(storedRoomPositions);
          if (parsedPositions && typeof parsedPositions === "object") {
            setManagedRoomPositions({
              ...MONITORING_MAP_OFFICE_POSITIONS,
              ...parsedPositions,
            });
          }
        }

        if (storedFields) {
          const parsedFields = JSON.parse(storedFields);
          if (Array.isArray(parsedFields) && parsedFields.length > 0) {
            setDataCollectionFields(parsedFields);
          }
        }
      } catch (error) {
        console.log("Admin customization load skipped:", error?.message || error);
      } finally {
        setCustomizationStateReady(true);
      }
    };

    loadAdminCustomizations();
  }, []);

  useEffect(() => {
    if (!customizationStateReady) return;
    storageSetItem(ROOM_STORAGE_KEY, JSON.stringify(managedRooms));
  }, [customizationStateReady, managedRooms]);

  useEffect(() => {
    if (!customizationStateReady) return;
    storageSetItem(ROOM_POSITION_STORAGE_KEY, JSON.stringify(managedRoomPositions));
  }, [customizationStateReady, managedRoomPositions]);

  useEffect(() => {
    if (!customizationStateReady) return;
    storageSetItem(DATA_FIELDS_STORAGE_KEY, JSON.stringify(dataCollectionFields));
  }, [customizationStateReady, dataCollectionFields]);

  // Helper Functions
  const getFilteredRequests = useCallback(() => {
    let filtered = [...visitRequests];
    if (requestFilter !== "all") {
      filtered = filtered.filter((r) => getRequestStatus(r) === requestFilter);
    }
    if (requestDateFilter !== "all") {
      filtered = filtered.filter((r) =>
        isDateInShortcutRange(r.visitDate || r.scheduledVisitStart || r.createdAt, requestDateFilter),
      );
    }
    if (requestOfficeFilter !== "all") {
      filtered = filtered.filter((r) =>
        normalizeFilterValue(r.assignedOffice || r.appointmentDepartment || r.host) === requestOfficeFilter,
      );
    }
    if (requestDateRange.startDate) {
      filtered = filtered.filter((r) => {
        const requestDate = new Date(r.visitDate || r.scheduledVisitStart || r.createdAt);
        return !Number.isNaN(requestDate.getTime()) && requestDate >= requestDateRange.startDate;
      });
    }
    if (requestDateRange.endDate) {
      filtered = filtered.filter((r) => {
        const requestDate = new Date(r.visitDate || r.scheduledVisitStart || r.createdAt);
        if (Number.isNaN(requestDate.getTime())) return false;
        const inclusiveEndDate = new Date(requestDateRange.endDate);
        inclusiveEndDate.setHours(23, 59, 59, 999);
        return requestDate <= inclusiveEndDate;
      });
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((r) =>
        recordMatchesSearch(r, searchQuery, [
          "fullName",
          "email",
          "phoneNumber",
          "purposeOfVisit",
          "purposeCategory",
          "customPurposeOfVisit",
          "assignedOffice",
          "appointmentDepartment",
          "host",
          "status",
          "approvalStatus",
          "appointmentStatus",
          "nfcCardId",
          "safePassId",
          (record) => getRequestStatus(record),
          (record) => [record.visitDate, record.visitTime, record.createdAt, record.updatedAt]
            .filter(Boolean)
            .map((dateValue) => formatDateTime(dateValue)),
        ]),
      );
    }
    return filtered.sort((a, b) => {
      if (requestSortOrder === "status") {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
      }
      const timeDifference = new Date(b.createdAt || b.visitDate || 0) - new Date(a.createdAt || a.visitDate || 0);
      return requestSortOrder === "oldest" ? -timeDifference : timeDifference;
    });
  }, [visitRequests, requestFilter, requestDateFilter, requestOfficeFilter, requestDateRange, searchQuery, requestSortOrder]);

  const getFilteredRequestsCount = useCallback(() => {
    return getFilteredRequests().length;
  }, [getFilteredRequests]);

  const getFilteredUsersList = useCallback(() => {
    let filtered = [...allUsers];

    if (accountRecordsMode === "staff") {
      filtered = filtered.filter((u) => u.role === "staff");
    } else if (accountRecordsMode === "security") {
      filtered = filtered.filter((u) => isSecurityRole(u.role));
    }

    if (userDepartmentFilter !== "all") {
      filtered = filtered.filter((u) => normalizeFilterValue(u.department || "General") === userDepartmentFilter);
    }

    if (userFilter !== "all" && userFilter !== "active" && userFilter !== "inactive") {
      if (userFilter === "security") {
        filtered = filtered.filter((u) => isSecurityRole(u.role));
      } else {
        filtered = filtered.filter((u) => u.role === userFilter);
      }
    }

    if (userFilter === "active") {
      filtered = filtered.filter((u) => isUserActive(u));
    }
    if (userFilter === "inactive") {
      filtered = filtered.filter((u) => !isUserActive(u));
    }

    if (userSearchQuery.trim()) {
      filtered = filtered.filter((u) =>
        recordMatchesSearch(u, userSearchQuery, [
          "firstName",
          "lastName",
          "username",
          "email",
          "phone",
          "department",
          "employeeId",
          "role",
          "status",
          "nfcCardId",
          (userItem) => `${userItem.firstName || ""} ${userItem.lastName || ""}`,
        ]),
      );
    }

    return filtered.sort((a, b) => {
      const nameA = `${a?.firstName || ""} ${a?.lastName || ""}`.trim().toLowerCase();
      const nameB = `${b?.firstName || ""} ${b?.lastName || ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [accountRecordsMode, allUsers, userDepartmentFilter, userFilter, userSearchQuery]);

  const getFilteredUsersCount = useCallback(() => getFilteredUsersList().length, [getFilteredUsersList]);

  const getPaginatedUsers = useCallback(() => {
    const filtered = getFilteredUsersList();
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [getFilteredUsersList, currentPage, itemsPerPage]);

  const getUsersByStatus = useCallback((statusTab) => {
    if (statusTab === "active") {
      return allUsers.filter((u) => u.status === "active" || u.isActive === true);
    }
    if (statusTab === "inactive") {
      return allUsers.filter((u) => u.status === "inactive" || u.isActive === false);
    }
    return allUsers;
  }, [allUsers]);

  const activeUsersList = useMemo(() => getUsersByStatus("active"), [getUsersByStatus]);
  const inactiveUsersList = useMemo(() => getUsersByStatus("inactive"), [getUsersByStatus]);
  const userManagementUsers = useMemo(() => {
    if (userManagementStatusTab === "active") return activeUsersList;
    if (userManagementStatusTab === "inactive") return inactiveUsersList;
    return allUsers;
  }, [activeUsersList, inactiveUsersList, allUsers, userManagementStatusTab]);

  const filteredUsers = useMemo(() => getFilteredUsersList(), [getFilteredUsersList]);
  const paginatedUsers = useMemo(() => getPaginatedUsers(), [getPaginatedUsers]);
  const scopedUsers = useMemo(() => {
    if (accountRecordsMode === "staff") return staffUsers;
    if (accountRecordsMode === "security") return guardUsers;
    return allUsers;
  }, [accountRecordsMode, allUsers, guardUsers, staffUsers]);
  const scopedActiveUsers = useMemo(() => scopedUsers.filter((userItem) => isUserActive(userItem)), [scopedUsers]);
  const scopedInactiveUsers = useMemo(() => scopedUsers.filter((userItem) => !isUserActive(userItem)), [scopedUsers]);
  const totalFilteredUsers = filteredUsers.length;
  const visibleStartIndex = totalFilteredUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const visibleEndIndex = Math.min(currentPage * itemsPerPage, totalFilteredUsers);
  const staffDepartmentCount = useMemo(
    () => new Set(staffUsers.map((userItem) => userItem.department).filter(Boolean)).size,
    [staffUsers],
  );
  const userManagementConfig = useMemo(() => {
    if (accountRecordsMode === "staff") {
      return {
        title: "Staff Directory",
        eyebrow: "Team Administration",
        description: "Review staff accounts, keep assignments organized, and manage who can respond to visitor appointments.",
        icon: "briefcase-outline",
        accent: "#10B981",
        primaryActionLabel: "Create Staff",
        searchPlaceholder: "Search staff by name, email, phone, or department...",
        stats: [
          { key: "total", label: "Staff Accounts", value: scopedUsers.length, icon: "people-outline" },
          { key: "active", label: "Active Staff", value: scopedActiveUsers.length, icon: "checkmark-circle-outline" },
          { key: "inactive", label: "Inactive Staff", value: scopedInactiveUsers.length, icon: "pause-circle-outline" },
          { key: "departments", label: "Departments", value: staffDepartmentCount, icon: "business-outline" },
        ],
        filters: [
          { key: "all", label: "All Staff", count: scopedUsers.length },
          { key: "active", label: "Active", count: scopedActiveUsers.length },
          { key: "inactive", label: "Inactive", count: scopedInactiveUsers.length },
        ],
      };
    }

    if (accountRecordsMode === "security") {
      return {
        title: "Security Team",
        eyebrow: "Operations Access",
        description: "Manage guards and security personnel who verify arrivals, monitor visits, and handle gate operations.",
        icon: "shield-checkmark-outline",
        accent: "#1C6DD0",
        primaryActionLabel: "Create Security",
        searchPlaceholder: "Search security personnel by name, email, or phone...",
        stats: [
          { key: "total", label: "Security Accounts", value: scopedUsers.length, icon: "shield-outline" },
          { key: "active", label: "Active Team", value: scopedActiveUsers.length, icon: "checkmark-circle-outline" },
          { key: "inactive", label: "Inactive Team", value: scopedInactiveUsers.length, icon: "pause-circle-outline" },
          { key: "visible", label: "Filtered View", value: totalFilteredUsers, icon: "funnel-outline" },
        ],
        filters: [
          { key: "all", label: "All Security", count: scopedUsers.length },
          { key: "active", label: "Active", count: scopedActiveUsers.length },
          { key: "inactive", label: "Inactive", count: scopedInactiveUsers.length },
        ],
      };
    }

    return {
      title: "All Users",
      eyebrow: "Account Control Center",
      description: "Monitor every account in one place, move between roles quickly, and keep only the right users active in the system.",
      icon: "people-circle-outline",
      accent: "#1C6DD0",
      primaryActionLabel: null,
      searchPlaceholder: "Search all users by name, email, phone, or department...",
      stats: [
        { key: "total", label: "Total Users", value: allUsers.length, icon: "people-outline" },
        { key: "staff", label: "Staff", value: staffUsers.length, icon: "briefcase-outline" },
        { key: "security", label: "Security", value: guardUsers.length, icon: "shield-outline" },
        { key: "active", label: "Active Users", value: activeUsersList.length, icon: "pulse-outline" },
      ],
      filters: [
        { key: "all", label: "All", count: allUsers.length },
        { key: "staff", label: "Staff", count: staffUsers.length },
        { key: "security", label: "Security", count: guardUsers.length },
        { key: "visitor", label: "Visitors", count: visitorUsers.length },
        { key: "admin", label: "Admins", count: adminUsers.length },
        { key: "active", label: "Active", count: activeUsersList.length },
        { key: "inactive", label: "Inactive", count: inactiveUsersList.length },
      ],
    };
  }, [
    accountRecordsMode,
    activeUsersList.length,
    adminUsers.length,
    allUsers.length,
    guardUsers.length,
    inactiveUsersList.length,
    scopedActiveUsers.length,
    scopedInactiveUsers.length,
    scopedUsers.length,
    staffDepartmentCount,
    staffUsers.length,
    totalFilteredUsers,
    visitorUsers.length,
  ]);

  const requestOfficeFilterOptions = useMemo(() => {
    const officeMap = new Map();
    visitRequests.forEach((request) => {
      const label = request.assignedOffice || request.appointmentDepartment || request.host;
      const key = normalizeFilterValue(label);
      if (!key) return;
      officeMap.set(key, {
        key,
        label,
        count: (officeMap.get(key)?.count || 0) + 1,
        icon: "business-outline",
      });
    });
    return [
      { key: "all", label: "All Offices", count: visitRequests.length, icon: "apps-outline" },
      ...Array.from(officeMap.values()).sort((a, b) => a.label.localeCompare(b.label)).slice(0, 8),
    ];
  }, [visitRequests]);

  const historyOfficeFilterOptions = useMemo(() => {
    const officeMap = new Map();
    visitorHistory.forEach((visitor) => {
      const label = visitor.assignedOffice || visitor.appointmentDepartment || visitor.host;
      const key = normalizeFilterValue(label);
      if (!key) return;
      officeMap.set(key, {
        key,
        label,
        count: (officeMap.get(key)?.count || 0) + 1,
        icon: "business-outline",
      });
    });
    return [
      { key: "all", label: "All Offices", count: visitorHistory.length, icon: "apps-outline" },
      ...Array.from(officeMap.values()).sort((a, b) => a.label.localeCompare(b.label)).slice(0, 8),
    ];
  }, [visitorHistory]);

  const userDepartmentFilterOptions = useMemo(() => {
    const departmentMap = new Map();
    scopedUsers.forEach((userItem) => {
      const label = userItem.department || "General";
      const key = normalizeFilterValue(label);
      departmentMap.set(key, {
        key,
        label,
        count: (departmentMap.get(key)?.count || 0) + 1,
        icon: "business-outline",
      });
    });
    return [
      { key: "all", label: "All Departments", count: scopedUsers.length, icon: "apps-outline" },
      ...Array.from(departmentMap.values()).sort((a, b) => a.label.localeCompare(b.label)).slice(0, 8),
    ];
  }, [scopedUsers]);

  const dataManagementDepartmentFilterOptions = useMemo(() => {
    const departmentMap = new Map();
    allUsers.forEach((userItem) => {
      const label = userItem.department || "General";
      const key = normalizeFilterValue(label);
      departmentMap.set(key, {
        key,
        label,
        count: (departmentMap.get(key)?.count || 0) + 1,
        icon: "business-outline",
      });
    });
    return [
      { key: "all", label: "All Departments", count: allUsers.length, icon: "apps-outline" },
      ...Array.from(departmentMap.values()).sort((a, b) => a.label.localeCompare(b.label)).slice(0, 10),
    ];
  }, [allUsers]);

  const dataManagementUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (userFilter !== "all" && userFilter !== "active" && userFilter !== "inactive") {
      if (userFilter === "security") {
        filtered = filtered.filter((userItem) => isSecurityRole(userItem.role));
      } else {
        filtered = filtered.filter((userItem) => userItem.role === userFilter);
      }
    }

    if (userFilter === "active") {
      filtered = filtered.filter((userItem) => isUserActive(userItem));
    }

    if (userFilter === "inactive") {
      filtered = filtered.filter((userItem) => !isUserActive(userItem));
    }

    if (userDepartmentFilter !== "all") {
      filtered = filtered.filter(
        (userItem) => normalizeFilterValue(userItem.department || "General") === userDepartmentFilter,
      );
    }

    if (userSearchQuery.trim()) {
      filtered = filtered.filter((userItem) =>
        recordMatchesSearch(userItem, userSearchQuery, [
          "firstName",
          "lastName",
          "username",
          "email",
          "phone",
          "department",
          "employeeId",
          "role",
          "status",
          "nfcCardId",
          (item) => `${item.firstName || ""} ${item.lastName || ""}`,
        ]),
      );
    }

    return filtered.sort((a, b) => {
      const nameA = `${a?.firstName || ""} ${a?.lastName || ""}`.trim().toLowerCase();
      const nameB = `${b?.firstName || ""} ${b?.lastName || ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [allUsers, userDepartmentFilter, userFilter, userSearchQuery]);

  const dataManagementTotalPages = Math.max(
    1,
    Math.ceil(dataManagementUsers.length / dataManagementItemsPerPage),
  );
  const paginatedDataManagementUsers = useMemo(
    () =>
      dataManagementUsers.slice(
        (dataManagementPage - 1) * dataManagementItemsPerPage,
        dataManagementPage * dataManagementItemsPerPage,
      ),
    [dataManagementItemsPerPage, dataManagementPage, dataManagementUsers],
  );
  const dataManagementVisibleStart =
    dataManagementUsers.length === 0
      ? 0
      : (dataManagementPage - 1) * dataManagementItemsPerPage + 1;
  const dataManagementVisibleEnd = Math.min(
    dataManagementPage * dataManagementItemsPerPage,
    dataManagementUsers.length,
  );
  const fieldSetupTotalPages = Math.max(
    1,
    Math.ceil(dataCollectionFields.length / dataManagementItemsPerPage),
  );
  const paginatedDataCollectionFields = useMemo(
    () =>
      dataCollectionFields.slice(
        (dataManagementFieldPage - 1) * dataManagementItemsPerPage,
        dataManagementFieldPage * dataManagementItemsPerPage,
      ),
    [dataCollectionFields, dataManagementFieldPage, dataManagementItemsPerPage],
  );
  const fieldSetupVisibleStart =
    dataCollectionFields.length === 0
      ? 0
      : (dataManagementFieldPage - 1) * dataManagementItemsPerPage + 1;
  const fieldSetupVisibleEnd = Math.min(
    dataManagementFieldPage * dataManagementItemsPerPage,
    dataCollectionFields.length,
  );
  const dataManagementRoleFilters = [
    { key: "all", label: "All", count: allUsers.length, icon: "apps-outline" },
    { key: "staff", label: "Staff", count: staffUsers.length, icon: "briefcase-outline" },
    { key: "security", label: "Security", count: guardUsers.length, icon: "shield-outline" },
    { key: "admin", label: "Admin", count: allUsers.filter((userItem) => userItem.role === "admin").length, icon: "person-circle-outline" },
    { key: "visitor", label: "Visitor", count: allUsers.filter((userItem) => userItem.role === "visitor").length, icon: "person-outline" },
    { key: "active", label: "Active", count: allUsers.filter((userItem) => isUserActive(userItem)).length, icon: "checkmark-circle-outline" },
    { key: "inactive", label: "Inactive", count: allUsers.filter((userItem) => !isUserActive(userItem)).length, icon: "pause-circle-outline" },
  ];

  const dateShortcutFilters = [
    { key: "all", label: "Any Date", icon: "calendar-outline" },
    { key: "today", label: "Today", icon: "today-outline" },
    { key: "week", label: "This Week", icon: "calendar-number-outline" },
    { key: "month", label: "This Month", icon: "calendar-clear-outline" },
  ];

  const appointmentRequests = useMemo(
    () =>
      visitRequests.filter((request) => {
        const category = String(request?.requestCategory || request?.visitType || "").toLowerCase();
        return (
          category.includes("appointment") ||
          Boolean(request?.appointmentStatus) ||
          Boolean(request?.scheduledVisitStart) ||
          Boolean(request?.scheduledVisitEnd)
        );
      }),
    [visitRequests],
  );

  const pendingAppointmentRequests = useMemo(
    () =>
      appointmentRequests.filter((request) => {
        const appointmentStatus = String(request?.appointmentStatus || "").toLowerCase();
        const approvalStatus = String(request?.approvalStatus || request?.status || "").toLowerCase();
        return appointmentStatus === "pending" || approvalStatus === "pending";
      }),
    [appointmentRequests],
  );

  const appointmentRecords = useMemo(
    () => appointmentRequests.filter((request) => getRequestStatus(request) === "approved"),
    [appointmentRequests],
  );

  const appointmentRecordsItemsPerPage = 6;
  const appointmentRecordsPageCount = Math.max(
    1,
    Math.ceil(appointmentRecords.length / appointmentRecordsItemsPerPage),
  );
  const paginatedAppointmentRecords = useMemo(() => {
    const startIndex = (appointmentRecordsPage - 1) * appointmentRecordsItemsPerPage;
    return appointmentRecords.slice(startIndex, startIndex + appointmentRecordsItemsPerPage);
  }, [appointmentRecords, appointmentRecordsPage]);

  useEffect(() => {
    setAppointmentRecordsPage((currentPageValue) => Math.min(currentPageValue, appointmentRecordsPageCount));
  }, [appointmentRecordsPageCount]);

  const securityReportRecords = useMemo(
    () => visitorHistory.filter((visitor) => visitor.reportType === "security_report"),
    [visitorHistory],
  );

  const selectedMapModuleFloor = FLOOR_VIEW_TO_ID[selectedSubmodule] || "ground";
  const selectedFloorRooms = useMemo(
    () => managedRooms.filter((room) => room.floor === selectedMapModuleFloor),
    [managedRooms, selectedMapModuleFloor],
  );
  const roomManagementItemsPerPage = 5;
  const roomManagementTotalPages = Math.max(
    1,
    Math.ceil(selectedFloorRooms.length / roomManagementItemsPerPage),
  );
  const paginatedSelectedFloorRooms = useMemo(() => {
    const startIndex = (roomManagementPage - 1) * roomManagementItemsPerPage;
    return selectedFloorRooms.slice(startIndex, startIndex + roomManagementItemsPerPage);
  }, [roomManagementPage, selectedFloorRooms]);

  useEffect(() => {
    setRoomManagementPage(1);
  }, [selectedMapModuleFloor]);

  useEffect(() => {
    setRoomManagementPage((currentPageValue) => Math.min(currentPageValue, roomManagementTotalPages));
  }, [roomManagementTotalPages]);

  const selectedSubmoduleMeta = useMemo(() => {
    switch (selectedSubmodule) {
      case "account-create":
        return {
          title: "Creation of Account",
          subtitle: "Create staff, security, and admin accounts from a cleaner modular control center.",
          highlights: [
            { label: "Staff", value: staffUsers.length, icon: "briefcase-outline", color: "#10B981" },
            { label: "Security", value: guardUsers.length, icon: "shield-checkmark-outline", color: "#1C6DD0" },
          ],
        };
      case "account-records":
        return {
          title: "Account Records",
          subtitle: "Browse accounts by role, review status, and keep your directory organized from one workspace.",
          highlights: [
            { label: "Mode", value: accountRecordsMode === "all" ? "All Users" : formatRoleLabel(accountRecordsMode), icon: "funnel-outline", color: "#0A3D91" },
            { label: "Visible", value: totalFilteredUsers, icon: "people-outline", color: "#10B981" },
          ],
        };
      case "data-management":
        return {
          title: "User Data Management",
          subtitle: "Select an account, review its details, and edit the user data that drives role-based access.",
          highlights: [
            { label: "Users", value: allUsers.length, icon: "people-outline", color: "#1C6DD0" },
            { label: "Active", value: allUsers.filter((userItem) => isUserActive(userItem)).length, icon: "checkmark-circle-outline", color: "#10B981" },
          ],
        };
      case "map-ground":
      case "map-mezzanine":
      case "map-second":
      case "map-third":
        return {
          title: ADMIN_MODULE_FLOORS.find((floor) => floor.id === selectedMapModuleFloor)?.name || "Floor Map",
          subtitle: "Review the active map layer for this floor and manage the room registry directly beside it.",
          highlights: [
            { label: "Rooms", value: selectedFloorRooms.length, icon: "business-outline", color: "#10B981" },
            { label: "Active", value: stats.activeVisitors || stats.checkedInVisitors || 0, icon: "locate-outline", color: "#0A3D91" },
          ],
        };
      case "appointment-records":
        return {
          title: "Appointment Records",
          subtitle: "See approved appointment history and completed staff-linked visitor visits.",
          highlights: [
            { label: "Records", value: appointmentRecords.length, icon: "calendar-outline", color: "#EC4899" },
            { label: "Approved", value: appointmentRecords.length, icon: "checkmark-circle-outline", color: "#10B981" },
          ],
        };
      case "appointment-management":
        return {
          title: "Appointment Management",
          subtitle: "Review approval-ready appointments and move the queue forward without leaving the dashboard.",
          highlights: [
            { label: "Pending", value: pendingAppointmentRequests.length, icon: "time-outline", color: "#F59E0B" },
            { label: "Approved", value: approvedRequests.length, icon: "checkmark-circle-outline", color: "#10B981" },
          ],
        };
      case "report-records":
        return {
          title: "Report Records",
          subtitle: "Review generated report-ready activity summaries, visitor history, and approval outcomes.",
          highlights: [
            { label: "History", value: visitorHistory.length, icon: "document-text-outline", color: "#0A3D91" },
            { label: "Completed", value: stats.completedVisits, icon: "checkmark-done-outline", color: "#10B981" },
          ],
        };
      case "security-report-records":
        return {
          title: "Security Reports",
          subtitle: "Review visitor incident reports submitted by security and guard accounts.",
          highlights: [
            { label: "Reports", value: securityReportRecords.length, icon: "shield-alert-outline", color: "#DC2626" },
            { label: "Unresolved", value: securityReportRecords.filter((item) => !item.resolved).length, icon: "alert-circle-outline", color: "#F59E0B" },
          ],
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Control dashboard preferences and communication settings for the admin experience.",
          highlights: [
            { label: "Dark Mode", value: settings.darkMode ? "On" : "Off", icon: "moon-outline", color: "#6B7280" },
            { label: "Email", value: settings.emailNotifications ? "On" : "Off", icon: "mail-outline", color: "#0A3D91" },
          ],
        };
      default:
        return {
          title: "Dashboard Overview",
          subtitle: "Review the visitor pipeline, move into the right section quickly, and keep the whole campus flow on track.",
          highlights: [
            { label: "Pending", value: stats.pendingRequests, icon: "time-outline", color: "#F59E0B" },
            { label: "Live Map", value: stats.activeVisitors || stats.checkedInVisitors || 0, icon: "map-outline", color: "#10B981" },
          ],
        };
    }
  }, [
    accountRecordsMode,
    allUsers.length,
    appointmentRecords.length,
    appointmentRequests.length,
    approvedRequests.length,
    dataCollectionFields,
    guardUsers.length,
    pendingAppointmentRequests.length,
    selectedMapModuleFloor,
    selectedFloorRooms.length,
    selectedSubmodule,
    settings.darkMode,
    settings.emailNotifications,
    staffUsers.length,
    stats.completedVisits,
    stats.activeVisitors,
    stats.checkedInVisitors,
    stats.pendingRequests,
    totalFilteredUsers,
    visitorHistory.length,
    securityReportRecords,
  ]);

  const adminModules = useMemo(
    () => [
      {
        key: "account-management",
        label: "Account Management",
        icon: "people-circle-outline",
        color: "#0A3D91",
        submodules: [
          { key: "account-create", label: "Creation of Account", badge: 3 },
          { key: "account-records", label: "Account Records", badge: allUsers.length },
          { key: "data-management", label: "User Data Management", badge: allUsers.length },
        ],
      },
      {
        key: "maps",
        label: "Maps",
        icon: "map-outline",
        color: "#10B981",
        submodules: [
          { key: "map-ground", label: "Ground Floor", badge: managedRooms.filter((room) => room.floor === "ground").length },
          { key: "map-mezzanine", label: "Mezzanine", badge: managedRooms.filter((room) => room.floor === "first").length },
          { key: "map-second", label: "Second Floor", badge: managedRooms.filter((room) => room.floor === "second").length },
          { key: "map-third", label: "Third Floor", badge: managedRooms.filter((room) => room.floor === "third").length },
        ],
      },
      {
        key: "appointment",
        label: "Appointment",
        icon: "calendar-outline",
        color: "#F59E0B",
        submodules: [
          { key: "appointment-records", label: "Appointment Records", badge: appointmentRecords.length },
          { key: "appointment-management", label: "Appointment Management", badge: pendingAppointmentRequests.length },
        ],
      },
      {
        key: "reports",
        label: "Reports",
        icon: "document-text-outline",
        color: "#1C6DD0",
        submodules: [
          { key: "report-records", label: "Report Records", badge: visitorHistory.length },
          { key: "security-report-records", label: "Security Reports", badge: securityReportRecords.length },
        ],
      },
    ],
    [allUsers.length, appointmentRecords.length, dataCollectionFields.length, managedRooms, pendingAppointmentRequests.length, securityReportRecords.length, visitorHistory.length],
  );

  const getFilteredHistory = useCallback(() => {
    let filtered = [...visitorHistory];
    
    if (historyFilter !== "all") {
      filtered = filtered.filter(v =>
        historyFilter === "reported"
          ? v.reportType === "security_report"
          : getRequestStatus(v) === historyFilter || v.status === historyFilter,
      );
    }

    if (historyDateFilter !== "all") {
      filtered = filtered.filter(v => isDateInShortcutRange(v.visitDate || v.createdAt, historyDateFilter));
    }

    if (historyOfficeFilter !== "all") {
      filtered = filtered.filter(v =>
        normalizeFilterValue(v.assignedOffice || v.appointmentDepartment || v.host) === historyOfficeFilter,
      );
    }
    
    if (historySearchQuery.trim()) {
      filtered = filtered.filter((v) =>
        recordMatchesSearch(v, historySearchQuery, [
          "fullName",
          "email",
          "purposeOfVisit",
          "assignedOffice",
          "appointmentDepartment",
          "host",
          "status",
          "approvalStatus",
          "appointmentStatus",
          "reportReason",
          "reporterName",
          "reportType",
          "nfcCardId",
          "safePassId",
          (visitor) => getRequestStatus(visitor),
          (visitor) => formatDateTime(visitor.visitDate || visitor.createdAt || visitor.reportedAt),
        ]),
      ); 
    }
    
    if (historyDateRange.startDate) {
      filtered = filtered.filter(v => new Date(v.visitDate || v.createdAt) >= historyDateRange.startDate);
    }
    if (historyDateRange.endDate) {
      filtered = filtered.filter(v => {
        const visitDate = new Date(v.visitDate || v.createdAt);
        const inclusiveEndDate = new Date(historyDateRange.endDate);
        inclusiveEndDate.setHours(23, 59, 59, 999);
        return visitDate <= inclusiveEndDate;
      });
    }

    return filtered.sort((a, b) => {
      const timeDifference = new Date(b.visitDate || b.createdAt || 0) - new Date(a.visitDate || a.createdAt || 0);
      return historySortOrder === "oldest" ? -timeDifference : timeDifference;
    });
  }, [visitorHistory, historyDateFilter, historyFilter, historyOfficeFilter, historySearchQuery, historyDateRange, historySortOrder]);

  const getHistoryStats = useCallback(() => {
    const total = visitorHistory.length;
    const approved = visitorHistory.filter(v => getRequestStatus(v) === "approved").length;
    const pending = visitorHistory.filter(v => getRequestStatus(v) === "pending").length;
    const rejected = visitorHistory.filter(v => getRequestStatus(v) === "rejected").length;
    const checkedIn = visitorHistory.filter(v => v.status === "checked_in").length;
    const checkedOut = visitorHistory.filter(v => v.status === "checked_out").length;
    const reported = visitorHistory.filter(v => v.reportType === "security_report").length;
    const uniqueEmails = new Set(visitorHistory.map(v => v.email).filter(Boolean)).size;
    
    const monthlyData = {};
    visitorHistory.forEach(v => {
      if (v.visitDate) {
        const month = new Date(v.visitDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });
    
    return {
      total,
      totalVisits: total,
      approved,
      pending,
      pendingVisits: pending,
      rejected,
      rejectedVisits: rejected,
      checkedIn,
      checkedOut,
      completedVisits: checkedOut,
      reported,
      uniqueEmails,
      monthlyData,
    };
  }, [visitorHistory]);

  const loadVisitorHistory = useCallback(() => {
    const reportRows = visitRequests.flatMap((visitor) =>
      (visitor.reports || []).map((report) => {
        const reporter = report.reportedBy || {};
        const reporterName = [reporter.firstName, reporter.lastName].filter(Boolean).join(" ") ||
          reporter.email ||
          "Security";
        return {
          ...visitor,
          _id: `${visitor._id || visitor.id}-report-${report._id || report.reportedAt || report.reason}`,
          sourceVisitorId: visitor._id || visitor.id,
          status: "reported",
          reportType: "security_report",
          reportReason: report.reason || "Security report",
          reporterName,
          reportedAt: report.reportedAt,
          resolved: report.resolved,
          createdAt: report.reportedAt || visitor.updatedAt || visitor.createdAt,
        };
      }),
    );
    const sortedVisitors = [...visitRequests, ...reportRows].sort((a, b) =>
      new Date(b.reportedAt || b.visitDate || b.createdAt || 0) -
      new Date(a.reportedAt || a.visitDate || a.createdAt || 0),
    );
    setVisitorHistory(sortedVisitors);
  }, [visitRequests]);

  const handleSaveAppointmentOffice = async () => {
    const visitorId = selectedRequest?._id || selectedRequest?.id || selectedRequest?.sourceVisitorId;
    const office = String(officeEditValue || "").trim();
    const visitDate = String(appointmentEditDateValue || "").trim();
    const visitTime = String(appointmentEditTimeValue || "").trim();

    if (!visitorId) {
      Alert.alert("Missing Visitor", "Please select an appointment record first.");
      return;
    }

    if (!office) {
      Alert.alert("Office Required", "Please enter the office or department for this appointment.");
      return;
    }

    if (visitDate && !/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
      Alert.alert("Invalid Date", "Please use YYYY-MM-DD for the visit date.");
      return;
    }

    if (visitTime && !/^\d{1,2}:\d{2}$/.test(visitTime)) {
      Alert.alert("Invalid Time", "Please use HH:MM for the visit time.");
      return;
    }

    setIsUpdatingOffice(true);
    try {
      const response = await ApiService.updateVisitorAppointmentOffice(visitorId, {
        office,
        appointmentDepartment: office,
        assignedOffice: office,
        visitDate: visitDate || undefined,
        visitTime: visitTime || undefined,
      });
      if (response?.success) {
        const updatedVisitor = response.visitor;
        setSelectedRequest((current) => ({
          ...(current || {}),
          ...(updatedVisitor || {}),
          assignedOffice: office,
          appointmentDepartment: office,
          host: office,
          visitDate: updatedVisitor?.visitDate || current?.visitDate,
          visitTime: updatedVisitor?.visitTime || current?.visitTime,
        }));
        setVisitRequests((currentRequests) =>
          currentRequests.map((request) =>
            String(request._id || request.id) === String(visitorId)
              ? {
                  ...request,
                  ...(updatedVisitor || {}),
                  assignedOffice: office,
                  appointmentDepartment: office,
                  host: office,
                  visitDate: updatedVisitor?.visitDate || request.visitDate,
                  visitTime: updatedVisitor?.visitTime || request.visitTime,
                }
              : request,
          ),
        );
        publishAdminNotice("success", "Appointment request updated", `${selectedRequest?.fullName || "Visitor"} now has the updated office and schedule.`);
        return;
      }

      Alert.alert("Update Failed", response?.message || "Failed to update appointment office.");
    } catch (error) {
      console.error("Update appointment office error:", error);
      Alert.alert("Update Failed", error?.message || "Failed to update appointment office.");
    } finally {
      setIsUpdatingOffice(false);
    }
  };

  const getVisitorSafePassId = (visitor = {}) =>
    visitor.nfcCardId ||
    visitor.safePassId ||
    visitor.relatedUser?.nfcCardId ||
    visitor.relatedVisitor?.nfcCardId ||
    "Not assigned";

  const getCurrentChartData = () => visitorStats[activeChartDataset] || visitorStats.daily;

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const calculateChartData = (requests) => {
    const dailyData = [0, 0, 0, 0, 0, 0, 0];
    const weeklyData = [0, 0, 0, 0];
    const monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const currentWeek = getWeekNumber(today);

    requests.forEach((request) => {
      if (!request.createdAt) return;
      const date = new Date(request.createdAt);
      const weekNum = getWeekNumber(date);
      const month = date.getMonth();
      const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) dailyData[6 - dayDiff]++;
      if (weekNum >= currentWeek - 3 && weekNum <= currentWeek) weeklyData[weekNum - (currentWeek - 3)]++;
      if (month >= today.getMonth() - 11) monthlyData[month]++;
    });

    setVisitorStats({
      daily: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: dailyData },
      weekly: { labels: ["Week 1", "Week 2", "Week 3", "Week 4"], data: weeklyData },
      monthly: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], data: monthlyData },
    });
  };

  const calculateDateAnalytics = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const visitorsOnDate = visitRequests.filter((request) => {
      const visitDate = new Date(request.visitDate);
      return visitDate >= targetDate && visitDate < nextDay;
    });

    const approved = visitorsOnDate.filter((r) => getRequestStatus(r) === "approved");
    const pending = visitorsOnDate.filter((r) => getRequestStatus(r) === "pending");
    const rejected = visitorsOnDate.filter((r) => getRequestStatus(r) === "rejected");

    setDateAnalytics({
      total: visitorsOnDate.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      visitors: visitorsOnDate,
    });
  };

  const calculateWeeklyGrowth = (requests) => {
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));
    const recentRequests = requests.filter((r) => new Date(r.createdAt) > lastWeek);
    return Math.round((recentRequests.length / Math.max(requests.length, 1)) * 100);
  };

  const isAuthError = (error) => {
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("401") ||
      message.includes("authenticate") ||
      message.includes("unauthorized") ||
      message.includes("token") ||
      message.includes("jwt")
    );
  };

  const handleAuthError = useCallback(async () => {
    if (authErrorHandledRef.current) return;
    authErrorHandledRef.current = true;
    await ApiService.clearAuth();
    Alert.alert("Session Expired", "Please log in again.", [
      { text: "OK", onPress: () => navigation.replace("Login") },
    ]);
  }, [navigation]);

  const publishAdminNotice = useCallback((type, title, message = "") => {
    setAdminNotice({
      id: `${type}-${Date.now()}`,
      type,
      title,
      message,
    });
  }, []);

  const ensureAdminAccess = useCallback(() => {
    const normalizedRole = String(user?.role || "").toLowerCase();
    if (normalizedRole !== "admin") {
      Alert.alert("Admin Required", "Only admin accounts can perform this action.");
      return false;
    }
    return true;
  }, [user]);

  const loadAppointmentManagementOptions = useCallback(async () => {
    try {
      const response = await ApiService.getAdminAppointmentOptions();
      if (response?.success && response.options) {
        setAppointmentManagementOptions(response.options);
      }
    } catch (error) {
      console.error("Load appointment management options error:", error);
    }
  }, []);

  const saveAppointmentManagementOptions = async (nextOptions, successMessage) => {
    if (!ensureAdminAccess()) return;
    setIsSavingAppointmentOptions(true);
    try {
      const response = await ApiService.updateAdminAppointmentOptions(nextOptions);
      if (response?.success) {
        setAppointmentManagementOptions(response.options || nextOptions);
        publishAdminNotice(
          "success",
          "Appointment options updated",
          successMessage || "Visitor appointment request form options now use the latest configuration.",
        );
        return;
      }
      publishAdminNotice("error", "Options update failed", response?.message || "Unable to save appointment options.");
    } catch (error) {
      publishAdminNotice("error", "Options update failed", error?.message || "Unable to save appointment options.");
    } finally {
      setIsSavingAppointmentOptions(false);
    }
  };

  const buildAppointmentTextOption = (groupKey, label, existing = {}) => ({
    id: existing.id || `${groupKey}-${normalizeTextToId(label)}-${Date.now()}`,
    label: String(label || "").trim().replace(/\s+/g, " "),
    enabled: existing.enabled !== false,
  });

  const buildAppointmentTimeSlotOption = (value, existing = {}) => {
    const normalized = String(value || "").trim();
    const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const suffix = String(match[3] || "").toUpperCase();
    if (suffix === "PM" && hour < 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }
    const timeValue = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const hour12 = hour % 12 || 12;
    const label = `${hour12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
    return {
      id: existing.id || `slot-${timeValue.replace(":", "-")}-${Date.now()}`,
      label,
      value: timeValue,
      hour,
      minute,
      enabled: existing.enabled !== false,
    };
  };

  const updateAppointmentOptionGroup = (groupKey, updater, message) => {
    const nextOptions = {
      ...appointmentManagementOptions,
      [groupKey]: updater(appointmentManagementOptions[groupKey] || []),
    };
    saveAppointmentManagementOptions(nextOptions, message);
  };

  const handleAddAppointmentOption = (groupKey) => {
    const draft = String(appointmentOptionDrafts[groupKey] || "").trim();
    if (!draft) {
      Alert.alert("Option Required", "Please enter a value before adding it.");
      return;
    }

    const newOption =
      groupKey === "timeSlots"
        ? buildAppointmentTimeSlotOption(draft)
        : buildAppointmentTextOption(groupKey, draft);

    if (!newOption) {
      Alert.alert("Invalid Time Slot", "Use HH:MM, such as 09:00 or 2:30 PM.");
      return;
    }

    updateAppointmentOptionGroup(
      groupKey,
      (items) => [...items, newOption],
      `${newOption.label} was added to the visitor appointment form.`,
    );
    setAppointmentOptionDrafts((prev) => ({ ...prev, [groupKey]: "" }));
  };

  const handleSaveEditedAppointmentOption = (groupKey, option) => {
    const draft = String(appointmentOptionDrafts[groupKey] || "").trim();
    if (!draft) {
      Alert.alert("Option Required", "Please enter a value before saving.");
      return;
    }

    const updatedOption =
      groupKey === "timeSlots"
        ? buildAppointmentTimeSlotOption(draft, option)
        : buildAppointmentTextOption(groupKey, draft, option);

    if (!updatedOption) {
      Alert.alert("Invalid Time Slot", "Use HH:MM, such as 09:00 or 2:30 PM.");
      return;
    }

    updateAppointmentOptionGroup(
      groupKey,
      (items) => items.map((item) => (item.id === option.id ? updatedOption : item)),
      `${updatedOption.label} was updated in the visitor appointment form.`,
    );
    setEditingAppointmentOption(null);
    setAppointmentOptionDrafts((prev) => ({ ...prev, [groupKey]: "" }));
  };

  const handleToggleAppointmentOption = (groupKey, option) => {
    updateAppointmentOptionGroup(
      groupKey,
      (items) => items.map((item) => (item.id === option.id ? { ...item, enabled: item.enabled === false } : item)),
      `${option.label} was ${option.enabled === false ? "enabled" : "disabled"}.`,
    );
  };

  const handleDeleteAppointmentOption = (groupKey, option) => {
    updateAppointmentOptionGroup(
      groupKey,
      (items) => items.filter((item) => item.id !== option.id),
      `${option.label} was removed from the visitor appointment form.`,
    );
  };

  // FIXED: Load All Visit Requests
  const loadAllVisitRequests = async ({ silent = false } = {}) => {
    try {
      const response = await ApiService.getAllVisitors({ limit: 500 });
      if (response && response.visitors) {
        const requests = response.visitors || [];
        const pending = requests.filter((r) => getRequestStatus(r) === "pending");
        const approved = requests.filter((r) => getRequestStatus(r) === "approved");
        const rejected = requests.filter((r) => getRequestStatus(r) === "rejected");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDay = new Date(tomorrow);
        nextDay.setDate(nextDay.getDate() + 1);

        const todayVisits = requests.filter((r) => {
          const visitDate = new Date(r.visitDate);
          return visitDate >= today && visitDate < tomorrow;
        }).length;

        const tomorrowVisits = requests.filter((r) => {
          const visitDate = new Date(r.visitDate);
          return visitDate >= tomorrow && visitDate < nextDay;
        }).length;

        const upcomingVisits = requests.filter((r) => {
          const visitDate = new Date(r.visitDate);
          return visitDate >= today && getRequestStatus(r) === "approved";
        }).length;

        setVisitRequests(requests);
        setPendingRequests(pending);
        setApprovedRequests(approved);
        setRejectedRequests(rejected);
        calculateChartData(requests);
        calculateDateAnalytics(selectedDate);

        setStats((prev) => ({
          ...prev,
          pendingRequests: pending.length,
          approvedRequests: approved.length,
          rejectedRequests: rejected.length,
          totalRequests: requests.length,
          todayVisits,
          tomorrowVisits,
          upcomingVisits,
          weeklyGrowth: calculateWeeklyGrowth(requests),
          activeVisitors: approved.filter((r) => new Date(r.visitDate) >= new Date()).length,
        }));
      } else {
        console.error("Failed to load visit requests:", response);
      }
    } catch (error) {
      console.error("Load visit requests error:", error);
      if (isAuthError(error)) {
        await handleAuthError();
        return;
      }
      if (!silent) {
        Alert.alert("Error", "Failed to load visit requests. Please check your connection.");
      }
    }
  };

  // FIXED: Load All Users
  const loadAllUsers = async () => {
    try {
      const response = await ApiService.getAllUsers({ limit: 500 });
      if (response && response.users) {
        const users = response.users || [];
        const staff = users.filter((u) => u.role === "staff");
        const security = users.filter((u) => u.role === "security" || u.role === "guard");
        const departments = new Set(staff.filter((s) => s.department).map((s) => s.department));

        setAllUsers(users);
        setStaffUsers(staff);
        setGuardUsers(security);
        setVisitorUsers(users.filter((u) => u.role === "visitor"));
        setAdminUsers(users.filter((u) => u.role === "admin"));
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalStaff: staff.length,
          totalGuards: security.length,
          totalAdmin: users.filter((u) => u.role === "admin").length,
          activeUsers: users.filter((u) => u.status === "active" || u.isActive).length,
          totalDepartments: departments.size,
        }));
      } else {
        console.error("Failed to load users:", response);
      }
    } catch (error) {
      console.error("Load users error:", error);
      if (isAuthError(error)) {
        await handleAuthError();
        return;
      }
      Alert.alert("Error", "Failed to load users. Please check your connection.");
    }
  };

  const loadRecentActivities = useCallback(async () => {
    try {
      const response = await ApiService.getRecentActivities(30);
      const activities = response?.activities || [];
      setRecentActivities(activities);
      setActivitySummary(
        response?.summary || {
          appointmentRequests: 0,
          staffActions: 0,
          completedVisits: 0,
          approvals: 0,
        },
      );
    } catch (error) {
      console.error("Load recent activities error:", error);
      if (isAuthError(error)) {
        await handleAuthError();
        return;
      }
      setRecentActivities([]);
    }
  }, [handleAuthError]);

  const loadAdminStats = useCallback(async () => {
    try {
      const response = await ApiService.getAdminStats();
      const snapshot = response?.stats;
      if (!snapshot) return;

      setStats((prev) => ({
        ...prev,
        totalUsers: snapshot.totalUsers ?? prev.totalUsers,
        activeUsers: snapshot.activeUsers ?? prev.activeUsers,
        totalStaff: snapshot.totalStaff ?? prev.totalStaff,
        totalGuards: snapshot.totalSecurity ?? prev.totalGuards,
        totalAdmin: snapshot.totalAdmins ?? prev.totalAdmin,
        pendingRequests: snapshot.pendingApprovals ?? prev.pendingRequests,
        checkedInVisitors: snapshot.checkedInVisitors ?? prev.checkedInVisitors,
        completedVisits: snapshot.completedVisits ?? prev.completedVisits,
      }));
    } catch (error) {
      console.error("Load admin stats error:", error);
      if (isAuthError(error)) {
        await handleAuthError();
      }
    }
  }, [handleAuthError]);

const loadDashboardData = useCallback(async () => {
  authErrorHandledRef.current = false;
  setIsLoading(true);
  try {
    const profileResponse = await ApiService.getProfile();
    const currentUser = profileResponse?.user || (await ApiService.getCurrentUser());
    const role = String(currentUser?.role || "").toLowerCase();
    if (!currentUser || role !== "admin") {
      Alert.alert("Access Denied", "You don't have admin privileges.");
      navigation.replace("Login");
      return;
    }
    setUser(currentUser);
    await Promise.all([
      loadAdminStats(),
      loadAllVisitRequests(),
      loadAllUsers(),
      loadRecentActivities(),
      loadAppointmentManagementOptions(),
    ]);
  } catch (error) {
    console.error("Load dashboard error:", error);
    if (isAuthError(error)) {
      await handleAuthError();
      return;
    }
    Alert.alert("Error", "Failed to load dashboard data. Please try again.");
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
}, [navigation, handleAuthError, loadRecentActivities, loadAdminStats, loadAppointmentManagementOptions]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadVisitorHistory();
  }, [visitRequests, loadVisitorHistory]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storageGetItem("adminSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          setIsDarkMode(parsedSettings.darkMode || false);
        }
        const darkModePref = await storageGetItem("isDarkMode");
        if (darkModePref !== null) {
          const isDark = JSON.parse(darkModePref);
          setIsDarkMode(isDark);
          setSettings((prev) => ({ ...prev, darkMode: isDark }));
        }
      } catch (error) {
        console.error("Load settings error:", error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const newTotalPages = Math.ceil(getFilteredUsersCount() / itemsPerPage);
    setTotalPages(newTotalPages > 0 ? newTotalPages : 1);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(1);
  }, [getFilteredUsersCount, currentPage, itemsPerPage]);

  useEffect(() => {
    if (dataManagementPage > dataManagementTotalPages) {
      setDataManagementPage(dataManagementTotalPages);
    }
  }, [dataManagementPage, dataManagementTotalPages]);

  useEffect(() => {
    if (dataManagementFieldPage > fieldSetupTotalPages) {
      setDataManagementFieldPage(fieldSetupTotalPages);
    }
  }, [dataManagementFieldPage, fieldSetupTotalPages]);

  useEffect(() => {
    if (!createUserMessage) return;
    const timer = setTimeout(() => setCreateUserMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [createUserMessage]);

  useEffect(() => {
    if (!adminNotice) return undefined;
    const timer = setTimeout(() => setAdminNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [adminNotice]);

  useEffect(() => {
    if (selectedSubmodule !== "data-management" || !userDataPanelMode) return undefined;

    const timer = setTimeout(() => {
      dataManagementScrollViewRef.current?.scrollToEnd?.({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [selectedSubmodule, userDataPanelMode, selectedUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const refreshAdminMapData = async () => {
    if (adminMapRefreshRef.current) return;
    adminMapRefreshRef.current = true;
    try {
      await Promise.all([
        loadAllVisitRequests({ silent: true }),
        loadRecentActivities(),
      ]);
    } finally {
      adminMapRefreshRef.current = false;
    }
  };

  useEffect(() => {
    const isMapVisible = activeMenu === "webmap" || showAdminMapModal || showAdminMapDock;
    if (!isMapVisible) return undefined;

    refreshAdminMapData();
    const interval = setInterval(refreshAdminMapData, LIVE_MAP_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeMenu, showAdminMapModal, showAdminMapDock]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.96],
    extrapolate: "clamp",
  });

  const getDynamicStyles = () => {
    if (isDarkMode) {
      return {
        backgroundColor: "#0F172A",
        cardBackground: "#1E293B",
        textPrimary: "#F1F5F9",
        textSecondary: "#94A3B8",
        borderColor: "#334155",
        headerBackground: "#1E293B",
        sidebarBackground: "#0F172A",
        inputBackground: "#334155",
        successBg: "#064E3B",
        warningBg: "#78350F",
        errorBg: "#7F1D1D",
        infoBg: "#1E3A5F",
      };
    }
    return {
      backgroundColor: "#F8FBFE",
      cardBackground: "#FFFFFF",
      textPrimary: "#1E293B",
      textSecondary: "#64748B",
      borderColor: "#E2E8F0",
      headerBackground: "#FFFFFF",
      sidebarBackground: "#1E3A5F",
      inputBackground: "#F8FBFE",
      successBg: "#EEF5FF",
      warningBg: "#FEF3C7",
      errorBg: "#FEE2E2",
      infoBg: "#EFF6FF",
    };
  };

  const theme = getDynamicStyles();

  const mapActivities = useMemo(
    () =>
      (recentActivities || []).filter((activity) => {
        const activityType = String(activity?.activityType || "").toLowerCase();
        if (!ADMIN_MAP_ACTIVITY_TYPES.has(activityType)) {
          return false;
        }

        return Boolean(activity?.relatedVisitor || activity?.location || activity?.notes);
      }),
    [recentActivities],
  );

  const filteredMapActivities = useMemo(() => {
    if (adminMapFilter === "all") return mapActivities;
    return mapActivities.filter((activity) => getAdminMapFilterKey(activity?.activityType) === adminMapFilter);
  }, [adminMapFilter, mapActivities]);

  const monitoredMapVisitors = useMemo(
    () =>
      visitRequests
        .filter((visitor) => visitor?.status === "checked_in")
        .slice(0, 18)
        .map((visitor, index) => ({
          id: visitor?._id || `checked-in-visitor-${index}`,
          name: visitor?.fullName || "Checked-In Visitor",
          purpose: visitor?.purposeOfVisit || "On-site visit",
          status: "checked_in",
          location: {
            floor: getVisitorMonitorFloor(visitor),
            office:
              visitor?.currentLocation?.office ||
              visitor?.assignedOffice ||
              visitor?.host ||
              "On-site visitor",
            source: visitor?.currentLocation?.source || "system_estimate",
            timestamp:
              visitor?.currentLocation?.lastSeenAt ||
              visitor?.checkedInAt ||
              visitor?.updatedAt ||
              visitor?.createdAt,
            coordinates: getVisitorMonitorCoordinates(visitor, index),
          },
          activityType: "security_checkin",
          eventLabel: "Checked In",
          lastUpdate:
            visitor?.currentLocation?.lastSeenAt ||
            visitor?.checkedInAt ||
            visitor?.updatedAt ||
            visitor?.createdAt,
          detail:
            visitor?.currentLocation?.office ||
            visitor?.assignedOffice ||
            visitor?.host ||
            "Visitor is currently on site.",
          sourceVisitor: visitor,
        })),
    [visitRequests],
  );

  const visibleAdminMapVisitors = useMemo(
    () =>
      monitoredMapVisitors.filter((visitor) => {
        const visitorFloor = normalizeMonitoringFloor(visitor?.location?.floor);
        const selectedFloor = normalizeMonitoringFloor(selectedAdminMapFloor);

        if (visitorFloor && visitorFloor !== selectedFloor) {
          return false;
        }

        if (
          selectedAdminMapOffice !== "all" &&
          visitor?.location?.office !== selectedAdminMapOffice
        ) {
          return false;
        }

        return true;
      }),
    [monitoredMapVisitors, selectedAdminMapFloor, selectedAdminMapOffice],
  );

  const activeMapActivity = useMemo(() => {
    if (!selectedMapActivity) return visibleAdminMapVisitors[0] || null;
    return (
      visibleAdminMapVisitors.find((item) => item.id === selectedMapActivity.id) ||
      visibleAdminMapVisitors[0] ||
      null
    );
  }, [visibleAdminMapVisitors, selectedMapActivity]);

  const activeMenuMeta = useMemo(() => {
    switch (activeMenu) {
      case "requests":
        return {
          subtitle: "Review visitor requests, approve them quickly, and keep upcoming arrivals organized.",
          highlights: [
            { label: "Pending", value: stats.pendingRequests, icon: "time-outline", color: "#F59E0B" },
            { label: "Approved", value: approvedRequests.length, icon: "checkmark-circle-outline", color: "#10B981" },
          ],
        };
      case "staff":
        return {
          subtitle: "Manage staff accounts, assignments, and who can respond to incoming appointments.",
          highlights: [
            { label: "Staff", value: staffUsers.length, icon: "briefcase-outline", color: "#10B981" },
            { label: "Departments", value: new Set(staffUsers.map((item) => item.department).filter(Boolean)).size, icon: "business-outline", color: "#1C6DD0" },
          ],
        };
      case "security":
        return {
          subtitle: "Keep your gate team ready, track active personnel, and support visitor check-ins in real time.",
          highlights: [
            { label: "Security", value: guardUsers.length, icon: "shield-outline", color: "#1C6DD0" },
            { label: "Active", value: guardUsers.filter((item) => isUserActive(item)).length, icon: "pulse-outline", color: "#0A3D91" },
          ],
        };
      case "users":
        return {
          subtitle: "Monitor the full account directory and move between roles without losing control of the admin workflow.",
          highlights: [
            { label: "Users", value: allUsers.length, icon: "people-outline", color: "#1C6DD0" },
            { label: "Active", value: activeUsersList.length, icon: "checkmark-done-outline", color: "#10B981" },
          ],
        };
      case "analytics":
        return {
          subtitle: "Track daily trends, visitor outcomes, and operational patterns across the system.",
          highlights: [
            { label: "Today", value: stats.todayVisits, icon: "calendar-outline", color: "#EF4444" },
            { label: "Tomorrow", value: stats.tomorrowVisits, icon: "calendar-clear-outline", color: "#1C6DD0" },
          ],
        };
      case "settings":
        return {
          subtitle: "Control dashboard preferences and communication settings for the admin experience.",
          highlights: [
            { label: "Dark Mode", value: settings.darkMode ? "On" : "Off", icon: "moon-outline", color: "#6B7280" },
            { label: "Email", value: settings.emailNotifications ? "On" : "Off", icon: "mail-outline", color: "#0A3D91" },
          ],
        };
      default:
        return {
          subtitle: "Review the visitor pipeline, move into the right section quickly, and keep the whole campus flow on track.",
          highlights: [
            { label: "Pending", value: stats.pendingRequests, icon: "time-outline", color: "#F59E0B" },
            { label: "Live Map", value: monitoredMapVisitors.length, icon: "map-outline", color: "#10B981" },
          ],
        };
    }
  }, [
    activeMenu,
    activeUsersList.length,
    allUsers.length,
    approvedRequests.length,
    guardUsers,
    monitoredMapVisitors.length,
    settings.darkMode,
    settings.emailNotifications,
    staffUsers,
    stats.pendingRequests,
    stats.todayVisits,
    stats.tomorrowVisits,
  ]);

  const dashboardQuickActions = useMemo(() => ([
    {
      key: "requests",
      title: "Review Requests",
      subtitle: "Approve or reject visitor requests waiting today.",
      icon: "time-outline",
      color: "#F59E0B",
      badge: `${stats.pendingRequests || 0} pending`,
      action: "requests",
    },
    {
      key: "staff",
      title: "Staff Directory",
      subtitle: "Manage staff responders and appointment owners.",
      icon: "briefcase-outline",
      color: "#10B981",
      badge: `${staffUsers.length || 0} staff`,
      action: "staff",
    },
    {
      key: "security",
      title: "Security Team",
      subtitle: "Check the operational team covering arrivals.",
      icon: "shield-checkmark-outline",
      color: "#1C6DD0",
      badge: `${guardUsers.length || 0} security`,
      action: "security",
    },
    {
      key: "users",
      title: "All Users",
      subtitle: "Audit account access across every role.",
      icon: "people-circle-outline",
      color: "#1C6DD0",
      badge: `${allUsers.length || 0} total`,
      action: "users",
    },
    {
      key: "analytics",
      title: "Analytics",
      subtitle: "See daily trends and completed visit outcomes.",
      icon: "stats-chart-outline",
      color: "#EC4899",
      badge: `${stats.todayVisits || 0} today`,
      action: "analytics",
    },
    {
      key: "map",
      title: "Campus Map",
      subtitle: "Open live monitoring on the campus map view.",
      icon: "map-outline",
      color: "#1C6DD0",
      badge: `${monitoredMapVisitors.length || 0} live`,
      action: "webmap",
    },
  ]), [
    allUsers.length,
    guardUsers.length,
    monitoredMapVisitors.length,
    staffUsers.length,
    stats.pendingRequests,
    stats.todayVisits,
  ]);

  const adminMapFilters = useMemo(() => ([
    { key: "all", label: "All", count: mapActivities.length },
    {
      key: "requests",
      label: "Requests",
      count: mapActivities.filter((activity) => getAdminMapFilterKey(activity?.activityType) === "requests").length,
    },
    {
      key: "approvals",
      label: "Approvals",
      count: mapActivities.filter((activity) => getAdminMapFilterKey(activity?.activityType) === "approvals").length,
    },
    {
      key: "movement",
      label: "Movement",
      count: mapActivities.filter((activity) => getAdminMapFilterKey(activity?.activityType) === "movement").length,
    },
    {
      key: "issues",
      label: "Issues",
      count: mapActivities.filter((activity) => getAdminMapFilterKey(activity?.activityType) === "issues").length,
    },
  ]), [mapActivities]);

  const adminMapSummaryItems = useMemo(() => ([
    { label: "Tracked", value: visibleAdminMapVisitors.length || 0, color: "#10B981" },
    { label: "Movement", value: adminMapFilters.find((item) => item.key === "movement")?.count || 0, color: "#0A3D91" },
    { label: "Issues", value: adminMapFilters.find((item) => item.key === "issues")?.count || 0, color: "#DC2626" },
  ]), [adminMapFilters, visibleAdminMapVisitors.length]);

  const applySidebarAnimation = () => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  };

  const syncLegacyMenuState = (action) => {
    setActiveMenu(action);
    setCurrentPage(1);

    switch (action) {
      case "dashboard":
        loadDashboardData();
        break;
      case "webmap":
        loadRecentActivities();
        loadAllVisitRequests();
        break;
      case "requests":
        setRequestFilter("pending");
        loadAllVisitRequests();
        break;
      case "staff":
        setUserFilter("all");
        setUserSearchQuery("");
        loadAllUsers();
        break;
      case "security":
        setUserFilter("all");
        setUserSearchQuery("");
        loadAllUsers();
        break;
      case "users":
        setUserFilter("all");
        setUserSearchQuery("");
        loadAllUsers();
        break;
      case "analytics":
        calculateDateAnalytics(selectedDate);
        break;
      case "settings":
        break;
      default:
        break;
    }
  };

  const getParentModuleForSubmodule = (submoduleKey) => {
    const moduleMatch = adminModules.find((module) =>
      module.submodules.some((submodule) => submodule.key === submoduleKey)
    );
    return moduleMatch?.key || null;
  };

  const selectAdminSubmodule = (submoduleKey, options = {}) => {
    const nextAccountMode =
      options.accountMode ??
      (submoduleKey === "account-records" ? "all" : accountRecordsMode);
    const parentModuleKey = getParentModuleForSubmodule(submoduleKey);
    const legacyMenuKey =
      submoduleKey === "dashboard"
        ? "dashboard"
        : submoduleKey === "account-create" || submoduleKey === "account-records" || submoduleKey === "data-management"
          ? "users"
          : submoduleKey.startsWith("map-")
            ? "webmap"
            : submoduleKey === "appointment-records" || submoduleKey === "appointment-management"
              ? "requests"
              : submoduleKey === "report-records" || submoduleKey === "security-report-records"
                ? "analytics"
                : submoduleKey === "settings"
                  ? "settings"
                  : "dashboard";

    applySidebarAnimation();
    setSelectedSubmodule(submoduleKey);
    setExpandedModule(parentModuleKey);
    setAccountRecordsMode(nextAccountMode);
    setSelectedAdminMapOffice("all");

    if (submoduleKey.startsWith("map-")) {
      setSelectedAdminMapFloor(FLOOR_VIEW_TO_ID[submoduleKey] || "ground");
      setRoomDraft(createRoomDraft(FLOOR_VIEW_TO_ID[submoduleKey] || "ground"));
      setEditingRoomId(null);
    }

    if (submoduleKey === "data-management") {
      setEditingFieldId(null);
      setFieldDraft(createFieldDraft());
      setUserFilter("all");
      setUserDepartmentFilter("all");
      setUserSearchTerm("");
      setUserSearchQuery("");
      setDataManagementPage(1);
      setDataManagementFieldPage(1);
      setUserDataPanelMode(null);
    }

    if (submoduleKey === "account-create") {
      resetCreateUserForm("staff");
    }

    syncLegacyMenuState(legacyMenuKey);
  };

  const handleModuleToggle = (moduleKey) => {
    applySidebarAnimation();
    setExpandedModule((currentValue) => (currentValue === moduleKey ? null : moduleKey));
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "dashboard":
        selectAdminSubmodule("dashboard");
        break;
      case "requests":
        selectAdminSubmodule("appointment-management");
        break;
      case "webmap":
        selectAdminSubmodule("map-ground");
        break;
      case "staff":
        selectAdminSubmodule("account-records", { accountMode: "staff" });
        break;
      case "security":
        selectAdminSubmodule("account-records", { accountMode: "security" });
        break;
      case "users":
        selectAdminSubmodule("account-records", { accountMode: "all" });
        break;
      case "analytics":
        selectAdminSubmodule("report-records");
        break;
      case "settings":
        applySidebarAnimation();
        setSelectedSubmodule("settings");
        setExpandedModule(null);
        syncLegacyMenuState("settings");
        break;
      default:
        Alert.alert("Coming Soon", `${action} is under development`);
    }
  };

  const performLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowLogoutConfirmModal(false);
      setShowAdminMapModal(false);
      setShowAdminMapDock(false);
      setSelectedMapActivity(null);
      setUser(null);
      authErrorHandledRef.current = false;

      try {
        await ApiService.logout();
      } catch (logoutError) {
        console.log("Logout API error (ignored):", logoutError);
      }

      await ApiService.clearAuth();
      await storageMultiRemove([
        "userData",
        "currentUser",
        "isNewRegistration",
      ]);

      if (typeof onLogout === "function") {
        onLogout();
      }

      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  }, [navigation, onLogout]);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirmModal(true);
  }, [performLogout]);

  // FIXED: Handle Approve Request
  const handleApproveRequest = async (request) => {
    const id = request._id || request.id;
    if (!id) {
      Alert.alert("Error", "Cannot find visitor ID. Please refresh and try again.");
      return;
    }
    if (!ensureAdminAccess()) return;
    if (processingId === id) return;

    setProcessingId(id);
    try {
      const response = await ApiService.approveVisitor(id, "Approved by admin");
      if (response && (response.success || response.visitor)) {
        const approvedVisitor = response.visitor || {};
        const updatedRequests = visitRequests.map(req => {
          if ((req._id === id || req.id === id)) {
            return {
              ...req,
              ...approvedVisitor,
              status: approvedVisitor.status || "approved",
              approvalStatus: approvedVisitor.approvalStatus || "approved",
            };
          }
          return req;
        });

        setVisitRequests(updatedRequests);
        setPendingRequests(updatedRequests.filter((r) => getRequestStatus(r) === "pending"));
        setApprovedRequests(updatedRequests.filter((r) => getRequestStatus(r) === "approved"));

        setStats(prev => ({
          ...prev,
          pendingRequests: updatedRequests.filter((r) => getRequestStatus(r) === "pending").length,
          approvedRequests: updatedRequests.filter((r) => getRequestStatus(r) === "approved").length,
        }));

        setShowRequestDetailsModal(false);
        setSelectedRequest(null);
        await loadAllVisitRequests();
        publishAdminNotice(
          "success",
          "Visitor approved",
          `${approvedVisitor.fullName || request.fullName || "Visitor"} is now active and visible to security.`,
        );

        Alert.alert(
          "Visitor Approved",
          `${approvedVisitor.fullName || request.fullName || "Visitor"} has been approved successfully.\n\nThe visitor account is now active.\nEmail: ${approvedVisitor.email || request.email || "N/A"}\nPassword: ${approvedVisitor.temporaryPassword || "Use the registration password"}`,
        );
      } else {
        Alert.alert("Error", response?.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Approve error:", error);
      publishAdminNotice("error", "Approval failed", error?.message || "Unable to approve the selected request.");
      Alert.alert(
        "Approval Failed",
        error?.status === 403
          ? "This action requires an admin account. Please sign in again as admin."
          : (error.message || "Failed to approve request. Please try again."),
      );
    } finally {
      setProcessingId(null);
    }
  };

  // FIXED: Handle Reject Request
  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection");
      return;
    }
    if (!ensureAdminAccess()) return;
    const id = selectedRequest?._id || selectedRequest?.id;
    if (!id) {
      Alert.alert("Error", "Cannot find visitor ID");
      return;
    }

    Alert.alert("Reject Visit Request", `Are you sure you want to reject ${selectedRequest?.fullName}'s visit?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        onPress: async () => {
          setProcessingId(id);
          try {
            const response = await ApiService.rejectVisitor(id, rejectionReason);
            if (response && (response.success || response.visitor)) {
              const updatedRequests = visitRequests.map(req => {
                if ((req._id === id || req.id === id)) {
                  return { ...req, status: "rejected", rejectionReason };
                }
                return req;
              });
              
              setVisitRequests(updatedRequests);
              setPendingRequests(updatedRequests.filter((r) => getRequestStatus(r) === "pending"));
              setRejectedRequests(updatedRequests.filter((r) => getRequestStatus(r) === "rejected"));
              
              setStats(prev => ({
                ...prev,
                pendingRequests: updatedRequests.filter((r) => getRequestStatus(r) === "pending").length,
                rejectedRequests: updatedRequests.filter((r) => getRequestStatus(r) === "rejected").length,
              }));
              
              publishAdminNotice(
                "success",
                "Request rejected",
                `${selectedRequest?.fullName || "Visitor"} was rejected and removed from the pending queue.`,
              );
              Alert.alert("Success", `${selectedRequest?.fullName} has been rejected.`);
              setShowRejectModal(false);
              setRejectionReason("");
              loadAllVisitRequests();
            } else {
              Alert.alert("Error", response?.message || "Failed to reject request");
            }
          } catch (error) {
            console.error("Reject error:", error);
            publishAdminNotice("error", "Rejection failed", error?.message || "Unable to reject the request right now.");
            Alert.alert("Error", error.message || "Failed to reject request. Please try again.");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const openCreateUserModal = (role = accountRecordsMode === "security" ? "security" : "staff") => {
    if (role === "staff") {
      resetCreateUserForm("staff");
      selectAdminSubmodule("account-create");
      return;
    }

    resetCreateUserForm(role);
    setShowAddUserModal(true);
  };

  const getStaffDepartmentOption = (department) =>
    STAFF_DEPARTMENT_OPTIONS.find((item) => item.value === department) || STAFF_DEPARTMENT_OPTIONS[0];

  const getStaffOfficerOptions = (department) =>
    STAFF_OFFICER_OPTIONS_BY_DEPARTMENT[getStaffDepartmentOption(department)?.value] ||
    STAFF_OFFICER_OPTIONS_BY_DEPARTMENT.Admissions;

  const getDefaultStaffPosition = (department) =>
    getStaffOfficerOptions(department)[0]?.value || "Staff Officer";

  const updateStaffDepartment = (target, department) => {
    const updateForm = target === "edit" ? setEditUserData : setNewUserData;
    updateForm((currentForm) => ({
      ...currentForm,
      department,
      position: getDefaultStaffPosition(department),
    }));
    setStaffDropdownOpen(null);
  };

  const updateStaffPosition = (target, position) => {
    const updateForm = target === "edit" ? setEditUserData : setNewUserData;
    updateForm((currentForm) => ({
      ...currentForm,
      position,
    }));
    setStaffDropdownOpen(null);
  };

  const normalizeUsernameInput = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

  const validateCreateUserForm = () => {
    const nextErrors = {};
    const normalizedEmail = String(newUserData.email || "").trim().toLowerCase();
    const normalizedUsername = normalizeUsernameInput(newUserData.username);

    if (!String(newUserData.firstName || "").trim()) nextErrors.firstName = "First name is required.";
    if (!String(newUserData.lastName || "").trim()) nextErrors.lastName = "Last name is required.";
    if (!normalizedEmail) nextErrors.email = "Email address is required.";
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }
    const normalizedPhone = normalizePhilippineMobileNumber(newUserData.phone);
    if (!String(newUserData.phone || "").trim()) {
      nextErrors.phone = "Contact number is required.";
    } else if (!isValidPhilippineMobileNumber(newUserData.phone)) {
      nextErrors.phone = PHILIPPINE_MOBILE_NUMBER_MESSAGE;
    }

    if (!isSecurityRole(newUserData.role)) {
      if (!normalizedUsername) nextErrors.username = "Username is required.";
      if (!String(newUserData.department || "").trim()) nextErrors.department = "Department is required.";
    }

    const existingEmail = allUsers.find(
      (userItem) => String(userItem?.email || "").trim().toLowerCase() === normalizedEmail,
    );
    if (existingEmail) {
      nextErrors.email = "This email address is already registered.";
    }

    if (normalizedUsername) {
      const existingUsername = allUsers.find(
        (userItem) => normalizeUsernameInput(userItem?.username) === normalizedUsername,
      );
      if (existingUsername) {
        nextErrors.username = "This username is already in use.";
      }
    }

    setCreateUserErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      normalizedEmail,
      normalizedUsername,
      normalizedPhone,
    };
  };

  const resetCreateUserForm = (role = "staff") => {
    setNewUserData(createEmptyUserForm(role));
    setCreateUserErrors({});
    setStaffDropdownOpen(null);
  };

  const renderCreateUserFieldError = (fieldKey) =>
    createUserErrors[fieldKey] ? (
      <Text style={styles.formErrorText}>{createUserErrors[fieldKey]}</Text>
    ) : null;

  const renderStaffDropdown = ({
    target,
    label,
    value,
    options,
    placeholder,
    icon = "chevron-down-outline",
    onSelect,
  }) => {
    const dropdownKey = `${target}-${label}`;
    const isOpen = staffDropdownOpen === dropdownKey;
    const selectedOption = options.find((item) => item.value === value);

    return (
      <View style={[styles.userEditorHalfField, styles.inputGroup]}>
        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.staffDropdownTrigger,
            isDarkMode && { backgroundColor: "#334155", borderColor: "#475569" },
          ]}
          onPress={() => setStaffDropdownOpen(isOpen ? null : dropdownKey)}
          activeOpacity={0.85}
        >
          <View style={styles.staffDropdownValueWrap}>
            <Ionicons name={icon} size={16} color="#64748B" />
            <Text style={[styles.staffDropdownValue, isDarkMode && styles.darkText]}>
              {selectedOption?.label || placeholder}
            </Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#64748B" />
        </TouchableOpacity>

        {isOpen ? (
          <View
            style={[
              styles.staffDropdownMenu,
              isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
            ]}
          >
            {options.map((item) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.staffDropdownOption,
                    isSelected && styles.staffDropdownOptionActive,
                    isDarkMode && !isSelected && { borderColor: theme.borderColor },
                  ]}
                  onPress={() => onSelect(item.value)}
                >
                  <View>
                    <Text
                      style={[
                        styles.staffDropdownOptionText,
                        isSelected && styles.staffDropdownOptionTextActive,
                        isDarkMode && !isSelected && styles.darkText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.area ? (
                      <Text
                        style={[
                          styles.staffDropdownOptionMeta,
                          isSelected && styles.staffDropdownOptionMetaActive,
                          isDarkMode && !isSelected && styles.darkTextSecondary,
                        ]}
                      >
                        {item.area}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  // FIXED: Handle Create User
  const handleCreateUser = async () => {
    if (!ensureAdminAccess()) return;
    const {
      isValid,
      normalizedEmail,
      normalizedUsername,
      normalizedPhone,
    } = validateCreateUserForm();
    if (!isValid) {
      Alert.alert("Validation Error", "Please review the highlighted fields before creating the account.");
      return;
    }

    setProcessingId("create-user");

    try {
      const isSecurityAccount = isSecurityRole(newUserData.role);
      
      const userPayload = {
        firstName: newUserData.firstName.trim(),
        lastName: newUserData.lastName.trim(),
        username: normalizedUsername || undefined,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: newUserData.role,
        status: newUserData.status || "active",
        isActive: (newUserData.status || "active") === "active",
      };

      if (newUserData.role === "staff") {
        userPayload.department = newUserData.department || "General";
        userPayload.position = newUserData.position || "Staff Member";
      } else if (newUserData.role === "security" || newUserData.role === "guard") {
        userPayload.position = newUserData.position || "Security Personnel";
        userPayload.department = "Security Department";
        userPayload.shift = newUserData.shift || "";
      }

      const response = isSecurityAccount
        ? await ApiService.createSecurityGuard({
            firstName: userPayload.firstName,
            lastName: userPayload.lastName,
            email: userPayload.email,
            phone: userPayload.phone,
            position: userPayload.position,
            shift: userPayload.shift,
          })
        : await ApiService.createStaffUser(userPayload);

      if (response && (response.success || response.user)) {
        const roleDisplay = isSecurityAccount ? "SECURITY PERSONNEL" : "STAFF MEMBER";
        const resolvedRole = isSecurityAccount ? "guard" : (response.user?.role || newUserData.role);
        const createdName = `${newUserData.firstName} ${newUserData.lastName}`.trim();
        
        const newUser = {
          ...userPayload,
          username: response.user?.username || userPayload.username,
          role: resolvedRole,
          status: response.user?.status || userPayload.status,
          isActive: response.user?.isActive ?? userPayload.isActive,
          _id: response.user?._id || response.user?.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
          employeeId: response.user?.employeeId || "Pending assignment",
        };
        
        setAllUsers(prev => [...prev, newUser]);
        
        if (newUserData.role === "staff") {
          setStaffUsers(prev => [...prev, newUser]);
        } else if (newUserData.role === "security" || newUserData.role === "guard") {
          setGuardUsers(prev => [...prev, newUser]);
        }
        
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          totalStaff: newUserData.role === "staff" ? prev.totalStaff + 1 : prev.totalStaff,
          totalGuards: (newUserData.role === "security" || newUserData.role === "guard") ? prev.totalGuards + 1 : prev.totalGuards,
          activeUsers: userPayload.status === "active" ? prev.activeUsers + 1 : prev.activeUsers,
        }));

        setShowAddUserModal(false);
        const emailDelivery = response.emailDelivery || {};
        const deliveryNote = emailDelivery.delivered
          ? `A temporary password and login details have been sent to ${newUserData.email}.`
          : emailDelivery.simulated
            ? `Account created. Credential email was simulated by the backend, so check the backend logs for delivery details.`
          : `Account created, but the credential email could not be sent. Check the backend mail logs before giving this account to the user.`;

        setCreatedUserSummary({
          name: createdName,
          email: newUserData.email,
          username: newUser.username || "N/A",
          role: roleDisplay,
          employeeId: response.user?.employeeId || "Generated automatically",
          status: userPayload.status,
          deliveryNote,
        });
        setShowCreateSuccessModal(true);
        setCreateUserErrors({});
        publishAdminNotice(
          "success",
          `${isSecurityAccount ? "Security" : "Staff"} account created`,
          `${createdName} was created successfully and can now log in.`,
        );
      } else {
        Alert.alert("Error", response?.message || response?.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Create user error:", error);
      publishAdminNotice("error", "Account creation failed", error?.message || "Unable to create the selected account.");
      const message = String(error?.message || "");
      if (message.toLowerCase().includes("email already")) {
        setCreateUserErrors((currentValue) => ({ ...currentValue, email: "This email address is already registered." }));
        Alert.alert("Email Already Used", "This email is already registered. Please use another email address.");
      } else if (message.toLowerCase().includes("username already")) {
        setCreateUserErrors((currentValue) => ({ ...currentValue, username: "This username is already in use." }));
        Alert.alert("Username Already Used", "This username is already registered. Please use another username.");
      } else {
        Alert.alert("Error", message || "Failed to create account");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditUser = (userItem) => {
    setSelectedUser(userItem);
    setEditUserData({
      id: userItem._id || userItem.id,
      firstName: userItem.firstName || "",
      lastName: userItem.lastName || "",
      username: userItem.username || "",
      email: userItem.email || "",
      phone: userItem.phone || "",
      role: userItem.role || "staff",
      department: userItem.department || "",
      employeeId: userItem.employeeId || "",
      shift: userItem.shift || "",
      position: userItem.position || "",
      status: isUserActive(userItem) ? "active" : "inactive",
      isActive: isUserActive(userItem),
    });
    if (selectedSubmodule === "data-management") {
      setUserDataPanelMode("edit");
      return;
    }
    setShowEditUserModal(true);
  };

  const handleViewUser = (userItem) => {
    setSelectedUser(userItem);
    if (selectedSubmodule === "data-management") {
      setUserDataPanelMode("view");
      return;
    }
    setShowViewUserModal(true);
  };

  const handleCloseCreateSuccessModal = async () => {
    const createdName = createdUserSummary?.name || "New user";
    setShowCreateSuccessModal(false);
    setCreatedUserSummary(null);
    resetCreateUserForm("staff");
    await loadDashboardData();
    setActiveMenu("users");
    setUserFilter("all");
    setUserSearchQuery("");
    setCurrentPage(1);
    setUserManagementStatusTab("active");
    setCreateUserMessage(`${createdName} was added successfully.`);
    setShowUserManagementModal(true);
  };

  // FIXED: Confirm Edit User
  const confirmEditUser = async () => {
    if (!ensureAdminAccess()) return;
    const selectedId = editUserData.id;
    const normalizedEmail = String(editUserData.email || "").trim().toLowerCase();
    const normalizedUsername = normalizeUsernameInput(editUserData.username);
    const normalizedEmployeeId = String(editUserData.employeeId || "").trim().toLowerCase();
    const isEditingSecurity = isSecurityRole(editUserData.role);

    if (!String(editUserData.firstName || "").trim() || !String(editUserData.lastName || "").trim()) {
      Alert.alert("Missing Details", "First name and last name are required.");
      return;
    }

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!String(editUserData.phone || "").trim()) {
      Alert.alert("Missing Contact Number", "Contact number is required.");
      return;
    }

    if (!isValidPhilippineMobileNumber(editUserData.phone)) {
      Alert.alert("Invalid Contact Number", PHILIPPINE_MOBILE_NUMBER_MESSAGE);
      return;
    }

    if (!isEditingSecurity && !String(editUserData.department || "").trim()) {
      Alert.alert("Missing Department", "Department is required for staff accounts.");
      return;
    }

    const duplicateEmail = allUsers.find(
      (userItem) =>
        String(userItem?._id || userItem?.id) !== String(selectedId) &&
        String(userItem?.email || "").trim().toLowerCase() === normalizedEmail,
    );
    if (duplicateEmail) {
      Alert.alert("Email Already Used", "This email is already registered. Please use another email address.");
      return;
    }

    if (normalizedUsername) {
      const duplicateUsername = allUsers.find(
        (userItem) =>
          String(userItem?._id || userItem?.id) !== String(selectedId) &&
          normalizeUsernameInput(userItem?.username) === normalizedUsername,
      );
      if (duplicateUsername) {
        Alert.alert("Username Already Used", "This username is already registered. Please use another username.");
        return;
      }
    }

    if (normalizedEmployeeId) {
      const duplicateEmployeeId = allUsers.find(
        (userItem) =>
          String(userItem?._id || userItem?.id) !== String(selectedId) &&
          String(userItem?.employeeId || "").trim().toLowerCase() === normalizedEmployeeId,
      );
      if (duplicateEmployeeId) {
        Alert.alert("Staff ID Already Used", "This staff/security ID is already registered.");
        return;
      }
    }

    if (!["active", "inactive", "pending", "suspended"].includes(String(editUserData.status || "").toLowerCase())) {
      Alert.alert("Invalid Status", "Please select a valid account status.");
      return;
    }

    setProcessingId("edit-user");
    try {
      const updatePayload = {
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizePhilippineMobileNumber(editUserData.phone),
        role: editUserData.role,
        department: editUserData.department,
        position: editUserData.position,
        employeeId: editUserData.employeeId,
        status: editUserData.status,
        isActive: editUserData.status === "active",
      };
      
      const response = await ApiService.updateUser(editUserData.id, updatePayload);
      if (response && (response.success || response.user)) {
        const savedUser = response.user || updatePayload;
        const updatedUsers = allUsers.map(user => {
          if ((user._id === editUserData.id || user.id === editUserData.id)) {
            return { ...user, ...savedUser };
          }
          return user;
        });

        const updatedSelectedUser = selectedUser && (
          selectedUser._id === editUserData.id || selectedUser.id === editUserData.id
        )
          ? { ...selectedUser, ...savedUser }
          : selectedUser;
        
        setAllUsers(updatedUsers);
        setStaffUsers(updatedUsers.filter(u => u.role === "staff"));
        setGuardUsers(updatedUsers.filter(u => u.role === "security" || u.role === "guard"));
        setSelectedUser(updatedSelectedUser);
        
        publishAdminNotice(
          "success",
          "User updated",
          `${editUserData.firstName} ${editUserData.lastName}'s account details were saved.`,
        );
        Alert.alert("Success", "User has been updated successfully!");
        setShowEditUserModal(false);
        if (userDataPanelMode === "edit") {
          setUserDataPanelMode("view");
        }
        await loadDashboardData();
      } else {
        Alert.alert("Error", response?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update user error:", error);
      publishAdminNotice("error", "Update failed", error?.message || "Unable to update the selected user.");
      const message = String(error?.message || "");
      if (message.toLowerCase().includes("username already")) {
        Alert.alert("Username Already Used", "This username is already registered. Please use another username.");
      } else if (message.toLowerCase().includes("staff id already")) {
        Alert.alert("Staff ID Already Used", "This staff ID is already registered. Please use another staff ID.");
      } else {
        Alert.alert("Error", error.message || "Failed to update user");
      }
    } finally {
      setProcessingId(null);
    }
  };

  // FIXED: Handle Delete User
  const handleDeleteUser = async () => {
    if (!ensureAdminAccess()) return;
    const selectedId = selectedUser?._id || selectedUser?.id;
    if (!selectedId) {
      Alert.alert("Error", "Cannot find user ID. Please refresh and try again.");
      return;
    }

    if (String(selectedId) === String(user?._id || user?.id)) {
      Alert.alert("Cannot Delete", "You cannot delete your own admin account.");
      return;
    }

    setProcessingId(`delete-user-${selectedId}`);
    try {
      const response = await ApiService.deleteUser(selectedId);
      if (response?.success) {
        const updatedUsers = allUsers.filter((entry) => entry._id !== selectedId && entry.id !== selectedId);

        setAllUsers(updatedUsers);
        setStaffUsers(updatedUsers.filter((entry) => entry.role === "staff"));
        setGuardUsers(updatedUsers.filter((entry) => entry.role === "security" || entry.role === "guard"));
        setStats((prev) => ({
          ...prev,
          totalUsers: updatedUsers.length,
          totalStaff: updatedUsers.filter((entry) => entry.role === "staff").length,
          totalGuards: updatedUsers.filter((entry) => entry.role === "security" || entry.role === "guard").length,
          activeUsers: updatedUsers.filter((entry) => entry.status === "active" || entry.isActive).length,
        }));

        publishAdminNotice(
          "success",
          "User deleted",
          `${selectedUser?.firstName || "The selected user"} was removed from the directory.`,
        );
        setShowDeleteUserModal(false);
        setShowViewUserModal(false);
        setShowEditUserModal(false);
        setSelectedUser(null);
        await loadDashboardData();
      } else {
        Alert.alert("Error", response?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      publishAdminNotice("error", "Delete failed", error?.message || "Unable to delete the selected user.");
      Alert.alert("Error", error?.message || "Failed to delete user. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUserStatus = async (userItem) => {
    if (!ensureAdminAccess()) return;

    const userId = userItem?._id || userItem?.id;
    if (!userId) {
      Alert.alert("Error", "Cannot find the selected user.");
      return;
    }

    const nextAction = isUserActive(userItem) ? "deactivate" : "activate";
    const nextStatusLabel = nextAction === "deactivate" ? "Deactivate" : "Activate";

    Alert.alert(
      `${nextStatusLabel} Account`,
      `${nextStatusLabel} ${userItem.firstName} ${userItem.lastName}'s account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextStatusLabel,
          onPress: async () => {
            try {
              setProcessingId(`toggle-user-${userId}`);
              const response = nextAction === "deactivate"
                ? await ApiService.deactivateUser(userId)
                : await ApiService.activateUser(userId);

              if (response?.success) {
                const nextStatus = nextAction === "deactivate" ? "inactive" : "active";
                const savedUser = response.user || {};
                const updatedUsers = allUsers.map((entry) =>
                  (entry._id === userId || entry.id === userId)
                    ? { ...entry, ...savedUser, status: nextStatus, isActive: nextStatus === "active" }
                    : entry,
                );

                setAllUsers(updatedUsers);
                setStaffUsers(updatedUsers.filter((entry) => entry.role === "staff"));
                setGuardUsers(updatedUsers.filter((entry) => entry.role === "security" || entry.role === "guard"));
                setSelectedUser((currentValue) => {
                  if (!currentValue || (currentValue._id !== userId && currentValue.id !== userId)) return currentValue;
                  return { ...currentValue, ...savedUser, status: nextStatus, isActive: nextStatus === "active" };
                });
                setStats((prev) => ({
                  ...prev,
                  activeUsers: updatedUsers.filter((entry) => entry.status === "active" || entry.isActive).length,
                }));

                publishAdminNotice(
                  "success",
                  `User ${nextAction}d`,
                  `${userItem.firstName} ${userItem.lastName} is now ${nextStatus}.`,
                );
                await loadDashboardData();
              } else {
                Alert.alert("Error", response?.message || `Failed to ${nextAction} user`);
              }
            } catch (error) {
              console.error("Toggle user status error:", error);
              Alert.alert("Error", error?.message || `Failed to ${nextAction} user`);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "darkMode") {
      setIsDarkMode(value);
      storageSetItem("isDarkMode", JSON.stringify(value));
    }
  };

  const saveSettings = async () => {
    if (!ensureAdminAccess()) return;
    setIsSavingSettings(true);
    try {
      await storageSetItem("adminSettings", JSON.stringify(settings));
      const response = await ApiService.updateSystemSettings(settings);
      publishAdminNotice(
        "success",
        "Settings saved",
        response?.success ? "System settings were saved successfully." : "Settings were stored locally for this admin session.",
      );
      Alert.alert("Success", response?.success ? "Settings saved successfully!" : "Settings saved locally!");
    } catch (error) {
      console.error("Save settings error:", error);
      publishAdminNotice("error", "Settings save failed", "The latest settings could not be saved.");
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const resetSettings = () => {
    Alert.alert("Reset Settings", "Are you sure you want to reset all settings to default?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setSettings({
            emailNotifications: true, smsAlerts: true, autoApprove: false, maintenanceMode: false,
            darkMode: false, twoFactorAuth: false, sessionTimeout: "30", maxLoginAttempts: "5",
            dateFormat: "MM/DD/YYYY", timeFormat: "12h", language: "en",
          });
          Alert.alert("Success", "Settings reset to default");
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (changePasswordData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const response = await ApiService.changePassword({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      });
      if (response?.success) {
        Alert.alert("Success", "Password changed successfully!");
        setShowChangePasswordModal(false);
        setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        Alert.alert("Error", response?.message || "Failed to change password");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to change password");
    }
  };

  const clearSystemData = () => {
    Alert.alert("Clear System Data", "WARNING: This will delete all system data. This action cannot be undone!", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All Data",
        style: "destructive",
        onPress: async () => {
          try {
            await storageClear();
            Alert.alert("Success", "All system data has been cleared");
            navigation.replace("Login");
          } catch (error) {
            Alert.alert("Error", "Failed to clear data");
          }
        },
      },
    ]);
  };

  const handlePrintUsers = async () => {
    const users = getFilteredUsersList();
    if (users.length === 0) {
      Alert.alert("No Data", "There are no users to print.");
      return;
    }

    const getTitle = () => {
      switch (accountRecordsMode) {
        case "staff":
          return "Staff Members List";
        case "security":
          return "Security Personnel List";
        default:
          return "Users List";
      }
    };

    try {
      const generatedAt = new Date();
      const printedBy =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email ||
        "Admin User";
      await printUserList(users, getTitle(), accountRecordsMode, {
        printedBy,
        generatedAt,
      });
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert("Error", "Failed to generate print view. Please try again.");
    }
  };

  const buildRequestPrintRows = (requests) =>
    (requests || []).map((request) => ({
      visitor: request?.fullName || "Visitor",
      email: request?.email || "-",
      purpose: request?.purposeOfVisit || request?.visitType || "-",
      office: request?.assignedOffice || request?.host || "-",
      status: getStatusColor(getRequestStatus(request)).label,
      submitted: request?.createdAt ? formatDateTime(request.createdAt) : "-",
    }));

  const buildReportPrintRows = (records) =>
    (records || []).map((visitor) => ({
      visitor: visitor?.fullName || `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim() || "Visitor",
      email: visitor?.email || "-",
      purpose: visitor?.purposeOfVisit || "-",
      office: visitor?.assignedOffice || visitor?.host || "-",
      status: getStatusColor(getRequestStatus(visitor)).label,
      visitDate: visitor?.visitDate ? formatDateTime(visitor.visitDate) : "-",
    }));

  const handlePrintRequests = async (title, requests, subtitle) => {
    const rows = buildRequestPrintRows(requests);
    if (rows.length === 0) {
      Alert.alert("No Data", "There are no records to print.");
      return;
    }

    try {
      const generatedAt = new Date();
      const printedBy =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email ||
        "Admin User";
      await printRecordsTable({
        title,
        subtitle,
        totalLabel: "requests",
        dialogTitle: title,
        printedBy,
        generatedAt,
        columns: [
          { key: "visitor", label: "Visitor" },
          { key: "email", label: "Email" },
          { key: "purpose", label: "Purpose" },
          { key: "office", label: "Office" },
          { key: "status", label: "Status" },
          { key: "submitted", label: "Submitted" },
        ],
        rows,
      });
    } catch (error) {
      console.error("Print request table error:", error);
      Alert.alert("Error", "Failed to generate the printable table.");
    }
  };

  const handlePrintReports = async () => {
    const rows = buildReportPrintRows(getFilteredHistory());
    if (rows.length === 0) {
      Alert.alert("No Data", "There are no report rows to print.");
      return;
    }

    try {
      const generatedAt = new Date();
      const printedBy =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email ||
        "Admin User";
      await printRecordsTable({
        title: "Visitor Report Records",
        subtitle: "Generated from the report records table in the admin dashboard.",
        totalLabel: "report rows",
        dialogTitle: "Print Report Records",
        printedBy,
        generatedAt,
        columns: [
          { key: "visitor", label: "Visitor" },
          { key: "email", label: "Email" },
          { key: "purpose", label: "Purpose" },
          { key: "office", label: "Office" },
          { key: "status", label: "Status" },
          { key: "visitDate", label: "Visit Date" },
        ],
        rows,
      });
    } catch (error) {
      console.error("Print report table error:", error);
      Alert.alert("Error", "Failed to generate the printable report.");
    }
  };

  const renderAdminTable = ({
    columns = [],
    rows = [],
    keyExtractor,
    emptyTitle = "No records found",
    emptySubtitle = "There is nothing to display in this table yet.",
    minTableHeight,
  }) => {
    const availableTableWidth = Platform.OS === "web"
      ? Math.max(620, width - 340)
      : Math.max(320, width - 32);
    const fallbackColumnWidth = 132;
    const totalColumnWidth = columns.reduce(
      (total, column) => total + (column.width || fallbackColumnWidth),
      0,
    );
    const columnScale = totalColumnWidth > availableTableWidth
      ? availableTableWidth / totalColumnWidth
      : 1;
    const getColumnStyle = (column) => {
      const baseWidth = column.width || fallbackColumnWidth;
      const minimumWidth = column.minWidth || (column.key === "actions" ? 132 : 86);
      const scaledWidth = Math.max(minimumWidth, Math.floor(baseWidth * columnScale));

      return {
        width: scaledWidth,
        minWidth: scaledWidth,
      };
    };

    if (!rows.length) {
      return (
        <View style={[styles.emptyState, styles.userEmptyState, isDarkMode && { backgroundColor: "#0F172A" }]}>
          <Ionicons name="reader-outline" size={56} color="#CBD5E1" />
          <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>{emptyTitle}</Text>
          <Text style={[styles.emptyStateSubtitle, isDarkMode && styles.darkTextSecondary]}>{emptySubtitle}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.adminTableScroll,
          minTableHeight ? { minHeight: minTableHeight } : null,
        ]}
        contentContainerStyle={[
          styles.adminTableScrollContent,
          minTableHeight ? { minHeight: minTableHeight } : null,
        ]}
      >
        <View
          style={[
            styles.adminTable,
            {
              width: availableTableWidth,
              minWidth: availableTableWidth,
              minHeight: minTableHeight || undefined,
            },
          ]}
        >
          <View style={[styles.adminTableHeaderRow, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
            {columns.map((column) => (
              <View key={column.key} style={[styles.adminTableCell, styles.adminTableHeaderCell, getColumnStyle(column)]}>
                <Text style={styles.adminTableHeaderText}>{column.label}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, index) => (
            <View
              key={keyExtractor ? keyExtractor(row, index) : `${index}`}
              style={[
                styles.adminTableRow,
                {
                  backgroundColor: isDarkMode ? (index % 2 === 0 ? "#111827" : "#0F172A") : index % 2 === 0 ? "#FFFFFF" : "#F8FBFE",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              {columns.map((column) => (
                <View key={column.key} style={[styles.adminTableCell, getColumnStyle(column)]}>
                  {column.render ? (
                    column.render(row)
                  ) : (
                    <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {row?.[column.key] ?? "-"}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderRecordsSearchPanel = ({
    title = "Search",
    subtitle = "Type a specific keyword, name, office, purpose, or date, then press Search.",
    value,
    onChangeText,
    onApply,
    onClear,
    placeholder,
    accent = "#1C6DD0",
  }) => (
    <View style={[styles.recordsToolPanel, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
      <View style={styles.recordsToolHeader}>
        <View style={[styles.recordsToolIcon, { backgroundColor: `${accent}16` }]}>
          <Ionicons name="search-outline" size={18} color={accent} />
        </View>
        <View style={styles.recordsToolCopy}>
          <Text style={[styles.recordsToolTitle, isDarkMode && styles.darkText]}>{title}</Text>
          <Text style={[styles.recordsToolSubtitle, isDarkMode && styles.darkTextSecondary]}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.recordsSearchRow}>
        <View style={[styles.recordsSearchInputWrap, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
          <Ionicons name="create-outline" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
          <TextInput
            style={[styles.recordsSearchInput, isDarkMode && styles.darkText]}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
            onSubmitEditing={onApply}
          />
          {value ? (
            <TouchableOpacity onPress={onClear}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={[styles.recordsSearchButton, { backgroundColor: accent }]} onPress={onApply}>
          <Ionicons name="search-outline" size={16} color="#FFFFFF" />
          <Text style={styles.recordsSearchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecordsFilterPanel = ({
    title = "Filter",
    subtitle = "Use quick shortcuts to narrow records faster.",
    filters = [],
    groups = null,
    activeValue,
    onSelect,
    accent = "#1C6DD0",
    onReset,
    footerContent = null,
    panelKey = "default",
  }) => (
    <View style={[styles.recordsToolPanel, styles.recordsFilterPanel, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
      <View style={styles.recordsToolHeader}>
        <View style={[styles.recordsToolIcon, { backgroundColor: `${accent}16` }]}>
          <Ionicons name="funnel-outline" size={18} color={accent} />
        </View>
        <View style={styles.recordsToolCopy}>
          <Text style={[styles.recordsToolTitle, isDarkMode && styles.darkText]}>{title}</Text>
          <Text style={[styles.recordsToolSubtitle, isDarkMode && styles.darkTextSecondary]}>{subtitle}</Text>
        </View>
        {onReset ? (
          <TouchableOpacity style={styles.recordsResetButton} onPress={onReset}>
            <Ionicons name="refresh-outline" size={14} color={accent} />
            <Text style={[styles.recordsResetButtonText, { color: accent }]}>Reset</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {(groups || [{ key: "default", label: null, filters, activeValue, onSelect }]).map((group) => {
        const sectionKey = `${panelKey}-${group.key}`;
        const isExpanded = !!expandedFilterSections[sectionKey];
        return (
          <View
            key={group.key}
            style={[
              styles.recordsFilterAccordion,
              isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
            ]}
          >
            <TouchableOpacity
              style={styles.recordsFilterAccordionHeader}
              onPress={() =>
                setExpandedFilterSections((current) => ({
                  ...current,
                  [sectionKey]: !current[sectionKey],
                }))
              }
              activeOpacity={0.85}
            >
              <Text style={[styles.recordsFilterGroupLabel, styles.recordsFilterAccordionLabel, isDarkMode && styles.darkTextSecondary]}>
                {group.label || "Filters"}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={group.accent || accent}
              />
            </TouchableOpacity>
            {isExpanded ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recordsFilterChips}>
                {group.filters.map((filterItem) => {
                  const isActive = group.activeValue === filterItem.key;
                  return (
                    <TouchableOpacity
                      key={filterItem.key}
                      style={[
                        styles.recordsFilterChip,
                        isActive && { backgroundColor: group.accent || accent, borderColor: group.accent || accent },
                        isDarkMode && !isActive && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
                      ]}
                      onPress={() => group.onSelect(filterItem.key)}
                      activeOpacity={0.85}
                    >
                      {filterItem.icon ? (
                        <Ionicons name={filterItem.icon} size={14} color={isActive ? "#FFFFFF" : group.accent || accent} />
                      ) : null}
                      <Text style={[styles.recordsFilterChipText, isActive && styles.recordsFilterChipTextActive, isDarkMode && !isActive && styles.darkTextSecondary]}>
                        {filterItem.label}{typeof filterItem.count === "number" ? ` (${filterItem.count})` : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        );
      })}

      {footerContent ? (
        <View
          style={[
            styles.recordsFilterAccordion,
            styles.recordsFilterFooter,
            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
          ]}
        >
          <TouchableOpacity
            style={styles.recordsFilterAccordionHeader}
            onPress={() =>
              setExpandedFilterSections((current) => ({
                ...current,
                [`${panelKey}-date-range`]: !current[`${panelKey}-date-range`],
              }))
            }
            activeOpacity={0.85}
          >
            <Text style={[styles.recordsFilterGroupLabel, styles.recordsFilterAccordionLabel, isDarkMode && styles.darkTextSecondary]}>
              Exact Date Range
            </Text>
            <Ionicons
              name={expandedFilterSections[`${panelKey}-date-range`] ? "chevron-up-outline" : "chevron-down-outline"}
              size={16}
              color={accent}
            />
          </TouchableOpacity>
          {expandedFilterSections[`${panelKey}-date-range`] ? footerContent : null}
        </View>
      ) : null}
    </View>
  );

  const renderCompactPagination = ({
    currentPage,
    totalPages,
    itemCount,
    itemLabel,
    onPrevious,
    onNext,
  }) => (
    <View style={styles.userPaginationRow}>
      <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
        Page {currentPage} of {totalPages} • {itemCount} {itemLabel}
      </Text>
      <View style={styles.userPaginationControls}>
        <TouchableOpacity
          style={[styles.userPaginationButton, currentPage === 1 && styles.userPaginationButtonDisabled]}
          onPress={onPrevious}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back-outline"
            size={14}
            color={currentPage === 1 ? "#94A3B8" : "#334155"}
          />
          <Text
            style={[
              styles.userPaginationButtonText,
              currentPage === 1 && styles.userPaginationButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userPaginationButton, currentPage === totalPages && styles.userPaginationButtonDisabled]}
          onPress={onNext}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.userPaginationButtonText,
              currentPage === totalPages && styles.userPaginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={14}
            color={currentPage === totalPages ? "#94A3B8" : "#334155"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDateRangeControls = ({
    accent = "#1C6DD0",
    startDate,
    endDate,
    onPickStart,
    onPickEnd,
    onClear,
  }) => (
    <View style={styles.recordsDateRangeWrap}>
      <Text style={[styles.recordsFilterGroupLabel, isDarkMode && styles.darkTextSecondary]}>
        Exact Date Range
      </Text>
      <View style={styles.recordsDateRangeRow}>
        <TouchableOpacity
          style={[
            styles.recordsDateButton,
            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
          ]}
          onPress={onPickStart}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={14} color={accent} />
          <Text style={[styles.recordsDateButtonText, isDarkMode && styles.darkText]}>
            {startDate ? formatFilterDateLabel(startDate) : "Start Date"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.recordsDateButton,
            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
          ]}
          onPress={onPickEnd}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-clear-outline" size={14} color={accent} />
          <Text style={[styles.recordsDateButtonText, isDarkMode && styles.darkText]}>
            {endDate ? formatFilterDateLabel(endDate) : "End Date"}
          </Text>
        </TouchableOpacity>
        {(startDate || endDate) ? (
          <TouchableOpacity style={styles.recordsDateClearButton} onPress={onClear} activeOpacity={0.85}>
            <Ionicons name="close-circle-outline" size={14} color={accent} />
            <Text style={[styles.recordsDateClearText, { color: accent }]}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderBarChart = (labels, data) => {
    const max = Math.max(...(data || [0]), 1);
    const chartColors = ["#1C6DD0", "#1C6DD0", "#1C6DD0", "#1C6DD0", "#F59E0B", "#EF4444"];
    return (
      <View style={styles.analyticsBarChart}>
        {(labels || []).map((label, index) => {
          const value = data?.[index] || 0;
          const percentage = value === 0 ? 0 : Math.max(8, Math.round((value / max) * 100));
          const barColor = chartColors[index % chartColors.length];
          return (
            <View key={`${label}-${index}`} style={styles.analyticsBarRow}>
              <View style={styles.analyticsBarMeta}>
                <Text style={[styles.analyticsBarLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.analyticsBarValue, { color: theme.textPrimary }]}>{value}</Text>
              </View>
              <View style={[styles.analyticsBarTrack, { backgroundColor: isDarkMode ? "#334155" : "#E2E8F0" }]}>
                <View
                  style={[
                    styles.analyticsBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: barColor,
                      opacity: value === 0 ? 0 : 1,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const handleFilterDateSelection = (event, date) => {
    if (Platform.OS !== "ios") {
      setActiveFilterDateField(null);
    }

    if (!date || !activeFilterDateField) {
      return;
    }

    if (activeFilterDateField === "request-start") {
      setRequestDateRange((currentRange) => ({
        ...currentRange,
        startDate: date,
      }));
    } else if (activeFilterDateField === "request-end") {
      setRequestDateRange((currentRange) => ({
        ...currentRange,
        endDate: date,
      }));
    } else if (activeFilterDateField === "history-start") {
      setHistoryDateRange((currentRange) => ({
        ...currentRange,
        startDate: date,
      }));
    } else if (activeFilterDateField === "history-end") {
      setHistoryDateRange((currentRange) => ({
        ...currentRange,
        endDate: date,
      }));
    }
  };

  const renderRequestCard = (request) => {
    const id = getId(request) || `${request?.email || "request"}-${request?.visitDate || request?.createdAt || Date.now()}`;
    const statusInfo = getStatusColor(getRequestStatus(request));

    return (
      <TouchableOpacity
        key={id}
        activeOpacity={0.85}
        onPress={() => {
          setSelectedRequest(request);
          setShowRequestDetailsModal(true);
        }}
        style={[
          styles.dashboardRequestCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderColor,
          },
        ]}
      >
        <View style={styles.dashboardRequestCardTop}>
          <View style={styles.dashboardRequestCardInfo}>
            <Text style={[styles.dashboardRequestName, { color: theme.textPrimary }]}>
              {request?.fullName || "Unknown Visitor"}
            </Text>
            <Text style={[styles.dashboardRequestEmail, { color: theme.textSecondary }]}>
              {request?.email || "No email"}
            </Text>
            <Text style={[styles.dashboardRequestPurpose, { color: theme.textSecondary }]}>
              {request?.purposeOfVisit || "No purpose provided"}
            </Text>
            <Text style={[styles.dashboardRequestTime, { color: theme.textSecondary }]}>
              {formatDateTime(request?.visitDate || request?.createdAt)}
            </Text>
          </View>

          <View style={styles.dashboardRequestRight}>
            <View style={[styles.dashboardStatusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.dashboardStatusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
            </View>
            <Text style={[styles.dashboardRequestDate, { color: theme.textSecondary }]}>
              {formatDate(request?.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAdminMapFilters = () => (
    <View
      style={[
        styles.adminMapFilters,
        {
          backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
          borderColor: theme.borderColor,
        },
      ]}
    >
      <Text style={[styles.adminMapFilterLabel, isDarkMode && styles.darkTextSecondary]}>Floor</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminMapFilterRow}>
        {ADMIN_MAP_FLOORS.map((floor) => {
          const isActive = selectedAdminMapFloor === floor.id;
          return (
            <TouchableOpacity
              key={floor.id}
              style={[
                styles.adminMapFilterChip,
                isActive && styles.adminMapFilterChipActive,
                isDarkMode && !isActive && { backgroundColor: "#111827", borderColor: theme.borderColor },
              ]}
              onPress={() => {
                setSelectedAdminMapFloor(floor.id);
                setSelectedAdminMapOffice("all");
              }}
            >
              <Text style={[styles.adminMapFilterChipText, isActive && styles.adminMapFilterChipTextActive]}>
                {floor.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.adminMapFilterLabel, isDarkMode && styles.darkTextSecondary]}>Office</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminMapFilterRow}>
        <TouchableOpacity
          style={[
            styles.adminMapFilterChip,
            selectedAdminMapOffice === "all" && styles.adminMapFilterChipActive,
            isDarkMode && selectedAdminMapOffice !== "all" && { backgroundColor: "#111827", borderColor: theme.borderColor },
          ]}
          onPress={() => setSelectedAdminMapOffice("all")}
        >
          <Text
            style={[
              styles.adminMapFilterChipText,
              selectedAdminMapOffice === "all" && styles.adminMapFilterChipTextActive,
            ]}
          >
            All Offices
          </Text>
        </TouchableOpacity>
        {managedRooms.filter(
          (office) => normalizeMonitoringFloor(office.floor) === normalizeMonitoringFloor(selectedAdminMapFloor),
        ).map((office) => {
          const isActive = selectedAdminMapOffice === office.name;
          return (
            <TouchableOpacity
              key={office.id}
              style={[
                styles.adminMapFilterChip,
                isActive && styles.adminMapFilterChipActive,
                isDarkMode && !isActive && { backgroundColor: "#111827", borderColor: theme.borderColor },
              ]}
              onPress={() => setSelectedAdminMapOffice(office.name)}
            >
              <Text style={[styles.adminMapFilterChipText, isActive && styles.adminMapFilterChipTextActive]}>
                {office.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.adminMapLegend}>
        {[
          { label: "Approvals", color: "#10B981" },
          { label: "Requests", color: "#F59E0B" },
          { label: "Issues", color: "#DC2626" },
          { label: "Movement", color: "#0A3D91" },
        ].map((item) => (
          <View key={item.label} style={styles.adminMapLegendItem}>
            <View style={[styles.adminMapLegendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.adminMapLegendText, isDarkMode && styles.darkTextSecondary]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAdminActivityFilters = () => (
    <View
      style={[
        styles.adminMapActivityFilterPanel,
        {
          backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
          borderColor: theme.borderColor,
        },
      ]}
    >
      <Text style={[styles.adminMapFilterLabel, isDarkMode && styles.darkTextSecondary]}>Activity Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminMapFilterRow}>
        {adminMapFilters.map((filterItem) => {
          const isActive = adminMapFilter === filterItem.key;
          return (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.adminMapFilterChip,
                isActive && styles.adminMapFilterChipActive,
                isDarkMode && !isActive && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
              ]}
              onPress={() => setAdminMapFilter(filterItem.key)}
            >
              <Text style={[styles.adminMapFilterChipText, isActive && styles.adminMapFilterChipTextActive]}>
                {filterItem.label} ({filterItem.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderAdminMonitoringDock = () => (
    <View
      style={[
        styles.adminMonitoringDock,
        {
          backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
          borderColor: theme.borderColor,
        },
      ]}
    >
      <View style={[styles.adminMonitoringDockHeader, { borderBottomColor: theme.borderColor }]}>
        <View>
          <Text style={[styles.adminMonitoringDockTitle, isDarkMode && styles.darkText]}>Campus Monitoring</Text>
          <Text style={[styles.adminMonitoringDockSubtitle, isDarkMode && styles.darkTextSecondary]}>
            Shared live map for approved visitors, check-ins, and admin actions.
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdminMapDock(false)} style={styles.adminMonitoringDockClose}>
          <Ionicons name="close" size={20} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.adminMonitoringDockBody} showsVerticalScrollIndicator={false}>
        <SharedMonitoringMap
          title="Live Monitoring Map"
          subtitle="Dashboard monitoring panel for admin and security."
          iconName="radio-outline"
          iconColor="#10B981"
          actionLabel="Expand"
          onActionPress={() => setShowAdminMapModal(true)}
          controls={renderAdminMapFilters()}
          visitors={visibleAdminMapVisitors}
          floors={ADMIN_MAP_FLOORS}
          offices={managedRooms}
          selectedFloor={selectedAdminMapFloor}
          selectedOffice={selectedAdminMapOffice}
          mapBlueprints={MONITORING_MAP_BLUEPRINTS}
          officePositions={managedRoomPositions}
          onFloorChange={(floorId) => {
            setSelectedAdminMapFloor(floorId);
            setSelectedAdminMapOffice("all");
          }}
          onVisitorSelect={(item) => setSelectedMapActivity(item)}
          hoveredVisitor={activeMapActivity}
          backgroundColor={isDarkMode ? "#0F172A" : "#F8FBFE"}
          borderColor={theme.borderColor}
          mapBackgroundColor={isDarkMode ? "#111827" : "#FFFFFF"}
          textPrimary={theme.textPrimary}
          textSecondary={theme.textSecondary}
          summaryItems={adminMapSummaryItems}
          statusLabel="Admin monitoring"
          showFloorNavigation={false}
        />

        <View style={[styles.adminMapSideCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flash-outline" size={18} color="#1C6DD0" />
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Focus Activity</Text>
            </View>
          </View>

          {activeMapActivity ? (
            <View
              style={[
                styles.adminMapFocusCard,
                {
                  backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: "800", marginBottom: 4 }}>
                {activeMapActivity.name}
              </Text>
              <Text style={{ color: "#1C6DD0", fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
                {activeMapActivity.eventLabel}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19 }}>
                {activeMapActivity.detail}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>
                {getMapTrackingSourceLabel(activeMapActivity)} · {getMapFreshnessLabel(activeMapActivity.lastUpdate)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
              Select a marker or live activity to inspect it here.
            </Text>
          )}

          {renderAdminActivityFilters()}

          <View style={styles.adminMapActivityList}>
            {filteredMapActivities.length > 0 ? filteredMapActivities.slice(0, 6).map((activity, index) => {
              const marker = visibleAdminMapVisitors[index];
              return (
                <TouchableOpacity
                  key={activity._id || `${activity.activityType}-${index}-dock`}
                  onPress={() => marker && setSelectedMapActivity(marker)}
                  style={[styles.adminMapActivityItem, index === 0 && { borderTopWidth: 0 }, index > 0 && { borderTopColor: theme.borderColor }]}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: "700", marginBottom: 3 }}>
                    {getActivityLabel(activity.activityType)}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18 }}>
                    {activity.notes || activity.relatedVisitor?.fullName || "Recent system action"}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4, fontWeight: "700" }}>
                    SafePass ID: {getVisitorSafePassId(activity)}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
                No live activity for this filter yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderAdminMapWorkspace = () => (
    <View style={[styles.analyticsSplitGrid, width < 1200 && styles.analyticsSplitGridStack, { marginBottom: 14 }]}>
      <View style={styles.analyticsPrimaryColumn}>
        <View style={[styles.adminMapSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <SharedMonitoringMap
            title="Live Monitoring Map"
            subtitle="Track approvals, appointment requests, and gate activity with the same shared monitoring map used by security."
            iconName="map-outline"
            iconColor="#10B981"
            actionLabel="Full Screen"
            onActionPress={() => setShowAdminMapModal(true)}
            controls={renderAdminMapFilters()}
            visitors={visibleAdminMapVisitors}
            floors={ADMIN_MAP_FLOORS}
            offices={managedRooms}
            selectedFloor={selectedAdminMapFloor}
            selectedOffice={selectedAdminMapOffice}
            mapBlueprints={MONITORING_MAP_BLUEPRINTS}
            officePositions={managedRoomPositions}
            onFloorChange={(floorId) => {
              setSelectedAdminMapFloor(floorId);
              setSelectedAdminMapOffice("all");
            }}
            onVisitorSelect={(item) => setSelectedMapActivity(item)}
            hoveredVisitor={activeMapActivity}
            backgroundColor={theme.cardBackground}
            borderColor={theme.borderColor}
            mapBackgroundColor={isDarkMode ? "#0F172A" : "#FFFFFF"}
            textPrimary={theme.textPrimary}
            textSecondary={theme.textSecondary}
            summaryItems={adminMapSummaryItems}
            statusLabel="Admin monitoring"
            showFloorNavigation={false}
            containerStyle={{ padding: 0, borderWidth: 0 }}
            mapWrapperStyle={styles.adminMapContainer}
          />
        </View>
      </View>

      <View style={styles.analyticsSideColumn}>
        <View style={[styles.adminMapSideCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="radio-outline" size={20} color="#1C6DD0" />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Activity Monitor</Text>
            </View>
            <TouchableOpacity onPress={loadRecentActivities}>
              <Text style={styles.viewAll}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {renderAdminActivityFilters()}

          <View style={styles.adminMapSummaryGrid}>
            {[
              { label: "Requests", value: adminMapFilters.find((item) => item.key === "requests")?.count || 0, color: "#F59E0B" },
              { label: "Approvals", value: adminMapFilters.find((item) => item.key === "approvals")?.count || 0, color: "#10B981" },
              { label: "Movement", value: adminMapFilters.find((item) => item.key === "movement")?.count || 0, color: "#0A3D91" },
              { label: "Issues", value: adminMapFilters.find((item) => item.key === "issues")?.count || 0, color: "#DC2626" },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.adminMapSummaryCard,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={{ color: item.color, fontSize: 20, fontWeight: "800" }}>{item.value || 0}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: "700", marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>

          {activeMapActivity ? (
            <View
              style={[
                styles.adminMapFocusCard,
                {
                  backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: "800", marginBottom: 4 }}>
                {activeMapActivity.name}
              </Text>
              <Text style={{ color: "#1C6DD0", fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
                {activeMapActivity.eventLabel}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19 }}>
                {activeMapActivity.detail}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>
                {getMapTrackingSourceLabel(activeMapActivity)} · {getMapFreshnessLabel(activeMapActivity.lastUpdate)}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                {formatDateTime(activeMapActivity.lastUpdate)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
              No live admin activity is available yet.
            </Text>
          )}

          <View style={styles.adminMapActivityList}>
            {filteredMapActivities.length > 0 ? filteredMapActivities.slice(0, 5).map((activity, index) => {
              const marker = visibleAdminMapVisitors[index];
              return (
                <TouchableOpacity
                  key={activity._id || `${activity.activityType}-${index}`}
                  onPress={() => marker && setSelectedMapActivity(marker)}
                  style={[styles.adminMapActivityItem, index === 0 && { borderTopWidth: 0 }, index > 0 && { borderTopColor: theme.borderColor }]}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
                    {getActivityLabel(activity.activityType)}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19 }}>
                    {activity.notes || activity.relatedVisitor?.fullName || "Recent system action"}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontWeight: "700" }}>
                    SafePass ID: {getVisitorSafePassId(activity)}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6 }}>
                    {formatDate(activity.timestamp)}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
                No live map activity is available for this filter yet.
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderDashboardContent = () => (
    <ScrollView
      style={styles.contentScrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
        <View style={styles.pageContainer}>
          <View style={styles.pageHeader}>
            <Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>Dashboard Overview</Text>
            <TouchableOpacity style={styles.pageRefreshButton} onPress={loadDashboardData}>
              <Ionicons name="refresh-outline" size={22} color="#1C6DD0" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={isDarkMode ? ["#0F172A", "#1E293B"] : ["#0A3D91", "#1C6DD0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.dashboardHeroCard,
            isDarkMode && { borderColor: "#334155" },
          ]}
        >
          <View style={styles.dashboardHeroLeft}>
            <Text style={styles.dashboardHeroEyebrow}>Admin Dashboard</Text>
            <Text style={styles.dashboardHeroTitle}>
              Welcome back, {user?.firstName || "Admin"}
            </Text>
            <Text style={styles.dashboardHeroSubtitle}>
              Track campus activity, account operations, appointments, and live visitor movement from one command view.
            </Text>
          </View>
          <HoverBubble
            style={styles.dashboardHeroBadge}
            onPress={() => setShowPendingRequestsModal(true)}
            hoverScale={1.07}
          >
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.dashboardHeroBadgeText}>
              {pendingRequests.length || stats.pendingRequests || 0} request alerts
            </Text>
          </HoverBubble>
        </LinearGradient>

        <View style={styles.dashboardStatsGrid}>
          {[
            { label: "Pending Requests", value: stats.pendingRequests || 0, icon: "time-outline", color: "#F59E0B" },
            { label: "Today Visits", value: stats.todayVisits || 0, icon: "calendar-outline", color: "#1C6DD0" },
            { label: "Live Visitors", value: monitoredMapVisitors.length || stats.activeVisitors || stats.checkedInVisitors || 0, icon: "locate-outline", color: "#10B981" },
            { label: "Total Accounts", value: allUsers.length || stats.totalUsers || 0, icon: "people-outline", color: "#7C3AED" },
          ].map((item) => (
            <HoverBubble
              key={item.label}
              hoverScale={1.045}
              style={[
                styles.dashboardStatCard,
                {
                  width: width > 1100 ? "24%" : width > 760 ? "48%" : "100%",
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.dashboardStatHeader}>
                <Text style={[styles.dashboardStatLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                <View style={[styles.dashboardStatIcon, { backgroundColor: `${item.color}16` }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
              </View>
              <Text style={[styles.dashboardStatValue, { color: theme.textPrimary }]}>{item.value}</Text>
            </HoverBubble>
          ))}
        </View>

        <View style={styles.quickActionsGrid}>
          {dashboardQuickActions.slice(0, 4).map((item) => (
            <HoverBubble
              key={item.key}
              hoverScale={1.055}
              style={[
                styles.quickActionCard,
                {
                  width: width > 1100 ? "24%" : width > 760 ? "48%" : "100%",
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
              onPress={() => handleMenuAction(item.action)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={[styles.quickActionTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.quickActionBadge, { backgroundColor: `${item.color}14` }]}>
                <Text style={[styles.quickActionBadgeText, { color: item.color }]}>{item.badge}</Text>
              </View>
            </HoverBubble>
          ))}
        </View>

        <HoverBubble
          hoverScale={1.04}
          style={[
            styles.dashboardNotificationCard,
            { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
          ]}
          onPress={() => setShowPendingRequestsModal(true)}
        >
          <View style={styles.dashboardNotificationLeft}>
            <View style={styles.dashboardNotificationIcon}>
              <Ionicons name="notifications-outline" size={22} color="#F59E0B" />
            </View>
            <View style={styles.dashboardNotificationTextWrap}>
              <Text style={[styles.dashboardNotificationTitle, { color: theme.textPrimary }]}>
                Pending request notifications
              </Text>
              <Text style={[styles.dashboardNotificationText, { color: theme.textSecondary }]}>
                {pendingRequests.length
                  ? `${pendingRequests.length} visitor request${pendingRequests.length > 1 ? "s" : ""} need review.`
                  : "No pending request alerts right now."}
              </Text>
            </View>
          </View>
          <View style={styles.dashboardNotificationBadge}>
            <Text style={styles.dashboardNotificationBadgeText}>Open</Text>
          </View>
        </HoverBubble>

        {renderAdminMapWorkspace()}
      </View>
    </ScrollView>
  );

  const handleRoomDraftChange = (field, value) => {
    setRoomDraft((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const resetRoomEditor = (floor = selectedMapModuleFloor) => {
    setEditingRoomId(null);
    setRoomDraft(createRoomDraft(floor));
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room.id);
    setRoomDraft({
      id: room.id,
      name: room.name,
      floor: room.floor,
      icon: room.icon || "business-outline",
      x: String(managedRoomPositions?.[room.id]?.x ?? 50),
      y: String(managedRoomPositions?.[room.id]?.y ?? 50),
    });
  };

  const handleDeleteRoom = (room) => {
    Alert.alert(
      "Delete Room",
      `Remove ${room.name} from ${ADMIN_MODULE_FLOORS.find((floor) => floor.id === room.floor)?.name || "this floor"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setManagedRooms((currentRooms) => currentRooms.filter((item) => item.id !== room.id));
            setManagedRoomPositions((currentPositions) => {
              const nextPositions = { ...currentPositions };
              delete nextPositions[room.id];
              return nextPositions;
            });
            if (editingRoomId === room.id) {
              resetRoomEditor(room.floor);
            }
          },
        },
      ],
    );
  };

  const submitRoomDraft = () => {
    if (!editingRoomId) {
      Alert.alert("Select a room", "Choose a room from the list first, then rename it.");
      return;
    }

    const trimmedName = roomDraft.name.trim();
    if (!trimmedName) {
      Alert.alert("Room name required", "Please enter a room name before saving.");
      return;
    }

    const currentRoom = managedRooms.find((room) => room.id === editingRoomId);
    if (!currentRoom) {
      Alert.alert("Room not found", "Please choose the room again before renaming it.");
      resetRoomEditor(selectedMapModuleFloor);
      return;
    }

    const roomId = currentRoom.id;
    const nextRoom = {
      ...currentRoom,
      name: trimmedName,
    };

    setManagedRooms((currentRooms) => {
      return currentRooms.map((room) => (room.id === roomId ? nextRoom : room));
    });

    resetRoomEditor(roomDraft.floor);
  };

  const handleFieldDraftChange = (field, value) => {
    setFieldDraft((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const resetFieldEditor = () => {
    setEditingFieldId(null);
    setFieldDraft(createFieldDraft());
  };

  const handleEditField = (field) => {
    setEditingFieldId(field.id);
    setFieldDraft({
      id: field.id,
      label: field.label,
      type: field.type || "text",
      required: !!field.required,
      enabled: field.enabled !== false,
      scope: field.scope || "visitor",
    });
  };

  const handleDeleteField = (field) => {
    Alert.alert(
      "Delete Field",
      `Remove ${field.label} from the data collection builder?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDataCollectionFields((currentFields) =>
              currentFields.filter((item) => item.id !== field.id),
            );
            setDataManagementFieldPage(1);
            if (editingFieldId === field.id) {
              resetFieldEditor();
            }
          },
        },
      ],
    );
  };

  const submitFieldDraft = () => {
    const trimmedLabel = fieldDraft.label.trim();
    if (!trimmedLabel) {
      Alert.alert("Field label required", "Please enter a field label before saving.");
      return;
    }

    const fieldId = editingFieldId || normalizeTextToId(fieldDraft.id || trimmedLabel);
    const nextField = {
      id: fieldId,
      label: trimmedLabel,
      type: fieldDraft.type || "text",
      required: !!fieldDraft.required,
      enabled: fieldDraft.enabled !== false,
      scope: fieldDraft.scope || "visitor",
    };

    setDataCollectionFields((currentFields) => {
      const hasExistingField = currentFields.some((field) => field.id === fieldId);
      if (hasExistingField) {
        return currentFields.map((field) => (field.id === fieldId ? nextField : field));
      }
      return [...currentFields, nextField];
    });

    setDataManagementFieldPage(1);
    resetFieldEditor();
  };

  const renderAccountCreationContent = () => {
    const isCreatingSecurity = isSecurityRole(newUserData.role);
    const creationRoleColor = isCreatingSecurity ? "#1C6DD0" : "#10B981";
    const creationRoleIcon = isCreatingSecurity ? "shield-checkmark-outline" : "briefcase-outline";
    const creationRoleLabel = isCreatingSecurity ? "Security" : "Staff";
    const creationRoleInitials = isCreatingSecurity ? "SE" : "ST";

    return (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Creation of Account"
          subtitle="Admins can create both staff and security accounts here from the same control area."
          badge="Admin only"
          isDarkMode={isDarkMode}
          theme={theme}
        >
          <View
            style={[
              styles.modularInfoPanel,
              {
                backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                borderColor: theme.borderColor,
                marginBottom: 16,
              },
            ]}
          >
            <Text style={[styles.modularInfoTitle, isDarkMode && styles.darkText]}>
              Choose account type
            </Text>
            <Text style={[styles.createUserHeroText, isDarkMode && styles.darkTextSecondary, { marginBottom: 14 }]}>
              Select the account you want to create. The form below will update for that user type.
            </Text>
            <View style={styles.managementQuickStatsRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.managementQuickStatCard,
                  {
                    backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
                    borderColor: newUserData.role === "staff" ? "#10B981" : theme.borderColor,
                    flex: 1,
                  },
                ]}
                onPress={() => resetCreateUserForm("staff")}
              >
                <View style={[styles.managementQuickStatIcon, { backgroundColor: "rgba(16,185,129,0.14)" }]}>
                  <Ionicons name="briefcase-outline" size={18} color="#10B981" />
                </View>
                <Text style={[styles.managementQuickStatValue, { color: "#10B981" }]}>Create Staff</Text>
                <Text style={[styles.managementQuickStatLabel, isDarkMode && styles.darkTextSecondary]}>
                  Staff Account
                </Text>
                <Text style={[styles.managementQuickStatMeta, isDarkMode && styles.darkTextSecondary]}>
                  {staffUsers.length} existing staff
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.managementQuickStatCard,
                  {
                    backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
                    borderColor: isCreatingSecurity ? "#1C6DD0" : theme.borderColor,
                    flex: 1,
                  },
                ]}
                onPress={() => resetCreateUserForm("security")}
              >
                <View style={[styles.managementQuickStatIcon, { backgroundColor: "rgba(139,92,246,0.14)" }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#1C6DD0" />
                </View>
                <Text style={[styles.managementQuickStatValue, { color: "#1C6DD0" }]}>Create Security</Text>
                <Text style={[styles.managementQuickStatLabel, isDarkMode && styles.darkTextSecondary]}>
                  Security Account
                </Text>
                <Text style={[styles.managementQuickStatMeta, isDarkMode && styles.darkTextSecondary]}>
                  {guardUsers.length} existing guards
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.staffCreationLayout}>
            <View
              style={[
                styles.staffCreationFormCard,
                {
                  backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={[styles.createUserHero, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                <View style={[styles.userProfileAvatar, { backgroundColor: `${creationRoleColor}18` }]}>
                  <Text style={[styles.userProfileAvatarText, { color: creationRoleColor }]}>{creationRoleInitials}</Text>
                </View>
                <View style={styles.createUserHeroCopy}>
                  <Text style={[styles.createUserHeroTitle, isDarkMode && styles.darkText]}>
                    {creationRoleLabel} Account Setup
                  </Text>
                  <Text style={[styles.createUserHeroText, isDarkMode && styles.darkTextSecondary]}>
                    Fill in the {creationRoleLabel.toLowerCase()} credentials below. The account record will refresh after a successful save.
                  </Text>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Identity</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>First Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.firstName && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.firstName}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, firstName: text }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, firstName: null }));
                      }}
                      placeholder="Enter first name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("firstName")}
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Last Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.lastName && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.lastName}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, lastName: text }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, lastName: null }));
                      }}
                      placeholder="Enter last name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("lastName")}
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Account Details</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Username *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.username && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.username}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, username: normalizeUsernameInput(text) }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, username: null }));
                      }}
                      placeholder="Choose a username"
                      autoCapitalize="none"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("username")}
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Email Address *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.email && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.email}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, email: text }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, email: null }));
                      }}
                      placeholder="staff@sapphire.edu"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("email")}
                  </View>
                </View>

                <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                  <Ionicons name="mail-outline" size={16} color="#0A3D91" />
                  <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                    A temporary password will be sent to the user's Gmail after account creation.
                  </Text>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Work Profile</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>{isCreatingSecurity ? "Generated Security ID" : "Generated Staff ID"}</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="card-outline" size={16} color="#0A3D91" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {getGeneratedEmployeeIdPreview()}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Contact Number *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.phone && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.phone}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, phone: text }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, phone: null }));
                      }}
                      placeholder="09123456789"
                      keyboardType="phone-pad"
                      maxLength={16}
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("phone")}
                  </View>
                </View>

                <View style={styles.userEditorGrid}>
                  {isCreatingSecurity ? (
                    <>
                      <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Department</Text>
                        <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                          <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
                          <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                            Security Department
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Position</Text>
                        <TextInput
                          style={[
                            styles.input,
                            isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                          ]}
                          value={newUserData.position}
                          onChangeText={(text) => setNewUserData((currentValue) => ({ ...currentValue, position: text }))}
                          placeholder="Security Personnel"
                          placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      {renderStaffDropdown({
                        target: "create",
                        label: "Department *",
                        value: newUserData.department,
                        options: STAFF_DEPARTMENT_OPTIONS,
                        placeholder: "Choose department",
                        icon: "business-outline",
                        onSelect: (department) => {
                          updateStaffDepartment("create", department);
                          setCreateUserErrors((currentValue) => ({ ...currentValue, department: null }));
                        },
                      })}
                      {renderStaffDropdown({
                        target: "create",
                        label: "Officer Type",
                        value: newUserData.position,
                        options: getStaffOfficerOptions(newUserData.department),
                        placeholder: "Choose officer type",
                        icon: "id-card-outline",
                        onSelect: (position) => {
                          updateStaffPosition("create", position);
                        },
                      })}
                    </>
                  )}
                </View>
                {renderCreateUserFieldError("department")}

                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Assigned Area</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {isCreatingSecurity ? "Security Post / Gate Operations" : getStaffDepartmentOption(newUserData.department)?.area || "General Area"}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Status</Text>
                    <View style={styles.roleSelector}>
                      {[
                        { key: "active", label: "Active" },
                        { key: "inactive", label: "Inactive" },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.key}
                          style={[
                            styles.roleOption,
                            newUserData.status === option.key && styles.roleOptionActive,
                            isDarkMode && newUserData.status !== option.key && { backgroundColor: "#334155", borderColor: "#475569" },
                          ]}
                          onPress={() => setNewUserData((currentValue) => ({ ...currentValue, status: option.key }))}
                        >
                          <Text
                            style={[
                              styles.roleText,
                              newUserData.status === option.key && styles.roleTextActive,
                              isDarkMode && newUserData.status !== option.key && { color: "#CBD5E1" },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.modalFooter, styles.inlineCreateFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
                <TouchableOpacity
                  style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]}
                  onPress={() => resetCreateUserForm(newUserData.role)}
                >
                  <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: creationRoleColor }]}
                  onPress={handleCreateUser}
                  disabled={processingId === "create-user"}
                >
                  {processingId === "create-user" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create {creationRoleLabel} Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.staffCreationAside}>
              <View
                style={[
                  styles.modularInfoPanel,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularInfoTitle, isDarkMode && styles.darkText]}>
                  {creationRoleLabel} account checklist
                </Text>
                <View style={styles.staffChecklist}>
                  {(isCreatingSecurity ? [
                    "Admin creates and assigns the security role automatically.",
                    "Email and security ID are checked for duplicates.",
                    "Password can be entered manually or generated automatically.",
                    "Saved accounts appear immediately in Security Records.",
                  ] : [
                    "Admin creates and assigns the staff role automatically.",
                    "Email, username, and staff ID are checked for duplicates.",
                    "Password and confirm password must match before saving.",
                    "Saved accounts appear immediately in Staff Records.",
                  ]).map((item) => (
                    <View key={item} style={styles.staffChecklistItem}>
                      <Ionicons name="checkmark-circle" size={18} color={creationRoleColor} />
                      <Text style={[styles.staffChecklistText, isDarkMode && styles.darkTextSecondary]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                style={[
                  styles.modularInfoPanel,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularInfoTitle, isDarkMode && styles.darkText]}>
                  Current {creationRoleLabel.toLowerCase()} records
                </Text>
                <View style={styles.modularInfoStats}>
                  {(isCreatingSecurity ? [
                    { label: "Security", value: guardUsers.length, color: "#1C6DD0" },
                    { label: "Active", value: guardUsers.filter((item) => isUserActive(item)).length, color: "#0A3D91" },
                    { label: "Inactive", value: guardUsers.filter((item) => !isUserActive(item)).length, color: "#EF4444" },
                  ] : [
                    { label: "Staff", value: staffUsers.length, color: "#10B981" },
                    { label: "Active", value: staffUsers.filter((item) => isUserActive(item)).length, color: "#0A3D91" },
                    { label: "Inactive", value: staffUsers.filter((item) => !isUserActive(item)).length, color: "#EF4444" },
                  ]).map((item) => (
                    <View
                      key={item.label}
                      style={[
                        styles.modularInfoStatCard,
                        {
                          backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                          borderColor: theme.borderColor,
                        },
                      ]}
                    >
                      <Text style={[styles.modularInfoStatValue, { color: item.color }]}>{item.value}</Text>
                      <Text style={[styles.modularInfoStatLabel, isDarkMode && styles.darkTextSecondary]}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.managementSecondaryButton, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}
                  onPress={() => selectAdminSubmodule("account-records", { accountMode: isCreatingSecurity ? "security" : "staff" })}
                >
                  <Ionicons name="reader-outline" size={18} color={creationRoleColor} />
                  <Text style={[styles.managementSecondaryButtonText, { color: creationRoleColor }]}>
                    Open {creationRoleLabel} Records
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AdminSectionShell>
      </View>
    </ScrollView>
    );
  };

  const renderUserDataPanel = () => {
    if (!userDataPanelMode || !selectedUser) return null;

    const isEditing = userDataPanelMode === "edit";
    const panelUser = isEditing ? editUserData : selectedUser;
    const roleColor = getRoleColor(panelUser?.role);
    const infoItems = [
      { label: "Username", value: selectedUser?.username || "Not set", icon: "person-outline" },
      { label: "Phone", value: selectedUser?.phone || "No phone number", icon: "call-outline" },
      { label: "Employee ID", value: selectedUser?.employeeId || "Not assigned", icon: "card-outline" },
      { label: "Department", value: selectedUser?.department || "General", icon: "business-outline" },
      { label: "Position", value: selectedUser?.position || (isSecurityRole(selectedUser?.role) ? "Security Personnel" : "Not set"), icon: "briefcase-outline" },
      { label: "Status", value: isUserActive(selectedUser) ? "Active" : "Inactive", icon: "checkmark-circle-outline" },
    ];

    return (
      <View style={[styles.userDataBottomPanel, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
        <View style={styles.userDataPanelHeader}>
          <View style={styles.userDataPanelIdentity}>
            <View style={[styles.userProfileAvatar, styles.userDataPanelAvatar, { backgroundColor: `${roleColor}16` }]}>
              <Text style={[styles.userProfileAvatarText, { color: roleColor }]}>
                {getUserInitials(panelUser)}
              </Text>
            </View>
            <View style={styles.userDataPanelTitleBlock}>
              <Text style={[styles.userDataPanelTitle, isDarkMode && styles.darkText]}>
                {isEditing ? "Edit Account" : "Account Details"}
              </Text>
              <Text style={[styles.userDataPanelSubtitle, isDarkMode && styles.darkTextSecondary]}>
                {panelUser?.firstName || "User"} {panelUser?.lastName || ""} • {panelUser?.email || "No email"}
              </Text>
              <View style={styles.userProfileBadgeRow}>
                <View style={[styles.userProfileBadge, { backgroundColor: `${roleColor}14` }]}>
                  <Text style={[styles.userProfileBadgeText, { color: roleColor }]}>
                    {formatRoleLabel(panelUser?.role)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.userProfileBadge,
                    { backgroundColor: isUserActive(panelUser) ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)" },
                  ]}
                >
                  <Text
                    style={[
                      styles.userProfileBadgeText,
                      { color: isUserActive(panelUser) ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {isUserActive(panelUser) ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.userDataPanelActions}>
            {!isEditing ? (
              <TouchableOpacity style={styles.dataManagementPrimaryButton} onPress={() => handleEditUser(selectedUser)}>
                <Ionicons name="create-outline" size={15} color="#FFFFFF" />
                <Text style={styles.dataManagementPrimaryButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.dataManagementGhostButton, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}
              onPress={() => setUserDataPanelMode(null)}
            >
              <Ionicons name="close-outline" size={16} color="#0A3D91" />
              <Text style={styles.dataManagementGhostButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.userDataEditGrid}>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>First Name</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.firstName}
                onChangeText={(text) => setEditUserData({ ...editUserData, firstName: text })}
                placeholder="First name"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Last Name</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.lastName}
                onChangeText={(text) => setEditUserData({ ...editUserData, lastName: text })}
                placeholder="Last name"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Username</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.username}
                onChangeText={(text) => setEditUserData({ ...editUserData, username: normalizeUsernameInput(text) })}
                placeholder="Username"
                autoCapitalize="none"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Email</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.email}
                onChangeText={(text) => setEditUserData({ ...editUserData, email: text })}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Phone</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.phone}
                onChangeText={(text) => setEditUserData({ ...editUserData, phone: text })}
                placeholder="09123456789"
                keyboardType="phone-pad"
                maxLength={16}
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Employee ID</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.employeeId}
                onChangeText={(text) => setEditUserData({ ...editUserData, employeeId: text })}
                placeholder="Staff / Security ID"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Department</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.department}
                onChangeText={(text) => setEditUserData({ ...editUserData, department: text })}
                placeholder="Department"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Position</Text>
              <TextInput
                style={[styles.input, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor, color: "#F8FBFE" }]}
                value={editUserData.position}
                onChangeText={(text) => setEditUserData({ ...editUserData, position: text })}
                placeholder="Position"
                placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              />
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Role</Text>
              <View style={styles.userDataCompactOptions}>
                {["staff", "security", "admin", "visitor"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.userDataCompactOption,
                      editUserData.role === role && styles.userDataCompactOptionActive,
                    ]}
                    onPress={() => setEditUserData({ ...editUserData, role })}
                  >
                    <Text style={[styles.userDataCompactOptionText, editUserData.role === role && styles.userDataCompactOptionTextActive]}>
                      {formatRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.userEditorHalfField, styles.inputGroup]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Status</Text>
              <View style={styles.userDataCompactOptions}>
                {["active", "inactive"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.userDataCompactOption,
                      editUserData.status === status && styles.userDataCompactOptionActive,
                    ]}
                    onPress={() => setEditUserData({ ...editUserData, status, isActive: status === "active" })}
                  >
                    <Text style={[styles.userDataCompactOptionText, editUserData.status === status && styles.userDataCompactOptionTextActive]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.userDataPanelFooter}>
              <TouchableOpacity
                style={[styles.dataManagementGhostButton, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}
                onPress={() => selectedUser && handleViewUser(selectedUser)}
              >
                <Ionicons name="arrow-back-outline" size={15} color="#0A3D91" />
                <Text style={styles.dataManagementGhostButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dataManagementPrimaryButton}
                onPress={confirmEditUser}
                disabled={processingId === "edit-user"}
              >
                <Ionicons name="save-outline" size={15} color="#FFFFFF" />
                <Text style={styles.dataManagementPrimaryButtonText}>
                  {processingId === "edit-user" ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.userDataInfoGrid}>
            {infoItems.map((item) => (
              <View key={item.label} style={[styles.userDataInfoCard, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
                <Ionicons name={item.icon} size={16} color="#0A3D91" />
                <View style={styles.userDataInfoCopy}>
                  <Text style={styles.userProfileInfoLabel}>{item.label}</Text>
                  <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDataManagementContent = () => (
    <ScrollView
      ref={dataManagementScrollViewRef}
      style={styles.contentScrollView}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="User Data Management"
          subtitle="Select a user account first, then view or edit the details connected to that account."
          badge={`${dataManagementUsers.length} users`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <TouchableOpacity style={styles.pageRefreshButton} onPress={loadAllUsers}>
              <Ionicons name="refresh-outline" size={22} color="#0A3D91" />
            </TouchableOpacity>
          }
        >
          <View
            style={[
              styles.modularEditorCard,
              {
                backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                borderColor: theme.borderColor,
                marginBottom: 18,
              },
            ]}
          >
            <Text style={[styles.modularEditorTitle, isDarkMode && styles.darkText]}>
              Select User to Manage
            </Text>
            <Text style={[styles.modularListMeta, isDarkMode && styles.darkTextSecondary]}>
              Search or filter the account list, then choose View or Edit.
            </Text>

            <View style={styles.dataManagementToolbar}>
              <View style={[styles.dataManagementSearchBox, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
                <Ionicons name="search-outline" size={17} color="#0A3D91" />
                <TextInput
                  style={[styles.dataManagementSearchInput, isDarkMode && styles.darkText]}
                  placeholder="Search name, email, username, phone, staff ID..."
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={userSearchTerm}
                  onChangeText={setUserSearchTerm}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    setUserSearchQuery(userSearchTerm.trim());
                    setDataManagementPage(1);
                  }}
                />
                {userSearchTerm ? (
                  <TouchableOpacity
                    onPress={() => {
                      setUserSearchTerm("");
                      setUserSearchQuery("");
                      setDataManagementPage(1);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.dataManagementPrimaryButton}
                onPress={() => {
                  setUserSearchQuery(userSearchTerm.trim());
                  setDataManagementPage(1);
                }}
              >
                <Ionicons name="search-outline" size={15} color="#FFFFFF" />
                <Text style={styles.dataManagementPrimaryButtonText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dataManagementGhostButton, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}
                onPress={() => {
                  setUserSearchTerm("");
                  setUserSearchQuery("");
                  setUserFilter("all");
                  setUserDepartmentFilter("all");
                  setDataManagementPage(1);
                }}
              >
                <Ionicons name="refresh-outline" size={15} color="#0A3D91" />
                <Text style={styles.dataManagementGhostButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.dataManagementFilterBox, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
              <View style={styles.dataManagementFilterRow}>
                <Text style={[styles.dataManagementFilterLabel, isDarkMode && styles.darkTextSecondary]}>Role</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dataManagementChipRow}>
                  {dataManagementRoleFilters.map((filterItem) => {
                    const isActive = userFilter === filterItem.key;
                    return (
                      <TouchableOpacity
                        key={filterItem.key}
                        style={[
                          styles.dataManagementChip,
                          isActive && styles.dataManagementChipActive,
                          isDarkMode && !isActive && { backgroundColor: "#111827", borderColor: theme.borderColor },
                        ]}
                        onPress={() => {
                          setUserFilter(filterItem.key);
                          setDataManagementPage(1);
                        }}
                      >
                        <Ionicons name={filterItem.icon} size={13} color={isActive ? "#FFFFFF" : "#0A3D91"} />
                        <Text style={[styles.dataManagementChipText, isActive && styles.dataManagementChipTextActive]}>
                          {filterItem.label} ({filterItem.count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              <View style={styles.dataManagementFilterRow}>
                <Text style={[styles.dataManagementFilterLabel, isDarkMode && styles.darkTextSecondary]}>Office</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dataManagementChipRow}>
                  {dataManagementDepartmentFilterOptions.map((filterItem) => {
                    const isActive = userDepartmentFilter === filterItem.key;
                    return (
                      <TouchableOpacity
                        key={filterItem.key}
                        style={[
                          styles.dataManagementChip,
                          isActive && styles.dataManagementChipActive,
                          isDarkMode && !isActive && { backgroundColor: "#111827", borderColor: theme.borderColor },
                        ]}
                        onPress={() => {
                          setUserDepartmentFilter(filterItem.key);
                          setDataManagementPage(1);
                        }}
                      >
                        <Ionicons name={filterItem.icon} size={13} color={isActive ? "#FFFFFF" : "#0A3D91"} />
                        <Text style={[styles.dataManagementChipText, isActive && styles.dataManagementChipTextActive]}>
                          {filterItem.label} ({filterItem.count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {renderAdminTable({
              rows: paginatedDataManagementUsers,
              keyExtractor: (userItem) => userItem._id || userItem.id || userItem.email,
              emptyTitle: "No users found",
              emptySubtitle: "Try clearing the search or filter to find the account you want to manage.",
              minTableHeight: 372,
              columns: [
                {
                  key: "name",
                  label: "User",
                  width: 220,
                  render: (userItem) => {
                    const roleColor = getRoleColor(userItem.role);
                    return (
                      <View style={styles.adminTableIdentityCell}>
                        <View style={[styles.userAvatar, { backgroundColor: `${roleColor}18` }]}>
                          <Text style={[styles.userAvatarInitials, { color: roleColor }]}>
                            {getUserInitials(userItem)}
                          </Text>
                        </View>
                        <View style={styles.adminTableIdentityCopy}>
                          <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                            {userItem.firstName} {userItem.lastName}
                          </Text>
                          <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                            {userItem.email || "No email"}
                          </Text>
                        </View>
                      </View>
                    );
                  },
                },
                {
                  key: "role",
                  label: "Role",
                  width: 105,
                  render: (userItem) => {
                    const roleColor = getRoleColor(userItem.role);
                    return (
                      <View style={[styles.roleBadge, { backgroundColor: `${roleColor}14`, alignSelf: "flex-start" }]}>
                        <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                          {formatRoleLabel(userItem.role)}
                        </Text>
                      </View>
                    );
                  },
                },
                {
                  key: "department",
                  label: "Department",
                  width: 140,
                  render: (userItem) => (
                    <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {userItem.department || "General"}
                    </Text>
                  ),
                },
                {
                  key: "contact",
                  label: "Contact",
                  width: 160,
                  render: (userItem) => (
                    <View>
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {userItem.username || "-"}
                      </Text>
                      <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                        {userItem.phone || "No phone"}
                      </Text>
                    </View>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  width: 100,
                  render: (userItem) => {
                    const userIsActive = isUserActive(userItem);
                    return (
                      <View
                        style={[
                          styles.userLiveStatusBadge,
                          {
                            backgroundColor: userIsActive ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                            alignSelf: "flex-start",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.userLiveStatusText,
                            { color: userIsActive ? "#10B981" : "#EF4444" },
                          ]}
                        >
                          {userIsActive ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    );
                  },
                },
                {
                  key: "actions",
                  label: "Manage",
                  width: 140,
                  render: (userItem) => (
                    <View style={styles.adminTableActionRow}>
                      <TouchableOpacity
                        style={[styles.adminTableActionButton, { borderColor: "rgba(59,130,246,0.24)", backgroundColor: "rgba(59,130,246,0.12)" }]}
                        onPress={() => handleViewUser(userItem)}
                      >
                        <Text style={[styles.adminTableActionText, { color: "#0A3D91" }]}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.adminTableActionButton, { borderColor: "rgba(16,185,129,0.24)", backgroundColor: "rgba(16,185,129,0.12)" }]}
                        onPress={() => handleEditUser(userItem)}
                      >
                        <Text style={[styles.adminTableActionText, { color: "#10B981" }]}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ),
                },
              ],
            })}
            <View style={styles.userPaginationRow}>
              <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
                Showing {dataManagementVisibleStart}-{dataManagementVisibleEnd} of {dataManagementUsers.length} users
              </Text>
              <View style={styles.userPaginationControls}>
                <TouchableOpacity
                  style={[
                    styles.userPaginationButton,
                    dataManagementPage === 1 && styles.userPaginationButtonDisabled,
                  ]}
                  onPress={() => setDataManagementPage((page) => Math.max(1, page - 1))}
                  disabled={dataManagementPage === 1}
                >
                  <Ionicons name="chevron-back-outline" size={16} color={dataManagementPage === 1 ? "#94A3B8" : "#334155"} />
                  <Text style={[styles.userPaginationButtonText, dataManagementPage === 1 && styles.userPaginationButtonTextDisabled]}>
                    Previous
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
                  Page {dataManagementPage} of {dataManagementTotalPages}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.userPaginationButton,
                    dataManagementPage >= dataManagementTotalPages && styles.userPaginationButtonDisabled,
                  ]}
                  onPress={() => setDataManagementPage((page) => Math.min(dataManagementTotalPages, page + 1))}
                  disabled={dataManagementPage >= dataManagementTotalPages}
                >
                  <Text style={[styles.userPaginationButtonText, dataManagementPage >= dataManagementTotalPages && styles.userPaginationButtonTextDisabled]}>
                    Next
                  </Text>
                  <Ionicons name="chevron-forward-outline" size={16} color={dataManagementPage >= dataManagementTotalPages ? "#94A3B8" : "#334155"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {renderUserDataPanel()}

          {false ? (
          <View
            style={[
              styles.modularEditorCard,
              {
                backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                borderColor: theme.borderColor,
                marginBottom: 18,
              },
            ]}
          >
            <Text style={[styles.modularEditorTitle, isDarkMode && styles.darkText]}>
              Form Field Setup
            </Text>
            <Text style={[styles.modularListMeta, isDarkMode && styles.darkTextSecondary]}>
              Optional setup for the fields collected in future visitor/admin workflows.
            </Text>
          </View>
          ) : null}

          {false ? (
          <View style={styles.modularTwoColumnLayout}>
            <View
              style={[
                styles.modularEditorCard,
                {
                  backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={[styles.modularEditorTitle, isDarkMode && styles.darkText]}>
                {editingFieldId ? "Edit field" : "Add field"}
              </Text>
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Field label"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={fieldDraft.label}
                onChangeText={(value) => handleFieldDraftChange("label", value)}
              />
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Field type (text, email, select...)"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={fieldDraft.type}
                onChangeText={(value) => handleFieldDraftChange("type", value)}
              />
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Scope (visitor, admin, security...)"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={fieldDraft.scope}
                onChangeText={(value) => handleFieldDraftChange("scope", value)}
              />

              <View style={styles.modularSwitchRow}>
                <Text style={[styles.modularSwitchLabel, isDarkMode && styles.darkText]}>Required</Text>
                <Switch
                  value={!!fieldDraft.required}
                  onValueChange={(value) => handleFieldDraftChange("required", value)}
                />
              </View>
              <View style={styles.modularSwitchRow}>
                <Text style={[styles.modularSwitchLabel, isDarkMode && styles.darkText]}>Enabled</Text>
                <Switch
                  value={fieldDraft.enabled !== false}
                  onValueChange={(value) => handleFieldDraftChange("enabled", value)}
                />
              </View>

              <View style={styles.modularEditorActions}>
                <TouchableOpacity style={styles.submitButton} onPress={submitFieldDraft}>
                  <Text style={styles.submitButtonText}>{editingFieldId ? "Save Field" : "Add Field"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={resetFieldEditor}>
                  <Text style={styles.cancelButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.modularEditorCard,
                {
                  backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={[styles.modularEditorTitle, isDarkMode && styles.darkText]}>
                Current fields
              </Text>
              {renderAdminTable({
                rows: paginatedDataCollectionFields,
                keyExtractor: (field) => field.id,
                emptyTitle: "No fields configured",
                emptySubtitle: "Add a field to start shaping the data collection setup.",
                columns: [
                  {
                    key: "field",
                    label: "Field",
                    width: 190,
                    render: (field) => (
                      <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                        {field.label}
                      </Text>
                    ),
                  },
                  {
                    key: "type",
                    label: "Type",
                    width: 120,
                    render: (field) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {field.type || "text"}
                      </Text>
                    ),
                  },
                  {
                    key: "scope",
                    label: "Scope",
                    width: 130,
                    render: (field) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {field.scope || "visitor"}
                      </Text>
                    ),
                  },
                  {
                    key: "required",
                    label: "Required",
                    width: 120,
                    render: (field) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {field.required ? "Required" : "Optional"}
                      </Text>
                    ),
                  },
                  {
                    key: "enabled",
                    label: "Status",
                    width: 110,
                    render: (field) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {field.enabled ? "Enabled" : "Disabled"}
                      </Text>
                    ),
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    width: 150,
                    render: (field) => (
                      <View style={styles.adminTableActionRow}>
                        <TouchableOpacity
                          style={[styles.adminTableActionButton, { borderColor: "rgba(37,99,235,0.24)", backgroundColor: "rgba(37,99,235,0.12)" }]}
                          onPress={() => handleEditField(field)}
                        >
                          <Text style={[styles.adminTableActionText, { color: "#0A3D91" }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.adminTableActionButton, { borderColor: "rgba(239,68,68,0.22)", backgroundColor: "rgba(239,68,68,0.12)" }]}
                          onPress={() => handleDeleteField(field)}
                        >
                          <Text style={[styles.adminTableActionText, { color: "#EF4444" }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ),
                  },
                ],
              })}
              <View style={styles.userPaginationRow}>
                <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
                  Showing {fieldSetupVisibleStart}-{fieldSetupVisibleEnd} of {dataCollectionFields.length} fields
                </Text>
                <View style={styles.userPaginationControls}>
                  <TouchableOpacity
                    style={[
                      styles.userPaginationButton,
                      dataManagementFieldPage === 1 && styles.userPaginationButtonDisabled,
                    ]}
                    onPress={() => setDataManagementFieldPage((page) => Math.max(1, page - 1))}
                    disabled={dataManagementFieldPage === 1}
                  >
                    <Ionicons name="chevron-back-outline" size={16} color={dataManagementFieldPage === 1 ? "#94A3B8" : "#334155"} />
                    <Text style={[styles.userPaginationButtonText, dataManagementFieldPage === 1 && styles.userPaginationButtonTextDisabled]}>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
                    Page {dataManagementFieldPage} of {fieldSetupTotalPages}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.userPaginationButton,
                      dataManagementFieldPage >= fieldSetupTotalPages && styles.userPaginationButtonDisabled,
                    ]}
                    onPress={() => setDataManagementFieldPage((page) => Math.min(fieldSetupTotalPages, page + 1))}
                    disabled={dataManagementFieldPage >= fieldSetupTotalPages}
                  >
                    <Text style={[styles.userPaginationButtonText, dataManagementFieldPage >= fieldSetupTotalPages && styles.userPaginationButtonTextDisabled]}>
                      Next
                    </Text>
                    <Ionicons name="chevron-forward-outline" size={16} color={dataManagementFieldPage >= fieldSetupTotalPages ? "#94A3B8" : "#334155"} />
                  </TouchableOpacity>
                </View>
              </View>
              {false ? (
              <View style={styles.modularListStack}>
                {dataCollectionFields.map((field) => (
                  <View
                    key={field.id}
                    style={[
                      styles.modularListCard,
                      {
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                        borderColor: theme.borderColor,
                      },
                    ]}
                  >
                    <View style={styles.modularListHeader}>
                      <View style={styles.modularListCopy}>
                        <Text style={[styles.modularListTitle, isDarkMode && styles.darkText]}>{field.label}</Text>
                        <Text style={[styles.modularListMeta, isDarkMode && styles.darkTextSecondary]}>
                          {field.type} • {field.scope} • {field.required ? "Required" : "Optional"} • {field.enabled ? "Enabled" : "Disabled"}
                        </Text>
                      </View>
                      <View style={styles.modularInlineActions}>
                        <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleEditField(field)}>
                          <Ionicons name="create-outline" size={16} color="#0A3D91" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleDeleteField(field)}>
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              ) : null}
            </View>
          </View>
          ) : null}
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderFloorMapContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title={ADMIN_MODULE_FLOORS.find((floor) => floor.id === selectedMapModuleFloor)?.name || "Floor Map"}
          subtitle="Use the shared map canvas on the left and rename existing room labels from the panel on the right."
          badge={`${selectedFloorRooms.length} rooms`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <TouchableOpacity
              style={styles.pageRefreshButton}
              onPress={() => {
                setSelectedAdminMapFloor(selectedMapModuleFloor);
                loadRecentActivities();
              }}
            >
              <Ionicons name="refresh-outline" size={22} color="#10B981" />
            </TouchableOpacity>
          }
        >
          <View style={styles.modularTwoColumnLayout}>
            <View style={styles.modularMapColumn}>
              <SharedMonitoringMap
                title={ADMIN_MODULE_FLOORS.find((floor) => floor.id === selectedMapModuleFloor)?.name || "Floor Map"}
                subtitle="Tracked visitors appear here while admin-managed rooms stay editable in the adjacent panel."
                iconName="map-outline"
                iconColor="#10B981"
                visitors={visibleAdminMapVisitors}
                floors={ADMIN_MODULE_FLOORS}
                offices={managedRooms}
                selectedFloor={selectedMapModuleFloor}
                selectedOffice={selectedAdminMapOffice}
                mapBlueprints={MONITORING_MAP_BLUEPRINTS}
                officePositions={managedRoomPositions}
                onFloorChange={(floorId) => {
                  const floorViewKey = Object.entries(FLOOR_VIEW_TO_ID).find(([, floorValue]) => floorValue === floorId)?.[0];
                  if (floorViewKey) {
                    selectAdminSubmodule(floorViewKey);
                  }
                }}
                onVisitorSelect={(item) => setSelectedMapActivity(item)}
                hoveredVisitor={activeMapActivity}
                backgroundColor="transparent"
                borderColor={theme.borderColor}
                mapBackgroundColor={isDarkMode ? "#0F172A" : "#FFFFFF"}
                textPrimary={theme.textPrimary}
                textSecondary={theme.textSecondary}
                showFloorNavigation={false}
                containerStyle={{ padding: 0, borderWidth: 0 }}
                mapWrapperStyle={styles.adminMapModalMapWrap}
              />
            </View>

            <View
              style={[
                styles.modularEditorCard,
                styles.modularRoomsPanel,
                {
                  backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={[styles.modularEditorTitle, isDarkMode && styles.darkText]}>
                {editingRoomId ? "Rename room" : "Rename a room"}
              </Text>
              <Text style={[styles.modularEditorHint, isDarkMode && styles.darkTextSecondary]}>
                Tap the pencil beside any room below, then update its display name here.
              </Text>
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Room name"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={roomDraft.name}
                onChangeText={(value) => handleRoomDraftChange("name", value)}
              />

              <View style={styles.modularEditorActions}>
                <TouchableOpacity style={styles.submitButton} onPress={submitRoomDraft}>
                  <Text style={styles.submitButtonText}>Save Name</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => resetRoomEditor(selectedMapModuleFloor)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modularEditorTitle, styles.modularEditorSecondaryTitle, isDarkMode && styles.darkText]}>
                Floor rooms
              </Text>

              <View style={styles.modularListStack}>
                {selectedFloorRooms.length > 0 ? (
                  <>
                    <View
                      style={[
                        styles.modularRoomTable,
                        {
                          backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                          borderColor: theme.borderColor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.modularRoomTableHeader,
                          {
                            backgroundColor: isDarkMode ? "#111827" : "#EEF5FF",
                            borderColor: theme.borderColor,
                          },
                        ]}
                      >
                        <Text style={styles.modularRoomTableHeaderText}>Room</Text>
                        <Text style={styles.modularRoomTableHeaderText}>Position</Text>
                        <Text style={[styles.modularRoomTableHeaderText, styles.modularRoomTableActionsHeader]}>Actions</Text>
                      </View>

                      {paginatedSelectedFloorRooms.map((room, index) => (
                        <View
                          key={room.id}
                          style={[
                            styles.modularRoomTableRow,
                            {
                              backgroundColor:
                                isDarkMode
                                  ? index % 2 === 0
                                    ? "#0F172A"
                                    : "#111827"
                                  : index % 2 === 0
                                    ? "#FFFFFF"
                                    : "#F8FBFE",
                              borderColor: theme.borderColor,
                            },
                          ]}
                        >
                          <View style={styles.modularRoomTableNameCell}>
                            <Text
                              style={[styles.modularListTitle, isDarkMode && styles.darkText]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {room.name}
                            </Text>
                          </View>
                          <Text style={[styles.modularListMeta, styles.modularRoomTablePositionCell, isDarkMode && styles.darkTextSecondary]}>
                            {managedRoomPositions?.[room.id]?.x ?? 50}, {managedRoomPositions?.[room.id]?.y ?? 50}
                          </Text>
                          <View style={[styles.modularInlineActions, styles.modularRoomTableActionsCell]}>
                            <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleEditRoom(room)}>
                              <Ionicons name="create-outline" size={16} color="#0A3D91" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleDeleteRoom(room)}>
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>

                    {roomManagementTotalPages > 1
                      ? renderCompactPagination({
                          currentPage: roomManagementPage,
                          totalPages: roomManagementTotalPages,
                          itemCount: selectedFloorRooms.length,
                          itemLabel: "rooms",
                          onPrevious: () => setRoomManagementPage((page) => Math.max(1, page - 1)),
                          onNext: () =>
                            setRoomManagementPage((page) =>
                              Math.min(roomManagementTotalPages, page + 1),
                            ),
                        })
                      : null}
                  </>
                ) : (
                  <View
                    style={[
                      styles.modularEmptyState,
                      {
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                        borderColor: theme.borderColor,
                      },
                    ]}
                  >
                    <Ionicons name="business-outline" size={24} color="#94A3B8" />
                    <Text style={[styles.modularEmptyStateText, isDarkMode && styles.darkTextSecondary]}>
                      No rooms configured for this floor yet.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderAppointmentRecordsContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Appointment Records"
          subtitle="Read through approved appointment records after staff approval."
          badge={`${appointmentRecords.length} records`}
          isDarkMode={isDarkMode}
          theme={theme}
        >
          <View style={styles.modularCardGrid}>
            {[
              { label: "Total Records", value: appointmentRecords.length, color: "#EC4899" },
              { label: "Pending Queue", value: pendingAppointmentRequests.length, color: "#F59E0B" },
              { label: "Approved", value: appointmentRecords.length, color: "#10B981" },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.modularStatCard,
                  {
                    backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularStatValue, { color: item.color }]}>{item.value}</Text>
                <Text style={[styles.modularStatLabel, isDarkMode && styles.darkTextSecondary]}>{item.label}</Text>
              </View>
            ))}
          </View>

          {renderAdminTable({
            rows: paginatedAppointmentRecords,
            keyExtractor: (request) => request._id || request.id || request.email,
            emptyTitle: "No appointment records",
            emptySubtitle: "Pending appointment requests will appear here only after staff approval.",
            columns: [
              {
                key: "visitor",
                label: "Visitor",
                width: 210,
                render: (request) => (
                  <View>
                    <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                      {request.fullName || "Visitor"}
                    </Text>
                    <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                      {request.email || "-"}
                    </Text>
                    <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                      SafePass ID: {getVisitorSafePassId(request)}
                    </Text>
                  </View>
                ),
              },
              {
                key: "purpose",
                label: "Purpose",
                width: 210,
                render: (request) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {request.purposeOfVisit || request.visitType || "-"}
                  </Text>
                ),
              },
              {
                key: "office",
                label: "Office",
                width: 180,
                render: (request) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {request.assignedOffice || request.host || "-"}
                  </Text>
                ),
              },
              {
                key: "status",
                label: "Status",
                width: 120,
                render: (request) => {
                  const statusInfo = getStatusColor(getRequestStatus(request));
                  return (
                    <View style={[styles.dashboardStatusBadge, { backgroundColor: statusInfo.bg, alignSelf: "flex-start" }]}>
                      <Text style={[styles.dashboardStatusText, { color: statusInfo.text }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  );
                },
              },
              {
                key: "submitted",
                label: "Submitted",
                width: 170,
                render: (request) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {request.createdAt ? formatDateTime(request.createdAt) : "-"}
                  </Text>
                ),
              },
            ],
          })}

          {appointmentRecords.length ? (
            renderCompactPagination({
              currentPage: appointmentRecordsPage,
              totalPages: appointmentRecordsPageCount,
              itemCount: appointmentRecords.length,
              itemLabel: "records",
              onPrevious: () => setAppointmentRecordsPage((currentValue) => Math.max(1, currentValue - 1)),
              onNext: () =>
                setAppointmentRecordsPage((currentValue) =>
                  Math.min(appointmentRecordsPageCount, currentValue + 1),
                ),
            })
          ) : null}
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderAppointmentOptionManager = ({ title, subtitle, groupKey, placeholder, icon }) => {
    const options = appointmentManagementOptions[groupKey] || [];
    const editingId =
      editingAppointmentOption?.groupKey === groupKey ? editingAppointmentOption.optionId : null;
    const enabledCount = options.filter((option) => option.enabled !== false).length;

    return (
      <View
        style={[
          styles.appointmentOptionCard,
          {
            backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
            borderColor: theme.borderColor,
          },
        ]}
      >
        <View style={styles.appointmentOptionHeader}>
          <View style={styles.appointmentOptionIcon}>
            <Ionicons name={icon} size={20} color="#0A3D91" />
          </View>
          <View style={styles.appointmentOptionTitleBlock}>
            <Text style={[styles.appointmentOptionTitle, isDarkMode && styles.darkText]}>{title}</Text>
            <Text style={[styles.appointmentOptionSubtitle, isDarkMode && styles.darkTextSecondary]}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.appointmentOptionCountBadge}>
            <Text style={styles.appointmentOptionCountText}>
              {enabledCount}/{options.length || 0}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentOptionAddRow}>
          <TextInput
            style={[styles.appointmentOptionInput, isDarkMode && styles.darkInput]}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
            value={appointmentOptionDrafts[groupKey]}
            onChangeText={(value) => setAppointmentOptionDrafts((prev) => ({ ...prev, [groupKey]: value }))}
          />
          <HoverBubble
            style={styles.appointmentOptionAddButton}
            disabled={isSavingAppointmentOptions}
            onPress={() => handleAddAppointmentOption(groupKey)}
            hoverScale={1.04}
          >
            <Ionicons name="add-outline" size={17} color="#FFFFFF" />
            <Text style={styles.appointmentOptionAddText}>Add</Text>
          </HoverBubble>
        </View>

        <View style={styles.appointmentOptionList}>
          {options.length ? options.map((option) => {
            const isEditing = editingId === option.id;
            return (
              <View
                key={option.id || option.label}
                style={[
                  styles.appointmentOptionItem,
                  {
                    borderColor: theme.borderColor,
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE",
                  },
                ]}
              >
                <View style={styles.appointmentOptionItemMain}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.appointmentOptionEditInput, isDarkMode && styles.darkInput]}
                      placeholder={placeholder}
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={appointmentOptionDrafts[groupKey]}
                      onChangeText={(value) => setAppointmentOptionDrafts((prev) => ({ ...prev, [groupKey]: value }))}
                    />
                  ) : (
                    <>
                      <Text style={[styles.appointmentOptionItemTitle, isDarkMode && styles.darkText]}>
                        {option.label || option.value}
                      </Text>
                      <View style={styles.appointmentOptionMetaRow}>
                        <Ionicons
                          name={option.enabled === false ? "eye-off-outline" : "eye-outline"}
                          size={13}
                          color="#64748B"
                        />
                        <Text style={[styles.appointmentOptionStatusText, isDarkMode && styles.darkTextSecondary]}>
                          {option.enabled === false ? "Hidden" : "Visible"}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <View style={styles.appointmentOptionActions}>
                  {isEditing ? (
                    <TouchableOpacity
                      style={styles.appointmentOptionMiniButton}
                      disabled={isSavingAppointmentOptions}
                      onPress={() => handleSaveEditedAppointmentOption(groupKey, option)}
                    >
                      <Ionicons name="checkmark-outline" size={15} color="#0A3D91" />
                      <Text style={styles.appointmentOptionMiniText}>Save</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.appointmentOptionMiniButton}
                      disabled={isSavingAppointmentOptions}
                      onPress={() => {
                        setEditingAppointmentOption({ groupKey, optionId: option.id });
                        setAppointmentOptionDrafts((prev) => ({ ...prev, [groupKey]: option.value || option.label || "" }));
                      }}
                    >
                      <Ionicons name="create-outline" size={15} color="#475569" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.appointmentOptionMiniButton}
                    disabled={isSavingAppointmentOptions}
                    onPress={() => handleToggleAppointmentOption(groupKey, option)}
                  >
                    <Ionicons name={option.enabled === false ? "eye-outline" : "eye-off-outline"} size={15} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.appointmentOptionMiniButton}
                    disabled={isSavingAppointmentOptions}
                    onPress={() => handleDeleteAppointmentOption(groupKey, option)}
                  >
                    <Ionicons name="trash-outline" size={15} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }) : (
            <View style={[styles.appointmentOptionEmpty, { borderColor: theme.borderColor }]}>
              <Text style={[styles.appointmentOptionEmptyText, isDarkMode && styles.darkTextSecondary]}>
                No options yet. Add one above.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAppointmentManagementContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Appointment Management"
          subtitle="Update the choices visitors see when booking an appointment."
          badge="Visitor form"
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <View style={styles.adminSectionShellActions}>
              <TouchableOpacity style={styles.pageRefreshButton} onPress={loadAllVisitRequests}>
                <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={styles.appointmentOptionsGrid}>
            {renderAppointmentOptionManager({
              title: "Office to Visit",
              subtitle: "Where visitors can book.",
              groupKey: "offices",
              placeholder: "Add office, e.g. Admissions",
              icon: "business-outline",
            })}
            {renderAppointmentOptionManager({
              title: "Purpose to Visit",
              subtitle: "Why they are visiting.",
              groupKey: "purposes",
              placeholder: "Add purpose, e.g. Consultation",
              icon: "clipboard-outline",
            })}
            {renderAppointmentOptionManager({
              title: "Available Time Slots",
              subtitle: "Times visitors can choose.",
              groupKey: "timeSlots",
              placeholder: "Add time, e.g. 09:00 or 2:30 PM",
              icon: "time-outline",
            })}
          </View>
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderReportRecordsContent = () => {
    const historyStats = getHistoryStats();
    const filteredHistory = getFilteredHistory();

    return (
      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <AdminSectionShell
            title="Report Records"
          subtitle="Use the built-in history stream as a report-ready ledger for completed, pending, and rejected visits."
          badge={`${filteredHistory.length} visible`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <View style={styles.adminSectionShellActions}>
              <TouchableOpacity style={styles.pageRefreshButton} onPress={loadVisitorHistory}>
                <Ionicons name="refresh-outline" size={22} color="#1C6DD0" />
              </TouchableOpacity>
            </View>
          }
        >
            <View style={styles.modularCardGrid}>
              {[
                { label: "Total History", value: historyStats.totalVisits, color: "#0A3D91" },
                { label: "Completed", value: historyStats.completedVisits, color: "#10B981" },
                { label: "Pending", value: historyStats.pendingVisits, color: "#F59E0B" },
                { label: "Rejected", value: historyStats.rejected, color: "#EF4444" },
                { label: "Security Reports", value: historyStats.reported, color: "#DC2626" },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.modularStatCard,
                    {
                      backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                      borderColor: theme.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.modularStatValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={[styles.modularStatLabel, isDarkMode && styles.darkTextSecondary]}>{item.label}</Text>
                </View>
              ))}
            </View>

            {renderAdminTable({
              rows: filteredHistory,
              keyExtractor: (visitor) => visitor._id || visitor.id || `${visitor.email}-${visitor.visitDate}`,
              emptyTitle: "No report records",
              emptySubtitle: "There are no report rows to display with the current filters.",
              columns: [
                {
                  key: "visitor",
                  label: "Visitor",
                  width: 220,
                  render: (visitor) => (
                    <View>
                      <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                        {visitor.fullName || `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim() || "Visitor"}
                      </Text>
                      <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                        {visitor.email || "-"}
                      </Text>
                    </View>
                  ),
                },
                {
                  key: "purpose",
                  label: "Purpose",
                  width: 210,
                  render: (visitor) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {visitor.reportType === "security_report"
                        ? `Reported: ${visitor.reportReason || "-"}`
                        : visitor.purposeOfVisit || "-"}
                    </Text>
                  ),
                },
                {
                  key: "office",
                  label: "Office",
                  width: 170,
                  render: (visitor) => (
                    <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {visitor.assignedOffice || visitor.host || "-"}
                    </Text>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  width: 120,
                  render: (visitor) => {
                    const statusInfo = visitor.reportType === "security_report"
                      ? { bg: "rgba(220,38,38,0.12)", text: "#DC2626", label: "Reported" }
                      : getStatusColor(getRequestStatus(visitor));
                    return (
                      <View style={[styles.dashboardStatusBadge, { backgroundColor: statusInfo.bg, alignSelf: "flex-start" }]}>
                        <Text style={[styles.dashboardStatusText, { color: statusInfo.text }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    );
                  },
                },
                {
                  key: "visitDate",
                  label: "Visit Date",
                  width: 170,
                  render: (visitor) => (
                    <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {formatDateTime(visitor.reportedAt || visitor.visitDate || visitor.createdAt)}
                    </Text>
                  ),
                },
                {
                  key: "reporter",
                  label: "Reporter",
                  width: 160,
                  render: (visitor) => (
                    <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                      {visitor.reportType === "security_report" ? visitor.reporterName || "Security" : "-"}
                    </Text>
                  ),
                },
              ],
            })}
          </AdminSectionShell>
        </View>
      </ScrollView>
    );
  };

  const renderSecurityReportRecordsContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Security Reports"
          subtitle="Reports filed by security and guard users are separated here for review and follow-up."
          badge={`${securityReportRecords.length} reports`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <View style={styles.adminSectionShellActions}>
              <TouchableOpacity style={styles.pageRefreshButton} onPress={loadVisitorHistory}>
                <Ionicons name="refresh-outline" size={22} color="#DC2626" />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={styles.modularCardGrid}>
            {[
              { label: "Total Reports", value: securityReportRecords.length, color: "#DC2626" },
              { label: "Open", value: securityReportRecords.filter((item) => !item.resolved).length, color: "#F59E0B" },
              { label: "Resolved", value: securityReportRecords.filter((item) => item.resolved).length, color: "#10B981" },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.modularStatCard,
                  {
                    backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularStatValue, { color: item.color }]}>{item.value}</Text>
                <Text style={[styles.modularStatLabel, isDarkMode && styles.darkTextSecondary]}>{item.label}</Text>
              </View>
            ))}
          </View>

          {renderAdminTable({
            rows: securityReportRecords,
            keyExtractor: (record) => record._id || `${record.email}-${record.reportedAt}-${record.reportReason}`,
            emptyTitle: "No security reports",
            emptySubtitle: "Reports submitted by security or guard accounts will appear here.",
            columns: [
              {
                key: "visitor",
                label: "Visitor",
                width: 220,
                render: (record) => (
                  <View>
                    <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                      {record.fullName || "Visitor"}
                    </Text>
                    <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                      {record.email || "-"}
                    </Text>
                  </View>
                ),
              },
              {
                key: "reason",
                label: "Reason",
                width: 280,
                render: (record) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {record.reportReason || "-"}
                  </Text>
                ),
              },
              {
                key: "office",
                label: "Office",
                width: 170,
                render: (record) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {record.assignedOffice || record.appointmentDepartment || record.host || "-"}
                  </Text>
                ),
              },
              {
                key: "reporter",
                label: "Reported By",
                width: 180,
                render: (record) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {record.reporterName || "Security"}
                  </Text>
                ),
              },
              {
                key: "reportedAt",
                label: "Reported At",
                width: 170,
                render: (record) => (
                  <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                    {formatDateTime(record.reportedAt || record.createdAt)}
                  </Text>
                ),
              },
              {
                key: "status",
                label: "Status",
                width: 130,
                render: (record) => (
                  <View
                    style={[
                      styles.dashboardStatusBadge,
                      {
                        backgroundColor: record.resolved ? "rgba(16,185,129,0.12)" : "rgba(220,38,38,0.12)",
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    <Text style={[styles.dashboardStatusText, { color: record.resolved ? "#10B981" : "#DC2626" }]}>
                      {record.resolved ? "Resolved" : "Open"}
                    </Text>
                  </View>
                ),
              },
            ],
          })}
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderAnalyticsContent = () => {
    const chart = getCurrentChartData();
    const historyStats = getHistoryStats();
    const filteredHistory = getFilteredHistory();
    const activeDatasetLabel = activeChartDataset.charAt(0).toUpperCase() + activeChartDataset.slice(1);
    const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const totalRequests = stats.totalRequests || 0;
    const approvalRate = totalRequests > 0 ? Math.round((stats.approvedRequests / totalRequests) * 100) : 0;
    const chartTotal = (chart?.data || []).reduce((sum, value) => sum + value, 0);
    const chartPeakValue = Math.max(...(chart?.data || [0]), 0);
    const chartPeakIndex = chart?.data?.findIndex((value) => value === chartPeakValue) ?? -1;
    const chartPeakLabel = chartPeakIndex >= 0 ? chart?.labels?.[chartPeakIndex] : "N/A";
    const chartAverage = chart?.data?.length ? (chartTotal / chart.data.length).toFixed(1) : "0.0";
    const chartInsightText = chartPeakValue > 0
      ? `${chartPeakLabel} is the busiest ${activeChartDataset} window with ${chartPeakValue} requests logged.`
      : `No ${activeChartDataset} trend data is available yet.`;
    const selectedDateVisitors = [...(dateAnalytics.visitors || [])].sort(
      (a, b) => new Date(a.visitTime || a.visitDate) - new Date(b.visitTime || b.visitDate)
    );
    const selectedDateApprovalRate = dateAnalytics.total > 0
      ? Math.round((dateAnalytics.approved / dateAnalytics.total) * 100)
      : 0;
    const filteredTodayCount = filteredHistory.filter((visitor) => {
      if (!visitor?.visitDate) return false;
      return new Date(visitor.visitDate).toDateString() === new Date().toDateString();
    }).length;
    const distributionItems = [
      { key: "approved", label: "Approved", value: stats.approvedRequests || 0, color: "#10B981" },
      { key: "pending", label: "Pending", value: stats.pendingRequests || 0, color: "#F59E0B" },
      { key: "rejected", label: "Rejected", value: stats.rejectedRequests || 0, color: "#EF4444" },
    ];
    const topDistributionItem = [...distributionItems].sort((a, b) => b.value - a.value)[0];
    const metricCards = [
      {
        key: "total",
        icon: "layers-outline",
        label: "Total Requests",
        value: totalRequests,
        accent: "#1C6DD0",
        helper: "All recorded visitor requests",
      },
      {
        key: "approval",
        icon: "checkmark-done-outline",
        label: "Approval Rate",
        value: `${approvalRate}%`,
        accent: "#10B981",
        helper: `${stats.approvedRequests || 0} approved requests`,
      },
      {
        key: "today",
        icon: "today-outline",
        label: "Today Visits",
        value: stats.todayVisits || 0,
        accent: "#F97316",
        helper: "Scheduled for today",
      },
      {
        key: "upcoming",
        icon: "time-outline",
        label: "Upcoming",
        value: stats.upcomingVisits || 0,
        accent: "#1C6DD0",
        helper: "Approved future visits",
      },
    ];
    const historyFilters = [
      { key: "all", label: "All" },
      { key: "pending", label: "Pending" },
      { key: "approved", label: "Approved" },
      { key: "checked_in", label: "Checked In" },
      { key: "checked_out", label: "Checked Out" },
      { key: "rejected", label: "Rejected" },
      { key: "reported", label: "Reported" },
    ];

    return (
      <ScrollView
        style={styles.contentScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.analyticsContainer}
      >
        <View style={[styles.analyticsHeader, width < 900 && { flexDirection: "column", gap: 14 }]}>
          <View>
            <Text style={styles.analyticsEyebrow}>Operations Intelligence</Text>
            <Text style={[styles.analyticsHeaderTitle, { color: theme.textPrimary }]}>Analytics</Text>
            <Text style={[styles.analyticsHeaderSubtitle, { color: theme.textSecondary }]}>
              Monitor request momentum, scheduled arrivals, and visitor outcomes from one place.
            </Text>
          </View>
          <View style={styles.analyticsHeaderActions}>
            <TouchableOpacity
              style={[styles.analyticsActionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={onRefresh}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color="#1C6DD0" />
              <Text style={styles.analyticsActionButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyticsActionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color="#1C6DD0" />
              <Text style={styles.analyticsActionButtonText}>Pick Date</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.analyticsHeroCard,
            width < 960 && { flexDirection: "column" },
            { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
          ]}
        >
          <View style={styles.analyticsHeroContent}>
            <View style={[styles.analyticsHeroBadge, { backgroundColor: isDarkMode ? "#041E42" : "#EEF5FF" }]}>
              <Ionicons name="pulse-outline" size={14} color="#6366F1" />
              <Text style={styles.analyticsHeroBadgeText}>Operational Snapshot</Text>
            </View>
            <Text style={[styles.analyticsHeroTitle, { color: theme.textPrimary }]}>
              {dateAnalytics.total > 0
                ? `${dateAnalytics.total} visit request${dateAnalytics.total > 1 ? "s are" : " is"} scheduled for ${selectedDateLabel}.`
                : `No visit requests are scheduled for ${selectedDateLabel}.`}
            </Text>
            <Text style={[styles.analyticsHeroSubtitle, { color: theme.textSecondary }]}>
              Approval rate is currently {approvalRate}% with {stats.upcomingVisits || 0} approved visit
              {stats.upcomingVisits === 1 ? "" : "s"} still upcoming.
            </Text>
            <View style={styles.analyticsHeroInsightRow}>
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Selected Date</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{selectedDateLabel}</Text>
              </View>
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Busiest Window</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{chartPeakLabel || "N/A"}</Text>
              </View>
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Active Visits</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{historyStats.checkedIn}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.analyticsHeroStats, width < 960 && { width: "100%", flexDirection: "row" }]}>
            <View style={[styles.analyticsHeroStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
              <Text style={[styles.analyticsHeroStatValue, { color: theme.textPrimary }]}>{historyStats.uniqueEmails}</Text>
              <Text style={[styles.analyticsHeroStatLabel, { color: theme.textSecondary }]}>Unique Visitors</Text>
            </View>
            <View style={[styles.analyticsHeroStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
              <Text style={[styles.analyticsHeroStatValue, { color: theme.textPrimary }]}>{stats.weeklyGrowth || 0}%</Text>
              <Text style={[styles.analyticsHeroStatLabel, { color: theme.textSecondary }]}>7d Activity</Text>
            </View>
          </View>
        </View>

        <View style={styles.keyMetricsRow}>
          {metricCards.map((card) => (
            <View
              key={card.key}
              style={[styles.keyMetricCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
            >
              <View style={[styles.keyMetricIcon, { backgroundColor: `${card.accent}15` }]}>
                <Ionicons name={card.icon} size={22} color={card.accent} />
              </View>
              <View style={styles.analyticsMetricContent}>
                <Text style={[styles.keyMetricValue, { color: theme.textPrimary }]}>{card.value}</Text>
                <Text style={[styles.keyMetricLabel, { color: theme.textSecondary }]}>{card.label}</Text>
                <Text style={[styles.analyticsMetricHelper, { color: theme.textSecondary }]}>{card.helper}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.analyticsSplitGrid, width < 1200 && styles.analyticsSplitGridStack]}>
          <View style={styles.analyticsPrimaryColumn}>
            <View style={[styles.mainStatCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <View style={styles.analyticsChartHeader}>
                <View>
                  <Text style={[styles.distributionTitle, { color: theme.textPrimary, marginBottom: 4 }]}>Visitor Trend</Text>
                  <Text style={[styles.analyticsChartSubtitle, { color: theme.textSecondary }]}>
                    Compare {activeChartDataset} request activity and spot the busiest period quickly.
                  </Text>
                </View>
                <View style={[styles.analyticsDatasetSelector, { backgroundColor: isDarkMode ? "#0F172A" : "#F1F5F9" }]}>
                  {["daily", "weekly", "monthly"].map((dataset) => (
                    <TouchableOpacity
                      key={dataset}
                      style={[
                        styles.analyticsDatasetButton,
                        activeChartDataset === dataset && styles.analyticsDatasetButtonActive,
                      ]}
                      onPress={() => setActiveChartDataset(dataset)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.analyticsDatasetButtonText,
                          { color: activeChartDataset === dataset ? "#FFFFFF" : theme.textSecondary },
                        ]}
                      >
                        {dataset.charAt(0).toUpperCase() + dataset.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.analyticsChartCallout, { backgroundColor: isDarkMode ? "#172554" : "#EFF6FF", borderColor: isDarkMode ? "#041E42" : "#B7D5F6" }]}>
                <View style={styles.analyticsChartCalloutCopy}>
                  <Text style={[styles.analyticsChartCalloutTitle, { color: isDarkMode ? "#EEF5FF" : "#041E42" }]}>
                    {activeDatasetLabel} trend insight
                  </Text>
                  <Text style={[styles.analyticsChartCalloutText, { color: isDarkMode ? "#B7D5F6" : "#1E40AF" }]}>
                    {chartInsightText}
                  </Text>
                </View>
                <View style={styles.analyticsMiniLegend}>
                  {distributionItems.map((item) => (
                    <View key={item.key} style={styles.analyticsMiniLegendItem}>
                      <View style={[styles.analyticsMiniLegendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.analyticsMiniLegendText, { color: isDarkMode ? "#EEF5FF" : "#1E3A8A" }]}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.analyticsQuickStatsRow}>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartTotal}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Total Volume</Text>
                </View>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartPeakLabel || "N/A"}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Busiest Period</Text>
                </View>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartAverage}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Average</Text>
                </View>
              </View>

              <View style={[styles.analyticsChartSurface, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                {renderBarChart(chart.labels, chart.data)}
              </View>
            </View>

            <View style={[styles.historyCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>Visitor History</Text>
                  <Text style={[styles.analyticsChartSubtitle, { color: theme.textSecondary }]}>
                    Search and filter recent visitor records by status.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.historyRefreshButton, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE" }]}
                  onPress={onRefresh}
                >
                  <Ionicons name="refresh-outline" size={16} color="#1C6DD0" />
                </TouchableOpacity>
              </View>

              <View style={styles.historyOverviewRow}>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{filteredHistory.length}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Visible Records</Text>
                </View>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{filteredTodayCount}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Scheduled Today</Text>
                </View>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{historyStats.checkedOut}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Completed Visits</Text>
                </View>
              </View>

              <View style={styles.historyFilters}>
                {renderRecordsSearchPanel({
                  title: "Search Visitor History",
                  subtitle: "Manual lookup for a visitor name, email, office, purpose, status, or exact date.",
                  value: historySearchTerm,
                  onChangeText: setHistorySearchTerm,
                  onApply: () => setHistorySearchQuery(historySearchTerm.trim()),
                  onClear: () => {
                    setHistorySearchTerm("");
                    setHistorySearchQuery("");
                  },
                  placeholder: "Example: April 18, 2026 or Document Request",
                  accent: "#1C6DD0",
                })}

                {renderRecordsFilterPanel({
                  title: "Filter Visitor History",
                  subtitle: "Quick status, month, exact date range, office, and time order filters for narrowing records.",
                  panelKey: "visitor-history",
                  accent: "#1C6DD0",
                  onReset: () => {
                    setHistoryFilter("all");
                    setHistoryDateFilter("all");
                    setHistoryOfficeFilter("all");
                    setHistoryDateRange({ startDate: null, endDate: null });
                    setHistorySortOrder("newest");
                  },
                  groups: [
                    {
                      key: "status",
                      label: "Status",
                      activeValue: historyFilter,
                      onSelect: setHistoryFilter,
                      filters: historyFilters.map((filter) => ({
                        ...filter,
                        icon: filter.key === "approved"
                          ? "checkmark-circle-outline"
                          : filter.key === "pending"
                            ? "time-outline"
                            : filter.key === "rejected"
                              ? "close-circle-outline"
                              : filter.key === "checked_in"
                                ? "log-in-outline"
                                : filter.key === "checked_out"
                                  ? "log-out-outline"
                                  : "apps-outline",
                      })),
                    },
                    {
                      key: "date",
                      label: "Date Range",
                      activeValue: historyDateFilter,
                      onSelect: setHistoryDateFilter,
                      filters: dateShortcutFilters,
                    },
                    {
                      key: "office",
                      label: "Office",
                      activeValue: historyOfficeFilter,
                      onSelect: setHistoryOfficeFilter,
                      filters: historyOfficeFilterOptions,
                    },
                    {
                      key: "order",
                      label: "Time Order",
                      activeValue: historySortOrder,
                      onSelect: setHistorySortOrder,
                      filters: [
                        { key: "newest", label: "Newest First", icon: "arrow-down-outline" },
                        { key: "oldest", label: "Oldest First", icon: "arrow-up-outline" },
                      ],
                    },
                  ],
                  footerContent: renderDateRangeControls({
                    accent: "#1C6DD0",
                    startDate: historyDateRange.startDate,
                    endDate: historyDateRange.endDate,
                    onPickStart: () => setActiveFilterDateField("history-start"),
                    onPickEnd: () => setActiveFilterDateField("history-end"),
                    onClear: () => setHistoryDateRange({ startDate: null, endDate: null }),
                  }),
                })}
              </View>

              {filteredHistory.length === 0 ? (
                <View style={styles.emptyHistoryState}>
                  <Ionicons name="search-outline" size={42} color={theme.textSecondary} />
                  <Text style={[styles.emptyHistoryTitle, { color: theme.textPrimary }]}>No matching history</Text>
                  <Text style={[styles.emptyHistorySubtitle, { color: theme.textSecondary }]}>
                    Try adjusting your status filter or search term.
                  </Text>
                </View>
              ) : (
                filteredHistory.slice(0, 8).map((visitor) => {
                  const statusInfo = getStatusColor(visitor.status);
                  const isToday =
                    visitor.visitDate &&
                    new Date(visitor.visitDate).toDateString() === new Date().toDateString();

                  return (
                    <View
                      key={visitor._id || visitor.id || `${visitor.email}-${visitor.visitDate}`}
                      style={[styles.historyItem, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}
                    >
                      <View style={styles.historyItemHeader}>
                        <View style={[styles.historyItemAvatar, { backgroundColor: isDarkMode ? "#1E293B" : "#EFF6FF" }]}>
                          <Text style={styles.historyItemAvatarText}>
                            {(visitor.fullName || "V")
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.historyItemInfo}>
                          <Text style={[styles.historyItemName, { color: theme.textPrimary }]}>{visitor.fullName}</Text>
                          <Text style={[styles.historyItemEmail, { color: theme.textSecondary }]}>{visitor.email}</Text>
                          <Text style={[styles.historyItemEmail, { color: theme.textSecondary }]}>
                            SafePass ID: {getVisitorSafePassId(visitor)}
                          </Text>
                          <Text style={[styles.historyItemPurpose, { color: theme.textSecondary }]}>
                            {visitor.purposeOfVisit || "No purpose provided"}
                          </Text>
                        </View>
                        <View style={[styles.analyticsStatusBadge, { backgroundColor: statusInfo.bg }]}>
                          <Text style={[styles.analyticsStatusBadgeText, { color: statusInfo.text }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.historyItemDetails, { borderTopColor: theme.borderColor }]}>
                        <View style={styles.historyDetailItem}>
                          <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                          <Text style={[styles.historyDetailText, { color: theme.textSecondary }]}>
                            {formatDate(visitor.visitDate)}
                          </Text>
                        </View>
                        <View style={styles.historyDetailItem}>
                          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                          <Text style={[styles.historyDetailText, { color: theme.textSecondary }]}>
                            {formatTime(visitor.visitTime)}
                          </Text>
                        </View>
                        <View style={styles.historyDetailItem}>
                          <Ionicons name="swap-horizontal-outline" size={14} color={isToday ? "#10B981" : theme.textSecondary} />
                          <Text
                            style={[
                              styles.historyDetailText,
                              isToday ? styles.historyTodayBadge : styles.historyPastBadge,
                            ]}
                          >
                            {isToday ? "Today" : "Past Schedule"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.analyticsSideColumn}>
            <View style={[styles.distributionCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <View style={styles.analyticsPanelHeader}>
                <View>
                  <Text style={[styles.distributionTitle, { color: theme.textPrimary }]}>Selected Date Snapshot</Text>
                  <Text style={[styles.analyticsPanelSubtitle, { color: theme.textSecondary }]}>
                    Live schedule details and approval health for the chosen date.
                  </Text>
                </View>
                <View style={[styles.analyticsPanelPill, { backgroundColor: isDarkMode ? "#172554" : "#EFF6FF" }]}>
                  <Text style={[styles.analyticsPanelPillText, { color: "#1C6DD0" }]}>{selectedDateApprovalRate}% approved</Text>
                </View>
              </View>
              <View style={styles.analyticsDateSummaryRow}>
                <View style={[styles.analyticsDateSummaryCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDateSummaryValue, { color: theme.textPrimary }]}>{dateAnalytics.total}</Text>
                  <Text style={[styles.analyticsDateSummaryLabel, { color: theme.textSecondary }]}>Total Visits</Text>
                </View>
                <View style={[styles.analyticsDateSummaryCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDateSummaryValue, { color: theme.textPrimary }]}>{dateAnalytics.approved}</Text>
                  <Text style={[styles.analyticsDateSummaryLabel, { color: theme.textSecondary }]}>Approved</Text>
                </View>
              </View>

              <View style={[styles.analyticsDateCallout, { backgroundColor: isDarkMode ? "#172554" : "#EFF6FF", borderColor: isDarkMode ? "#041E42" : "#B7D5F6" }]}>
                <Ionicons name="calendar-clear-outline" size={18} color="#1C6DD0" />
                <View style={styles.analyticsDateCalloutTextWrap}>
                  <Text style={[styles.analyticsDateCalloutTitle, { color: theme.textPrimary }]}>{selectedDateLabel}</Text>
                  <Text style={[styles.analyticsDateCalloutSubtitle, { color: theme.textSecondary }]}>
                    Pending {dateAnalytics.pending} | Rejected {dateAnalytics.rejected}
                  </Text>
                </View>
              </View>

              <View style={styles.analyticsDateVisitorsList}>
                {selectedDateVisitors.length === 0 ? (
                  <View style={styles.emptyHistoryState}>
                    <Ionicons name="calendar-outline" size={36} color={theme.textSecondary} />
                    <Text style={[styles.emptyHistoryTitle, { color: theme.textPrimary }]}>No visitors scheduled</Text>
                    <Text style={[styles.emptyHistorySubtitle, { color: theme.textSecondary }]}>
                      Pick another date to inspect scheduled visits.
                    </Text>
                  </View>
                ) : (
                  selectedDateVisitors.slice(0, 5).map((visitor) => {
                    const statusInfo = getStatusColor(visitor.status);
                    return (
                      <View
                        key={visitor._id || visitor.id || `${visitor.email}-${visitor.visitDate}`}
                        style={[styles.analyticsDateVisitorItem, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}
                      >
                        <View style={styles.analyticsDateVisitorInfo}>
                          <Text style={[styles.analyticsDateVisitorName, { color: theme.textPrimary }]}>{visitor.fullName}</Text>
                          <Text style={[styles.analyticsDateVisitorMeta, { color: theme.textSecondary }]}>
                            {formatTime(visitor.visitTime)} | {visitor.purposeOfVisit || "Visit"}
                          </Text>
                        </View>
                        <View style={[styles.analyticsStatusBadge, { backgroundColor: statusInfo.bg }]}>
                          <Text style={[styles.analyticsStatusBadgeText, { color: statusInfo.text }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            <View style={[styles.distributionCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <View style={styles.analyticsPanelHeader}>
                <View>
                  <Text style={[styles.distributionTitle, { color: theme.textPrimary }]}>Status Distribution</Text>
                  <Text style={[styles.analyticsPanelSubtitle, { color: theme.textSecondary }]}>
                    Compare how requests are progressing across the full system.
                  </Text>
                </View>
              </View>
              <View style={styles.distributionStats}>
                {distributionItems.map((item) => {
                  const percent = totalRequests > 0 ? Math.round((item.value / totalRequests) * 100) : 0;
                  return (
                    <View key={item.key} style={styles.distributionItem}>
                      <View style={[styles.distributionDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.distributionLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                      <Text style={[styles.distributionValue, { color: theme.textPrimary }]}>{item.value}</Text>
                      <View style={[styles.distributionBar, { backgroundColor: isDarkMode ? "#334155" : "#E2E8F0" }]}>
                        <View
                          style={[
                            styles.distributionBarFill,
                            { width: `${percent}%`, backgroundColor: item.color },
                          ]}
                        />
                      </View>
                      <Text style={[styles.distributionPercent, { color: theme.textSecondary }]}>{percent}%</Text>
                    </View>
                  );
                })}
              </View>

              <View style={[styles.analyticsDistributionCallout, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                <Ionicons name="analytics-outline" size={18} color={topDistributionItem?.color || "#1C6DD0"} />
                <Text style={[styles.analyticsDistributionCalloutText, { color: theme.textPrimary }]}>
                  {topDistributionItem?.label || "No status data"} currently leads with {topDistributionItem?.value || 0} request
                  {(topDistributionItem?.value || 0) === 1 ? "" : "s"}.
                </Text>
              </View>

              <View style={styles.analyticsDistributionFooter}>
                <View style={[styles.analyticsDistributionStat, { borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDistributionValue, { color: theme.textPrimary }]}>{historyStats.checkedIn}</Text>
                  <Text style={[styles.analyticsDistributionLabel, { color: theme.textSecondary }]}>Checked In</Text>
                </View>
                <View style={[styles.analyticsDistributionStat, { borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDistributionValue, { color: theme.textPrimary }]}>{historyStats.checkedOut}</Text>
                  <Text style={[styles.analyticsDistributionLabel, { color: theme.textSecondary }]}>Checked Out</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setSelectedDate(date);
                calculateDateAnalytics(date);
              }
            }}
          />
        )}
        {activeFilterDateField && (
          <DateTimePicker
            value={
              activeFilterDateField === "request-start"
                ? requestDateRange.startDate || new Date()
                : activeFilterDateField === "request-end"
                  ? requestDateRange.endDate || requestDateRange.startDate || new Date()
                  : activeFilterDateField === "history-start"
                    ? historyDateRange.startDate || new Date()
                    : historyDateRange.endDate || historyDateRange.startDate || new Date()
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleFilterDateSelection}
          />
        )}
      </ScrollView>
    );
  };

  const renderSettingsContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>Settings</Text>
        </View>

        <View style={{ backgroundColor: theme.cardBackground, borderColor: theme.borderColor, borderWidth: 1, borderRadius: 14, padding: 14, gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.textPrimary }}>Dark Mode</Text>
            <Switch value={!!settings.darkMode} onValueChange={(value) => updateSetting("darkMode", value)} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.textPrimary }}>Email Notifications</Text>
            <Switch value={!!settings.emailNotifications} onValueChange={(value) => updateSetting("emailNotifications", value)} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.textPrimary }}>SMS Alerts</Text>
            <Switch value={!!settings.smsAlerts} onValueChange={(value) => updateSetting("smsAlerts", value)} />
          </View>
        </View>

        <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={saveSettings} disabled={isSavingSettings}>
            {isSavingSettings ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Save</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={resetSettings}>
            <Text style={styles.cancelButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 10 }}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: "#FEE2E2" }]} onPress={clearSystemData}>
            <Text style={[styles.cancelButtonText, { color: "#B91C1C" }]}>Clear System Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderUserManagementContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <View
          style={[
            styles.managementHeroCard,
            {
              backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
              borderColor: theme.borderColor,
            },
          ]}
        >
          <View style={styles.managementHeroMain}>
            <View style={[styles.managementIconBadge, { backgroundColor: `${userManagementConfig.accent}18` }]}>
              <Ionicons name={userManagementConfig.icon} size={26} color={userManagementConfig.accent} />
            </View>
            <View style={styles.managementHeroCopy}>
              <Text style={[styles.managementEyebrow, { color: userManagementConfig.accent }]}>
                {userManagementConfig.eyebrow}
              </Text>
              <Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>
                {userManagementConfig.title}
              </Text>
              <Text style={[styles.managementDescription, isDarkMode && styles.darkTextSecondary]}>
                {userManagementConfig.description}
              </Text>
            </View>
          </View>

          <View style={styles.managementHeaderActions}>
            {userManagementConfig.primaryActionLabel ? (
              <TouchableOpacity
                style={[styles.managementPrimaryButton, { backgroundColor: userManagementConfig.accent }]}
                onPress={() => openCreateUserModal(accountRecordsMode === "security" ? "security" : "staff")}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                <Text style={styles.managementPrimaryButtonText}>
                  {userManagementConfig.primaryActionLabel}
                </Text>
              </TouchableOpacity>
            ) : null}

          </View>
        </View>

        <View style={styles.managementStatsGrid}>
          {userManagementConfig.stats.map((item) => (
            <View
              key={item.key}
              style={[
                styles.managementStatCard,
                {
                  backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={[styles.managementStatIcon, { backgroundColor: `${userManagementConfig.accent}16` }]}>
                <Ionicons name={item.icon} size={18} color={userManagementConfig.accent} />
              </View>
              <Text style={[styles.managementStatValue, isDarkMode && styles.darkText]}>
                {item.value}
              </Text>
              <Text style={[styles.managementStatLabel, isDarkMode && styles.darkTextSecondary]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.userWorkspaceCard,
            {
              backgroundColor: isDarkMode ? theme.cardBackground : "#FFFFFF",
              borderColor: theme.borderColor,
            },
          ]}
        >
          <View style={styles.userWorkspaceHeader}>
            <View>
              <Text style={[styles.userWorkspaceTitle, isDarkMode && styles.darkText]}>Directory View</Text>
              <Text style={[styles.userWorkspaceSubtitle, isDarkMode && styles.darkTextSecondary]}>
                Showing {visibleStartIndex}-{visibleEndIndex} of {totalFilteredUsers} matching accounts
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.userRefreshButton,
                isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
              ]}
              onPress={loadAllUsers}
            >
              <Ionicons name="refresh-outline" size={18} color={userManagementConfig.accent} />
              <Text style={[styles.userRefreshButtonText, { color: userManagementConfig.accent }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {renderRecordsSearchPanel({
            title: "Search Account Records",
            subtitle: "Manual lookup for account name, username, email, department, role, phone, or staff ID.",
            value: userSearchTerm,
            onChangeText: setUserSearchTerm,
            onApply: () => {
              setUserSearchQuery(userSearchTerm.trim());
              setCurrentPage(1);
            },
            onClear: () => {
              setUserSearchTerm("");
              setUserSearchQuery("");
              setCurrentPage(1);
            },
            placeholder: userManagementConfig.searchPlaceholder,
            accent: userManagementConfig.accent,
          })}

          {renderRecordsFilterPanel({
            title: "Filter Account Records",
            subtitle: "Quick role, status, and department shortcuts. These filters work together.",
            panelKey: "account-records",
            accent: userManagementConfig.accent,
            onReset: () => {
              setUserFilter("all");
              setUserDepartmentFilter("all");
              setCurrentPage(1);
            },
            groups: [
              {
                key: "role-status",
                label: accountRecordsMode === "all" ? "Role / Status" : "Status",
                activeValue: userFilter,
                onSelect: (filterKey) => {
                  setUserFilter(filterKey);
                  setCurrentPage(1);
                },
                filters: userManagementConfig.filters.map((filterItem) => ({
                  ...filterItem,
                  icon: filterItem.key === "active"
                    ? "checkmark-circle-outline"
                    : filterItem.key === "inactive"
                      ? "pause-circle-outline"
                      : filterItem.key === "security"
                        ? "shield-outline"
                        : filterItem.key === "staff"
                          ? "briefcase-outline"
                          : filterItem.key === "admin"
                            ? "person-circle-outline"
                            : "apps-outline",
                })),
              },
              {
                key: "department",
                label: "Department",
                activeValue: userDepartmentFilter,
                onSelect: (filterKey) => {
                  setUserDepartmentFilter(filterKey);
                  setCurrentPage(1);
                },
                filters: userDepartmentFilterOptions,
              },
            ],
          })}

          {paginatedUsers.length > 0 ? (
            <>
              {renderAdminTable({
                rows: paginatedUsers,
                keyExtractor: (userItem) => userItem._id || userItem.id || userItem.email,
                columns: [
                  {
                    key: "name",
                    label: "Name",
                    width: 220,
                    render: (userItem) => {
                      const roleColor = getRoleColor(userItem.role);
                      return (
                        <View style={styles.adminTableIdentityCell}>
                          <View style={[styles.userAvatar, { backgroundColor: `${roleColor}18` }]}>
                            <Text style={[styles.userAvatarInitials, { color: roleColor }]}>
                              {getUserInitials(userItem)}
                            </Text>
                          </View>
                          <View style={styles.adminTableIdentityCopy}>
                            <Text style={[styles.adminTablePrimaryText, isDarkMode && styles.darkText]}>
                              {userItem.firstName} {userItem.lastName}
                            </Text>
                            <Text style={[styles.adminTableSecondaryText, isDarkMode && styles.darkTextSecondary]}>
                              {userItem.email}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  },
                  {
                    key: "role",
                    label: "Role",
                    width: 130,
                    render: (userItem) => {
                      const roleColor = getRoleColor(userItem.role);
                      return (
                        <View style={[styles.roleBadge, { backgroundColor: `${roleColor}14`, alignSelf: "flex-start" }]}>
                          <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                            {formatRoleLabel(userItem.role)}
                          </Text>
                        </View>
                      );
                    },
                  },
                  {
                    key: "department",
                    label: "Department",
                    width: 170,
                    render: (userItem) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {userItem.department || "General"}
                      </Text>
                    ),
                  },
                  {
                    key: "username",
                    label: "Username",
                    width: 140,
                    render: (userItem) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {userItem.username || "-"}
                      </Text>
                    ),
                  },
                  {
                    key: "employeeId",
                    label: "Staff ID",
                    width: 150,
                    render: (userItem) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {userItem.employeeId || "-"}
                      </Text>
                    ),
                  },
                  {
                    key: "phone",
                    label: "Phone",
                    width: 150,
                    render: (userItem) => (
                      <Text style={[styles.adminTableCellText, isDarkMode && styles.darkText]}>
                        {userItem.phone || "-"}
                      </Text>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    width: 120,
                    render: (userItem) => {
                      const userIsActive = isUserActive(userItem);
                      return (
                        <View
                          style={[
                            styles.userLiveStatusBadge,
                            {
                              backgroundColor: userIsActive ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                              alignSelf: "flex-start",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.userLiveStatusText,
                              { color: userIsActive ? "#10B981" : "#EF4444" },
                            ]}
                          >
                            {userIsActive ? "Active" : "Inactive"}
                          </Text>
                        </View>
                      );
                    },
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    width: 320,
                    render: (userItem) => {
                      const roleColor = getRoleColor(userItem.role);
                      const userIsActive = isUserActive(userItem);
                      return (
                        <View style={styles.adminTableActionRow}>
                          <TouchableOpacity
                            style={[styles.adminTableActionButton, { borderColor: `${roleColor}30`, backgroundColor: `${roleColor}12` }]}
                            onPress={() => handleViewUser(userItem)}
                          >
                            <Text style={[styles.adminTableActionText, { color: roleColor }]}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.adminTableActionButton, { borderColor: `${userManagementConfig.accent}30`, backgroundColor: `${userManagementConfig.accent}12` }]}
                            onPress={() => handleEditUser(userItem)}
                          >
                            <Text style={[styles.adminTableActionText, { color: userManagementConfig.accent }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.adminTableActionButton,
                              {
                                borderColor: userIsActive ? "rgba(245,158,11,0.24)" : "rgba(16,185,129,0.24)",
                                backgroundColor: userIsActive ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                              },
                            ]}
                            onPress={() => handleToggleUserStatus(userItem)}
                            disabled={processingId === `toggle-user-${userItem._id || userItem.id}`}
                          >
                            <Text
                              style={[
                                styles.adminTableActionText,
                                { color: userIsActive ? "#F59E0B" : "#10B981" },
                              ]}
                            >
                              {userIsActive ? "Deactivate" : "Activate"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.adminTableActionButton, { borderColor: "rgba(239,68,68,0.22)", backgroundColor: "rgba(239,68,68,0.12)" }]}
                            onPress={() => {
                              setSelectedUser(userItem);
                              setShowDeleteUserModal(true);
                            }}
                          >
                            <Text style={[styles.adminTableActionText, { color: "#EF4444" }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    },
                  },
                ],
              })}
              {renderCompactPagination({
                currentPage,
                totalPages,
                itemCount: totalFilteredUsers,
                itemLabel: "accounts",
                onPrevious: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
                onNext: () => setCurrentPage((prev) => Math.min(totalPages, prev + 1)),
              })}
            </>
          ) : (
            <View style={[styles.emptyState, styles.userEmptyState, isDarkMode && { backgroundColor: "#0F172A" }]}>
              <Ionicons name="people-outline" size={64} color="#CBD5E1" />
              <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>
                No accounts found
              </Text>
              <Text style={[styles.emptyStateSubtitle, isDarkMode && styles.darkTextSecondary]}>
                {userSearchQuery
                  ? "Try a different keyword or clear the search field to see more accounts."
                  : "There are no accounts in this view yet. Create a new account or switch filters to continue."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderAdminMapPage = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Campus Map"
          subtitle="Monitoring view for approved visitors, check-ins, and live system actions."
          badge={`${monitoredMapVisitors.length || 0} live markers`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <TouchableOpacity style={styles.pageRefreshButton} onPress={loadRecentActivities}>
              <Ionicons name="refresh-outline" size={22} color="#10B981" />
            </TouchableOpacity>
          }
        >
          {renderAdminMapWorkspace()}
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderSelectedModuleContent = () => {
    switch (selectedSubmodule) {
      case "account-create":
        return renderAccountCreationContent();
      case "account-records":
        return renderUserManagementContent();
      case "data-management":
        return renderDataManagementContent();
      case "map-ground":
      case "map-mezzanine":
      case "map-second":
      case "map-third":
        return renderFloorMapContent();
      case "appointment-records":
        return renderAppointmentRecordsContent();
      case "appointment-management":
        return renderAppointmentManagementContent();
      case "report-records":
        return renderReportRecordsContent();
      case "security-report-records":
        return renderSecurityReportRecordsContent();
      case "settings":
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C6DD0" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#0F172A" : "#F4F8FC"} />
      <View style={[styles.mainContainer, isDarkMode && { backgroundColor: theme.backgroundColor }]}>
        {/* Sidebar */}
        <View style={[styles.sidebar, isDarkMode && { backgroundColor: theme.sidebarBackground }]}>
          <ScrollView ref={sidebarScrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            <View style={[styles.sidebarHeader, isDarkMode && { borderBottomColor: "#334155" }]}>
              <Image source={require("../assets/LogoSapphire.jpg")} style={styles.sidebarLogoImage} />
              <Text style={[styles.sidebarBrand, isDarkMode && styles.darkText]}>Sapphire International Aviation Academy</Text>
              <View style={[styles.sidebarRoleBadge, isDarkMode && { backgroundColor: "#1C6DD0" }]}><Text style={styles.sidebarRoleText}>ADMIN</Text></View>
              <View style={[styles.sidebarStats, isDarkMode && { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.pendingRequests}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Pending</Text></View>
                <View style={[styles.sidebarStatDivider, isDarkMode && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.totalStaff}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Staff</Text></View>
                <View style={[styles.sidebarStatDivider, isDarkMode && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.totalGuards}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Guards</Text></View>
              </View>
            </View>

            <HoverBubble
              style={[
                styles.sidebarOverviewButton,
                selectedSubmodule === "dashboard" && styles.sidebarOverviewButtonActive,
              ]}
              onPress={() => handleMenuAction("dashboard")}
              hoverScale={1.035}
            >
              <View style={[styles.sidebarMenuIcon, { backgroundColor: "rgba(37,99,235,0.16)" }]}>
                <Ionicons name="grid-outline" size={20} color="#0A3D91" />
              </View>
              <Text style={[styles.sidebarMenuLabel, selectedSubmodule === "dashboard" && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                Dashboard Overview
              </Text>
            </HoverBubble>

            <View style={styles.sidebarModuleGroup}>
              {adminModules.map((module) => {
                const isExpanded = expandedModule === module.key;
                const hasSelectedChild = module.submodules.some((submodule) => submodule.key === selectedSubmodule);

                return (
                  <View key={module.key} style={styles.sidebarModuleCard}>
                    <HoverBubble
                      style={[
                        styles.sidebarModuleButton,
                        hasSelectedChild && styles.sidebarModuleButtonActive,
                        isDarkMode && hasSelectedChild && { backgroundColor: "rgba(139,92,246,0.18)", borderColor: "rgba(196,181,253,0.24)" },
                      ]}
                      onPress={() => handleModuleToggle(module.key)}
                      hoverScale={1.025}
                    >
                      <View style={[styles.sidebarMenuIcon, { backgroundColor: `${module.color}16` }]}>
                        <Ionicons name={module.icon} size={20} color={module.color} />
                      </View>
                      <View style={styles.sidebarModuleCopy}>
                        <Text style={[styles.sidebarMenuLabel, hasSelectedChild && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                          {module.label}
                        </Text>
                        <Text style={styles.sidebarModuleHint}>
                          {module.submodules.length} section{module.submodules.length === 1 ? "" : "s"}
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                        size={18}
                        color={hasSelectedChild ? module.color : "#64748B"}
                      />
                    </HoverBubble>

                    {isExpanded ? (
                      <View style={styles.sidebarSubmoduleList}>
                        {module.submodules.map((submodule) => {
                          const isSubmoduleActive = selectedSubmodule === submodule.key;

                          return (
                            <HoverBubble
                              key={submodule.key}
                              style={[
                                styles.sidebarSubmoduleButton,
                                isSubmoduleActive && styles.sidebarSubmoduleButtonActive,
                              ]}
                              onPress={() => selectAdminSubmodule(submodule.key)}
                              hoverScale={1.025}
                            >
                              <Text
                                style={[
                                  styles.sidebarSubmoduleLabel,
                                  isSubmoduleActive && styles.sidebarSubmoduleLabelActive,
                                ]}
                              >
                                {submodule.label}
                              </Text>
                              {submodule.badge > 0 ? (
                                <View style={styles.sidebarSubmoduleBadge}>
                                  <Text style={styles.sidebarSubmoduleBadgeText}>{submodule.badge}</Text>
                                </View>
                              ) : null}
                            </HoverBubble>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <HoverBubble
              style={[
                styles.sidebarUtilityButton,
                selectedSubmodule === "settings" && styles.sidebarUtilityButtonActive,
              ]}
              onPress={() => handleMenuAction("settings")}
              hoverScale={1.035}
            >
              <View style={[styles.sidebarMenuIcon, { backgroundColor: "rgba(148,163,184,0.14)" }]}>
                <Ionicons name="settings-outline" size={20} color="#64748B" />
              </View>
              <Text style={[styles.sidebarMenuLabel, selectedSubmodule === "settings" && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                Settings
              </Text>
            </HoverBubble>

            <View style={[styles.sidebarUserSection, isDarkMode && { borderTopColor: "#334155" }]}>
              <View style={styles.sidebarUserInfo}>
                <View style={[styles.sidebarUserAvatar, isDarkMode && { backgroundColor: "#334155" }]}><Text style={[styles.sidebarUserAvatarText, isDarkMode && { color: "#1C6DD0" }]}>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</Text></View>
                <View><Text style={[styles.sidebarUserName, isDarkMode && styles.darkText]}>{user?.firstName} {user?.lastName}</Text><Text style={[styles.sidebarUserEmail, isDarkMode && { color: "rgba(255,255,255,0.5)" }]}>{user?.email}</Text></View>
              </View>
              <HoverBubble style={[styles.sidebarLogoutButton, isDarkMode && { backgroundColor: "rgba(239,68,68,0.2)" }]} onPress={handleLogout} hoverScale={1.035}>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" /><Text style={[styles.sidebarLogoutText, isDarkMode && { color: "#FCA5A5" }]}>Logout</Text>
              </HoverBubble>
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={[styles.sidebarFooterText, isDarkMode && { color: "rgba(255,255,255,0.3)" }]}>Sapphire International Aviation Academy</Text>
              <Text style={[styles.sidebarFooterVersion, isDarkMode && { color: "rgba(255,255,255,0.2)" }]}>v1.0.0</Text>
            </View>
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.adminContentShell}>
        <View style={[styles.contentArea, isDarkMode && { backgroundColor: theme.backgroundColor }]}>
          <Animated.View style={[styles.header, { opacity: headerOpacity }, isDarkMode && { backgroundColor: theme.headerBackground, borderBottomColor: "#334155" }]}>
            <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
                {selectedSubmoduleMeta.title}
              </Text>
              <Text style={[styles.headerSubtitle, isDarkMode && styles.darkTextSecondary]}>
                {selectedSubmoduleMeta.subtitle}
              </Text>
              <View style={styles.headerMetaRow}>
                <View style={[styles.headerMetaBadge, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}>
                  <Ionicons name="calendar-outline" size={14} color="#0A3D91" />
                  <Text style={[styles.headerMetaText, isDarkMode && styles.darkTextSecondary]}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </Text>
                </View>
                {selectedSubmoduleMeta.highlights.map((item) => (
                  <View
                    key={item.label}
                    style={[styles.headerMetaBadge, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}
                  >
                    <Ionicons name={item.icon} size={14} color={item.color} />
                    <Text style={[styles.headerMetaText, isDarkMode && styles.darkTextSecondary]}>
                      {item.label}: {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.profileButton}><View style={[styles.profileIcon, isDarkMode && { backgroundColor: "#1C6DD0" }]}><Text style={styles.profileInitials}>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</Text></View></TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <AdminFeedbackBanner
            notice={adminNotice}
            isDarkMode={isDarkMode}
            theme={theme}
            onDismiss={() => setAdminNotice(null)}
          />

          {renderSelectedModuleContent()}
        </View>
        </View>
      </View>

      {/* Request Details Modal */}
      <Modal visible={showRequestDetailsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Visit Request Details</Text>
              <TouchableOpacity onPress={() => setShowRequestDetailsModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>
            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                <View style={[styles.detailAvatar, isDarkMode && { backgroundColor: "#334155" }]}>
                  <Text style={styles.detailAvatarText}>{selectedRequest.fullName?.charAt(0) || "V"}</Text>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Full Name</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.fullName}</Text>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Email</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.email}</Text>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Phone</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.phoneNumber}</Text>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Purpose of Visit</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.purposeOfVisit}</Text>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Appointment Request Update</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>
                    Current: {selectedRequest.assignedOffice || selectedRequest.appointmentDepartment || selectedRequest.host || "Unassigned"} · {formatDateTime(selectedRequest.visitDate)} · {formatTime(selectedRequest.visitTime)}
                  </Text>
                  <TextInput
                    style={[
                      styles.rejectInput,
                      {
                        minHeight: 46,
                        marginTop: 10,
                        textAlignVertical: "center",
                      },
                      isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                    ]}
                    placeholder="Update office shown in visitor appointment"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    value={officeEditValue}
                    onChangeText={setOfficeEditValue}
                  />
                  <View style={{ flexDirection: width < 560 ? "column" : "row", gap: 10, marginTop: 10 }}>
                    <TextInput
                      style={[
                        styles.rejectInput,
                        {
                          flex: 1,
                          minHeight: 46,
                          textAlignVertical: "center",
                        },
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      placeholder="Visit date: YYYY-MM-DD"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={appointmentEditDateValue}
                      onChangeText={setAppointmentEditDateValue}
                    />
                    <TextInput
                      style={[
                        styles.rejectInput,
                        {
                          flex: 1,
                          minHeight: 46,
                          textAlignVertical: "center",
                        },
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      placeholder="Visit time: HH:MM"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={appointmentEditTimeValue}
                      onChangeText={setAppointmentEditTimeValue}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { alignSelf: "flex-start", marginTop: 10, backgroundColor: "#F59E0B" },
                    ]}
                    onPress={handleSaveAppointmentOffice}
                    disabled={isUpdatingOffice}
                  >
                    {isUpdatingOffice ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>Save Appointment Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Visit Date & Time</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{formatDateTime(selectedRequest.visitDate)}</Text>
                </View>
                {selectedRequest.vehicleNumber && (
                  <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                    <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Vehicle Number</Text>
                    <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.vehicleNumber}</Text>
                  </View>
                )}
                <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(getRequestStatus(selectedRequest)).bg, alignSelf: "flex-start" }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(getRequestStatus(selectedRequest)).text }]}>{getStatusColor(getRequestStatus(selectedRequest)).label}</Text>
                  </View>
                </View>
                {selectedRequest.rejectionReason && (
                  <View style={[styles.detailSection, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                    <Text style={[styles.detailLabel, isDarkMode && styles.darkTextSecondary]}>Rejection Reason</Text>
                    <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{selectedRequest.rejectionReason}</Text>
                  </View>
                )}
              </ScrollView>
            )}
            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => setShowRequestDetailsModal(false)}>
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Close</Text>
              </TouchableOpacity>
              {getRequestStatus(selectedRequest) === "pending" && (
                <>
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: "#10B981" }]} onPress={() => handleApproveRequest(selectedRequest)} disabled={processingId === selectedRequest?._id}>
                    {processingId === selectedRequest?._id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Approve</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: "#EF4444" }]} onPress={() => { setShowRequestDetailsModal(false); setShowRejectModal(true); }}>
                    <Text style={styles.submitButtonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.rejectModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={[styles.confirmTitle, isDarkMode && styles.darkText]}>Reject Visit Request</Text>
            <Text style={[styles.confirmMessage, isDarkMode && styles.darkTextSecondary]}>Reason for rejecting {selectedRequest?.fullName}'s visit request</Text>
            <TextInput style={[styles.rejectInput, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]} placeholder="Enter rejection reason..." placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"} multiline numberOfLines={3} value={rejectionReason} onChangeText={setRejectionReason} />
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.confirmCancel, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => { setShowRejectModal(false); setRejectionReason(""); }}>
                <Text style={[styles.confirmCancelText, isDarkMode && styles.darkTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: "#EF4444" }]} onPress={handleRejectRequest} disabled={processingId === selectedRequest?._id}>
                {processingId === selectedRequest?._id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Reject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

{/* Add User Modal */}
<Modal visible={showAddUserModal} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View
      style={[
        styles.createUserModal,
        isDarkMode && {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.modalHeader,
          isDarkMode && { borderBottomColor: theme.borderColor },
        ]}
      >
        <View style={styles.createAccountHeaderCopy}>
          <View style={styles.createAccountHeaderTitleRow}>
            <View
              style={[
                styles.createAccountHeaderIcon,
                { backgroundColor: `${getRoleColor(newUserData.role)}18` },
              ]}
            >
              <Ionicons
                name={getRoleIcon(newUserData.role)}
                size={20}
                color={getRoleColor(newUserData.role)}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Create New Account
              </Text>
              <Text
                style={[
                  styles.createUserSubtitle,
                  isDarkMode && styles.darkTextSecondary,
                ]}
              >
                Add a staff or security account with a cleaner setup flow and
                live preview.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowAddUserModal(false)}>
          <Ionicons
            name="close"
            size={24}
            color={isDarkMode ? "#94A3B8" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.modalBody}
        contentContainerStyle={styles.createUserBody}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.createAccountLayout,
            isDarkMode && { borderColor: theme.borderColor },
          ]}
        >
          {/* LEFT SIDE */}
          <View style={styles.createAccountFormColumn}>
            <View
              style={[
                styles.createAccountSectionCard,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.createAccountSectionHeader}>
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color={getRoleColor(newUserData.role)}
                />
                <View>
                  <Text
                    style={[
                      styles.createAccountSectionTitle,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Account Type
                  </Text>
                  <Text
                    style={[
                      styles.createAccountSectionSubtitle,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Choose what kind of account you want to create.
                  </Text>
                </View>
              </View>

              <View style={styles.roleCardRow}>
                {["staff", "security"].map((role) => {
                  const active = newUserData.role === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      activeOpacity={0.9}
                      style={[
                        styles.roleCard,
                        active && styles.roleCardActive,
                        {
                          borderColor: active
                            ? getRoleColor(role)
                            : isDarkMode
                              ? theme.borderColor
                              : "#E2E8F0",
                          backgroundColor: active
                            ? `${getRoleColor(role)}12`
                            : isDarkMode
                              ? "#111827"
                              : "#FFFFFF",
                        },
                      ]}
                      onPress={() => {
                        resetCreateUserForm(role);
                      }}
                    >
                      <View
                        style={[
                          styles.roleCardIcon,
                          { backgroundColor: `${getRoleColor(role)}18` },
                        ]}
                      >
                        <Ionicons
                          name={getRoleIcon(role)}
                          size={18}
                          color={getRoleColor(role)}
                        />
                      </View>

                      <Text
                        style={[
                          styles.roleCardTitle,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        {role === "staff" ? "Staff Member" : "Security Personnel"}
                      </Text>

                      <Text
                        style={[
                          styles.roleCardText,
                          isDarkMode && styles.darkTextSecondary,
                        ]}
                      >
                        {role === "staff"
                          ? "Office staff, records, and appointment handling."
                          : "Checkpoint, access control, and visitor verification."}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={[
                styles.createAccountSectionCard,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.createAccountSectionHeader}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={getRoleColor(newUserData.role)}
                />
                <View>
                  <Text
                    style={[
                      styles.createAccountSectionTitle,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Personal Information
                  </Text>
                  <Text
                    style={[
                      styles.createAccountSectionSubtitle,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Enter the basic identity and contact details.
                  </Text>
                </View>
              </View>

              <View style={styles.userEditorRow}>
                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    First Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      createUserErrors.firstName && styles.inputError,
                      isDarkMode && {
                        backgroundColor: "#111827",
                        borderColor: theme.borderColor,
                        color: "#F8FBFE",
                      },
                    ]}
                    placeholder="Enter first name"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    value={newUserData.firstName}
                    onChangeText={(text) =>
                      setNewUserData((prev) => ({ ...prev, firstName: text }))
                    }
                  />
                  {renderCreateUserFieldError("firstName")}
                </View>

                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    Last Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      createUserErrors.lastName && styles.inputError,
                      isDarkMode && {
                        backgroundColor: "#111827",
                        borderColor: theme.borderColor,
                        color: "#F8FBFE",
                      },
                    ]}
                    placeholder="Enter last name"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    value={newUserData.lastName}
                    onChangeText={(text) =>
                      setNewUserData((prev) => ({ ...prev, lastName: text }))
                    }
                  />
                  {renderCreateUserFieldError("lastName")}
                </View>
              </View>

              <View style={styles.userEditorRow}>
                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    Email Address
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      createUserErrors.email && styles.inputError,
                      isDarkMode && {
                        backgroundColor: "#111827",
                        borderColor: theme.borderColor,
                        color: "#F8FBFE",
                      },
                    ]}
                    placeholder="Enter email address"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newUserData.email}
                    onChangeText={(text) =>
                      setNewUserData((prev) => ({ ...prev, email: text }))
                    }
                  />
                  {renderCreateUserFieldError("email")}
                </View>

                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    Phone Number
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      createUserErrors.phone && styles.inputError,
                      isDarkMode && {
                        backgroundColor: "#111827",
                        borderColor: theme.borderColor,
                        color: "#F8FBFE",
                      },
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    keyboardType="phone-pad"
                    value={newUserData.phone}
                    onChangeText={(text) =>
                      setNewUserData((prev) => ({ ...prev, phone: text }))
                    }
                  />
                  {renderCreateUserFieldError("phone")}
                </View>
              </View>
            </View>

            <View
              style={[
                styles.createAccountSectionCard,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.createAccountSectionHeader}>
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color={getRoleColor(newUserData.role)}
                />
                <View>
                  <Text
                    style={[
                      styles.createAccountSectionTitle,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Work Details
                  </Text>
                  <Text
                    style={[
                      styles.createAccountSectionSubtitle,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Assign role-specific work information.
                  </Text>
                </View>
              </View>

              {newUserData.role === "staff" ? (
                <>
                  <View style={styles.userEditorRow}>
                    {renderStaffDropdown({
                      target: "department",
                      label: "Department",
                      value: newUserData.department,
                      options: STAFF_DEPARTMENT_OPTIONS,
                      placeholder: "Select department",
                      icon: "business-outline",
                      onSelect: (value) => {
                        const firstOfficer =
                          STAFF_OFFICER_OPTIONS_BY_DEPARTMENT[value]?.[0]?.value ||
                          "";
                        setNewUserData((prev) => ({
                          ...prev,
                          department: value,
                          position: firstOfficer,
                        }));
                        setStaffDropdownOpen(null);
                      },
                    })}

                    {renderStaffDropdown({
                      target: "position",
                      label: "Officer Type",
                      value: newUserData.position,
                      options:
                        STAFF_OFFICER_OPTIONS_BY_DEPARTMENT[
                          newUserData.department
                        ] || [],
                      placeholder: "Select officer type",
                      icon: "id-card-outline",
                      onSelect: (value) => {
                        setNewUserData((prev) => ({ ...prev, position: value }));
                        setStaffDropdownOpen(null);
                      },
                    })}
                  </View>

                  <View style={styles.userEditorRow}>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Shift
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          isDarkMode && {
                            backgroundColor: "#111827",
                            borderColor: theme.borderColor,
                            color: "#F8FBFE",
                          },
                        ]}
                        placeholder="e.g. 8:00 AM - 5:00 PM"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.shift}
                        onChangeText={(text) =>
                          setNewUserData((prev) => ({ ...prev, shift: text }))
                        }
                      />
                    </View>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Generated Staff ID
                      </Text>
                      <View
                        style={[
                          styles.createAccountStatusBadge,
                          {
                            backgroundColor: "rgba(28,109,208,0.12)",
                            borderColor: "rgba(28,109,208,0.22)",
                            justifyContent: "flex-start",
                          },
                        ]}
                      >
                        <Text style={[styles.createAccountStatusText, { color: "#0A3D91" }]}>
                          {getGeneratedEmployeeIdPreview()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.userEditorRow}>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Department
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          isDarkMode && {
                            backgroundColor: "#111827",
                            borderColor: theme.borderColor,
                            color: "#F8FBFE",
                          },
                        ]}
                        placeholder="Security Department"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.department}
                        onChangeText={(text) =>
                          setNewUserData((prev) => ({
                            ...prev,
                            department: text,
                          }))
                        }
                      />
                    </View>

                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Position
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          isDarkMode && {
                            backgroundColor: "#111827",
                            borderColor: theme.borderColor,
                            color: "#F8FBFE",
                          },
                        ]}
                        placeholder="Security Personnel"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.position}
                        onChangeText={(text) =>
                          setNewUserData((prev) => ({
                            ...prev,
                            position: text,
                          }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.userEditorRow}>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Shift
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          isDarkMode && {
                            backgroundColor: "#111827",
                            borderColor: theme.borderColor,
                            color: "#F8FBFE",
                          },
                        ]}
                        placeholder="e.g. Day Shift / Night Shift"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.shift}
                        onChangeText={(text) =>
                          setNewUserData((prev) => ({ ...prev, shift: text }))
                        }
                      />
                    </View>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text
                        style={[styles.inputLabel, isDarkMode && styles.darkText]}
                      >
                        Generated Staff ID
                      </Text>
                      <View
                        style={[
                          styles.createAccountStatusBadge,
                          {
                            backgroundColor: "rgba(28,109,208,0.12)",
                            borderColor: "rgba(28,109,208,0.22)",
                            justifyContent: "flex-start",
                          },
                        ]}
                      >
                        <Text style={[styles.createAccountStatusText, { color: "#0A3D91" }]}>
                          {getGeneratedEmployeeIdPreview()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View
              style={[
                styles.createAccountSectionCard,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.createAccountSectionHeader}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={getRoleColor(newUserData.role)}
                />
                <View>
                  <Text
                    style={[
                      styles.createAccountSectionTitle,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Login Details
                  </Text>
                  <Text
                    style={[
                      styles.createAccountSectionSubtitle,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    A temporary password will be emailed automatically after the account is created.
                  </Text>
                </View>
              </View>

              <View style={styles.userEditorRow}>
                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    Username
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      createUserErrors.username && styles.inputError,
                      isDarkMode && {
                        backgroundColor: "#111827",
                        borderColor: theme.borderColor,
                        color: "#F8FBFE",
                      },
                    ]}
                    placeholder="Enter username"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    autoCapitalize="none"
                    value={newUserData.username}
                    onChangeText={(text) =>
                      setNewUserData((prev) => ({ ...prev, username: text }))
                    }
                  />
                  {renderCreateUserFieldError("username")}
                </View>

                <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                    Status
                  </Text>
                  <View
                    style={[
                      styles.createAccountStatusBadge,
                      {
                        backgroundColor:
                          newUserData.status === "active"
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(148,163,184,0.12)",
                        borderColor:
                          newUserData.status === "active"
                            ? "rgba(16,185,129,0.28)"
                            : "rgba(148,163,184,0.24)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.createAccountStatusText,
                        {
                          color:
                            newUserData.status === "active"
                              ? "#10B981"
                              : "#64748B",
                        },
                      ]}
                    >
                      {newUserData.status === "active"
                        ? "Active account"
                        : "Inactive account"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.createAccountStatusBadge,
                  {
                    backgroundColor: "rgba(28,109,208,0.12)",
                    borderColor: "rgba(28,109,208,0.22)",
                    justifyContent: "flex-start",
                  },
                ]}
              >
                <Text style={[styles.createAccountStatusText, { color: "#0A3D91" }]}>
                  Temporary password delivery: sent to the user's Gmail after account creation.
                </Text>
              </View>
            </View>
          </View>

          {/* RIGHT SIDE */}
          <View style={styles.createAccountPreviewColumn}>
            <View
              style={[
                styles.previewStickyCard,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.createAccountPreviewTop}>
                <View
                  style={[
                    styles.createAccountPreviewAvatar,
                    { backgroundColor: `${getRoleColor(newUserData.role)}16` },
                  ]}
                >
                  <Text
                    style={[
                      styles.createAccountPreviewAvatarText,
                      { color: getRoleColor(newUserData.role) },
                    ]}
                  >
                    {`${(newUserData.firstName || "A").charAt(0)}${(
                      newUserData.lastName || "U"
                    ).charAt(0)}`.toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.createAccountPreviewName,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {`${newUserData.firstName || "New"} ${newUserData.lastName || "User"}`}
                  </Text>
                  <View
                    style={[
                      styles.createAccountPreviewRoleBadge,
                      { backgroundColor: `${getRoleColor(newUserData.role)}14` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.createAccountPreviewRoleText,
                        { color: getRoleColor(newUserData.role) },
                      ]}
                    >
                      {newUserData.role === "staff"
                        ? "Staff Account"
                        : "Security Account"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.createAccountPreviewList}>
                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Email
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {newUserData.email || "No email yet"}
                  </Text>
                </View>

                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Phone
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {newUserData.phone || "No phone yet"}
                  </Text>
                </View>

                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Department
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {newUserData.department || "Not assigned"}
                  </Text>
                </View>

                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Position
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {newUserData.position || "Not assigned"}
                  </Text>
                </View>

                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Employee ID
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {getGeneratedEmployeeIdPreview()}
                  </Text>
                </View>

                <View style={styles.createAccountPreviewItem}>
                  <Text
                    style={[
                      styles.createAccountPreviewLabel,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    Username
                  </Text>
                  <Text
                    style={[
                      styles.createAccountPreviewValue,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {newUserData.username || "No username yet"}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.createAccountPreviewNote,
                  isDarkMode && {
                    backgroundColor: "#111827",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Ionicons name="information-circle-outline" size={16} color="#1C6DD0" />
                <Text
                  style={[
                    styles.createAccountPreviewNoteText,
                    isDarkMode && styles.darkTextSecondary,
                  ]}
                >
                  Review all details before saving. This account will be routed
                  to the proper dashboard after login.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.modalFooter,
          isDarkMode && { borderTopColor: theme.borderColor },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cancelButton,
            isDarkMode && { backgroundColor: "#334155" },
          ]}
          onPress={() => resetCreateUserForm(newUserData.role)}
        >
          <Text
            style={[
              styles.cancelButtonText,
              isDarkMode && styles.darkTextSecondary,
            ]}
          >
            Clear Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: getRoleColor(newUserData.role) }]}
          onPress={handleCreateUser}
          disabled={processingId === "create-user"}
        >
          {processingId === "create-user" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* Edit User Modal */}
      <Modal visible={showViewUserModal} transparent animationType="fade" onRequestClose={() => setShowViewUserModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.userProfileModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View
              style={[
                styles.userProfileHero,
                { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderBottomColor: theme.borderColor },
              ]}
            >
              <View style={styles.userProfileHeroTopRow}>
                <View
                  style={[
                    styles.userProfileAvatar,
                    { backgroundColor: `${getRoleColor(selectedUser?.role)}16` || "rgba(59,130,246,0.14)" },
                  ]}
                >
                  <Text style={[styles.userProfileAvatarText, { color: getRoleColor(selectedUser?.role) || "#1C6DD0" }]}>
                    {getUserInitials(selectedUser)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowViewUserModal(false)} style={styles.userProfileCloseButton}>
                  <Ionicons name="close" size={22} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.userProfileName, isDarkMode && styles.darkText]}>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Text>
              <Text style={[styles.userProfileEmail, isDarkMode && styles.darkTextSecondary]}>
                {selectedUser?.email || "No email available"}
              </Text>

              <View style={styles.userProfileBadgeRow}>
                <View style={[styles.userProfileBadge, { backgroundColor: `${getRoleColor(selectedUser?.role)}14` || "rgba(59,130,246,0.12)" }]}>
                  <Text style={[styles.userProfileBadgeText, { color: getRoleColor(selectedUser?.role) || "#1C6DD0" }]}>
                    {formatRoleLabel(selectedUser?.role)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.userProfileBadge,
                    {
                      backgroundColor: isUserActive(selectedUser) ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.userProfileBadgeText,
                      { color: isUserActive(selectedUser) ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {isUserActive(selectedUser) ? "Active Account" : "Inactive Account"}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.userProfileBody} contentContainerStyle={styles.userProfileBodyContent} showsVerticalScrollIndicator={false}>
              <View style={styles.userProfileSection}>
                <Text style={[styles.userProfileSectionTitle, isDarkMode && styles.darkText]}>Account Overview</Text>
                <View style={styles.userProfileInfoGrid}>
                  <View style={[styles.userProfileInfoCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Username</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {selectedUser?.username || "Not set"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Phone</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {selectedUser?.phone || "No phone number"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Employee ID</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {selectedUser?.employeeId || "Not assigned"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Department</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {selectedUser?.department || "General"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Position</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {selectedUser?.position || (isSecurityRole(selectedUser?.role) ? "Security Personnel" : "Not set")}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.userProfileCallout,
                  isDarkMode && { backgroundColor: "#172554", borderColor: "#041E42" },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color="#1C6DD0" />
                <Text style={[styles.userProfileCalloutText, isDarkMode && { color: "#EEF5FF" }]}>
                  Review the account details here before editing access, role, or status.
                </Text>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity
                style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]}
                onPress={() => setShowViewUserModal(false)}
              >
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (selectedUser) {
                    handleEditUser(selectedUser);
                    setShowViewUserModal(false);
                  }
                }}
              >
                <Text style={styles.submitButtonText}>Edit User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditUserModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.userEditorModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Edit User</Text>
                <Text style={[styles.userEditorSubtitle, isDarkMode && styles.darkTextSecondary]}>
                  Update account details, role, and operational status.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditUserModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={styles.userEditorBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.userEditorHero, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                <View style={[styles.userProfileAvatar, { backgroundColor: `${getRoleColor(editUserData.role)}16` }]}>
                  <Text style={[styles.userProfileAvatarText, { color: getRoleColor(editUserData.role) }]}>
                    {getUserInitials(editUserData)}
                  </Text>
                </View>
                <View style={styles.userEditorHeroCopy}>
                  <Text style={[styles.userEditorHeroName, isDarkMode && styles.darkText]}>
                    {editUserData.firstName || "User"} {editUserData.lastName || ""}
                  </Text>
                  <Text style={[styles.userEditorHeroEmail, isDarkMode && styles.darkTextSecondary]}>
                    {editUserData.email || "No email available"}
                  </Text>
                  <View style={styles.userProfileBadgeRow}>
                    <View style={[styles.userProfileBadge, { backgroundColor: `${getRoleColor(editUserData.role)}14` }]}>
                      <Text style={[styles.userProfileBadgeText, { color: getRoleColor(editUserData.role) }]}>
                        {formatRoleLabel(editUserData.role)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.userProfileBadge,
                        {
                          backgroundColor: editUserData.status === "active" ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.userProfileBadgeText,
                          { color: editUserData.status === "active" ? "#10B981" : "#EF4444" },
                        ]}
                      >
                        {editUserData.status === "active" ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Identity</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>First Name</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      value={editUserData.firstName}
                      onChangeText={(text) => setEditUserData({ ...editUserData, firstName: text })}
                      placeholder="First Name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Last Name</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      value={editUserData.lastName}
                      onChangeText={(text) => setEditUserData({ ...editUserData, lastName: text })}
                      placeholder="Last Name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Contact</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Username</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      value={editUserData.username}
                      onChangeText={(text) => setEditUserData({ ...editUserData, username: normalizeUsernameInput(text) })}
                      placeholder="Username"
                      autoCapitalize="none"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Email</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="mail-outline" size={16} color="#64748B" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {editUserData.email || "No email available"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Phone</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      value={editUserData.phone}
                      onChangeText={(text) => setEditUserData({ ...editUserData, phone: text })}
                      placeholder="09123456789"
                      keyboardType="phone-pad"
                      maxLength={16}
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Staff ID</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      value={editUserData.employeeId}
                      onChangeText={(text) => setEditUserData({ ...editUserData, employeeId: text })}
                      placeholder="Staff ID"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Access & Role</Text>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Role</Text>
                  <View style={styles.userEditorRoleWrap}>
                    {["staff", "security", "admin", "visitor"].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.userEditorRoleOption,
                          editUserData.role === role && styles.roleOptionActive,
                          isDarkMode && editUserData.role !== role && { backgroundColor: "#334155", borderColor: "#475569" },
                        ]}
                        onPress={() => setEditUserData((currentForm) => {
                          const nextDepartment =
                            role === "security"
                              ? "Security Department"
                              : currentForm.department === "Security Department" || !currentForm.department
                                ? "Admissions"
                                : currentForm.department;
                          return {
                            ...currentForm,
                            role,
                            department: nextDepartment,
                            position:
                              role === "security"
                                ? currentForm.position || "Security Personnel"
                                : currentForm.position === "Security Personnel"
                                  ? getDefaultStaffPosition(nextDepartment)
                                  : currentForm.position || getDefaultStaffPosition(nextDepartment),
                            shift: "",
                          };
                        })}
                      >
                        <Text style={[styles.roleText, editUserData.role === role && styles.roleTextActive, isDarkMode && editUserData.role !== role && { color: "#CBD5E1" }]}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Status</Text>
                    <View style={styles.roleSelector}>
                      <TouchableOpacity
                        style={[styles.roleOption, editUserData.status === "active" && styles.roleOptionActive, isDarkMode && editUserData.status !== "active" && { backgroundColor: "#334155", borderColor: "#475569" }]}
                        onPress={() => setEditUserData({ ...editUserData, status: "active", isActive: true })}
                      >
                        <Text style={[styles.roleText, editUserData.status === "active" && styles.roleTextActive, isDarkMode && editUserData.status !== "active" && { color: "#CBD5E1" }]}>Active</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.roleOption, editUserData.status === "inactive" && styles.roleOptionActive, isDarkMode && editUserData.status !== "inactive" && { backgroundColor: "#334155", borderColor: "#475569" }]}
                        onPress={() => setEditUserData({ ...editUserData, status: "inactive", isActive: false })}
                      >
                        <Text style={[styles.roleText, editUserData.status === "inactive" && styles.roleTextActive, isDarkMode && editUserData.status !== "inactive" && { color: "#CBD5E1" }]}>Inactive</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Employee ID</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="card-outline" size={16} color="#64748B" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {editUserData.employeeId || "Not assigned"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {editUserData.role === "staff" && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Staff Details</Text>
                  <View style={styles.userEditorGrid}>
                    {renderStaffDropdown({
                      target: "edit",
                      label: "Department",
                      value: editUserData.department,
                      options: STAFF_DEPARTMENT_OPTIONS,
                      placeholder: "Choose department",
                      icon: "business-outline",
                      onSelect: (department) => updateStaffDepartment("edit", department),
                    })}
                    {renderStaffDropdown({
                      target: "edit",
                      label: "Officer Type",
                      value: editUserData.position,
                      options: getStaffOfficerOptions(editUserData.department),
                      placeholder: "Choose officer type",
                      icon: "id-card-outline",
                      onSelect: (position) => updateStaffPosition("edit", position),
                    })}
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Assigned Area</Text>
                      <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                        <Ionicons name="location-outline" size={16} color="#64748B" />
                        <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                          {getStaffDepartmentOption(editUserData.department)?.area || "General Area"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {isSecurityRole(editUserData.role) && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Security Details</Text>
                  <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                      Shift schedule is not stored here because assignments can rotate anytime.
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.userProfileCallout, isDarkMode && { backgroundColor: "#172554", borderColor: "#041E42" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#1C6DD0" />
                <Text style={[styles.userProfileCalloutText, isDarkMode && { color: "#EEF5FF" }]}>
                  Email and employee ID stay visible here for reference while you update role-based access settings.
                </Text>
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => setShowEditUserModal(false)}>
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={confirmEditUser} disabled={processingId === "edit-user"}>
                {processingId === "edit-user" ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete User Modal */}
      <Modal visible={showDeleteUserModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <Ionicons name="warning" size={48} color="#EF4444" />
            <Text style={[styles.confirmTitle, isDarkMode && styles.darkText]}>Delete User</Text>
            <Text style={[styles.confirmMessage, isDarkMode && styles.darkTextSecondary]}>Delete {selectedUser?.firstName} {selectedUser?.lastName}?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.confirmCancel, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => setShowDeleteUserModal(false)}>
                <Text style={[styles.confirmCancelText, isDarkMode && styles.darkTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#EF4444" }]}
                onPress={handleDeleteUser}
                disabled={processingId === `delete-user-${selectedUser?._id || selectedUser?.id}`}
              >
                {processingId === `delete-user-${selectedUser?._id || selectedUser?.id}` ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPendingRequestsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPendingRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.pendingRequestsModal,
              isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
            ]}
          >
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Pending Requests</Text>
                <Text style={[styles.pendingRequestsModalSubtitle, isDarkMode && styles.darkTextSecondary]}>
                  Review visitor requests without crowding the dashboard.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPendingRequestsModal(false)}
              >
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.pendingRequestsModalList}
              contentContainerStyle={styles.pendingRequestsModalListContent}
              showsVerticalScrollIndicator={false}
            >
              {pendingRequests.length ? (
                pendingRequests.slice(0, 10).map((request) => renderRequestCard(request))
              ) : (
                <View style={styles.pendingRequestsModalEmpty}>
                  <Ionicons name="checkmark-circle-outline" size={42} color="#10B981" />
                  <Text style={[styles.pendingRequestsModalEmptyTitle, isDarkMode && styles.darkText]}>
                    No pending requests
                  </Text>
                  <Text style={[styles.pendingRequestsModalEmptyText, isDarkMode && styles.darkTextSecondary]}>
                    New visitor requests will appear here as notifications.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity
                style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]}
                onPress={() => setShowPendingRequestsModal(false)}
              >
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  setShowPendingRequestsModal(false);
                  handleMenuAction("requests");
                }}
              >
                <Text style={styles.submitButtonText}>Open Requests</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogoutConfirmModal} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <Ionicons name="log-out-outline" size={48} color="#EF4444" />
            <Text style={[styles.confirmTitle, isDarkMode && styles.darkText]}>Sign Out</Text>
            <Text style={[styles.confirmMessage, isDarkMode && styles.darkTextSecondary]}>
              Do you really want to sign out of the admin dashboard?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmCancel, isDarkMode && { backgroundColor: "#334155" }]}
                onPress={() => setShowLogoutConfirmModal(false)}
                disabled={isLoading}
              >
                <Text style={[styles.confirmCancelText, isDarkMode && styles.darkTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#EF4444" }]}
                onPress={performLogout}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Sign Out</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create User Success Modal */}
      <Modal
        visible={showCreateSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCreateSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.createSuccessIcon, isDarkMode && { backgroundColor: "#064E3B" }]}>
              <Ionicons name="checkmark-circle" size={52} color="#10B981" />
            </View>
            <Text style={[styles.confirmTitle, isDarkMode && styles.darkText]}>Account Created</Text>
            <Text style={[styles.confirmMessage, isDarkMode && styles.darkTextSecondary]}>
              The new {createdUserSummary?.role?.toLowerCase() || "user"} account has been created successfully.
            </Text>

            <View style={[styles.createSuccessSummary, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Name</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.name || "N/A"}</Text>
              </View>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Email</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.email || "N/A"}</Text>
              </View>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Username</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.username || "N/A"}</Text>
              </View>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Role</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.role || "N/A"}</Text>
              </View>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Employee ID</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.employeeId || "N/A"}</Text>
              </View>
              <View style={styles.createSuccessRow}>
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Status</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.status || "N/A"}</Text>
              </View>
            </View>

            <View style={[styles.createSuccessNote, isDarkMode && { backgroundColor: "#172554", borderColor: "#041E42" }]}>
              <Ionicons name="mail-outline" size={16} color="#1C6DD0" />
              <Text style={[styles.createSuccessNoteText, isDarkMode && { color: "#B7D5F6" }]}>
                {createdUserSummary?.deliveryNote || "The account details are ready to review."}
              </Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={handleCloseCreateSuccessModal}>
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Management Modal */}
      <Modal visible={showUserManagementModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.userManagementModalContent, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>User Management</Text>
              <TouchableOpacity onPress={() => setShowUserManagementModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <View style={styles.userManagementModalBody}>
              {createUserMessage ? (
                <View
                  style={{
                    backgroundColor: isDarkMode ? "#064E3B" : "#EEF5FF",
                    borderColor: isDarkMode ? "#10B981" : "#86EFAC",
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: isDarkMode ? "#A7F3D0" : "#041E42", fontWeight: "600" }}>
                    {createUserMessage}
                  </Text>
                </View>
              ) : null}

              <View style={styles.roleSelector}>
                {[
                  { key: "active", label: `Active (${activeUsersList.length})` },
                  { key: "inactive", label: `Inactive (${inactiveUsersList.length})` },
                  { key: "all", label: `All (${allUsers.length})` },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.roleOption, userManagementStatusTab === item.key && styles.roleOptionActive, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569" }]}
                    onPress={() => setUserManagementStatusTab(item.key)}
                  >
                    <Text style={[styles.roleText, userManagementStatusTab === item.key && styles.roleTextActive, isDarkMode && userManagementStatusTab !== item.key && { color: "#94A3B8" }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView style={styles.userManagementList} showsVerticalScrollIndicator={false}>
                {userManagementUsers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                    <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>No users found</Text>
                    <Text style={[styles.emptyStateSubtitle, isDarkMode && styles.darkTextSecondary]}>
                      No {userManagementStatusTab} users available.
                    </Text>
                  </View>
                ) : (
                  userManagementUsers.map((userItem) => (
                    <View key={userItem._id || userItem.id || userItem.email} style={[styles.userRow, isDarkMode && { borderBottomColor: theme.borderColor }]}>
                      <View style={styles.userInfo}>
                        <View style={[styles.userAvatar, { backgroundColor: `${getRoleColor(userItem.role)}20` }]}>
                          <Ionicons name={getRoleIcon(userItem.role)} size={22} color={getRoleColor(userItem.role)} />
                        </View>
                        <View style={styles.userManagementTextBlock}>
                          <Text style={[styles.userName, isDarkMode && styles.darkText]}>{userItem.firstName} {userItem.lastName}</Text>
                          <Text style={[styles.userEmail, isDarkMode && styles.darkTextSecondary]}>{userItem.email}</Text>
                          <View style={styles.userMeta}>
                            <View style={styles.roleBadge}>
                              <Text style={styles.roleBadgeText}>{userItem.role?.toUpperCase() || "USER"}</Text>
                            </View>
                            <View style={[styles.roleBadge, (userItem.status === "active" || userItem.isActive) ? styles.userStatusBadgeActive : styles.userStatusBadgeInactive]}>
                              <Text style={[styles.roleBadgeText, (userItem.status === "active" || userItem.isActive) ? styles.userStatusTextActive : styles.userStatusTextInactive]}>
                                {(userItem.status === "active" || userItem.isActive) ? "ACTIVE" : "INACTIVE"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1 }, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => setShowUserManagementModal(false)}>
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={() => { setShowUserManagementModal(false); handleMenuAction("users"); }}>
                <Text style={styles.submitButtonText}>Open User Page</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAdminMapModal} transparent animationType="slide" onRequestClose={() => setShowAdminMapModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.adminMapModalContent, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.adminMapModalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.adminMapModalTitle, isDarkMode && styles.darkText]}>Live Monitoring Map</Text>
              <TouchableOpacity onPress={() => setShowAdminMapModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.adminMapModalBody} showsVerticalScrollIndicator={false}>
              <SharedMonitoringMap
                title="Live Monitoring Map"
                subtitle="Shared monitoring map for approved visitors, check-ins, and real-time administrative activity."
                iconName="map-outline"
                iconColor="#10B981"
                controls={renderAdminMapFilters()}
                visitors={visibleAdminMapVisitors}
                floors={ADMIN_MAP_FLOORS}
                offices={managedRooms}
                selectedFloor={selectedAdminMapFloor}
                selectedOffice={selectedAdminMapOffice}
                mapBlueprints={MONITORING_MAP_BLUEPRINTS}
                officePositions={managedRoomPositions}
                onFloorChange={(floorId) => {
                  setSelectedAdminMapFloor(floorId);
                  setSelectedAdminMapOffice("all");
                }}
                onVisitorSelect={(item) => setSelectedMapActivity(item)}
                hoveredVisitor={activeMapActivity}
                fullscreen
                backgroundColor="transparent"
                borderColor={theme.borderColor}
                mapBackgroundColor={isDarkMode ? "#0F172A" : "#FFFFFF"}
                textPrimary={theme.textPrimary}
                textSecondary={theme.textSecondary}
                showFloorNavigation={false}
                containerStyle={{ padding: 0, borderWidth: 0 }}
                mapWrapperStyle={styles.adminMapModalMapWrap}
              />

              <View style={[styles.adminMapSideCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FBFE", borderColor: theme.borderColor }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="pulse-outline" size={20} color="#10B981" />
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Live Activity Feed</Text>
                  </View>
                </View>

                {renderAdminActivityFilters()}

                {filteredMapActivities.length > 0 ? filteredMapActivities.slice(0, 8).map((activity, index) => {
                  const marker = visibleAdminMapVisitors[index];
                  return (
                    <TouchableOpacity
                      key={activity._id || `${activity.activityType}-${index}-modal`}
                      onPress={() => marker && setSelectedMapActivity(marker)}
                      style={[styles.adminMapActivityItem, index === 0 && { borderTopWidth: 0 }, index > 0 && { borderTopColor: theme.borderColor }]}
                    >
                      <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
                        {getActivityLabel(activity.activityType)}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19 }}>
                        {activity.notes || activity.relatedVisitor?.fullName || "Recent system action"}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontWeight: "700" }}>
                        SafePass ID: {getVisitorSafePassId(activity)}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6 }}>
                        {formatDate(activity.timestamp)}
                      </Text>
                    </TouchableOpacity>
                  );
                }) : (
                  <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
                    No live map activity is available for this filter yet.
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal> 
    </SafeAreaView>
  );
}
