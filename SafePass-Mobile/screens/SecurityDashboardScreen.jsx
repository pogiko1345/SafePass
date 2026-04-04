// SecurityDashboardScreen.jsx (Complete with Working Tab Navigation)
import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from "../utils/ApiService";
import styles from "../styles/SecurityDashboardStyles";

// Import map components
import CampusMap from "../components/CampusMap";

const { width, height } = Dimensions.get("window");
const isDesktop = width >= 1024;

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
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [hoveredVisitor, setHoveredVisitor] = useState(null);
  const [visitorLocations, setVisitorLocations] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visitorFilter, setVisitorFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Floors and offices data
  const floors = [
    { id: 'all', name: 'All Floors', icon: 'layers-outline' },
    { id: 'ground', name: 'Ground Floor', icon: 'home-outline' },
    { id: 'first', name: '1st Floor', icon: 'arrow-up-outline' },
    { id: 'second', name: '2nd Floor', icon: 'arrow-up-outline' },
    { id: 'third', name: '3rd Floor', icon: 'arrow-up-outline' },
  ];
  
  const offices = [
    { id: 'admin', name: 'Administration', floor: 'ground', icon: 'business-outline' },
    { id: 'registrar', name: 'Registrar\'s Office', floor: 'ground', icon: 'document-text-outline' },
    { id: 'accounting', name: 'Accounting Office', floor: 'ground', icon: 'calculator-outline' },
    { id: 'admissions', name: 'Admissions Office', floor: 'first', icon: 'school-outline' },
    { id: 'dean', name: 'Dean\'s Office', floor: 'first', icon: 'people-outline' },
    { id: 'hr', name: 'HR Department', floor: 'second', icon: 'people-circle-outline' },
    { id: 'it', name: 'IT Department', floor: 'second', icon: 'desktop-outline' },
    { id: 'library', name: 'Library', floor: 'third', icon: 'book-outline' },
    { id: 'cafeteria', name: 'Cafeteria', floor: 'third', icon: 'restaurant-outline' },
  ];

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

  const initializeScreen = async () => {
    await loadUserData();
    await loadDashboardData();
    await loadVisitors();
    await loadNotifications();
    await loadAnalytics();
    await loadVisitorLocations();
    await loadAccessLogs();
    await loadReports();
    
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

  // ============ DATA LOADING FUNCTIONS ============
  const loadUserData = async () => {
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser || (currentUser.role !== 'security' && currentUser.role !== 'admin')) {
        navigation.replace("Login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Load user error:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const activeUsersRes = await ApiService.getAllUsers({ status: 'active', isActive: true });
      const activeUsersList = activeUsersRes.users || [];
      setActiveUsers(activeUsersList);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayVisitors = await ApiService.getVisitors({
        visitDate: { $gte: today, $lt: tomorrow }
      });
      
      const alertsRes = await ApiService.getSecurityLogs({ 
        type: 'alert',
        resolved: false 
      });
      
      const accessLogs = await ApiService.getAccessLogs(1, 10);
      
      setDashboardStats({
        activeUsers: activeUsersList.length,
        totalVisitorsToday: todayVisitors.visitors?.length || 0,
        activeAlerts: alertsRes.logs?.length || 0,
        recentAccess: accessLogs.accessLogs?.length || 0,
        occupancyRate: await calculateOccupancyRate(),
      });
      
      setRecentAccess(accessLogs.accessLogs || []);
      setAlerts(alertsRes.logs || []);
      
    } catch (error) {
      console.error("Load dashboard error:", error);
    }
  };

  const calculateOccupancyRate = async () => {
    try {
      const settings = await ApiService.getSystemSettings();
      const totalCapacity = settings.campusCapacity || 500;
      const currentOccupancy = await ApiService.getActiveUserCount();
      return Math.round((currentOccupancy / totalCapacity) * 100);
    } catch {
      return 0;
    }
  };

  const loadVisitors = async () => {
    try {
      const [activeRes, pendingRes, approvedRes, completedRes, allRes] = await Promise.all([
        ApiService.getVisitors({ status: 'checked_in' }),
        ApiService.getVisitors({ approvalStatus: 'pending' }),
        ApiService.getVisitors({ approvalStatus: 'approved', status: { $ne: 'checked_in' } }),
        ApiService.getVisitors({ status: 'checked_out' }),
        ApiService.getVisitors({}),
      ]);
      
      const active = activeRes.visitors || [];
      const pending = pendingRes.visitors || [];
      const approved = approvedRes.visitors || [];
      const completed = completedRes.visitors || [];
      const all = allRes.visitors || [];
      
      setVisitors({ active, pending, approved, completed, all });
      
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      setVisitorStats({
        totalToday: all.filter(v => new Date(v.visitDate).setHours(0,0,0,0) === today.getTime()).length,
        totalThisWeek: all.filter(v => new Date(v.visitDate) >= weekAgo).length,
        totalThisMonth: all.filter(v => new Date(v.visitDate) >= monthAgo).length,
        activeNow: active.length,
        pendingApproval: pending.length,
      });
      
    } catch (error) {
      console.error("Load visitors error:", error);
    }
  };

  const loadAccessLogs = async () => {
    try {
      const response = await ApiService.getAccessLogs(logsPage, 20);
      setAccessLogs(response.accessLogs || []);
      setLogsTotal(response.total || 0);
    } catch (error) {
      console.error("Load access logs error:", error);
    }
  };

  const loadReports = async () => {
    try {
      const response = await ApiService.getSecurityReports();
      setReports(response.reports || []);
    } catch (error) {
      console.error("Load reports error:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await ApiService.getNotifications({ read: false });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Load notifications error:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const allVisitors = visitors.all.length ? visitors.all : await ApiService.getVisitors({});
      const officeCount = {};
      
      (allVisitors.visitors || []).forEach(visitor => {
        const office = visitor.assignedOffice;
        if (office) {
          officeCount[office] = (officeCount[office] || 0) + 1;
        }
      });
      
      const mostVisited = Object.entries(officeCount)
        .map(([office, count]) => ({ office, count, percentage: Math.round((count / (allVisitors.visitors?.length || 1)) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setAnalytics({
        mostVisitedOffices: mostVisited,
        visitorsByHour: [],
        popularVisitPurposes: [],
        averageVisitDuration: 0,
      });
      
    } catch (error) {
      console.error("Load analytics error:", error);
    }
  };

  const loadVisitorLocations = async () => {
    try {
      const activeVisitors = visitors.active;
      const locations = activeVisitors.map((visitor, index) => ({
        id: visitor._id,
        name: visitor.fullName,
        phone: visitor.phoneNumber,
        purpose: visitor.purposeOfVisit,
        host: visitor.host,
        checkInTime: visitor.checkedInAt,
        status: visitor.status,
        idPhoto: visitor.idImage,
        location: {
          floor: getRandomFloor(),
          office: visitor.assignedOffice || getRandomOffice(),
          coordinates: {
            x: 15 + ((index * 17) % 70),
            y: 15 + ((index * 23) % 70),
          },
          timestamp: new Date(),
        },
        movement: [],
      }));
      
      setVisitorLocations(locations);
    } catch (error) {
      console.error("Load visitor locations error:", error);
    }
  };

  const getRandomFloor = () => {
    const floorsList = ['ground', 'first', 'second', 'third'];
    return floorsList[Math.floor(Math.random() * floorsList.length)];
  };
  
  const getRandomOffice = () => {
    const officeNames = offices.filter(o => o.id !== 'all').map(o => o.name);
    return officeNames[Math.floor(Math.random() * officeNames.length)];
  };

  const getFilteredVisitorLocations = () => {
    return visitorLocations.filter(visitor => {
      if (selectedFloor !== 'all' && visitor.location.floor !== selectedFloor) {
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
    await Promise.all([
      loadDashboardData(),
      loadVisitors(),
      loadNotifications(),
      loadAnalytics(),
      loadVisitorLocations(),
      loadAccessLogs(),
      loadReports(),
    ]);
    setRefreshing(false);
  };

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

  const getStatusBadge = (visitor) => {
    if (visitor.status === 'checked_in') {
      return { bg: '#D1FAE5', text: '#059669', label: 'CHECKED IN' };
    } else if (visitor.status === 'checked_out') {
      return { bg: '#F3F4F6', text: '#6B7280', label: 'CHECKED OUT' };
    } else if (visitor.approvalStatus === 'pending') {
      return { bg: '#FEF3C7', text: '#D97706', label: 'PENDING' };
    } else if (visitor.approvalStatus === 'approved') {
      return { bg: '#DBEAFE', text: '#3B82F6', label: 'APPROVED' };
    } else if (visitor.approvalStatus === 'rejected') {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'REJECTED' };
    }
    return { bg: '#F3F4F6', text: '#6B7280', label: 'UNKNOWN' };
  };

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
    if (!newVisitor.fullName || !newVisitor.purposeOfVisit || !newVisitor.host || !newVisitor.phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!newVisitor.idPhotoUri) {
      Alert.alert("Error", "Please upload a photo of the visitor's ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const visitorData = {
        fullName: newVisitor.fullName,
        phoneNumber: newVisitor.phoneNumber,
        email: newVisitor.email,
        idNumber: newVisitor.idNumber,
        purposeOfVisit: newVisitor.purposeOfVisit,
        host: newVisitor.host,
        assignedOffice: newVisitor.assignedOffice,
        visitDate: newVisitor.visitDate,
        visitTime: newVisitor.visitTime,
        vehicleNumber: newVisitor.vehicleNumber,
        idImage: newVisitor.idPhotoBase64 ? `data:image/jpeg;base64,${newVisitor.idPhotoBase64}` : null,
        registeredBy: user._id,
        registeredByName: `${user.firstName} ${user.lastName}`,
      };

      const response = await ApiService.registerVisitorWithNotification(visitorData);
      
      if (response.success) {
        setShowVisitorModal(false);
        await loadVisitors();
        await loadAnalytics();
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
    try {
      const response = await ApiService.visitorCheckIn(visitor._id);
      if (response.success) {
        await loadVisitors();
        await loadVisitorLocations();
        Alert.alert("Success", `${visitor.fullName} checked in successfully`);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleCheckOut = async (visitor) => {
    Alert.alert(
      "Confirm Check-out",
      `Check out ${visitor.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          onPress: async () => {
            try {
              const response = await ApiService.visitorCheckOut(visitor._id);
              if (response.success) {
                await loadVisitors();
                await loadVisitorLocations();
                Alert.alert("Success", `${visitor.fullName} checked out successfully`);
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
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
      Alert.alert("Report Submitted", "Security team has been notified");
    } catch (error) {
      Alert.alert("Error", "Failed to submit report");
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
  const getFilteredVisitors = () => {
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
  };

  // Render Dashboard Tab
  const renderDashboardTab = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
      }
    >
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCardLarge}
        >
          <View style={styles.statCardLargeContent}>
            <View style={styles.statIconCircle}>
              <Ionicons name="people" size={28} color="#DC2626" />
            </View>
            <Text style={styles.statCardLargeValue}>{visitorStats.activeNow}</Text>
            <Text style={styles.statCardLargeLabel}>Active Visitors</Text>
            <View style={styles.statBadge}>
              <Ionicons name="trending-up" size={12} color="#10B981" />
              <Text style={styles.statBadgeText}>+{Math.floor(Math.random() * 20)}% today</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCardMedium}>
            <View style={[styles.statIconSmall, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="people-circle" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValueLarge}>{dashboardStats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
            <Text style={styles.statTrend}>+12 today</Text>
          </View>

          <View style={styles.statCardMedium}>
            <View style={[styles.statIconSmall, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValueLarge}>{visitorStats.totalToday}</Text>
            <Text style={styles.statLabel}>Today's Visitors</Text>
            <Text style={styles.statTrend}>Expected +8</Text>
          </View>
        </View>
      </View>

      {/* Campus Map Section */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="map-outline" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Live Visitor Tracking</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMapModal(true)}>
            <Text style={styles.viewAll}>Full Screen</Text>
          </TouchableOpacity>
        </View>
        
        {renderMapFilters()}
        
        <View style={styles.mapContainer}>
          <CampusMap
            visitors={getFilteredVisitorLocations()}
            floors={floors}
            offices={offices}
            selectedFloor={selectedFloor}
            selectedOffice={selectedOffice}
            onVisitorHover={handleVisitorHover}
            onVisitorLeave={handleVisitorLeave}
            onVisitorSelect={handleVisitorSelect}
            hoveredVisitor={hoveredVisitor}
            renderHoverCard={renderHoverCard}
          />
        </View>
      </View>

      {/* Pending Approval Banner */}
      {visitorStats.pendingApproval > 0 && (
        <TouchableOpacity 
          style={styles.upcomingBanner}
          onPress={() => {
            setActiveTab('visitors');
            setVisitorFilter('pending');
          }}
        >
          <View style={styles.upcomingBannerContent}>
            <Ionicons name="time-outline" size={24} color="#D97706" />
            <View style={styles.upcomingBannerText}>
              <Text style={styles.upcomingBannerTitle}>
                {visitorStats.pendingApproval} Visitor{visitorStats.pendingApproval > 1 ? 's' : ''} Pending Approval
              </Text>
              <Text style={styles.upcomingBannerSubtitle}>
                Waiting for admin approval
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D97706" />
        </TouchableOpacity>
      )}

      {/* Quick Actions Row */}
      <View style={styles.quickActionsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flash-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
        </View>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleRegisterVisitor}>
            <LinearGradient
              colors={['#0A3D91', '#1E4A8C']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>Register Visitor</Text>
              <Text style={styles.quickActionSubtitle}>Add new visitor to system</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('map')}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="map-outline" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>View Map</Text>
              <Text style={styles.quickActionSubtitle}>Track visitor locations</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('visitors')}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="list-outline" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>View All</Text>
              <Text style={styles.quickActionSubtitle}>See all visitors</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("NFCScan")}>
            <LinearGradient
              colors={['#7C3AED', '#6D28D9']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>Quick Scan</Text>
              <Text style={styles.quickActionSubtitle}>Scan visitor QR/ID</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="time-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <TouchableOpacity onPress={() => setActiveTab('logs')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentAccess.slice(0, 5).map((log, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { 
                backgroundColor: log.status === 'granted' ? '#D1FAE5' : '#FEE2E2' 
              }]}>
                <Ionicons 
                  name={log.status === 'granted' ? "checkmark" : "close"} 
                  size={16} 
                  color={log.status === 'granted' ? '#059669' : '#DC2626'} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{log.userName || 'Unknown User'}</Text>
                <Text style={styles.activityLocation}>
                  <Ionicons name="location-outline" size={10} color="#9CA3AF" />
                  {' '}{log.location}
                </Text>
              </View>
              <Text style={styles.activityTime}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
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
            <TouchableOpacity onPress={() => setActiveTab('alerts')}>
              <Text style={styles.viewAllLink}>View All</Text>
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
                               alert.severity === 'medium' ? '#FEF3C7' : '#D1FAE5' 
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
    </ScrollView>
  );

  // Render Map Tab
  const renderMapTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.mapSectionFull}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="map-outline" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Live Visitor Tracking Map</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMapModal(true)}>
            <Text style={styles.viewAll}>Full Screen</Text>
          </TouchableOpacity>
        </View>
        
        {renderMapFilters()}
        
        <View style={styles.mapContainerFull}>
          <CampusMap
            visitors={getFilteredVisitorLocations()}
            floors={floors}
            offices={offices}
            selectedFloor={selectedFloor}
            selectedOffice={selectedOffice}
            onVisitorHover={handleVisitorHover}
            onVisitorLeave={handleVisitorLeave}
            onVisitorSelect={handleVisitorSelect}
            hoveredVisitor={hoveredVisitor}
            renderHoverCard={renderHoverCard}
          />
        </View>
      </View>
    </ScrollView>
  );

  // Render Visitors Tab
  const renderVisitorsTab = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.visitorsContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people-outline" size={20} color="#0A3D91" />
            <Text style={styles.sectionTitle}>Visitor Management</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleRegisterVisitor}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['active', 'pending', 'approved', 'completed', 'all'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, visitorFilter === filter && styles.filterTabActive]}
              onPress={() => {
                setVisitorFilter(filter);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.filterTabText, visitorFilter === filter && styles.filterTabTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'active' && ` (${visitors.active.length})`}
                {filter === 'pending' && ` (${visitors.pending.length})`}
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

        {/* Visitor Cards */}
        {getFilteredVisitors().length > 0 ? (
          getFilteredVisitors().map((visitor) => renderVisitorCard(visitor))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No visitors found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try a different search term' : 'No visitors in this category'}
            </Text>
          </View>
        )}
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
                  onPress={async () => {
                    await ApiService.resolveAlert(alert._id);
                    refreshData();
                  }}
                >
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
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
            <Ionicons name="time-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Access Logs</Text>
          </View>
          <TouchableOpacity onPress={() => { setLogsPage(1); loadAccessLogs(); }}>
            <Ionicons name="refresh-outline" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        <View style={styles.logsList}>
          {accessLogs.map((log) => (
            <View key={log._id} style={styles.logItem}>
              <View style={[styles.logIcon, { 
                backgroundColor: log.status === 'granted' ? '#D1FAE5' : '#FEE2E2' 
              }]}>
                <Ionicons 
                  name={log.status === 'granted' ? "checkmark" : "close"} 
                  size={16} 
                  color={log.status === 'granted' ? '#059669' : '#DC2626'} 
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
            <Ionicons name="document-text-outline" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Security Reports</Text>
          </View>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => Alert.alert('Generate Report', 'Report generation feature coming soon')}
          >
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Export</Text>
          </TouchableOpacity>
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
            {reports.slice(0, 5).map((report) => (
              <View key={report._id} style={styles.reportCard}>
                <View style={styles.reportCardHeader}>
                  <Ionicons name="flag-outline" size={16} color="#DC2626" />
                  <Text style={styles.reportCardTitle}>{report.reason}</Text>
                  <Text style={styles.reportCardDate}>{formatDate(report.createdAt)}</Text>
                </View>
                <Text style={styles.reportCardVisitor}>Visitor: {report.visitorName}</Text>
                <Text style={styles.reportCardStatus}>Status: {report.status}</Text>
              </View>
            ))}
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
      
      {selectedFloor !== 'all' && (
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
            {offices.filter(o => o.id !== 'all' && o.floor === selectedFloor).map((office) => (
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
      )}
      
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
        </View>

        <View style={styles.visitorCardActions}>
          {visitor.approvalStatus === 'approved' && (
            <TouchableOpacity 
              style={[styles.visitorCardAction, styles.visitorCardActionPrimary]}
              onPress={() => isCheckedIn ? handleCheckOut(visitor) : handleCheckIn(visitor)}
            >
              <Ionicons 
                name={isCheckedIn ? "log-out-outline" : "log-in-outline"} 
                size={18} 
                color="#FFFFFF" 
              />
              <Text style={styles.visitorCardActionText}>
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Text>
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
          colors={['#DC2626', '#B91C1C']}
          style={styles.sidebarHeader}
        >
          <View style={styles.sidebarLogo}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#FFFFFF" />
            <Text style={styles.sidebarLogoText}>SecuriTrack</Text>
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
                  {user.role?.toUpperCase()} • {user.badgeNumber || 'SEC-0000'}
                </Text>
              </View>
            </View>
          )}

          {/* Navigation Menu */}
          <View style={styles.sidebarNav}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidebarNavItem,
                  activeTab === item.id && styles.sidebarNavItemActive
                ]}
                onPress={() => setActiveTab(item.id)}
              >
                <View style={[styles.sidebarNavIcon, activeTab === item.id && { backgroundColor: item.color + '20' }]}>
                  <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={activeTab === item.id ? item.color : '#6B7280'} 
                  />
                </View>
                <Text style={[
                  styles.sidebarNavLabel,
                  activeTab === item.id && styles.sidebarNavLabelActive
                ]}>
                  {item.label}
                </Text>
                {activeTab === item.id && <View style={[styles.sidebarNavIndicator, { backgroundColor: item.color }]} />}
              </TouchableOpacity>
            ))}
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
              <Text style={styles.sidebarSectionTitle}>Most Visited</Text>
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

  // Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', color: '#DC2626' },
    { id: 'map', label: 'Live Map', icon: 'map-outline', color: '#10B981' },
    { id: 'visitors', label: 'Visitors', icon: 'people-outline', color: '#0A3D91' },
    { id: 'alerts', label: 'Alerts', icon: 'warning-outline', color: '#F59E0B' },
    { id: 'logs', label: 'Access Logs', icon: 'time-outline', color: '#059669' },
    { id: 'reports', label: 'Reports', icon: 'document-text-outline', color: '#7C3AED' },
  ];

  // ============ LOADING STATE ============
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading security dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      <View style={styles.mainContainer}>
        {/* Sidebar */}
        {renderSidebar()}
        
        {/* Main Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Header with Burger Menu */}
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
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
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {formatDate(new Date())}
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
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'map' && renderMapTab()}
          {activeTab === 'visitors' && renderVisitorsTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'logs' && renderLogsTab()}
          {activeTab === 'reports' && renderReportsTab()}
          
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
            {renderMapFilters()}
            <CampusMap
              visitors={getFilteredVisitorLocations()}
              floors={floors}
              offices={offices}
              selectedFloor={selectedFloor}
              selectedOffice={selectedOffice}
              onVisitorHover={handleVisitorHover}
              onVisitorLeave={handleVisitorLeave}
              onVisitorSelect={handleVisitorSelect}
              hoveredVisitor={hoveredVisitor}
              renderHoverCard={renderHoverCard}
              fullscreen={true}
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
                  placeholder="0912 345 6789"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={newVisitor.phoneNumber}
                  onChangeText={(text) => setNewVisitor({...newVisitor, phoneNumber: text})}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visitor Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailPhotoSection}>
                  {selectedVisitor.idPhoto ? (
                    <Image 
                      source={{ uri: selectedVisitor.idPhoto }} 
                      style={styles.detailIdPhoto} 
                    />
                  ) : (
                    <View style={styles.detailIdPlaceholder}>
                      <Ionicons name="id-card-outline" size={60} color="#9CA3AF" />
                      <Text style={styles.detailIdPlaceholderText}>No ID photo available</Text>
                    </View>
                  )}
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusBadge(selectedVisitor).bg,
                    alignSelf: 'center',
                    marginTop: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }]}>
                    <Text style={[styles.statusBadgeText, { 
                      color: getStatusBadge(selectedVisitor).text 
                    }]}>
                      {getStatusBadge(selectedVisitor).label}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailInfoSection}>
                  <Text style={styles.detailName}>{selectedVisitor.fullName}</Text>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="call-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>{selectedVisitor.phoneNumber}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="mail-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>{selectedVisitor.email}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="card-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>ID: {selectedVisitor.idNumber}</Text>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>{selectedVisitor.purposeOfVisit}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>Host: {selectedVisitor.host}</Text>
                  </View>

                  {selectedVisitor.assignedOffice && (
                    <View style={styles.detailItem}>
                      <Ionicons name="business-outline" size={18} color="#6B7280" />
                      <Text style={styles.detailText}>Office: {selectedVisitor.assignedOffice}</Text>
                    </View>
                  )}

                  {selectedVisitor.vehicleNumber && (
                    <View style={styles.detailItem}>
                      <Ionicons name="car-outline" size={18} color="#6B7280" />
                      <Text style={styles.detailText}>Vehicle: {selectedVisitor.vehicleNumber}</Text>
                    </View>
                  )}

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>Visit Date: {formatDate(selectedVisitor.visitDate)}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>Visit Time: {formatTime(selectedVisitor.visitTime)}</Text>
                  </View>

                  {selectedVisitor.checkedInAt && (
                    <View style={styles.detailItem}>
                      <Ionicons name="log-in-outline" size={18} color="#10B981" />
                      <Text style={styles.detailText}>
                        Checked In: {formatDateTime(selectedVisitor.checkedInAt)}
                      </Text>
                    </View>
                  )}

                  {selectedVisitor.checkedOutAt && (
                    <View style={styles.detailItem}>
                      <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                      <Text style={styles.detailText}>
                        Checked Out: {formatDateTime(selectedVisitor.checkedOutAt)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailActions}>
                  {selectedVisitor.approvalStatus === 'approved' && selectedVisitor.status !== 'checked_out' && (
                    <TouchableOpacity 
                      style={[styles.detailActionButton, styles.detailActionPrimary]}
                      onPress={() => {
                        setShowDetailModal(false);
                        if (selectedVisitor.status === 'checked_in') {
                          handleCheckOut(selectedVisitor);
                        } else {
                          handleCheckIn(selectedVisitor);
                        }
                      }}
                    >
                      <Ionicons 
                        name={selectedVisitor.status === 'checked_in' ? "log-out-outline" : "log-in-outline"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.detailActionText}>
                        {selectedVisitor.status === 'checked_in' ? 'Check Out' : 'Check In'}
                      </Text>
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
                          notification.type === 'visitor' ? '#DBEAFE' :
                          '#D1FAE5'
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
                          "#059669"
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