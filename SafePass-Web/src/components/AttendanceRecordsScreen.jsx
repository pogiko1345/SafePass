import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApiService from "../utils/ApiService";

const SCHOOL_LOGO = require("../assets/LogoSapphire.jpg");

const USER_TYPES = ["all", "student", "teacher", "staff", "security", "guard", "visitor"];
const STATUS_TYPES = ["all", "present", "late", "inside", "checked_out", "completed", "expired", "no_show"];

const formatDateLabel = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase()) || "Unknown";

const getStatusColor = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  switch (normalized) {
    case "late":
      return { background: "#FEF3C7", text: "#92400E" };
    case "inside":
    case "present":
      return { background: "#DCFCE7", text: "#166534" };
    case "checked_out":
    case "completed":
      return { background: "#E0F2FE", text: "#075985" };
    case "expired":
    case "no_show":
      return { background: "#FEE2E2", text: "#B91C1C" };
    default:
      return { background: "#E2E8F0", text: "#475569" };
  }
};

const groupAttendanceByDate = (records = []) => {
  const groups = records.reduce((map, record) => {
    const key = record?.attendanceDate
      ? new Date(record.attendanceDate).toISOString().slice(0, 10)
      : "undated";
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(record);
    return map;
  }, new Map());

  return Array.from(groups.entries()).map(([key, entries]) => ({
    key,
    label: key === "undated" ? "No date" : formatDateLabel(entries[0]?.attendanceDate),
    entries: [...entries].sort((left, right) => {
      const leftTime = new Date(left?.checkInTime || left?.lastTapTime || left?.createdAt || 0).getTime();
      const rightTime = new Date(right?.checkInTime || right?.lastTapTime || right?.createdAt || 0).getTime();
      return rightTime - leftTime;
    }),
  }));
};

const getTodayFilter = () => {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  return { dateFrom: iso, dateTo: iso };
};

const getLastDaysFilter = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10),
  };
};

export default function AttendanceRecordsScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    userType: "all",
    status: "all",
    search: "",
  });

  const buildQuery = useCallback(() => {
    const query = {};
    if (filters.dateFrom) query.dateFrom = filters.dateFrom;
    if (filters.dateTo) query.dateTo = filters.dateTo;
    if (filters.userType !== "all") query.userType = filters.userType;
    if (filters.status !== "all") query.status = filters.status;
    if (filters.search.trim()) query.search = filters.search.trim();
    return query;
  }, [filters]);

  const loadData = useCallback(async () => {
    const query = buildQuery();
    const [attendanceResponse, summaryResponse] = await Promise.all([
      ApiService.getAttendance({ ...query, limit: 120 }),
      ApiService.getAttendanceSummary(query),
    ]);

    setRecords(Array.isArray(attendanceResponse?.attendance) ? attendanceResponse.attendance : []);
    setSummary(summaryResponse?.summary || null);
  }, [buildQuery]);

  useEffect(() => {
    const run = async () => {
      try {
        await loadData();
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

  const groupedRecords = useMemo(() => groupAttendanceByDate(records), [records]);

  const quickFilter = async (nextFilter) => {
    setFilters((current) => ({ ...current, ...nextFilter }));
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <img src={SCHOOL_LOGO} alt="School Logo" style={{ width: 116, height: 58, marginBottom: 18 }} />
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div style={styles.safeArea}>
      <div style={styles.headerCard}>
        <button
          style={styles.backButton}
          onClick={() => navigation.goBack()}
        >
          ←
        </button>
        <div style={styles.headerCopy}>
          <p style={styles.headerEyebrow}>Admin Records</p>
          <h1 style={styles.headerTitle}>Attendance Records</h1>
          <p style={styles.headerSubtitle}>
            Review attendance across students, teachers, staff, security, and visitors with
            date-based filtering and live status summaries.
          </p>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryValue}>{summary?.total || 0}</p>
          <p style={styles.summaryLabel}>Records</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryValue}>{summary?.late || 0}</p>
          <p style={styles.summaryLabel}>Late</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryValue}>{summary?.completed || 0}</p>
          <p style={styles.summaryLabel}>Completed</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryValue}>{summary?.byUserType?.visitor || 0}</p>
          <p style={styles.summaryLabel}>Visitors</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Date Filters</h2>
        <div style={styles.quickFilterRow}>
          <button
            style={styles.quickFilterChip}
            onClick={() => quickFilter(getTodayFilter())}
          >
            Today
          </button>
          <button
            style={styles.quickFilterChip}
            onClick={() => quickFilter(getLastDaysFilter(7))}
          >
            Last 7 Days
          </button>
          <button
            style={styles.quickFilterChip}
            onClick={() => quickFilter(getLastDaysFilter(30))}
          >
            Last 30 Days
          </button>
          <button
            style={styles.quickFilterChip}
            onClick={() => quickFilter({ dateFrom: "", dateTo: "" })}
          >
            Clear Dates
          </button>
        </div>

        <div style={styles.filterGrid}>
          <input
            type="date"
            style={styles.filterInput}
            placeholder="Start date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((current) => ({ ...current, dateFrom: e.target.value }))}
          />
          <input
            type="date"
            style={styles.filterInput}
            placeholder="End date"
            value={filters.dateTo}
            onChange={(e) => setFilters((current) => ({ ...current, dateTo: e.target.value }))}
          />
          <input
            type="text"
            style={styles.filterInput}
            placeholder="Search by name"
            value={filters.search}
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>User Type</h2>
        <div style={styles.chipRow}>
          {USER_TYPES.map((userType) => {
            const selected = filters.userType === userType;
            return (
              <button
                key={userType}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onClick={() => setFilters((current) => ({ ...current, userType }))}
              >
                {titleCase(userType)}
              </button>
            );
          })}
        </div>

        <h2 style={[styles.sectionTitle, styles.statusTitle]}>Status</h2>
        <div style={styles.chipRow}>
          {STATUS_TYPES.map((status) => {
            const selected = filters.status === status;
            return (
              <button
                key={status}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onClick={() => setFilters((current) => ({ ...current, status }))}
              >
                {titleCase(status)}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.recordsHeader}>
          <h2 style={styles.sectionTitle}>Attendance Log</h2>
          <p style={styles.recordsCount}>
            {records.length} record{records.length === 1 ? "" : "s"}
          </p>
        </div>

        {groupedRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 34, marginBottom: 10, color: "#94A3B8" }}>📅</div>
            <p style={styles.emptyTitle}>No attendance records found</p>
            <p style={styles.emptyText}>
              Try adjusting the date range, status, or user type filters.
            </p>
          </div>
        ) : (
          groupedRecords.map((group) => (
            <div key={group.key} style={styles.dateGroup}>
              <h3 style={styles.dateGroupTitle}>{group.label}</h3>
              {group.entries.map((record) => {
                const statusColors = getStatusColor(record.status);
                return (
                  <div key={record._id} style={styles.recordCard}>
                    <div style={styles.recordHeader}>
                      <div style={styles.recordHeaderCopy}>
                        <p style={styles.recordName}>{record.name}</p>
                        <p style={styles.recordMeta}>
                          {titleCase(record.userType)} | {record.location || "No location"}
                        </p>
                      </div>
                      <div
                        style={[styles.statusBadge, { backgroundColor: statusColors.background }]}
                      >
                        <p
                          style={[styles.statusBadgeText, { color: statusColors.text }]}
                        >
                          {titleCase(record.status)}
                        </p>
                      </div>
                    </div>

                    <div style={styles.recordDetailsGrid}>
                      <div style={styles.recordDetailCard}>
                        <p style={styles.recordDetailLabel}>Check In</p>
                        <p style={styles.recordDetailValue}>{formatDateTime(record.checkInTime)}</p>
                      </div>
                      <div style={styles.recordDetailCard}>
                        <p style={styles.recordDetailLabel}>Check Out</p>
                        <p style={styles.recordDetailValue}>{formatDateTime(record.checkOutTime)}</p>
                      </div>
                      <div style={styles.recordDetailCard}>
                        <p style={styles.recordDetailLabel}>Last Tap</p>
                        <p style={styles.recordDetailValue}>{formatDateTime(record.lastTapTime)}</p>
                      </div>
                      <div style={styles.recordDetailCard}>
                        <p style={styles.recordDetailLabel}>Module</p>
                        <p style={styles.recordDetailValue}>{titleCase(record.module)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    padding: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#F4F7FB",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0A3D91",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 12,
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
  headerCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#0A3D91",
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
    textTransform: "uppercase",
    margin: 0,
  },
  headerTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    margin: 0,
  },
  summaryGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    margin: 0,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 0,
  },
  quickFilterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  quickFilterChip: {
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    border: "none",
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
    cursor: "pointer",
  },
  filterGrid: {
    gap: 10,
    marginBottom: 16,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#DCE5F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    width: "100%",
    boxSizing: "border-box",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    cursor: "pointer",
    border: "1px solid #DCE5F0",
  },
  filterChipActive: {
    borderColor: "#0A3D91",
    backgroundColor: "#EEF5FF",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#0A3D91",
  },
  statusTitle: {
    marginTop: 16,
  },
  recordsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordsCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    textAlign: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    margin: 0,
  },
  dateGroup: {
    marginTop: 8,
  },
  dateGroupTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0A3D91",
    marginBottom: 10,
    margin: 0,
  },
  recordCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  recordHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  recordHeaderCopy: {
    flex: 1,
  },
  recordName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  recordMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    margin: 0,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    margin: 0,
  },
  recordDetailsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  recordDetailCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  recordDetailLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    margin: 0,
  },
  recordDetailValue: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
  },
};

// Add keyframes for spinner
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleTag);