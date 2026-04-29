const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_SYSTEM_SETTINGS,
  sanitizeSystemSettings,
} = require("../utils/settingsUtils");

test("sanitizeSystemSettings keeps defaults when input is empty", () => {
  assert.deepEqual(sanitizeSystemSettings(), DEFAULT_SYSTEM_SETTINGS);
});

test("sanitizeSystemSettings normalizes booleans and strings", () => {
  const sanitized = sanitizeSystemSettings({
    maintenanceMode: 1,
    emailNotifications: 0,
    sessionTimeout: 45,
    backupFrequency: " weekly ",
  });

  assert.equal(sanitized.maintenanceMode, true);
  assert.equal(sanitized.emailNotifications, false);
  assert.equal(sanitized.sessionTimeout, "45");
  assert.equal(sanitized.backupFrequency, "weekly");
  assert.equal(sanitized.maxLoginAttempts, DEFAULT_SYSTEM_SETTINGS.maxLoginAttempts);
});
