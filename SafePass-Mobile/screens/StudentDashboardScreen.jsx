import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";

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

const getStatusColor = (status = "") => {
  switch (String(status || "").toLowerCase()) {
    case "late":
      return { background: "#FEF3C7", text: "#B45309" };
    case "checked_out":
    case "completed":
      return { background: "#E2E8F0", text: "#475569" };
    case "inside":
    case "present":
      return { background: "#DCFCE7", text: "#166534" };
    case "expired":
    case "no_show":
      return { background: "#FEE2E2", text: "#B91C1C" };
    default:
      return { background: "#EEF5FF", text: "#0A3D91" };
  }
};

export default function StudentDashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [profileResponse, attendanceResponse] = await Promise.all([
      ApiService.getProfile(),
      ApiService.getMyAttendance({ limit: 20 }),
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
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error("Student logout error:", error);
    } finally {
      await ApiService.clearAuth();
      navigation.replace("Login");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={styles.loadingText}>Loading your attendance dashboard...</Text>
      </SafeAreaView>
    );
  }

  const roleLabel = String(user?.role || "").toLowerCase() === "teacher" ? "Teacher" : "Student";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>{roleLabel} Access</Text>
            <Text style={styles.title}>Attendance Overview</Text>
            <Text style={styles.subtitle}>
              Review your latest NFC check-ins, check-outs, and attendance status.
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#0A3D91" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.summaryMeta}>
            {roleLabel} • {user?.studentId || user?.teacherId || user?.employeeId || user?.email}
          </Text>
          <Text style={styles.summaryMeta}>
            Guardian SMS: {user?.smsOptIn && user?.guardianPhone ? "Enabled" : "Not configured"}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <Text style={styles.sectionSubtitle}>{attendance.length} record{attendance.length === 1 ? "" : "s"}</Text>
        </View>

        {attendance.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No attendance records yet</Text>
            <Text style={styles.emptySubtitle}>
              Your NFC attendance history will appear here after your first valid tap.
            </Text>
          </View>
        ) : (
          attendance.map((record) => {
            const statusColor = getStatusColor(record.status);
            return (
              <View key={record._id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View>
                    <Text style={styles.recordDate}>{formatDate(record.attendanceDate)}</Text>
                    <Text style={styles.recordLocation}>{record.location || "Campus checkpoint"}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.background }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {String(record.status || "present").replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Check-in</Text>
                  <Text style={styles.recordValue}>{formatTime(record.checkInTime)}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Check-out</Text>
                  <Text style={styles.recordValue}>{formatTime(record.checkOutTime)}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Late Minutes</Text>
                  <Text style={styles.recordValue}>{record.lateMinutes || 0}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    maxWidth: 280,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A3D91",
  },
  summaryCard: {
    backgroundColor: "#0A3D91",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  summaryName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  summaryMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#DBEAFE",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  recordLocation: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  recordLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  recordValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
});
