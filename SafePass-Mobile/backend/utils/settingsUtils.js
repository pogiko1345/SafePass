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
  sanitizeSystemSettings,
};
