import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";
import {
  BRAND,
  MobileBottomNav,
  MobileEmptyState,
  MobileLoadingState,
  MobileStatusBadge,
} from "../components/mobile/MobileRoleComponents";

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

const isSameCalendarDay = (value, referenceDate = new Date()) => {
  if (!value) return false;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return false;

  return (
    target.getFullYear() === referenceDate.getFullYear() &&
    target.getMonth() === referenceDate.getMonth() &&
    target.getDate() === referenceDate.getDate()
  );
};

const formatDuration = (minutes) => {
  const totalMinutes = Number(minutes || 0);
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "Pending";

  const hours = Math.floor(totalMinutes / 60);
  const remainder = totalMinutes % 60;

  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
};

const formatProfileDetail = (...values) => values.filter(Boolean).join(" | ") || "Not configured";

const studentTabs = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "history", label: "History", icon: "time-outline", activeIcon: "time" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

const getStudentName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
  user?.fullName ||
  user?.email ||
  "Student";

const getStatusLabel = (record, isCurrentDay = false) => {
  if (!record && isCurrentDay) return "Not In";
  if (record?.checkInTime && !record?.checkOutTime) return "Inside";
  if (record?.checkOutTime) return "Checked Out";
  if (record?.status) return String(record.status).replace(/_/g, " ");
  return "Not In";
};

export default function StudentDashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tapActionLoading, setTapActionLoading] = useState("");
  const [accountMode, setAccountMode] = useState("view");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    emergencyContact: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadData = useCallback(async () => {
    const [profileResponse, attendanceResponse] = await Promise.all([
      ApiService.getProfile(),
      ApiService.getMyAttendance({ limit: 30 }),
    ]);

    const profileUser = profileResponse?.user || null;
    if (!profileUser) {
      navigation.replace("Login");
      return;
    }

    setUser(profileUser);
    setAttendance(Array.isArray(attendanceResponse?.attendance) ? attendanceResponse.attendance : []);
  }, [navigation]);

  useEffect(() => {
    const run = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error("Load student dashboard error:", error);
        Alert.alert("Dashboard Error", error?.message || "Unable to load your student dashboard.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadData]);

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
      emergencyContact: user?.emergencyContact || "",
    });
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const performLogout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error("Student logout error:", error);
    } finally {
      await ApiService.clearAuth();
      navigation.replace("RoleSelect");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Would you like to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: performLogout },
      ],
    );
  };

  const todayRecord = useMemo(
    () => attendance.find((record) => isSameCalendarDay(record?.attendanceDate || record?.checkInTime)) || null,
    [attendance],
  );
  const isCheckedIn = Boolean(todayRecord?.checkInTime && !todayRecord?.checkOutTime);
  const roleLabel = String(user?.role || "").toLowerCase() === "teacher" ? "Teacher" : "Student";
  const studentName = getStudentName(user);
  const smsEnabled = Boolean(user?.smsOptIn && user?.guardianPhone);
  const guardianEmailEnabled = Boolean(user?.guardianEmail);
  const guardianNoticeEnabled = smsEnabled || guardianEmailEnabled;
  const todayStatus = isCheckedIn
    ? "inside"
    : todayRecord?.checkOutTime
      ? "checked_out"
      : todayRecord?.status || "not_checked_in";

  const monthStats = useMemo(() => {
    const now = new Date();
    const monthRecords = attendance.filter((item) => {
      const value = item?.attendanceDate || item?.checkInTime || item?.createdAt;
      const date = value ? new Date(value) : null;
      return (
        date &&
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    });
    const present = monthRecords.filter((item) =>
      ["present", "inside", "checked_out", "completed"].includes(String(item.status || "").toLowerCase()),
    ).length;
    const late = monthRecords.filter((item) => Number(item.lateMinutes || 0) > 0 || String(item.status || "").toLowerCase() === "late").length;
    const completed = monthRecords.filter((item) => item.checkInTime && item.checkOutTime).length;
    return { present, late, completed, total: monthRecords.length };
  }, [attendance]);

  const currentSessionDuration = useMemo(() => {
    if (!todayRecord?.checkInTime) return "Pending";

    const endTime = todayRecord.checkOutTime ? new Date(todayRecord.checkOutTime) : new Date();
    const startTime = new Date(todayRecord.checkInTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) return "Pending";

    return formatDuration(Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000)));
  }, [todayRecord]);

  const handleAttendanceTap = async (action) => {
    if (tapActionLoading) return;

    setTapActionLoading(action);
    try {
      const response = await ApiService.submitMyAttendanceTap({
        action,
        source: "mobile_app",
        office: "Student Mobile Checkpoint",
        floor: "Mobile",
        checkpointId: "student-mobile-self-check",
      });

      if (response?.attendance) {
        setAttendance((currentRecords) => [
          response.attendance,
          ...currentRecords.filter((record) => String(record._id) !== String(response.attendance._id)),
        ]);
      }

      await loadData();
      Alert.alert(
        action === "check_in" ? "Checked In" : "Checked Out",
        response?.message || "Your attendance was recorded.",
      );
    } catch (error) {
      Alert.alert("Attendance Error", error?.message || "Unable to record your attendance.");
    } finally {
      setTapActionLoading("");
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
      emergencyContact: user?.emergencyContact || "",
    });
    setAccountMode("view");
  };

  const handleSaveProfile = async () => {
    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const email = profileForm.email.trim().toLowerCase();
    const username = profileForm.username.trim().toLowerCase();
    const phone = String(profileForm.phone || "").replace(/[^\d+]/g, "");
    const emergencyContact = profileForm.emergencyContact.trim();

    if (!firstName || !lastName) {
      Alert.alert("Missing Details", "First name and last name are required.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!username) {
      Alert.alert("Missing Username", "Username is required.");
      return;
    }

    if (phone && !/^(?:\+63|0)\d{10}$/.test(phone)) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid Philippine mobile number like 09XXXXXXXXX or +639XXXXXXXXX.",
      );
      return;
    }

    setProfileSaving(true);
    try {
      const response = await ApiService.updateProfile({
        firstName,
        lastName,
        email,
        username,
        phone,
        emergencyContact,
      });

      if (response?.user) {
        setUser(response.user);
      }

      setAccountMode("view");
      Alert.alert("Profile Updated", "Your account details were updated successfully.");
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
      setAccountMode("view");
      Alert.alert("Password Updated", "Your password was changed successfully.");
    } catch (error) {
      Alert.alert("Password Update Failed", error?.message || "Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{studentName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={19} color={BRAND.blue} />
        </TouchableOpacity>
      </View>
      <Text style={styles.eyebrow}>{roleLabel} Mobile</Text>
      <Text style={styles.title}>Hi, {studentName.split(" ")[0]}</Text>
      <Text style={styles.subtitle}>Your SafePass attendance, campus ID, and parent notification status are ready here.</Text>
    </View>
  );

  const renderAttendanceCard = () => (
    <View style={styles.primaryCard}>
      <View style={styles.primaryCardTop}>
        <View>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.statusTitle}>
            {isCheckedIn ? "You are checked in" : todayRecord?.checkOutTime ? "Attendance completed" : "Ready for attendance"}
          </Text>
        </View>
        <MobileStatusBadge status={todayStatus} label={getStatusLabel(todayRecord, true)} />
      </View>

      <View style={styles.timeGrid}>
        <View style={styles.timeTile}>
          <Text style={styles.timeLabel}>Check In</Text>
          <Text style={styles.timeValue}>{formatTime(todayRecord?.checkInTime)}</Text>
        </View>
        <View style={styles.timeTile}>
          <Text style={styles.timeLabel}>Check Out</Text>
          <Text style={styles.timeValue}>{formatTime(todayRecord?.checkOutTime)}</Text>
        </View>
        <View style={styles.timeTile}>
          <Text style={styles.timeLabel}>Duration</Text>
          <Text style={styles.timeValue}>{currentSessionDuration}</Text>
        </View>
      </View>

      <View style={styles.nfcCard}>
        <View style={styles.nfcIcon}>
          <Ionicons name="radio-outline" size={26} color="#FFFFFF" />
        </View>
        <View style={styles.nfcCopy}>
          <Text style={styles.nfcTitle}>Virtual NFC Attendance</Text>
          <Text style={styles.nfcText}>
            {user?.nfcCardId
              ? `Card ${user.nfcCardId} is linked to your account.`
              : "Use this phone pass for today's check-in or check-out."}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.attendanceButton, isCheckedIn && styles.disabledButton]}
          onPress={() => handleAttendanceTap("check_in")}
          disabled={isCheckedIn || Boolean(tapActionLoading)}
        >
          {tapActionLoading === "check_in" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.attendanceButtonText}>Check In</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.attendanceButton, styles.checkoutButton, !isCheckedIn && styles.disabledButton]}
          onPress={() => handleAttendanceTap("check_out")}
          disabled={!isCheckedIn || Boolean(tapActionLoading)}
        >
          {tapActionLoading === "check_out" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.attendanceButtonText}>Check Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHome = () => (
    <>
      {renderHeader()}
      {renderAttendanceCard()}

      <View style={styles.summaryStrip}>
        <View style={styles.summaryCard}>
          <Ionicons name="calendar-outline" size={18} color={BRAND.blue} />
          <Text style={styles.summaryValue}>{monthStats.present}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="flag-outline" size={18} color={BRAND.success} />
          <Text style={styles.summaryValue}>{monthStats.completed}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="alarm-outline" size={18} color={BRAND.warning} />
          <Text style={styles.summaryValue}>{monthStats.late}</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name={guardianNoticeEnabled ? "mail-unread-outline" : "mail-outline"} size={20} color={guardianNoticeEnabled ? BRAND.success : BRAND.muted} />
          <Text style={styles.infoTitle}>Parent Alerts</Text>
          <Text style={styles.infoText}>
            {guardianEmailEnabled
              ? `Email enabled for ${user.guardianEmail}`
              : smsEnabled
                ? `SMS enabled for ${user.guardianPhone}`
                : "Not configured"}
          </Text>
        </View>
        <TouchableOpacity style={styles.infoCard} onPress={() => setActiveTab("profile")}>
          <Ionicons name="person-circle-outline" size={20} color={BRAND.blue} />
          <Text style={styles.infoTitle}>Profile</Text>
          <Text style={styles.infoText}>
            {user?.studentId || user?.teacherId || user?.course || user?.section
              ? formatProfileDetail(user?.studentId || user?.teacherId, user?.course, user?.section)
              : user?.email || "Profile details"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        <TouchableOpacity onPress={() => setActiveTab("history")}>
          <Text style={styles.sectionAction}>View all</Text>
        </TouchableOpacity>
      </View>
      {attendance.length ? (
        attendance.slice(0, 3).map((record) => renderAttendanceRecord(record))
      ) : (
        <MobileEmptyState
          icon="calendar-outline"
          title="No records yet"
          message="Your attendance history will appear after your first check-in."
        />
      )}
    </>
  );

  const renderAttendanceRecord = (record) => (
    <View key={record._id} style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View>
          <Text style={styles.recordDate}>{formatDate(record.attendanceDate)}</Text>
          <Text style={styles.recordLocation}>{record.location || record.checkpointIn || "Campus checkpoint"}</Text>
        </View>
        <MobileStatusBadge status={record.status || "present"} label={getStatusLabel(record)} />
      </View>
      <View style={styles.recordTimes}>
        <View style={styles.recordTimeItem}>
          <Ionicons name="log-in-outline" size={16} color={BRAND.success} />
          <Text style={styles.recordTimeText}>{formatTime(record.checkInTime)}</Text>
        </View>
        <View style={styles.recordTimeItem}>
          <Ionicons name="log-out-outline" size={16} color={BRAND.danger} />
          <Text style={styles.recordTimeText}>{formatTime(record.checkOutTime)}</Text>
        </View>
        <View style={styles.recordTimeItem}>
          <Ionicons name="alarm-outline" size={16} color={BRAND.warning} />
          <Text style={styles.recordTimeText}>{record.lateMinutes || 0} late min</Text>
        </View>
        <View style={styles.recordTimeItem}>
          <Ionicons name="hourglass-outline" size={16} color={BRAND.blue} />
          <Text style={styles.recordTimeText}>{formatDuration(record.sessionDurationMinutes)}</Text>
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <>
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>Attendance History</Text>
        <Text style={styles.compactSubtitle}>{monthStats.total} latest records from SafePass NFC attendance.</Text>
      </View>
      <View style={styles.statStrip}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthStats.present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthStats.late}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthStats.total}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
      </View>
      {attendance.length ? (
        attendance.map((record) => renderAttendanceRecord(record))
      ) : (
        <MobileEmptyState icon="time-outline" title="No attendance history" message="Attendance records will show here." />
      )}
    </>
  );

  const renderProfile = () => (
    <>
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>My Profile</Text>
        <Text style={styles.compactSubtitle}>Manage your campus account, contact details, and password.</Text>
      </View>
      <View style={styles.profileCard}>
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{studentName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{studentName}</Text>
            <Text style={styles.profileRole}>{roleLabel} Access</Text>
          </View>
        </View>

        <View style={styles.accountTabs}>
          {[
            ["view", "Overview", "id-card-outline"],
            ["edit", "Edit", "create-outline"],
            ["password", "Password", "lock-closed-outline"],
          ].map(([key, label, icon]) => (
            <TouchableOpacity
              key={key}
              style={[styles.accountTab, accountMode === key && styles.accountTabActive]}
              onPress={() => setAccountMode(key)}
            >
              <Ionicons name={icon} size={15} color={accountMode === key ? "#FFFFFF" : BRAND.blue} />
              <Text style={[styles.accountTabText, accountMode === key && styles.accountTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {accountMode === "view" ? (
          <>
            {[
              ["Email", user?.email],
              ["Username", user?.username || "Not assigned"],
              ["Contact Number", user?.phone || "Not configured"],
              ["Emergency Contact", user?.emergencyContact || "Not configured"],
              ["Student ID", user?.studentId || user?.teacherId || "Not assigned"],
              ["Course / Section", formatProfileDetail(user?.course, user?.yearLevel, user?.section)],
              ["NFC Card", user?.nfcCardId || "Virtual mobile check only"],
              ["Guardian", user?.guardianName || "Not configured"],
              ["Parent Email", user?.guardianEmail || "Not configured"],
              ["Guardian Phone", user?.guardianPhone || "Not configured"],
              ["Parent Alerts", guardianNoticeEnabled ? "Enabled" : "Not configured"],
            ].map(([label, value]) => (
              <View key={label} style={styles.profileRow}>
                <Text style={styles.profileLabel}>{label}</Text>
                <Text style={styles.profileValue}>{value}</Text>
              </View>
            ))}
            <View style={styles.accountNotice}>
              <Ionicons name="information-circle-outline" size={18} color={BRAND.blue} />
              <Text style={styles.accountNoticeText}>
                Student ID, course, NFC card, and parent contacts are managed by the school office.
              </Text>
            </View>
          </>
        ) : null}

        {accountMode === "edit" ? (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Personal Details</Text>
            <Text style={styles.formSubtitle}>Update the contact details used for your SafePass account.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                value={profileForm.firstName}
                onChangeText={(value) => handleProfileInputChange("firstName", value)}
                placeholder="First name"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                value={profileForm.lastName}
                onChangeText={(value) => handleProfileInputChange("lastName", value)}
                placeholder="Last name"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={profileForm.email}
                onChangeText={(value) => handleProfileInputChange("email", value)}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                value={profileForm.username}
                onChangeText={(value) => handleProfileInputChange("username", value)}
                placeholder="Username"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contact Number</Text>
              <TextInput
                value={profileForm.phone}
                onChangeText={(value) => handleProfileInputChange("phone", value)}
                placeholder="09XXXXXXXXX"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Emergency Contact</Text>
              <TextInput
                value={profileForm.emergencyContact}
                onChangeText={(value) => handleProfileInputChange("emergencyContact", value)}
                placeholder="Emergency contact"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelProfileEdit}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, profileSaving && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {accountMode === "password" ? (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Password & Security</Text>
            <Text style={styles.formSubtitle}>Change your password to keep your campus account secure.</Text>

            <View style={styles.securityTip}>
              <Ionicons name="shield-checkmark-outline" size={18} color={BRAND.blue} />
              <Text style={styles.securityTipText}>
                Use at least 6 characters. Avoid passwords used on shared devices.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(value) => handlePasswordInputChange("currentPassword", value)}
                placeholder="Current password"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                secureTextEntry
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(value) => handlePasswordInputChange("newPassword", value)}
                placeholder="New password"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                secureTextEntry
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(value) => handlePasswordInputChange("confirmPassword", value)}
                placeholder="Confirm password"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, styles.fullWidthButton, passwordSaving && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={passwordSaving}
            >
              {passwordSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.logoutFullButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutFullButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </>
  );

  if (loading) {
    return <MobileLoadingState message="Loading your student attendance..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BRAND.blue} />}
      >
        {activeTab === "history" ? renderHistory() : activeTab === "profile" ? renderProfile() : renderHome()}
      </ScrollView>
      <MobileBottomNav tabs={studentTabs} activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.page,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 22,
  },
  header: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: BRAND.blue,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    color: "#DCEBFF",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#DCEBFF",
  },
  primaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  primaryCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  statusTitle: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: "900",
    color: BRAND.ink,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  timeTile: {
    flex: 1,
    minWidth: 92,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  timeValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: BRAND.ink,
  },
  nfcCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nfcIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.blue,
  },
  nfcCopy: {
    flex: 1,
  },
  nfcTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: BRAND.ink,
  },
  nfcText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: BRAND.muted,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  attendanceButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: BRAND.blue,
  },
  checkoutButton: {
    backgroundColor: BRAND.danger,
  },
  disabledButton: {
    opacity: 0.45,
  },
  attendanceButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  summaryStrip: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minHeight: 94,
    borderRadius: 17,
    padding: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
    color: BRAND.ink,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  infoCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 118,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
    color: BRAND.ink,
  },
  infoText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: BRAND.muted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: BRAND.ink,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: "900",
    color: BRAND.blue,
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  recordTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  recordDate: {
    fontSize: 15,
    fontWeight: "900",
    color: BRAND.ink,
  },
  recordLocation: {
    marginTop: 4,
    fontSize: 12,
    color: BRAND.muted,
  },
  recordTimes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  recordTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F8FBFE",
  },
  recordTimeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  compactHeader: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: BRAND.ink,
  },
  compactSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: BRAND.muted,
  },
  statStrip: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: BRAND.blue,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.blue,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: "900",
    color: BRAND.ink,
  },
  profileRole: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  accountTabs: {
    flexDirection: "row",
    gap: 8,
    padding: 5,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  accountTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  accountTabActive: {
    backgroundColor: BRAND.blue,
  },
  accountTabText: {
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.blue,
  },
  accountTabTextActive: {
    color: "#FFFFFF",
  },
  profileRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  profileValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "800",
    color: BRAND.ink,
  },
  accountNotice: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },
  accountNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#475569",
    fontWeight: "700",
  },
  formSection: {
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    paddingTop: 14,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: BRAND.ink,
  },
  formSubtitle: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 17,
    color: BRAND.muted,
  },
  fieldGroup: {
    marginBottom: 11,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "900",
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  fieldInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E4F2",
    backgroundColor: "#F8FBFE",
    paddingHorizontal: 13,
    fontSize: 14,
    fontWeight: "800",
    color: BRAND.ink,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.blue,
  },
  fullWidthButton: {
    width: "100%",
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBD3F3",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: BRAND.blue,
  },
  securityTip: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },
  securityTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#475569",
    fontWeight: "700",
  },
  logoutFullButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutFullButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#DC2626",
  },
});
