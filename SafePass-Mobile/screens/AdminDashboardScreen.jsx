import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import styles from "../styles/AdminDashboardStyles";

const { width, height } = Dimensions.get("window");
const Storage = Platform.OS === "web"
  ? require("../utils/webStorage").default
  : require("@react-native-async-storage/async-storage").default;

const STAFF_DEPARTMENT_OPTIONS = [
  { value: "Admissions", label: "Admissions", area: "Ground Floor" },
  { value: "Registrar", label: "Registrar", area: "Ground Floor" },
  { value: "Finance", label: "Finance Office", area: "Ground Floor" },
  { value: "Student Services", label: "Student Services", area: "Ground Floor" },
  { value: "Flight Operations", label: "Flight Operations", area: "Mezzanine" },
  { value: "Training", label: "Head of Training Room", area: "Mezzanine" },
  { value: "I.T Room", label: "I.T Room", area: "Mezzanine" },
  { value: "Faculty Room", label: "Faculty Room", area: "Mezzanine" },
  { value: "Administration", label: "Administration", area: "Mezzanine" },
];

const STAFF_OFFICER_OPTIONS_BY_DEPARTMENT = {
  Admissions: [
    { value: "Admissions Officer", label: "Admissions Officer" },
    { value: "Front Desk Officer", label: "Front Desk Officer" },
  ],
  Registrar: [
    { value: "Registrar Officer", label: "Registrar Officer" },
    { value: "Records Officer", label: "Records Officer" },
  ],
  Finance: [
    { value: "Finance Officer", label: "Finance Officer" },
    { value: "Cashier", label: "Cashier" },
  ],
  "Student Services": [
    { value: "Student Services Officer", label: "Student Services Officer" },
    { value: "Guidance Officer", label: "Guidance Officer" },
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

const ROOM_STORAGE_KEY = "adminManagedRooms";
const ROOM_POSITION_STORAGE_KEY = "adminManagedRoomPositions";
const DATA_FIELDS_STORAGE_KEY = "adminDynamicDataFields";

const FLOOR_VIEW_TO_ID = {
  "map-ground": "ground",
  "map-mezzanine": "first",
  "map-second": "second",
  "map-third": "third",
};

const normalizeTextToId = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;

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

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return { bg: "#FEF3C7", text: "#D97706", label: "PENDING" };
    case "approved":
      return { bg: "#D1FAE5", text: "#059669", label: "APPROVED" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#DC2626", label: "REJECTED" };
    case "checked_in":
      return { bg: "#DBEAFE", text: "#2563EB", label: "CHECKED IN" };
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
      return "#8B5CF6";
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

const isUserActive = (user) => user?.status === "active" || user?.isActive === true;

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
                  { color: isDarkMode ? "#BFDBFE" : "#1D4ED8" },
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
      ? { background: isDarkMode ? "#052E16" : "#ECFDF5", border: "#86EFAC", icon: "#16A34A" }
      : notice.type === "error"
        ? { background: isDarkMode ? "#450A0A" : "#FEF2F2", border: "#FECACA", icon: "#DC2626" }
        : { background: isDarkMode ? "#082F49" : "#EFF6FF", border: "#BFDBFE", icon: "#2563EB" };

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
  const [requestFilter, setRequestFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyDateRange, setHistoryDateRange] = useState({
    startDate: null,
    endDate: null,
  });

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

  // User Management States
  const [allUsers, setAllUsers] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [guardUsers, setGuardUsers] = useState([]);
  const [visitorUsers, setVisitorUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
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
    password: "",
    confirmPassword: "",
    phone: "",
    role,
    department: role === "security" ? "Security Department" : "Admissions",
    employeeId: "",
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
            setManagedRooms(parsedRooms);
          }
        }

        if (storedRoomPositions) {
          const parsedPositions = JSON.parse(storedRoomPositions);
          if (parsedPositions && typeof parsedPositions === "object") {
            setManagedRoomPositions(parsedPositions);
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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(query) ||
          r.email?.toLowerCase().includes(query) ||
          r.phoneNumber?.includes(query) ||
          r.purposeOfVisit?.toLowerCase().includes(query),
      );
    }
    return filtered.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [visitRequests, requestFilter, searchQuery]);

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
      const query = userSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(query) ||
          u.lastName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.includes(query) ||
          u.department?.toLowerCase().includes(query),
      );
    }

    return filtered.sort((a, b) => {
      const nameA = `${a?.firstName || ""} ${a?.lastName || ""}`.trim().toLowerCase();
      const nameB = `${b?.firstName || ""} ${b?.lastName || ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [accountRecordsMode, allUsers, userFilter, userSearchQuery]);

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
        accent: "#8B5CF6",
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
      accent: "#3B82F6",
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

  const selectedMapModuleFloor = FLOOR_VIEW_TO_ID[selectedSubmodule] || "ground";
  const selectedFloorRooms = useMemo(
    () => managedRooms.filter((room) => room.floor === selectedMapModuleFloor),
    [managedRooms, selectedMapModuleFloor],
  );

  const selectedSubmoduleMeta = useMemo(() => {
    switch (selectedSubmodule) {
      case "account-create":
        return {
          title: "Creation of Account",
          subtitle: "Create staff, security, and admin accounts from a cleaner modular control center.",
          highlights: [
            { label: "Staff", value: staffUsers.length, icon: "briefcase-outline", color: "#10B981" },
            { label: "Security", value: guardUsers.length, icon: "shield-checkmark-outline", color: "#8B5CF6" },
          ],
        };
      case "account-records":
        return {
          title: "Account Records",
          subtitle: "Browse accounts by role, review status, and keep your directory organized from one workspace.",
          highlights: [
            { label: "Mode", value: accountRecordsMode === "all" ? "All Users" : formatRoleLabel(accountRecordsMode), icon: "funnel-outline", color: "#2563EB" },
            { label: "Visible", value: totalFilteredUsers, icon: "people-outline", color: "#10B981" },
          ],
        };
      case "data-management":
        return {
          title: "Data Management",
          subtitle: "Adjust the data collection fields that shape future admin and visitor workflows.",
          highlights: [
            { label: "Fields", value: dataCollectionFields.length, icon: "list-outline", color: "#3B82F6" },
            { label: "Required", value: dataCollectionFields.filter((field) => field.required).length, icon: "checkmark-circle-outline", color: "#F59E0B" },
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
            { label: "Active", value: stats.activeVisitors || stats.checkedInVisitors || 0, icon: "locate-outline", color: "#2563EB" },
          ],
        };
      case "appointment-records":
        return {
          title: "Appointment Records",
          subtitle: "See the full appointment history, current statuses, and the staff-linked request trail.",
          highlights: [
            { label: "Appointments", value: appointmentRequests.length, icon: "calendar-outline", color: "#EC4899" },
            { label: "Pending", value: pendingAppointmentRequests.length, icon: "time-outline", color: "#F59E0B" },
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
            { label: "History", value: visitorHistory.length, icon: "document-text-outline", color: "#2563EB" },
            { label: "Completed", value: stats.completedVisits, icon: "checkmark-done-outline", color: "#10B981" },
          ],
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Control dashboard preferences and communication settings for the admin experience.",
          highlights: [
            { label: "Dark Mode", value: settings.darkMode ? "On" : "Off", icon: "moon-outline", color: "#6B7280" },
            { label: "Email", value: settings.emailNotifications ? "On" : "Off", icon: "mail-outline", color: "#2563EB" },
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
  ]);

  const adminModules = useMemo(
    () => [
      {
        key: "account-management",
        label: "Account Management",
        icon: "people-circle-outline",
        color: "#2563EB",
        submodules: [
          { key: "account-create", label: "Creation of Account", badge: 3 },
          { key: "account-records", label: "Account Records", badge: allUsers.length },
          { key: "data-management", label: "Data Management", badge: dataCollectionFields.length },
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
          { key: "appointment-records", label: "Appointment Records", badge: appointmentRequests.length },
          { key: "appointment-management", label: "Appointment Management", badge: pendingAppointmentRequests.length },
        ],
      },
      {
        key: "reports",
        label: "Reports",
        icon: "document-text-outline",
        color: "#8B5CF6",
        submodules: [{ key: "report-records", label: "Report Records", badge: visitorHistory.length }],
      },
    ],
    [allUsers.length, appointmentRequests.length, dataCollectionFields.length, managedRooms, pendingAppointmentRequests.length, visitorHistory.length],
  );

  const getFilteredHistory = useCallback(() => {
    let filtered = [...visitorHistory];
    
    if (historyFilter !== "all") {
      filtered = filtered.filter(v => v.status === historyFilter);
    }
    
    if (historySearchQuery.trim()) {
      const query = historySearchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.fullName?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v.purposeOfVisit?.toLowerCase().includes(query)
      ); 
    }
    
    if (historyDateRange.startDate) {
      filtered = filtered.filter(v => new Date(v.visitDate) >= historyDateRange.startDate);
    }
    if (historyDateRange.endDate) {
      filtered = filtered.filter(v => new Date(v.visitDate) <= historyDateRange.endDate);
    }
    
    return filtered;
  }, [visitorHistory, historyFilter, historySearchQuery, historyDateRange]);

  const getHistoryStats = useCallback(() => {
    const total = visitorHistory.length;
    const approved = visitorHistory.filter(v => v.status === "approved").length;
    const pending = visitorHistory.filter(v => v.status === "pending").length;
    const rejected = visitorHistory.filter(v => v.status === "rejected").length;
    const checkedIn = visitorHistory.filter(v => v.status === "checked_in").length;
    const checkedOut = visitorHistory.filter(v => v.status === "checked_out").length;
    const uniqueEmails = new Set(visitorHistory.map(v => v.email).filter(Boolean)).size;
    
    const monthlyData = {};
    visitorHistory.forEach(v => {
      if (v.visitDate) {
        const month = new Date(v.visitDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });
    
    return { total, approved, pending, rejected, checkedIn, checkedOut, uniqueEmails, monthlyData };
  }, [visitorHistory]);

  const loadVisitorHistory = useCallback(() => {
    const sortedVisitors = [...visitRequests].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    setVisitorHistory(sortedVisitors);
  }, [visitRequests]);

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
}, [navigation, handleAuthError, loadRecentActivities, loadAdminStats]);

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
    if (!createUserMessage) return;
    const timer = setTimeout(() => setCreateUserMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [createUserMessage]);

  useEffect(() => {
    if (!adminNotice) return undefined;
    const timer = setTimeout(() => setAdminNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [adminNotice]);

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
      backgroundColor: "#F8FAFC",
      cardBackground: "#FFFFFF",
      textPrimary: "#1E293B",
      textSecondary: "#64748B",
      borderColor: "#E2E8F0",
      headerBackground: "#FFFFFF",
      sidebarBackground: "#1E3A5F",
      inputBackground: "#F8FAFC",
      successBg: "#D1FAE5",
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
            { label: "Departments", value: new Set(staffUsers.map((item) => item.department).filter(Boolean)).size, icon: "business-outline", color: "#0EA5E9" },
          ],
        };
      case "security":
        return {
          subtitle: "Keep your gate team ready, track active personnel, and support visitor check-ins in real time.",
          highlights: [
            { label: "Security", value: guardUsers.length, icon: "shield-outline", color: "#8B5CF6" },
            { label: "Active", value: guardUsers.filter((item) => isUserActive(item)).length, icon: "pulse-outline", color: "#2563EB" },
          ],
        };
      case "users":
        return {
          subtitle: "Monitor the full account directory and move between roles without losing control of the admin workflow.",
          highlights: [
            { label: "Users", value: allUsers.length, icon: "people-outline", color: "#3B82F6" },
            { label: "Active", value: activeUsersList.length, icon: "checkmark-done-outline", color: "#10B981" },
          ],
        };
      case "analytics":
        return {
          subtitle: "Track daily trends, visitor outcomes, and operational patterns across the system.",
          highlights: [
            { label: "Today", value: stats.todayVisits, icon: "calendar-outline", color: "#EF4444" },
            { label: "Tomorrow", value: stats.tomorrowVisits, icon: "calendar-clear-outline", color: "#14B8A6" },
          ],
        };
      case "settings":
        return {
          subtitle: "Control dashboard preferences and communication settings for the admin experience.",
          highlights: [
            { label: "Dark Mode", value: settings.darkMode ? "On" : "Off", icon: "moon-outline", color: "#6B7280" },
            { label: "Email", value: settings.emailNotifications ? "On" : "Off", icon: "mail-outline", color: "#2563EB" },
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
      color: "#8B5CF6",
      badge: `${guardUsers.length || 0} security`,
      action: "security",
    },
    {
      key: "users",
      title: "All Users",
      subtitle: "Audit account access across every role.",
      icon: "people-circle-outline",
      color: "#3B82F6",
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
      color: "#14B8A6",
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
    { label: "Movement", value: adminMapFilters.find((item) => item.key === "movement")?.count || 0, color: "#2563EB" },
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
              : submoduleKey === "report-records"
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
        "userToken",
        "authToken",
        "userData",
        "currentUser",
        "trustedDevice",
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
    const isSecurityAccount = isSecurityRole(newUserData.role);

    if (!String(newUserData.firstName || "").trim()) nextErrors.firstName = "First name is required.";
    if (!String(newUserData.lastName || "").trim()) nextErrors.lastName = "Last name is required.";
    if (!normalizedEmail) nextErrors.email = "Email address is required.";
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!String(newUserData.phone || "").trim()) nextErrors.phone = "Contact number is required.";

    if (!isSecurityAccount) {
      if (!normalizedUsername) nextErrors.username = "Username is required.";
      if (!String(newUserData.password || "").trim()) nextErrors.password = "Password is required.";
      if (!String(newUserData.confirmPassword || "").trim()) {
        nextErrors.confirmPassword = "Confirm the password.";
      }
      if (
        String(newUserData.password || "").trim() &&
        String(newUserData.confirmPassword || "").trim() &&
        newUserData.password !== newUserData.confirmPassword
      ) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
      if (String(newUserData.password || "").trim() && String(newUserData.password || "").length < 6) {
        nextErrors.password = "Password must be at least 6 characters.";
      }
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

    if (String(newUserData.employeeId || "").trim()) {
      const normalizedEmployeeId = String(newUserData.employeeId).trim().toLowerCase();
      const existingEmployeeId = allUsers.find(
        (userItem) => String(userItem?.employeeId || "").trim().toLowerCase() === normalizedEmployeeId,
      );
      if (existingEmployeeId) {
        nextErrors.employeeId = "This staff ID is already registered.";
      }
    }

    setCreateUserErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      normalizedEmail,
      normalizedUsername,
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
    const { isValid, normalizedEmail, normalizedUsername } = validateCreateUserForm();
    if (!isValid) {
      Alert.alert("Validation Error", "Please review the highlighted fields before creating the account.");
      return;
    }

    setProcessingId("create-user");

    try {
      const isSecurityAccount = isSecurityRole(newUserData.role);
      const generatedPassword = isSecurityAccount
        ? newUserData.password || ApiService.generateRandomPassword()
        : newUserData.password.trim();
      
      const userPayload = {
        firstName: newUserData.firstName.trim(),
        lastName: newUserData.lastName.trim(),
        username: normalizedUsername || undefined,
        email: normalizedEmail,
        password: generatedPassword,
        phone: newUserData.phone.trim(),
        role: newUserData.role,
        status: newUserData.status || "active",
        isActive: (newUserData.status || "active") === "active",
      };

      if (newUserData.role === "staff") {
        userPayload.department = newUserData.department || "General";
        userPayload.position = newUserData.position || "Staff Member";
        userPayload.employeeId = newUserData.employeeId || `STF-${Date.now().toString().slice(-6)}`;
      } else if (newUserData.role === "security" || newUserData.role === "guard") {
        userPayload.position = newUserData.position || "Security Personnel";
        userPayload.employeeId = newUserData.employeeId || `SEC-${Date.now().toString().slice(-6)}`;
        userPayload.department = "Security Department";
      }

      const response = isSecurityAccount
        ? await ApiService.createSecurityGuard({
            firstName: userPayload.firstName,
            lastName: userPayload.lastName,
            email: userPayload.email,
            password: userPayload.password,
            phone: userPayload.phone,
            position: userPayload.position,
            employeeId: userPayload.employeeId,
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
        setCreatedUserSummary({
          name: createdName,
          email: newUserData.email,
          username: newUser.username || "N/A",
          password: generatedPassword,
          role: roleDisplay,
          employeeId: userPayload.employeeId,
          status: userPayload.status,
          deliveryNote: `Login credentials have been sent to ${newUserData.email}.`,
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
      } else if (message.toLowerCase().includes("staff id already")) {
        setCreateUserErrors((currentValue) => ({ ...currentValue, employeeId: "This staff ID is already registered." }));
        Alert.alert("Staff ID Already Used", "This staff ID is already registered. Please use another staff ID.");
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
      status: userItem.status || "active",
      isActive: userItem.isActive !== false,
    });
    setShowEditUserModal(true);
  };

  const handleViewUser = (userItem) => {
    setSelectedUser(userItem);
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
    if (!editUserData.firstName || !editUserData.lastName) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setProcessingId("edit-user");
    try {
      const updatePayload = {
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        username: String(editUserData.username || "").trim().toLowerCase(),
        phone: editUserData.phone,
        role: editUserData.role,
        department: editUserData.department,
        position: editUserData.position,
        employeeId: editUserData.employeeId,
        status: editUserData.status,
        isActive: editUserData.status === "active",
      };
      
      const response = await ApiService.updateUser(editUserData.id, updatePayload);
      if (response && (response.success || response.user)) {
        const updatedUsers = allUsers.map(user => {
          if ((user._id === editUserData.id || user.id === editUserData.id)) {
            return { ...user, ...updatePayload };
          }
          return user;
        });

        const updatedSelectedUser = selectedUser && (
          selectedUser._id === editUserData.id || selectedUser.id === editUserData.id
        )
          ? { ...selectedUser, ...updatePayload }
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
  const handleDeleteUser = () => {
    if (!ensureAdminAccess()) return;
    const selectedId = selectedUser?._id || selectedUser?.id;
    if (!selectedId) {
      Alert.alert("Error", "Cannot find user ID. Please refresh and try again.");
      return;
    }

    Alert.alert("Delete User", `Delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await ApiService.deleteUser(selectedId);
            if (response?.success) {
              // Update local state immediately
              const updatedUsers = allUsers.filter(user => user._id !== selectedId && user.id !== selectedId);

              setAllUsers(updatedUsers);
              setStaffUsers(updatedUsers.filter(u => u.role === "staff"));
              setGuardUsers(updatedUsers.filter(u => u.role === "security" || u.role === "guard"));
              
              setStats(prev => ({
                ...prev,
                totalUsers: updatedUsers.length,
                totalStaff: updatedUsers.filter(u => u.role === "staff").length,
                totalGuards: updatedUsers.filter(u => u.role === "security" || u.role === "guard").length,
                activeUsers: updatedUsers.filter(u => u.status === "active" || u.isActive).length,
              }));
              
              publishAdminNotice(
                "success",
                "User deleted",
                `${selectedUser?.firstName || "The selected user"} was removed from the directory.`,
              );
              Alert.alert("Success", "User deleted successfully");
              setShowDeleteUserModal(false);
            } else {
              Alert.alert("Error", response?.message || "Failed to delete user");
            }
          } catch (error) {
            console.error("Delete user error:", error);
            publishAdminNotice("error", "Delete failed", "Unable to delete the selected user.");
            Alert.alert("Error", "Failed to delete user. Please try again.");
          }
        },
      },
    ]);
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
                const updatedUsers = allUsers.map((entry) =>
                  (entry._id === userId || entry.id === userId)
                    ? { ...entry, status: nextStatus, isActive: nextStatus === "active" }
                    : entry,
                );

                setAllUsers(updatedUsers);
                setStaffUsers(updatedUsers.filter((entry) => entry.role === "staff"));
                setGuardUsers(updatedUsers.filter((entry) => entry.role === "security" || entry.role === "guard"));
                setStats((prev) => ({
                  ...prev,
                  activeUsers: updatedUsers.filter((entry) => entry.status === "active" || entry.isActive).length,
                }));

                publishAdminNotice(
                  "success",
                  `User ${nextAction}d`,
                  `${userItem.firstName} ${userItem.lastName} is now ${nextStatus}.`,
                );
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
      await printUserList(users, getTitle(), accountRecordsMode);
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
      await printRecordsTable({
        title,
        subtitle,
        totalLabel: "requests",
        dialogTitle: title,
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
      await printRecordsTable({
        title: "Visitor Report Records",
        subtitle: "Generated from the report records table in the admin dashboard.",
        totalLabel: "report rows",
        dialogTitle: "Print Report Records",
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
  }) => {
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTableScroll}>
        <View style={styles.adminTable}>
          <View style={[styles.adminTableHeaderRow, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
            {columns.map((column) => (
              <View key={column.key} style={[styles.adminTableCell, styles.adminTableHeaderCell, column.width ? { width: column.width, minWidth: column.width } : styles.adminTableFlexCell]}>
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
                  backgroundColor: isDarkMode ? (index % 2 === 0 ? "#111827" : "#0F172A") : index % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              {columns.map((column) => (
                <View key={column.key} style={[styles.adminTableCell, column.width ? { width: column.width, minWidth: column.width } : styles.adminTableFlexCell]}>
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

  const renderBarChart = (labels, data) => {
    const max = Math.max(...(data || [0]), 1);
    const chartColors = ["#3B82F6", "#8B5CF6", "#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444"];
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
          backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
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
          { label: "Movement", color: "#2563EB" },
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
          backgroundColor={isDarkMode ? "#0F172A" : "#F8FAFC"}
          borderColor={theme.borderColor}
          mapBackgroundColor={isDarkMode ? "#111827" : "#FFFFFF"}
          textPrimary={theme.textPrimary}
          textSecondary={theme.textSecondary}
          summaryItems={adminMapSummaryItems}
          statusLabel="Admin monitoring"
          showFloorNavigation={false}
        />

        <View style={[styles.adminMapSideCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flash-outline" size={18} color="#3B82F6" />
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
              <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
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
              <Ionicons name="radio-outline" size={20} color="#3B82F6" />
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
              { label: "Movement", value: adminMapFilters.find((item) => item.key === "movement")?.count || 0, color: "#2563EB" },
              { label: "Issues", value: adminMapFilters.find((item) => item.key === "issues")?.count || 0, color: "#DC2626" },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.adminMapSummaryCard,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
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
                  backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: "800", marginBottom: 4 }}>
                {activeMapActivity.name}
              </Text>
              <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
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
              <Ionicons name="refresh-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>

          <View
            style={[
              styles.dashboardHeroCard,
              isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" },
            ]}
        >
          <View style={styles.dashboardHeroLeft}>
            <Text style={[styles.dashboardHeroTitle, isDarkMode && styles.darkText]}>
              Welcome back, {user?.firstName || "Admin"}
            </Text>
            <Text style={[styles.dashboardHeroSubtitle, isDarkMode && styles.darkTextSecondary]}>
              Live overview of visitor flow, user activity, and pending approvals.
            </Text>
          </View>
          <View style={[styles.dashboardHeroBadge, isDarkMode && { backgroundColor: "#334155" }]}>
            <Ionicons name="sparkles-outline" size={16} color="#2563EB" />
            <Text style={[styles.dashboardHeroBadgeText, isDarkMode && styles.darkTextSecondary]}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.quickActionsGrid}>
          {dashboardQuickActions.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.86}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
              onPress={() => handleMenuAction(item.action)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
              <View style={[styles.quickActionBadge, { backgroundColor: `${item.color}14` }]}>
                <Text style={[styles.quickActionBadgeText, { color: item.color }]}>{item.badge}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[
            styles.dashboardFlowCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderColor,
            },
          ]}
        >
          <View style={styles.dashboardSectionHeader}>
            <View>
              <Text style={[styles.dashboardSectionTitle, { color: theme.textPrimary }]}>Admin Workflow</Text>
              <Text style={[styles.analyticsChartSubtitle, { color: theme.textSecondary }]}>
                Follow the most common admin path from review to monitoring.
              </Text>
            </View>
          </View>

          <View style={styles.dashboardFlowSteps}>
            {[
              {
                key: "review",
                title: "1. Review requests",
                subtitle: `${stats.pendingRequests || 0} waiting for admin approval`,
                icon: "time-outline",
                color: "#F59E0B",
                action: "requests",
              },
              {
                key: "team",
                title: "2. Prepare teams",
                subtitle: `${staffUsers.length + guardUsers.length} staff and security accounts available`,
                icon: "people-outline",
                color: "#3B82F6",
                action: "users",
              },
              {
                key: "monitor",
                title: "3. Watch live activity",
                subtitle: `${monitoredMapVisitors.length || 0} live map markers on campus`,
                icon: "map-outline",
                color: "#10B981",
                action: "webmap",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dashboardFlowStep,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.borderColor,
                  },
                ]}
                onPress={() => handleMenuAction(item.action)}
              >
                <View style={[styles.dashboardFlowStepIcon, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.dashboardFlowStepCopy}>
                  <Text style={[styles.dashboardFlowStepTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.dashboardFlowStepSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dashboardStatsGrid}>
          {[
            { label: "Pending Requests", value: stats.pendingRequests, color: "#F59E0B", icon: "time-outline" },
            { label: "Approved Today", value: stats.approvedRequests, color: "#10B981", icon: "checkmark-circle-outline" },
            { label: "Total Users", value: stats.totalUsers, color: "#3B82F6", icon: "people-outline" },
            { label: "Active Users", value: stats.activeUsers, color: "#8B5CF6", icon: "pulse-outline" },
            { label: "Today Visits", value: stats.todayVisits, color: "#EF4444", icon: "walk-outline" },
            { label: "Tomorrow Visits", value: stats.tomorrowVisits, color: "#14B8A6", icon: "calendar-outline" },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                styles.dashboardStatCard,
                {
                  width: width > 1200 ? "32%" : width > 900 ? "48%" : "100%",
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <View style={styles.dashboardStatHeader}>
                <Text style={[styles.dashboardStatLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                <View style={[styles.dashboardStatIcon, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>
              </View>
              <Text style={[styles.dashboardStatValue, { color: item.color }]}>{item.value || 0}</Text>
            </View>
          ))}
        </View>

        {renderAdminMapWorkspace()}

        <View style={[styles.dashboardSectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <View style={styles.dashboardSectionHeader}>
            <Text style={[styles.dashboardSectionTitle, { color: theme.textPrimary }]}>Recent Pending Requests</Text>
            <TouchableOpacity onPress={() => handleMenuAction("requests")}>
              <Text style={styles.dashboardSectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          {pendingRequests.length ? pendingRequests.slice(0, 5).map((request) => renderRequestCard(request)) : (
            <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>No pending requests right now.</Text>
          )}
        </View>
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
    const trimmedName = roomDraft.name.trim();
    if (!trimmedName) {
      Alert.alert("Room name required", "Please enter a room name before saving.");
      return;
    }

    const roomId = editingRoomId || normalizeTextToId(roomDraft.id || trimmedName);
    const nextRoom = {
      id: roomId,
      name: trimmedName,
      floor: roomDraft.floor,
      icon: roomDraft.icon?.trim() || "business-outline",
    };

    setManagedRooms((currentRooms) => {
      const hasExistingRoom = currentRooms.some((room) => room.id === roomId);
      if (hasExistingRoom) {
        return currentRooms.map((room) => (room.id === roomId ? nextRoom : room));
      }
      return [...currentRooms, nextRoom];
    });

    setManagedRoomPositions((currentPositions) => ({
      ...currentPositions,
      [roomId]: {
        x: clampValue(Number(roomDraft.x) || 50, 0, 100),
        y: clampValue(Number(roomDraft.y) || 50, 0, 100),
      },
    }));

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

    resetFieldEditor();
  };

  const renderAccountCreationContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Create Staff Account"
          subtitle="Admins can create staff accounts here, validate credentials before submission, and immediately sync the records list."
          badge="Admin only"
          isDarkMode={isDarkMode}
          theme={theme}
        >
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
                <View style={[styles.userProfileAvatar, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
                  <Text style={[styles.userProfileAvatarText, { color: "#10B981" }]}>ST</Text>
                </View>
                <View style={styles.createUserHeroCopy}>
                  <Text style={[styles.createUserHeroTitle, isDarkMode && styles.darkText]}>
                    Staff Account Setup
                  </Text>
                  <Text style={[styles.createUserHeroText, isDarkMode && styles.darkTextSecondary]}>
                    Fill in the staff credentials below. The account record will refresh after a successful save.
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
                        setNewUserData((currentValue) => ({ ...currentValue, firstName: text, role: "staff" }));
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
                        setNewUserData((currentValue) => ({ ...currentValue, lastName: text, role: "staff" }));
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
                        setNewUserData((currentValue) => ({ ...currentValue, username: normalizeUsernameInput(text), role: "staff" }));
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
                        setNewUserData((currentValue) => ({ ...currentValue, email: text, role: "staff" }));
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

                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Password *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.password && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.password}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, password: text, role: "staff" }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, password: null }));
                      }}
                      placeholder="Enter password"
                      secureTextEntry
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("password")}
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Confirm Password *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.confirmPassword && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.confirmPassword}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, confirmPassword: text, role: "staff" }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, confirmPassword: null }));
                      }}
                      placeholder="Re-enter password"
                      secureTextEntry
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("confirmPassword")}
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Work Profile</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Staff ID</Text>
                    <TextInput
                      style={[
                        styles.input,
                        createUserErrors.employeeId && styles.inputErrorState,
                        isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" },
                      ]}
                      value={newUserData.employeeId}
                      onChangeText={(text) => {
                        setNewUserData((currentValue) => ({ ...currentValue, employeeId: text, role: "staff" }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, employeeId: null }));
                      }}
                      placeholder="Optional custom staff ID"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("employeeId")}
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
                        setNewUserData((currentValue) => ({ ...currentValue, phone: text, role: "staff" }));
                        setCreateUserErrors((currentValue) => ({ ...currentValue, phone: null }));
                      }}
                      placeholder="Enter contact number"
                      keyboardType="phone-pad"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                    />
                    {renderCreateUserFieldError("phone")}
                  </View>
                </View>

                <View style={styles.userEditorGrid}>
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
                      setNewUserData((currentValue) => ({ ...currentValue, role: "staff" }));
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
                      setNewUserData((currentValue) => ({ ...currentValue, role: "staff" }));
                    },
                  })}
                </View>
                {renderCreateUserFieldError("department")}

                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Assigned Area</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {getStaffDepartmentOption(newUserData.department)?.area || "General Area"}
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
                          onPress={() => setNewUserData((currentValue) => ({ ...currentValue, status: option.key, role: "staff" }))}
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
                  onPress={() => resetCreateUserForm("staff")}
                >
                  <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateUser}
                  disabled={processingId === "create-user"}
                >
                  {processingId === "create-user" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Staff Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.staffCreationAside}>
              <View
                style={[
                  styles.modularInfoPanel,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularInfoTitle, isDarkMode && styles.darkText]}>
                  Staff account checklist
                </Text>
                <View style={styles.staffChecklist}>
                  {[
                    "Admin creates and assigns the staff role automatically.",
                    "Email, username, and staff ID are checked for duplicates.",
                    "Password and confirm password must match before saving.",
                    "Saved accounts appear immediately in Account Records.",
                  ].map((item) => (
                    <View key={item} style={styles.staffChecklistItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={[styles.staffChecklistText, isDarkMode && styles.darkTextSecondary]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                style={[
                  styles.modularInfoPanel,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Text style={[styles.modularInfoTitle, isDarkMode && styles.darkText]}>
                  Current staff records
                </Text>
                <View style={styles.modularInfoStats}>
                  {[
                    { label: "Staff", value: staffUsers.length, color: "#10B981" },
                    { label: "Active", value: staffUsers.filter((item) => isUserActive(item)).length, color: "#2563EB" },
                    { label: "Inactive", value: staffUsers.filter((item) => !isUserActive(item)).length, color: "#EF4444" },
                  ].map((item) => (
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
                  onPress={() => selectAdminSubmodule("account-records", { accountMode: "staff" })}
                >
                  <Ionicons name="reader-outline" size={18} color="#10B981" />
                  <Text style={[styles.managementSecondaryButtonText, { color: "#10B981" }]}>
                    Open Staff Records
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderDataManagementContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Data Management"
          subtitle="Design the field list the admin team wants to collect and keep the form structure organized."
          badge={`${dataCollectionFields.length} fields`}
          isDarkMode={isDarkMode}
          theme={theme}
        >
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
              <View style={styles.modularListStack}>
                {dataCollectionFields.map((field) => (
                  <View
                    key={field.id}
                    style={[
                      styles.modularListCard,
                      {
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
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
                          <Ionicons name="create-outline" size={16} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleDeleteField(field)}>
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderFloorMapContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title={ADMIN_MODULE_FLOORS.find((floor) => floor.id === selectedMapModuleFloor)?.name || "Floor Map"}
          subtitle="Use the shared map canvas on the left and keep the room registry editable on the right."
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
                {editingRoomId ? "Edit room" : "Add room"}
              </Text>
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Room name"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={roomDraft.name}
                onChangeText={(value) => handleRoomDraftChange("name", value)}
              />
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Room icon (Ionicons name)"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={roomDraft.icon}
                onChangeText={(value) => handleRoomDraftChange("icon", value)}
              />
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="X position (0-100)"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={roomDraft.x}
                keyboardType="numeric"
                onChangeText={(value) => handleRoomDraftChange("x", value)}
              />
              <TextInput
                style={[styles.modularTextInput, isDarkMode && styles.darkInput]}
                placeholder="Y position (0-100)"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={roomDraft.y}
                keyboardType="numeric"
                onChangeText={(value) => handleRoomDraftChange("y", value)}
              />

              <View style={styles.modularEditorActions}>
                <TouchableOpacity style={styles.submitButton} onPress={submitRoomDraft}>
                  <Text style={styles.submitButtonText}>{editingRoomId ? "Save Room" : "Add Room"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => resetRoomEditor(selectedMapModuleFloor)}>
                  <Text style={styles.cancelButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modularEditorTitle, styles.modularEditorSecondaryTitle, isDarkMode && styles.darkText]}>
                Floor rooms
              </Text>

              <View style={styles.modularListStack}>
                {selectedFloorRooms.length > 0 ? (
                  selectedFloorRooms.map((room) => (
                    <View
                      key={room.id}
                      style={[
                        styles.modularListCard,
                        {
                          backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                          borderColor: theme.borderColor,
                        },
                      ]}
                    >
                      <View style={styles.modularListHeader}>
                        <View style={styles.modularListCopy}>
                          <Text style={[styles.modularListTitle, isDarkMode && styles.darkText]}>{room.name}</Text>
                          <Text style={[styles.modularListMeta, isDarkMode && styles.darkTextSecondary]}>
                            Position: {managedRoomPositions?.[room.id]?.x ?? 50}, {managedRoomPositions?.[room.id]?.y ?? 50}
                          </Text>
                        </View>
                        <View style={styles.modularInlineActions}>
                          <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleEditRoom(room)}>
                            <Ionicons name="create-outline" size={16} color="#2563EB" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.modularInlineButton} onPress={() => handleDeleteRoom(room)}>
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View
                    style={[
                      styles.modularEmptyState,
                      {
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
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
          subtitle="Read through appointment-linked requests and their latest approval decisions."
          badge={`${appointmentRequests.length} records`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <TouchableOpacity
              style={styles.pageRefreshButton}
              onPress={() =>
                handlePrintRequests(
                  "Appointment Records",
                  appointmentRequests,
                  "Generated from the appointment records table in the admin dashboard.",
                )
              }
            >
              <Ionicons name="print-outline" size={20} color="#EC4899" />
            </TouchableOpacity>
          }
        >
          <View style={styles.modularCardGrid}>
            {[
              { label: "Total Appointments", value: appointmentRequests.length, color: "#EC4899" },
              { label: "Pending", value: pendingAppointmentRequests.length, color: "#F59E0B" },
              { label: "Approved", value: appointmentRequests.filter((item) => getRequestStatus(item) === "approved").length, color: "#10B981" },
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
            rows: appointmentRequests,
            keyExtractor: (request) => request._id || request.id || request.email,
            emptyTitle: "No appointment records",
            emptySubtitle: "No appointment records are available yet.",
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
        </AdminSectionShell>
      </View>
    </ScrollView>
  );

  const renderAppointmentManagementContent = () => (
    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContainer}>
        <AdminSectionShell
          title="Appointment Management"
          subtitle="Manage the active approval queue for visitor registrations and appointment-driven requests from one place."
          badge={`${getFilteredRequests().length} visible`}
          isDarkMode={isDarkMode}
          theme={theme}
          actions={
            <View style={styles.adminSectionShellActions}>
              <TouchableOpacity style={styles.pageRefreshButton} onPress={loadAllVisitRequests}>
                <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pageRefreshButton}
                onPress={() =>
                  handlePrintRequests(
                    "Appointment Management Queue",
                    getFilteredRequests(),
                    "Generated from the active appointment management table in the admin dashboard.",
                  )
                }
              >
                <Ionicons name="print-outline" size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={[styles.searchContainer, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkText]}
              placeholder="Search by name, email, or phone..."
              placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== "" ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
            {[
              { key: "pending", label: "Pending", count: pendingRequests.length },
              { key: "approved", label: "Approved", count: approvedRequests.length },
              { key: "rejected", label: "Rejected", count: rejectedRequests.length },
            ].map((tab) => {
              const isActive = requestFilter === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    isActive && styles.tabActive,
                    isDarkMode && !isActive && { backgroundColor: "#1E293B", borderColor: theme.borderColor },
                  ]}
                  onPress={() => {
                    setRequestFilter(tab.key);
                    setSearchQuery("");
                  }}
                >
                  <View style={styles.tabContent}>
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                    <View
                      style={[
                        styles.tabCountBadge,
                        isActive && styles.tabCountBadgeActive,
                        isDarkMode && !isActive && { backgroundColor: "#334155" },
                      ]}
                    >
                      <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                        {tab.count}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {renderAdminTable({
            rows: getFilteredRequests(),
            keyExtractor: (request) => request._id || request.id || `${request.email}-${request.createdAt}`,
            emptyTitle: "No approval requests",
            emptySubtitle: searchQuery
              ? "No requests match your current search."
              : requestFilter === "pending"
                ? "All approval requests are cleared for now."
                : requestFilter === "approved"
                  ? "No approved requests are available in this filter."
                  : "No rejected requests are available in this filter.",
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
                width: 170,
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
                key: "actions",
                label: "Actions",
                width: 220,
                render: (request) => (
                  <View style={styles.adminTableActionRow}>
                    <TouchableOpacity
                      style={[styles.adminTableActionButton, { borderColor: "rgba(59,130,246,0.24)", backgroundColor: "rgba(59,130,246,0.12)" }]}
                      onPress={() => {
                        setSelectedRequest(request);
                        setShowRequestDetailsModal(true);
                      }}
                    >
                      <Text style={[styles.adminTableActionText, { color: "#2563EB" }]}>View</Text>
                    </TouchableOpacity>
                    {getRequestStatus(request) === "pending" ? (
                      <>
                        <TouchableOpacity
                          style={[styles.adminTableActionButton, { borderColor: "rgba(16,185,129,0.24)", backgroundColor: "rgba(16,185,129,0.12)" }]}
                          onPress={() => {
                            setSelectedRequest(request);
                            handleApproveRequest(request);
                          }}
                        >
                          <Text style={[styles.adminTableActionText, { color: "#10B981" }]}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.adminTableActionButton, { borderColor: "rgba(239,68,68,0.22)", backgroundColor: "rgba(239,68,68,0.12)" }]}
                          onPress={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                        >
                          <Text style={[styles.adminTableActionText, { color: "#EF4444" }]}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                ),
              },
            ],
          })}
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
                <Ionicons name="refresh-outline" size={22} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageRefreshButton} onPress={handlePrintReports}>
                <Ionicons name="print-outline" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          }
        >
            <View style={styles.modularCardGrid}>
              {[
                { label: "Total History", value: historyStats.totalVisits, color: "#2563EB" },
                { label: "Completed", value: historyStats.completedVisits, color: "#10B981" },
                { label: "Pending", value: historyStats.pendingVisits, color: "#F59E0B" },
                { label: "Rejected", value: historyStats.rejectedVisits, color: "#EF4444" },
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
                      {visitor.purposeOfVisit || "-"}
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
                    const statusInfo = getStatusColor(getRequestStatus(visitor));
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
                      {formatDateTime(visitor.visitDate || visitor.createdAt)}
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
        accent: "#3B82F6",
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
        accent: "#8B5CF6",
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
              <Ionicons name="refresh-outline" size={16} color="#3B82F6" />
              <Text style={styles.analyticsActionButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyticsActionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
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
            <View style={[styles.analyticsHeroBadge, { backgroundColor: isDarkMode ? "#312E81" : "#EEF2FF" }]}>
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
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Selected Date</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{selectedDateLabel}</Text>
              </View>
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Busiest Window</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{chartPeakLabel || "N/A"}</Text>
              </View>
              <View style={[styles.analyticsHeroInsightCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                <Text style={[styles.analyticsHeroInsightLabel, { color: theme.textSecondary }]}>Active Visits</Text>
                <Text style={[styles.analyticsHeroInsightValue, { color: theme.textPrimary }]}>{historyStats.checkedIn}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.analyticsHeroStats, width < 960 && { width: "100%", flexDirection: "row" }]}>
            <View style={[styles.analyticsHeroStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
              <Text style={[styles.analyticsHeroStatValue, { color: theme.textPrimary }]}>{historyStats.uniqueEmails}</Text>
              <Text style={[styles.analyticsHeroStatLabel, { color: theme.textSecondary }]}>Unique Visitors</Text>
            </View>
            <View style={[styles.analyticsHeroStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
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

              <View style={[styles.analyticsChartCallout, { backgroundColor: isDarkMode ? "#172554" : "#EFF6FF", borderColor: isDarkMode ? "#1D4ED8" : "#BFDBFE" }]}>
                <View style={styles.analyticsChartCalloutCopy}>
                  <Text style={[styles.analyticsChartCalloutTitle, { color: isDarkMode ? "#DBEAFE" : "#1D4ED8" }]}>
                    {activeDatasetLabel} trend insight
                  </Text>
                  <Text style={[styles.analyticsChartCalloutText, { color: isDarkMode ? "#BFDBFE" : "#1E40AF" }]}>
                    {chartInsightText}
                  </Text>
                </View>
                <View style={styles.analyticsMiniLegend}>
                  {distributionItems.map((item) => (
                    <View key={item.key} style={styles.analyticsMiniLegendItem}>
                      <View style={[styles.analyticsMiniLegendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.analyticsMiniLegendText, { color: isDarkMode ? "#DBEAFE" : "#1E3A8A" }]}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.analyticsQuickStatsRow}>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartTotal}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Total Volume</Text>
                </View>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartPeakLabel || "N/A"}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Busiest Period</Text>
                </View>
                <View style={[styles.analyticsQuickStat, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsQuickStatValue, { color: theme.textPrimary }]}>{chartAverage}</Text>
                  <Text style={[styles.analyticsQuickStatLabel, { color: theme.textSecondary }]}>Average</Text>
                </View>
              </View>

              <View style={[styles.analyticsChartSurface, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
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
                  style={[styles.historyRefreshButton, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC" }]}
                  onPress={onRefresh}
                >
                  <Ionicons name="refresh-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              <View style={styles.historyOverviewRow}>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{filteredHistory.length}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Visible Records</Text>
                </View>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{filteredTodayCount}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Scheduled Today</Text>
                </View>
                <View style={[styles.historyOverviewCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.historyOverviewValue, { color: theme.textPrimary }]}>{historyStats.checkedOut}</Text>
                  <Text style={[styles.historyOverviewLabel, { color: theme.textSecondary }]}>Completed Visits</Text>
                </View>
              </View>

              <View style={styles.historyFilters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyFilterChips}>
                  {historyFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.historyFilterChip,
                        { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor },
                        historyFilter === filter.key && styles.historyFilterChipActive,
                      ]}
                      onPress={() => setHistoryFilter(filter.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.historyFilterChipText,
                          { color: historyFilter === filter.key ? "#FFFFFF" : theme.textSecondary },
                          historyFilter === filter.key && styles.historyFilterChipTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={[styles.historySearchBox, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.historySearchInput, { color: theme.textPrimary }]}
                    placeholder="Search visitor, email, or purpose"
                    placeholderTextColor={theme.textSecondary}
                    value={historySearchQuery}
                    onChangeText={setHistorySearchQuery}
                  />
                </View>
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
                      style={[styles.historyItem, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}
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
                  <Text style={[styles.analyticsPanelPillText, { color: "#3B82F6" }]}>{selectedDateApprovalRate}% approved</Text>
                </View>
              </View>
              <View style={styles.analyticsDateSummaryRow}>
                <View style={[styles.analyticsDateSummaryCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDateSummaryValue, { color: theme.textPrimary }]}>{dateAnalytics.total}</Text>
                  <Text style={[styles.analyticsDateSummaryLabel, { color: theme.textSecondary }]}>Total Visits</Text>
                </View>
                <View style={[styles.analyticsDateSummaryCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                  <Text style={[styles.analyticsDateSummaryValue, { color: theme.textPrimary }]}>{dateAnalytics.approved}</Text>
                  <Text style={[styles.analyticsDateSummaryLabel, { color: theme.textSecondary }]}>Approved</Text>
                </View>
              </View>

              <View style={[styles.analyticsDateCallout, { backgroundColor: isDarkMode ? "#172554" : "#EFF6FF", borderColor: isDarkMode ? "#1D4ED8" : "#BFDBFE" }]}>
                <Ionicons name="calendar-clear-outline" size={18} color="#3B82F6" />
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
                        style={[styles.analyticsDateVisitorItem, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}
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

              <View style={[styles.analyticsDistributionCallout, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
                <Ionicons name="analytics-outline" size={18} color={topDistributionItem?.color || "#3B82F6"} />
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

            <TouchableOpacity
              style={[
                styles.managementSecondaryButton,
                isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
              ]}
              onPress={handlePrintUsers}
            >
              <Ionicons name="print-outline" size={18} color={userManagementConfig.accent} />
              <Text style={[styles.managementSecondaryButtonText, { color: userManagementConfig.accent }]}>
                Print List
              </Text>
            </TouchableOpacity>
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

          <View
            style={[
              styles.searchBox,
              styles.userSearchBox,
              isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor },
            ]}
          >
            <Ionicons name="search-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkText]}
              placeholder={userManagementConfig.searchPlaceholder}
              placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
              value={userSearchQuery}
              onChangeText={(text) => {
                setUserSearchQuery(text);
                setCurrentPage(1);
              }}
            />
            {userSearchQuery ? (
              <TouchableOpacity onPress={() => { setUserSearchQuery(""); setCurrentPage(1); }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {userManagementConfig.filters.map((filterItem) => (
              <TouchableOpacity
                key={filterItem.key}
                style={[styles.filterChip, userFilter === filterItem.key && styles.filterChipActive]}
                onPress={() => {
                  setUserFilter(filterItem.key);
                  setCurrentPage(1);
                }}
              >
                <Text style={[styles.filterChipText, userFilter === filterItem.key && styles.filterChipTextActive]}>
                  {filterItem.label} ({filterItem.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
              <View style={styles.userPaginationRow}>
                <Text style={[styles.userPaginationSummary, isDarkMode && styles.darkTextSecondary]}>
                  Page {currentPage} of {totalPages}
                </Text>
                <View style={styles.userPaginationControls}>
                  <TouchableOpacity
                    style={[styles.userPaginationButton, currentPage === 1 && styles.userPaginationButtonDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <Ionicons name="chevron-back-outline" size={16} color={currentPage === 1 ? "#94A3B8" : "#334155"} />
                    <Text style={[styles.userPaginationButtonText, currentPage === 1 && styles.userPaginationButtonTextDisabled]}>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.userPaginationButton, currentPage >= totalPages && styles.userPaginationButtonDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <Text style={[styles.userPaginationButtonText, currentPage >= totalPages && styles.userPaginationButtonTextDisabled]}>
                      Next
                    </Text>
                    <Ionicons name="chevron-forward-outline" size={16} color={currentPage >= totalPages ? "#94A3B8" : "#334155"} />
                  </TouchableOpacity>
                </View>
              </View>
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
      case "settings":
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#0F172A" : "#1E3A5F"} />
      <View style={[styles.mainContainer, isDarkMode && { backgroundColor: theme.backgroundColor }]}>
        {/* Sidebar */}
        <View style={[styles.sidebar, isDarkMode && { backgroundColor: theme.sidebarBackground }]}>
          <ScrollView ref={sidebarScrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            <View style={[styles.sidebarHeader, isDarkMode && { borderBottomColor: "#334155" }]}>
              <Image source={require("../assets/LogoSapphire.jpg")} style={styles.sidebarLogoImage} />
              <Text style={[styles.sidebarBrand, isDarkMode && styles.darkText]}>Sapphire International Aviation Academy</Text>
              <View style={[styles.sidebarRoleBadge, isDarkMode && { backgroundColor: "#8B5CF6" }]}><Text style={styles.sidebarRoleText}>ADMIN</Text></View>
              <View style={[styles.sidebarStats, isDarkMode && { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.pendingRequests}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Pending</Text></View>
                <View style={[styles.sidebarStatDivider, isDarkMode && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.totalStaff}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Staff</Text></View>
                <View style={[styles.sidebarStatDivider, isDarkMode && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.sidebarStat}><Text style={[styles.sidebarStatNumber, isDarkMode && styles.darkText]}>{stats.totalGuards}</Text><Text style={[styles.sidebarStatLabel, isDarkMode && { color: "rgba(255,255,255,0.6)" }]}>Guards</Text></View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.sidebarOverviewButton,
                selectedSubmodule === "dashboard" && styles.sidebarOverviewButtonActive,
              ]}
              onPress={() => handleMenuAction("dashboard")}
              activeOpacity={0.85}
            >
              <View style={[styles.sidebarMenuIcon, { backgroundColor: "rgba(37,99,235,0.16)" }]}>
                <Ionicons name="grid-outline" size={20} color="#60A5FA" />
              </View>
              <Text style={[styles.sidebarMenuLabel, selectedSubmodule === "dashboard" && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                Dashboard Overview
              </Text>
            </TouchableOpacity>

            <View style={styles.sidebarModuleGroup}>
              {adminModules.map((module) => {
                const isExpanded = expandedModule === module.key;
                const hasSelectedChild = module.submodules.some((submodule) => submodule.key === selectedSubmodule);

                return (
                  <View key={module.key} style={styles.sidebarModuleCard}>
                    <TouchableOpacity
                      style={[
                        styles.sidebarModuleButton,
                        hasSelectedChild && styles.sidebarModuleButtonActive,
                        isDarkMode && hasSelectedChild && { backgroundColor: "rgba(139,92,246,0.18)", borderColor: "rgba(196,181,253,0.24)" },
                      ]}
                      onPress={() => handleModuleToggle(module.key)}
                      activeOpacity={0.86}
                    >
                      <View style={[styles.sidebarMenuIcon, { backgroundColor: `${module.color}16` }]}>
                        <Ionicons name={module.icon} size={20} color={module.color} />
                      </View>
                      <View style={styles.sidebarModuleCopy}>
                        <Text style={[styles.sidebarMenuLabel, hasSelectedChild && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                          {module.label}
                        </Text>
                        <Text style={styles.sidebarModuleHint}>
                          {module.submodules.length} submodule{module.submodules.length === 1 ? "" : "s"}
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                        size={18}
                        color="rgba(255,255,255,0.82)"
                      />
                    </TouchableOpacity>

                    {isExpanded ? (
                      <View style={styles.sidebarSubmoduleList}>
                        {module.submodules.map((submodule) => {
                          const isSubmoduleActive = selectedSubmodule === submodule.key;

                          return (
                            <TouchableOpacity
                              key={submodule.key}
                              style={[
                                styles.sidebarSubmoduleButton,
                                isSubmoduleActive && styles.sidebarSubmoduleButtonActive,
                              ]}
                              onPress={() => selectAdminSubmodule(submodule.key)}
                              activeOpacity={0.84}
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
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.sidebarUtilityButton,
                selectedSubmodule === "settings" && styles.sidebarUtilityButtonActive,
              ]}
              onPress={() => handleMenuAction("settings")}
              activeOpacity={0.84}
            >
              <View style={[styles.sidebarMenuIcon, { backgroundColor: "rgba(148,163,184,0.14)" }]}>
                <Ionicons name="settings-outline" size={20} color="#CBD5E1" />
              </View>
              <Text style={[styles.sidebarMenuLabel, selectedSubmodule === "settings" && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>
                Settings
              </Text>
            </TouchableOpacity>

            <View style={[styles.sidebarUserSection, isDarkMode && { borderTopColor: "#334155" }]}>
              <View style={styles.sidebarUserInfo}>
                <View style={[styles.sidebarUserAvatar, isDarkMode && { backgroundColor: "#334155" }]}><Text style={[styles.sidebarUserAvatarText, isDarkMode && { color: "#8B5CF6" }]}>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</Text></View>
                <View><Text style={[styles.sidebarUserName, isDarkMode && styles.darkText]}>{user?.firstName} {user?.lastName}</Text><Text style={[styles.sidebarUserEmail, isDarkMode && { color: "rgba(255,255,255,0.5)" }]}>{user?.email}</Text></View>
              </View>
              <TouchableOpacity style={[styles.sidebarLogoutButton, isDarkMode && { backgroundColor: "rgba(239,68,68,0.2)" }]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FDA4AF" /><Text style={[styles.sidebarLogoutText, isDarkMode && { color: "#FCA5A5" }]}>Logout</Text>
              </TouchableOpacity>
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
                  <Ionicons name="calendar-outline" size={14} color="#2563EB" />
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
              <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.profileButton}><View style={[styles.profileIcon, isDarkMode && { backgroundColor: "#8B5CF6" }]}><Text style={styles.profileInitials}>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</Text></View></TouchableOpacity>
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
          <View style={[styles.createUserModal, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                  Add New {newUserData.role === "staff" ? "Staff Member" : "Security Personnel"}
                </Text>
                <Text style={[styles.createUserSubtitle, isDarkMode && styles.darkTextSecondary]}>
                  Create an active account that can sign in right away and route to the correct dashboard.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddUserModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={styles.createUserBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.createUserHero, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                <View style={[styles.userProfileAvatar, { backgroundColor: `${getRoleColor(newUserData.role)}16` }]}>
                  <Text style={[styles.userProfileAvatarText, { color: getRoleColor(newUserData.role) }]}>
                    {newUserData.role === "staff" ? "ST" : "SG"}
                  </Text>
                </View>
                <View style={styles.createUserHeroCopy}>
                  <Text style={[styles.createUserHeroTitle, isDarkMode && styles.darkText]}>
                    {newUserData.role === "staff" ? "Staff Account Setup" : "Security Account Setup"}
                  </Text>
                  <Text style={[styles.createUserHeroText, isDarkMode && styles.darkTextSecondary]}>
                    Fill in the core details below. A secure random password and employee ID will be generated automatically if you leave them blank.
                  </Text>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Account Type</Text>
                <View style={styles.userEditorRoleWrap}>
                  {["staff", "security"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.userEditorRoleOption,
                        newUserData.role === role && styles.roleOptionActive,
                        isDarkMode && newUserData.role !== role && { backgroundColor: "#334155", borderColor: "#475569" },
                      ]}
                      onPress={() => setNewUserData((currentForm) => ({
                        ...currentForm,
                        role,
                        department:
                          role === "security"
                            ? "Security Department"
                            : currentForm.department === "Security Department" || !currentForm.department
                              ? "Admissions"
                              : currentForm.department,
                        position:
                          role === "security"
                            ? currentForm.position || "Security Personnel"
                            : currentForm.position === "Security Personnel"
                              ? getDefaultStaffPosition(currentForm.department)
                              : currentForm.position || getDefaultStaffPosition(currentForm.department),
                        shift: "",
                      }))}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          newUserData.role === role && styles.roleTextActive,
                          isDarkMode && !(newUserData.role === role) && { color: "#CBD5E1" },
                        ]}
                      >
                        {role === "staff" ? "Staff Member" : "Security Personnel"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Identity</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>First Name *</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      placeholder="Enter first name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={newUserData.firstName}
                      onChangeText={(text) => setNewUserData({ ...newUserData, firstName: text })}
                    />
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Last Name *</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      placeholder="Enter last name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={newUserData.lastName}
                      onChangeText={(text) => setNewUserData({ ...newUserData, lastName: text })}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.userEditorSection}>
                <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Contact</Text>
                <View style={styles.userEditorGrid}>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Email *</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      placeholder="Enter email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={newUserData.email}
                      onChangeText={(text) => setNewUserData({ ...newUserData, email: text })}
                    />
                  </View>
                  <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Phone *</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      value={newUserData.phone}
                      onChangeText={(text) => setNewUserData({ ...newUserData, phone: text })}
                    />
                  </View>
                </View>
              </View>

              {newUserData.role === "staff" && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Staff Details</Text>
                  <View style={styles.userEditorGrid}>
                    {renderStaffDropdown({
                      target: "create",
                      label: "Department",
                      value: newUserData.department,
                      options: STAFF_DEPARTMENT_OPTIONS,
                      placeholder: "Choose department",
                      icon: "business-outline",
                      onSelect: (department) => updateStaffDepartment("create", department),
                    })}
                    {renderStaffDropdown({
                      target: "create",
                      label: "Officer Type",
                      value: newUserData.position,
                      options: getStaffOfficerOptions(newUserData.department),
                      placeholder: "Choose officer type",
                      icon: "id-card-outline",
                      onSelect: (position) => updateStaffPosition("create", position),
                    })}
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Assigned Area</Text>
                      <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                        <Ionicons name="location-outline" size={16} color="#64748B" />
                        <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                          {getStaffDepartmentOption(newUserData.department)?.area || "General Area"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {newUserData.role === "security" && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Security Details</Text>
                  <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                      Shift schedule is handled operationally and is not fixed on the account.
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.createUserPreviewCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                <View style={styles.createUserPreviewHeader}>
                  <Ionicons name="sparkles-outline" size={18} color="#10B981" />
                  <Text style={[styles.createUserPreviewTitle, isDarkMode && styles.darkText]}>
                    Account Preview
                  </Text>
                </View>
                <View style={styles.userProfileInfoGrid}>
                  <View style={[styles.userProfileInfoCard, styles.createUserPreviewInfoCard, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Role</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {newUserData.role === "staff" ? "Staff Member" : "Security Personnel"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, styles.createUserPreviewInfoCard, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Auto Employee ID</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {newUserData.role === "staff" ? "STF-XXXXXX" : "SEC-XXXXXX"}
                    </Text>
                  </View>
                  <View style={[styles.userProfileInfoCard, styles.createUserPreviewInfoCard, isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor }]}>
                    <Text style={styles.userProfileInfoLabel}>Initial Status</Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      Active and ready to sign in
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, isDarkMode && { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity style={[styles.cancelButton, isDarkMode && { backgroundColor: "#334155" }]} onPress={() => setShowAddUserModal(false)}>
                <Text style={[styles.cancelButtonText, isDarkMode && styles.darkTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateUser} disabled={processingId === "create-user"}>
                {processingId === "create-user" ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Create {newUserData.role === "staff" ? "Staff" : "Security"}</Text>}
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
                { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderBottomColor: theme.borderColor },
              ]}
            >
              <View style={styles.userProfileHeroTopRow}>
                <View
                  style={[
                    styles.userProfileAvatar,
                    { backgroundColor: `${getRoleColor(selectedUser?.role)}16` || "rgba(59,130,246,0.14)" },
                  ]}
                >
                  <Text style={[styles.userProfileAvatarText, { color: getRoleColor(selectedUser?.role) || "#3B82F6" }]}>
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
                  <Text style={[styles.userProfileBadgeText, { color: getRoleColor(selectedUser?.role) || "#3B82F6" }]}>
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
                  isDarkMode && { backgroundColor: "#172554", borderColor: "#1D4ED8" },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                <Text style={[styles.userProfileCalloutText, isDarkMode && { color: "#DBEAFE" }]}>
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
                      placeholder="Phone"
                      keyboardType="phone-pad"
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

              <View style={[styles.userProfileCallout, isDarkMode && { backgroundColor: "#172554", borderColor: "#1D4ED8" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
                <Text style={[styles.userProfileCalloutText, isDarkMode && { color: "#DBEAFE" }]}>
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
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: "#EF4444" }]} onPress={handleDeleteUser}>
                <Text style={styles.confirmButtonText}>Delete</Text>
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
                <Text style={[styles.createSuccessLabel, isDarkMode && styles.darkTextSecondary]}>Password</Text>
                <Text style={[styles.createSuccessValue, isDarkMode && styles.darkText]}>{createdUserSummary?.password || "N/A"}</Text>
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

            <View style={[styles.createSuccessNote, isDarkMode && { backgroundColor: "#172554", borderColor: "#1D4ED8" }]}>
              <Ionicons name="mail-outline" size={16} color="#3B82F6" />
              <Text style={[styles.createSuccessNoteText, isDarkMode && { color: "#BFDBFE" }]}>
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
          <View style={[styles.modalContent, { maxHeight: "90%" }, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>User Management</Text>
              <TouchableOpacity onPress={() => setShowUserManagementModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {createUserMessage ? (
                <View
                  style={{
                    backgroundColor: isDarkMode ? "#064E3B" : "#D1FAE5",
                    borderColor: isDarkMode ? "#10B981" : "#86EFAC",
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: isDarkMode ? "#A7F3D0" : "#065F46", fontWeight: "600" }}>
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
                        <View>
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

              <View style={[styles.adminMapSideCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: theme.borderColor }]}>
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
