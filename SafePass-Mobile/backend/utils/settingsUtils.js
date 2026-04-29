const DEFAULT_SYSTEM_SETTINGS = {
  maintenanceMode: false,
  emailNotifications: true,
  smsAlerts: true,
  backupFrequency: "daily",
  sessionTimeout: "30",
  maxLoginAttempts: "5",
  autoApprove: false,
  darkMode: false,
  twoFactorAuth: false,
};

const DEFAULT_APPOINTMENT_PURPOSE_OPTIONS = [
  "Enrollment",
  "Payment",
  "Inquiry",
  "Document Request",
  "Other",
];

const DEFAULT_APPOINTMENT_DEPARTMENT_OPTIONS = [
  "Registrar",
  "Accounting",
  "Information Desk",
  "Guidance",
  "Administration",
  "Cashier",
  "Flight Operations",
  "Training",
  "I.T Room",
  "Faculty Room",
  "Laboratory",
  "TESDA",
  "Workshop",
  "Library",
  "Student Services",
  "STO",
];

const DEFAULT_APPOINTMENT_TIME_SLOTS = [];
for (let hour = 7; hour <= 18; hour += 1) {
  for (const minute of [0, 30]) {
    const hour12 = hour % 12 || 12;
    const suffix = hour >= 12 ? "PM" : "AM";
    DEFAULT_APPOINTMENT_TIME_SLOTS.push({
      id: `slot-${String(hour).padStart(2, "0")}-${String(minute).padStart(2, "0")}`,
      label: `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`,
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      hour,
      minute,
      enabled: true,
    });
  }
}

const toAppointmentOption = (value, prefix) => {
  if (typeof value === "string") {
    const label = value.trim().replace(/\s+/g, " ");
    return label
      ? {
          id: `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
          label,
          enabled: true,
        }
      : null;
  }

  const label = String(value?.label || value?.name || value?.value || "").trim().replace(/\s+/g, " ");
  if (!label) return null;

  return {
    id:
      String(value?.id || "").trim() ||
      `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    label,
    enabled: value?.enabled !== false,
  };
};

const parseTimeSlotValue = (slot = {}) => {
  const value = String(slot?.value || slot?.label || "").trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) {
    const hour = Number(slot?.hour);
    const minute = Number(slot?.minute);
    if (Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = String(match[3] || "").toUpperCase();
  if (suffix === "PM" && hour < 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
};

const formatTimeSlotLabel = ({ hour, minute }) => {
  const hour12 = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const toAppointmentTimeSlot = (slot) => {
  const parsed = parseTimeSlotValue(slot);
  if (!parsed) return null;
  const value = `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`;
  return {
    id: String(slot?.id || "").trim() || `slot-${value.replace(":", "-")}`,
    label: String(slot?.label || "").trim() || formatTimeSlotLabel(parsed),
    value,
    hour: parsed.hour,
    minute: parsed.minute,
    enabled: slot?.enabled !== false,
  };
};

const dedupeByLabel = (options) => {
  const seen = new Set();
  return options.filter((option) => {
    const key = String(option.label || option.value || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const dedupeTimeSlots = (slots) => {
  const seen = new Set();
  return slots
    .filter((slot) => {
      const key = String(slot.value || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => left.hour * 60 + left.minute - (right.hour * 60 + right.minute));
};

const DEFAULT_APPOINTMENT_OPTIONS = {
  offices: DEFAULT_APPOINTMENT_DEPARTMENT_OPTIONS.map((label) => toAppointmentOption(label, "office")),
  purposes: DEFAULT_APPOINTMENT_PURPOSE_OPTIONS.map((label) => toAppointmentOption(label, "purpose")),
  timeSlots: DEFAULT_APPOINTMENT_TIME_SLOTS,
};

const sanitizeAppointmentOptions = (input = {}) => {
  const source = input?.appointmentOptions || input || {};
  const offices = dedupeByLabel(
    (Array.isArray(source.offices) ? source.offices : DEFAULT_APPOINTMENT_OPTIONS.offices)
      .map((item) => toAppointmentOption(item, "office"))
      .filter(Boolean),
  );
  const purposes = dedupeByLabel(
    (Array.isArray(source.purposes) ? source.purposes : DEFAULT_APPOINTMENT_OPTIONS.purposes)
      .map((item) => toAppointmentOption(item, "purpose"))
      .filter(Boolean),
  );
  const timeSlots = dedupeTimeSlots(
    (Array.isArray(source.timeSlots) ? source.timeSlots : DEFAULT_APPOINTMENT_OPTIONS.timeSlots)
      .map(toAppointmentTimeSlot)
      .filter(Boolean),
  );

  return {
    offices: offices.length ? offices : DEFAULT_APPOINTMENT_OPTIONS.offices,
    purposes: purposes.length ? purposes : DEFAULT_APPOINTMENT_OPTIONS.purposes,
    timeSlots: timeSlots.length ? timeSlots : DEFAULT_APPOINTMENT_OPTIONS.timeSlots,
  };
};

const SETTINGS_BOOLEAN_KEYS = [
  "maintenanceMode",
  "emailNotifications",
  "smsAlerts",
  "autoApprove",
  "darkMode",
  "twoFactorAuth",
];

const SETTINGS_STRING_KEYS = ["backupFrequency", "sessionTimeout", "maxLoginAttempts"];

const sanitizeSystemSettings = (input = {}) => {
  const sanitized = { ...DEFAULT_SYSTEM_SETTINGS };

  SETTINGS_BOOLEAN_KEYS.forEach((key) => {
    if (input[key] !== undefined) {
      sanitized[key] = Boolean(input[key]);
    }
  });

  SETTINGS_STRING_KEYS.forEach((key) => {
    if (input[key] !== undefined) {
      sanitized[key] = String(input[key] ?? DEFAULT_SYSTEM_SETTINGS[key]).trim() || DEFAULT_SYSTEM_SETTINGS[key];
    }
  });

  return sanitized;
};

module.exports = {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_APPOINTMENT_OPTIONS,
  DEFAULT_APPOINTMENT_PURPOSE_OPTIONS,
  DEFAULT_APPOINTMENT_DEPARTMENT_OPTIONS,
  sanitizeSystemSettings,
  sanitizeAppointmentOptions,
};
