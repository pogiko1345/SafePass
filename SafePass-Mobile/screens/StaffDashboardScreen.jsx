import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import ApiService from "../utils/ApiService";
import { printRecordsTable } from "../utils/printUtils";
import styles from "../styles/StaffDashboardStyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SidebarHoverPressable = ({
  children,
  style,
  hoverScale = 1.035,
  hoverLift = 0,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  const animateHover = useCallback((scaleValue, liftValue) => {
    if (Platform.OS !== "web") return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: scaleValue,
        useNativeDriver: true,
        tension: 180,
        friction: 12,
      }),
      Animated.spring(lift, {
        toValue: liftValue,
        useNativeDriver: true,
        tension: 180,
        friction: 12,
      }),
    ]).start();
  }, [lift, scale]);

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => animateHover(hoverScale, hoverLift)}
      onHoverOut={() => animateHover(1, 0)}
      onMouseEnter={() => animateHover(hoverScale, hoverLift)}
      onMouseLeave={() => animateHover(1, 0)}
      style={[
        style,
        Platform.OS === "web" && styles.sidebarHoverSurface,
        Platform.OS === "web" && !onPress && styles.passiveHoverSurface,
        { transform: [{ translateY: lift }, { scale }] },
        disabled && { opacity: 0.7 },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};

const HomeHoverPressable = ({ children, style, hoverScale = 1.018, hoverLift = -4, ...props }) => (
  <SidebarHoverPressable
    {...props}
    style={style}
    hoverScale={hoverScale}
    hoverLift={hoverLift}
  >
    {children}
  </SidebarHoverPressable>
);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const formatRelativeTime = (value) => {
  if (!value) return "No timestamp";

  const now = new Date();
  const target = new Date(value);
  const diffMs = now.getTime() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))} min ago`;
  if (diffMs < day) return `${Math.max(1, Math.floor(diffMs / hour))} hr ago`;
  if (diffMs < day * 7) return `${Math.max(1, Math.floor(diffMs / day))} day${Math.floor(diffMs / day) > 1 ? "s" : ""} ago`;
  return formatDate(value);
};

const getNotificationMeta = (notification) => {
  const activityType = String(notification?.metadata?.activityType || "").toLowerCase();

  if (activityType.includes("appointment_request")) {
    return { label: "New Request", icon: "mail-unread-outline", accent: "#0A3D91" };
  }
  if (activityType.includes("approved_appointment")) {
    return { label: "Approved", icon: "checkmark-circle-outline", accent: "#047857" };
  }
  if (activityType.includes("adjusted_appointment")) {
    return { label: "Adjusted", icon: "create-outline", accent: "#D97706" };
  }
  if (activityType.includes("rejected_appointment")) {
    return { label: "Rejected", icon: "close-circle-outline", accent: "#DC2626" };
  }
  if (activityType.includes("completed_appointment")) {
    return { label: "Completed", icon: "flag-outline", accent: "#475569" };
  }

  return { label: "Update", icon: "notifications-outline", accent: "#7C3AED" };
};

const getStatusMeta = (status) => {
  switch (status) {
    case "approved":
      return { color: "#0A3D91", background: "#EEF5FF", label: "Approved" };
    case "adjusted":
      return { color: "#D97706", background: "#FEF3C7", label: "Adjusted" };
    case "rescheduled":
      return { color: "#D97706", background: "#FEF3C7", label: "Rescheduled" };
    case "cancelled":
      return { color: "#64748B", background: "#F1F5F9", label: "Cancelled" };
    case "expired":
      return { color: "#DC2626", background: "#FEE2E2", label: "Expired" };
    case "no_show":
      return { color: "#B45309", background: "#FEF3C7", label: "No Show" };
    case "rejected":
      return { color: "#DC2626", background: "#FEE2E2", label: "Rejected" };
    case "completed":
      return { color: "#475569", background: "#E2E8F0", label: "Completed" };
    default:
      return { color: "#0A3D91", background: "#EEF5FF", label: "Pending" };
  }
};

const getAppointmentStatus = (appointment) => {
  if (!appointment) return "pending";
  if (appointment.appointmentCompletedAt) return "completed";
  if (appointment.status === "checked_out") return "completed";
  if (appointment.status === "expired") return "expired";
  if (appointment.status === "no_show") return "no_show";
  return String(appointment.appointmentStatus || "pending").toLowerCase();
};

const matchesAppointmentSearch = (appointment, searchTerm) => {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();
  if (!normalizedSearch) return true;

  const searchableParts = [
    appointment?.fullName,
    appointment?.email,
    appointment?.purposeOfVisit,
    appointment?.appointmentDepartment,
    appointment?.assignedOffice,
    appointment?.assignedStaffName,
    formatDate(appointment?.visitDate),
    formatTime(appointment?.visitTime),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return searchableParts.some((value) => value.includes(normalizedSearch));
};

const isSameCalendarDay = (value, referenceDate = new Date()) => {
  if (!value) return false;
  const target = new Date(value);
  return (
    target.getFullYear() === referenceDate.getFullYear() &&
    target.getMonth() === referenceDate.getMonth() &&
    target.getDate() === referenceDate.getDate()
  );
};

const isWithinCurrentWeek = (value, referenceDate = new Date()) => {
  if (!value) return false;
  const target = new Date(value);
  const startOfWeek = new Date(referenceDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return target >= startOfWeek && target < endOfWeek;
};

export default function StaffDashboardScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [expandedModule, setExpandedModule] = useState("home");
  const [selectedSubmodule, setSelectedSubmodule] = useState("home");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [accountMode, setAccountMode] = useState("view");
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestSearchTerm, setRequestSearchTerm] = useState("");
  const [recordSearchTerm, setRecordSearchTerm] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [recordPage, setRecordPage] = useState(1);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState(null);
  const itemsPerPage = 5;

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adjustedDate, setAdjustedDate] = useState(new Date());
  const [adjustedTime, setAdjustedTime] = useState(new Date());
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const webDateInputRef = useRef(null);
  const webTimeInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const profile = await ApiService.getProfile();
      const currentUser = profile?.user || (await ApiService.getCurrentUser());
      if (!currentUser || String(currentUser.role).toLowerCase() !== "staff") {
        Alert.alert("Access Denied", "This screen is for staff accounts only.");
        navigation.replace("Login");
        return;
      }

      setUser(currentUser);

      const [appointmentResponse, notificationResponse] = await Promise.allSettled([
        ApiService.getStaffAppointments({ status: "all", limit: 200 }),
        ApiService.getNotifications({ limit: 20 }),
      ]);

      if (appointmentResponse.status === "fulfilled") {
        setAppointments(appointmentResponse.value?.appointments || []);
      } else {
        console.error("Staff appointments error:", appointmentResponse.reason);
        setAppointments([]);
      }

      if (notificationResponse.status === "fulfilled") {
        setNotifications(notificationResponse.value?.notifications || []);
      } else {
        console.error("Staff notifications error:", notificationResponse.reason);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Load staff dashboard error:", error);
      Alert.alert("Error", error?.message || "Failed to load staff dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const isNotificationRead = useCallback(
    (notification) =>
      Array.isArray(notification?.readBy) &&
      notification.readBy.some((entry) => String(entry?.user) === String(user?._id)),
    [user?._id],
  );

  const appointmentRequests = useMemo(
    () => appointments.filter((item) => getAppointmentStatus(item) === "pending"),
    [appointments],
  );

  const filteredRequestSource = useMemo(() => {
    let nextAppointments = appointmentRequests;

    if (requestFilter === "today") {
      nextAppointments = appointmentRequests.filter((item) => isSameCalendarDay(item.visitDate));
    } else if (requestFilter === "this-week") {
      nextAppointments = appointmentRequests.filter((item) => isWithinCurrentWeek(item.visitDate));
    }

    return nextAppointments;
  }, [appointmentRequests, requestFilter]);

  const filteredRequestAppointments = useMemo(
    () => filteredRequestSource.filter((item) => matchesAppointmentSearch(item, requestSearchTerm)),
    [filteredRequestSource, requestSearchTerm],
  );

  const appointmentRecords = useMemo(
    () =>
      appointments.filter((item) =>
        ["approved", "adjusted", "completed", "rejected"].includes(getAppointmentStatus(item)),
      ),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    let nextAppointments = appointmentRecords;

    if (filter === "completed") {
      nextAppointments = appointmentRecords.filter((item) => getAppointmentStatus(item) === "completed");
    } else if (filter === "approved") {
      nextAppointments = appointmentRecords.filter((item) =>
        getAppointmentStatus(item) === "approved",
      );
    } else if (filter === "adjusted") {
      nextAppointments = appointmentRecords.filter((item) =>
        getAppointmentStatus(item) === "adjusted",
      );
    } else if (filter === "rejected") {
      nextAppointments = appointmentRecords.filter((item) =>
        getAppointmentStatus(item) === "rejected",
      );
    } else if (filter !== "all") {
      nextAppointments = appointmentRecords.filter((item) => getAppointmentStatus(item) === filter);
    }

    return nextAppointments.filter((item) => matchesAppointmentSearch(item, recordSearchTerm));
  }, [appointmentRecords, filter, recordSearchTerm]);

  const stats = useMemo(
    () => ({
      pending: appointmentRequests.length,
      approved: appointmentRecords.filter((item) => getAppointmentStatus(item) === "approved").length,
      adjusted: appointmentRecords.filter((item) => getAppointmentStatus(item) === "adjusted").length,
      rejected: appointmentRecords.filter((item) => getAppointmentStatus(item) === "rejected").length,
      completed: appointmentRecords.filter((item) => getAppointmentStatus(item) === "completed").length,
    }),
    [appointmentRecords, appointmentRequests.length],
  );

  const profileName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return fullName || user?.fullName || user?.username || "Staff User";
  }, [user]);

  const profileInitials = useMemo(() => {
    const nameParts = profileName.split(" ").filter(Boolean);
    return (
      (nameParts[0]?.[0] || user?.firstName?.[0] || "S") +
      (nameParts[1]?.[0] || user?.lastName?.[0] || "T")
    ).toUpperCase();
  }, [profileName, user]);

  const unreadNotificationsCount = useMemo(
    () => (notifications || []).filter((item) => !isNotificationRead(item)).length,
    [notifications, isNotificationRead],
  );

  const checkedInNowCount = useMemo(
    () =>
      appointments.filter((item) => item?.checkedInAt && !item?.checkedOutAt).length,
    [appointments],
  );

  const nextUpcomingAppointment = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((item) => {
        const status = getAppointmentStatus(item);
        if (!["approved", "adjusted"].includes(status)) return false;
        if (!item?.visitDate) return false;
        const appointmentDate = new Date(item.visitDate);
        return appointmentDate >= now;
      })
      .sort((firstItem, secondItem) => new Date(firstItem.visitDate) - new Date(secondItem.visitDate))[0] || null;
  }, [appointments]);

  const todaysSchedule = useMemo(
    () =>
      appointments
        .filter((item) => {
          const status = getAppointmentStatus(item);
          return ["approved", "adjusted"].includes(status) && isSameCalendarDay(item.visitDate);
        })
        .sort((firstItem, secondItem) => new Date(firstItem.visitDate) - new Date(secondItem.visitDate))
        .slice(0, 4),
    [appointments],
  );

  useEffect(() => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || user?.phoneNumber || user?.contactNumber || "",
    });
  }, [user]);

  useEffect(() => {
    setRequestPage(1);
  }, [requestFilter, requestSearchTerm]);

  useEffect(() => {
    setRecordPage(1);
  }, [filter, recordSearchTerm]);

  const paginatedRequestAppointments = useMemo(() => {
    const startIndex = (requestPage - 1) * itemsPerPage;
    return filteredRequestAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequestAppointments, requestPage]);

  const paginatedRecordAppointments = useMemo(() => {
    const startIndex = (recordPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, recordPage]);

  const requestPageCount = Math.max(1, Math.ceil(filteredRequestAppointments.length / itemsPerPage));
  const recordPageCount = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));

  const staffModules = useMemo(
    () => [
      {
        key: "home",
        label: "Home",
        icon: "home-outline",
        color: "#0A3D91",
        submodules: [],
      },
      {
        key: "appointment",
        label: "Appointment",
        icon: "calendar-outline",
        color: "#0A3D91",
        submodules: [
          { key: "appointment-request", label: "Appointment Request", badge: stats.pending },
          { key: "appointment-record", label: "Appointment Record", badge: appointmentRecords.length },
        ],
      },
      {
        key: "account",
        label: "Account Management",
        icon: "person-circle-outline",
        color: "#1C6DD0",
        submodules: [{ key: "account-info", label: "My Profile", badge: 0 }],
      },
    ],
    [appointmentRecords.length, stats.pending],
  );

  const getSelectedSubmoduleMeta = () => {
    switch (selectedSubmodule) {
      case "appointment-request":
        return {
          title: "Appointment Request",
          subtitle: "Review and act on new visitor appointment requests assigned to your office in a cleaner table view.",
        };
      case "appointment-record":
        return {
          title: "Appointment Record",
          subtitle: "Browse appointment history, statuses, and visitor scheduling details in one organized table.",
        };
      case "account-info":
        return {
          title: "My Profile",
          subtitle: "View or update your own staff profile details and account security settings.",
        };
      case "home":
      default:
        return {
          title: "Staff Home",
          subtitle: "Track pending requests, recent updates, and your office activity in one place.",
        };
    }
  };

  const getParentModule = (submoduleKey) =>
    staffModules.find((module) =>
      module.submodules.some((submodule) => submodule.key === submoduleKey),
    )?.key || "home";

  const toggleModule = (moduleKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (moduleKey === "home") {
      setExpandedModule("home");
      setSelectedSubmodule("home");
      return;
    }
    setExpandedModule((currentValue) => (currentValue === moduleKey ? null : moduleKey));
  };

  const selectSubmodule = (submoduleKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const parentModule = getParentModule(submoduleKey);
    setExpandedModule(parentModule);
    setSelectedSubmodule(submoduleKey);
    if (submoduleKey === "account-info") {
      setAccountMode("view");
    }

    if (submoduleKey === "appointment-request") {
      setFilter("pending");
    }

    if (submoduleKey === "appointment-record") {
      setFilter("all");
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      Alert.alert("Missing Details", "First name and last name are required.");
      return;
    }

    if (!profileForm.email.trim() || !profileForm.username.trim()) {
      Alert.alert("Missing Details", "Email and username are required.");
      return;
    }

    const cleanedPhone = String(profileForm.phone || "").replace(/[^\d+]/g, "");
    if (cleanedPhone && !/^(?:\+63|0)\d{10}$/.test(cleanedPhone)) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid Philippine mobile number like 09XXXXXXXXX or +639XXXXXXXXX.",
      );
      return;
    }

    setProfileSaving(true);
    try {
      const response = await ApiService.updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        username: profileForm.username.trim(),
        phone: cleanedPhone,
      });

      if (response?.user) {
        setUser(response.user);
      }

      setAccountMode("view");
      Alert.alert("Profile Updated", "Your profile was updated successfully.");
    } catch (error) {
      Alert.alert("Update Failed", error?.message || "Could not update your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert("Missing Details", "Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await ApiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert("Password Updated", "Your password was changed successfully.");
    } catch (error) {
      Alert.alert("Password Update Failed", error?.message || "Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const mergeAppointment = (updatedVisitor) => {
    if (!updatedVisitor?._id) return;
    setAppointments((current) =>
      current.map((item) =>
        String(item._id) === String(updatedVisitor._id) ? { ...item, ...updatedVisitor } : item,
      ),
    );
  };

  const handleNotificationPress = async (notification) => {
    if (!notification) return;

    try {
      if (!isNotificationRead(notification)) {
        await ApiService.markNotificationAsRead(notification._id);
        setNotifications((currentValue) =>
          currentValue.map((item) =>
            String(item._id) === String(notification._id)
              ? {
                  ...item,
                  readBy: [
                    ...(Array.isArray(item.readBy) ? item.readBy : []),
                    { user: user?._id, readAt: new Date().toISOString() },
                  ],
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Notification action error:", error);
    }

    const activityType = String(notification?.metadata?.activityType || "").toLowerCase();
    const relatedVisitorId =
      notification?.relatedVisitor?._id || notification?.relatedVisitor || null;

    const matchedAppointment = appointments.find(
      (item) => String(item?._id) === String(relatedVisitorId),
    );

    if (
      activityType.includes("appointment_request") ||
      activityType.includes("rejected_appointment")
    ) {
      selectSubmodule("appointment-request");
      if (matchedAppointment) {
        setDetailAppointment(matchedAppointment);
      }
      return;
    }

    if (
      activityType.includes("approved_appointment") ||
      activityType.includes("adjusted_appointment") ||
      activityType.includes("completed_appointment")
    ) {
      selectSubmodule("appointment-record");
      if (matchedAppointment) {
        setDetailAppointment(matchedAppointment);
      }
      return;
    }

    if (matchedAppointment) {
      setDetailAppointment(matchedAppointment);
      return;
    }

    Alert.alert(notification.title || "Notification", notification.message || "No details available.");
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!unreadNotificationsCount) return;

    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications((currentValue) =>
        currentValue.map((item) =>
          isNotificationRead(item)
            ? item
            : {
                ...item,
                readBy: [
                  ...(Array.isArray(item.readBy) ? item.readBy : []),
                  { user: user?._id, readAt: new Date().toISOString() },
                ],
              },
        ),
      );
    } catch (error) {
      Alert.alert("Notification Update Failed", error?.message || "Could not mark notifications as read.");
    }
  };

  const closeAdjustModal = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowAdjustModal(false);
    setSelectedAppointment(null);
    setAdjustmentNote("");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAppointment(null);
    setRejectionReason("");
  };

  const handleApprove = async (appointment) => {
    if (!appointment?._id) return;
    setProcessingId(appointment._id);
    try {
      const response = await ApiService.approveStaffAppointment(appointment._id);
      if (response?.visitor) {
        mergeAppointment(response.visitor);
      }
      await loadData();
    } catch (error) {
      Alert.alert("Approval Failed", error?.message || "Could not approve appointment.");
    } finally {
      setProcessingId(null);
    }
  };

  const openAdjustModal = (appointment) => {
    setSelectedAppointment(appointment);
    setAdjustedDate(new Date(appointment.visitDate || new Date()));
    setAdjustedTime(new Date(appointment.visitTime || new Date()));
    setAdjustmentNote(appointment.staffAdjustmentNote || "");
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowAdjustModal(true);
  };

  const getWebDateInputValue = () => {
    const value = new Date(adjustedDate || new Date());
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getWebTimeInputValue = () => {
    const value = new Date(adjustedTime || new Date());
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAdjustDatePress = () => {
    setShowTimePicker(false);

    if (Platform.OS === "web") {
      const input = webDateInputRef.current;
      if (input?.showPicker) {
        input.showPicker();
        return;
      }
      input?.click?.();
      return;
    }

    setShowDatePicker(true);
  };

  const handleAdjustTimePress = () => {
    setShowDatePicker(false);

    if (Platform.OS === "web") {
      const input = webTimeInputRef.current;
      if (input?.showPicker) {
        input.showPicker();
        return;
      }
      input?.click?.();
      return;
    }

    setShowTimePicker(true);
  };

  const handleAdjustDateChange = (event, value) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed" || !value) {
      return;
    }

    setAdjustedDate(value);
  };

  const handleAdjustTimeChange = (event, value) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event?.type === "dismissed" || !value) {
      return;
    }

    setAdjustedTime(value);
  };

  const handleWebDateChange = (event) => {
    const nextValue = event?.target?.value;
    if (!nextValue) return;

    const [year, month, day] = nextValue.split("-").map(Number);
    if (!year || !month || !day) return;

    setAdjustedDate(new Date(year, month - 1, day));
  };

  const handleWebTimeChange = (event) => {
    const nextValue = event?.target?.value;
    if (!nextValue) return;

    const [hours, minutes] = nextValue.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    const nextTime = new Date(adjustedTime || new Date());
    nextTime.setHours(hours, minutes, 0, 0);
    setAdjustedTime(nextTime);
  };

  const submitAdjustment = async () => {
    if (!selectedAppointment) return;
    try {
      const mergedDateTime = new Date(adjustedDate);
      const timeValue = new Date(adjustedTime);
      mergedDateTime.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);

      if (Number.isNaN(mergedDateTime.getTime())) {
        Alert.alert("Invalid Schedule", "Please choose a valid appointment date and time.");
        return;
      }

      if (mergedDateTime < new Date(Date.now() - 60 * 1000)) {
        Alert.alert("Invalid Schedule", "Adjusted appointment time cannot be in the past.");
        return;
      }

      setProcessingId(selectedAppointment._id);
      const response = await ApiService.adjustStaffAppointment(selectedAppointment._id, {
        visitDate: adjustedDate.toISOString(),
        preferredDate: adjustedDate.toISOString(),
        visitTime: mergedDateTime.toISOString(),
        preferredTime: mergedDateTime.toISOString(),
        note: adjustmentNote,
      });
      if (response?.visitor) {
        mergeAppointment(response.visitor);
      }
      closeAdjustModal();
      await loadData();
    } catch (error) {
      Alert.alert("Update Failed", error?.message || "Could not adjust appointment.");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!selectedAppointment) return;
    if (!rejectionReason.trim()) {
      Alert.alert("Reason Required", "Please add a reason before rejecting.");
      return;
    }
    setProcessingId(selectedAppointment._id);
    try {
      const response = await ApiService.rejectStaffAppointment(
        selectedAppointment._id,
        rejectionReason,
      );
      if (response?.visitor) {
        mergeAppointment(response.visitor);
      }
      closeRejectModal();
      await loadData();
    } catch (error) {
      Alert.alert("Rejection Failed", error?.message || "Could not reject appointment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (appointment) => {
    if (!appointment?._id || processingId) return;

    const performComplete = async () => {
      setProcessingId(appointment._id);
      try {
        const response = await ApiService.completeStaffAppointment(appointment._id);
        if (response?.visitor) {
          mergeAppointment(response.visitor);
        }
        await loadData();
        Alert.alert(
          "Appointment Completed",
          "Security, admin, and the visitor have been notified for checkout follow-up.",
        );
      } catch (error) {
        Alert.alert("Complete Failed", error?.message || "Could not complete appointment.");
      } finally {
        setProcessingId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = globalThis?.window?.confirm?.(
        "Mark this appointment as complete and notify security for checkout?",
      );
      if (confirmed) {
        await performComplete();
      }
      return;
    }

    Alert.alert(
      "Complete Appointment",
      "Mark this appointment as complete and notify security for checkout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Complete", onPress: performComplete },
      ],
    );
  };

  const handleLogout = () => {
    if (isSigningOut) return;
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    if (isSigningOut) return;
    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await ApiService.logout();
    } finally {
      setShowLogoutModal(false);
      if (typeof onLogout === "function") onLogout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const buildAppointmentPrintRows = (records) =>
    (records || []).map((appointment) => ({
      visitor: appointment?.fullName || "Visitor",
      email: appointment?.email || "-",
      purpose: appointment?.purposeOfVisit || "No visit purpose provided",
      schedule: `${formatDate(appointment?.visitDate)} ${formatTime(appointment?.visitTime)}`,
      office: appointment?.appointmentDepartment || appointment?.assignedOffice || "Assigned department",
      staff: appointment?.assignedStaffName || profileName,
      status: getStatusMeta(getAppointmentStatus(appointment)).label,
    }));

  const handlePrintAppointmentTable = async ({
    title,
    subtitle,
    records,
    emptyMessage,
  }) => {
    const rows = buildAppointmentPrintRows(records);
    if (rows.length === 0) {
      Alert.alert("No Data", emptyMessage || "There are no appointment records to print.");
      return;
    }

    try {
      const printedBy =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email ||
        profileName ||
        "Staff User";

      await printRecordsTable({
        title,
        subtitle,
        columns: [
          { key: "visitor", label: "Visitor" },
          { key: "email", label: "Email" },
          { key: "purpose", label: "Purpose" },
          { key: "schedule", label: "Schedule" },
          { key: "office", label: "Office" },
          { key: "staff", label: "Staff" },
          { key: "status", label: "Status" },
        ],
        rows,
        totalLabel: "appointments",
        dialogTitle: title,
        printedBy,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Print staff appointment table error:", error);
      Alert.alert("Error", "Failed to generate the printable table.");
    }
  };

  const renderTablePrintButton = ({ label = "Print Table", records, title, subtitle, emptyMessage }) => (
    <TouchableOpacity
      style={[styles.sectionActionButton, (!records || records.length === 0) && styles.disabledAction]}
      onPress={() => handlePrintAppointmentTable({ title, subtitle, records, emptyMessage })}
      disabled={!records || records.length === 0}
    >
      <Ionicons name="print-outline" size={16} color="#0A3D91" />
      <Text style={styles.sectionActionButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAppointmentTable = (
    appointmentsToRender,
    { mode = "requests", emptyTitle, emptySubtitle },
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={Platform.OS === "web"}
      contentContainerStyle={styles.tableScrollContent}
      style={styles.tableScroll}
    >
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableHeaderColumnWide, styles.tableColumnVisitor]}>
            <Text style={styles.tableHeaderCellWide}>Visitor</Text>
          </View>
          <View style={[styles.tableHeaderColumn, styles.tableColumnSchedule]}>
            <Text style={styles.tableHeaderCell}>Schedule</Text>
          </View>
          <View style={[styles.tableHeaderColumn, styles.tableColumnOffice]}>
            <Text style={styles.tableHeaderCell}>Office</Text>
          </View>
          <View style={[styles.tableHeaderColumn, styles.tableColumnStatus]}>
            <Text style={styles.tableHeaderCell}>Status</Text>
          </View>
          <View style={styles.tableHeaderColumnActions}>
            <Text style={styles.tableHeaderCellActions}>Actions</Text>
          </View>
        </View>

        {appointmentsToRender.length === 0 ? (
          <View style={styles.tableEmptyState}>
            <Ionicons name="documents-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          </View>
        ) : (
          appointmentsToRender.map((appointment) => {
            const appointmentStatus = getAppointmentStatus(appointment);
            const statusMeta = getStatusMeta(appointmentStatus);
            const isPending = appointmentStatus === "pending";
            const canComplete =
              appointment.status === "checked_in" &&
              !appointment.checkedOutAt &&
              !appointment.appointmentCompletedAt;
            const isProcessing = processingId === appointment._id;

            return (
              <View key={appointment._id} style={styles.tableBodyRow}>
                <View style={[styles.tableCellWide, styles.tableColumnVisitor]}>
                  <Text style={styles.tablePrimaryText}>{appointment.fullName}</Text>
                  <Text style={styles.tableSecondaryText}>{appointment.email || "No email address"}</Text>
                  <Text style={styles.tableHelperText}>
                    {appointment.purposeOfVisit || "No visit purpose provided"}
                  </Text>
                </View>

                <View style={[styles.tableCell, styles.tableColumnSchedule]}>
                  <Text style={styles.tablePrimaryText}>{formatDate(appointment.visitDate)}</Text>
                  <Text style={styles.tableSecondaryText}>{formatTime(appointment.visitTime)}</Text>
                </View>

                <View style={[styles.tableCell, styles.tableColumnOffice]}>
                  <Text style={styles.tablePrimaryText}>
                    {appointment.appointmentDepartment || appointment.assignedOffice || "Assigned department"}
                  </Text>
                  <Text style={styles.tableSecondaryText}>
                    {appointment.assignedStaffName || profileName}
                  </Text>
                </View>

                <View style={[styles.tableCell, styles.tableColumnStatus]}>
                  <View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
                    <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                  </View>
                </View>

                <View style={styles.tableCellActions}>
                  <TouchableOpacity
                    style={styles.tableActionButton}
                    onPress={() => setDetailAppointment(appointment)}
                  >
                    <Text style={styles.tableActionButtonText}>View</Text>
                  </TouchableOpacity>

                  {mode === "requests" && isPending ? (
                    <>
                      <TouchableOpacity
                        style={[styles.tableActionButton, styles.tableActionButtonPrimary, isProcessing && styles.disabledAction]}
                        onPress={() => handleApprove(appointment)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.tableActionButtonPrimaryText}>Approve</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.tableActionButton}
                        onPress={() => openAdjustModal(appointment)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.tableActionButtonText}>Adjust</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tableActionButton, styles.tableActionButtonDanger]}
                        onPress={() => openRejectModal(appointment)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.tableActionButtonDangerText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {mode === "records" && canComplete ? (
                    <TouchableOpacity
                      style={[styles.tableActionButton, styles.tableActionButtonPrimary, isProcessing && styles.disabledAction]}
                      onPress={() => handleComplete(appointment)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.tableActionButtonPrimaryText}>Complete</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  const renderPagination = ({
    currentPage,
    totalPages,
    totalItems,
    onPrevious,
    onNext,
    label,
  }) => (
    <View style={styles.paginationRow}>
      <Text style={styles.paginationInfo}>
        {totalItems === 0
          ? `No ${label.toLowerCase()} to show`
          : `Page ${currentPage} of ${totalPages} • ${totalItems} ${label.toLowerCase()}`}
      </Text>
      <View style={styles.paginationActions}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage <= 1 && styles.paginationButtonDisabled]}
          onPress={onPrevious}
          disabled={currentPage <= 1}
        >
          <Text style={[styles.paginationButtonText, currentPage <= 1 && styles.paginationButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage >= totalPages && styles.paginationButtonDisabled]}
          onPress={onNext}
          disabled={currentPage >= totalPages}
        >
          <Text
            style={[
              styles.paginationButtonText,
              currentPage >= totalPages && styles.paginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppointmentDetailPanel = () => {
    if (!detailAppointment) return null;

    return (
      <View style={styles.detailPanelCard}>
        <View style={styles.detailPanelHeader}>
          <View>
            <Text style={styles.detailPanelTitle}>Appointment Details</Text>
            <Text style={styles.detailPanelSubtitle}>
              Review the full visitor context without leaving the table.
            </Text>
          </View>
          <TouchableOpacity style={styles.detailPanelCloseButton} onPress={() => setDetailAppointment(null)}>
            <Ionicons name="close-outline" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailScrollContent}>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Visitor</Text>
              <Text style={styles.detailValue}>{detailAppointment.fullName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{detailAppointment.email || "N/A"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Purpose</Text>
              <Text style={styles.detailValue}>
                {detailAppointment.purposeOfVisit || "No visit purpose provided"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Office</Text>
              <Text style={styles.detailValue}>
                {detailAppointment.appointmentDepartment || detailAppointment.assignedOffice || "Assigned department"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Schedule</Text>
              <Text style={styles.detailValue}>
                {formatDate(detailAppointment.visitDate)} at {formatTime(detailAppointment.visitTime)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {getStatusMeta(getAppointmentStatus(detailAppointment)).label}
              </Text>
            </View>
          </View>

          <View style={styles.detailTimelineSection}>
            <Text style={styles.detailSectionTitle}>Appointment Timeline</Text>
            <View style={styles.detailTimelineList}>
              <View style={styles.detailTimelineItem}>
                <View style={styles.detailTimelineDot} />
                <View style={styles.detailTimelineContent}>
                  <Text style={styles.detailTimelineLabel}>Request Submitted</Text>
                  <Text style={styles.detailTimelineValue}>
                    {formatDateTime(detailAppointment.createdAt || detailAppointment.registeredAt)}
                  </Text>
                </View>
              </View>

              {detailAppointment.approvedAt ? (
                <View style={styles.detailTimelineItem}>
                  <View style={[styles.detailTimelineDot, styles.detailTimelineDotApproved]} />
                  <View style={styles.detailTimelineContent}>
                    <Text style={styles.detailTimelineLabel}>Approved</Text>
                    <Text style={styles.detailTimelineValue}>
                      {formatDateTime(detailAppointment.approvedAt)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {detailAppointment.checkedInAt ? (
                <View style={styles.detailTimelineItem}>
                  <View style={[styles.detailTimelineDot, styles.detailTimelineDotCheckedIn]} />
                  <View style={styles.detailTimelineContent}>
                    <Text style={styles.detailTimelineLabel}>Checked In</Text>
                    <Text style={styles.detailTimelineValue}>
                      {formatDateTime(detailAppointment.checkedInAt)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {detailAppointment.appointmentCompletedAt ? (
                <View style={styles.detailTimelineItem}>
                  <View style={[styles.detailTimelineDot, styles.detailTimelineDotCompleted]} />
                  <View style={styles.detailTimelineContent}>
                    <Text style={styles.detailTimelineLabel}>Marked Complete</Text>
                    <Text style={styles.detailTimelineValue}>
                      {formatDateTime(detailAppointment.appointmentCompletedAt)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {detailAppointment.checkedOutAt ? (
                <View style={styles.detailTimelineItem}>
                  <View style={[styles.detailTimelineDot, styles.detailTimelineDotCheckedOut]} />
                  <View style={styles.detailTimelineContent}>
                    <Text style={styles.detailTimelineLabel}>Checked Out</Text>
                    <Text style={styles.detailTimelineValue}>
                      {formatDateTime(detailAppointment.checkedOutAt)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {detailAppointment.staffAdjustmentNote ? (
            <View style={styles.detailNoteCard}>
              <Text style={styles.detailLabel}>Adjustment Note</Text>
              <Text style={styles.detailNoteText}>{detailAppointment.staffAdjustmentNote}</Text>
            </View>
          ) : null}

          {detailAppointment.staffRejectionReason ? (
            <View style={styles.detailNoteCard}>
              <Text style={styles.detailLabel}>Rejection Reason</Text>
              <Text style={styles.detailNoteText}>{detailAppointment.staffRejectionReason}</Text>
            </View>
          ) : null}

          {detailAppointment.appointmentCompletionNote ? (
            <View style={styles.detailNoteCard}>
              <Text style={styles.detailLabel}>Completion Note</Text>
              <Text style={styles.detailNoteText}>{detailAppointment.appointmentCompletionNote}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderHomeContent = () => (
    <>
      <LinearGradient colors={["#0A3D91", "#1E4A8C"]} style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Staff Dashboard</Text>
            <Text style={styles.heroTitle}>Office Appointment Flow</Text>
            <Text style={styles.heroSubtitle}>
              Review visitor requests, manage schedules, and stay updated with your latest office activity.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.pending}</Text>
            <Text style={styles.heroStatLabel}>Pending</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{checkedInNowCount}</Text>
            <Text style={styles.heroStatLabel}>Checked In</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{unreadNotificationsCount}</Text>
            <Text style={styles.heroStatLabel}>Unread Alerts</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.homeInsightsGrid}>
        <HomeHoverPressable style={styles.homeInsightCard}>
          <View style={styles.homeInsightIconWrap}>
            <Ionicons name="time-outline" size={18} color="#0A3D91" />
          </View>
          <Text style={styles.homeInsightLabel}>Next Arrival</Text>
          <Text style={styles.homeInsightValue}>
            {nextUpcomingAppointment?.fullName || "No upcoming visitor"}
          </Text>
          <Text style={styles.homeInsightMeta}>
            {nextUpcomingAppointment
              ? `${formatDate(nextUpcomingAppointment.visitDate)} at ${formatTime(nextUpcomingAppointment.visitTime)}`
              : "Your next approved appointment will appear here."}
          </Text>
        </HomeHoverPressable>

        <HomeHoverPressable style={styles.homeInsightCard}>
          <View style={styles.homeInsightIconWrap}>
            <Ionicons name="business-outline" size={18} color="#047857" />
          </View>
          <Text style={styles.homeInsightLabel}>Assigned Office</Text>
          <Text style={styles.homeInsightValue}>{user?.department || "Not assigned"}</Text>
          <Text style={styles.homeInsightMeta}>
            Manage requests and records routed to your office assignment.
          </Text>
        </HomeHoverPressable>

        <HomeHoverPressable style={styles.homeInsightCard}>
          <View style={styles.homeInsightHeader}>
            <View style={styles.homeInsightIconWrap}>
              <Ionicons name="notifications-outline" size={18} color="#7C3AED" />
            </View>
            {unreadNotificationsCount ? (
              <TouchableOpacity style={styles.homeInsightAction} onPress={handleMarkAllNotificationsRead}>
                <Text style={styles.homeInsightActionText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.homeInsightLabel}>Notification Center</Text>
          <Text style={styles.homeInsightValue}>
            {unreadNotificationsCount ? `${unreadNotificationsCount} new update${unreadNotificationsCount > 1 ? "s" : ""}` : "All caught up"}
          </Text>
          <Text style={styles.homeInsightMeta}>
            Tap any item below to jump straight into the related appointment.
          </Text>
        </HomeHoverPressable>
      </View>

      <View style={styles.homeWorkspaceGrid}>
        <View style={styles.homeWorkspaceMain}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Today's approved and adjusted visitors for your office.
            </Text>
          </View>
          <TouchableOpacity style={styles.sectionActionIconButton} onPress={() => selectSubmodule("appointment-record")}>
            <Ionicons name="calendar-outline" size={18} color="#1C6DD0" />
          </TouchableOpacity>
        </View>

        {todaysSchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No scheduled visitors today</Text>
            <Text style={styles.emptySubtitle}>
              Approved or adjusted appointments for today will appear here automatically.
            </Text>
            <TouchableOpacity style={styles.emptyRefreshButton} onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={15} color="#0A3D91" />
              <Text style={styles.emptyRefreshButtonText}>Refresh dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.todayScheduleList}>
            {todaysSchedule.map((appointment) => {
              const statusMeta = getStatusMeta(getAppointmentStatus(appointment));
              return (
                <HomeHoverPressable
                  key={appointment._id}
                  style={styles.todayScheduleCard}
                  onPress={() => {
                    selectSubmodule("appointment-record");
                    setDetailAppointment(appointment);
                  }}
                >
                  <View style={styles.todayScheduleTopRow}>
                    <Text style={styles.todayScheduleName}>{appointment.fullName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
                      <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.todayScheduleMeta}>
                    {formatTime(appointment.visitTime)} • {appointment.appointmentDepartment || appointment.assignedOffice || "Assigned department"}
                  </Text>
                  <Text style={styles.todaySchedulePurpose}>
                    {appointment.purposeOfVisit || "No visit purpose provided"}
                  </Text>
                </HomeHoverPressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.quickActionsGrid}>
        <HomeHoverPressable style={styles.quickActionCard} onPress={() => selectSubmodule("appointment-request")}>
          <View style={styles.quickActionMetaRow}>
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{stats.pending} Pending</Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={16} color="#94A3B8" />
          </View>
          <View style={[styles.quickActionIcon, styles.quickActionIconBlue]}>
            <Ionicons name="calendar-clear-outline" size={22} color="#0A3D91" />
          </View>
          <Text style={styles.quickActionTitle}>Appointment Request</Text>
          <Text style={styles.quickActionSubtitle}>
            Open the pending request queue and respond to new visitor schedules.
          </Text>
          <Text style={styles.quickActionFooterText}>Open request table</Text>
        </HomeHoverPressable>

        <HomeHoverPressable style={styles.quickActionCard} onPress={() => selectSubmodule("appointment-record")}>
          <View style={styles.quickActionMetaRow}>
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{appointmentRecords.length} Records</Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={16} color="#94A3B8" />
          </View>
          <View style={[styles.quickActionIcon, styles.quickActionIconGreen]}>
            <Ionicons name="documents-outline" size={22} color="#047857" />
          </View>
          <Text style={styles.quickActionTitle}>Appointment Record</Text>
          <Text style={styles.quickActionSubtitle}>
            Review all appointment records and track status changes over time.
          </Text>
          <Text style={styles.quickActionFooterText}>Open record history</Text>
        </HomeHoverPressable>

        <HomeHoverPressable style={styles.quickActionCard} onPress={() => selectSubmodule("account-info")}>
          <View style={styles.quickActionMetaRow}>
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{user?.department || "Profile"}</Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={16} color="#94A3B8" />
          </View>
          <View style={[styles.quickActionIcon, styles.quickActionIconPurple]}>
            <Ionicons name="person-outline" size={22} color="#6D28D9" />
          </View>
          <Text style={styles.quickActionTitle}>View Account Info</Text>
          <Text style={styles.quickActionSubtitle}>
            Check your assigned office profile and account details with limited access.
          </Text>
          <Text style={styles.quickActionFooterText}>Open my profile</Text>
        </HomeHoverPressable>
      </View>

        </View>

        <View style={styles.homeWorkspaceSide}>
      <View style={[styles.sectionCard, styles.notificationsCard]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <Text style={styles.sectionSubtitle}>
              Stay updated with visitor activity, approvals, and schedule changes.
            </Text>
          </View>
          <View style={styles.sectionActionRow}>
            {unreadNotificationsCount ? (
              <TouchableOpacity style={styles.sectionActionButton} onPress={handleMarkAllNotificationsRead}>
                <Ionicons name="checkmark-done-outline" size={16} color="#0A3D91" />
                <Text style={styles.sectionActionButtonText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.sectionActionIconButton} onPress={loadData}>
              <Ionicons name="refresh-outline" size={18} color="#1C6DD0" />
            </TouchableOpacity>
          </View>
        </View>

        {(notifications || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>Updates from admin and visitor appointment activity will appear here.</Text>
            <TouchableOpacity style={styles.emptyRefreshButton} onPress={loadData}>
              <Ionicons name="refresh-outline" size={15} color="#0A3D91" />
              <Text style={styles.emptyRefreshButtonText}>Check again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notificationList}>
          {(notifications || []).slice(0, 5).map((notification) => (
            (() => {
              const notificationMeta = getNotificationMeta(notification);
              return (
                <HomeHoverPressable
                        key={notification._id}
                        style={[
                          styles.notificationItem,
                    !isNotificationRead(notification) && styles.notificationItemUnread,
                        ]}
                        onPress={() => handleNotificationPress(notification)}
                      >
                  <View style={[styles.notificationDot, !isNotificationRead(notification) && styles.notificationDotUnread]} />
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <View style={styles.notificationBadgeRow}>
                        <View style={[styles.notificationTypeBadge, { backgroundColor: `${notificationMeta.accent}14` }]}>
                          <Ionicons name={notificationMeta.icon} size={12} color={notificationMeta.accent} />
                          <Text style={[styles.notificationTypeBadgeText, { color: notificationMeta.accent }]}>
                            {notificationMeta.label}
                          </Text>
                        </View>
                        {!isNotificationRead(notification) ? (
                          <View style={styles.notificationUnreadBadge}>
                            <Text style={styles.notificationUnreadBadgeText}>New</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <View style={styles.notificationFooterRow}>
                      <Text style={styles.notificationTimestamp}>
                        {formatRelativeTime(notification.createdAt || notification.updatedAt)}
                      </Text>
                      <Text style={styles.notificationActionHint}>Tap to open related appointment</Text>
                    </View>
                  </View>
                </HomeHoverPressable>
              );
            })()
          ))}
          </View>
        )}
      </View>
        </View>
      </View>
    </>
  );

  const renderAppointmentRequestContent = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pending Appointment Requests</Text>
        <View style={styles.sectionActionRow}>
          {renderTablePrintButton({
            label: "Print Requests",
            records: filteredRequestAppointments,
            title: "Pending Appointment Requests",
            subtitle: "Generated from the staff dashboard pending appointment request table.",
            emptyMessage: "There are no pending appointment requests to print.",
          })}
          <TouchableOpacity style={styles.sectionActionIconButton} onPress={loadData}>
            <Ionicons name="refresh-outline" size={20} color="#1C6DD0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recordToolbar}>
        <View style={styles.recordToolbarCard}>
          <View style={styles.recordToolbarHeader}>
            <Text style={styles.recordToolbarTitle}>Search</Text>
            {requestSearchTerm ? (
              <TouchableOpacity onPress={() => setRequestSearchTerm("")} style={styles.recordToolbarClear}>
                <Text style={styles.recordToolbarClearText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              value={requestSearchTerm}
              onChangeText={setRequestSearchTerm}
              placeholder="Visitor, email, purpose, date, or office"
              placeholderTextColor="#94A3B8"
              style={styles.searchBarInput}
            />
          </View>
        </View>

        <View style={styles.recordToolbarCard}>
          <View style={styles.recordToolbarHeader}>
            <Text style={styles.recordToolbarTitle}>Filters</Text>
            {requestFilter !== "all" ? (
              <TouchableOpacity onPress={() => setRequestFilter("all")} style={styles.recordToolbarClear}>
                <Text style={styles.recordToolbarClearText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.filterRow}>
            {[
              { key: "all", label: `All (${appointmentRequests.length})` },
              {
                key: "today",
                label: `Today (${appointmentRequests.filter((item) => isSameCalendarDay(item.visitDate)).length})`,
              },
              {
                key: "this-week",
                label: `This Week (${appointmentRequests.filter((item) => isWithinCurrentWeek(item.visitDate)).length})`,
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, requestFilter === item.key && styles.filterChipActive]}
                onPress={() => setRequestFilter(item.key)}
              >
                <Text style={[styles.filterChipText, requestFilter === item.key && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {renderAppointmentTable(paginatedRequestAppointments, {
        mode: "requests",
        emptyTitle: "No pending requests",
        emptySubtitle: requestSearchTerm || requestFilter !== "all"
          ? "No request matched your search."
          : "New visitor appointment requests will appear here for approval.",
      })}

      {renderPagination({
        currentPage: requestPage,
        totalPages: requestPageCount,
        totalItems: filteredRequestAppointments.length,
        onPrevious: () => setRequestPage((currentValue) => Math.max(1, currentValue - 1)),
        onNext: () => setRequestPage((currentValue) => Math.min(requestPageCount, currentValue + 1)),
        label: "Requests",
      })}

      {detailAppointment ? renderAppointmentDetailPanel() : null}
    </View>
  );

  const renderAppointmentRecordContent = () => (
    <>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointment Records</Text>
          <View style={styles.sectionActionRow}>
            {renderTablePrintButton({
              label: "Print Records",
              records: filteredAppointments,
              title: "Appointment Records",
              subtitle: "Generated from the staff dashboard appointment records table.",
              emptyMessage: "There are no appointment records to print.",
            })}
            <TouchableOpacity style={styles.sectionActionIconButton} onPress={loadData}>
              <Ionicons name="refresh-outline" size={20} color="#1C6DD0" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recordToolbar}>
          <View style={styles.recordToolbarCard}>
            <View style={styles.recordToolbarHeader}>
              <Text style={styles.recordToolbarTitle}>Search</Text>
              {recordSearchTerm ? (
                <TouchableOpacity onPress={() => setRecordSearchTerm("")} style={styles.recordToolbarClear}>
                  <Text style={styles.recordToolbarClearText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#64748B" />
              <TextInput
                value={recordSearchTerm}
                onChangeText={setRecordSearchTerm}
                placeholder="Visitor, office, date, or purpose"
                placeholderTextColor="#94A3B8"
                style={styles.searchBarInput}
              />
            </View>
          </View>

          <View style={styles.recordToolbarCard}>
            <View style={styles.recordToolbarHeader}>
              <Text style={styles.recordToolbarTitle}>Filters</Text>
              {filter !== "all" ? (
                <TouchableOpacity onPress={() => setFilter("all")} style={styles.recordToolbarClear}>
                  <Text style={styles.recordToolbarClearText}>Reset</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.filterRow}>
              {[
                { key: "all", label: `All (${appointmentRecords.length})` },
                { key: "approved", label: `Approved (${stats.approved})` },
                { key: "adjusted", label: `Adjusted (${stats.adjusted})` },
                { key: "rejected", label: `Rejected (${stats.rejected})` },
                { key: "completed", label: `Completed (${stats.completed})` },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {renderAppointmentTable(paginatedRecordAppointments, {
          mode: "records",
          emptyTitle: "No appointment records found",
          emptySubtitle: recordSearchTerm
            ? "No appointment record matched your search."
            : "Approved appointments will appear here after staff approval.",
        })}

        {renderPagination({
          currentPage: recordPage,
          totalPages: recordPageCount,
          totalItems: filteredAppointments.length,
          onPrevious: () => setRecordPage((currentValue) => Math.max(1, currentValue - 1)),
          onNext: () => setRecordPage((currentValue) => Math.min(recordPageCount, currentValue + 1)),
          label: "Records",
        })}

        {detailAppointment ? renderAppointmentDetailPanel() : null}
      </View>
    </>
  );

  const renderAccountInfoContent = () => (
    <>
      <View style={styles.sectionCard}>
        <View style={styles.accountProfileTopRow}>
          <View style={styles.accountProfileHeader}>
            <View style={styles.accountProfileAvatar}>
              <Text style={styles.accountProfileAvatarText}>{profileInitials}</Text>
            </View>
            <View style={styles.accountProfileCopy}>
              <Text style={styles.accountProfileName}>{profileName}</Text>
              <Text style={styles.accountProfileRole}>
                {String(user?.role || "staff").toUpperCase()} ACCESS
              </Text>
            </View>
          </View>
          <View style={styles.accountProfileActions}>
            <TouchableOpacity
              style={[styles.accountTabButton, accountMode === "view" && styles.accountTabButtonActive]}
              onPress={() => setAccountMode("view")}
            >
              <Text style={[styles.accountTabButtonText, accountMode === "view" && styles.accountTabButtonTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accountTabButton, accountMode === "edit" && styles.accountTabButtonActive]}
              onPress={() => setAccountMode("edit")}
            >
              <Text style={[styles.accountTabButtonText, accountMode === "edit" && styles.accountTabButtonTextActive]}>
                Edit Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accountTabButton, accountMode === "password" && styles.accountTabButtonActive]}
              onPress={() => setAccountMode("password")}
            >
              <Text style={[styles.accountTabButtonText, accountMode === "password" && styles.accountTabButtonTextActive]}>
                Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.accountHeroStrip}>
          <View style={styles.accountHeroMetric}>
            <Text style={styles.accountHeroMetricLabel}>Assigned Office</Text>
            <Text style={styles.accountHeroMetricValue}>{user?.department || "Not assigned"}</Text>
          </View>
          <View style={styles.accountHeroMetric}>
            <Text style={styles.accountHeroMetricLabel}>Staff ID</Text>
            <Text style={styles.accountHeroMetricValue}>
              {user?.staffId || user?.employeeId || "Pending"}
            </Text>
          </View>
          <View style={styles.accountHeroMetric}>
            <Text style={styles.accountHeroMetricLabel}>Account Status</Text>
            <Text style={styles.accountHeroMetricValue}>
              {String(user?.status || "active").toUpperCase()}
            </Text>
          </View>
        </View>

        {accountMode === "view" ? (
          <>
            <View style={styles.accountSectionHeader}>
              <Text style={styles.accountSectionTitle}>Profile Overview</Text>
              <Text style={styles.accountSectionSubtitle}>
                Your core staff account details and current office assignment.
              </Text>
            </View>

            <View style={styles.accountInfoGrid}>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Email</Text>
                <Text style={styles.accountInfoValue}>{user?.email || "N/A"}</Text>
              </View>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Username</Text>
                <Text style={styles.accountInfoValue}>{user?.username || "N/A"}</Text>
              </View>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Staff ID</Text>
                <Text style={styles.accountInfoValue}>
                  {user?.staffId || user?.employeeId || "Not assigned"}
                </Text>
              </View>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Department</Text>
                <Text style={styles.accountInfoValue}>{user?.department || "Not assigned"}</Text>
              </View>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Contact Number</Text>
                <Text style={styles.accountInfoValue}>
                  {user?.phone || user?.phoneNumber || user?.contactNumber || "N/A"}
                </Text>
              </View>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Status</Text>
                <Text style={styles.accountInfoValue}>{user?.status || "active"}</Text>
              </View>
            </View>

            <View style={styles.accountNoticeCard}>
              <Ionicons name="information-circle-outline" size={18} color="#1C6DD0" />
              <Text style={styles.accountNoticeText}>
                Your department and staff ID are managed by admin. Personal details and password can be updated here anytime.
              </Text>
            </View>
          </>
        ) : null}

        {accountMode === "edit" ? (
          <View style={styles.accountEditForm}>
            <View style={styles.accountSectionHeader}>
              <Text style={styles.accountSectionTitle}>Edit Personal Details</Text>
              <Text style={styles.accountSectionSubtitle}>
                Keep your contact information and login details accurate.
              </Text>
            </View>

            <View style={styles.accountEditGrid}>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>First Name</Text>
                <TextInput
                  value={profileForm.firstName}
                  onChangeText={(value) => handleProfileInputChange("firstName", value)}
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                />
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>Last Name</Text>
                <TextInput
                  value={profileForm.lastName}
                  onChangeText={(value) => handleProfileInputChange("lastName", value)}
                  placeholder="Last name"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                />
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>Email</Text>
                <TextInput
                  value={profileForm.email}
                  onChangeText={(value) => handleProfileInputChange("email", value)}
                  placeholder="Email address"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>Username</Text>
                <TextInput
                  value={profileForm.username}
                  onChangeText={(value) => handleProfileInputChange("username", value)}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.accountFieldFull}>
                <Text style={styles.accountFieldLabel}>Contact Number</Text>
                <TextInput
                  value={profileForm.phone}
                  onChangeText={(value) => handleProfileInputChange("phone", value)}
                  placeholder="Contact number"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.accountReadOnlyCard}>
                <Text style={styles.accountReadOnlyLabel}>Department</Text>
                <Text style={styles.accountReadOnlyValue}>{user?.department || "Not assigned"}</Text>
              </View>
              <View style={styles.accountReadOnlyCard}>
                <Text style={styles.accountReadOnlyLabel}>Staff ID</Text>
                <Text style={styles.accountReadOnlyValue}>
                  {user?.staffId || user?.employeeId || "Not assigned"}
                </Text>
              </View>
            </View>

            <View style={styles.accountFormActions}>
              <TouchableOpacity style={styles.accountSecondaryButton} onPress={() => setAccountMode("view")}>
                <Text style={styles.accountSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.accountPrimaryButton, profileSaving && styles.disabledAction]}
                onPress={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.accountPrimaryButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {accountMode === "password" ? (
          <View style={styles.accountEditForm}>
            <View style={styles.accountSectionHeader}>
              <Text style={styles.accountSectionTitle}>Password & Security</Text>
              <Text style={styles.accountSectionSubtitle}>
                Update your password regularly to keep your staff account secure.
              </Text>
            </View>

            <View style={styles.accountSecurityTipCard}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#0A3D91" />
              <Text style={styles.accountSecurityTipText}>
                Use at least 6 characters and avoid reusing old passwords from shared devices.
              </Text>
            </View>

            <View style={styles.accountEditGrid}>
              <View style={styles.accountFieldFull}>
                <Text style={styles.accountFieldLabel}>Current Password</Text>
                <TextInput
                  value={passwordForm.currentPassword}
                  onChangeText={(value) => handlePasswordInputChange("currentPassword", value)}
                  placeholder="Current password"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  secureTextEntry
                />
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>New Password</Text>
                <TextInput
                  value={passwordForm.newPassword}
                  onChangeText={(value) => handlePasswordInputChange("newPassword", value)}
                  placeholder="New password"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  secureTextEntry
                />
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>Confirm Password</Text>
                <TextInput
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) => handlePasswordInputChange("confirmPassword", value)}
                  placeholder="Confirm password"
                  placeholderTextColor="#94A3B8"
                  style={styles.accountFieldInput}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.accountFormActions}>
              <TouchableOpacity
                style={[styles.accountPrimaryButton, passwordSaving && styles.disabledAction]}
                onPress={handleChangePassword}
                disabled={passwordSaving}
              >
                {passwordSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.accountPrimaryButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );

  const renderSidebar = () => (
    <View style={styles.sidebar}>
        <SidebarHoverPressable
          style={styles.sidebarHeader}
          onPress={() => selectSubmodule("account-info")}
          hoverScale={1.012}
        >
          <View style={styles.sidebarAvatar}>
            <Text style={styles.sidebarAvatarText}>{profileInitials}</Text>
          </View>
          <View style={styles.sidebarUserCopy}>
            <Text style={styles.sidebarUserName}>{profileName}</Text>
            <Text style={styles.sidebarUserRole}>Staff Panel</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
        </SidebarHoverPressable>

      <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
        {staffModules.map((module) => {
          const isHomeModule = module.key === "home";
          const isExpanded = isHomeModule ? true : expandedModule === module.key;
          const hasSelectedChild = isHomeModule
            ? selectedSubmodule === "home"
            : module.submodules.some((submodule) => submodule.key === selectedSubmodule);

          return (
            <View key={module.key} style={styles.sidebarModuleCard}>
              <SidebarHoverPressable
                style={[
                  styles.sidebarModuleButton,
                  hasSelectedChild && styles.sidebarModuleButtonActive,
                ]}
                onPress={() => toggleModule(module.key)}
                hoverScale={1.012}
              >
                <View style={[styles.sidebarModuleIcon, { backgroundColor: `${module.color}18` }]}>
                  <Ionicons name={module.icon} size={20} color={module.color} />
                </View>
                <Text
                  style={[
                    styles.sidebarModuleLabel,
                    hasSelectedChild && styles.sidebarModuleLabelActive,
                  ]}
                >
                  {module.label}
                </Text>
                <Ionicons
                  name={
                    isHomeModule
                      ? "chevron-forward-outline"
                      : isExpanded
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                  }
                  size={18}
                  color={hasSelectedChild ? module.color : "#64748B"}
                />
              </SidebarHoverPressable>

              {!isHomeModule && isExpanded ? (
                <View style={styles.sidebarSubmoduleList}>
                  {module.submodules.map((submodule) => {
                    const isActive = selectedSubmodule === submodule.key;
                    return (
                      <SidebarHoverPressable
                        key={submodule.key}
                        style={[
                          styles.sidebarSubmoduleButton,
                          isActive && styles.sidebarSubmoduleButtonActive,
                        ]}
                        onPress={() => selectSubmodule(submodule.key)}
                        hoverScale={1.012}
                      >
                        <Text
                          style={[
                            styles.sidebarSubmoduleLabel,
                            isActive && styles.sidebarSubmoduleLabelActive,
                          ]}
                        >
                          {submodule.label}
                        </Text>
                        {submodule.badge ? (
                          <View style={styles.sidebarSubmoduleBadge}>
                            <Text style={styles.sidebarSubmoduleBadgeText}>{submodule.badge}</Text>
                          </View>
                        ) : null}
                      </SidebarHoverPressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <SidebarHoverPressable
        style={styles.logoutButton}
        onPress={handleLogout}
        hoverScale={1.012}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        )}
        <Text style={styles.logoutButtonText}>
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Text>
      </SidebarHoverPressable>
    </View>
  );

  const renderActiveContent = () => {
    if (selectedSubmodule === "appointment-request") {
      return renderAppointmentRequestContent();
    }

    if (selectedSubmodule === "appointment-record") {
      return renderAppointmentRecordContent();
    }

    if (selectedSubmodule === "account-info") {
      return renderAccountInfoContent();
    }

    return renderHomeContent();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={styles.loadingText}>Loading staff appointments...</Text>
        <Text style={styles.loadingSubtext}>Restoring requests, records, and notifications.</Text>
      </SafeAreaView>
    );
  }

  const selectedSubmoduleMeta = getSelectedSubmoduleMeta();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.dashboardLayout}>
        {renderSidebar()}

        <View style={styles.contentArea}>
          <ScrollView
            style={styles.contentScroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0A3D91"
                colors={["#0A3D91"]}
                title="Refreshing dashboard..."
                titleColor="#0A3D91"
              />
            }
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.pageHeaderCard}>
              <Text style={styles.pageEyebrow}>Staff Module</Text>
              <Text style={styles.pageTitle}>{selectedSubmoduleMeta.title}</Text>
              <Text style={styles.pageSubtitle}>{selectedSubmoduleMeta.subtitle}</Text>
            </View>

            {renderActiveContent()}
          </ScrollView>
        </View>
      </View>

      <Modal visible={showAdjustModal} transparent animationType="fade" onRequestClose={closeAdjustModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adjust Appointment Time</Text>
            <Text style={styles.modalSubtitle}>
              Update the visitor's preferred schedule before approving the appointment.
            </Text>

            <TouchableOpacity style={styles.modalField} onPress={handleAdjustDatePress}>
              <View style={styles.modalFieldTop}>
                <View style={styles.modalFieldIcon}>
                  <Ionicons name="calendar-outline" size={18} color="#041E42" />
                </View>
                <View style={styles.modalFieldBody}>
                  <Text style={styles.modalFieldLabel}>Preferred Date</Text>
                  <Text style={styles.modalFieldValue}>{formatDate(adjustedDate)}</Text>
                  <Text style={styles.modalFieldHint}>Tap to choose a calendar date</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalField} onPress={handleAdjustTimePress}>
              <View style={styles.modalFieldTop}>
                <View style={[styles.modalFieldIcon, styles.modalFieldIconWarm]}>
                  <Ionicons name="time-outline" size={18} color="#D97706" />
                </View>
                <View style={styles.modalFieldBody}>
                  <Text style={styles.modalFieldLabel}>Preferred Time</Text>
                  <Text style={styles.modalFieldValue}>{formatTime(adjustedTime)}</Text>
                  <Text style={styles.modalFieldHint}>Tap to choose an updated time slot</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            <TextInput
              value={adjustmentNote}
              onChangeText={setAdjustmentNote}
              placeholder="Add a note for the visitor"
              placeholderTextColor="#94A3B8"
              style={[styles.modalInput, styles.modalTextarea]}
              multiline
            />

            {Platform.OS === "web" ? (
              <input
                ref={webDateInputRef}
                type="date"
                value={getWebDateInputValue()}
                onChange={handleWebDateChange}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: "none",
                }}
                aria-label="Adjust appointment date"
              />
            ) : null}

            {Platform.OS === "web" ? (
              <input
                ref={webTimeInputRef}
                type="time"
                value={getWebTimeInputValue()}
                onChange={handleWebTimeChange}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: "none",
                }}
                aria-label="Adjust appointment time"
              />
            ) : null}

            {Platform.OS !== "web" && showDatePicker ? (
              <DateTimePicker
                value={adjustedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleAdjustDateChange}
              />
            ) : null}

            {Platform.OS !== "web" && showTimePicker ? (
              <DateTimePicker
                value={adjustedTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleAdjustTimeChange}
              />
            ) : null}

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeAdjustModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={submitAdjustment}>
                <Text style={styles.modalSubmitText}>Save Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRejectModal} transparent animationType="fade" onRequestClose={closeRejectModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Appointment</Text>
            <Text style={styles.modalSubtitle}>
              Add a reason so the visitor understands why the request was declined.
            </Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Reason for rejection"
              placeholderTextColor="#94A3B8"
              style={[styles.modalInput, styles.modalTextarea]}
              multiline
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeRejectModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalReject} onPress={submitRejection}>
                <Text style={styles.modalRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={closeLogoutModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.logoutModalCard]}>
            <View style={styles.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            </View>
            <Text style={styles.logoutModalTitle}>Sign out?</Text>
            <Text style={styles.logoutModalSubtitle}>
              You will return to the login screen and need to sign in again to access the staff dashboard.
            </Text>
            <View style={styles.logoutModalActionRow}>
              <TouchableOpacity
                style={styles.logoutModalCancel}
                onPress={closeLogoutModal}
                disabled={isSigningOut}
              >
                <Text style={styles.logoutModalCancelText}>Stay Signed In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutModalConfirm}
                onPress={confirmLogout}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.logoutModalConfirmText}>
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
