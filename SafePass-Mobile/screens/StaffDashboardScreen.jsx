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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import ApiService from "../utils/ApiService";
import styles from "../styles/StaffDashboardStyles";

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

const getStatusMeta = (status) => {
  switch (status) {
    case "approved":
      return { color: "#059669", background: "#D1FAE5", label: "Approved" };
    case "adjusted":
      return { color: "#D97706", background: "#FEF3C7", label: "Adjusted" };
    case "rejected":
      return { color: "#DC2626", background: "#FEE2E2", label: "Rejected" };
    case "completed":
      return { color: "#475569", background: "#E2E8F0", label: "Completed" };
    default:
      return { color: "#2563EB", background: "#DBEAFE", label: "Pending" };
  }
};

const getAppointmentStatus = (appointment) => {
  if (!appointment) return "pending";
  if (appointment.status === "checked_out") return "completed";
  return String(appointment.appointmentStatus || "pending").toLowerCase();
};

export default function StaffDashboardScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    if (filter === "completed") {
      return appointments.filter((item) => item.status === "checked_out");
    }
    if (filter === "approved") {
      return appointments.filter((item) =>
        ["approved", "adjusted"].includes(getAppointmentStatus(item)),
      );
    }
    return appointments.filter((item) => getAppointmentStatus(item) === filter);
  }, [appointments, filter]);

  const stats = useMemo(
    () => ({
      pending: appointments.filter((item) => getAppointmentStatus(item) === "pending").length,
      approved: appointments.filter((item) =>
        ["approved", "adjusted"].includes(getAppointmentStatus(item)),
      ).length,
      rejected: appointments.filter((item) => getAppointmentStatus(item) === "rejected").length,
      completed: appointments.filter((item) => getAppointmentStatus(item) === "completed").length,
    }),
    [appointments],
  );

  const mergeAppointment = (updatedVisitor) => {
    if (!updatedVisitor?._id) return;
    setAppointments((current) =>
      current.map((item) =>
        String(item._id) === String(updatedVisitor._id) ? { ...item, ...updatedVisitor } : item,
      ),
    );
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
    setProcessingId(selectedAppointment._id);
    try {
      const mergedDateTime = new Date(adjustedDate);
      const timeValue = new Date(adjustedTime);
      mergedDateTime.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);

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

  const handleLogout = async () => {
    await ApiService.logout();
    if (typeof onLogout === "function") onLogout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={styles.loadingText}>Loading staff dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient colors={["#0A3D91", "#1E4A8C"]} style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroEyebrow}>Staff Dashboard</Text>
              <Text style={styles.heroTitle}>Appointment Requests</Text>
              <Text style={styles.heroSubtitle}>
                Review visitor schedules, approve visits, and adjust time slots for your office.
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
              <Text style={styles.profileInitials}>
                {(user?.firstName?.[0] || "S") + (user?.lastName?.[0] || "T")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.pending}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.approved}</Text>
              <Text style={styles.heroStatLabel}>Approved</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.completed}</Text>
              <Text style={styles.heroStatLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.filterRow}>
          {[
            { key: "all", label: `All (${appointments.length})` },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "approved", label: `Approved (${stats.approved})` },
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

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appointment Queue</Text>
            <TouchableOpacity onPress={loadData}>
              <Ionicons name="refresh-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No appointments here</Text>
              <Text style={styles.emptySubtitle}>New visitor requests will appear in this queue.</Text>
            </View>
          ) : (
            filteredAppointments.map((appointment) => {
              const appointmentStatus = getAppointmentStatus(appointment);
              const statusMeta = getStatusMeta(appointmentStatus);
              const isPending = appointmentStatus === "pending";
              const isProcessing = processingId === appointment._id;

              return (
                <View key={appointment._id} style={styles.appointmentCard}>
                  <View style={styles.appointmentTop}>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentName}>{appointment.fullName}</Text>
                      <Text style={styles.appointmentPurpose}>{appointment.purposeOfVisit}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
                      <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                        {statusMeta.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Preferred Date</Text>
                      <Text style={styles.metaValue}>{formatDate(appointment.visitDate)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Preferred Time</Text>
                      <Text style={styles.metaValue}>{formatTime(appointment.visitTime)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Visitor Email</Text>
                      <Text style={styles.metaValue}>{appointment.email}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Assigned Staff</Text>
                      <Text style={styles.metaValue}>
                        {appointment.assignedStaffName || `${user?.firstName || "Staff"} ${user?.lastName || ""}`.trim()}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Requested At</Text>
                      <Text style={styles.metaValue}>
                        {appointment.appointmentRequestedAt
                          ? `${formatDate(appointment.appointmentRequestedAt)} ${formatTime(appointment.appointmentRequestedAt)}`
                          : "Recently submitted"}
                      </Text>
                    </View>
                  </View>

                  {appointment.staffAdjustmentNote ? (
                    <View style={styles.noteBox}>
                      <Ionicons name="create-outline" size={16} color="#D97706" />
                      <Text style={styles.noteText}>{appointment.staffAdjustmentNote}</Text>
                    </View>
                  ) : null}

                  {appointment.staffRejectionReason ? (
                    <View style={[styles.noteBox, styles.noteBoxReject]}>
                      <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                      <Text style={[styles.noteText, styles.noteTextReject]}>
                        {appointment.staffRejectionReason}
                      </Text>
                    </View>
                  ) : null}

                  {isPending ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.primaryAction, isProcessing && styles.disabledAction]}
                        onPress={() => handleApprove(appointment)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryActionText}>Approve</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => openAdjustModal(appointment)}
                        disabled={isProcessing}
                      >
                        <Ionicons name="time-outline" size={16} color="#1D4ED8" />
                        <Text style={styles.secondaryActionText}>Adjust Time</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectAction}
                        onPress={() => openRejectModal(appointment)}
                        disabled={isProcessing}
                      >
                        <Ionicons name="close-outline" size={16} color="#DC2626" />
                        <Text style={styles.rejectActionText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {(notifications || []).slice(0, 5).map((notification) => (
            <View key={notification._id} style={styles.notificationItem}>
              <View style={styles.notificationDot} />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

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
                  <Ionicons name="calendar-outline" size={18} color="#1D4ED8" />
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
    </SafeAreaView>
  );
}
