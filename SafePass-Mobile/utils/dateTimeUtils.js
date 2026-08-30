export const SAFEPASS_TIME_ZONE = "Asia/Manila";
export const SAFEPASS_TIME_ZONE_LABEL = "Philippine Time";

const resolveDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatSafePassDate = (value, options = {}, fallback = "N/A") => {
  const date = resolveDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-US", {
    timeZone: SAFEPASS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
};

export const formatSafePassTime = (value, options = {}, fallback = "N/A") => {
  const date = resolveDate(value);
  if (!date) return fallback;
  return date.toLocaleTimeString("en-US", {
    timeZone: SAFEPASS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatSafePassDateTime = (value, options = {}, fallback = "N/A") => {
  const date = resolveDate(value);
  if (!date) return fallback;
  return date.toLocaleString("en-US", {
    timeZone: SAFEPASS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatDate = (value, fallback = "N/A") =>
  formatSafePassDate(value, {}, fallback);

export const formatTime = (value, fallback = "N/A") =>
  formatSafePassTime(value, {}, fallback);

export const formatDateTime = (value, fallback = "N/A") =>
  formatSafePassDateTime(value, {}, fallback);

export const getStatusMeta = (status = "") => {
  switch (String(status).toLowerCase()) {
    case "approved":
    case "active":
      return { color: "#047857", background: "#D1FAE5", label: "Approved" };
    case "pending":
      return { color: "#D97706", background: "#FEF3C7", label: "Pending" };
    case "rejected":
    case "denied":
      return { color: "#DC2626", background: "#FEE2E2", label: "Rejected" };
    case "completed":
    case "checked_out":
      return { color: "#475569", background: "#E2E8F0", label: "Completed" };
    case "checked_in":
      return { color: "#0A3D91", background: "#EEF5FF", label: "Checked In" };
    case "cancelled":
      return { color: "#64748B", background: "#F1F5F9", label: "Cancelled" };
    case "expired":
      return { color: "#B45309", background: "#FEF3C7", label: "Expired" };
    case "no_show":
      return { color: "#B45309", background: "#FEF3C7", label: "No Show" };
    case "rescheduled":
      return { color: "#7C3AED", background: "#F3E8FF", label: "Rescheduled" };
    default:
      return { color: "#64748B", background: "#F1F5F9", label: status || "Unknown" };
  }
};

export const getStatusColor = (status = "") => getStatusMeta(status).color;

