const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

process.env.JWT_SECRET = process.env.JWT_SECRET || "integration-test-secret";
process.env.ARDUINO_DEVICE_KEY =
  process.env.ARDUINO_DEVICE_KEY || "integration-test-device-key";

mongoose.connect = async () => mongoose.connection;
mongoose.connection.readyState = 1;

const state = {
  users: [],
  settings: null,
  accessLogCreates: [],
  accessLogSaves: [],
};

const cloneUserRecord = (record) => ({
  _id: record._id,
  email: record.email,
  username: record.username,
  password: record.password,
  role: record.role,
  status: record.status,
  isVerified: record.isVerified,
  firstName: record.firstName,
  lastName: record.lastName,
  phone: record.phone,
  visitorId: record.visitorId || null,
  nfcCardId: record.nfcCardId || null,
  passwordResetOtpHash: record.passwordResetOtpHash || "",
  passwordResetExpiresAt: record.passwordResetExpiresAt || null,
  passwordResetAttempts: record.passwordResetAttempts || 0,
  passwordResetVerifiedAt: record.passwordResetVerifiedAt || null,
  verificationOtpHash: record.verificationOtpHash || "",
  verificationOtpExpiresAt: record.verificationOtpExpiresAt || null,
  verificationOtpAttempts: record.verificationOtpAttempts || 0,
  verificationTokenHash: record.verificationTokenHash || "",
  verificationExpiresAt: record.verificationExpiresAt || null,
  verifiedAt: record.verifiedAt || null,
  createdAt: record.createdAt || new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: record.updatedAt || new Date("2026-01-01T00:00:00.000Z"),
  isActive: record.isActive !== false,
});

const persistDoc = (doc) => {
  const normalized = cloneUserRecord(doc);
  const index = state.users.findIndex((item) => item._id === normalized._id);
  if (index >= 0) {
    state.users[index] = normalized;
  } else {
    state.users.push(normalized);
  }
};

const createUserDoc = (record) => {
  const doc = cloneUserRecord(record);

  doc.comparePassword = async (candidatePassword) => candidatePassword === doc.password;
  doc.save = async () => {
    doc.updatedAt = new Date();
    persistDoc(doc);
    return doc;
  };
  doc.toObject = () => ({ ...doc });

  return doc;
};

const findStoredUser = (predicate) => {
  const record = state.users.find(predicate);
  return record ? createUserDoc(record) : null;
};

const UserMock = {
  findOne: async (query = {}) => {
    if (query.$or) {
      return (
        query.$or
          .map((condition) => {
            if (condition.email) {
              return findStoredUser((user) => user.email === condition.email);
            }
            if (condition.username) {
              return findStoredUser((user) => user.username === condition.username);
            }
            return null;
          })
          .find(Boolean) || null
      );
    }

    return (
      findStoredUser((user) => {
        return Object.entries(query).every(([key, value]) => user[key] === value);
      }) || null
    );
  },

  findById: (id) => ({
    select: async () => {
      const user = findStoredUser((item) => item._id === id);
      if (!user) return null;
      delete user.password;
      return user;
    },
  }),
};

const AppSettingsMock = {
  findOneAndUpdate: async (_query, update = {}, _options = {}) => {
    const base =
      state.settings || {
        key: "system",
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

    if (update.$setOnInsert && !state.settings) {
      state.settings = { ...base, ...update.$setOnInsert };
    }

    if (update.$set) {
      state.settings = { ...(state.settings || base), ...update.$set };
    }

    if (!state.settings) {
      state.settings = { ...base };
    }

    return {
      ...state.settings,
      toObject() {
        return { ...state.settings };
      },
    };
  },
};

class AccessLogMock {
  constructor(data) {
    this.data = data;
  }

  async save() {
    state.accessLogSaves.push(this.data);
    return this;
  }

  static async create(data) {
    state.accessLogCreates.push(data);
    return data;
  }
}

const NotificationMock = {
  create: async () => ({}),
};

const VisitorMock = {};

const registerMockModule = (relativePath, exportsValue) => {
  const resolvedPath = path.resolve(__dirname, relativePath);
  require.cache[resolvedPath] = {
    id: resolvedPath,
    filename: resolvedPath,
    loaded: true,
    exports: exportsValue,
  };
};

registerMockModule("../models/User.js", UserMock);
registerMockModule("../models/AppSettings.js", AppSettingsMock);
registerMockModule("../models/AccessLog.js", AccessLogMock);
registerMockModule("../models/Notification.js", NotificationMock);
registerMockModule("../models/Visitor.js", VisitorMock);

const app = require("../server");

let server;
let baseUrl;

const requestJson = async (route, { method = "GET", body, headers = {} } = {}) => {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsedBody = {};
  try {
    parsedBody = text ? JSON.parse(text) : {};
  } catch {
    parsedBody = { raw: text };
  }

  return {
    status: response.status,
    headers: response.headers,
    body: parsedBody,
  };
};

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test.beforeEach(() => {
  state.users = [];
  state.settings = null;
  state.accessLogCreates = [];
  state.accessLogSaves = [];
});

test("login returns the same error for unknown users and wrong passwords", async () => {
  persistDoc({
    _id: "user-1",
    email: "known@example.com",
    username: "knownuser",
    password: "CorrectPass123",
    role: "visitor",
    status: "active",
    isVerified: true,
    firstName: "Known",
    lastName: "User",
  });

  const unknownUserResponse = await requestJson("/api/login", {
    method: "POST",
    body: { email: "missing@example.com", password: "WrongPass123" },
  });
  const wrongPasswordResponse = await requestJson("/api/login", {
    method: "POST",
    body: { email: "known@example.com", password: "WrongPass123" },
  });

  assert.equal(unknownUserResponse.status, 401);
  assert.equal(wrongPasswordResponse.status, 401);
  assert.equal(
    unknownUserResponse.body.error,
    wrongPasswordResponse.body.error,
  );
});

test("login rate limiting blocks repeated failed attempts", async () => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await requestJson("/api/login", {
      method: "POST",
      body: { email: "ratelimit@example.com", password: "WrongPass123" },
    });

    if (attempt < 5) {
      assert.equal(response.status, 401);
    } else {
      assert.equal(response.status, 429);
      assert.match(response.body.message, /Too many login attempts/i);
    }
  }
});

test("password reset request is generic for existing and missing accounts", async () => {
  persistDoc({
    _id: "user-2",
    email: "visitor@example.com",
    username: "visitoruser",
    password: "CorrectPass123",
    role: "visitor",
    status: "active",
    isVerified: true,
    firstName: "Visitor",
    lastName: "Account",
  });

  const existingResponse = await requestJson("/api/auth/request-password-reset", {
    method: "POST",
    body: { email: "visitor@example.com" },
  });
  const missingResponse = await requestJson("/api/auth/request-password-reset", {
    method: "POST",
    body: { email: "missing@example.com" },
  });

  assert.equal(existingResponse.status, 200);
  assert.equal(missingResponse.status, 200);
  assert.equal(existingResponse.body.message, missingResponse.body.message);
});

test("admin settings can be updated and then read back through the API", async () => {
  persistDoc({
    _id: "admin-1",
    email: "admin@example.com",
    username: "adminuser",
    password: "AdminPass123",
    role: "admin",
    status: "active",
    isVerified: true,
    firstName: "Admin",
    lastName: "User",
  });

  const token = jwt.sign({ userId: "admin-1" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const updateResponse = await requestJson("/api/admin/settings", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: {
      maintenanceMode: true,
      emailNotifications: false,
      sessionTimeout: 45,
      backupFrequency: "weekly",
    },
  });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.settings.maintenanceMode, true);
  assert.equal(updateResponse.body.settings.emailNotifications, false);
  assert.equal(updateResponse.body.settings.sessionTimeout, "45");
  assert.equal(updateResponse.body.settings.backupFrequency, "weekly");

  const fetchResponse = await requestJson("/api/admin/settings", {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(fetchResponse.status, 200);
  assert.equal(fetchResponse.body.settings.maintenanceMode, true);
  assert.equal(fetchResponse.body.settings.emailNotifications, false);
  assert.equal(fetchResponse.body.settings.sessionTimeout, "45");
  assert.equal(fetchResponse.body.settings.backupFrequency, "weekly");
});
