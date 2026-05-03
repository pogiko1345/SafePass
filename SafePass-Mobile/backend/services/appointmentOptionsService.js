const AppSettings = require("../models/AppSettings");
const {
  DEFAULT_SYSTEM_SETTINGS,
  sanitizeAppointmentOptions,
} = require("../utils/settingsUtils");

const getSystemSettingsRecord = async () =>
  AppSettings.findOneAndUpdate(
    { key: "system" },
    { $setOnInsert: { key: "system", ...DEFAULT_SYSTEM_SETTINGS } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

const getAppointmentOptions = async ({ activeOnly = false } = {}) => {
  const settingsRecord = await getSystemSettingsRecord();
  const options = sanitizeAppointmentOptions(settingsRecord?.appointmentOptions || {});
  if (!activeOnly) return options;

  return {
    offices: options.offices.filter((option) => option.enabled !== false),
    purposes: options.purposes.filter((option) => option.enabled !== false),
    timeSlots: options.timeSlots.filter((slot) => slot.enabled !== false),
  };
};

const updateAppointmentOptions = async (input = {}) => {
  const options = sanitizeAppointmentOptions(input?.options || input || {});
  await AppSettings.findOneAndUpdate(
    { key: "system" },
    {
      $set: {
        appointmentOptions: options,
        updatedAt: new Date(),
      },
      $setOnInsert: { key: "system", ...DEFAULT_SYSTEM_SETTINGS },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return options;
};

module.exports = {
  getAppointmentOptions,
  updateAppointmentOptions,
};
