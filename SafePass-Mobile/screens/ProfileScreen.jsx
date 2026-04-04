// ProfileScreen.jsx (Complete with Preferences Section)
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Switch,
  Share,
  Image,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import ApiService from "../utils/ApiService";
import profileStyles from "../styles/ProfileStyles";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isMobile = Platform.OS !== "web";

export default function ProfileScreen({ navigation }) {
  // ============ STATE MANAGEMENT ============
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState(null);
  const [usingCache, setUsingCache] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Sidebar state for web
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(280)).current;
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  
  // Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Toggle sidebar function
  const toggleSidebar = () => {
    const toValue = sidebarCollapsed ? 280 : 80;
    Animated.spring(sidebarAnim, {
      toValue,
      useNativeDriver: false,
      tension: 300,
      friction: 30,
    }).start();
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Load preferences from storage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (profile) {
      savePreferences();
    }
  }, [notificationsEnabled, biometricEnabled, darkModeEnabled, selectedLanguage]);

  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    loadProfile();
    requestPermissions();
    checkBiometricAvailability();
  }, []);

  // ============ PREFERENCE FUNCTIONS ============
  const loadPreferences = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      const darkMode = await AsyncStorage.getItem('darkModeEnabled');
      const language = await AsyncStorage.getItem('selectedLanguage');
      
      if (notifications !== null) setNotificationsEnabled(notifications === 'true');
      if (biometric !== null) setBiometricEnabled(biometric === 'true');
      if (darkMode !== null) setDarkModeEnabled(darkMode === 'true');
      if (language !== null) setSelectedLanguage(language);
    } catch (error) {
      console.error("Load preferences error:", error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      await AsyncStorage.setItem('biometricEnabled', biometricEnabled.toString());
      await AsyncStorage.setItem('darkModeEnabled', darkModeEnabled.toString());
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
    } catch (error) {
      console.error("Save preferences error:", error);
    }
  };

  const checkBiometricAvailability = async () => {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isAvailable || !isEnrolled) {
      setBiometricEnabled(false);
    }
  };

  const setupBiometric = async () => {
    if (biometricEnabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use passcode',
      });
      if (!result.success) {
        setBiometricEnabled(false);
        Alert.alert('Authentication Failed', 'Could not verify your identity');
      }
    }
  };

  // ============ PERMISSIONS ============
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Needed', 'Camera permission is required to update profile photo.');
      }
    }
  };

  // ============ PROFILE LOADING ============
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    setUsingCache(false);
    
    try {
      const currentUser = await ApiService.getCurrentUser();
      
      if (!currentUser) {
        navigation.replace("Login");
        return;
      }

      const defaultProfile = {
        _id: currentUser._id || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.role || 'student',
        studentId: currentUser.studentId || '',
        staffId: currentUser.staffId || '',
        badgeNumber: currentUser.badgeNumber || '',
        emergencyContact: currentUser.emergencyContact || '',
        course: currentUser.course || '',
        yearLevel: currentUser.yearLevel || '',
        department: currentUser.department || '',
        position: currentUser.position || '',
        shift: currentUser.shift || '',
        supervisor: currentUser.supervisor || '',
        nfcCardId: currentUser.nfcCardId || '',
        profilePhoto: currentUser.profilePhoto || null,
      };
      
      setProfile(defaultProfile);
      setOriginalProfile({ ...defaultProfile });
      setEditedProfile({ ...defaultProfile });

      try {
        const response = await ApiService.getProfile();
        if (response && response.user) {
          setProfile({ ...defaultProfile, ...response.user });
          setOriginalProfile({ ...defaultProfile, ...response.user });
          setEditedProfile({ ...defaultProfile, ...response.user });
        }
      } catch (apiError) {
        setUsingCache(true);
      }
    } catch (error) {
      setError(error.message);
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setProfile(parsedUser);
          setOriginalProfile({ ...parsedUser });
          setEditedProfile({ ...parsedUser });
          setUsingCache(true);
          setError(null);
        }
      } catch (storageError) {
        console.error("Storage fallback error:", storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PROFILE PHOTO FUNCTIONS ============
  const pickProfilePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setEditedProfile({
          ...editedProfile,
          profilePhoto: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const takeProfilePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setEditedProfile({
          ...editedProfile,
          profilePhoto: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ============ PROFILE UPDATE FUNCTIONS ============
  const handleEditPress = () => {
    setEditMode(true);
    setEditedProfile({ ...profile });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedProfile({ ...profile });
  };

  const handleSaveEdit = async () => {
    if (!editedProfile) return;
    setIsLoading(true);
    
    try {
      const updates = {
        firstName: editedProfile.firstName || "",
        lastName: editedProfile.lastName || "",
        email: editedProfile.email || "",
        phone: editedProfile.phone || "",
        emergencyContact: editedProfile.emergencyContact || "",
      };

      const response = await ApiService.updateProfile(updates);
      if (response && response.user) {
        setProfile(response.user);
        setOriginalProfile({ ...response.user });
        setEditedProfile({ ...response.user });
        setEditMode(false);
        
        setShowSuccessAnimation(true);
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowSuccessAnimation(false));
        
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  // ============ LOGOUT FUNCTIONS ============
  const handleLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  const performLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      await ApiService.logout();
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout error:", error);
      navigation.replace("Login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ============ SHARE PROFILE ============
  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my profile on SafePass!\n\nName: ${profile.firstName} ${profile.lastName}\nRole: ${getRoleConfig().label}\nID: ${profile.studentId || profile.staffId || profile.badgeNumber || 'N/A'}\nEmail: ${profile.email}`,
        title: 'Share Profile',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // ============ LANGUAGE PICKER ============
  const showLanguagePicker = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => setSelectedLanguage("English") },
        { text: "Spanish", onPress: () => setSelectedLanguage("Spanish") },
        { text: "French", onPress: () => setSelectedLanguage("French") },
        { text: "German", onPress: () => setSelectedLanguage("German") },
        { text: "Chinese", onPress: () => setSelectedLanguage("Chinese") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // ============ HELPER FUNCTIONS ============
  const getRoleConfig = () => {
    if (!profile) {
      return { color: '#3B82F6', bg: '#EFF6FF', icon: 'graduation-cap', label: 'Student', gradientColors: ['#3B82F6', '#2563EB'], emoji: '🎓' };
    }
    const configs = {
      admin: { color: '#8B5CF6', bg: '#F3E8FF', icon: 'crown', label: 'Administrator', gradientColors: ['#8B5CF6', '#7C3AED'], emoji: '👑' },
      security: { color: '#EF4444', bg: '#FEF2F2', icon: 'shield-check', label: 'Security Officer', gradientColors: ['#EF4444', '#DC2626'], emoji: '🛡️' },
      staff: { color: '#10B981', bg: '#ECFDF5', icon: 'briefcase', label: 'Staff Member', gradientColors: ['#10B981', '#059669'], emoji: '💼' },
      student: { color: '#3B82F6', bg: '#EFF6FF', icon: 'graduation-cap', label: 'Student', gradientColors: ['#3B82F6', '#2563EB'], emoji: '🎓' },
    };
    return configs[profile?.role] || configs.student;
  };

  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const isEditableField = (fieldName) => {
    if (!editMode) return false;
    if (!profile) return false;
    if (profile.role !== 'student') return true;
    return ['email', 'phone', 'emergencyContact'].includes(fieldName);
  };

  // Visible sections based on role
  const visibleSections = [
    { id: 'personal', label: 'Personal', icon: 'user', gradient: ['#667EEA', '#764BA2'] },
    { id: 'academic', label: 'Academic', icon: 'book-open', gradient: ['#10B981', '#059669'], visible: profile?.role === 'student' },
    { id: 'employment', label: 'Employment', icon: 'briefcase', gradient: ['#F59E0B', '#D97706'], visible: profile?.role === 'staff' },
    { id: 'security', label: 'Security', icon: 'shield', gradient: ['#EF4444', '#DC2626'], visible: profile?.role === 'security' },
    { id: 'preferences', label: 'Preferences', icon: 'settings', gradient: ['#6B7280', '#4B5563'] },
  ].filter(section => section.visible !== false);

  // ============ LOADING & ERROR STATES ============
  if (isLoading && !profile) {
    return (
      <SafeAreaView style={profileStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={profileStyles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={profileStyles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={profileStyles.errorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.errorBackButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={profileStyles.errorHeaderTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={profileStyles.errorContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={profileStyles.errorTitle}>Something went wrong</Text>
          <Text style={profileStyles.errorMessage}>{error}</Text>
          <TouchableOpacity style={profileStyles.retryButton} onPress={loadProfile}>
            <Text style={profileStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const roleConfig = getRoleConfig();
  const currentProfile = editMode ? editedProfile : profile;

  // ============ COMMON LOGOUT MODAL ============
  const LogoutModal = () => (
    <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={cancelLogout}>
      <View style={profileStyles.modalOverlay}>
        <Animated.View style={[profileStyles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#FEF2F2', '#FFFFFF']} style={profileStyles.modalGradient}>
            <View style={profileStyles.modalIcon}>
              <Ionicons name="log-out-outline" size={40} color="#EF4444" />
            </View>
            <Text style={profileStyles.modalTitle}>Sign Out</Text>
            <Text style={profileStyles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={profileStyles.modalButtons}>
              <TouchableOpacity style={profileStyles.modalCancel} onPress={cancelLogout}>
                <Text style={profileStyles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={profileStyles.modalConfirm} onPress={performLogout} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={profileStyles.modalConfirmText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  // ============ WEB LAYOUT ============
  if (isWeb) {
    return (
      <>
        <View style={profileStyles.webContainer}>
          {/* Collapsible Sidebar */}
          <Animated.View style={[profileStyles.webSidebar, { width: sidebarAnim }]}>
            <LinearGradient colors={['#1E293B', '#0F172A']} style={profileStyles.webSidebarHeader}>
              <View style={profileStyles.webLogo}>
                {!sidebarCollapsed && (
                  <MaterialCommunityIcons name="shield-check" size={32} color="#FFFFFF" />
                )}
                {!sidebarCollapsed && <Text style={profileStyles.webLogoText}>SafePass</Text>}
              </View>
              <TouchableOpacity onPress={toggleSidebar} style={profileStyles.webSidebarToggle}>
                <Ionicons 
                  name={sidebarCollapsed ? "menu-outline" : "chevron-back-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={profileStyles.webSidebarContent}>
              <View style={profileStyles.webUserInfo}>
                <LinearGradient colors={roleConfig.gradientColors} style={profileStyles.webUserAvatar}>
                  <Text style={profileStyles.webUserAvatarText}>{getInitials()}</Text>
                </LinearGradient>
                {!sidebarCollapsed && (
                  <>
                    <Text style={profileStyles.webUserName}>
                      {profile.firstName || ''} {profile.lastName || ''}
                    </Text>
                    <Text style={profileStyles.webUserRole}>{roleConfig.label}</Text>
                  </>
                )}
              </View>

              {visibleSections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    profileStyles.webNavItem,
                    activeSection === section.id && profileStyles.webNavItemActive,
                    sidebarCollapsed && profileStyles.webNavItemCollapsed
                  ]}
                  onPress={() => setActiveSection(section.id)}
                >
                  <LinearGradient
                    colors={activeSection === section.id ? section.gradient : ['#334155', '#334155']}
                    style={profileStyles.webNavIcon}
                  >
                    <Feather name={section.icon} size={18} color="#FFFFFF" />
                  </LinearGradient>
                  {!sidebarCollapsed && (
                    <Text style={[
                      profileStyles.webNavLabel,
                      activeSection === section.id && profileStyles.webNavLabelActive
                    ]}>
                      {section.label}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={[profileStyles.webLogoutButton, sidebarCollapsed && profileStyles.webLogoutButtonCollapsed]} 
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                {!sidebarCollapsed && <Text style={profileStyles.webLogoutText}>Sign Out</Text>}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Main Content */}
          <View style={profileStyles.webMainContent}>
            <View style={profileStyles.webHeader}>
              <View style={profileStyles.webHeaderLeft}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.webBackButton}>
                  <Ionicons name="arrow-back" size={22} color="#64748B" />
                </TouchableOpacity>
                <Text style={profileStyles.webHeaderTitle}>Profile</Text>
              </View>
              <View style={profileStyles.webHeaderRight}>
                {!editMode && (
                  <>
                    <TouchableOpacity onPress={shareProfile} style={profileStyles.webShareButton}>
                      <Ionicons name="share-outline" size={20} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEditPress} style={profileStyles.webEditButton}>
                      <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      <Text style={profileStyles.webEditButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <ScrollView style={profileStyles.webContent}>
              {/* Success Toast */}
              {showSuccessAnimation && (
                <Animated.View style={[profileStyles.webSuccessToast, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
                  <LinearGradient colors={['#10B981', '#059669']} style={profileStyles.webSuccessGradient}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={profileStyles.webSuccessText}>Profile Updated!</Text>
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Offline Banner */}
              {usingCache && (
                <View style={profileStyles.webOfflineBanner}>
                  <Ionicons name="cloud-offline-outline" size={18} color="#F59E0B" />
                  <Text style={profileStyles.webOfflineText}>Offline mode - showing cached data</Text>
                  <TouchableOpacity onPress={loadProfile}>
                    <Text style={profileStyles.webOfflineRetry}>Sync</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Hero Card */}
              <View style={profileStyles.webHeroCard}>
                <LinearGradient colors={roleConfig.gradientColors} style={profileStyles.webHeroGradient}>
                  <View style={profileStyles.webHeroContent}>
                    <View style={profileStyles.webAvatarWrapper}>
                      {currentProfile?.profilePhoto ? (
                        <Image source={{ uri: currentProfile.profilePhoto }} style={profileStyles.webAvatarImage} />
                      ) : (
                        <View style={profileStyles.webAvatarInitials}>
                          <Text style={profileStyles.webAvatarText}>{getInitials()}</Text>
                        </View>
                      )}
                      {editMode && (
                        <TouchableOpacity style={profileStyles.webAvatarEdit} onPress={() => {
                          Alert.alert("Change Photo", "Choose option", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Take Photo", onPress: takeProfilePhoto },
                            { text: "Choose from Gallery", onPress: pickProfilePhoto },
                          ]);
                        }}>
                          <Ionicons name="camera" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={profileStyles.webHeroName}>
                      {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                    </Text>
                    <View style={profileStyles.webHeroBadge}>
                      <Text style={profileStyles.webHeroBadgeEmoji}>{roleConfig.emoji}</Text>
                      <Text style={[profileStyles.webHeroBadgeText, { color: roleConfig.color }]}>
                        {roleConfig.label}
                      </Text>
                    </View>
                    <Text style={profileStyles.webHeroId}>
                      ID: {currentProfile?.studentId || currentProfile?.staffId || currentProfile?.badgeNumber || 'N/A'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Stats Row */}
              <View style={profileStyles.webStatsRow}>
                <View style={profileStyles.webStatCard}>
                  <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                  <Text style={profileStyles.webStatValue}>Jan 2024</Text>
                  <Text style={profileStyles.webStatLabel}>Member Since</Text>
                </View>
                <View style={profileStyles.webStatCard}>
                  <Ionicons name="time-outline" size={24} color="#10B981" />
                  <Text style={profileStyles.webStatValue}>Today</Text>
                  <Text style={profileStyles.webStatLabel}>Last Login</Text>
                </View>
                <View style={profileStyles.webStatCard}>
                  <View style={profileStyles.webStatusDot} />
                  <Text style={profileStyles.webStatValue}>Active</Text>
                  <Text style={profileStyles.webStatLabel}>Status</Text>
                </View>
              </View>

              {/* NFC Card */}
              <LinearGradient colors={['#1F2937', '#111827']} style={profileStyles.webNfcCard}>
                <View style={profileStyles.webNfcHeader}>
                  <MaterialCommunityIcons name="nfc-variant" size={32} color="#FFFFFF" />
                  <Text style={profileStyles.webNfcTitle}>NFC Access Card</Text>
                  <View style={profileStyles.webNfcChip} />
                </View>
                <Text style={profileStyles.webNfcNumber}>
                  {currentProfile?.nfcCardId || "**** **** **** 1234"}
                </Text>
                <View style={profileStyles.webNfcFooter}>
                  <Text style={profileStyles.webNfcName}>
                    {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                  </Text>
                  <Text style={profileStyles.webNfcExpiry}>VALID THRU 12/25</Text>
                </View>
              </LinearGradient>

              {/* Personal Section */}
              {activeSection === 'personal' && (
                <View style={profileStyles.webSectionCard}>
                  <Text style={profileStyles.webSectionTitle}>Personal Information</Text>
                  
                  <View style={profileStyles.webField}>
                    <Text style={profileStyles.webFieldLabel}>Full Name</Text>
                    {editMode ? (
                      <View style={profileStyles.webNameRow}>
                        <TextInput
                          style={[profileStyles.webInput, profileStyles.webHalfInput]}
                          value={currentProfile?.firstName || ""}
                          onChangeText={(text) => handleInputChange("firstName", text)}
                          placeholder="First Name"
                        />
                        <TextInput
                          style={[profileStyles.webInput, profileStyles.webHalfInput]}
                          value={currentProfile?.lastName || ""}
                          onChangeText={(text) => handleInputChange("lastName", text)}
                          placeholder="Last Name"
                        />
                      </View>
                    ) : (
                      <Text style={profileStyles.webFieldValue}>
                        {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                      </Text>
                    )}
                  </View>

                  <View style={profileStyles.webField}>
                    <Text style={profileStyles.webFieldLabel}>Email Address</Text>
                    {isEditableField('email') ? (
                      <TextInput
                        style={profileStyles.webInput}
                        value={currentProfile?.email || ""}
                        onChangeText={(text) => handleInputChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter email"
                      />
                    ) : (
                      <Text style={profileStyles.webFieldValue}>{currentProfile?.email || 'Not set'}</Text>
                    )}
                  </View>

                  <View style={profileStyles.webField}>
                    <Text style={profileStyles.webFieldLabel}>Phone Number</Text>
                    {isEditableField('phone') ? (
                      <TextInput
                        style={profileStyles.webInput}
                        value={currentProfile?.phone || ""}
                        onChangeText={(text) => handleInputChange("phone", text)}
                        keyboardType="phone-pad"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <Text style={profileStyles.webFieldValue}>{currentProfile?.phone || 'Not set'}</Text>
                    )}
                  </View>

                  <View style={profileStyles.webField}>
                    <Text style={profileStyles.webFieldLabel}>Emergency Contact</Text>
                    {isEditableField('emergencyContact') ? (
                      <TextInput
                        style={profileStyles.webInput}
                        value={currentProfile?.emergencyContact || ""}
                        onChangeText={(text) => handleInputChange("emergencyContact", text)}
                        placeholder="Name - Phone"
                      />
                    ) : (
                      <Text style={profileStyles.webFieldValue}>{currentProfile?.emergencyContact || 'Not set'}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Academic Section */}
              {activeSection === 'academic' && profile.role === 'student' && (
                <View style={profileStyles.webSectionCard}>
                  <Text style={profileStyles.webSectionTitle}>Academic Information</Text>
                  
                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="id-card-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Student ID</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.studentId || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="book-outline" size={20} color="#10B981" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Course/Program</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.course || 'Not set'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="bar-chart-outline" size={20} color="#F59E0B" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Year Level</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.yearLevel || 'Not set'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Employment Section */}
              {activeSection === 'employment' && profile.role === 'staff' && (
                <View style={profileStyles.webSectionCard}>
                  <Text style={profileStyles.webSectionTitle}>Employment Details</Text>
                  
                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="id-card-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Staff ID</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.staffId || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="business-outline" size={20} color="#8B5CF6" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Department</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.department || 'Not set'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="medal-outline" size={20} color="#EF4444" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Position</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.position || 'Not set'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Security Section */}
              {activeSection === 'security' && profile.role === 'security' && (
                <View style={profileStyles.webSectionCard}>
                  <Text style={profileStyles.webSectionTitle}>Security Details</Text>
                  
                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="badge-outline" size={20} color="#EF4444" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Badge Number</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.badgeNumber || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="time-outline" size={20} color="#F59E0B" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Shift Schedule</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.shift || 'Not set'}</Text>
                    </View>
                  </View>

                  <View style={profileStyles.webInfoRow}>
                    <View style={[profileStyles.webInfoIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="people-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={profileStyles.webInfoContent}>
                      <Text style={profileStyles.webInfoLabel}>Supervisor</Text>
                      <Text style={profileStyles.webInfoValue}>{currentProfile?.supervisor || 'Not set'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* PREFERENCES SECTION */}
              {activeSection === 'preferences' && (
                <View style={profileStyles.webSectionCard}>
                  <Text style={profileStyles.webSectionTitle}>App Preferences</Text>
                  
                  <View style={profileStyles.webPreferenceRow}>
                    <View style={profileStyles.webPreferenceLeft}>
                      <Ionicons name="notifications-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.webPreferenceTitle}>Push Notifications</Text>
                        <Text style={profileStyles.webPreferenceDesc}>Get real-time updates about your visits</Text>
                      </View>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={profileStyles.webPreferenceRow}>
                    <View style={profileStyles.webPreferenceLeft}>
                      <Ionicons name="finger-print-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.webPreferenceTitle}>Biometric Login</Text>
                        <Text style={profileStyles.webPreferenceDesc}>Quick and secure access to your account</Text>
                      </View>
                    </View>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={async (value) => {
                        if (value) {
                          await setupBiometric();
                          setBiometricEnabled(value);
                        } else {
                          setBiometricEnabled(false);
                        }
                      }}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={profileStyles.webPreferenceRow}>
                    <View style={profileStyles.webPreferenceLeft}>
                      <Ionicons name="moon-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.webPreferenceTitle}>Dark Mode</Text>
                        <Text style={profileStyles.webPreferenceDesc}>Better viewing experience at night</Text>
                      </View>
                    </View>
                    <Switch
                      value={darkModeEnabled}
                      onValueChange={setDarkModeEnabled}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <TouchableOpacity style={profileStyles.webPreferenceRow} onPress={showLanguagePicker}>
                    <View style={profileStyles.webPreferenceLeft}>
                      <Ionicons name="language-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.webPreferenceTitle}>Language</Text>
                        <Text style={profileStyles.webPreferenceDesc}>Choose your preferred language</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={profileStyles.webPreferenceDesc}>{selectedLanguage}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons for Edit Mode */}
              {editMode && (
                <View style={profileStyles.webActions}>
                  <TouchableOpacity style={profileStyles.webSaveButton} onPress={handleSaveEdit}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={profileStyles.webSaveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={profileStyles.webCancelButton} onPress={handleCancelEdit}>
                    <Text style={profileStyles.webCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={profileStyles.webVersion}>SafePass v2.1.0</Text>
            </ScrollView>
          </View>
        </View>
        <LogoutModal />
      </>
    );
  }

  // ============ MOBILE LAYOUT ============
  return (
    <>
      <SafeAreaView style={profileStyles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        
        <Animated.View style={[profileStyles.container, { opacity: fadeAnim }]}>
          {/* Mobile Header */}
          <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={profileStyles.headerGradient}
          >
            <View style={profileStyles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={profileStyles.headerTitle}>Profile</Text>
              <View style={profileStyles.headerActions}>
                {!editMode && (
                  <>
                    <TouchableOpacity onPress={shareProfile} style={profileStyles.shareButton}>
                      <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEditPress} style={profileStyles.editButton}>
                      <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={profileStyles.scrollContainer}>
            {/* Success Toast */}
            {showSuccessAnimation && (
              <Animated.View style={[profileStyles.successToast, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
                <LinearGradient colors={['#10B981', '#059669']} style={profileStyles.successToastGradient}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={profileStyles.successToastText}>Profile Updated!</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Offline Banner */}
            {usingCache && (
              <View style={profileStyles.offlineBanner}>
                <Ionicons name="cloud-offline-outline" size={18} color="#F59E0B" />
                <Text style={profileStyles.offlineBannerText}>Offline mode - showing cached data</Text>
                <TouchableOpacity onPress={loadProfile}>
                  <Text style={profileStyles.offlineRetryText}>Sync</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Hero Section */}
            <Animated.View style={[profileStyles.heroSection, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient colors={roleConfig.gradientColors} style={profileStyles.heroGradient}>
                <TouchableOpacity 
                  style={profileStyles.avatarWrapper}
                  onPress={() => {
                    if (editMode && !isUploadingPhoto) {
                      Alert.alert("Change Photo", "Choose option", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Take Photo", onPress: takeProfilePhoto },
                        { text: "Choose from Gallery", onPress: pickProfilePhoto },
                      ]);
                    }
                  }}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <View style={profileStyles.avatarInitials}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : currentProfile?.profilePhoto ? (
                    <Image source={{ uri: currentProfile.profilePhoto }} style={profileStyles.avatarImage} />
                  ) : (
                    <View style={profileStyles.avatarInitials}>
                      <Text style={profileStyles.avatarText}>{getInitials()}</Text>
                    </View>
                  )}
                  {editMode && !isUploadingPhoto && (
                    <View style={profileStyles.avatarEditBadge}>
                      <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <Text style={profileStyles.heroName}>
                  {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                </Text>
                
                <View style={profileStyles.heroBadge}>
                  <Text style={profileStyles.heroBadgeEmoji}>{roleConfig.emoji}</Text>
                  <Text style={[profileStyles.heroBadgeText, { color: roleConfig.color }]}>
                    {roleConfig.label}
                  </Text>
                </View>
                
                <Text style={profileStyles.heroId}>
                  ID: {currentProfile?.studentId || currentProfile?.staffId || currentProfile?.badgeNumber || 'N/A'}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Stats Cards */}
            <View style={profileStyles.statsContainer}>
              <View style={profileStyles.statCard}>
                <View style={[profileStyles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="calendar-outline" size={22} color="#3B82F6" />
                </View>
                <Text style={profileStyles.statNumber}>Jan 2024</Text>
                <Text style={profileStyles.statDescription}>Member Since</Text>
              </View>
              
              <View style={profileStyles.statCard}>
                <View style={[profileStyles.statIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="time-outline" size={22} color="#10B981" />
                </View>
                <Text style={profileStyles.statNumber}>Today</Text>
                <Text style={profileStyles.statDescription}>Last Login</Text>
              </View>
              
              <View style={profileStyles.statCard}>
                <View style={[profileStyles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                  <View style={profileStyles.statusIndicator} />
                </View>
                <Text style={profileStyles.statNumber}>Active</Text>
                <Text style={profileStyles.statDescription}>Status</Text>
              </View>
            </View>

            {/* NFC Card */}
            <LinearGradient colors={['#1F2937', '#111827']} style={profileStyles.nfcCardPremium}>
              <View style={profileStyles.nfcCardHeader}>
                <View style={profileStyles.nfcCardLeft}>
                  <MaterialCommunityIcons name="nfc-variant" size={28} color="#FFFFFF" />
                  <Text style={profileStyles.nfcCardTitle}>NFC Access Card</Text>
                </View>
                <View style={profileStyles.nfcChipPremium} />
              </View>
              <Text style={profileStyles.nfcCardNumber}>
                {currentProfile?.nfcCardId || "**** **** **** 1234"}
              </Text>
              <View style={profileStyles.nfcCardFooter}>
                <Text style={profileStyles.nfcCardName}>
                  {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                </Text>
                <Text style={profileStyles.nfcCardExpiry}>VALID THRU 12/25</Text>
              </View>
            </LinearGradient>

            {/* Section Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={profileStyles.sectionNav}>
              {visibleSections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    profileStyles.navItem,
                    activeSection === section.id && profileStyles.navItemActive
                  ]}
                  onPress={() => setActiveSection(section.id)}
                >
                  <LinearGradient
                    colors={activeSection === section.id ? section.gradient : ['#F3F4F6', '#F3F4F6']}
                    style={profileStyles.navIcon}
                  >
                    <Feather name={section.icon} size={16} color={activeSection === section.id ? "#FFFFFF" : "#6B7280"} />
                  </LinearGradient>
                  <Text style={[
                    profileStyles.navLabel,
                    activeSection === section.id && profileStyles.navLabelActive
                  ]}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Content Sections */}
            <View style={profileStyles.contentArea}>
              {/* Personal Section (simplified for mobile - add all fields similarly) */}
              {activeSection === 'personal' && (
                <View style={profileStyles.sectionCard}>
                  <Text style={profileStyles.sectionCardTitle}>Personal Information</Text>
                  
                  <View style={profileStyles.formField}>
                    <Text style={profileStyles.formLabel}>Full Name</Text>
                    {editMode ? (
                      <View style={profileStyles.nameRow}>
                        <TextInput
                          style={[profileStyles.formInput, profileStyles.halfInput]}
                          value={currentProfile?.firstName || ""}
                          onChangeText={(text) => handleInputChange("firstName", text)}
                          placeholder="First Name"
                          placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                          style={[profileStyles.formInput, profileStyles.halfInput]}
                          value={currentProfile?.lastName || ""}
                          onChangeText={(text) => handleInputChange("lastName", text)}
                          placeholder="Last Name"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    ) : (
                      <Text style={profileStyles.formValue}>
                        {currentProfile?.firstName || ''} {currentProfile?.lastName || ''}
                      </Text>
                    )}
                  </View>

                  <View style={profileStyles.formField}>
                    <Text style={profileStyles.formLabel}>Email Address</Text>
                    {isEditableField('email') ? (
                      <TextInput
                        style={profileStyles.formInput}
                        value={currentProfile?.email || ""}
                        onChangeText={(text) => handleInputChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter email"
                        placeholderTextColor="#9CA3AF"
                      />
                    ) : (
                      <Text style={profileStyles.formValue}>{currentProfile?.email || 'Not set'}</Text>
                    )}
                  </View>

                  <View style={profileStyles.formField}>
                    <Text style={profileStyles.formLabel}>Phone Number</Text>
                    {isEditableField('phone') ? (
                      <TextInput
                        style={profileStyles.formInput}
                        value={currentProfile?.phone || ""}
                        onChangeText={(text) => handleInputChange("phone", text)}
                        keyboardType="phone-pad"
                        placeholder="Enter phone number"
                        placeholderTextColor="#9CA3AF"
                      />
                    ) : (
                      <Text style={profileStyles.formValue}>{currentProfile?.phone || 'Not set'}</Text>
                    )}
                  </View>

                  <View style={profileStyles.formField}>
                    <Text style={profileStyles.formLabel}>Emergency Contact</Text>
                    {isEditableField('emergencyContact') ? (
                      <TextInput
                        style={profileStyles.formInput}
                        value={currentProfile?.emergencyContact || ""}
                        onChangeText={(text) => handleInputChange("emergencyContact", text)}
                        placeholder="Name - Phone"
                        placeholderTextColor="#9CA3AF"
                      />
                    ) : (
                      <Text style={profileStyles.formValue}>{currentProfile?.emergencyContact || 'Not set'}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* PREFERENCES SECTION FOR MOBILE */}
              {activeSection === 'preferences' && (
                <View style={profileStyles.sectionCard}>
                  <Text style={profileStyles.sectionCardTitle}>App Preferences</Text>
                  
                  <View style={profileStyles.preferenceRow}>
                    <View style={profileStyles.preferenceLeft}>
                      <Ionicons name="notifications-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.preferenceTitle}>Push Notifications</Text>
                        <Text style={profileStyles.preferenceDesc}>Get real-time updates</Text>
                      </View>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={profileStyles.preferenceRow}>
                    <View style={profileStyles.preferenceLeft}>
                      <Ionicons name="finger-print-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.preferenceTitle}>Biometric Login</Text>
                        <Text style={profileStyles.preferenceDesc}>Quick and secure access</Text>
                      </View>
                    </View>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={async (value) => {
                        if (value) {
                          await setupBiometric();
                          setBiometricEnabled(value);
                        } else {
                          setBiometricEnabled(false);
                        }
                      }}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={profileStyles.preferenceRow}>
                    <View style={profileStyles.preferenceLeft}>
                      <Ionicons name="moon-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.preferenceTitle}>Dark Mode</Text>
                        <Text style={profileStyles.preferenceDesc}>Better for night viewing</Text>
                      </View>
                    </View>
                    <Switch
                      value={darkModeEnabled}
                      onValueChange={setDarkModeEnabled}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <TouchableOpacity style={profileStyles.preferenceRow} onPress={showLanguagePicker}>
                    <View style={profileStyles.preferenceLeft}>
                      <Ionicons name="language-outline" size={22} color="#6B7280" />
                      <View>
                        <Text style={profileStyles.preferenceTitle}>Language</Text>
                        <Text style={profileStyles.preferenceDesc}>{selectedLanguage}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons for Edit Mode */}
              {editMode && (
                <View style={profileStyles.actionContainer}>
                  <TouchableOpacity style={profileStyles.primaryButton} onPress={handleSaveEdit} disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={profileStyles.primaryButtonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={profileStyles.secondaryButton} onPress={handleCancelEdit}>
                    <Text style={profileStyles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!editMode && (
                <TouchableOpacity style={profileStyles.dangerButton} onPress={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                      <Text style={profileStyles.dangerButtonText}>Sign Out</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <Text style={profileStyles.versionText}>SafePass v2.1.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
      <LogoutModal />
    </>
  );
}