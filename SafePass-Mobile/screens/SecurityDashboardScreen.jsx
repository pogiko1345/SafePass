// SecurityDashboardScreen.jsx (Complete with Working Tab Navigation)
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Image,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from "../utils/ApiService";
import { canAccessSecurityDashboard, normalizeRole } from "../utils/authFlow";
import {
  PHILIPPINE_MOBILE_NUMBER_MESSAGE,
  isValidPhilippineMobileNumber,
  normalizePhilippineMobileNumber,
} from "../utils/phoneValidation";
import styles from "../styles/SecurityDashboardStyles";
import Logo from "../assets/LogoSapphire.jpg";

// Import map components
import SharedMonitoringMap from "../components/SharedMonitoringMap";
import {
  MONITORING_MAP_BLUEPRINTS,
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "../utils/monitoringMapConfig";

const { width, height } = Dimensions.get("window");
const isDesktop = width >= 1024;
const LIVE_MAP_REFRESH_INTERVAL_MS = 5000;

export default function SecurityDashboardScreen({ navigation }) {
  // ============ STATE MANAGEMENT ============
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sidebarAnim = useRef(new Animated.Value(isDesktop ? 1 : 0)).current;
  const liveMapRefreshRef = useRef(false);
  
  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    activeUsers: 0,
    totalVisitorsToday: 0,
    activeAlerts: 0,
    recentAccess: 0,
    occupancyRate: 0,
  });
  
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentAccess, setRecentAccess] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Visitor Management
  const [visitors, setVisitors] = useState({
    active: [],
    pending: [],
    approved: [],
    completed: [],
    all: [],
  });
  const [visitorStats, setVisitorStats] = useState({
    totalToday: 0,
    totalThisWeek: 0,
    totalThisMonth: 0,
    activeNow: 0,
    pendingApproval: 0,
  });
  const [analytics, setAnalytics] = useState({
    mostVisitedOffices: [],
    visitorsByHour: [],
    popularVisitPurposes: [],
    averageVisitDuration: 0,
  });
  
  // Map and tracking states
  const [selectedFloor, setSelectedFloor] = useState('ground');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [hoveredVisitor, setHoveredVisitor] = useState(null);
  const [visitorLocations, setVisitorLocations] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedModule, setExpandedModule] = useState('home');
  const [selectedSubmodule, setSelectedSubmodule] = useState('home-main');
  const [visitorFilter, setVisitorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentRecordsPage, setAppointmentRecordsPage] = useState(1);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingVisitorId, setProcessingVisitorId] = useState(null);
  const [resolvingAlertId, setResolvingAlertId] = useState(null);
  
  // Form State
  const [newVisitor, setNewVisitor] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
    purposeOfVisit: "",
    host: "",
    assignedOffice: "",
    visitDate: new Date(),
    visitTime: new Date(),
    vehicleNumber: "",
    idPhotoUri: null,
    idPhotoBase64: null,
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Access Logs State
  const [accessLogs, setAccessLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  
  // Reports State
  const [reports, setReports] = useState([]);
  const [reportDateRange, setReportDateRange] = useState({ start: null, end: null });
  const [reportType, setReportType] = useState('daily');
  const [reportsPage, setReportsPage] = useState(1);
  const [reportForm, setReportForm] = useState({
    visitorId: '',
    category: 'suspicious',
    details: '',
  });
  
  // Floors and offices data
  const floors = MONITORING_MAP_FLOORS;
  
  const offices = MONITORING_MAP_OFFICES;

  const mapBlueprints = MONITORING_MAP_BLUEPRINTS;

  const officePositions = MONITORING_MAP_OFFICE_POSITIONS;

  // ============ LOGOUT FUNCTIONS ============
  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const performLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    
    try {
      await ApiService.logout();
      await ApiService.clearAuth();
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout error:", error);
      await ApiService.clearAuth();
      navigation.replace("Login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ============ INITIALIZATION ============
  useEffect(() => {
    initializeScreen();
    requestPermissions();
    
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const initializeScreen = async () => {
    try {
      const currentUser = await loadUserData();
      if (!currentUser) {
        return;
      }

      await Promise.all([
        loadOperationalData(),
        loadNotifications(currentUser),
      ]);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Needed', 'Camera permission is required to capture visitor ID photos.');
      }
    }
  };

  const toggleSidebar = () => {
    const toValue = sidebarOpen ? 0 : 1;
    Animated.spring(sidebarAnim, {
      toValue,
      useNativeDriver: false,
      tension: 300,
      friction: 30,
    }).start();
    setSidebarOpen(!sidebarOpen);
  };

  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const normalizeNotificationReadState = (notification, currentUserId) => {
    if (!notification || !currentUserId) {
      return false;
    }

    return Array.isArray(notification.readBy) && notification.readBy.some((entry) => {
      const readByUserId =
        typeof entry?.user === 'object' ? entry?.user?._id : entry?.user;
      return String(readByUserId) === String(currentUserId);
    });
  };

  const normalizeNotifications = (items = [], currentUserId = user?._id) =>
    items.map((notification) => ({
      ...notification,
      read: normalizeNotificationReadState(notification, currentUserId),
    }));

  const isActiveAlertNotification = (notification) => {
    if (!notification || notification.read) {
      return false;
    }

    const type = String(notification.type || "").toLowerCase();
    const severity = String(notification.severity || "").toLowerCase();

    return (
      type === "alert" ||
      type.includes("security") ||
      severity === "high" ||
      severity === "medium"
    );
  };

  const COMPLETED_VISITOR_HISTORY_DAYS = 30;

  const isWithinCompletedHistoryWindow = (visitor) => {
    const completedAt =
      visitor?.checkedOutAt ||
      visitor?.updatedAt ||
      visitor?.visitDate;

    if (!completedAt) {
      return false;
    }

    const completedDate = new Date(completedAt);
    if (Number.isNaN(completedDate.getTime())) {
      return false;
    }

    const cutoffDate = new Date();
    cutoffDate.setHours(0, 0, 0, 0);
    cutoffDate.setDate(cutoffDate.getDate() - COMPLETED_VISITOR_HISTORY_DAYS);

    return completedDate >= cutoffDate;
  };

  const getCompletedHistoryDaysLeft = (visitor) => {
    const completedAt =
      visitor?.checkedOutAt ||
      visitor?.updatedAt ||
      visitor?.visitDate;

    if (!completedAt) {
      return null;
    }

    const completedDate = new Date(completedAt);
    if (Number.isNaN(completedDate.getTime())) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    completedDate.setHours(0, 0, 0, 0);

    const elapsedDays = Math.floor((today - completedDate) / 86400000);
    return Math.max(0, COMPLETED_VISITOR_HISTORY_DAYS - elapsedDays);
  };

  const deriveVisitorCollections = (all = []) => {
    const active = all.filter((visitor) => visitor.status === 'checked_in');
    const pending = all.filter(
      (visitor) =>
        visitor.appointmentStatus === 'pending' ||
        (!visitor.appointmentStatus && visitor.approvalStatus === 'pending'),
    );
    const approved = all.filter(
      (visitor) =>
        hasApprovedVisitWindow(visitor) &&
        visitor.status !== 'checked_in' &&
        visitor.status !== 'checked_out',
    );
    const completed = all.filter(
      (visitor) =>
        visitor.status === 'checked_out' &&
        isWithinCompletedHistoryWindow(visitor),
    );
    const allVisible = [...active, ...approved, ...completed].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt || b.visitDate) - new Date(a.updatedAt || a.createdAt || a.visitDate)
    );

    return { active, pending, approved, completed, all: allVisible };
  };

  const deriveVisitorStats = (all = [], active = [], pending = []) => {
    const today = getStartOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return {
      totalToday: all.filter((visitor) => {
        const visitDate = new Date(visitor.visitDate);
        return visitDate >= today && visitDate < tomorrow;
      }).length,
      totalThisWeek: all.filter((visitor) => new Date(visitor.visitDate) >= weekAgo).length,
      totalThisMonth: all.filter((visitor) => new Date(visitor.visitDate) >= monthAgo).length,
      activeNow: active.length,
      pendingApproval: pending.length,
    };
  };

  const deriveAnalytics = (all = []) => {
    const officeCount = {};
    const purposeCount = {};
    const visitsByHour = new Array(24).fill(0);
    const visitDurations = [];

    all.forEach((visitor) => {
      const office = visitor.assignedOffice || visitor.host;
      if (office) {
        officeCount[office] = (officeCount[office] || 0) + 1;
      }

      const purpose = visitor.purposeOfVisit;
      if (purpose) {
        purposeCount[purpose] = (purposeCount[purpose] || 0) + 1;
      }

      if (visitor.visitTime) {
        const visitHour = new Date(visitor.visitTime).getHours();
        if (!Number.isNaN(visitHour)) {
          visitsByHour[visitHour] += 1;
        }
      }

      if (visitor.checkedInAt && visitor.checkedOutAt) {
        const durationMinutes =
          (new Date(visitor.checkedOutAt) - new Date(visitor.checkedInAt)) / 60000;
        if (durationMinutes > 0) {
          visitDurations.push(durationMinutes);
        }
      }
    });

    const totalVisitors = all.length || 1;
    const mostVisitedOffices = Object.entries(officeCount)
      .map(([office, count]) => ({
        office,
        count,
        percentage: Math.round((count / totalVisitors) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const popularVisitPurposes = Object.entries(purposeCount)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const averageVisitDuration =
      visitDurations.length > 0
        ? Math.round(
            visitDurations.reduce((sum, minutes) => sum + minutes, 0) /
              visitDurations.length,
          )
        : 0;

    return {
      mostVisitedOffices,
      visitorsByHour: visitsByHour.map((count, hour) => ({ hour, count })),
      popularVisitPurposes,
      averageVisitDuration,
    };
  };

  const deriveVisitorLocations = (activeVisitors = []) =>
    activeVisitors
      .filter((visitor) => visitor?.status === 'checked_in')
      .map((visitor, index) => {
        const liveLocation = visitor.currentLocation?.isActive
          ? visitor.currentLocation
          : null;
        const liveCoordinates = liveLocation?.coordinates || {};
        const hasLiveCoordinates =
          Number.isFinite(Number(liveCoordinates.x)) &&
          Number.isFinite(Number(liveCoordinates.y));

        return {
          id: visitor._id,
          name: visitor.fullName,
          phone: visitor.phoneNumber,
          purpose: visitor.purposeOfVisit,
          host: visitor.host,
          checkInTime: visitor.checkedInAt,
          status: visitor.status,
          idPhoto: visitor.idImage,
          location: {
            floor: liveLocation?.floor || 'ground',
            office: liveLocation?.office || visitor.assignedOffice || getRandomOffice(),
            coordinates: hasLiveCoordinates
              ? {
                  x: Number(liveCoordinates.x),
                  y: Number(liveCoordinates.y),
                }
              : {
                  x: 15 + ((index * 17) % 70),
                  y: 15 + ((index * 23) % 70),
                },
            timestamp: liveLocation?.lastSeenAt || new Date(),
            source: liveLocation?.source || 'system_estimate',
          },
          movement: visitor.locationHistory || [],
        };
      });

  const deriveAccessLogs = (all = []) =>
    all
      .flatMap((visitor) => {
        const officeLocation =
          visitor.assignedOffice || visitor.host || 'Main Gate';
        const entries = [];

        if (visitor.approvedAt) {
          entries.push({
            _id: `${visitor._id}-approved`,
            userName: visitor.fullName,
            location: officeLocation,
            status: 'granted',
            accessType: 'approval',
            notes: 'Visitor approved for entry',
            timestamp: visitor.approvedAt,
          });
        }

        if (visitor.checkedInAt) {
          entries.push({
            _id: `${visitor._id}-checked-in`,
            userName: visitor.fullName,
            location: officeLocation,
            status: 'granted',
            accessType: 'entry',
            notes: 'Checked in by security',
            timestamp: visitor.checkedInAt,
          });
        }

        if (visitor.checkedOutAt) {
          entries.push({
            _id: `${visitor._id}-checked-out`,
            userName: visitor.fullName,
            location: officeLocation,
            status: 'granted',
            accessType: 'exit',
            notes: 'Checked out by security',
            timestamp: visitor.checkedOutAt,
          });
        }

        return entries;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const deriveReports = (all = []) =>
    all
      .flatMap((visitor) =>
        (visitor.reports || []).map((report, index) => ({
          _id: `${visitor._id}-report-${index}`,
          reason: report.reason || 'Security incident',
          createdAt: report.reportedAt,
          visitorName: visitor.fullName,
          status: report.resolved ? 'Resolved' : 'Open',
          resolved: !!report.resolved,
        })),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ============ DATA LOADING FUNCTIONS ============
  const loadUserData = async () => {
    try {
      const [currentUser, token] = await Promise.all([
        ApiService.getCurrentUser(),
        ApiService.getToken(),
      ]);

      if (!token) {
        await ApiService.clearAuth();
        navigation.replace("Login");
        return;
      }

      const normalizedRole = normalizeRole(currentUser?.role);
      if (!currentUser || !canAccessSecurityDashboard(normalizedRole)) {
        navigation.replace("Login");
        return null;
      }
      const normalizedUser = { ...currentUser, role: normalizedRole };
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error("Load user error:", error);
      Alert.alert("Error", "Failed to load user data");
      return null;
    }
  };

  const loadOperationalData = async () => {
    try {
      const allVisitorsRes = await ApiService.getVisitors({});
      const allVisitors = allVisitorsRes.visitors || [];
      const collections = deriveVisitorCollections(allVisitors);
      const stats = deriveVisitorStats(
        collections.all,
        collections.active,
        collections.pending,
      );
      const operationalAnalytics = deriveAnalytics(collections.all);
      const derivedLogs = deriveAccessLogs(collections.all);
      const derivedReports = deriveReports(collections.all);

      setVisitors(collections);
      setVisitorStats(stats);
      setAnalytics(operationalAnalytics);
      setVisitorLocations(deriveVisitorLocations(collections.active));
      setAccessLogs(derivedLogs);
      setLogsTotal(derivedLogs.length);
      setReports(derivedReports);
      setActiveUsers(collections.active);
      setRecentAccess(derivedLogs.slice(0, 10));
      setDashboardStats((current) => ({
        ...current,
        activeUsers: collections.active.length,
        totalVisitorsToday: stats.totalToday,
        recentAccess: derivedLogs.length,
        occupancyRate: 0,
      }));
    } catch (error) {
      console.error("Load operational data error:", error);
    }
  };

  const loadDashboardData = loadOperationalData;
  const loadVisitors = loadOperationalData;

  const loadAccessLogs = async () => {
    await loadOperationalData();
  };

  const loadReports = async () => {
    await loadOperationalData();
  };

  const loadNotifications = async (currentUser = user) => {
    try {
      const response = await ApiService.getNotifications({ limit: 100 });
      const normalizedNotifications = normalizeNotifications(
        response.notifications || [],
        currentUser?._id,
      );
      const unreadNotifications = normalizedNotifications.filter((notification) => !notification.read);
      const alertNotifications = unreadNotifications.filter(isActiveAlertNotification);

      setNotifications(normalizedNotifications);
      setUnreadCount(unreadNotifications.length);
      setAlerts(alertNotifications);
      setDashboardStats((current) => ({
        ...current,
        activeAlerts: alertNotifications.length,
      }));
    } catch (error) {
      console.error("Load notifications error:", error);
    }
  };

  const loadAnalytics = async () => {
    await loadOperationalData();
  };

  const loadVisitorLocations = async () => {
    await loadOperationalData();
  };

  const getRandomFloor = () => {
    const floorsList = ['ground', 'first', 'second', 'third'];
    return floorsList[Math.floor(Math.random() * floorsList.length)];
  };

  const guardModules = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home-outline',
      color: '#0A3D91',
      submodules: [{ key: 'home-main', label: 'Home', badge: 0 }],
    },
    {
      key: 'maps',
      label: 'Maps',
      icon: 'map-outline',
      color: '#0A3D91',
      submodules: [
        { key: 'map-ground', label: 'Ground Floor', badge: 0 },
        { key: 'map-mezzanine', label: 'Mezzanine', badge: 0 },
        { key: 'map-second', label: 'Second Floor', badge: 0 },
        { key: 'map-third', label: 'Third Floor', badge: 0 },
      ],
    },
    {
      key: 'appointment',
      label: 'Appointment',
      icon: 'calendar-outline',
      color: '#0A3D91',
      submodules: [
        { key: 'appointment-records', label: 'Appointment Records', badge: visitors.all.length || 0 },
      ],
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'document-text-outline',
      color: '#1C6DD0',
      submodules: [
        { key: 'report-file', label: 'File a Report', badge: reports.length || 0 },
      ],
    },
  ];

  const floorSubmoduleToFloor = {
    'map-ground': 'ground',
    'map-mezzanine': 'mezzanine',
    'map-second': 'second',
    'map-third': 'third',
  };

  const getGuardParentModule = (submoduleKey) =>
    guardModules.find((module) => module.submodules.some((submodule) => submodule.key === submoduleKey))?.key || 'home';

  const getContentKeyForSubmodule = (submoduleKey) => {
    if (submoduleKey === 'home-main') return 'dashboard';
    if (submoduleKey.startsWith('map-')) return 'map';
    if (submoduleKey === 'appointment-records') return 'visitors';
    if (submoduleKey === 'report-file') return 'reports';
    return 'dashboard';
  };

  const getSelectedSubmoduleMeta = () => {
    switch (selectedSubmodule) {
      case 'map-ground':
        return { title: 'Ground Floor Map', subtitle: 'View-only monitoring of the ground floor layout and active visitor positions.' };
      case 'map-mezzanine':
        return { title: 'Mezzanine Map', subtitle: 'View-only monitoring of the mezzanine layout and active visitor positions.' };
      case 'map-second':
        return { title: 'Second Floor Map', subtitle: 'View-only monitoring of the second floor layout and active visitor positions.' };
      case 'map-third':
        return { title: 'Third Floor Map', subtitle: 'View-only monitoring of the third floor layout and active visitor positions.' };
      case 'appointment-records':
        return { title: 'Appointment Records', subtitle: 'Review appointment records in a read-only security view.' };
      case 'report-file':
        return { title: 'File a Report', subtitle: 'Submit a security report and review recently filed incidents.' };
      case 'home-main':
      default:
        return { title: 'Security Home', subtitle: 'Live guard operations, visitor status, and priority actions.' };
    }
  };

  const selectGuardSubmodule = (submoduleKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const parentModule = getGuardParentModule(submoduleKey);
    setExpandedModule(parentModule);
    setSelectedSubmodule(submoduleKey);
    setActiveTab(getContentKeyForSubmodule(submoduleKey));

    if (floorSubmoduleToFloor[submoduleKey]) {
      setSelectedFloor(floorSubmoduleToFloor[submoduleKey]);
      setSelectedOffice('all');
    }

    if (submoduleKey === 'appointment-records') {
      setVisitorFilter('all');
    }
  };

  const toggleGuardModule = (moduleKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedModule((currentValue) => (currentValue === moduleKey ? null : moduleKey));
  };

  const normalizeFloorId = (floorId) => {
    if (floorId === 'mezzanine') {
      return 'first';
    }
    return floorId;
  };
  
  const getRandomOffice = () => {
    const officeNames = offices.filter(o => o.id !== 'all').map(o => o.name);
    return officeNames[Math.floor(Math.random() * officeNames.length)];
  };

  const getFilteredVisitorLocations = () => {
    return visitorLocations.filter(visitor => {
      if (
        normalizeFloorId(visitor.location.floor) !== normalizeFloorId(selectedFloor)
      ) {
        return false;
      }
      if (selectedOffice !== 'all' && visitor.location.office !== selectedOffice) {
        return false;
      }
      return true;
    });
  };

  const handleVisitorHover = (visitor) => {
    setHoveredVisitor(visitor);
  };
  
  const handleVisitorLeave = () => {
    setHoveredVisitor(null);
  };
  
  const handleVisitorSelect = (visitor) => {
    setSelectedVisitor(visitor);
    setShowDetailModal(true);
  };

  // ============ HELPER FUNCTIONS ============
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOperationalData(),
        loadNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshLiveMapData = async () => {
    if (liveMapRefreshRef.current) return;
    liveMapRefreshRef.current = true;
    try {
      await loadOperationalData();
    } finally {
      liveMapRefreshRef.current = false;
    }
  };

  useEffect(() => {
    const isMapVisible = activeTab === 'map' || showMapModal;
    if (!isMapVisible) return undefined;

    refreshLiveMapData();
    const interval = setInterval(refreshLiveMapData, LIVE_MAP_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeTab, showMapModal]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasApprovedVisitWindow = (visitor) => {
    if (!visitor) return false;
    const appointmentStatus = String(visitor.appointmentStatus || "").toLowerCase();
    const approvalStatus = String(visitor.approvalStatus || "").toLowerCase();

    if (visitor.requestCategory === "appointment") {
      return approvalStatus === "approved" && ["approved", "adjusted"].includes(appointmentStatus);
    }

    return approvalStatus === "approved";
  };

  const getStatusBadge = (visitor) => {
    if (visitor.status === 'checked_in') {
      return { bg: '#EEF5FF', text: '#0A3D91', label: 'CHECKED IN' };
    } else if (visitor.status === 'checked_out') {
      return { bg: '#F3F4F6', text: '#6B7280', label: 'CHECKED OUT' };
    } else if (visitor.appointmentStatus === 'rejected' || visitor.approvalStatus === 'rejected') {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'REJECTED' };
    } else if (
      visitor.appointmentStatus === 'pending' ||
      (!visitor.appointmentStatus && visitor.approvalStatus === 'pending')
    ) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'PENDING' };
    } else if (hasApprovedVisitWindow(visitor)) {
      return { bg: '#EEF5FF', text: '#1C6DD0', label: 'APPROVED' };
    }
    return { bg: '#F3F4F6', text: '#6B7280', label: 'UNKNOWN' };
  };

  const isVisitorProcessing = (visitorId) => processingVisitorId === visitorId;

  // ============ VISITOR MANAGEMENT ============
  const handleRegisterVisitor = () => {
    setNewVisitor({
      fullName: "",
      phoneNumber: "",
      email: "",
      idNumber: "",
      purposeOfVisit: "",
      host: "",
      assignedOffice: "",
      visitDate: new Date(),
      visitTime: new Date(),
      vehicleNumber: "",
      idPhotoUri: null,
      idPhotoBase64: null,
    });
    setShowVisitorModal(true);
  };

  const pickIdImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setNewVisitor({
          ...newVisitor,
          idPhotoUri: result.assets[0].uri,
          idPhotoBase64: result.assets[0].base64,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takeIdPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setNewVisitor({
          ...newVisitor,
          idPhotoUri: result.assets[0].uri,
          idPhotoBase64: result.assets[0].base64,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const submitVisitor = async () => {
    const normalizedFullName = String(newVisitor.fullName || "").trim();
    const normalizedPhone = String(newVisitor.phoneNumber || "").trim();
    const normalizedEmail = String(newVisitor.email || "").trim().toLowerCase();
    const normalizedIdNumber = String(newVisitor.idNumber || "").trim();
    const normalizedPurpose = String(newVisitor.purposeOfVisit || "").trim();
    const normalizedHost = String(newVisitor.host || "").trim();
    const normalizedOffice = String(newVisitor.assignedOffice || "").trim();

    if (
      !normalizedFullName ||
      !normalizedPurpose ||
      !normalizedHost ||
      !normalizedPhone ||
      !normalizedEmail ||
      !normalizedIdNumber
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid visitor email address.");
      return;
    }

    if (!isValidPhilippineMobileNumber(normalizedPhone)) {
      Alert.alert("Invalid Contact Number", PHILIPPINE_MOBILE_NUMBER_MESSAGE);
      return;
    }

    if (!newVisitor.idPhotoUri) {
      Alert.alert("Error", "Please upload a photo of the visitor's ID");
      return;
    }

    const visitDate = new Date(newVisitor.visitDate);
    const visitTime = new Date(newVisitor.visitTime);
    const visitSchedule = new Date(visitDate);
    visitSchedule.setHours(visitTime.getHours(), visitTime.getMinutes(), 0, 0);

    if (Number.isNaN(visitSchedule.getTime())) {
      Alert.alert("Invalid Schedule", "Please choose a valid visit date and time.");
      return;
    }

    if (visitSchedule < new Date(Date.now() - 60 * 1000)) {
      Alert.alert("Invalid Schedule", "Visit schedule cannot be in the past.");
      return;
    }

    setIsSubmitting(true);

    try {
      const visitorData = {
        fullName: normalizedFullName,
        phoneNumber: normalizePhilippineMobileNumber(normalizedPhone),
        email: normalizedEmail,
        idNumber: normalizedIdNumber,
        purposeOfVisit: normalizedPurpose,
        host: normalizedHost,
        assignedOffice: normalizedOffice,
        visitDate,
        visitTime: visitSchedule,
        vehicleNumber: String(newVisitor.vehicleNumber || "").trim(),
        idImage: newVisitor.idPhotoBase64 ? `data:image/jpeg;base64,${newVisitor.idPhotoBase64}` : null,
        registeredBy: user._id,
        registeredByName: `${user.firstName} ${user.lastName}`,
      };

      const response = await ApiService.registerVisitorWithNotification(visitorData);
      
      if (response.success) {
        setShowVisitorModal(false);
        await refreshData();
        Alert.alert("Success", "Visitor registered successfully");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to register visitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (visitor) => {
    if (isVisitorProcessing(visitor._id)) {
      return;
    }

    if (!hasApprovedVisitWindow(visitor)) {
      Alert.alert("Approval Required", `${visitor.fullName} does not have an approved visit window yet.`);
      return;
    }

    if (visitor.status === 'checked_in') {
      Alert.alert("Already Checked In", `${visitor.fullName} is already checked in.`);
      return;
    }

    if (visitor.status === 'checked_out') {
      Alert.alert("Visit Completed", `${visitor.fullName} has already checked out.`);
      return;
    }

    try {
      setProcessingVisitorId(visitor._id);
      const response = await ApiService.securityCheckIn(visitor._id);
      if (response.success) {
        await refreshData();
        Alert.alert("Success", `${visitor.fullName} checked in successfully`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to check in visitor");
    } finally {
      setProcessingVisitorId(null);
    }
  };

  const handleCheckOut = async (visitor) => {
    if (isVisitorProcessing(visitor._id)) {
      return;
    }

    if (visitor.status !== 'checked_in') {
      Alert.alert("Check-in Required", `${visitor.fullName} must be checked in before checkout.`);
      return;
    }

    const performCheckOut = async () => {
      try {
        setProcessingVisitorId(visitor._id);
        const response = await ApiService.securityCheckOut(visitor._id);
        if (response.success) {
          await refreshData();
          Alert.alert("Success", `${visitor.fullName} checked out successfully`);
        }
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to check out visitor");
      } finally {
        setProcessingVisitorId(null);
      }
    };

    if (Platform.OS === "web") {
      await performCheckOut();
      return;
    }

    Alert.alert(
      "Confirm Check-out",
      `Check out ${visitor.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          onPress: performCheckOut
        }
      ]
    );
  };

  const handleReportVisitor = (visitor) => {
    Alert.alert(
      "Report Visitor",
      "Select reason for reporting:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Suspicious Behavior", onPress: () => submitReport(visitor, "suspicious") },
        { text: "Overstayed", onPress: () => submitReport(visitor, "overstayed") },
        { text: "Violation", onPress: () => submitReport(visitor, "violation") },
        { text: "Other", onPress: () => submitReport(visitor, "other") },
      ]
    );
  };

  const submitReport = async (visitor, reason) => {
    try {
      await ApiService.reportVisitor(visitor._id, { reason, reportedBy: user._id });
      await refreshData();
      Alert.alert("Report Submitted", "Security team has been notified");
    } catch (error) {
      Alert.alert("Error", "Failed to submit report");
    }
  };

  const submitSecurityReportForm = async () => {
    if (!reportForm.visitorId) {
      Alert.alert("Visitor Required", "Please choose a checked-in visitor for this report.");
      return;
    }

    if (!reportForm.details.trim()) {
      Alert.alert("Report Details Required", "Please add a short report description before submitting.");
      return;
    }

    const visitor = visitors.active.find((entry) => String(entry._id) === String(reportForm.visitorId));
    if (!visitor?._id) {
      Alert.alert("Visitor Not Inside", "Only visitors who are currently checked in can be reported.");
      return;
    }

    try {
      setIsSubmitting(true);
      const reason = `${reportForm.category}: ${reportForm.details.trim()}`;
      await ApiService.reportVisitor(visitor._id, { reason, reportedBy: user._id });
      await refreshData();
      setReportForm({
        visitorId: '',
        category: 'suspicious',
        details: '',
      });
      Alert.alert("Report Submitted", "The security report has been filed successfully.");
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to submit security report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setShowDetailModal(true);
  };

  // ============ NOTIFICATION FUNCTIONS ============
  const markAsRead = async (notification) => {
    try {
      await ApiService.markNotificationAsRead(notification._id);
      await loadNotifications();
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleResolveAlert = async (alert) => {
    if (!alert?._id || resolvingAlertId === alert._id) {
      return;
    }

    try {
      setResolvingAlertId(alert._id);
      const result = await ApiService.resolveAlert(alert._id);
      if (!result?.success) {
        throw new Error("Failed to resolve alert");
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === alert._id ? { ...item, read: true } : item
        )
      );
      setAlerts((current) => current.filter((item) => item._id !== alert._id));
      setUnreadCount((current) => Math.max(0, current - 1));
      setDashboardStats((current) => ({
        ...current,
        activeAlerts: Math.max(0, current.activeAlerts - 1),
      }));
    } catch (error) {
      console.error("Resolve alert error:", error);
      Alert.alert("Error", "Failed to resolve alert. Please try again.");
    } finally {
      setResolvingAlertId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  // ============ RENDER FUNCTIONS FOR EACH TAB ============

  // Filter visitors based on search and filter
  const filteredVisitors = useMemo(() => {
    let list = [];
    
    switch(visitorFilter) {
      case 'active':
        list = visitors.active;
        break;
      case 'pending':
        list = visitors.pending;
        break;
      case 'approved':
        list = visitors.approved;
        break;
      case 'completed':
        list = visitors.completed;
        break;
      default:
        list = visitors.all;
        break;
    }
    
    if (!searchQuery) return list;

    return list.filter(v => 
      v.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phoneNumber?.includes(searchQuery) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.purposeOfVisit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.host?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visitorFilter, visitors, searchQuery]);

  const appointmentRecordsItemsPerPage = 6;
  const appointmentRecordsPageCount = Math.max(
    1,
    Math.ceil(filteredVisitors.length / appointmentRecordsItemsPerPage),
  );
  const paginatedAppointmentRecords = useMemo(() => {
    const startIndex = (appointmentRecordsPage - 1) * appointmentRecordsItemsPerPage;
    return filteredVisitors.slice(startIndex, startIndex + appointmentRecordsItemsPerPage);
  }, [filteredVisitors, appointmentRecordsPage]);

  const reportsItemsPerPage = 6;
  const reportsPageCount = Math.max(1, Math.ceil(reports.length / reportsItemsPerPage));
  const paginatedReports = useMemo(() => {
    const startIndex = (reportsPage - 1) * reportsItemsPerPage;
    return reports.slice(startIndex, startIndex + reportsItemsPerPage);
  }, [reports, reportsPage]);

  useEffect(() => {
    setAppointmentRecordsPage(1);
  }, [visitorFilter, searchQuery]);

  useEffect(() => {
    setAppointmentRecordsPage((currentPageValue) => Math.min(currentPageValue, appointmentRecordsPageCount));
  }, [appointmentRecordsPageCount]);

  useEffect(() => {
    setReportsPage((currentPageValue) => Math.min(currentPageValue, reportsPageCount));
  }, [reportsPageCount]);

  const renderAppointmentPagination = () => (
    <View style={styles.appointmentRecordsPaginationRow}>
      <Text style={styles.appointmentRecordsPaginationInfo}>
        Page {appointmentRecordsPage} of {appointmentRecordsPageCount} • {filteredVisitors.length} records
      </Text>
      <View style={styles.appointmentRecordsPaginationActions}>
        <TouchableOpacity
          style={[
            styles.appointmentRecordsPaginationButton,
            appointmentRecordsPage === 1 && styles.appointmentRecordsPaginationButtonDisabled,
          ]}
          onPress={() => setAppointmentRecordsPage((currentValue) => Math.max(1, currentValue - 1))}
          disabled={appointmentRecordsPage === 1}
        >
          <Ionicons
            name="chevron-back-outline"
            size={14}
            color={appointmentRecordsPage === 1 ? "#94A3B8" : "#334155"}
          />
          <Text
            style={[
              styles.appointmentRecordsPaginationButtonText,
              appointmentRecordsPage === 1 && styles.appointmentRecordsPaginationButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.appointmentRecordsPaginationButton,
            appointmentRecordsPage === appointmentRecordsPageCount &&
              styles.appointmentRecordsPaginationButtonDisabled,
          ]}
          onPress={() =>
            setAppointmentRecordsPage((currentValue) =>
              Math.min(appointmentRecordsPageCount, currentValue + 1),
            )
          }
          disabled={appointmentRecordsPage === appointmentRecordsPageCount}
        >
          <Text
            style={[
              styles.appointmentRecordsPaginationButtonText,
              appointmentRecordsPage === appointmentRecordsPageCount &&
                styles.appointmentRecordsPaginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={14}
            color={appointmentRecordsPage === appointmentRecordsPageCount ? "#94A3B8" : "#334155"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSecurityTablePagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemLabel,
    onPrevious,
    onNext,
  }) => (
    <View style={styles.appointmentRecordsPaginationRow}>
      <Text style={styles.appointmentRecordsPaginationInfo}>
        Page {currentPage} of {totalPages} • {totalItems} {itemLabel}
      </Text>
      <View style={styles.appointmentRecordsPaginationActions}>
        <TouchableOpacity
          style={[
            styles.appointmentRecordsPaginationButton,
            currentPage === 1 && styles.appointmentRecordsPaginationButtonDisabled,
          ]}
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
              styles.appointmentRecordsPaginationButtonText,
              currentPage === 1 && styles.appointmentRecordsPaginationButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.appointmentRecordsPaginationButton,
            currentPage === totalPages && styles.appointmentRecordsPaginationButtonDisabled,
          ]}
          onPress={onNext}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.appointmentRecordsPaginationButtonText,
              currentPage === totalPages && styles.appointmentRecordsPaginationButtonTextDisabled,
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

  // Render Dashboard Tab
  const renderDashboardTab = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
      }
    >
      <View style={styles.dashboardShell}>
      <View style={styles.securityHeroSection}>
        <LinearGradient
          colors={['#041E42', '#0A3D91', '#1C6DD0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.securityHeroCard}
        >
          <View style={styles.securityHeroTop}>
            <View style={styles.securityHeroBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#D8E8FF" />
              <Text style={styles.securityHeroBadgeText}>Security Operations Center</Text>
            </View>
            <View style={styles.securityHeroShiftBadge}>
              <Text style={styles.securityHeroShiftText}>On Duty</Text>
            </View>
          </View>

          <Text style={styles.securityHeroTitle}>Keep campus access moving safely and visibly.</Text>
          <Text style={styles.securityHeroSubtitle}>
            Track approved visitors, monitor live movement, and respond to alerts from one command workspace.
          </Text>

          <View style={styles.securityHeroStats}>
            <View style={styles.securityHeroStatCard}>
              <Text style={styles.securityHeroStatValue}>{visitorStats.activeNow}</Text>
              <Text style={styles.securityHeroStatLabel}>Active Visitors</Text>
            </View>
            <View style={styles.securityHeroStatCard}>
              <Text style={styles.securityHeroStatValue}>{visitorStats.totalToday}</Text>
              <Text style={styles.securityHeroStatLabel}>Today's Visits</Text>
            </View>
            <View style={styles.securityHeroStatCard}>
              <Text style={styles.securityHeroStatValue}>{unreadCount}</Text>
              <Text style={styles.securityHeroStatLabel}>Unread Alerts</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.securityHeroSideCards}>
          <View style={styles.securityHeroSideCard}>
            <View style={[styles.securityHeroSideIcon, { backgroundColor: '#EEF5FF' }]}>
              <Ionicons name="people-circle-outline" size={18} color="#0A3D91" />
            </View>
            <Text style={styles.securityHeroSideValue}>{dashboardStats.activeUsers}</Text>
            <Text style={styles.securityHeroSideLabel}>On-Site Now</Text>
            <Text style={styles.securityHeroSideMeta}>{visitorStats.pendingApproval} awaiting admin review</Text>
          </View>

          <View style={styles.securityHeroSideCard}>
            <View style={[styles.securityHeroSideIcon, { backgroundColor: '#EEF5FF' }]}>
              <Ionicons name="document-text-outline" size={18} color="#1C6DD0" />
            </View>
            <Text style={styles.securityHeroSideValue}>{reports.length}</Text>
            <Text style={styles.securityHeroSideLabel}>Reports Logged</Text>
            <Text style={styles.securityHeroSideMeta}>{alerts.length} security alert{alerts.length === 1 ? '' : 's'} tracked</Text>
          </View>
        </View>
      </View>

      <View style={styles.securityWorkspaceGrid}>
        {/* Live Operations Queue */}
        <View style={[styles.securityPanelCard, styles.securityWorkspacePrimary]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="pulse-outline" size={20} color="#10B981" />
              <View>
                <Text style={styles.sectionTitle}>Live Operations Queue</Text>
                <Text style={styles.securitySectionSubtitle}>Monitor active visitors and recent status changes without the campus map.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => selectGuardSubmodule('appointment-records')}>
              <Text style={styles.viewAll}>Open Records</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.securityMiniStats}>
            <View style={styles.securityMiniStatCard}>
              <Text style={styles.securityMiniStatValue}>{visitors.active.length}</Text>
              <Text style={styles.securityMiniStatLabel}>Checked In</Text>
            </View>
            <View style={styles.securityMiniStatCard}>
              <Text style={styles.securityMiniStatValue}>{visitors.approved.length}</Text>
              <Text style={styles.securityMiniStatLabel}>Approved</Text>
            </View>
            <View style={styles.securityMiniStatCard}>
              <Text style={styles.securityMiniStatValue}>{visitors.pending.length}</Text>
              <Text style={styles.securityMiniStatLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.activityList}>
            {[...visitors.active, ...visitors.approved].slice(0, 6).map((visitor, index) => (
              <TouchableOpacity
                key={visitor._id || `${visitor.email}-${index}`}
                style={styles.activityItem}
                onPress={() => handleViewDetails(visitor)}
              >
                <View style={[styles.activityIcon, {
                  backgroundColor: visitor.status === 'checked_in' ? '#EEF5FF' : '#EEF5FF',
                }]}>
                  <Ionicons
                    name={visitor.status === 'checked_in' ? 'log-in-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={visitor.status === 'checked_in' ? '#0A3D91' : '#0A3D91'}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{visitor.fullName}</Text>
                  <Text style={styles.activityLocation}>
                    {visitor.status === 'checked_in' ? 'Currently on site' : 'Ready for arrival'} • {visitor.assignedOffice || visitor.host || 'Campus access'}
                  </Text>
                </View>
                <Text style={styles.activityTime}>
                  {formatTime(visitor.checkedInAt || visitor.visitTime)}
                </Text>
              </TouchableOpacity>
            ))}

            {[...visitors.active, ...visitors.approved].length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="pulse-outline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No live visitor activity</Text>
                <Text style={styles.emptyStateSubtitle}>Approved arrivals and active check-ins will appear here automatically.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Operations Overview */}
        <View style={[styles.securityPanelCard, styles.securityWorkspaceSecondary]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="clipboard-outline" size={20} color="#10B981" />
              <View>
                <Text style={styles.sectionTitle}>Operations Snapshot</Text>
                <Text style={styles.securitySectionSubtitle}>A quick read of approved, pending, and completed visits.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => {
              setVisitorFilter('all');
              selectGuardSubmodule('appointment-records');
            }}>
              <Text style={styles.viewAll}>Appointment Records</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reportStatsGrid}>
            <View style={styles.reportStatCard}>
              <Text style={styles.reportStatValue}>{visitors.approved.length}</Text>
              <Text style={styles.reportStatLabel}>Approved Visits</Text>
            </View>
            <View style={styles.reportStatCard}>
              <Text style={styles.reportStatValue}>{visitors.pending.length}</Text>
              <Text style={styles.reportStatLabel}>Pending Review</Text>
            </View>
            <View style={styles.reportStatCard}>
              <Text style={styles.reportStatValue}>{visitors.completed.length}</Text>
              <Text style={styles.reportStatLabel}>Completed Today</Text>
            </View>
          </View>

          <View style={styles.activityList}>
            {analytics.mostVisitedOffices.slice(0, 3).map((office, index) => (
              <View key={office.office || index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#EEF5FF' }]}>
                  <Ionicons name="business-outline" size={16} color="#0A3D91" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{office.office}</Text>
                  <Text style={styles.activityLocation}>{office.count} scheduled visit{office.count === 1 ? '' : 's'}</Text>
                </View>
                <Text style={styles.activityTime}>{office.percentage}%</Text>
              </View>
            ))}

            {analytics.mostVisitedOffices.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No Office Traffic Yet</Text>
                <Text style={styles.emptyStateSubtitle}>Visitor assignments will appear here once registrations come in</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Command Actions */}
      <View style={styles.quickActionsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flash-outline" size={20} color="#F59E0B" />
            <View>
              <Text style={styles.sectionTitle}>Command Actions</Text>
              <Text style={styles.securitySectionSubtitle}>Fast access to the guard tools used during daily operations.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.securityCommandGrid}>
          <TouchableOpacity style={styles.securityCommandCard} onPress={() => selectGuardSubmodule('appointment-records')}>
            <View style={[styles.securityCommandIcon, { backgroundColor: '#EEF5FF' }]}>
              <Ionicons name="reader-outline" size={24} color="#0A3D91" />
            </View>
            <View style={styles.securityCommandCopy}>
              <Text style={styles.securityCommandTitle}>Appointment Records</Text>
              <Text style={styles.securityCommandSubtitle}>Review approved appointments, check-ins, and completed visits.</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityCommandCard} onPress={() => selectGuardSubmodule('report-file')}>
            <View style={[styles.securityCommandIcon, { backgroundColor: '#EEF5FF' }]}>
              <Ionicons name="flag-outline" size={24} color="#0A3D91" />
            </View>
            <View style={styles.securityCommandCopy}>
              <Text style={styles.securityCommandTitle}>File a Report</Text>
              <Text style={styles.securityCommandSubtitle}>Submit incidents, overstays, or security observations.</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityCommandCard} onPress={() => selectGuardSubmodule('map-ground')}>
            <View style={[styles.securityCommandIcon, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="map-outline" size={24} color="#0A3D91" />
            </View>
            <View style={styles.securityCommandCopy}>
              <Text style={styles.securityCommandTitle}>Monitoring Map</Text>
              <Text style={styles.securityCommandSubtitle}>Track checked-in visitors by floor and assigned office.</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Alerts Section */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
              <Text style={styles.sectionTitle}>Security Alerts</Text>
            </View>
            <TouchableOpacity onPress={() => selectGuardSubmodule('report-file')}>
              <Text style={styles.viewAllLink}>Open Reports</Text>
            </TouchableOpacity>
          </View>

          {alerts.slice(0, 3).map((alert, index) => (
            <View key={alert._id || index} style={[styles.alertItem, { 
              borderLeftColor: alert.severity === 'high' ? '#DC2626' : 
                              alert.severity === 'medium' ? '#F59E0B' : '#10B981' 
            }]}>
              <View style={styles.alertIcon}>
                <Ionicons 
                  name={alert.severity === 'high' ? "warning" : 
                        alert.severity === 'medium' ? "alert-circle" : "information-circle"} 
                  size={20} 
                  color={alert.severity === 'high' ? '#DC2626' : 
                         alert.severity === 'medium' ? '#F59E0B' : '#10B981'} 
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{formatTime(alert.createdAt)}</Text>
              </View>
              <View style={[styles.alertSeverity, { 
                backgroundColor: alert.severity === 'high' ? '#FEE2E2' : 
                               alert.severity === 'medium' ? '#FEF3C7' : '#EEF5FF' 
              }]}>
                <Text style={[styles.alertSeverityText, { 
                  color: alert.severity === 'high' ? '#DC2626' : 
                         alert.severity === 'medium' ? '#F59E0B' : '#10B981' 
                }]}>
                  {alert.severity?.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
      </View>
    </ScrollView>
  );

  // Render Map Tab
  const renderMapTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.mapSectionFull}>
        <SharedMonitoringMap
          title="Live Visitor Tracking Map"
          iconName="map-outline"
          iconColor="#10B981"
          actionLabel="Full Screen"
          onActionPress={() => setShowMapModal(true)}
          controls={renderMapFilters()}
          visitors={getFilteredVisitorLocations()}
          floors={floors}
          offices={offices}
          selectedFloor={selectedFloor}
          selectedOffice={selectedOffice}
          mapBlueprints={mapBlueprints}
          officePositions={officePositions}
          onFloorChange={(floorId) => {
            setSelectedFloor(floorId);
            setSelectedOffice('all');
          }}
          onVisitorHover={handleVisitorHover}
          onVisitorLeave={handleVisitorLeave}
          onVisitorSelect={handleVisitorSelect}
          hoveredVisitor={hoveredVisitor}
          renderHoverCard={renderHoverCard}
          backgroundColor="#FFFFFF"
          borderColor="#E5E7EB"
          summaryItems={[
            { label: "Live", value: getFilteredVisitorLocations().length || 0, color: "#10B981" },
            { label: "Approved", value: visitors.approved.length || 0, color: "#0A3D91" },
            { label: "Checked In", value: visitors.active.length || 0, color: "#F59E0B" },
          ]}
          statusLabel="Security monitoring"
          showFloorNavigation={false}
        />
      </View>
    </ScrollView>
  );

  // Render Visitors Tab
  const renderVisitorsTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.visitorsContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="calendar-outline" size={20} color="#0A3D91" />
            <View>
              <Text style={styles.sectionTitle}>Appointment Records</Text>
              <Text style={styles.securitySectionSubtitle}>
                Security can review appointment records here in a read-only view.
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'active', 'approved', 'completed'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, visitorFilter === filter && styles.filterTabActive]}
              onPress={() => {
                setVisitorFilter(filter);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.filterTabText, visitorFilter === filter && styles.filterTabTextActive]}>
                {filter === 'completed' ? 'Completed' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'active' && ` (${visitors.active.length})`}
                {filter === 'approved' && ` (${visitors.approved.length})`}
                {filter === 'completed' && ` (${visitors.completed.length})`}
                {filter === 'all' && ` (${visitors.all.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search visitors by name, phone, email, purpose, or host..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.readonlyInfoBanner}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0A3D91" />
          <Text style={styles.readonlyInfoBannerText}>
            This section is view-only for guards. Open a record to inspect appointment details.
          </Text>
        </View>

        {/* Appointment Records Table */}
        {filteredVisitors.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.appointmentRecordsTable}>
              <View style={[styles.appointmentRecordsTableRow, styles.appointmentRecordsTableHeader]}>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsVisitorCell]}>Visitor</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsPurposeCell]}>Purpose</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsOfficeCell]}>Office / Host</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsScheduleCell]}>Schedule</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsContactCell]}>Contact</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsStatusCell]}>Status</Text>
                <Text style={[styles.appointmentRecordsHeaderCell, styles.appointmentRecordsActionCell]}>Action</Text>
              </View>
              {paginatedAppointmentRecords.map((visitor) => renderAppointmentRecordRow(visitor))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No appointment records found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : visitorFilter === 'completed'
                  ? 'No completed appointments are available in the last 30 days'
                  : 'No appointment records in this category'}
            </Text>
          </View>
        )}

        {filteredVisitors.length > 0 ? renderAppointmentPagination() : null}
      </View>
    </ScrollView>
  );

  // Render Alerts Tab
  const renderAlertsTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.alertsContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Security Alerts</Text>
          </View>
          <TouchableOpacity onPress={refreshData}>
            <Ionicons name="refresh-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <View key={alert._id} style={[styles.alertCard, { 
              borderLeftColor: alert.severity === 'high' ? '#DC2626' : 
                              alert.severity === 'medium' ? '#F59E0B' : '#10B981',
              borderLeftWidth: 4,
            }]}>
              <View style={styles.alertCardHeader}>
                <View style={styles.alertCardIcon}>
                  <Ionicons 
                    name={alert.severity === 'high' ? "warning" : 
                          alert.severity === 'medium' ? "alert-circle" : "information-circle"} 
                    size={24} 
                    color={alert.severity === 'high' ? '#DC2626' : 
                           alert.severity === 'medium' ? '#F59E0B' : '#10B981'} 
                  />
                </View>
                <View style={styles.alertCardContent}>
                  <Text style={styles.alertCardTitle}>{alert.title || 'Security Alert'}</Text>
                  <Text style={styles.alertCardMessage}>{alert.message}</Text>
                  <Text style={styles.alertCardTime}>{formatDateTime(alert.createdAt)}</Text>
                </View>
              </View>
              {!alert.resolved && (
                <TouchableOpacity 
                  style={styles.resolveButton}
                  onPress={() => handleResolveAlert(alert)}
                  disabled={resolvingAlertId === alert._id}
                >
                  {resolvingAlertId === alert._id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Active Alerts</Text>
            <Text style={styles.emptyStateSubtitle}>All systems are operating normally</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render Access Logs Tab
  const renderLogsTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.logsContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="time-outline" size={20} color="#0A3D91" />
            <Text style={styles.sectionTitle}>Access Logs</Text>
          </View>
          <TouchableOpacity onPress={() => { setLogsPage(1); loadAccessLogs(); }}>
            <Ionicons name="refresh-outline" size={20} color="#0A3D91" />
          </TouchableOpacity>
        </View>

        <View style={styles.logsList}>
          {accessLogs.map((log) => (
            <View key={log._id} style={styles.logItem}>
              <View style={[styles.logIcon, { 
                backgroundColor: log.status === 'granted' ? '#EEF5FF' : '#FEE2E2' 
              }]}>
                <Ionicons 
                  name={log.status === 'granted' ? "checkmark" : "close"} 
                  size={16} 
                  color={log.status === 'granted' ? '#0A3D91' : '#DC2626'} 
                />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>{log.userName || 'Unknown User'}</Text>
                <Text style={styles.logDetail}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" /> {log.location || 'Unknown Location'}
                </Text>
                {log.visitorId && (
                  <Text style={styles.logDetail}>
                    <Ionicons name="person-outline" size={12} color="#9CA3AF" /> {log.visitorId}
                  </Text>
                )}
              </View>
              <Text style={styles.logTime}>{formatDateTime(log.timestamp)}</Text>
            </View>
          ))}
        </View>

        {accessLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Access Logs</Text>
            <Text style={styles.emptyStateSubtitle}>Access records will appear here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render Reports Tab
  const renderReportsTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.reportsContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="document-text-outline" size={20} color="#1C6DD0" />
            <View>
              <Text style={styles.sectionTitle}>File a Report</Text>
              <Text style={styles.securitySectionSubtitle}>Submit a guard report, then review the most recent filed incidents below.</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={refreshData}
          >
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportFormCard}>
          <Text style={styles.reportFormTitle}>New Security Report</Text>
          <Text style={styles.reportFormSubtitle}>
            Select a checked-in visitor and describe the incident for admin follow-up.
          </Text>

          <View style={styles.reportFormLabelRow}>
            <Text style={styles.reportFormLabel}>Checked-In Visitor</Text>
            <Text style={styles.reportFormHint}>{visitors.active.length} inside facility</Text>
          </View>

          {visitors.active.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.reportVisitorTable}>
                <View style={[styles.reportVisitorTableRow, styles.reportVisitorTableHeader]}>
                  <Text style={[styles.reportVisitorHeaderCell, styles.reportVisitorNameCell]}>Visitor</Text>
                  <Text style={[styles.reportVisitorHeaderCell, styles.reportVisitorOfficeCell]}>Office</Text>
                  <Text style={[styles.reportVisitorHeaderCell, styles.reportVisitorCheckInCell]}>Checked In</Text>
                  <Text style={[styles.reportVisitorHeaderCell, styles.reportVisitorContactCell]}>Contact</Text>
                </View>

                {visitors.active.map((visitor) => {
                  const isSelected = String(reportForm.visitorId) === String(visitor._id);

                  return (
                    <TouchableOpacity
                      key={visitor._id}
                      style={[
                        styles.reportVisitorTableRow,
                        isSelected && styles.reportVisitorTableRowSelected,
                      ]}
                      onPress={() => setReportForm((currentValue) => ({ ...currentValue, visitorId: visitor._id }))}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.reportVisitorCell, styles.reportVisitorNameCell]}>
                        <View style={[styles.reportVisitorSelectDot, isSelected && styles.reportVisitorSelectDotActive]}>
                          {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                        </View>
                        <View style={styles.reportVisitorInfo}>
                          <Text style={styles.reportVisitorPrimaryText} numberOfLines={1}>
                            {visitor.fullName || 'Unnamed Visitor'}
                          </Text>
                          <Text style={styles.reportVisitorMutedText} numberOfLines={1}>
                            ID: {visitor.idNumber || 'Not provided'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.reportVisitorCell, styles.reportVisitorOfficeCell]}>
                        <Text style={styles.reportVisitorPrimaryText} numberOfLines={1}>
                          {visitor.assignedOffice || visitor.appointmentDepartment || 'Campus access'}
                        </Text>
                      </View>

                      <View style={[styles.reportVisitorCell, styles.reportVisitorCheckInCell]}>
                        <Text style={styles.reportVisitorMutedText} numberOfLines={1}>
                          {formatTime(visitor.checkedInAt)}
                        </Text>
                      </View>

                      <View style={[styles.reportVisitorCell, styles.reportVisitorContactCell]}>
                        <Text style={styles.reportVisitorPrimaryText} numberOfLines={1}>
                          {visitor.phoneNumber || 'No phone'}
                        </Text>
                        <Text style={styles.reportVisitorMutedText} numberOfLines={1}>
                          {visitor.email || 'No email'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.reportVisitorEmptyState}>
              <Ionicons name="log-in-outline" size={28} color="#94A3B8" />
              <Text style={styles.reportVisitorEmptyTitle}>No visitors inside</Text>
              <Text style={styles.reportVisitorEmptyText}>
                A visitor must be checked in before security can file a report for them.
              </Text>
            </View>
          )}

          <Text style={styles.reportFormLabel}>Category</Text>
          <View style={styles.reportCategoryRow}>
            {[
              { key: 'suspicious', label: 'Suspicious' },
              { key: 'overstayed', label: 'Overstayed' },
              { key: 'violation', label: 'Violation' },
              { key: 'other', label: 'Other' },
            ].map((option) => {
              const isActive = reportForm.category === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.reportCategoryChip, isActive && styles.reportCategoryChipActive]}
                  onPress={() => setReportForm((currentValue) => ({ ...currentValue, category: option.key }))}
                >
                  <Text style={[styles.reportCategoryChipText, isActive && styles.reportCategoryChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.reportFormLabel}>Details</Text>
          <TextInput
            style={styles.reportFormInput}
            placeholder="Describe what happened..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={reportForm.details}
            onChangeText={(text) => setReportForm((currentValue) => ({ ...currentValue, details: text }))}
          />

          <View style={styles.reportFormActions}>
            <TouchableOpacity
              style={styles.reportFormSecondaryButton}
              onPress={() => setReportForm({ visitorId: '', category: 'suspicious', details: '' })}
            >
              <Text style={styles.reportFormSecondaryButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportFormPrimaryButton}
              onPress={submitSecurityReportForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.reportFormPrimaryButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Stats Cards */}
        <View style={styles.reportStatsGrid}>
          <View style={styles.reportStatCard}>
            <Text style={styles.reportStatValue}>{visitorStats.totalToday}</Text>
            <Text style={styles.reportStatLabel}>Today's Visitors</Text>
          </View>
          <View style={styles.reportStatCard}>
            <Text style={styles.reportStatValue}>{visitorStats.totalThisWeek}</Text>
            <Text style={styles.reportStatLabel}>This Week</Text>
          </View>
          <View style={styles.reportStatCard}>
            <Text style={styles.reportStatValue}>{visitorStats.totalThisMonth}</Text>
            <Text style={styles.reportStatLabel}>This Month</Text>
          </View>
        </View>

        {/* Most Visited Offices */}
        {analytics.mostVisitedOffices.length > 0 && (
          <View style={styles.reportSection}>
            <Text style={styles.reportSectionTitle}>Most Visited Offices</Text>
            {analytics.mostVisitedOffices.map((office, index) => (
              <View key={index} style={styles.reportItem}>
                <Text style={styles.reportRank}>{index + 1}</Text>
                <Text style={styles.reportName}>{office.office}</Text>
                <Text style={styles.reportCount}>{office.count} visits</Text>
                <View style={styles.reportBar}>
                  <View style={[styles.reportBarFill, { width: `${office.percentage}%` }]} />
                </View>
                <Text style={styles.reportPercentage}>{office.percentage}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Reports */}
        {reports.length > 0 && (
          <View style={styles.reportSection}>
            <Text style={styles.reportSectionTitle}>Recent Reports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.securityReportsTable}>
                <View style={[styles.securityReportsTableRow, styles.securityReportsTableHeader]}>
                  <Text style={[styles.securityReportsHeaderCell, styles.securityReportsIncidentCell]}>Incident</Text>
                  <Text style={[styles.securityReportsHeaderCell, styles.securityReportsVisitorCell]}>Visitor</Text>
                  <Text style={[styles.securityReportsHeaderCell, styles.securityReportsDateCell]}>Filed Date</Text>
                  <Text style={[styles.securityReportsHeaderCell, styles.securityReportsStatusCell]}>Status</Text>
                </View>
                {paginatedReports.map((report) => {
                  const isResolved = String(report.status || '').toLowerCase() === 'resolved';

                  return (
                    <View key={report._id} style={styles.securityReportsTableRow}>
                      <View style={[styles.securityReportsCell, styles.securityReportsIncidentCell]}>
                        <View style={styles.securityReportsIncidentIcon}>
                          <Ionicons name="flag-outline" size={16} color="#DC2626" />
                        </View>
                        <Text style={styles.securityReportsPrimaryText} numberOfLines={2}>
                          {report.reason || 'Security incident'}
                        </Text>
                      </View>

                      <View style={[styles.securityReportsCell, styles.securityReportsVisitorCell]}>
                        <Text style={styles.securityReportsPrimaryText} numberOfLines={1}>
                          {report.visitorName || 'Unknown visitor'}
                        </Text>
                      </View>

                      <View style={[styles.securityReportsCell, styles.securityReportsDateCell]}>
                        <Text style={styles.securityReportsMutedText} numberOfLines={1}>
                          {formatDate(report.createdAt)}
                        </Text>
                      </View>

                      <View style={[styles.securityReportsCell, styles.securityReportsStatusCell]}>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: isResolved ? '#EEF5FF' : '#FEF3C7' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: isResolved ? '#0A3D91' : '#B45309' },
                            ]}
                          >
                            {report.status || 'Open'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            {renderSecurityTablePagination({
              currentPage: reportsPage,
              totalPages: reportsPageCount,
              totalItems: reports.length,
              itemLabel: "reports",
              onPrevious: () => setReportsPage((currentValue) => Math.max(1, currentValue - 1)),
              onNext: () => setReportsPage((currentValue) => Math.min(reportsPageCount, currentValue + 1)),
            })}
          </View>
        )}

        {reports.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Security Reports</Text>
            <Text style={styles.emptyStateSubtitle}>Reported visitor incidents will appear here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render Map Filters
  const renderMapFilters = () => (
    <View style={styles.mapFilters}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Floor:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {floors.map((floor) => (
            <TouchableOpacity
              key={floor.id}
              style={[styles.filterChip, selectedFloor === floor.id && styles.filterChipActive]}
              onPress={() => {
                setSelectedFloor(floor.id);
                setSelectedOffice('all');
              }}
            >
              <Ionicons name={floor.icon} size={16} color={selectedFloor === floor.id ? "#FFFFFF" : "#6B7280"} />
              <Text style={[styles.filterChipText, selectedFloor === floor.id && styles.filterChipTextActive]}>
                {floor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Office:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedOffice === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedOffice('all')}
          >
            <Text style={[styles.filterChipText, selectedOffice === 'all' && styles.filterChipTextActive]}>
              All Offices
            </Text>
          </TouchableOpacity>
          {offices.filter((office) => normalizeFloorId(office.floor) === normalizeFloorId(selectedFloor)).map((office) => (
            <TouchableOpacity
              key={office.id}
              style={[styles.filterChip, selectedOffice === office.name && styles.filterChipActive]}
              onPress={() => setSelectedOffice(office.name)}
            >
              <Ionicons name={office.icon} size={16} color={selectedOffice === office.name ? "#FFFFFF" : "#6B7280"} />
              <Text style={[styles.filterChipText, selectedOffice === office.name && styles.filterChipTextActive]}>
                {office.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Active Visitor</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Moving</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Alert</Text>
        </View>
      </View>
    </View>
  );

  const getTrackingSourceLabel = (source) => {
    const normalizedSource = String(source || '').toLowerCase();
    if (normalizedSource.includes('phone')) return 'Phone GPS';
    if (
      normalizedSource.includes('arduino') ||
      normalizedSource.includes('tap') ||
      normalizedSource.includes('nfc')
    ) {
      return 'Tap checkpoint';
    }
    if (normalizedSource.includes('manual')) return 'Manual update';
    if (normalizedSource.includes('estimate')) return 'Estimated location';
    return 'Tracking update';
  };

  const getFreshnessLabel = (dateValue) => {
    const timestamp = new Date(dateValue).getTime();
    if (!Number.isFinite(timestamp)) return 'No recent update';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSeconds < 45) return 'Live now';
    if (diffSeconds < 180) return `${Math.max(1, Math.floor(diffSeconds / 60))}m ago`;
    if (diffSeconds < 900) return `${Math.floor(diffSeconds / 60)}m ago`;
    return 'Stale update';
  };

  // Render Hover Card
  const renderHoverCard = () => {
    if (!hoveredVisitor) return null;
    
    return (
      <View style={styles.hoverCard}>
        <View style={styles.hoverCardHeader}>
          {hoveredVisitor.idPhoto ? (
            <Image source={{ uri: hoveredVisitor.idPhoto }} style={styles.hoverCardImage} />
          ) : (
            <View style={styles.hoverCardImagePlaceholder}>
              <Ionicons name="person" size={24} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.hoverCardInfo}>
            <Text style={styles.hoverCardName}>{hoveredVisitor.name}</Text>
            <Text style={styles.hoverCardPurpose}>{hoveredVisitor.purpose}</Text>
          </View>
        </View>
        <View style={styles.hoverCardDetails}>
          <View style={styles.hoverCardDetail}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.hoverCardDetailText}>{hoveredVisitor.phone}</Text>
          </View>
          <View style={styles.hoverCardDetail}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.hoverCardDetailText}>{hoveredVisitor.location.office}</Text>
          </View>
          <View style={styles.hoverCardDetail}>
            <Ionicons name="navigate-outline" size={14} color="#6B7280" />
            <Text style={styles.hoverCardDetailText}>
              {getTrackingSourceLabel(hoveredVisitor.location.source)}
            </Text>
          </View>
          <View style={styles.hoverCardDetail}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.hoverCardDetailText}>
              Last seen: {getFreshnessLabel(hoveredVisitor.location.timestamp)}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.hoverCardButton}
          onPress={() => handleVisitorSelect(hoveredVisitor)}
        >
          <Text style={styles.hoverCardButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Visitor Card
  const renderVisitorCard = (visitor) => {
    const statusBadge = getStatusBadge(visitor);
    const isCheckedIn = visitor.status === 'checked_in';
    const isProcessing = isVisitorProcessing(visitor._id);
    const historyDaysLeft = visitor.status === 'checked_out'
      ? getCompletedHistoryDaysLeft(visitor)
      : null;
    
    return (
      <TouchableOpacity
        key={visitor._id}
        style={styles.visitorCard}
        onPress={() => handleViewDetails(visitor)}
        activeOpacity={0.7}
      >
        <View style={styles.visitorCardHeader}>
          {visitor.idImage ? (
            <Image source={{ uri: visitor.idImage }} style={styles.visitorIdImage} />
          ) : (
            <View style={styles.visitorIdPlaceholder}>
              <Ionicons name="id-card-outline" size={30} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.visitorCardInfo}>
            <Text style={styles.visitorCardName} numberOfLines={1}>
              {visitor.fullName}
            </Text>
            <Text style={styles.visitorCardPurpose} numberOfLines={1}>
              {visitor.purposeOfVisit}
            </Text>
            <View style={styles.visitorCardMeta}>
              <Ionicons name="call-outline" size={12} color="#6B7280" />
              <Text style={styles.visitorCardMetaText}>
                {visitor.phoneNumber}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View style={styles.visitorCardFooter}>
          <View style={styles.visitorCardFooterItem}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.visitorCardFooterText}>
              Host: {visitor.host || 'N/A'}
            </Text>
          </View>
          {visitor.assignedOffice && (
            <View style={styles.visitorCardFooterItem}>
              <Ionicons name="business-outline" size={14} color="#6B7280" />
              <Text style={styles.visitorCardFooterText}>
                {visitor.assignedOffice}
              </Text>
            </View>
          )}
          <View style={styles.visitorCardFooterItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.visitorCardFooterText}>
              {formatDate(visitor.visitDate)}
            </Text>
          </View>
          {historyDaysLeft !== null && (
            <View style={[styles.visitorCardFooterItem, styles.visitorHistoryCountdown]}>
              <Ionicons name="time-outline" size={14} color="#D97706" />
              <Text style={styles.visitorHistoryCountdownText}>
                {historyDaysLeft} day{historyDaysLeft === 1 ? '' : 's'} left
              </Text>
            </View>
          )}
        </View>

        <View style={styles.visitorCardActions}>
          {hasApprovedVisitWindow(visitor) && (
            <TouchableOpacity 
              style={[
                styles.visitorCardAction,
                styles.visitorCardActionPrimary,
                isProcessing && styles.buttonDisabled,
              ]}
              onPress={() => isCheckedIn ? handleCheckOut(visitor) : handleCheckIn(visitor)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons 
                    name={isCheckedIn ? "log-out-outline" : "log-in-outline"} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.visitorCardActionText}>
                    {isCheckedIn ? 'Check Out' : 'Check In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.visitorCardAction, styles.visitorCardActionSecondary]}
            onPress={() => handleReportVisitor(visitor)}
          >
            <Ionicons name="flag-outline" size={18} color="#DC2626" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.visitorCardAction, styles.visitorCardActionSecondary]}
            onPress={() => handleViewDetails(visitor)}
          >
            <Ionicons name="information-circle-outline" size={18} color="#0A3D91" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Sidebar
  const renderSidebar = () => {
    const sidebarWidth = sidebarAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, isDesktop ? 280 : 260],
    });
    
    return (
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <LinearGradient
          colors={['#041E42', '#0A3D91', '#1C6DD0']}
          style={styles.sidebarHeader}
        >
          <View style={styles.sidebarLogo}>
            <Image source={Logo} style={styles.sidebarLogoImage} resizeMode="contain" />
            <View>
              <Text style={styles.sidebarLogoText}>Sapphire Security</Text>
              <Text style={styles.sidebarLogoSubtext}>Campus operations</Text>
            </View>
          </View>
          {!isDesktop && (
            <TouchableOpacity onPress={toggleSidebar} style={styles.sidebarClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </LinearGradient>
        
        <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          {user && (
            <View style={styles.sidebarUser}>
              <View style={styles.sidebarAvatar}>
                <Text style={styles.sidebarAvatarText}>
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </Text>
              </View>
              <View style={styles.sidebarUserInfo}>
                <Text style={styles.sidebarUserName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.sidebarUserRole}>
                  {user.role?.toUpperCase()} - {user.badgeNumber || 'SEC-0000'}
                </Text>
              </View>
            </View>
          )}

          {/* Navigation Menu */}
          <View style={styles.sidebarNav}>
            {guardModules.map((module) => {
              const isExpanded = expandedModule === module.key;
              const hasSelectedChild = module.submodules.some((submodule) => submodule.key === selectedSubmodule);
              const isDirectHomeModule = module.key === 'home';

              return (
                <View key={module.key} style={styles.sidebarModuleCard}>
                  <TouchableOpacity
                    style={[
                      styles.sidebarNavItem,
                      hasSelectedChild && styles.sidebarNavItemActive,
                    ]}
                    onPress={() =>
                      isDirectHomeModule
                        ? selectGuardSubmodule('home-main')
                        : toggleGuardModule(module.key)
                    }
                  >
                    <View style={[styles.sidebarNavIcon, hasSelectedChild && { backgroundColor: `${module.color}20` }]}>
                      <Ionicons
                        name={module.icon}
                        size={20}
                        color={hasSelectedChild ? module.color : '#6B7280'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.sidebarNavLabel,
                        hasSelectedChild && styles.sidebarNavLabelActive,
                      ]}
                    >
                      {module.label}
                    </Text>
                    {!isDirectHomeModule ? (
                      <Ionicons
                        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                        size={18}
                        color={hasSelectedChild ? module.color : '#94A3B8'}
                      />
                    ) : null}
                    {hasSelectedChild && <View style={[styles.sidebarNavIndicator, { backgroundColor: module.color }]} />}
                  </TouchableOpacity>

                  {isExpanded && !isDirectHomeModule ? (
                    <View style={styles.sidebarSubmoduleList}>
                      {module.submodules.map((submodule) => {
                        const isActive = selectedSubmodule === submodule.key;
                        return (
                          <TouchableOpacity
                            key={submodule.key}
                            style={[
                              styles.sidebarSubmoduleButton,
                              isActive && styles.sidebarSubmoduleButtonActive,
                            ]}
                            onPress={() => selectGuardSubmodule(submodule.key)}
                          >
                            <Text
                              style={[
                                styles.sidebarSubmoduleLabel,
                                isActive && styles.sidebarSubmoduleLabelActive,
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

          {/* Quick Stats */}
          <View style={styles.sidebarStatsSection}>
            <Text style={styles.sidebarStatsTitle}>Quick Stats</Text>
            <View style={styles.sidebarStatsGrid}>
              <View style={styles.sidebarStatItem}>
                <Text style={styles.sidebarStatValue}>{visitorStats.activeNow}</Text>
                <Text style={styles.sidebarStatLabel}>Active Now</Text>
              </View>
              <View style={styles.sidebarStatItem}>
                <Text style={styles.sidebarStatValue}>{visitorStats.pendingApproval}</Text>
                <Text style={styles.sidebarStatLabel}>Pending</Text>
              </View>
              <View style={styles.sidebarStatItem}>
                <Text style={styles.sidebarStatValue}>{visitorStats.totalToday}</Text>
                <Text style={styles.sidebarStatLabel}>Today</Text>
              </View>
            </View>
          </View>

          {/* Most Visited Offices */}
          {analytics.mostVisitedOffices.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Most Visited Offices</Text>
              {analytics.mostVisitedOffices.slice(0, 5).map((office, index) => (
                <View key={index} style={styles.sidebarRankItem}>
                  <Text style={styles.sidebarRankNumber}>{index + 1}</Text>
                  <Text style={styles.sidebarRankName}>{office.office}</Text>
                  <Text style={styles.sidebarRankCount}>{office.count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.sidebarLogout}
            onPress={handleLogoutPress}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={styles.sidebarLogoutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.sidebarVersion}>SafePass v2.1.0</Text>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderAppointmentRecordCard = (visitor) => {
    const statusBadge = getStatusBadge(visitor);

    return (
      <TouchableOpacity
        key={visitor._id}
        style={styles.visitorCard}
        onPress={() => handleViewDetails(visitor)}
        activeOpacity={0.75}
      >
        <View style={styles.visitorCardHeader}>
          {visitor.idImage ? (
            <Image source={{ uri: visitor.idImage }} style={styles.visitorIdImage} />
          ) : (
            <View style={styles.visitorIdPlaceholder}>
              <Ionicons name="document-text-outline" size={30} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.visitorCardInfo}>
            <Text style={styles.visitorCardName} numberOfLines={1}>
              {visitor.fullName}
            </Text>
            <Text style={styles.visitorCardPurpose} numberOfLines={1}>
              {visitor.purposeOfVisit || 'No appointment purpose'}
            </Text>
            <View style={styles.visitorCardMeta}>
              <Ionicons name="business-outline" size={12} color="#6B7280" />
              <Text style={styles.visitorCardMetaText}>
                {visitor.assignedOffice || visitor.host || 'Campus access'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View style={styles.visitorCardFooter}>
          <View style={styles.visitorCardFooterItem}>
            <Ionicons name="mail-outline" size={14} color="#6B7280" />
            <Text style={styles.visitorCardFooterText}>
              {visitor.email || 'No email'}
            </Text>
          </View>
          <View style={styles.visitorCardFooterItem}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.visitorCardFooterText}>
              {visitor.phoneNumber || 'No contact number'}
            </Text>
          </View>
          <View style={styles.visitorCardFooterItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.visitorCardFooterText}>
              {formatDate(visitor.visitDate)}
            </Text>
          </View>
        </View>

        <View style={styles.readonlyRecordActions}>
          <TouchableOpacity
            style={[styles.visitorCardAction, styles.visitorCardActionSecondary]}
            onPress={() => handleViewDetails(visitor)}
          >
            <Ionicons name="eye-outline" size={18} color="#0A3D91" />
            <Text style={styles.readonlyRecordActionText}>View Record</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAppointmentRecordRow = (visitor) => {
    const statusBadge = getStatusBadge(visitor);
    const scheduleDate = formatDate(visitor.visitDate);
    const scheduleTime = visitor.visitTime ? formatTime(visitor.visitTime) : 'No time';

    return (
      <TouchableOpacity
        key={visitor._id}
        style={styles.appointmentRecordsTableRow}
        onPress={() => handleViewDetails(visitor)}
        activeOpacity={0.75}
      >
        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsVisitorCell]}>
          <View style={styles.appointmentRecordsAvatar}>
            {visitor.idImage ? (
              <Image source={{ uri: visitor.idImage }} style={styles.appointmentRecordsAvatarImage} />
            ) : (
              <Ionicons name="person-outline" size={16} color="#64748B" />
            )}
          </View>
          <View style={styles.appointmentRecordsVisitorInfo}>
            <Text style={styles.appointmentRecordsPrimaryText} numberOfLines={1}>
              {visitor.fullName || 'Unnamed Visitor'}
            </Text>
            <Text style={styles.appointmentRecordsMutedText} numberOfLines={1}>
              ID: {visitor.idNumber || 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsPurposeCell]}>
          <Text style={styles.appointmentRecordsPrimaryText} numberOfLines={2}>
            {visitor.purposeOfVisit || 'No purpose'}
          </Text>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsOfficeCell]}>
          <Text style={styles.appointmentRecordsPrimaryText} numberOfLines={1}>
            {visitor.assignedOffice || visitor.appointmentDepartment || 'Campus access'}
          </Text>
          <Text style={styles.appointmentRecordsMutedText} numberOfLines={1}>
            Host: {visitor.host || visitor.assignedStaffName || 'N/A'}
          </Text>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsScheduleCell]}>
          <Text style={styles.appointmentRecordsPrimaryText} numberOfLines={1}>
            {scheduleDate}
          </Text>
          <Text style={styles.appointmentRecordsMutedText} numberOfLines={1}>
            {scheduleTime}
          </Text>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsContactCell]}>
          <Text style={styles.appointmentRecordsPrimaryText} numberOfLines={1}>
            {visitor.phoneNumber || 'No phone'}
          </Text>
          <Text style={styles.appointmentRecordsMutedText} numberOfLines={1}>
            {visitor.email || 'No email'}
          </Text>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsStatusCell]}>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View style={[styles.appointmentRecordsCell, styles.appointmentRecordsActionCell]}>
          <TouchableOpacity
            style={styles.appointmentRecordsViewButton}
            onPress={() => handleViewDetails(visitor)}
          >
            <Ionicons name="eye-outline" size={16} color="#0A3D91" />
            <Text style={styles.appointmentRecordsViewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ============ LOADING STATE ============
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={styles.loadingText}>Loading security dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  const selectedSubmoduleMeta = getSelectedSubmoduleMeta();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#041E42" />
      
      <View style={styles.mainContainer}>
        {/* Sidebar */}
        {renderSidebar()}
        
        {/* Main Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Header with Burger Menu */}
          <LinearGradient
            colors={['#041E42', '#0A3D91', '#1C6DD0']}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <TouchableOpacity 
                  style={styles.burgerButton}
                  onPress={toggleSidebar}
                >
                  <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.headerTitle}>
                    {selectedSubmoduleMeta.title}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {selectedSubmoduleMeta.subtitle}
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.notificationBell}
                  onPress={() => setShowNotificationModal(true)}
                >
                  <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <View style={styles.profileIcon}>
                    <Text style={styles.profileIconText}>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.headerInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Badge</Text>
                <Text style={styles.infoValue}>
                  {user.badgeNumber || user.employeeId || "SEC-0000"}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.statusValue}>On Duty</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Active Visitors</Text>
                <Text style={styles.visitorCount}>
                  {visitorStats.activeNow}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Tab Content */}
          {selectedSubmodule === 'home-main' && renderDashboardTab()}
          {selectedSubmodule.startsWith('map-') && renderMapTab()}
          {selectedSubmodule === 'appointment-records' && renderVisitorsTab()}
          {selectedSubmodule === 'report-file' && renderReportsTab()}
          
        </Animated.View>
      </View>

      {/* LOGOUT MODAL */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={40} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={performLogout}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Screen Map Modal */}
      <Modal
        visible={showMapModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenModalHeader}>
            <Text style={styles.fullscreenModalTitle}>Live Visitor Tracking</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.fullscreenMapContainer}>
            <SharedMonitoringMap
              title="Live Visitor Tracking"
              subtitle="Monitor approved visitors, check-ins, and on-site movement from one shared monitoring map."
              iconName="map-outline"
              iconColor="#10B981"
              controls={renderMapFilters()}
              visitors={getFilteredVisitorLocations()}
              floors={floors}
              offices={offices}
              selectedFloor={selectedFloor}
              selectedOffice={selectedOffice}
              mapBlueprints={mapBlueprints}
              officePositions={officePositions}
              onFloorChange={(floorId) => {
                setSelectedFloor(floorId);
                setSelectedOffice('all');
              }}
              onVisitorHover={handleVisitorHover}
              onVisitorLeave={handleVisitorLeave}
              onVisitorSelect={handleVisitorSelect}
              hoveredVisitor={hoveredVisitor}
              renderHoverCard={renderHoverCard}
              fullscreen
              backgroundColor="#111827"
              borderColor="#374151"
              mapBackgroundColor="#111827"
              textPrimary="#FFFFFF"
              textSecondary="#CBD5E1"
              summaryItems={[
                { label: "Live", value: getFilteredVisitorLocations().length || 0, color: "#10B981" },
                { label: "Approved", value: visitors.approved.length || 0, color: "#8EC5FF" },
                { label: "Checked In", value: visitors.active.length || 0, color: "#FBBF24" },
              ]}
              statusLabel="Security monitoring"
              showFloorNavigation={false}
            />
          </View>
        </View>
      </Modal>

      {/* Register Visitor Modal */}
      <Modal
        visible={showVisitorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVisitorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Visitor</Text>
              <TouchableOpacity onPress={() => setShowVisitorModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* ID Photo Upload Section */}
              <View style={styles.photoUploadSection}>
                <Text style={styles.inputLabel}>Visitor ID Photo *</Text>
                <TouchableOpacity 
                  style={styles.idPhotoUploadContainer}
                  onPress={() => {
                    Alert.alert(
                      "Upload ID Photo",
                      "Choose an option",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Take Photo", onPress: takeIdPhoto },
                        { text: "Choose from Gallery", onPress: pickIdImage },
                      ]
                    );
                  }}
                >
                  {newVisitor.idPhotoUri ? (
                    <Image source={{ uri: newVisitor.idPhotoUri }} style={styles.uploadedIdPhoto} />
                  ) : (
                    <View style={styles.idPhotoPlaceholder}>
                      <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.idPhotoPlaceholderText}>Tap to upload ID photo</Text>
                      <Text style={styles.idPhotoSubtext}>JPG, PNG (Max 5MB)</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter visitor's full name"
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.fullName}
                  onChangeText={(text) => setNewVisitor({...newVisitor, fullName: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09123456789"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={newVisitor.phoneNumber}
                  onChangeText={(text) => setNewVisitor({...newVisitor, phoneNumber: text})}
                  maxLength={16}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="visitor@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newVisitor.email}
                  onChangeText={(text) => setNewVisitor({...newVisitor, email: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Driver's license, Passport, etc."
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.idNumber}
                  onChangeText={(text) => setNewVisitor({...newVisitor, idNumber: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Purpose of Visit *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Meeting, Maintenance, Tour"
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.purposeOfVisit}
                  onChangeText={(text) => setNewVisitor({...newVisitor, purposeOfVisit: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Host/Department *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Who are they meeting?"
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.host}
                  onChangeText={(text) => setNewVisitor({...newVisitor, host: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assigned Office</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Which office are they visiting?"
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.assignedOffice}
                  onChangeText={(text) => setNewVisitor({...newVisitor, assignedOffice: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Visit Date</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formatDate(newVisitor.visitDate)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={newVisitor.visitDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setNewVisitor({...newVisitor, visitDate: selectedDate});
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Visit Time</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text>{formatTime(newVisitor.visitTime)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={newVisitor.visitTime}
                    mode="time"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (selectedTime) {
                        setNewVisitor({...newVisitor, visitTime: selectedTime});
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor="#9CA3AF"
                  value={newVisitor.vehicleNumber}
                  onChangeText={(text) => setNewVisitor({...newVisitor, vehicleNumber: text})}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowVisitorModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmitting && styles.buttonDisabled]}
                onPress={submitVisitor}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Register Visitor</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visitor Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.visitorDetailModalContent]}>
            <View style={[styles.modalHeader, styles.visitorDetailHeader]}>
              <View>
                <Text style={styles.modalTitle}>Visitor Profile</Text>
                <Text style={styles.visitorDetailHeaderSubtitle}>Review identity, schedule, and access status before taking action.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <ScrollView style={styles.modalBody} contentContainerStyle={styles.visitorDetailBody} showsVerticalScrollIndicator={false}>
                {selectedVisitor.status === 'checked_out' && getCompletedHistoryDaysLeft(selectedVisitor) !== null ? (
                  <View style={styles.visitorHistoryNotice}>
                    <Ionicons name="archive-outline" size={18} color="#D97706" />
                    <Text style={styles.visitorHistoryNoticeText}>
                      This visit history will remain visible for {getCompletedHistoryDaysLeft(selectedVisitor)} more day{getCompletedHistoryDaysLeft(selectedVisitor) === 1 ? '' : 's'} before it rolls off Visitor Management. The visitor account will stay active in the system.
                    </Text>
                  </View>
                ) : null}

                <View style={styles.visitorDetailHero}>
                  <View style={styles.detailPhotoSection}>
                    {selectedVisitor.idImage ? (
                      <Image 
                        source={{ uri: selectedVisitor.idImage }} 
                        style={styles.detailIdPhoto} 
                      />
                    ) : (
                      <View style={styles.detailIdPlaceholder}>
                        <Ionicons name="id-card-outline" size={60} color="#9CA3AF" />
                        <Text style={styles.detailIdPlaceholderText}>No ID photo available</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.visitorDetailHeroCopy}>
                    <View style={styles.visitorDetailBadgeRow}>
                      <View style={[styles.visitorDetailStatusPill, { backgroundColor: getStatusBadge(selectedVisitor).bg }]}>
                        <Text style={[styles.visitorDetailStatusPillText, { color: getStatusBadge(selectedVisitor).text }]}>
                          {getStatusBadge(selectedVisitor).label}
                        </Text>
                      </View>
                      <View style={styles.visitorDetailAccessPill}>
                        <Ionicons name="shield-checkmark-outline" size={12} color="#0A3D91" />
                        <Text style={styles.visitorDetailAccessPillText}>
                          {hasApprovedVisitWindow(selectedVisitor) ? 'Cleared for access' : 'Awaiting clearance'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.detailName}>{selectedVisitor.fullName}</Text>
                    <Text style={styles.visitorDetailPurpose}>{selectedVisitor.purposeOfVisit || 'No purpose recorded'}</Text>

                    <View style={styles.visitorDetailQuickInfo}>
                      <View style={styles.visitorDetailQuickInfoCard}>
                        <Text style={styles.visitorDetailQuickInfoLabel}>Visit Date</Text>
                        <Text style={styles.visitorDetailQuickInfoValue}>{formatDate(selectedVisitor.visitDate)}</Text>
                      </View>
                      <View style={styles.visitorDetailQuickInfoCard}>
                        <Text style={styles.visitorDetailQuickInfoLabel}>Visit Time</Text>
                        <Text style={styles.visitorDetailQuickInfoValue}>{formatTime(selectedVisitor.visitTime)}</Text>
                      </View>
                      <View style={styles.visitorDetailQuickInfoCard}>
                        <Text style={styles.visitorDetailQuickInfoLabel}>Host</Text>
                        <Text style={styles.visitorDetailQuickInfoValue}>{selectedVisitor.host || 'Not assigned'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.visitorDetailSection}>
                  <Text style={styles.visitorDetailSectionTitle}>Identity & Contact</Text>
                  <View style={styles.visitorDetailInfoGrid}>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>Phone</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.phoneNumber || 'No phone number'}</Text>
                    </View>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>Email</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.email || 'No email address'}</Text>
                    </View>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>ID Number</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.idNumber || 'No ID recorded'}</Text>
                    </View>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>Vehicle</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.vehicleNumber || 'No vehicle listed'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.visitorDetailSection}>
                  <Text style={styles.visitorDetailSectionTitle}>Visit Assignment</Text>
                  <View style={styles.visitorDetailInfoGrid}>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>Host / Department</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.host || 'Not set'}</Text>
                    </View>
                    <View style={styles.visitorDetailInfoCard}>
                      <Text style={styles.visitorDetailInfoLabel}>Assigned Office</Text>
                      <Text style={styles.visitorDetailInfoValue}>{selectedVisitor.assignedOffice || 'Not assigned'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.visitorDetailSection}>
                  <Text style={styles.visitorDetailSectionTitle}>Access Timeline</Text>
                  <View style={styles.visitorDetailTimeline}>
                    <View style={styles.visitorDetailTimelineItem}>
                      <View style={[styles.visitorDetailTimelineDot, { backgroundColor: '#1C6DD0' }]} />
                      <View style={styles.visitorDetailTimelineCopy}>
                        <Text style={styles.visitorDetailTimelineTitle}>Scheduled Arrival</Text>
                        <Text style={styles.visitorDetailTimelineText}>
                          {formatDate(selectedVisitor.visitDate)} at {formatTime(selectedVisitor.visitTime)}
                        </Text>
                      </View>
                    </View>

                    {selectedVisitor.checkedInAt ? (
                      <View style={styles.visitorDetailTimelineItem}>
                        <View style={[styles.visitorDetailTimelineDot, { backgroundColor: '#10B981' }]} />
                        <View style={styles.visitorDetailTimelineCopy}>
                          <Text style={styles.visitorDetailTimelineTitle}>Checked In</Text>
                          <Text style={styles.visitorDetailTimelineText}>{formatDateTime(selectedVisitor.checkedInAt)}</Text>
                        </View>
                      </View>
                    ) : null}

                    {selectedVisitor.checkedOutAt ? (
                      <View style={styles.visitorDetailTimelineItem}>
                        <View style={[styles.visitorDetailTimelineDot, { backgroundColor: '#DC2626' }]} />
                        <View style={styles.visitorDetailTimelineCopy}>
                          <Text style={styles.visitorDetailTimelineTitle}>Checked Out</Text>
                          <Text style={styles.visitorDetailTimelineText}>{formatDateTime(selectedVisitor.checkedOutAt)}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.detailActions}>
                  {hasApprovedVisitWindow(selectedVisitor) && selectedVisitor.status !== 'checked_out' && (
                    <TouchableOpacity 
                      style={[
                        styles.detailActionButton,
                        styles.detailActionPrimary,
                        isVisitorProcessing(selectedVisitor._id) && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        setShowDetailModal(false);
                        if (selectedVisitor.status === 'checked_in') {
                          handleCheckOut(selectedVisitor);
                        } else {
                          handleCheckIn(selectedVisitor);
                        }
                      }}
                      disabled={isVisitorProcessing(selectedVisitor._id)}
                    >
                      {isVisitorProcessing(selectedVisitor._id) ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons 
                            name={selectedVisitor.status === 'checked_in' ? "log-out-outline" : "log-in-outline"} 
                            size={20} 
                            color="#FFFFFF" 
                          />
                          <Text style={styles.detailActionText}>
                            {selectedVisitor.status === 'checked_in' ? 'Check Out' : 'Check In'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.detailActionButton, styles.detailActionDanger]}
                    onPress={() => {
                      setShowDetailModal(false);
                      handleReportVisitor(selectedVisitor);
                    }}
                  >
                    <Ionicons name="flag-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Report</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.notificationHeaderTitle}>
                <Ionicons name="notifications-outline" size={24} color="#0A3D91" />
                <Text style={styles.modalTitle}>Notifications</Text>
              </View>
              <View style={styles.notificationHeaderActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification._id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.notificationUnread
                    ]}
                    onPress={() => markAsRead(notification)}
                  >
                    <View style={[
                      styles.notificationIcon,
                      { 
                        backgroundColor: 
                          notification.type === 'alert' ? '#FEE2E2' :
                          notification.type === 'visitor' ? '#EEF5FF' :
                          '#EEF5FF'
                      }
                    ]}>
                      <Ionicons 
                        name={
                          notification.type === 'alert' ? "warning" :
                          notification.type === 'visitor' ? "person-add" :
                          "checkmark-circle"
                        }
                        size={20}
                        color={
                          notification.type === 'alert' ? "#DC2626" :
                          notification.type === 'visitor' ? "#0A3D91" :
                          "#0A3D91"
                        }
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={48} color="#E5E7EB" />
                  <Text style={styles.emptyText}>No notifications</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
