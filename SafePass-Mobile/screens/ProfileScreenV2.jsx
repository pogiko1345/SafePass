import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Switch,
  Share,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import ApiService from "../utils/ApiService";

const Storage =
  Platform.OS === "web" ? require("../utils/webStorage").default : AsyncStorage;

const DEFAULT_PROFILE = {
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "visitor",
  employeeId: "",
  emergencyContact: "",
  department: "",
  position: "",
  shift: "",
  nfcCardId: "",
  profilePhoto: null,
};

const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese"];

export default function ProfileScreenV2({ navigation, onLogout }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [tab, setTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [error, setError] = useState(null);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: Platform.OS !== "web",
    }).start();
    loadPreferences();
    loadProfile();
    requestPermissions();
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (profile) savePreferences();
  }, [
    notificationsEnabled,
    biometricEnabled,
    darkModeEnabled,
    selectedLanguage,
    profile,
  ]);

  const roleConfig = useMemo(() => {
    const role = String(profile?.role || "visitor").toLowerCase();
    const map = {
      admin: {
        label: "Administrator",
        icon: "settings-outline",
        gradients: ["#7C3AED", "#4F46E5"],
      },
      security: {
        label: "Security Team",
        icon: "shield-checkmark-outline",
        gradients: ["#DC2626", "#F97316"],
      },
      guard: {
        label: "Security Team",
        icon: "shield-checkmark-outline",
        gradients: ["#DC2626", "#F97316"],
      },
      staff: {
        label: "Staff Member",
        icon: "briefcase-outline",
        gradients: ["#0F766E", "#14B8A6"],
      },
      visitor: {
        label: "Visitor Account",
        icon: "person-outline",
        gradients: ["#1D4ED8", "#0EA5E9"],
      },
    };
    return map[role] || map.visitor;
  }, [profile]);

  const currentProfile = editMode ? editedProfile : profile;
  const infoRows = [
    ["First Name", "firstName", true],
    ["Last Name", "lastName", true],
    ["Email", "email", true],
    ["Phone", "phone", true],
    ["Emergency Contact", "emergencyContact", true],
    ["Department", "department", false],
    ["Position", "position", false],
    ["Shift", "shift", false],
  ];

  const loadPreferences = async () => {
    try {
      const [notifications, biometric, darkMode, language] = await Promise.all([
        Storage.getItem("notificationsEnabled"),
        Storage.getItem("biometricEnabled"),
        Storage.getItem("darkModeEnabled"),
        Storage.getItem("selectedLanguage"),
      ]);
      if (notifications !== null)
        setNotificationsEnabled(notifications === "true");
      if (biometric !== null) setBiometricEnabled(biometric === "true");
      if (darkMode !== null) setDarkModeEnabled(darkMode === "true");
      if (language) setSelectedLanguage(language);
    } catch (e) {
      console.error("Load preferences error:", e);
    }
  };

  const savePreferences = async () => {
    try {
      await Promise.all([
        Storage.setItem("notificationsEnabled", String(notificationsEnabled)),
        Storage.setItem("biometricEnabled", String(biometricEnabled)),
        Storage.setItem("darkModeEnabled", String(darkModeEnabled)),
        Storage.setItem("selectedLanguage", selectedLanguage),
      ]);
    } catch (e) {
      console.error("Save preferences error:", e);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (e) {
        console.error("Permission request error:", e);
      }
    }
  };

  const checkBiometricAvailability = async () => {
    if (Platform.OS === "web") return setBiometricEnabled(false);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) setBiometricEnabled(false);
    } catch (e) {
      setBiometricEnabled(false);
    }
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    setUsingCache(false);
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser) return navigation.replace("Login");
      const merged = { ...DEFAULT_PROFILE, ...currentUser };
      setProfile(merged);
      setEditedProfile(merged);
      try {
        const response = await ApiService.getProfile();
        if (response?.user) {
          const fullProfile = {
            ...DEFAULT_PROFILE,
            ...merged,
            ...response.user,
          };
          setProfile(fullProfile);
          setEditedProfile(fullProfile);
        } else {
          setUsingCache(true);
        }
      } catch {
        setUsingCache(true);
      }
    } catch (e) {
      setError(e.message || "Unable to load profile");
      try {
        const storedUser = await Storage.getItem("currentUser");
        if (storedUser) {
          const fallback = { ...DEFAULT_PROFILE, ...JSON.parse(storedUser) };
          setProfile(fallback);
          setEditedProfile(fallback);
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

  const choosePhoto = async (source) => {
    setIsUploadingPhoto(true);
    try {
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
      if (!result.canceled) {
        setEditedProfile((prev) => ({
          ...prev,
          profilePhoto: result.assets[0].uri,
        }));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to update profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoPress = () => {
    if (!editMode || isUploadingPhoto) return;
    if (Platform.OS === "web") return choosePhoto("gallery");
    Alert.alert("Update Photo", "Choose how you want to update your photo.", [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: () => choosePhoto("camera") },
      { text: "Choose from Gallery", onPress: () => choosePhoto("gallery") },
    ]);
  };
  const handleSave = async () => {
    if (!editedProfile) return;
    setIsSaving(true);
    try {
      const updates = {
        firstName: editedProfile.firstName || "",
        lastName: editedProfile.lastName || "",
        email: editedProfile.email || "",
        phone: editedProfile.phone || "",
        emergencyContact: editedProfile.emergencyContact || "",
        profilePhoto: editedProfile.profilePhoto || null,
      };
      const response = await ApiService.updateProfile(updates);
      if (!response?.user)
        throw new Error("No updated profile returned from server");
      const updated = {
        ...DEFAULT_PROFILE,
        ...profile,
        ...response.user,
        profilePhoto:
          editedProfile.profilePhoto || response.user.profilePhoto || null,
      };
      setProfile(updated);
      setEditedProfile(updated);
      setEditMode(false);
      setShowSavedBanner(true);
      setTimeout(() => setShowSavedBanner(false), 2200);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const shareProfile = async () => {
    if (!profile) return;
    try {
      await Share.share({
        title: "SafePass Profile",
        message: `SafePass Profile\n\nName: ${profile.firstName} ${profile.lastName}\nRole: ${roleConfig.label}\nEmail: ${profile.email}\nPhone: ${profile.phone || "Not set"}`,
      });
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  const toggleBiometric = async (value) => {
    if (Platform.OS === "web") return setBiometricEnabled(false);
    if (!value) return setBiometricEnabled(false);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use passcode",
      });
      if (result.success) setBiometricEnabled(true);
      else {
        setBiometricEnabled(false);
        Alert.alert(
          "Authentication Failed",
          "We could not verify your identity.",
        );
      }
    } catch {
      setBiometricEnabled(false);
    }
  };

  const showLanguagePicker = () => {
    Alert.alert("Select Language", "Choose your preferred language", [
      ...LANGUAGES.map((language) => ({
        text: language,
        onPress: () => setSelectedLanguage(language),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const performLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      await ApiService.logout();
      if (onLogout) onLogout();
      navigation.replace("Login");
    } catch {
      if (onLogout) onLogout();
      navigation.replace("Login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = () =>
    `${currentProfile?.firstName?.charAt(0) || ""}${currentProfile?.lastName?.charAt(0) || ""}`
      .trim()
      .toUpperCase() || "SP";
  const identityLine =
    currentProfile?.employeeId ||
    currentProfile?.nfcCardId ||
    currentProfile?._id ||
    "SafePass Account";

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.errorTitle}>Unable to load profile</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!currentProfile) return null;

  const renderOverview = () => (
    <View style={styles.stack}>
      <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
        {[
          { l: "Profile Status", v: "Complete", h: "Ready for campus access" },
          {
            l: "Contact",
            v: currentProfile.phone || "Missing",
            h: "Primary mobile number",
          },
          {
            l: "Access Card",
            v: currentProfile.nfcCardId ? "Issued" : "Pending",
            h: "NFC credential status",
          },
        ].map((item) => (
          <View key={item.l} style={styles.metricCard}>
            <Text style={styles.kicker}>{item.l}</Text>
            <Text style={styles.metricValue}>{item.v}</Text>
            <Text style={styles.muted}>{item.h}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Summary</Text>
        <Text style={styles.muted}>
          This profile keeps your identity, contact details, and access
          credentials in one place for both mobile and web.
        </Text>
      </View>
    </View>
  );

  const renderAccount = () => (
    <View style={styles.card}>
      {infoRows.map(([label, key, editable]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.kicker}>{label}</Text>
          {editMode && editable ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.[key] || ""}
              onChangeText={(text) =>
                setEditedProfile((prev) => ({ ...prev, [key]: text }))
              }
              autoCapitalize={key === "email" ? "none" : "words"}
              keyboardType={
                key === "phone"
                  ? "phone-pad"
                  : key === "email"
                    ? "email-address"
                    : "default"
              }
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor="#94A3B8"
            />
          ) : (
            <Text style={styles.fieldValue}>
              {currentProfile?.[key] || "Not set"}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderAccess = () => (
    <View style={styles.stack}>
      <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.accessCard}>
        <Text style={styles.accessLabel}>Access Credential</Text>
        <Text style={styles.accessValue}>
          {currentProfile.nfcCardId || "No NFC card assigned"}
        </Text>
        <Text style={styles.accessHint}>
          Use this profile as your account reference for campus access services.
        </Text>
      </LinearGradient>
      <View style={styles.card}>
        {[
          ["Role", roleConfig.label],
          ["Employee ID", currentProfile.employeeId || "Not assigned"],
          ["NFC Card", currentProfile.nfcCardId || "Not issued"],
          ["Account Status", "Active"],
        ].map(([label, value]) => (
          <View key={label} style={styles.field}>
            <Text style={styles.kicker}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.card}>
      <View style={styles.prefRow}>
        <View style={styles.prefText}>
          <Text style={styles.prefTitle}>Push Notifications</Text>
          <Text style={styles.muted}>
            Receive alerts about activity and account updates.
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={styles.prefRow}>
        <View style={styles.prefText}>
          <Text style={styles.prefTitle}>Biometric Login</Text>
          <Text style={styles.muted}>
            Use your device biometrics for faster sign in.
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={toggleBiometric}
          trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={styles.prefRow}>
        <View style={styles.prefText}>
          <Text style={styles.prefTitle}>Dark Mode</Text>
          <Text style={styles.muted}>
            Save this preference for future theme support.
          </Text>
        </View>
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <TouchableOpacity style={styles.prefRow} onPress={showLanguagePicker}>
        <View style={styles.prefText}>
          <Text style={styles.prefTitle}>Language</Text>
          <Text style={styles.muted}>
            Current selection: {selectedLanguage}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {showSavedBanner && (
              <View style={styles.banner}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.bannerText}>
                  Profile updated successfully
                </Text>
              </View>
            )}
            {usingCache && (
              <View style={styles.cache}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={18}
                  color="#B45309"
                />
                <Text style={styles.cacheText}>
                  Offline fallback is active. Showing cached profile data.
                </Text>
                <TouchableOpacity onPress={loadProfile}>
                  <Text style={styles.cacheAction}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.hero}>
              <LinearGradient
                colors={roleConfig.gradients}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroTop}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.heroActions}>
                    {!editMode && (
                      <>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={shareProfile}
                        >
                          <Ionicons
                            name="share-social-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => setEditMode(true)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={15}
                            color="#0F172A"
                          />
                          <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.avatarWrap}
                  onPress={handlePhotoPress}
                  activeOpacity={editMode ? 0.85 : 1}
                >
                  {isUploadingPhoto ? (
                    <View style={styles.avatar}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : currentProfile.profilePhoto ? (
                    <Image
                      source={{ uri: currentProfile.profilePhoto }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                  )}
                  {editMode && (
                    <View style={styles.cameraBadge}>
                      <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.heroKicker}>SafePass Profile</Text>
                <Text style={styles.heroName}>
                  {currentProfile.firstName} {currentProfile.lastName}
                </Text>
                <View style={styles.rolePill}>
                  <Ionicons name={roleConfig.icon} size={14} color="#0F172A" />
                  <Text style={styles.rolePillText}>{roleConfig.label}</Text>
                </View>
                <Text style={styles.heroSub}>{identityLine}</Text>
              </LinearGradient>
            </View>
            <View style={[styles.shell, isDesktop && styles.shellDesktop]}>
              <View style={[styles.main, isDesktop && styles.mainDesktop]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabs}
                >
                  {[
                    ["overview", "Overview", "grid-outline"],
                    ["account", "Account", "person-circle-outline"],
                    ["access", "Access", "shield-checkmark-outline"],
                    ["preferences", "Preferences", "options-outline"],
                  ].map(([id, label, icon]) => {
                    const active = tab === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        style={[styles.tabBtn, active && styles.tabBtnActive]}
                        onPress={() => setTab(id)}
                      >
                        <Ionicons
                          name={icon}
                          size={16}
                          color={active ? "#FFFFFF" : "#64748B"}
                        />
                        <Text
                          style={[
                            styles.tabText,
                            active && styles.tabTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {tab === "overview" && renderOverview()}
                {tab === "account" && renderAccount()}
                {tab === "access" && renderAccess()}
                {tab === "preferences" && renderPreferences()}
              </View>
              <View style={[styles.side, isDesktop && styles.sideDesktop]}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Session Tools</Text>
                  <Text style={styles.muted}>
                    Manage edits, sync your profile, or sign out securely.
                  </Text>
                  <View style={styles.actions}>
                    {editMode ? (
                      <>
                        <TouchableOpacity
                          style={styles.primaryBtn}
                          onPress={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color="#FFFFFF"
                              />
                              <Text style={styles.primaryBtnText}>
                                Save Changes
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secondaryBtn}
                          onPress={() => {
                            setEditedProfile(profile);
                            setEditMode(false);
                          }}
                        >
                          <Text style={styles.secondaryBtnText}>
                            Cancel Editing
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.secondaryBtn}
                          onPress={loadProfile}
                        >
                          <Text style={styles.secondaryBtnText}>
                            Refresh Profile
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.dangerBtn}
                          onPress={() => setShowLogoutModal(true)}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <>
                              <Ionicons
                                name="log-out-outline"
                                size={18}
                                color="#DC2626"
                              />
                              <Text style={styles.dangerBtnText}>Sign Out</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Account Notes</Text>
                  <View style={styles.note}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#2563EB"
                    />
                    <Text style={styles.noteText}>
                      Keep your contact details updated for smoother account
                      recovery.
                    </Text>
                  </View>
                  <View style={styles.note}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#2563EB"
                    />
                    <Text style={styles.noteText}>
                      Your mobile and web layouts now use the same responsive
                      profile structure.
                    </Text>
                  </View>
                  <Text style={styles.version}>SafePass v2.1.0</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>
              Do you want to end your current SafePass session?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={performLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0px 10px 28px rgba(15,23,42,0.08)" },
});
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 36 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  banner: {
    alignSelf: "center",
    marginTop: 14,
    marginBottom: -4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  bannerText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  cache: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    gap: 10,
  },
  cacheText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#92400E",
    fontWeight: "600",
  },
  cacheAction: { fontSize: 12, fontWeight: "800", color: "#1D4ED8" },
  hero: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 30,
    overflow: "hidden",
    ...shadow,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 56, android: 28, web: 28 }),
    paddingBottom: 24,
    alignItems: "center",
  },
  heroTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editBtnText: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarImg: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 34, fontWeight: "800", color: "#FFFFFF" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.76)",
    textTransform: "uppercase",
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    marginBottom: 8,
  },
  rolePillText: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  heroSub: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  shell: { paddingHorizontal: 20, paddingTop: 18, gap: 18 },
  shellDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: 1280,
    alignSelf: "center",
    width: "100%",
  },
  main: { width: "100%" },
  mainDesktop: { flex: 1.45, minWidth: 0 },
  side: { width: "100%", gap: 18 },
  sideDesktop: { flex: 0.85, minWidth: 300 },
  tabs: { gap: 10 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabBtnActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  stack: { gap: 18 },
  grid: { gap: 14 },
  gridDesktop: { flexDirection: "row" },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 18,
    ...shadow,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#94A3B8",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  muted: { fontSize: 13, lineHeight: 19, color: "#64748B" },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 20,
    ...shadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  field: { marginBottom: 16 },
  fieldValue: {
    fontSize: 15,
    lineHeight: 22,
    color: "#0F172A",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  accessCard: { borderRadius: 24, padding: 20, ...shadow },
  accessLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 10,
  },
  accessValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  accessHint: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.8)" },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  prefText: { flex: 1 },
  prefTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  actions: { gap: 12, marginTop: 14 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1D4ED8",
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "700", color: "#334155" },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerBtnText: { fontSize: 14, fontWeight: "800", color: "#DC2626" },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
    fontWeight: "500",
  },
  version: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    ...shadow,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalSecondary: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSecondaryText: { fontSize: 14, fontWeight: "700", color: "#334155" },
  modalPrimary: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalPrimaryText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
});
