const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Visitor = require("./models/Visitor");
const Notification = require("./models/Notification");
const User = require("./models/User");
const AccessLog = require("./models/AccessLog");
const timestamp = Date.now();
const randomString = Math.random().toString(36).substr(2, 10).toUpperCase();
const tempNfcCardId = `PENDING-${timestamp}-${randomString}`;
const otpStore = new Map();
require("dotenv").config();

const app = express();

// ========== ENHANCED CORS CONFIGURATION ==========
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-device-key"],
  }),
);

// Handle preflight requests
app.options("*", cors());

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ========== DATABASE CONNECTION ==========
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected (Local)"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.log("Trying to connect to:", MONGODB_URI);
  });

// ========== HELPER FUNCTIONS ==========
// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "sapphire_secret_2024",
    {
      expiresIn: "7d",
    },
  );
};

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sapphire_secret_2024",
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

const getNotificationTargetRoles = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "guard" || normalizedRole === "security") {
    return ["all", "security", "guard"];
  }
  return ["all", normalizedRole];
};

const getFullName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim();

const createSystemActivity = async ({
  actorUser = null,
  relatedVisitor = null,
  relatedUser = null,
  activityType = "",
  status = "granted",
  location = "System",
  notes = "",
  metadata = {},
}) => {
  try {
    await AccessLog.create({
      userId: actorUser?._id || relatedUser?._id || null,
      userEmail: actorUser?.email || relatedVisitor?.email || relatedUser?.email || "",
      userName:
        getFullName(actorUser) ||
        relatedVisitor?.fullName ||
        getFullName(relatedUser) ||
        "System",
      actorRole: actorUser?.role || relatedUser?.role || "system",
      location,
      accessType: "system",
      activityType,
      status,
      nfcCardId: actorUser?.nfcCardId || relatedUser?.nfcCardId || null,
      relatedVisitor: relatedVisitor?._id || null,
      relatedUser: relatedUser?._id || null,
      metadata,
      notes,
    });
  } catch (error) {
    console.error("Create system activity error:", error);
  }
};

const createRoleNotification = async ({
  title,
  message,
  targetRole = "all",
  targetUser = null,
  relatedVisitor = null,
  relatedUser = null,
  type = "info",
  severity = "low",
  metadata = {},
  expiresInDays = 7,
}) => {
  try {
    await Notification.create({
      title,
      message,
      targetRole,
      targetUser,
      relatedVisitor,
      relatedUser,
      type,
      severity,
      metadata,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("Create notification error:", error);
  }
};

const CHECKPOINT_LOCATIONS = {
  main_gate: {
    floor: "ground",
    office: "Main Gate",
    coordinates: { x: 18, y: 78 },
  },
  administration: {
    floor: "ground",
    office: "Administration",
    coordinates: { x: 18, y: 36 },
  },
  registrar: {
    floor: "ground",
    office: "Registrar's Office",
    coordinates: { x: 45, y: 44 },
  },
  accounting: {
    floor: "ground",
    office: "Accounting Office",
    coordinates: { x: 66, y: 42 },
  },
  conference_room: {
    floor: "first",
    office: "Conference Room",
    coordinates: { x: 10, y: 36 },
  },
  chairman: {
    floor: "first",
    office: "Chairman",
    coordinates: { x: 21, y: 40 },
  },
  flight_operations: {
    floor: "first",
    office: "Flight Operations",
    coordinates: { x: 33, y: 43 },
  },
  head_of_training_room: {
    floor: "first",
    office: "Head Of Training Room",
    coordinates: { x: 45, y: 42 },
  },
  it_room: {
    floor: "first",
    office: "I.T Room",
    coordinates: { x: 57, y: 42 },
  },
  faculty_room: {
    floor: "first",
    office: "Faculty Room",
    coordinates: { x: 69, y: 36 },
  },
  academy_director: {
    floor: "first",
    office: "Academy Director",
    coordinates: { x: 82, y: 37 },
  },
  cr: {
    floor: "first",
    office: "CR",
    coordinates: { x: 94, y: 25 },
  },
  sto: {
    floor: "first",
    office: "STO",
    coordinates: { x: 94, y: 44 },
  },
};

const normalizeCheckpointId = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const clampMapCoordinate = (value, min = 5, max = 95) =>
  Math.max(min, Math.min(max, value));

const mapGpsToCampusCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { x: null, y: null };
  }

  const latMin = Number(process.env.CAMPUS_LAT_MIN || 14.5976);
  const latMax = Number(process.env.CAMPUS_LAT_MAX || 14.6007);
  const lngMin = Number(process.env.CAMPUS_LNG_MIN || 120.9823);
  const lngMax = Number(process.env.CAMPUS_LNG_MAX || 120.9857);

  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = (1 - (lat - latMin) / (latMax - latMin)) * 100;

  return {
    x: Number(clampMapCoordinate(x).toFixed(2)),
    y: Number(clampMapCoordinate(y).toFixed(2)),
  };
};

const getTapLocationFromRequest = (body = {}) => {
  const checkpointId = normalizeCheckpointId(body.checkpointId || body.checkpoint || body.office);
  const knownCheckpoint = CHECKPOINT_LOCATIONS[checkpointId] || null;
  const coordinates = body.coordinates || {};

  return {
    checkpointId,
    floor: String(body.floor || knownCheckpoint?.floor || "").trim(),
    office: String(body.office || knownCheckpoint?.office || checkpointId || "Unknown Checkpoint").trim(),
    coordinates: {
      x: Number.isFinite(Number(coordinates.x ?? knownCheckpoint?.coordinates?.x))
        ? Number(coordinates.x ?? knownCheckpoint?.coordinates?.x)
        : null,
      y: Number.isFinite(Number(coordinates.y ?? knownCheckpoint?.coordinates?.y))
        ? Number(coordinates.y ?? knownCheckpoint?.coordinates?.y)
        : null,
    },
    source: String(body.source || "arduino_tap").trim(),
  };
};

const validateDeviceKey = (req, res, next) => {
  const expectedKey = process.env.ARDUINO_DEVICE_KEY || "safepass-device-key";
  const providedKey = req.header("x-device-key") || req.body?.deviceKey;

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid device key",
    });
  }

  next();
};

// ========== EMAIL SIMULATION (for demo) ==========
const sendEmail = (to, subject, body) => {
  console.log(`\n📧 ========== EMAIL SIMULATION ==========`);
  console.log(`📧 To: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Body: ${body}`);
  console.log(`📧 ====================================\n`);
  return { success: true };
};

// ========== ROUTES ==========

// 0. TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.post("/api/device/location-tap", validateDeviceKey, async (req, res) => {
  try {
    const cardId = String(
      req.body?.nfcCardId ||
        req.body?.cardId ||
        req.body?.uid ||
        req.body?.tagId ||
        "",
    ).trim();
    const deviceId = String(req.body?.deviceId || "arduino-reader").trim();
    const tapLocation = getTapLocationFromRequest(req.body || {});

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: "Missing NFC card ID",
      });
    }

    if (!tapLocation.floor || !tapLocation.office) {
      return res.status(400).json({
        success: false,
        message: "Missing checkpoint floor or office",
      });
    }

    const visitorUser = await User.findOne({
      nfcCardId: cardId,
      role: "visitor",
    }).select("_id email firstName lastName nfcCardId role");

    if (!visitorUser) {
      await AccessLog.create({
        userEmail: "",
        userName: "Unknown NFC Card",
        actorRole: "device",
        location: tapLocation.office,
        accessType: "system",
        activityType: "arduino_location_tap",
        status: "denied",
        nfcCardId: cardId,
        metadata: {
          deviceId,
          tapLocation,
        },
        notes: `Unknown NFC card tapped at ${tapLocation.office}`,
      });

      return res.status(404).json({
        success: false,
        message: "NFC card is not assigned to a visitor",
      });
    }

    const visitor = await Visitor.findOne({
      email: visitorUser.email,
      status: "checked_in",
    }).sort({ checkedInAt: -1 });

    if (!visitor) {
      await AccessLog.create({
        userId: visitorUser._id,
        userEmail: visitorUser.email,
        userName: `${visitorUser.firstName || ""} ${visitorUser.lastName || ""}`.trim(),
        actorRole: "device",
        location: tapLocation.office,
        accessType: "system",
        activityType: "arduino_location_tap",
        status: "denied",
        nfcCardId: cardId,
        relatedUser: visitorUser._id,
        metadata: {
          deviceId,
          tapLocation,
        },
        notes: `Card tapped at ${tapLocation.office}, but visitor is not checked in`,
      });

      return res.status(409).json({
        success: false,
        message: "Visitor must be checked in before tracking can start",
      });
    }

    visitor.updateCurrentLocation(tapLocation, { deviceId });
    await visitor.save();

    await AccessLog.create({
      userId: visitorUser._id,
      userEmail: visitor.email,
      userName: visitor.fullName,
      actorRole: "device",
      location: tapLocation.office,
      accessType: "system",
      activityType: "arduino_location_tap",
      status: "granted",
      nfcCardId: cardId,
      relatedVisitor: visitor._id,
      relatedUser: visitorUser._id,
      metadata: {
        deviceId,
        currentLocation: visitor.currentLocation,
      },
      notes: `${visitor.fullName} tapped at ${tapLocation.office}`,
    });

    res.json({
      success: true,
      message: "Visitor location updated",
      visitorId: visitor._id,
      currentLocation: visitor.currentLocation,
      visitor: {
        _id: visitor._id,
        fullName: visitor.fullName,
        email: visitor.email,
        status: visitor.status,
        currentLocation: visitor.currentLocation,
      },
    });
  } catch (error) {
    console.error("Arduino location tap error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update visitor location",
    });
  }
});

app.put("/api/visitors/:id/phone-location", authMiddleware, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    const requesterRole = String(req.user.role || "").toLowerCase();
    const isOwnVisitorRecord =
      requesterRole === "visitor" &&
      String(visitor.email || "").toLowerCase() === String(req.user.email || "").toLowerCase();
    const canUpdateTrackedLocation =
      isOwnVisitorRecord || ["admin", "security", "guard"].includes(requesterRole);

    if (!canUpdateTrackedLocation) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this visitor location",
      });
    }

    if (visitor.status !== "checked_in") {
      return res.status(409).json({
        success: false,
        message: "Visitor must be checked in before phone GPS tracking can start",
      });
    }

    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const coordinates = mapGpsToCampusCoordinates(latitude, longitude);
    visitor.updateCurrentLocation(
      {
        floor: req.body?.floor || visitor.currentLocation?.floor || "ground",
        office: req.body?.office || visitor.currentLocation?.office || "Phone GPS",
        checkpointId: "phone_gps",
        coordinates,
        gps: {
          latitude,
          longitude,
          accuracy: req.body?.accuracy,
          altitude: req.body?.altitude,
          heading: req.body?.heading,
          speed: req.body?.speed,
        },
        source: "phone_gps",
      },
      {
        deviceId: req.body?.deviceId || `phone-${req.user._id}`,
      },
    );

    await visitor.save();

    res.json({
      success: true,
      message: "Phone GPS location updated",
      visitorId: visitor._id,
      currentLocation: visitor.currentLocation,
    });
  } catch (error) {
    console.error("Phone GPS location update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update phone GPS location",
    });
  }
});

// 1. REGISTER
const normalizeEmailValue = (value = "") => String(value || "").toLowerCase().trim();
const normalizeUsernameValue = (value = "") => String(value || "").toLowerCase().trim();
const isValidEmailValue = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
const normalizeDepartmentValue = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");

  const aliases = {
    "registrars office": "registrar",
    registrar: "registrar",
    "finance office": "accounting",
    finance: "accounting",
    accounting: "accounting",
    cashier: "accounting",
    guidance: "guidance",
    "guidance office": "guidance",
    "student services": "guidance",
    administration: "administration",
    "administration office": "administration",
    admissions: "admissions",
    "admissions office": "admissions",
    "flight operations": "flight operations",
    training: "training",
    "head of training room": "training",
    "i.t room": "i.t room",
    "it room": "i.t room",
    "faculty room": "faculty room",
  };

  return aliases[normalized] || normalized;
};

const formatDepartmentLabel = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStaffDepartmentQuery = (department = "") => {
  const normalizedDepartment = normalizeDepartmentValue(department);
  const aliasGroups = {
    registrar: ["Registrar", "Registrar's Office"],
    accounting: ["Accounting", "Finance", "Finance Office", "Cashier"],
    guidance: ["Guidance", "Guidance Office", "Student Services"],
    administration: ["Administration", "Administration Office"],
    admissions: ["Admissions", "Admissions Office"],
    "flight operations": ["Flight Operations"],
    training: ["Training", "Head of Training Room"],
    "i.t room": ["I.T Room", "IT Room"],
    "faculty room": ["Faculty Room"],
  };

  const labels = aliasGroups[normalizedDepartment] || [department];
  return { $in: labels.map((label) => new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) };
};

const isStaffAllowedForAppointment = (staffUser = {}, visitor = {}) => {
  if (String(staffUser.role).toLowerCase() === "admin") return true;

  const staffDepartment = normalizeDepartmentValue(staffUser.department);
  const appointmentDepartment = normalizeDepartmentValue(
    visitor.appointmentDepartment || visitor.assignedOffice || visitor.host,
  );

  return Boolean(staffDepartment && appointmentDepartment && staffDepartment === appointmentDepartment);
};

app.post("/api/register", async (req, res) => {
  console.log("📝 Registration attempt:", req.body);

  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      role,
      visitorId,
      status,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["firstName", "lastName", "email", "password", "phone"],
      });
    }

    const normalizedEmail = normalizeEmailValue(email);
    const normalizedUsername = normalizeUsernameValue(username);

    if (!isValidEmailValue(normalizedEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
        field: "email",
      });
    }

    // Check if user already exists
    const duplicateChecks = [{ email: normalizedEmail }];
    if (normalizedUsername) {
      duplicateChecks.push({ username: normalizedUsername });
    }

    const existingUser = await User.findOne({ $or: duplicateChecks });
    if (existingUser) {
      const duplicateField =
        existingUser.email === normalizedEmail
          ? "email"
          : existingUser.username === normalizedUsername
            ? "username"
            : "email";

      return res.status(400).json({
        error: duplicateField === "username" ? "Username already registered" : "Email already registered",
        field: duplicateField,
      });
    }

    let nfcCardId = null;
    if (role !== "visitor" || (role === "visitor" && status === "active")) {
      const timestamp = Date.now();
      const randomString = Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase();
      nfcCardId = `SAFEPASS-${timestamp}-${randomString}`;
    }

    let employeeId = req.body.employeeId
      ? String(req.body.employeeId).trim()
      : undefined;
    if (!employeeId && (role === "staff" || role === "guard")) {
      const prefix = role === "staff" ? "STF" : "GRD";
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      employeeId = `${prefix}-${timestamp}-${random}`;
    }

const userData = {
  firstName,
  lastName,
  username: normalizedUsername || undefined,
  email: normalizedEmail,
  password,
  phone,
  role: role || 'visitor',
  nfcCardId,
  employeeId: employeeId || undefined,
  department: req.body.department || '',
  position: req.body.position || '',     
  status: status || (role === 'visitor' ? 'pending' : 'active'),
  visitorId: visitorId || null,
};

    const user = new User(userData);
    await user.save();
    console.log("✅ User created:", user.email, "Status:", user.status);

    // Generate token (only if user is active)
    let token = null;
    if (user.status === "active") {
      token = generateToken(user._id);

      // Send welcome email with credentials
      sendEmail(
        user.email,
        `Welcome to Sapphire Aviation - Your ${user.role.toUpperCase()} Account`,
        `Dear ${user.firstName} ${user.lastName},\n\n` +
          `Your account has been created successfully!\n\n` +
          `Login Credentials:\n` +
          `Email: ${user.email}\n` +
          `Password: ${req.body.password}\n\n` +
          `Role: ${user.role.toUpperCase()}\n` +
          `Employee ID: ${user.employeeId || "N/A"}\n\n` +
          `Please login to the app and change your password for security.\n\n` +
          `Thank you,\n` +
          `Sapphire Aviation Security Team`,
      );
      console.log(`📧 Welcome email sent to: ${user.email}`);
    }

    // Create initial access log
    const accessLog = new AccessLog({
      userId: user._id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      location: "Registration System",
      accessType: "system",
      status: user.status === "active" ? "granted" : "pending",
      nfcCardId: user.nfcCardId,
      notes:
        user.status === "active"
          ? "Account created and NFC card issued"
          : "Account created pending approval",
    });
    await accessLog.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message:
        user.status === "active"
          ? "Registration successful"
          : "Registration submitted. Pending admin approval.",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate field value entered",
        field: Object.keys(error.keyPattern)[0],
      });
    }

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ error: "Validation failed", errors });
    }

    res.status(500).json({
      error: "Registration failed",
      message: error.message,
    });
  }
});

// Get visitor profile for logged-in visitor
app.get("/api/visitor/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "visitor") {
      let visitor = null;

      if (req.user.visitorId) {
        visitor = await Visitor.findById(req.user.visitorId);
      }

      if (!visitor) {
        visitor = await Visitor.findOne({ email: req.user.email });
      }

      if (visitor) {
        return res.json({
          success: true,
          visitor,
        });
      }

      return res.json({
        success: true,
        visitor: {
          _id: req.user._id,
          fullName: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          phoneNumber: req.user.phone,
          status: req.user.status,
          registeredAt: req.user.createdAt,
        },
      });
    }

    res.status(404).json({
      success: false,
      message: "Visitor profile not found",
    });
  } catch (error) {
    console.error("Get visitor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get visitor profile",
    });
  }
});

// 2. LOGIN
app.post("/api/login", async (req, res) => {
  console.log("Login attempt:", req.body.email);

  try {
    const { email, password } = req.body;
    const loginIdentifier = String(email || "").toLowerCase().trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Username/email and password are required" });
    }

    // Visitors can sign in using either their username or email address.
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
    });
    if (!user) {
      console.log("User not found:", loginIdentifier);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is inactive
    if (user.status === "inactive" || user.status === "suspended") {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for:", loginIdentifier);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Create access log
    const accessLog = new AccessLog({
      userId: user._id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      location: "Mobile App",
      accessType: "system",
      status: user.status === "pending" ? "pending" : "granted",
      nfcCardId: user.nfcCardId,
      notes:
        user.status === "pending"
          ? "Pending visitor logged in and is waiting for admin approval"
          : "User logged in via mobile app",
    });
    await accessLog.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("Login successful:", user.email, "Role:", user.role);

    await createSystemActivity({
      actorUser: user,
      relatedUser: user,
      activityType: "user_login",
      status: user.status === "pending" ? "pending" : "granted",
      location: "Mobile App",
      notes: `${user.firstName} ${user.lastName} logged in as ${user.role}.`,
      metadata: {
        role: user.role,
        email: user.email,
      },
    });

    res.json({
      success: true,
      message:
        user.status === "pending"
          ? "Login successful. Account is waiting for admin approval."
          : "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: error.message,
    });
  }
});

// 3. GET PROFILE (Protected)
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 4. UPDATE PROFILE (Protected)
app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    // Don't allow password update through this route
    delete updates.password;
    delete updates.email; // Email cannot be changed

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// 4b. CHANGE PASSWORD (Protected)
app.put("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
});

// 5. CHECK EMAIL EXISTS
app.post("/api/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("❌ Check email error:", error);
    res.status(500).json({ error: "Failed to check email" });
  }
});

// ============ VISITOR REGISTRATION ROUTES ============

// Register a new visitor (Complete version with UNIQUE NFC ID for pending visitors)
app.post("/api/visitors/register", async (req, res) => {
  try {
    const visitorData = req.body || {};
    const normalizedFullName = String(visitorData.fullName || "").trim();
    const normalizedEmail = normalizeEmailValue(visitorData.email);
    const normalizedUsername = normalizeUsernameValue(visitorData.username);
    const password = String(visitorData.password || "");

    if (!normalizedFullName || !normalizedEmail || !normalizedUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, username, and password are required.",
      });
    }

    if (!isValidEmailValue(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists. Please log in instead."
            : "That username is already taken. Please choose another username.",
      });
    }

    const existingVisitor = await Visitor.findOne({ email: normalizedEmail }).sort({
      registeredAt: -1,
    });
    const nameParts = normalizedFullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() || "Visitor";
    const lastName = nameParts.join(" ") || "User";

    const user = new User({
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      phone: "",
      role: "visitor",
      status: "active",
      isActive: true,
      visitorId: existingVisitor?._id || null,
      nfcCardId: null,
    });

    await user.save();
    console.log("Visitor account created:", normalizedEmail);

    await createSystemActivity({
      actorUser: user,
      relatedVisitor: existingVisitor?._id ? existingVisitor : null,
      relatedUser: user,
      activityType: "visitor_account_registration",
      status: "granted",
      location: "Visitor Registration",
      notes: `${normalizedFullName} created a visitor account.`,
      metadata: {
        username: user.username,
        email: user.email,
      },
    });

    await AccessLog.create({
      userId: user._id,
      userEmail: user.email,
      userName: normalizedFullName,
      actorRole: "visitor",
      location: "Visitor Registration",
      accessType: "system",
      activityType: "visitor_account_registration",
      status: "granted",
      relatedUser: user._id,
      relatedVisitor: existingVisitor?._id || null,
      notes: "Visitor account created successfully",
    });

    res.status(201).json({
      success: true,
      message: "Visitor account created successfully.",
      user: {
        _id: user._id,
        fullName: normalizedFullName,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
      },
      credentials: {
        username: user.username,
        email: user.email,
        password,
      },
    });
  } catch (error) {
    console.error("Visitor registration error:", error);

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(error.keyPattern || {})[0] ||
        Object.keys(error.keyValue || {})[0] ||
        "";

      return res.status(400).json({
        success: false,
        message:
          duplicateField === "email"
            ? "An account with this email already exists. Please log in instead."
            : duplicateField === "username"
              ? "That username is already taken. Please choose another username."
              : "A duplicate entry was found. Please try again with different details.",
        duplicateField,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register visitor",
      error: error.message,
    });
  }
});

// ============ ADMIN VISITOR APPROVAL ROUTES ============

// Get pending visitors (admin only) - WITH DEBUG LOGS
app.get("/api/admin/visitors/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const visitors = await Visitor.find({
      requestCategory: "registration",
      approvalFlow: "admin",
      approvalStatus: "pending",
    }).sort({ registeredAt: -1 });

    console.log(`\n📋 Found ${visitors.length} pending visitors:`);
    visitors.forEach((v) => {
      console.log(
        `   - ${v.fullName} (${v.email}): status=${v.status}, approvalStatus=${v.approvalStatus}`,
      );
    });

    res.json({
      success: true,
      visitors,
    });
  } catch (error) {
    console.error("Get pending visitors error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get pending visitors" });
  }
});

// Get all visitors with filters (admin only)
app.get("/api/admin/visitors", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, page = 1, limit = 100 } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (status === "pending") {
      delete query.status;
      query.$or = [
        { requestCategory: "registration", approvalStatus: "pending" },
        { requestCategory: "appointment", appointmentStatus: "pending" },
      ];
    } else if (status === "approved") {
      delete query.status;
      query.approvalStatus = "approved";
      query.$or = [
        { requestCategory: "registration" },
        {
          requestCategory: "appointment",
          appointmentStatus: { $in: ["approved", "adjusted"] },
        },
      ];
    } else if (status === "rejected") {
      delete query.status;
      query.$or = [
        { requestCategory: "registration", approvalStatus: "rejected" },
        { requestCategory: "appointment", appointmentStatus: "rejected" },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const visitors = await Visitor.find(query)
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Visitor.countDocuments(query);

    console.log(
      `📋 Found ${visitors.length} visitors with status: ${status || "all"}`,
    );

    res.json({
      success: true,
      visitors,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all visitors error:", error);
    res.status(500).json({ success: false, message: "Failed to get visitors" });
  }
});

// Approve visitor registration (admin only) - WITH DEBUG LOGS
app.put("/api/admin/visitors/:id/approve", authMiddleware, async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log("🔵 APPROVE ROUTE CALLED");
  console.log("=".repeat(60));
  console.log("Visitor ID:", req.params.id);
  console.log("Admin User:", req.user?.email);
  console.log("Admin ID:", req.user?._id);

  try {
    if (req.user.role !== "admin") {
      console.log("❌ Access denied - not admin");
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { adminNotes } = req.body;
    console.log("Admin Notes:", adminNotes);

    // Find the visitor
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      console.log("❌ Visitor not found:", req.params.id);
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
    }

    console.log("\n📋 VISITOR FOUND:");
    console.log(`   Name: ${visitor.fullName}`);
    console.log(`   Email: ${visitor.email}`);
    console.log(`   Current status: ${visitor.status}`);
    console.log(`   Current approvalStatus: ${visitor.approvalStatus}`);
    console.log(`   Visit Date: ${visitor.visitDate}`);
    console.log(`   Purpose: ${visitor.purposeOfVisit}`);

    // Generate REAL NFC card ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 8).toUpperCase();
    const realNfcCardId = `SAFEPASS-${timestamp}-${randomString}`;
    console.log("\n🔑 Generated NFC Card ID:", realNfcCardId);

    // Generate temporary password if not already set
    const tempPassword =
      visitor.temporaryPassword ||
      `VIS${Math.random().toString(36).slice(-8).toUpperCase()}`;
    console.log("🔐 Temporary Password:", tempPassword);

    // Update visitor status - THIS IS THE KEY PART
    console.log("\n📝 UPDATING VISITOR...");
    visitor.approveRegistration(req.user._id, adminNotes || "");
    visitor.temporaryPassword = tempPassword;

    await visitor.save();
    console.log("✅ Visitor updated in database");
    console.log(`   New status: ${visitor.status}`);
    console.log(`   New approvalStatus: ${visitor.approvalStatus}`);
    console.log(`   Approved At: ${visitor.approvedAt}`);

    // Find and update the user
    console.log("\n👤 CHECKING FOR USER ACCOUNT...");
    let user = await User.findOne({ email: visitor.email });
    console.log(`   User exists: ${user ? "Yes" : "No"}`);

    if (!user) {
      console.log("📝 Creating new user account...");
      // Create user account for the visitor
      const userData = {
        firstName: visitor.fullName.split(" ")[0] || "Visitor",
        lastName: visitor.fullName.split(" ").slice(1).join(" ") || "User",
        email: visitor.email,
        password: tempPassword,
        phone: visitor.phoneNumber,
        role: "visitor",
        status: "active",
        isActive: true,
        visitorId: visitor._id,
        nfcCardId: realNfcCardId,
      };

      user = new User(userData);
      await user.save();
      console.log(
        "✅ User account created for approved visitor:",
        visitor.email,
      );
      console.log(`   User ID: ${user._id}`);
      console.log(`   NFC Card: ${user.nfcCardId}`);
    } else {
      console.log("📝 Updating existing user account...");
      // Keep the approved account credentials and visitor link in sync.
      user.firstName = visitor.fullName.split(" ")[0] || user.firstName;
      user.lastName =
        visitor.fullName.split(" ").slice(1).join(" ") || user.lastName;
      user.phone = visitor.phoneNumber || user.phone;
      user.role = "visitor";
      user.visitorId = visitor._id;
      user.password = tempPassword;
      user.status = "active";
      user.isActive = true;
      user.nfcCardId = realNfcCardId;
      await user.save();
      console.log(
        "✅ User account activated with real NFC card:",
        realNfcCardId,
      );
      console.log(`   User ID: ${user._id}`);
      console.log(`   New status: ${user.status}`);
    }

    // Send approval email (simulated)
    sendEmail(
      visitor.email,
      "Visitor Registration Approved - Sapphire Aviation",
      `Dear ${visitor.fullName},\n\nYour visitor registration has been approved!\n\nLogin Credentials:\nEmail: ${visitor.email}\nPassword: ${tempPassword}\n\nVisit Details:\nPurpose: ${visitor.purposeOfVisit}\nDate: ${new Date(visitor.visitDate).toLocaleDateString()}\nTime: ${new Date(visitor.visitTime).toLocaleTimeString()}\n\nThank you,\nSapphire Aviation Security Team`,
    );
    console.log("📧 Approval email sent to:", visitor.email);

    // Create notification for security
    await createRoleNotification({
      title: "New Visitor Approved",
      message: `${visitor.fullName} has been approved to visit on ${new Date(visitor.visitDate).toLocaleDateString()} at ${new Date(visitor.visitTime).toLocaleTimeString()}`,
      type: "visitor",
      severity: "medium",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: user._id,
      metadata: {
        activityType: "admin_approved_registration",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
      },
    });
    console.log("🔔 Security notification created");

    console.log("\n✅ VISITOR APPROVED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: user,
      activityType: "admin_approved_registration",
      status: "granted",
      location: visitor.assignedOffice || visitor.host || "Admin Approval Desk",
      notes: `${req.user.firstName} ${req.user.lastName} approved ${visitor.fullName}'s registration.`,
      metadata: {
        adminNotes: visitor.adminNotes,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
      },
    });

    res.json({
      success: true,
      message: "Visitor approved successfully",
      visitor: {
        _id: visitor._id,
        fullName: visitor.fullName,
        email: visitor.email,
        status: visitor.status,
        approvalStatus: visitor.approvalStatus,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("\n❌ APPROVE VISITOR ERROR:", error);
    console.log("=".repeat(60) + "\n");
    res.status(500).json({
      success: false,
      message: "Failed to approve visitor",
      error: error.message,
    });
  }
});

// Reject visitor registration (admin only)
app.put("/api/admin/visitors/:id/reject", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { reason } = req.body;
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
    }

    visitor.rejectRegistration(req.user._id, reason || "No reason provided");
    await visitor.save();

    // Send rejection email (simulated)
    sendEmail(
      visitor.email,
      "Visitor Registration Update - Sapphire Aviation",
      `Dear ${visitor.fullName},\n\nWe regret to inform you that your visitor registration has been rejected.\n\nReason: ${reason || "No specific reason provided"}\n\nIf you have any questions, please contact us.\n\nThank you,\nSapphire Aviation Security Team`,
    );

    // Create notification for security
    await createRoleNotification({
      title: "Visitor Rejected",
      message: `${visitor.fullName}'s registration was rejected. Reason: ${reason || "N/A"}`,
      type: "alert",
      severity: "medium",
      targetRole: "security",
      relatedVisitor: visitor._id,
      metadata: {
        activityType: "admin_rejected_registration",
        reason: reason || "No reason provided",
      },
    });

    console.log("❌ Visitor rejected:", visitor.email);

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      activityType: "admin_rejected_registration",
      status: "denied",
      location: visitor.assignedOffice || visitor.host || "Admin Approval Desk",
      notes: `${req.user.firstName} ${req.user.lastName} rejected ${visitor.fullName}'s registration.`,
      metadata: {
        reason: reason || "No reason provided",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    res.json({
      success: true,
      message: "Visitor rejected successfully",
    });
  } catch (error) {
    console.error("Reject visitor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject visitor" });
  }
});

// ============ SECURITY GUARD MANAGEMENT ROUTES ============

// Create staff account (admin only)
app.post("/api/admin/staff/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      department,
      position,
      employeeId,
      status,
    } = req.body;

    if (!firstName || !lastName || !username || !email || !password || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["firstName", "lastName", "username", "email", "password", "phone", "department"],
      });
    }

    const normalizedEmail = normalizeEmailValue(email);
    const normalizedUsername = normalizeUsernameValue(username);
    const normalizedEmployeeId = employeeId ? String(employeeId).trim() : "";
    const normalizedStatus = status === "inactive" ? "inactive" : "active";

    if (!isValidEmailValue(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        field: "email",
      });
    }

    const duplicateChecks = [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ];

    if (normalizedEmployeeId) {
      duplicateChecks.push({ employeeId: normalizedEmployeeId });
    }

    const existingUser = await User.findOne({ $or: duplicateChecks });
    if (existingUser) {
      const duplicateField =
        existingUser.email === normalizedEmail
          ? "email"
          : existingUser.username === normalizedUsername
            ? "username"
            : "employeeId";

      return res.status(400).json({
        success: false,
        message:
          duplicateField === "username"
            ? "Username already registered"
            : duplicateField === "employeeId"
              ? "Staff ID already registered"
              : "Email already registered",
        field: duplicateField,
      });
    }

    let finalEmployeeId = normalizedEmployeeId;
    if (!finalEmployeeId) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      finalEmployeeId = `STF-${timestamp}-${random}`;
    }

    const nfcCardId = `SAFEPASS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const user = new User({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      phone: String(phone).trim(),
      role: "staff",
      status: normalizedStatus,
      isActive: normalizedStatus === "active",
      employeeId: finalEmployeeId,
      department: String(department).trim(),
      position: String(position || "Staff Member").trim(),
      nfcCardId,
    });

    await user.save();

    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Created staff account: ${user.email}`,
    });
    await accessLog.save();

    sendEmail(
      user.email,
      `Welcome to Sapphire Aviation - Staff Account`,
      `Dear ${user.firstName} ${user.lastName},\n\n` +
        `Your staff account has been created by the administrator.\n\n` +
        `Username: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Password: ${password}\n` +
        `Staff ID: ${user.employeeId}\n` +
        `Department: ${user.department}\n` +
        `Status: ${user.status.toUpperCase()}\n\n` +
        `Please sign in and change your password as soon as possible.\n\n` +
        `Thank you,\n` +
        `Sapphire Aviation Security Team`,
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create staff account error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message:
          duplicateField === "username"
            ? "Username already registered"
            : duplicateField === "employeeId"
              ? "Staff ID already registered"
              : "Email already registered",
        field: duplicateField,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create staff account",
      error: error.message,
    });
  }
});

// Create security guard (admin only)
app.post("/api/admin/security/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      shift,
      position,
      employeeId,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate NFC Card ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nfcCardId = `SAFEPASS-${timestamp}-${randomString}`;

    // Generate employee ID if not provided
    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      const timeStamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      finalEmployeeId = `GRD-${timeStamp}-${random}`;
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password,
      phone,
      role: "guard",
      nfcCardId,
      employeeId: finalEmployeeId,
      position: position || "Security Guard",
      status: "active",
      isActive: true,
    });

    await user.save();

    // Send welcome email
    sendEmail(
      user.email,
      `Welcome to Sapphire Aviation - Security Guard Account`,
      `Dear ${user.firstName} ${user.lastName},\n\n` +
        `Your Security Guard account has been created!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔐 LOGIN CREDENTIALS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📧 Email: ${user.email}\n` +
        `🔑 Password: ${password}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 ACCOUNT DETAILS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Name: ${user.firstName} ${user.lastName}\n` +
        `🎭 Role: SECURITY GUARD\n` +
        `🆔 Employee ID: ${user.employeeId}\n` +
        `📱 Phone: ${user.phone}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Please login to the app and change your password for security.\n\n` +
        `Thank you,\n` +
        `Sapphire Aviation Security Team`,
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Security guard created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create security guard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create security guard",
      error: error.message,
    });
  }
});

// Get all security guards
app.get("/api/admin/security", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const guards = await User.find({ role: { $in: ["guard", "security"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      guards,
    });
  } catch (error) {
    console.error("Get security guards error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get security guards",
    });
  }
});

// Get security guard by ID
app.get("/api/admin/security/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const guard = await User.findOne({
      _id: req.params.id,
      role: { $in: ["guard", "security"] },
    }).select("-password");

    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Security guard not found",
      });
    }

    res.json({
      success: true,
      guard,
    });
  } catch (error) {
    console.error("Get security guard by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get security guard",
    });
  }
});

// Update security guard
app.put("/api/admin/security/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;
    const updates = req.body;

    delete updates.password;
    delete updates._id;
    delete updates.__v;

    const guard = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");

    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Security guard not found",
      });
    }

    res.json({
      success: true,
      message: "Security guard updated successfully",
      guard,
    });
  } catch (error) {
    console.error("Update security guard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update security guard",
    });
  }
});

// Delete security guard
app.delete("/api/admin/security/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;
    const guard = await User.findByIdAndDelete(id);

    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Security guard not found",
      });
    }

    res.json({
      success: true,
      message: "Security guard deleted successfully",
    });
  } catch (error) {
    console.error("Delete security guard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete security guard",
    });
  }
});

// Assign shift to security guard
app.put("/api/admin/security/:id/shift", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;
    const { shift } = req.body;

    const guard = await User.findByIdAndUpdate(
      id,
      { shift, updatedAt: new Date() },
      { new: true },
    ).select("-password");

    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Security guard not found",
      });
    }

    res.json({
      success: true,
      message: `Shift updated to ${shift}`,
      guard,
    });
  } catch (error) {
    console.error("Assign shift error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign shift",
    });
  }
});

// Get guard attendance logs (derived from access logs)
app.get("/api/admin/security/:id/attendance", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { startDate, endDate, limit = 100 } = req.query;

    const guard = await User.findById(req.params.id).select("email firstName lastName");
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Security guard not found",
      });
    }

    const query = { userEmail: guard.email };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const attendance = await AccessLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      attendance,
      guard: {
        id: guard._id,
        name: `${guard.firstName || ""} ${guard.lastName || ""}`.trim(),
        email: guard.email,
      },
    });
  } catch (error) {
    console.error("Get guard attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get guard attendance",
    });
  }
});

// ============ ADMIN NOTIFICATION ROUTES ============

// Send admin notification
app.post("/api/admin/notifications", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      type,
      visitorId,
      visitorName,
      visitorEmail,
      purpose,
      visitDate,
      visitTime,
      phoneNumber,
    } = req.body;

    const notification = new Notification({
      title: "New Visitor Registration",
      message: `${visitorName} (${visitorEmail}) has registered for a visit.\nPurpose: ${purpose}\nDate: ${new Date(visitDate).toLocaleDateString()}\nTime: ${new Date(visitTime).toLocaleTimeString()}\nPhone: ${phoneNumber}`,
      type: "visitor",
      severity: "medium",
      targetRole: "admin",
      relatedVisitor: visitorId,
      metadata: {
        visitorName,
        visitorEmail,
        purpose,
        visitDate,
        visitTime,
        phoneNumber,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await notification.save();

    console.log("📢 Admin notification created for visitor:", visitorName);

    res.json({
      success: true,
      message: "Admin notification sent",
    });
  } catch (error) {
    console.error("Send admin notification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
});

// ============ OTP ROUTES ============

// Request OTP
app.post("/api/auth/request-otp", async (req, res) => {
  console.log("📱 OTP request for:", req.body.phoneNumber);

  try {
    const { phoneNumber, method } = req.body;

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (5 minutes)
    otpStore.set(phoneNumber, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Generate a temporary token
    const tempToken =
      "otp_" + Math.random().toString(36).substring(2) + Date.now();

    // Log OTP to console (for development)
    console.log("\n" + "=".repeat(50));
    console.log(`🔐 OTP VERIFICATION CODE`);
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔢 Code: ${otpCode}`);
    console.log(`⏱️  Expires in: 5 minutes`);
    console.log("=".repeat(50) + "\n");

    // Also show an alert in the terminal for easy visibility
    console.log(`\x1b[32m%s\x1b[0m`, `✅ OTP for ${phoneNumber}: ${otpCode}`);

    // In a real app, you would send an SMS here
    // For development, we'll just log it

    res.json({
      success: true,
      tempToken: tempToken,
      expiresIn: 300,
      method: method || "sms",
    });
  } catch (error) {
    console.error("OTP request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  console.log("🔐 OTP verification attempt:", req.body);

  try {
    const { phoneNumber, otpCode, tempToken } = req.body;

    // Clean phone number
    let cleanPhone = phoneNumber.replace(/[\s\.\-]/g, "");
    if (cleanPhone.startsWith("63")) {
      cleanPhone = "0" + cleanPhone.slice(2);
    } else if (cleanPhone.startsWith("9") && cleanPhone.length === 10) {
      cleanPhone = "0" + cleanPhone;
    }
    if (!cleanPhone.startsWith("09")) {
      cleanPhone = "09" + cleanPhone.slice(-9);
    }

    const storedData = otpStore.get(cleanPhone);

    if (!storedData) {
      console.log("❌ No OTP found for:", cleanPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    if (storedData.expiresAt < Date.now()) {
      console.log("❌ OTP expired for:", cleanPhone);
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (storedData.attempts >= 5) {
      console.log("❌ Too many attempts for:", cleanPhone);
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    if (storedData.code === otpCode) {
      console.log("✅ OTP verified successfully for:", cleanPhone);
      otpStore.delete(cleanPhone);
      return res.json({
        success: true,
        verified: true,
        message: "OTP verified successfully",
      });
    } else {
      storedData.attempts += 1;
      otpStore.set(cleanPhone, storedData);
      console.log(
        `❌ Invalid OTP for ${cleanPhone}. Attempts: ${storedData.attempts}/5`,
      );
      return res.status(400).json({
        success: false,
        verified: false,
        message: `Invalid verification code. ${5 - storedData.attempts} attempts remaining.`,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

// Debug endpoint to check all visitors (admin only)
app.get("/api/admin/debug-visitors", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const visitors = await Visitor.find({}).sort({ registeredAt: -1 });

    console.log("\n📋 ALL VISITORS IN DATABASE:");
    console.log("=".repeat(60));
    visitors.forEach((v) => {
      console.log(`   ${v.fullName} (${v.email}):`);
      console.log(`      _id: ${v._id}`);
      console.log(`      status: ${v.status}`);
      console.log(`      approvalStatus: ${v.approvalStatus}`);
      console.log(`      visitDate: ${v.visitDate}`);
      console.log(`      registeredAt: ${v.registeredAt}`);
      console.log("   ---");
    });
    console.log(`Total: ${visitors.length} visitors`);
    console.log("=".repeat(60) + "\n");

    res.json({
      success: true,
      total: visitors.length,
      visitors: visitors.map((v) => ({
        id: v._id,
        name: v.fullName,
        email: v.email,
        status: v.status,
        approvalStatus: v.approvalStatus,
        visitDate: v.visitDate,
        registeredAt: v.registeredAt,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: "Failed" });
  }
});

app.get("/api/auth/debug-otp/:phone", async (req, res) => {
  const { phone } = req.params;
  const storedData = otpStore.get(phone);
  if (storedData) {
    res.json({
      phone,
      otp: storedData.code,
      expiresAt: new Date(storedData.expiresAt),
      attempts: storedData.attempts,
    });
  } else {
    res.json({ phone, otp: null, message: "No OTP found for this number" });
  }
});

// ============ EMAIL ROUTES ============

// Send approval email
app.post("/api/emails/send-approval", authMiddleware, async (req, res) => {
  try {
    const { to, visitorName, password, visitDate, visitTime, purpose } =
      req.body;

    sendEmail(
      to,
      "Visitor Registration Approved - Sapphire Aviation",
      `Dear ${visitorName},\n\nYour visitor registration has been approved!\n\nLogin Credentials:\nEmail: ${to}\nPassword: ${password}\n\nVisit Details:\nPurpose: ${purpose}\nDate: ${new Date(visitDate).toLocaleDateString()}\nTime: ${new Date(visitTime).toLocaleTimeString()}\n\nPlease keep these credentials safe.\n\nThank you,\nSapphire Aviation Security Team`,
    );

    res.json({
      success: true,
      message: "Approval email sent",
    });
  } catch (error) {
    console.error("Send approval email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Send rejection email
app.post("/api/emails/send-rejection", authMiddleware, async (req, res) => {
  try {
    const { to, visitorName, reason } = req.body;

    sendEmail(
      to,
      "Visitor Registration Update - Sapphire Aviation",
      `Dear ${visitorName},\n\nWe regret to inform you that your visitor registration has been rejected.\n\nReason: ${reason || "No specific reason provided"}\n\nIf you have any questions, please contact us.\n\nThank you,\nSapphire Aviation Security Team`,
    );

    res.json({
      success: true,
      message: "Rejection email sent",
    });
  } catch (error) {
    console.error("Send rejection email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// ============ EXISTING ROUTES (Keep all your existing routes) ============

// 6. CREATE ACCESS LOG (Protected)
app.post("/api/access-log", authMiddleware, async (req, res) => {
  try {
    const { location, accessType, status, notes } = req.body;

    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: location || "Unknown Location",
      accessType: accessType || "entry",
      status: status || "pending",
      nfcCardId: req.user.nfcCardId,
      notes: notes || "",
    });

    await accessLog.save();

    res.status(201).json({
      success: true,
      message: "Access log created",
      accessLog,
    });
  } catch (error) {
    console.error("❌ Create access log error:", error);
    res.status(500).json({ error: "Failed to create access log" });
  }
});

// 7. GET USER ACCESS LOGS (Protected)
app.get("/api/access-logs", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const accessLogs = await AccessLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AccessLog.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      accessLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get access logs error:", error);
    res.status(500).json({ error: "Failed to fetch access logs" });
  }
});

// 8. NFC SCAN SIMULATION (Protected)
app.post("/api/nfc-scan", authMiddleware, async (req, res) => {
  try {
    const { location, accessType } = req.body;

    // Simulate access control logic
    const status = Math.random() > 0.1 ? "granted" : "denied";

    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: location || "Unknown Location",
      accessType: accessType || "entry",
      status,
      nfcCardId: req.user.nfcCardId,
      notes:
        status === "granted"
          ? "Access granted successfully"
          : "Access denied - Unauthorized",
    });

    await accessLog.save();

    res.json({
      success: true,
      message: status === "granted" ? "Access Granted" : "Access Denied",
      status,
      accessLog,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ NFC scan error:", error);
    res.status(500).json({ error: "NFC scan failed" });
  }
});

// 9. LOGOUT (Protected)
app.post("/api/logout", authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// 10. HEALTH CHECK (Updated)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    success: true,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date(),
    endpoints: {
      auth: {
        register: "POST /api/register",
        login: "POST /api/login",
        profile: "GET /api/profile",
        logout: "POST /api/logout",
      },
      visitors: {
        register: "POST /api/visitors/register",
        profile: "GET /api/visitor/profile",
        getByUser: "GET /api/visitors/user/:userId",
        updateVisit: "PUT /api/visitors/:userId/visit",
        stats: "GET /api/visitors/stats",
        checkin: "PUT /api/visitors/:id/self-checkin",
        checkout: "PUT /api/visitors/:id/self-checkout",
      },
      admin: {
        pendingVisitors: "GET /api/admin/visitors/pending",
        approveVisitor: "PUT /api/admin/visitors/:id/approve",
        rejectVisitor: "PUT /api/admin/visitors/:id/reject",
        allVisitors: "GET /api/admin/visitors",
        stats: "GET /api/admin/stats",
        users: "GET /api/admin/users",
      },
      security: {
        notifications: "GET /api/notifications",
        markRead: "PUT /api/notifications/:id/read",
        checkin: "PUT /api/visitors/:id/checkin",
        checkout: "PUT /api/visitors/:id/checkout",
      },
      access: {
        logs: "GET /api/access-logs",
        nfcScan: "POST /api/nfc-scan",
        create: "POST /api/access-log",
      },
    },
  });
});

// 11. GET STATS (Protected)
app.get("/api/stats", authMiddleware, async (req, res) => {
  try {
    const totalAccess = await AccessLog.countDocuments({
      userId: req.user._id,
    });
    const grantedAccess = await AccessLog.countDocuments({
      userId: req.user._id,
      status: "granted",
    });
    const deniedAccess = await AccessLog.countDocuments({
      userId: req.user._id,
      status: "denied",
    });

    res.json({
      success: true,
      totalAccess,
      grantedAccess,
      deniedAccess,
      successRate:
        totalAccess > 0
          ? ((grantedAccess / totalAccess) * 100).toFixed(1) + "%"
          : "0%",
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

// 12. DEMO USER CREATION (For testing)
app.post("/api/create-demo-user", async (req, res) => {
  try {
    const demoUser = new User({
      firstName: "Demo",
      lastName: "User",
      email: "demo@student.sapphire.edu",
      password: "password123",
      phone: "12345678901",
      role: "student",
      studentId: "20240001",
      course: "Bachelor of Science in Aviation",
      yearLevel: "1st Year",
      emergencyContact: "John Doe - 09876543210",
      nfcCardId: "SAFEPASS-DEMO-001",
    });

    await demoUser.save();

    res.json({
      success: true,
      message: "Demo user created",
      user: {
        email: demoUser.email,
        password: "password123",
      },
    });
  } catch (error) {
    console.error("❌ Demo user creation error:", error);
    res.status(500).json({ error: "Failed to create demo user" });
  }
});

// ============ EXISTING VISITOR ROUTES ============

// Get all visitors (for security dashboard)
app.get("/api/visitors", authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const visitors = await Visitor.find(query)
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("checkedInBy", "firstName lastName")
      .populate("checkedOutBy", "firstName lastName");

    const total = await Visitor.countDocuments(query);

    res.json({
      success: true,
      visitors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Get visitors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitors",
    });
  }
});

// Get single visitor by ID
app.get("/api/visitors/:id", authMiddleware, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("checkedInBy", "firstName lastName")
      .populate("checkedOutBy", "firstName lastName");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    res.json({
      success: true,
      visitor,
    });
  } catch (error) {
    console.error("Get visitor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitor",
    });
  }
});

// Update visitor (admin/security)
app.put("/api/visitors/:id", authMiddleware, async (req, res) => {
  try {
    if (!["admin", "security", "guard"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;
    delete updates.registeredAt;

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    res.json({ success: true, message: "Visitor updated successfully", visitor });
  } catch (error) {
    console.error("Update visitor error:", error);
    res.status(500).json({ success: false, message: "Failed to update visitor" });
  }
});

// Delete visitor (admin only)
app.delete("/api/visitors/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    await Visitor.findByIdAndDelete(req.params.id);

    if (visitor.email) {
      await User.deleteOne({ email: visitor.email.toLowerCase().trim(), role: "visitor" });
    }

    res.json({ success: true, message: "Visitor deleted successfully" });
  } catch (error) {
    console.error("Delete visitor error:", error);
    res.status(500).json({ success: false, message: "Failed to delete visitor" });
  }
});

// Visitor self check-in
app.put("/api/visitors/:id/self-checkin", authMiddleware, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    const checkInSource = String(req.body?.source || "mobile_app")
      .trim()
      .toLowerCase();
    const sourceLabel =
      checkInSource === "virtual_nfc_card" ? "virtual NFC card" : "mobile app";

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (!visitor.hasApprovedVisitWindow()) {
      return res.status(400).json({
        success: false,
        message: "Your visit is still waiting for approval.",
      });
    }

    if (visitor.status === "checked_in") {
      return res.status(400).json({
        success: false,
        message: "You are already checked in for this visit.",
      });
    }

    if (visitor.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "This visit has already been completed.",
      });
    }

    visitor.markCheckedIn(req.user._id);
    await visitor.save();

    // Create access log
    const accessLog = new AccessLog({
      userEmail: visitor.email,
      userName: visitor.fullName,
      location: checkInSource === "virtual_nfc_card" ? "Virtual NFC Card" : "Mobile App",
      accessType: "entry",
      activityType: "visitor_self_checkin",
      status: "granted",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      actorRole: req.user.role,
      metadata: {
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        source: checkInSource,
      },
      notes: `Visitor self check-in via ${sourceLabel}`,
    });
    await accessLog.save();

    await createRoleNotification({
      title: "Visitor Checked In",
      message: `${visitor.fullName} checked in using the ${sourceLabel}.`,
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      type: "info",
      severity: "low",
      metadata: {
        activityType: "visitor_self_checkin",
        source: checkInSource,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    await createRoleNotification({
      title: "Visitor Checked In",
      message: `${visitor.fullName} checked in using the ${sourceLabel}.`,
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      type: "info",
      severity: "low",
      metadata: {
        activityType: "visitor_self_checkin",
        source: checkInSource,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    res.json({
      success: true,
      message: "Checked in successfully",
      visitor,
    });
  } catch (error) {
    console.error("Self check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in",
    });
  }
});

// Visitor self check-out
app.put("/api/visitors/:id/self-checkout", authMiddleware, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    const checkOutSource = String(req.body?.source || "mobile_app")
      .trim()
      .toLowerCase();
    const sourceLabel =
      checkOutSource === "visitor_dashboard" ? "visitor dashboard" : "mobile app";

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "This visit has already been checked out.",
      });
    }

    if (visitor.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: "You must be checked in before you can check out.",
      });
    }

    visitor.markCheckedOut(req.user._id);
    await visitor.save();

    // Create access log
    const accessLog = new AccessLog({
      userEmail: visitor.email,
      userName: visitor.fullName,
      location: checkOutSource === "visitor_dashboard" ? "Visitor Dashboard" : "Mobile App",
      accessType: "exit",
      activityType: "visitor_self_checkout",
      status: "granted",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      actorRole: req.user.role,
      metadata: {
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        source: checkOutSource,
      },
      notes: `Visitor self check-out via ${sourceLabel}`,
    });
    await accessLog.save();

    await createRoleNotification({
      title: "Visitor Checked Out",
      message: `${visitor.fullName} checked out using the ${sourceLabel}.`,
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      type: "info",
      severity: "low",
      metadata: {
        activityType: "visitor_self_checkout",
        source: checkOutSource,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    await createRoleNotification({
      title: "Visitor Checked Out",
      message: `${visitor.fullName} checked out using the ${sourceLabel}.`,
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      type: "info",
      severity: "low",
      metadata: {
        activityType: "visitor_self_checkout",
        source: checkOutSource,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    res.json({
      success: true,
      message: "Checked out successfully",
      visitor,
    });
  } catch (error) {
    console.error("Self check-out error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check out",
    });
  }
});

// Get visitor access logs
app.get("/api/visitors/:id/logs", authMiddleware, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    const logs = await AccessLog.find({
      $or: [{ userEmail: visitor.email }, { userName: visitor.fullName }],
    })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Get visitor logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get logs",
    });
  }
});

// Visitor appointment request / reappointment
app.put("/api/visitors/:userId/visit", authMiddleware, async (req, res) => {
  try {
    const requestedUserId =
      req.user.role === "visitor" ? req.user._id : req.params.userId;
    const {
      visitDate,
      preferredDate,
      visitTime,
      preferredTime,
      purposeOfVisit,
      purposeCategory,
      customPurposeOfVisit,
      department,
      officeToVisit,
      assignedOffice,
      appointmentDepartment,
    } = req.body || {};

    const finalVisitDate = visitDate || preferredDate;
    const finalVisitTime = visitTime || preferredTime;
    const normalizedPurposeCategory = String(purposeCategory || "").trim();
    const normalizedCustomPurpose = String(customPurposeOfVisit || "").trim();
    const requestedDepartment = String(
      appointmentDepartment || department || officeToVisit || assignedOffice || "",
    ).trim();
    const resolvedPurpose =
      normalizedPurposeCategory === "Other" && normalizedCustomPurpose
        ? normalizedCustomPurpose
        : String(purposeOfVisit || normalizedPurposeCategory || "").trim();

    if (!finalVisitDate || !finalVisitTime || !resolvedPurpose) {
      return res.status(400).json({
        success: false,
        message: "Preferred date, preferred time, and purpose of visit are required.",
      });
    }

    if (normalizedPurposeCategory === "Other" && !normalizedCustomPurpose) {
      return res.status(400).json({
        success: false,
        message: "Please enter your custom purpose of visit.",
      });
    }

    if (!requestedDepartment) {
      return res.status(400).json({
        success: false,
        message: "Office or department is required for this appointment.",
      });
    }

    const routedStaff = await User.findOne({
      role: "staff",
      isActive: true,
      status: "active",
      department: getStaffDepartmentQuery(requestedDepartment),
    }).sort({ lastLogin: -1, createdAt: 1 });

    if (!routedStaff) {
      return res.status(400).json({
        success: false,
        message: `No active staff account is assigned to ${requestedDepartment}. Please choose another office or contact admin.`,
      });
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(user.role).toLowerCase() !== "visitor") {
      return res.status(400).json({
        success: false,
        message: "Only visitor accounts can create appointment requests.",
      });
    }

    if (String(user.status).toLowerCase() !== "active") {
      return res.status(400).json({
        success: false,
        message: "Your visitor account must be active before requesting another appointment.",
      });
    }

    let visitor = null;
    if (user.visitorId) {
      visitor = await Visitor.findById(user.visitorId);
    }

    if (!visitor) {
      visitor = await Visitor.findOne({ email: user.email }).sort({ registeredAt: -1 });
    }

    const visitorFullName = `${user.firstName} ${user.lastName}`.trim();

    if (!visitor) {
      visitor = new Visitor({
        fullName: visitorFullName,
        email: user.email,
        phoneNumber: user.phone,
        idNumber: user.employeeId || `VIS-${Date.now().toString().slice(-6)}`,
      });
      visitor.queueAppointmentRequest({
        purposeOfVisit: resolvedPurpose,
        purposeCategory: normalizedPurposeCategory || undefined,
        customPurposeOfVisit: normalizedCustomPurpose || undefined,
        visitDate: new Date(finalVisitDate),
        visitTime: new Date(finalVisitTime),
        department: formatDepartmentLabel(requestedDepartment),
        assignedStaff: routedStaff._id,
        assignedStaffName: getFullName(routedStaff),
      });
      await visitor.save();
      user.visitorId = visitor._id;
      await user.save();
    } else {
      visitor.fullName = visitor.fullName || visitorFullName;
      visitor.phoneNumber = user.phone || visitor.phoneNumber;
      visitor.queueAppointmentRequest({
        purposeOfVisit: resolvedPurpose,
        purposeCategory: normalizedPurposeCategory || undefined,
        customPurposeOfVisit: normalizedCustomPurpose || undefined,
        visitDate: new Date(finalVisitDate),
        visitTime: new Date(finalVisitTime),
        department: formatDepartmentLabel(requestedDepartment),
        assignedStaff: routedStaff._id,
        assignedStaffName: getFullName(routedStaff),
      });
      await visitor.save();
    }

    await createRoleNotification({
      title: "New Department Appointment Request",
      message: `${visitor.fullName} requested ${visitor.appointmentDepartment || visitor.assignedOffice} on ${new Date(visitor.visitDate).toLocaleDateString()} at ${new Date(visitor.visitTime).toLocaleTimeString()}. Purpose: ${visitor.purposeOfVisit}`,
      type: "visitor",
      severity: "medium",
      targetRole: "staff",
      targetUser: routedStaff._id,
      relatedVisitor: visitor._id,
      relatedUser: user._id,
      metadata: {
        activityType: "visitor_appointment_request",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
        purposeCategory: visitor.purposeCategory,
        customPurposeOfVisit: visitor.customPurposeOfVisit,
        department: visitor.appointmentDepartment || visitor.assignedOffice,
      },
    });

    await createRoleNotification({
      title: "Visitor Appointment Requested",
      message: `${visitor.fullName} submitted a new appointment request for ${visitor.appointmentDepartment || visitor.assignedOffice}.`,
      type: "info",
      severity: "medium",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: user._id,
      metadata: {
        activityType: "visitor_appointment_request",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
        department: visitor.appointmentDepartment || visitor.assignedOffice,
        assignedStaff: routedStaff._id,
      },
    });

    await createSystemActivity({
      actorUser: user,
      relatedVisitor: visitor,
      relatedUser: user,
      activityType: "visitor_appointment_request",
      status: "pending",
      location: visitor.appointmentDepartment || visitor.assignedOffice || "Appointment Request",
      notes: `${visitor.fullName} requested a new appointment for ${visitor.appointmentDepartment || visitor.assignedOffice}.`,
      metadata: {
        requestCategory: "appointment",
        approvalFlow: "staff",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
        department: visitor.appointmentDepartment || visitor.assignedOffice,
        assignedStaff: routedStaff._id,
      },
    });

    res.json({
      success: true,
      message: "Appointment request submitted successfully",
      visitor,
    });
  } catch (error) {
    console.error("Update visitor visit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule visit",
    });
  }
});

app.get("/api/staff/appointments", authMiddleware, async (req, res) => {
  try {
    const normalizedRole = String(req.user.role).toLowerCase();
    if (!["staff", "admin"].includes(normalizedRole)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status = "all", limit = 100 } = req.query;
    const query = {
      requestCategory: "appointment",
      approvalFlow: "staff",
    };

    if (normalizedRole === "staff") {
      const staffDepartmentQuery = getStaffDepartmentQuery(req.user.department);
      query.$or = [
        { assignedStaff: req.user._id },
        { appointmentDepartment: staffDepartmentQuery },
        { assignedOffice: staffDepartmentQuery },
      ];
    }

    if (status === "pending") {
      query.appointmentStatus = "pending";
    } else if (status === "approved") {
      query.appointmentStatus = { $in: ["approved", "adjusted"] };
    } else if (status === "rejected") {
      query.appointmentStatus = "rejected";
    } else if (status === "completed") {
      query.status = "checked_out";
    }

    const appointments = await Visitor.find(query)
      .sort({ appointmentRequestedAt: -1, visitDate: 1 })
      .limit(parseInt(limit, 10))
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get staff appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff appointments",
    });
  }
});

app.put("/api/staff/appointments/:id/approve", authMiddleware, async (req, res) => {
  try {
    if (!["staff", "admin"].includes(String(req.user.role).toLowerCase())) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (visitor.requestCategory !== "appointment" || visitor.approvalFlow !== "staff") {
      return res.status(400).json({
        success: false,
        message: "Only staff appointment requests can be approved here.",
      });
    }

    if (!isStaffAllowedForAppointment(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only approve appointments assigned to your department.",
      });
    }

    if ((visitor.appointmentStatus || "pending") !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be approved.",
      });
    }

    visitor.approveAppointment(req.user, req.body?.note || "");
    await visitor.save();

    const visitorUser = await User.findOne({ email: visitor.email });
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");

    await createRoleNotification({
      title: "Appointment Approved",
      message: `${visitor.fullName}'s appointment was approved by ${getFullName(req.user)}.`,
      type: "success",
      severity: "low",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_approved_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    if (visitorUser) {
      await createRoleNotification({
        title: "Your Appointment Is Approved",
        message: `Your visit on ${new Date(visitor.visitDate).toLocaleDateString()} at ${new Date(visitor.visitTime).toLocaleTimeString()} has been approved.`,
        type: "success",
        severity: "low",
        targetRole: "visitor",
        targetUser: visitorUser._id,
        relatedVisitor: visitor._id,
        relatedUser: visitorUser._id,
        metadata: {
          activityType: "staff_approved_appointment",
        },
      });
    }

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: visitorUser,
      activityType: "staff_approved_appointment",
      status: "granted",
      location: visitor.assignedOffice || visitor.host || req.user.department || "Staff Office",
      notes: `${getFullName(req.user)} approved ${visitor.fullName}'s appointment.`,
      metadata: {
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
      },
    });

    res.json({
      success: true,
      message: "Appointment approved successfully",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Staff approve appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve appointment",
    });
  }
});

app.put("/api/staff/appointments/:id/adjust", authMiddleware, async (req, res) => {
  try {
    if (!["staff", "admin"].includes(String(req.user.role).toLowerCase())) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { visitDate, preferredDate, visitTime, preferredTime, note } = req.body || {};
    const finalVisitDate = visitDate || preferredDate;
    const finalVisitTime = visitTime || preferredTime;

    if (!finalVisitTime) {
      return res.status(400).json({
        success: false,
        message: "An adjusted preferred time is required.",
      });
    }

    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (visitor.requestCategory !== "appointment" || visitor.approvalFlow !== "staff") {
      return res.status(400).json({
        success: false,
        message: "Only staff appointment requests can be adjusted here.",
      });
    }

    if (!isStaffAllowedForAppointment(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only adjust appointments assigned to your department.",
      });
    }

    if ((visitor.appointmentStatus || "pending") !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be adjusted.",
      });
    }

    visitor.adjustAppointment(req.user, {
      visitDate: finalVisitDate ? new Date(finalVisitDate) : null,
      visitTime: new Date(finalVisitTime),
      note,
    });
    await visitor.save();

    const visitorUser = await User.findOne({ email: visitor.email });
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");

    await createRoleNotification({
      title: "Appointment Time Adjusted",
      message: `${getFullName(req.user)} adjusted ${visitor.fullName}'s appointment to ${new Date(visitor.visitTime).toLocaleTimeString()}.`,
      type: "warning",
      severity: "medium",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_adjusted_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        note: visitor.staffAdjustmentNote,
      },
    });

    if (visitorUser) {
      await createRoleNotification({
        title: "Appointment Time Updated",
        message: `Your appointment was adjusted to ${new Date(visitor.visitDate).toLocaleDateString()} at ${new Date(visitor.visitTime).toLocaleTimeString()}.`,
        type: "warning",
        severity: "medium",
        targetRole: "visitor",
        targetUser: visitorUser._id,
        relatedVisitor: visitor._id,
        relatedUser: visitorUser._id,
        metadata: {
          activityType: "staff_adjusted_appointment",
          note: visitor.staffAdjustmentNote,
        },
      });
    }

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: visitorUser,
      activityType: "staff_adjusted_appointment",
      status: "granted",
      location: visitor.assignedOffice || visitor.host || req.user.department || "Staff Office",
      notes: `${getFullName(req.user)} adjusted ${visitor.fullName}'s appointment.`,
      metadata: {
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purposeOfVisit: visitor.purposeOfVisit,
        note: visitor.staffAdjustmentNote,
      },
    });

    res.json({
      success: true,
      message: "Appointment adjusted successfully",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Staff adjust appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to adjust appointment",
    });
  }
});

app.put("/api/staff/appointments/:id/reject", authMiddleware, async (req, res) => {
  try {
    if (!["staff", "admin"].includes(String(req.user.role).toLowerCase())) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (visitor.requestCategory !== "appointment" || visitor.approvalFlow !== "staff") {
      return res.status(400).json({
        success: false,
        message: "Only staff appointment requests can be rejected here.",
      });
    }

    if (!isStaffAllowedForAppointment(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only reject appointments assigned to your department.",
      });
    }

    if ((visitor.appointmentStatus || "pending") !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be rejected.",
      });
    }

    const rejectionReason = String(
      req.body?.reason || "Appointment request declined by staff.",
    ).trim();

    visitor.rejectAppointment(req.user, rejectionReason);
    await visitor.save();

    const visitorUser = await User.findOne({ email: visitor.email });
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");

    if (visitorUser) {
      await createRoleNotification({
        title: "Appointment Request Declined",
        message: `Your appointment request was declined. Reason: ${rejectionReason}`,
        type: "alert",
        severity: "medium",
        targetRole: "visitor",
        targetUser: visitorUser._id,
        relatedVisitor: visitor._id,
        relatedUser: visitorUser._id,
        metadata: {
          activityType: "staff_rejected_appointment",
          reason: rejectionReason,
        },
      });
    }

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: visitorUser,
      activityType: "staff_rejected_appointment",
      status: "denied",
      location: visitor.assignedOffice || visitor.host || req.user.department || "Staff Office",
      notes: `${getFullName(req.user)} rejected ${visitor.fullName}'s appointment.`,
      metadata: {
        reason: rejectionReason,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    res.json({
      success: true,
      message: "Appointment rejected successfully",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Staff reject appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject appointment",
    });
  }
});

// Check-in visitor (by security)
app.put("/api/visitors/:id/checkin", authMiddleware, async (req, res) => {
  try {
    if (!["admin", "security", "guard", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (!visitor.hasApprovedVisitWindow()) {
      return res.status(400).json({
        success: false,
        message: "Visitor is still waiting for admin approval",
      });
    }

    if (visitor.status === "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Visitor is already checked in",
      });
    }

    if (visitor.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "Visitor has already checked out",
      });
    }

    visitor.markCheckedIn(req.user._id);
    await visitor.save();

    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: visitor.email,
      userName: visitor.fullName,
      actorRole: req.user.role,
      location: visitor.assignedOffice || visitor.host || "Campus Entry",
      accessType: "entry",
      activityType: "security_checkin",
      status: "granted",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      notes: `Checked in by ${req.user.firstName} ${req.user.lastName}`,
    });
    await accessLog.save();

    const notification = new Notification({
      title: "Visitor Checked In",
      message: `${visitor.fullName} has checked in`,
      type: "info",
      severity: "low",
      targetRole: "security",
      relatedVisitor: visitor._id,
    });
    await notification.save();

    res.json({
      success: true,
      message: "Visitor checked in successfully",
      visitor,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in visitor",
    });
  }
});

// Check-out visitor (by security)
app.put("/api/visitors/:id/checkout", authMiddleware, async (req, res) => {
  try {
    if (!["admin", "security", "guard", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (!visitor.hasApprovedVisitWindow()) {
      return res.status(400).json({
        success: false,
        message: "Visitor is not approved for checkout flow",
      });
    }

    if (visitor.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Visitor must be checked in before checkout",
      });
    }

    visitor.markCheckedOut(req.user._id);
    await visitor.save();

    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: visitor.email,
      userName: visitor.fullName,
      actorRole: req.user.role,
      location: visitor.assignedOffice || visitor.host || "Campus Exit",
      accessType: "exit",
      activityType: "security_checkout",
      status: "granted",
      relatedVisitor: visitor._id,
      relatedUser: req.user._id,
      notes: `Checked out by ${req.user.firstName} ${req.user.lastName}`,
    });
    await accessLog.save();

    const notification = new Notification({
      title: "Visitor Checked Out",
      message: `${visitor.fullName} has checked out`,
      type: "info",
      severity: "low",
      targetRole: "security",
      relatedVisitor: visitor._id,
    });
    await notification.save();

    res.json({
      success: true,
      message: "Visitor checked out successfully",
      visitor,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check out visitor",
    });
  }
});

// Report visitor
app.post("/api/visitors/:id/report", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    visitor.reports.push({
      reason,
      reportedBy: req.user._id,
      reportedAt: new Date(),
    });

    await visitor.save();

    // High severity notification for reports
    const notification = new Notification({
      title: "⚠️ Visitor Reported",
      message: `${visitor.fullName} reported: ${reason}`,
      type: "alert",
      severity: "high",
      targetRole: "security",
      relatedVisitor: visitor._id,
    });
    await notification.save();

    res.json({
      success: true,
      message: "Visitor reported successfully",
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report visitor",
    });
  }
});

// Get notifications (for security dashboard)
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;
    const targetRoles = getNotificationTargetRoles(req.user.role);

    let query = {
      targetRole: { $in: targetRoles },
      $or: [{ targetUser: null }, { targetUser: req.user._id }],
    };

    if (read === "false") {
      query["readBy.user"] = { $ne: req.user._id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("relatedVisitor", "fullName")
      .populate("relatedUser", "firstName lastName");

    const unreadCount = await Notification.countDocuments({
      ...query,
      "readBy.user": { $ne: req.user._id },
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Add user to readBy if not already there
    if (!notification.readBy.some((r) => r.user.equals(req.user._id))) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date(),
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
});

// Mark all notifications as read
app.put("/api/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    const targetRoles = getNotificationTargetRoles(req.user.role);
    await Notification.updateMany(
      {
        targetRole: { $in: targetRoles },
        $or: [{ targetUser: null }, { targetUser: req.user._id }],
        "readBy.user": { $ne: req.user._id },
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date(),
          },
        },
      },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
    });
  }
});

// Get visitor stats for dashboard
app.get("/api/visitors/stats", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total: await Visitor.countDocuments(),
      pending: await Visitor.countDocuments({ approvalStatus: "pending" }),
      approved: await Visitor.countDocuments({ approvalStatus: "approved" }),
      rejected: await Visitor.countDocuments({ approvalStatus: "rejected" }),
      checkedIn: await Visitor.countDocuments({ status: "checked_in" }),
      checkedOut: await Visitor.countDocuments({ status: "checked_out" }),
      todayExpected: await Visitor.countDocuments({
        visitDate: { $gte: today, $lt: tomorrow },
        approvalStatus: "approved",
      }),
      pendingApprovals: await Visitor.countDocuments({
        approvalStatus: "pending",
      }),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get visitor stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get visitor stats",
    });
  }
});

// Get visitor profile for logged-in visitor
app.get("/api/visitor-profile", authMiddleware, async (req, res) => {
  try {
    // If user is a visitor, get their visitor record
    if (req.user.role === "visitor") {
      let visitor = null;

      // Try to find by visitorId first
      if (req.user.visitorId) {
        visitor = await Visitor.findById(req.user.visitorId);
      }

      // If not found, try by email
      if (!visitor) {
        visitor = await Visitor.findOne({ email: req.user.email });
      }

      if (visitor) {
        return res.json({
          success: true,
          visitor,
        });
      }
    }

    res.status(404).json({
      success: false,
      message: "Visitor profile not found",
    });
  } catch (error) {
    console.error("Get visitor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get visitor profile",
    });
  }
});

// Get visitor by user ID
app.get("/api/visitors/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let visitor = null;

    if (user.visitorId) {
      visitor = await Visitor.findById(user.visitorId);
    }

    if (!visitor) {
      visitor = await Visitor.findOne({ email: user.email });
    }

    res.json({
      success: true,
      visitor: visitor || null,
    });
  } catch (error) {
    console.error("Get visitor by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get visitor",
    });
  }
});

// ============ ADMIN ROUTES (Existing) ============

app.get("/api/admin/activities", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const limit = Math.min(parseInt(req.query.limit || "60", 10), 200);
    const activities = await AccessLog.find({
      $or: [
        { accessType: "system" },
        { accessType: "entry" },
        { accessType: "exit" },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("relatedVisitor", "fullName email visitDate visitTime purposeOfVisit assignedOffice host status appointmentStatus approvalStatus")
      .populate("relatedUser", "firstName lastName email role department");

    const summary = {
      registrationRequests: activities.filter((item) => item.activityType === "visitor_registration_request").length,
      appointmentRequests: activities.filter((item) => item.activityType === "visitor_appointment_request").length,
      staffActions: activities.filter((item) =>
        ["staff_approved_appointment", "staff_adjusted_appointment", "staff_rejected_appointment"].includes(item.activityType),
      ).length,
      completedVisits: activities.filter((item) =>
        item.activityType === "security_checkout" || item.activityType === "visitor_self_checkout",
      ).length,
      approvals: activities.filter((item) =>
        item.activityType === "admin_approved_registration" || item.activityType === "staff_approved_appointment",
      ).length,
    };

    res.json({
      success: true,
      activities,
      summary,
    });
  } catch (error) {
    console.error("Get admin activities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin activities",
    });
  }
});

// Get admin statistics
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const pendingRegistrationRequestsQuery = {
      requestCategory: "registration",
      approvalFlow: "admin",
      approvalStatus: "pending",
    };
    const pendingAppointmentRequestsQuery = {
      requestCategory: "appointment",
      approvalFlow: "staff",
      appointmentStatus: "pending",
    };
    const approvedVisitWindowsQuery = {
      approvalStatus: "approved",
      $or: [
        { requestCategory: "registration" },
        {
          requestCategory: "appointment",
          appointmentStatus: { $in: ["approved", "adjusted"] },
        },
      ],
    };

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAccess = await AccessLog.countDocuments({
      timestamp: { $gte: today },
    });

    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalSecurity = await User.countDocuments({ 
      role: { $in: ["guard", "security"] } 
    });
    const totalVisitors = await Visitor.countDocuments();
    const pendingRegistrationRequests = await Visitor.countDocuments(
      pendingRegistrationRequestsQuery,
    );
    const pendingAppointmentRequests = await Visitor.countDocuments(
      pendingAppointmentRequestsQuery,
    );
    const pendingApprovals =
      pendingRegistrationRequests + pendingAppointmentRequests;
    const approvedVisits = await Visitor.countDocuments(approvedVisitWindowsQuery);
    const checkedInVisitors = await Visitor.countDocuments({ status: "checked_in" });
    const completedVisits = await Visitor.countDocuments({ status: "checked_out" });

    const totalAccess = await AccessLog.countDocuments();
    const grantedAccess = await AccessLog.countDocuments({ status: "granted" });
    const successRate =
      totalAccess > 0
        ? ((grantedAccess / totalAccess) * 100).toFixed(1) + "%"
        : "0%";

    const pendingIssues =
      pendingApprovals +
      (await AccessLog.countDocuments({
        status: "denied",
        timestamp: { $gte: today },
      }));

    console.log(`📊 Stats - Staff: ${totalStaff}, Security/Guard: ${totalSecurity}`);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        todayAccess,
        pendingIssues,
        totalAdmins,
        totalStaff,
        totalSecurity,
        totalVisitors,
        successRate,
        pendingApprovals,
        pendingRegistrationRequests,
        pendingAppointmentRequests,
        approvedVisits,
        checkedInVisitors,
        completedVisits,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ success: false, message: "Failed to get stats" });
  }
});

// Get all users with filters
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { role, status, page = 1, limit = 50 } = req.query;
    let query = {};

    // Fix: Handle role filtering correctly
    if (role && role !== "all") {
      query.role = role;
    }
    // If no role specified, return ALL users (including guard and security)
    // No need to add extra filters

    if (status) {
      if (status === "active") query.status = "active";
      else if (status === "inactive") query.status = "inactive";
      else if (status === "pending") query.status = "pending";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Debug log to see what's being returned
    console.log(`\n📊 ADMIN USERS API - Role filter: ${role || "all"}`);
    console.log(`Found ${users.length} users`);
    console.log(`User roles:`, [...new Set(users.map(u => u.role))]);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Failed to get users" });
  }
});

// Get user by ID
app.get("/api/admin/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to get user" });
  }
});

// Update user
app.put("/api/admin/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updates = { ...req.body };
    delete updates.password; // Don't allow password update through this route
    delete updates._id;
    delete updates.__v;

    if (updates.username !== undefined) {
      const normalizedUsername = normalizeUsernameValue(updates.username);
      if (!normalizedUsername) {
        delete updates.username;
      } else {
        const usernameConflict = await User.findOne({
          username: normalizedUsername,
          _id: { $ne: req.params.id },
        });

        if (usernameConflict) {
          return res.status(400).json({
            success: false,
            message: "Username already registered",
            field: "username",
          });
        }

        updates.username = normalizedUsername;
      }
    }

    if (updates.employeeId !== undefined) {
      const normalizedEmployeeId = String(updates.employeeId || "").trim();
      if (!normalizedEmployeeId) {
        delete updates.employeeId;
      } else {
        const employeeIdConflict = await User.findOne({
          employeeId: normalizedEmployeeId,
          _id: { $ne: req.params.id },
        });

        if (employeeIdConflict) {
          return res.status(400).json({
            success: false,
            message: "Staff ID already registered",
            field: "employeeId",
          });
        }

        updates.employeeId = normalizedEmployeeId;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create access log for the update
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Updated user: ${user.email}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

// Update user role
app.put("/api/admin/users/:id/role", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { role } = req.body;

    if (!["student", "staff", "security", "admin", "visitor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: new Date() },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Updated role for ${user.email} to ${role}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "Role updated successfully", user });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

// Deactivate user
app.put("/api/admin/users/:id/deactivate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive", updatedAt: new Date() },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Deactivated user: ${user.email}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "User deactivated successfully", user });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to deactivate user" });
  }
});

// Activate user
app.put("/api/admin/users/:id/activate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active", updatedAt: new Date() },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Activated user: ${user.email}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "User activated successfully", user });
  } catch (error) {
    console.error("Activate user error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to activate user" });
  }
});

// Delete user
app.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Deleted user: ${user.email}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

// Get all NFC cards
app.get("/api/admin/nfc-cards", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, page = 1, limit = 50 } = req.query;
    let query = {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find({ nfcCardId: { $exists: true, $ne: null } })
      .select("firstName lastName email nfcCardId role status createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const cards = users.map((user) => ({
      id: user._id,
      cardNumber: user.nfcCardId,
      userName: `${user.firstName} ${user.lastName}`,
      status: user.status === "active" ? "active" : "inactive",
      issuedDate: user.createdAt,
      userId: user._id,
    }));

    const total = await User.countDocuments({
      nfcCardId: { $exists: true, $ne: null },
    });

    res.json({
      success: true,
      cards,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get NFC cards error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get NFC cards" });
  }
});

// Issue NFC card
app.post("/api/admin/nfc-cards/issue", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate unique NFC card ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nfcCardId = `SAFEPASS-${timestamp}-${randomString}`;

    user.nfcCardId = nfcCardId;
    await user.save();

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Issued NFC card to ${user.email}: ${nfcCardId}`,
    });
    await accessLog.save();

    res.json({
      success: true,
      message: "NFC card issued successfully",
      card: {
        id: user._id,
        cardNumber: nfcCardId,
        userName: `${user.firstName} ${user.lastName}`,
        status: "active",
        issuedDate: new Date(),
        userId: user._id,
      },
    });
  } catch (error) {
    console.error("Issue NFC card error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to issue NFC card" });
  }
});

// Revoke NFC card
app.put("/api/admin/nfc-cards/:id/revoke", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const oldCardId = user.nfcCardId;
    user.nfcCardId = null;
    await user.save();

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Revoked NFC card from ${user.email}: ${oldCardId}`,
    });
    await accessLog.save();

    res.json({ success: true, message: "NFC card revoked successfully" });
  } catch (error) {
    console.error("Revoke NFC card error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to revoke NFC card" });
  }
});

// Get access reports
app.get("/api/admin/reports/access", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { date, type, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.timestamp = { $gte: targetDate, $lt: nextDay };
    } else if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await AccessLog.find(query).sort({ timestamp: -1 });

    // Calculate statistics
    const totalAccess = logs.length;
    const uniqueUsers = new Set(
      logs.map((log) => log.userId?.toString()).filter((id) => id),
    ).size;
    const grantedAccess = logs.filter((log) => log.status === "granted").length;
    const successRate =
      totalAccess > 0
        ? ((grantedAccess / totalAccess) * 100).toFixed(1) + "%"
        : "0%";

    // Group by location
    const locationCount = {};
    logs.forEach((log) => {
      if (log.location) {
        locationCount[log.location] = (locationCount[log.location] || 0) + 1;
      }
    });

    const byLocation = Object.entries(locationCount)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Find peak hour
    const hourCount = new Array(24).fill(0);
    logs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      hourCount[hour]++;
    });

    const peakHourIndex = hourCount.indexOf(Math.max(...hourCount));
    const peakHour =
      peakHourIndex >= 0
        ? `${peakHourIndex.toString().padStart(2, "0")}:00 - ${(peakHourIndex + 1).toString().padStart(2, "0")}:00`
        : "N/A";

    // Most accessed location
    const mostAccessed = byLocation.length > 0 ? byLocation[0].location : "N/A";

    res.json({
      success: true,
      data: {
        totalAccess,
        uniqueUsers,
        peakHour,
        mostAccessed,
        successRate,
        byLocation,
      },
    });
  } catch (error) {
    console.error("Get access reports error:", error);
    res.status(500).json({ success: false, message: "Failed to get reports" });
  }
});

// Get security logs
app.get("/api/admin/security-logs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AccessLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "firstName lastName email");

    const total = await AccessLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get security logs error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get security logs" });
  }
});

// Get system health
app.get("/api/admin/health", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const dbStatus =
      mongoose.connection.readyState === 1 ? "Online" : "Offline";

    res.json({
      success: true,
      health: {
        database: dbStatus,
        api: "Running",
        nfcService: "Active",
      },
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get system health" });
  }
});

// Create backup (simplified)
app.post("/api/admin/backup", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: "System backup created",
    });
    await accessLog.save();

    res.json({ success: true, message: "Backup created successfully" });
  } catch (error) {
    console.error("Create backup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create backup" });
  }
});

// Get system settings
app.get("/api/admin/settings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
      success: true,
      settings: {
        maintenanceMode: false,
        emailNotifications: true,
        smsAlerts: true,
        backupFrequency: "daily",
        sessionTimeout: "30",
        maxLoginAttempts: "5",
      },
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({ success: false, message: "Failed to get settings" });
  }
});

// Update system settings
app.put("/api/admin/settings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const settings = req.body;

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: "System settings updated",
    });
    await accessLog.save();

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update system settings error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update settings" });
  }
});

// Update user access permissions
app.put("/api/admin/users/:id/access", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { canAccess, restrictedAreas, timeRestrictions, cardActive } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Store access permissions
    user.accessPermissions = {
      canAccess: canAccess || [],
      restrictedAreas: restrictedAreas || [],
      timeRestrictions: timeRestrictions || [],
      cardActive: cardActive !== false,
    };

    await user.save();

    // Create access log
    const accessLog = new AccessLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      notes: `Updated access permissions for ${user.email}`,
    });
    await accessLog.save();

    res.json({
      success: true,
      message: "Access permissions updated successfully",
    });
  } catch (error) {
    console.error("Update access permissions error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update access permissions" });
  }
});

// ========== ERROR HANDLING ==========
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

// Check if port is available
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: ${MONGODB_URI}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`👑 Admin routes available at /api/admin/*`);
  console.log(`📝 Visitor approval routes available at /api/admin/visitors/*`);
});

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Try a different port:`);
    console.log(`   Try: PORT=5001 npm run dev`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
  }
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

