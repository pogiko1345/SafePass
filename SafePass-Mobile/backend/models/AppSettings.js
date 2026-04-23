const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "system",
      trim: true,
    },
    maintenanceMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    backupFrequency: { type: String, default: "daily" },
    sessionTimeout: { type: String, default: "30" },
    maxLoginAttempts: { type: String, default: "5" },
    autoApprove: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AppSettings", appSettingsSchema);
