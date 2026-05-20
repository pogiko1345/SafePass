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
