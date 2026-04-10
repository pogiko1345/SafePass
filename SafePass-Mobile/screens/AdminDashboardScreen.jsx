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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import ApiService from "../utils/ApiService";
import SharedMonitoringMap from "../components/SharedMonitoringMap";
import { printUserList } from "../utils/printUtils";
import styles from "../styles/AdminDashboardStyles";

const { width, height } = Dimensions.get("window");
const Storage = Platform.OS === "web"
  ? require("../utils/webStorage").default
  : require("@react-native-async-storage/async-storage").default;

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

const ADMIN_MAP_FLOORS = [{ id: "all", name: "Campus", icon: "map-outline" }];
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

export default function AdminDashboardScreen({ navigation, onLogout }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const mainScrollViewRef = useRef(null);
  const sidebarScrollViewRef = useRef(null);
  const authErrorHandledRef = useRef(false);

  // User State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
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
  const [showAdminMapDock, setShowAdminMapDock] = useState(false);

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

  // Form States
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    employeeId: "",
    status: "active",
    isActive: true,
  });

  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
    department: "",
    employeeId: "",
    position: "",
    shift: "Morning",
    status: "active",
  });

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

  const menuItems = [
    { icon: "grid-outline", label: "Dashboard", action: "dashboard", color: "#2563EB" },
    { icon: "time-outline", label: "Visit Requests", action: "requests", color: "#F59E0B", badge: stats?.pendingRequests },
    { icon: "map-outline", label: "Campus Map", action: "webmap", color: "#10B981" },
    { icon: "person-add-outline", label: "Manage Staff", action: "staff", color: "#10B981" },
    { icon: "shield-outline", label: "Security", action: "security", color: "#8B5CF6" },
    { icon: "people-circle-outline", label: "All Users", action: "users", color: "#3B82F6" },
    { icon: "stats-chart-outline", label: "Analytics", action: "analytics", color: "#EC4899" },
    { icon: "settings-outline", label: "Settings", action: "settings", color: "#6B7280" },
  ];

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

    if (activeMenu === "staff") {
      filtered = filtered.filter((u) => u.role === "staff");
    } else if (activeMenu === "security") {
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
  }, [activeMenu, allUsers, userFilter, userSearchQuery]);

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
    if (activeMenu === "staff") return staffUsers;
    if (activeMenu === "security") return guardUsers;
    return allUsers;
  }, [activeMenu, allUsers, guardUsers, staffUsers]);
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
    if (activeMenu === "staff") {
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

    if (activeMenu === "security") {
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
    activeMenu,
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
  const loadAllVisitRequests = async () => {
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
      Alert.alert("Error", "Failed to load visit requests. Please check your connection.");
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
      filteredMapActivities.slice(0, 18).map((activity, index) => {
        const relatedVisitor = activity?.relatedVisitor;
        const relatedUser = activity?.relatedUser;
        const displayName =
          relatedVisitor?.fullName ||
          [relatedUser?.firstName, relatedUser?.lastName].filter(Boolean).join(" ") ||
          activity?.userName ||
          "System Activity";

        return {
          id: activity?._id || `${activity?.activityType || "activity"}-${index}`,
          name: displayName,
          purpose:
            relatedVisitor?.purposeOfVisit ||
            getActivityLabel(activity?.activityType),
          status: getActivityMarkerStatus(activity),
          location: {
            coordinates: getActivityCoordinates(activity, index),
          },
          activityType: activity?.activityType,
          eventLabel: getActivityLabel(activity?.activityType),
          lastUpdate: activity?.timestamp,
          detail:
            activity?.notes ||
            activity?.message ||
            "Recent system activity",
          sourceActivity: activity,
        };
      }),
    [filteredMapActivities],
  );

  const activeMapActivity = useMemo(() => {
    if (!selectedMapActivity) return monitoredMapVisitors[0] || null;
    return (
      monitoredMapVisitors.find((item) => item.id === selectedMapActivity.id) ||
      monitoredMapVisitors[0] ||
      null
    );
  }, [monitoredMapVisitors, selectedMapActivity]);

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
    { label: "Live", value: monitoredMapVisitors.length || 0, color: "#10B981" },
    { label: "Approvals", value: adminMapFilters.find((item) => item.key === "approvals")?.count || 0, color: "#10B981" },
    { label: "Movement", value: adminMapFilters.find((item) => item.key === "movement")?.count || 0, color: "#2563EB" },
  ]), [adminMapFilters, monitoredMapVisitors.length]);

  const handleMenuAction = (action) => {
    setActiveMenu(action);
    setCurrentPage(1);
    switch (action) {
      case "dashboard":
        break;
      case "webmap":
        loadRecentActivities();
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

  // FIXED: Handle Create User
  const handleCreateUser = async () => {
    if (!ensureAdminAccess()) return;
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.phone) {
      Alert.alert("Error", "Please fill all required fields (*)");
      return;
    }

    const normalizedEmail = newUserData.email.toLowerCase().trim();
    const existingUser = allUsers.find(
      (u) => String(u?.email || "").toLowerCase().trim() === normalizedEmail
    );
    if (existingUser) {
      Alert.alert(
        "Email Already Used",
        `${normalizedEmail} is already registered as ${existingUser.role || "user"}. Please use a different email.`
      );
      return;
    }

    setProcessingId("create-user");

    try {
      const generatedPassword = newUserData.password || ApiService.generateRandomPassword();
      
      const userPayload = {
        firstName: newUserData.firstName.trim(),
        lastName: newUserData.lastName.trim(),
        email: normalizedEmail,
        password: generatedPassword,
        phone: newUserData.phone.trim(),
        role: newUserData.role,
        status: "active",
        isActive: true,
      };

      if (newUserData.role === "staff") {
        userPayload.department = newUserData.department || "General";
        userPayload.position = newUserData.position || "Staff Member";
        userPayload.employeeId = newUserData.employeeId || `STF-${Date.now().toString().slice(-6)}`;
      } else if (newUserData.role === "security" || newUserData.role === "guard") {
        userPayload.shift = newUserData.shift || "Morning";
        userPayload.position = newUserData.position || "Security Personnel";
        userPayload.employeeId = newUserData.employeeId || `SEC-${Date.now().toString().slice(-6)}`;
        userPayload.department = "Security Department";
      }

      const isSecurityRole = newUserData.role === "security" || newUserData.role === "guard";
      const response = isSecurityRole
        ? await ApiService.createSecurityGuard({
            firstName: userPayload.firstName,
            lastName: userPayload.lastName,
            email: userPayload.email,
            password: userPayload.password,
            phone: userPayload.phone,
            shift: userPayload.shift,
            position: userPayload.position,
            employeeId: userPayload.employeeId,
          })
        : await ApiService.createStaffUser(userPayload);

      if (response && (response.success || response.user)) {
        const roleDisplay = isSecurityRole ? "SECURITY PERSONNEL" : "STAFF MEMBER";
        const resolvedRole = isSecurityRole ? "guard" : (response.user?.role || newUserData.role);
        const createdName = `${newUserData.firstName} ${newUserData.lastName}`.trim();
        
        const newUser = {
          ...userPayload,
          role: resolvedRole,
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
          activeUsers: prev.activeUsers + 1,
        }));

        setShowAddUserModal(false);
        setCreatedUserSummary({
          name: createdName,
          email: newUserData.email,
          password: generatedPassword,
          role: roleDisplay,
          employeeId: userPayload.employeeId,
          deliveryNote: `Login credentials have been sent to ${newUserData.email}.`,
        });
        setShowCreateSuccessModal(true);
        publishAdminNotice(
          "success",
          `${isSecurityRole ? "Security" : "Staff"} account created`,
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
        Alert.alert("Email Already Used", "This email is already registered. Please use another email address.");
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
      email: userItem.email || "",
      phone: userItem.phone || "",
      role: userItem.role || "staff",
      department: userItem.department || "",
      employeeId: userItem.employeeId || "",
      shift: userItem.shift || "Morning",
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
    setNewUserData({
      firstName: "", lastName: "", email: "", password: "", phone: "",
      role: "staff", department: "", employeeId: "", position: "", shift: "Morning", status: "active",
    });
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
        phone: editUserData.phone,
        role: editUserData.role,
        department: editUserData.department,
        shift: editUserData.shift,
        position: editUserData.position,
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
      Alert.alert("Error", error.message || "Failed to update user");
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
      switch (activeMenu) {
        case "staff": return "Staff Members List";
        case "security": return "Security Personnel List";
        default: return "Users List";
      }
    };

    try {
      await printUserList(users, getTitle(), activeMenu);
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert("Error", "Failed to generate print view. Please try again.");
    }
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminMapFilterRow}>
        {adminMapFilters.map((filterItem) => {
          const isActive = adminMapFilter === filterItem.key;
          return (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.adminMapFilterChip,
                isActive && styles.adminMapFilterChipActive,
                isDarkMode && !isActive && { backgroundColor: "#111827", borderColor: theme.borderColor },
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
          visitors={monitoredMapVisitors}
          floors={ADMIN_MAP_FLOORS}
          offices={[]}
          selectedFloor="all"
          selectedOffice="all"
          onVisitorSelect={(item) => setSelectedMapActivity(item)}
          hoveredVisitor={activeMapActivity}
          backgroundColor={isDarkMode ? "#0F172A" : "#F8FAFC"}
          borderColor={theme.borderColor}
          mapBackgroundColor={isDarkMode ? "#111827" : "#FFFFFF"}
          textPrimary={theme.textPrimary}
          textSecondary={theme.textSecondary}
          summaryItems={adminMapSummaryItems}
          statusLabel="Admin monitoring"
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
            </View>
          ) : (
            <Text style={[styles.dashboardSectionEmpty, { color: theme.textSecondary }]}>
              Select a marker or live activity to inspect it here.
            </Text>
          )}

          <View style={styles.adminMapActivityList}>
            {filteredMapActivities.length > 0 ? filteredMapActivities.slice(0, 6).map((activity, index) => {
              const marker = monitoredMapVisitors[index];
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
            visitors={monitoredMapVisitors}
            floors={ADMIN_MAP_FLOORS}
            offices={[]}
            selectedFloor="all"
            selectedOffice="all"
            onVisitorSelect={(item) => setSelectedMapActivity(item)}
            hoveredVisitor={activeMapActivity}
            backgroundColor={theme.cardBackground}
            borderColor={theme.borderColor}
            mapBackgroundColor={isDarkMode ? "#0F172A" : "#FFFFFF"}
            textPrimary={theme.textPrimary}
            textSecondary={theme.textSecondary}
            summaryItems={adminMapSummaryItems}
            statusLabel="Admin monitoring"
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
              const marker = monitoredMapVisitors[index];
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

        <View style={styles.dashboardActionsRow}>
          <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={() => handleMenuAction("requests")}>
            <Text style={styles.submitButtonText}>Open Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={() => handleMenuAction("users")}>
            <Text style={styles.cancelButtonText}>Manage Users</Text>
          </TouchableOpacity>
        </View>
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
                onPress={() => setShowAddUserModal(true)}
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
              <View style={styles.userCardList}>
                {paginatedUsers.map((userItem) => {
                  const userIsActive = isUserActive(userItem);
                  const roleColor = getRoleColor(userItem.role);

                  return (
                    <View
                      key={userItem._id || userItem.id || userItem.email}
                      style={[
                        styles.userManagementCard,
                        {
                          backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                          borderColor: theme.borderColor,
                        },
                      ]}
                    >
                      <View style={styles.userManagementCardHeader}>
                        <View style={styles.userInfo}>
                          <View style={[styles.userAvatar, { backgroundColor: `${roleColor}18` }]}>
                            <Text style={[styles.userAvatarInitials, { color: roleColor }]}>
                              {getUserInitials(userItem)}
                            </Text>
                          </View>

                          <View style={styles.userIdentityBlock}>
                            <View style={styles.userIdentityTitleRow}>
                              <Text style={[styles.userName, isDarkMode && styles.darkText]}>
                                {userItem.firstName} {userItem.lastName}
                              </Text>
                              <View
                                style={[
                                  styles.userLiveStatusBadge,
                                  {
                                    backgroundColor: userIsActive ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
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
                            </View>
                            <Text style={[styles.userEmail, isDarkMode && styles.darkTextSecondary]}>
                              {userItem.email}
                            </Text>
                            <View style={styles.userMeta}>
                              <View style={[styles.roleBadge, { backgroundColor: `${roleColor}14` }]}>
                                <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                                  {formatRoleLabel(userItem.role)}
                                </Text>
                              </View>
                              {userItem.department ? (
                                <View style={styles.deptBadge}>
                                  <Text style={styles.deptBadgeText}>{userItem.department}</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={styles.userManagementMetaGrid}>
                        <View
                          style={[
                            styles.userManagementMetaPill,
                            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
                          ]}
                        >
                          <Ionicons name="call-outline" size={14} color="#64748B" />
                          <Text style={[styles.userManagementMetaText, isDarkMode && styles.darkTextSecondary]}>
                            {userItem.phone || "No phone number"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.userManagementMetaPill,
                            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
                          ]}
                        >
                          <Ionicons name="card-outline" size={14} color="#64748B" />
                          <Text style={[styles.userManagementMetaText, isDarkMode && styles.darkTextSecondary]}>
                            {userItem.employeeId || "No employee ID"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.userManagementMetaPill,
                            isDarkMode && { backgroundColor: "#111827", borderColor: theme.borderColor },
                          ]}
                        >
                          <Ionicons name="ellipse-outline" size={14} color="#64748B" />
                          <Text style={[styles.userManagementMetaText, isDarkMode && styles.darkTextSecondary]}>
                            {userIsActive ? "Account enabled" : "Requires review"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.userManagementActions}>
                        <TouchableOpacity
                          style={[
                            styles.userManagementActionButton,
                            { backgroundColor: `${roleColor}12`, borderColor: `${roleColor}24` },
                          ]}
                          onPress={() => handleViewUser(userItem)}
                        >
                          <Ionicons name="eye-outline" size={16} color={roleColor} />
                          <Text style={[styles.userManagementActionText, { color: roleColor }]}>
                            View
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.userManagementActionButton,
                            { backgroundColor: `${userManagementConfig.accent}12`, borderColor: `${userManagementConfig.accent}24` },
                          ]}
                          onPress={() => handleEditUser(userItem)}
                        >
                          <Ionicons name="create-outline" size={16} color={userManagementConfig.accent} />
                          <Text style={[styles.userManagementActionText, { color: userManagementConfig.accent }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.userManagementActionButton, styles.userManagementDangerButton]}
                          onPress={() => {
                            setSelectedUser(userItem);
                            setShowDeleteUserModal(true);
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          <Text style={[styles.userManagementActionText, { color: "#EF4444" }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

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

            {menuItems.map((item, index) => {
              const isMenuActive = activeMenu === item.action;
              return (
              <TouchableOpacity key={index} style={[styles.sidebarMenuItem, isMenuActive && styles.sidebarMenuItemActive, isDarkMode && isMenuActive && { backgroundColor: "rgba(139,92,246,0.2)" }]} onPress={() => handleMenuAction(item.action)}>
                <View style={[styles.sidebarMenuIcon, { backgroundColor: `${item.color}15` }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
                <Text style={[styles.sidebarMenuLabel, isMenuActive && styles.sidebarMenuLabelActive, isDarkMode && styles.darkText]}>{item.label}</Text>
                {item.badge > 0 && <View style={styles.sidebarMenuBadge}><Text style={styles.sidebarMenuBadgeText}>{item.badge}</Text></View>}
              </TouchableOpacity>
            )})}

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
                {menuItems.find((item) => item.action === activeMenu)?.label || "Dashboard"}
              </Text>
              <Text style={[styles.headerSubtitle, isDarkMode && styles.darkTextSecondary]}>
                {activeMenuMeta.subtitle}
              </Text>
              <View style={styles.headerMetaRow}>
                <View style={[styles.headerMetaBadge, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}>
                  <Ionicons name="calendar-outline" size={14} color="#2563EB" />
                  <Text style={[styles.headerMetaText, isDarkMode && styles.darkTextSecondary]}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </Text>
                </View>
                {activeMenuMeta.highlights.map((item) => (
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

          {activeMenu === "dashboard" && renderDashboardContent()}
          {activeMenu === "webmap" && renderAdminMapPage()}
          {activeMenu === "analytics" && renderAnalyticsContent()}
          {activeMenu === "settings" && renderSettingsContent()}

          {activeMenu === "requests" && (
            <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.pageContainer}>
                <AdminSectionShell
                  title="Visit Requests"
                  subtitle="Review new visitor registrations and appointment approvals from one queue."
                  badge={`${getFilteredRequestsCount()} visible`}
                  isDarkMode={isDarkMode}
                  theme={theme}
                  actions={
                    <TouchableOpacity style={styles.pageRefreshButton} onPress={loadAllVisitRequests}>
                      <Ionicons name="refresh-outline" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                  }
                >
                <View style={[styles.searchContainer, isDarkMode && { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                  <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                  <TextInput style={[styles.searchInput, isDarkMode && styles.darkText]} placeholder="Search by name, email, or phone..." placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"} value={searchQuery} onChangeText={setSearchQuery} />
                  {searchQuery !== "" && <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabBar}
                >
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
                        onPress={() => { setRequestFilter(tab.key); setSearchQuery(""); }}
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
                            <Text
                              style={[
                                styles.tabCountText,
                                isActive && styles.tabCountTextActive,
                              ]}
                            >
                              {tab.count}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {getFilteredRequests().length > 0 ? getFilteredRequests().map((request) => renderRequestCard(request)) : (
                  <View style={[styles.emptyState, isDarkMode && { backgroundColor: theme.cardBackground }]}>
                    <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                    <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>No visit requests</Text>
                    <Text style={[styles.emptyStateSubtitle, isDarkMode && styles.darkTextSecondary]}>{searchQuery ? "No requests match your search criteria." : requestFilter === "pending" ? "All caught up! No pending requests to review." : requestFilter === "approved" ? "No approved requests yet." : "No rejected requests."}</Text>
                  </View>
                )}
                </AdminSectionShell>
              </View>
            </ScrollView>
          )}

          {(activeMenu === "staff" || activeMenu === "security" || activeMenu === "users") && renderUserManagementContent()}
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
                      onPress={() => setNewUserData({ ...newUserData, role })}
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
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Department</Text>
                      <TextInput
                        style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                        placeholder="e.g., Admissions, Registrar, Academics"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.department}
                        onChangeText={(text) => setNewUserData({ ...newUserData, department: text })}
                      />
                    </View>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Position</Text>
                      <TextInput
                        style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                        placeholder="e.g., Admissions Officer"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                        value={newUserData.position}
                        onChangeText={(text) => setNewUserData({ ...newUserData, position: text })}
                      />
                    </View>
                  </View>
                </View>
              )}
              {newUserData.role === "security" && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Security Details</Text>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Shift Schedule *</Text>
                    <View style={styles.roleSelector}>
                      {["Morning", "Afternoon", "Night"].map((shift) => (
                        <TouchableOpacity
                          key={shift}
                          style={[styles.roleOption, newUserData.shift === shift && styles.roleOptionActive, isDarkMode && newUserData.shift !== shift && { backgroundColor: "#334155", borderColor: "#475569" }]}
                          onPress={() => setNewUserData({ ...newUserData, shift })}
                        >
                          <Text style={[styles.roleText, newUserData.shift === shift && styles.roleTextActive, isDarkMode && !(newUserData.shift === shift) && { color: "#CBD5E1" }]}>
                            {shift}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
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
                    <Text style={styles.userProfileInfoLabel}>
                      {isSecurityRole(selectedUser?.role) ? "Shift" : "Position"}
                    </Text>
                    <Text style={[styles.userProfileInfoValue, isDarkMode && styles.darkText]}>
                      {isSecurityRole(selectedUser?.role) ? (selectedUser?.shift || "Not set") : (selectedUser?.position || "Not set")}
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
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Email</Text>
                    <View style={[styles.userEditorReadonlyCard, isDarkMode && { backgroundColor: "#0F172A", borderColor: theme.borderColor }]}>
                      <Ionicons name="mail-outline" size={16} color="#64748B" />
                      <Text style={[styles.userEditorReadonlyText, isDarkMode && styles.darkText]}>
                        {editUserData.email || "No email available"}
                      </Text>
                    </View>
                  </View>
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
                        onPress={() => setEditUserData({ ...editUserData, role })}
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
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Department</Text>
                      <TextInput
                        style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                        value={editUserData.department}
                        onChangeText={(text) => setEditUserData({ ...editUserData, department: text })}
                        placeholder="Department"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      />
                    </View>
                    <View style={[styles.userEditorHalfField, styles.inputGroup]}>
                      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Position</Text>
                      <TextInput
                        style={[styles.input, isDarkMode && { backgroundColor: "#334155", borderColor: "#475569", color: "#F1F5F9" }]}
                        value={editUserData.position}
                        onChangeText={(text) => setEditUserData({ ...editUserData, position: text })}
                        placeholder="Position"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#9CA3AF"}
                      />
                    </View>
                  </View>
                </View>
              )}

              {isSecurityRole(editUserData.role) && (
                <View style={styles.userEditorSection}>
                  <Text style={[styles.userEditorSectionTitle, isDarkMode && styles.darkText]}>Security Details</Text>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Shift Schedule</Text>
                    <View style={styles.roleSelector}>
                      {["Morning", "Afternoon", "Night"].map((shift) => (
                        <TouchableOpacity
                          key={shift}
                          style={[styles.roleOption, editUserData.shift === shift && styles.roleOptionActive, isDarkMode && editUserData.shift !== shift && { backgroundColor: "#334155", borderColor: "#475569" }]}
                          onPress={() => setEditUserData({ ...editUserData, shift })}
                        >
                          <Text style={[styles.roleText, editUserData.shift === shift && styles.roleTextActive, isDarkMode && editUserData.shift !== shift && { color: "#CBD5E1" }]}>
                            {shift}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
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
                visitors={monitoredMapVisitors}
                floors={ADMIN_MAP_FLOORS}
                offices={[]}
                selectedFloor="all"
                selectedOffice="all"
                onVisitorSelect={(item) => setSelectedMapActivity(item)}
                hoveredVisitor={activeMapActivity}
                fullscreen
                backgroundColor="transparent"
                borderColor={theme.borderColor}
                mapBackgroundColor={isDarkMode ? "#0F172A" : "#FFFFFF"}
                textPrimary={theme.textPrimary}
                textSecondary={theme.textSecondary}
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

                {filteredMapActivities.length > 0 ? filteredMapActivities.slice(0, 8).map((activity, index) => {
                  const marker = monitoredMapVisitors[index];
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
