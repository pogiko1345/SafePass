const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Visitor = require("./models/Visitor");
const Notification = require("./models/Notification");
const User = require("./models/User");
const AccessLog = require("./models/AccessLog");
const AppSettings = require("./models/AppSettings");
const Counter = require("./models/Counter");
const { createRateLimiter, getRateLimitKey } = require("./utils/securityUtils");
const {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_APPOINTMENT_OPTIONS,
  DEFAULT_APPOINTMENT_SLOT_LIMIT,
  DEFAULT_APPOINTMENT_PURPOSE_OPTIONS,
  DEFAULT_APPOINTMENT_DEPARTMENT_OPTIONS,
  sanitizeSystemSettings,
  sanitizeAppointmentOptions,
} = require("./utils/settingsUtils");
const timestamp = Date.now();
const randomString = Math.random().toString(36).substr(2, 10).toUpperCase();
const tempNfcCardId = `PENDING-${timestamp}-${randomString}`;
const otpStore = new Map();
require("dotenv").config();

const app = express();
const isVercelRuntime = Boolean(process.env.VERCEL);
const sensitiveDebugLoggingEnabled =
  String(process.env.ALLOW_SENSITIVE_DEBUG_LOGS || "").trim().toLowerCase() === "true";
const phoneOtpSmsProviderConfigured = [
  "SEMAPHORE_API_KEY",
  "SEMAPHORE_API_TOKEN",
  "SMS_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
].some((name) => String(process.env[name] || "").trim());

const APPOINTMENT_ID_TYPE_OPTIONS = [
  "School ID",
  "National ID",
  "Driver's License",
  "Passport",
  "UMID",
  "PhilHealth ID",
  "Voter's ID",
  "PRC ID",
  "Postal ID",
  "Senior Citizen ID",
  "Company ID",
  "Other Government ID",
];

const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";
const REQUIRE_OCR_ID_VALIDATION =
  String(process.env.REQUIRE_OCR_ID_VALIDATION || "").trim().toLowerCase() === "true";

const GENERIC_AUTH_ERROR_MESSAGE = "Invalid email or password";
const GENERIC_PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account matches that email, a password reset code and secure reset link will be sent.";
const GENERIC_PASSWORD_RESET_VERIFY_MESSAGE =
  "Invalid or expired verification code. Please request a new code and try again.";

const formatSafePassAccountId = (year, sequence) =>
  `${year}-${String(sequence).padStart(6, "0")}`;

const isSafePassAccountId = (value = "") => /^\d{4}-\d{6}$/.test(String(value || "").trim());

const normalizeNfcCardId = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");

const generateSafePassAccountId = async (createdAt = new Date()) => {
  const createdDate = new Date(createdAt);
  const year = Number.isNaN(createdDate.getTime())
    ? new Date().getFullYear()
    : createdDate.getFullYear();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const counter = await Counter.findOneAndUpdate(
      { _id: `safepass-account:${year}` },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { scope: "safepass-account", year },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const candidate = formatSafePassAccountId(year, counter.sequence);
    const existing = await User.exists({ nfcCardId: candidate });
    if (!existing) return candidate;
  }

  throw new Error("Unable to generate a unique SafePass account ID.");
};

const ensureSafePassAccountId = async (user) => {
  if (!user || String(user.role || "").toLowerCase() !== "visitor") {
    return user?.nfcCardId || "";
  }

  if (String(user.nfcCardId || "").trim()) return user.nfcCardId;

  user.nfcCardId = await generateSafePassAccountId(user.createdAt || new Date());
  await user.save();
  return user.nfcCardId;
};

const reviewAppointmentIdImage = ({ idType, idImage, idVerification }) => {
  const normalizedIdType = String(idType || "").trim();
  const normalizedIdImage = String(idImage || "").trim();
  const normalizedVerificationStatus = String(idVerification?.status || "").trim();
  const verificationConfidence = Number(idVerification?.confidence);

  if (!normalizedIdType) {
    return {
      isAccepted: false,
      status: "missing_id_type",
      message: "Please choose which valid ID you will present.",
    };
  }

  if (!normalizedIdImage) {
    return {
      isAccepted: false,
      status: "missing_image",
      message: "Please upload a clear image of your valid ID.",
    };
  }

  const looksLikeImagePayload =
    normalizedIdImage.startsWith("data:image/") ||
    normalizedIdImage.startsWith("file:") ||
    normalizedIdImage.startsWith("content:") ||
    normalizedIdImage.startsWith("http");

  if (!looksLikeImagePayload || normalizedIdImage.length < 120) {
    return {
      isAccepted: false,
      status: "image_quality_failed",
      message:
        "We could not confirm the uploaded file is a valid ID image. Please upload a clearer photo of the front of the ID.",
    };
  }

  if (
    normalizedVerificationStatus === "ai_precheck_failed" ||
    normalizedVerificationStatus === "ocr_validation_failed" ||
    normalizedVerificationStatus === "ocr_validation_error"
  ) {
    return {
      isAccepted: false,
      status: normalizedVerificationStatus,
      message:
        idVerification?.message ||
        "The uploaded ID image did not pass verification. Please upload a clearer matching ID photo.",
      confidence: Number.isFinite(verificationConfidence) ? verificationConfidence : 0,
    };
  }

  if (
    normalizedVerificationStatus === "ai_precheck_passed" ||
    normalizedVerificationStatus === "ocr_validation_passed"
  ) {
    return {
      isAccepted: true,
      status: normalizedVerificationStatus,
      message:
        idVerification?.message ||
        `Uploaded ${normalizedIdType} image passed the verification pre-check. Final validation will be completed by staff or security.`,
      confidence: Number.isFinite(verificationConfidence) ? verificationConfidence : 100,
    };
  }

  return {
    isAccepted: true,
    status: "image_uploaded",
    message: `Uploaded ${normalizedIdType} image saved. Final validation will be completed by staff or security.`,
    confidence: null,
  };
};

const getRequiredEnvValue = (name) => {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getOptionalEnvValue = (name) => String(process.env[name] || "").trim();

const getOcrSpaceApiKey = () => getOptionalEnvValue("OCR_SPACE_API_KEY");

const normalizeOcrText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getExpectedIdKeywords = (idType = "") => {
  const normalizedIdType = normalizeOcrText(idType);
  if (!normalizedIdType) return [];

  if (normalizedIdType.includes("national")) {
    return ["national id", "philippine identification", "philid", "psn", "philsys"];
  }
  if (normalizedIdType.includes("driver")) {
    return ["driver", "license", "licence", "lto", "driver s license"];
  }
  if (normalizedIdType.includes("passport")) {
    return ["passport", "republic of the philippines", "passeport"];
  }
  if (normalizedIdType.includes("umid")) {
    return ["umid", "unified multi purpose", "crn"];
  }
  if (normalizedIdType.includes("philhealth")) {
    return ["philhealth", "health insurance"];
  }
  if (normalizedIdType.includes("voter")) {
    return ["voter", "commission on elections", "comelec"];
  }
  if (normalizedIdType.includes("prc")) {
    return ["professional regulation commission", "prc"];
  }
  if (normalizedIdType.includes("postal")) {
    return ["postal", "phlpost"];
  }
  if (normalizedIdType.includes("senior")) {
    return ["senior citizen", "osca"];
  }
  if (normalizedIdType.includes("school")) {
    return ["school", "student", "college", "university", "academy"];
  }
  if (normalizedIdType.includes("company")) {
    return ["company", "employee", "corporation", "inc"];
  }
  if (normalizedIdType.includes("government")) {
    return ["government", "republic of the philippines", "agency"];
  }

  return normalizedIdType.split(" ").filter((part) => part.length >= 3);
};

const getConflictingIdKeywords = (idType = "") => {
  const normalizedIdType = normalizeOcrText(idType);
  const groups = [
    { key: "national", keywords: ["national id", "philippine identification", "philid", "philsys"] },
    { key: "driver", keywords: ["driver", "license", "licence", "lto"] },
    { key: "passport", keywords: ["passport"] },
    { key: "umid", keywords: ["umid", "unified multi purpose", "crn"] },
    { key: "philhealth", keywords: ["philhealth"] },
    { key: "voter", keywords: ["voter", "comelec"] },
    { key: "prc", keywords: ["professional regulation commission", "prc"] },
    { key: "postal", keywords: ["postal", "phlpost"] },
  ];

  const selectedGroup = groups.find((group) => normalizedIdType.includes(group.key));
  return groups
    .filter((group) => group.key !== selectedGroup?.key)
    .flatMap((group) => group.keywords);
};

const scoreOcrIdMatch = ({ idType, rawText }) => {
  const normalizedText = normalizeOcrText(rawText);
  const expectedKeywords = getExpectedIdKeywords(idType);
  const conflictingKeywords = getConflictingIdKeywords(idType);
  const matchedKeywords = expectedKeywords.filter((keyword) =>
    normalizedText.includes(normalizeOcrText(keyword)),
  );
  const conflictingMatches = conflictingKeywords.filter((keyword) =>
    normalizedText.includes(normalizeOcrText(keyword)),
  );
  const hasMeaningfulText = normalizedText.length >= 20;
  const hasExpectedMatch = matchedKeywords.length > 0;
  const hasConflict = conflictingMatches.length > 0 && !hasExpectedMatch;
  const confidence = Math.max(
    0,
    Math.min(
      100,
      (hasMeaningfulText ? 35 : 0) +
        Math.min(matchedKeywords.length * 35, 55) -
        (hasConflict ? 45 : 0),
    ),
  );

  return {
    hasMeaningfulText,
    hasExpectedMatch,
    hasConflict,
    confidence,
    matchedKeywords,
    conflictingMatches,
  };
};

const parseOcrSpaceResult = (data) => {
  const parsedResults = Array.isArray(data?.ParsedResults) ? data.ParsedResults : [];
  return parsedResults
    .map((result) => String(result?.ParsedText || "").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
};

const callOcrSpace = async ({ imageUri }) => {
  const apiKey = getOcrSpaceApiKey();
  if (!apiKey) {
    return {
      success: false,
      skipped: true,
      message: "OCR Space API key is not configured on the backend.",
    };
  }

  const payload = new URLSearchParams({
    apikey: apiKey,
    language: "eng",
    isOverlayRequired: "false",
    detectOrientation: "true",
    scale: "true",
    OCREngine: "2",
  });

  const normalizedImage = String(imageUri || "").trim();
  if (normalizedImage.startsWith("data:image/")) {
    payload.set("base64Image", normalizedImage);
  } else {
    payload.set("url", normalizedImage);
  }

  const response = await fetch(OCR_SPACE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: payload.toString(),
  });
  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = { raw: responseText };
  }

  if (!response.ok || data?.IsErroredOnProcessing) {
    const providerError = Array.isArray(data?.ErrorMessage)
      ? data.ErrorMessage.join(" ")
      : data?.ErrorMessage;
    return {
      success: false,
      message:
        providerError ||
        data?.ErrorDetails ||
        `OCR Space request failed with HTTP ${response.status}.`,
      data,
    };
  }

  return {
    success: true,
    text: parseOcrSpaceResult(data),
    data,
  };
};

const logSensitiveDebug = (...args) => {
  if (sensitiveDebugLoggingEnabled) {
    console.log(...args);
  }
};

const logPhoneOtpForDemo = ({ phoneNumber, otpCode, method }) => {
  if (phoneOtpSmsProviderConfigured && !sensitiveDebugLoggingEnabled) {
    return;
  }

  console.log("");
  console.log("========== PHONE OTP DEMO ==========");
  console.log(`Number : ${phoneNumber}`);
  console.log(`Method : ${method || "sms"}`);
  console.log(`OTP    : ${otpCode}`);
  console.log("====================================");
  console.log("");
};

const getSemaphoreApiKey = () =>
  String(
    process.env.SEMAPHORE_API_KEY ||
      process.env.SEMAPHORE_API_TOKEN ||
      process.env.SMS_API_KEY ||
      "",
  ).trim();

const getPhoneOtpDeliveryProvider = () => {
  if (getSemaphoreApiKey()) return "semaphore";
  return "backend_log";
};

const shouldFallbackPhoneOtpToBackendLog = () =>
  sensitiveDebugLoggingEnabled ||
  String(process.env.SEMAPHORE_ALLOW_BACKEND_LOG_FALLBACK || "")
    .trim()
    .toLowerCase() === "true";

const logPhoneOtpBackendFallback = ({ phoneNumber, otpCode, method, reason }) => {
  console.warn(`Semaphore OTP fallback enabled: ${reason || "SMS delivery unavailable"}`);
  console.log("");
  console.log("========== PHONE OTP BACKEND FALLBACK ==========");
  console.log(`Number : ${phoneNumber}`);
  console.log(`Method : ${method || "sms"}`);
  console.log(`OTP    : ${otpCode}`);
  console.log("================================================");
  console.log("");
};

const sendSemaphoreOtp = async ({ phoneNumber, otpCode }) => {
  const apiKey = getSemaphoreApiKey();
  if (!apiKey) {
    return { success: false, skipped: true, provider: "backend_log" };
  }

  const senderName = String(process.env.SEMAPHORE_SENDER_NAME || "").trim();
  const messageTemplate = String(
    process.env.SEMAPHORE_OTP_MESSAGE ||
      "Your SafePass login OTP is {otp}. It expires in 5 minutes.",
  );
  const payload = new URLSearchParams({
    apikey: apiKey,
    number: phoneNumber,
    message: messageTemplate.includes("{otp}")
      ? messageTemplate
      : `${messageTemplate} {otp}`,
    code: otpCode,
  });

  if (senderName) {
    payload.set("sendername", senderName);
  }

  const sendRequest = (requestPayload) => fetch("https://api.semaphore.co/api/v4/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: requestPayload.toString(),
  });

  let response = await sendRequest(payload);

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  const hasInvalidSenderNameError = (value) =>
    JSON.stringify(value || {}).toLowerCase().includes("sendername");

  if (!response.ok && senderName && hasInvalidSenderNameError(data)) {
    console.warn("Semaphore sender name rejected. Retrying OTP SMS with default sender.");
    payload.delete("sendername");
    response = await sendRequest(payload);
    const retryResponseText = await response.text();
    try {
      data = retryResponseText ? JSON.parse(retryResponseText) : null;
    } catch {
      data = retryResponseText;
    }
  }

  if (!response.ok) {
    const error = new Error(`Semaphore OTP request failed with HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  const messages = Array.isArray(data) ? data : data ? [data] : [];
  const failedMessage = messages.find((item) =>
    String(item?.status || "").toLowerCase().includes("failed"),
  );

  if (failedMessage) {
    const error = new Error("Semaphore rejected the OTP SMS.");
    error.data = failedMessage;
    throw error;
  }

  return { success: true, provider: "semaphore", data };
};

// ========== ENHANCED CORS CONFIGURATION ==========
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-device-key"],
  }),
);

// Handle preflight requests. Express 5 rejects bare "*" paths.
app.options(/.*/, cors());

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ========== DATABASE CONNECTION ==========
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://sapphiresafepass2.vercel.app";
const maskMongoUri = (uri = "") =>
  String(uri).replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

let mongoConnectionPromise = global.__safepassMongoConnectionPromise;

const connectToDatabase = () => {
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(MONGODB_URI)

      .then(() => {
        console.log(
          `✅ MongoDB Connected (${MONGODB_URI.includes("mongodb+srv") ? "Atlas" : "Local"})`,
        );
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        console.log("Trying to connect to:", maskMongoUri(MONGODB_URI));
        mongoConnectionPromise = null;
        global.__safepassMongoConnectionPromise = null;
        throw err;
      });

    global.__safepassMongoConnectionPromise = mongoConnectionPromise;
  }

  return mongoConnectionPromise;
};

connectToDatabase();

const authAttemptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "auth" }),
});

const passwordResetRequestLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "password-reset-request" }),
});

const passwordResetVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "password-reset-verify" }),
});

const passwordResetChangeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 4,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "password-reset-change" }),
});

const registrationOtpRequestLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 3,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "registration-otp-request" }),
});

const registrationOtpVerifyLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "registration-otp-verify" }),
});

const phoneOtpRequestLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 3,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "phone-otp-request" }),
});

const phoneOtpVerifyLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  getKey: ({ req, identifier }) => getRateLimitKey({ req, identifier, scope: "phone-otp-verify" }),
});

// ========== HELPER FUNCTIONS ==========
const applyRateLimit = (res, limiterResult, retryMessage) => {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((limiterResult.resetAt - Date.now()) / 1000),
  );
  res.set("Retry-After", String(retryAfterSeconds));
  return res.status(429).json({
    success: false,
    message: retryMessage,
  });
};

const getSystemSettingsRecord = async () =>
  AppSettings.findOneAndUpdate(
    { key: "system" },
    { $setOnInsert: { key: "system", ...DEFAULT_SYSTEM_SETTINGS, appointmentOptions: DEFAULT_APPOINTMENT_OPTIONS } },
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

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    getRequiredEnvValue("JWT_SECRET"),
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
      getRequiredEnvValue("JWT_SECRET"),
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

const notificationIsAccessibleToUser = (notification, user) => {
  if (!notification || !user) return false;
  const allowedRoles = getNotificationTargetRoles(user.role);
  const targetRole = String(notification.targetRole || "all").toLowerCase();
  const roleAllowed = allowedRoles.includes(targetRole);
  const userAllowed =
    !notification.targetUser || String(notification.targetUser) === String(user._id);
  return roleAllowed && userAllowed;
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

const formatVisitSchedule = (visitDate, visitTime) => {
  const resolvedDate = visitDate ? new Date(visitDate) : null;
  const resolvedTime = visitTime ? new Date(visitTime) : null;
  const dateLabel = resolvedDate
    ? resolvedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "an upcoming date";
  const timeLabel = resolvedTime
    ? resolvedTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "the scheduled time";

  return `${dateLabel} at ${timeLabel}`;
};

const ensureOverstayAlerts = async () => {
  try {
    const graceMinutes = Math.max(
      5,
      parseInt(process.env.VISITOR_OVERSTAY_GRACE_MINUTES || "15", 10),
    );
    const threshold = new Date(Date.now() - graceMinutes * 60 * 1000);

    const overstayedVisitors = await Visitor.find({
      requestCategory: "appointment",
      status: "checked_in",
      appointmentCompletedAt: { $ne: null, $lte: threshold },
      checkedOutAt: null,
      overstayAlertedAt: null,
    }).limit(50);

    for (const visitor of overstayedVisitors) {
      const visitorUser = await User.findOne({ email: visitor.email });
      const scheduleLabel = formatVisitSchedule(visitor.visitDate, visitor.visitTime);

      await createRoleNotification({
        title: "Visitor Overstay Alert",
        message: `${visitor.fullName} has not checked out ${graceMinutes} minutes after appointment completion. Scheduled visit was ${scheduleLabel}.`,
        type: "alert",
        severity: "high",
        targetRole: "security",
        relatedVisitor: visitor._id,
        relatedUser: visitorUser?._id || null,
        metadata: {
          activityType: "visitor_overstay_alert",
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          graceMinutes,
        },
      });

      await createRoleNotification({
        title: "Visitor Overstay Alert",
        message: `${visitor.fullName} has not checked out after the appointment was marked complete.`,
        type: "alert",
        severity: "high",
        targetRole: "admin",
        relatedVisitor: visitor._id,
        relatedUser: visitorUser?._id || null,
        metadata: {
          activityType: "visitor_overstay_alert",
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          graceMinutes,
        },
      });

      await createSystemActivity({
        actorUser: null,
        relatedVisitor: visitor,
        relatedUser: visitorUser,
        activityType: "visitor_overstay_alert",
        status: "flagged",
        location: visitor.assignedOffice || visitor.host || "Campus",
        notes: `${visitor.fullName} remained checked in after appointment completion.`,
        metadata: {
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          graceMinutes,
        },
      });

      visitor.overstayAlertedAt = new Date();
      await visitor.save();
    }
  } catch (error) {
    console.error("Ensure overstay alerts error:", error);
  }
};

const CHECKPOINT_LOCATIONS = {
  main_gate: {
    floor: "ground",
    office: "Main Gate",
    coordinates: { x: 6.8, y: 40 },
  },
  gate: {
    floor: "ground",
    office: "Main Gate",
    coordinates: { x: 6.8, y: 40 },
  },
  gate_1: {
    floor: "ground",
    office: "Main Gate",
    coordinates: { x: 6.8, y: 40 },
  },
  reader_1: {
    floor: "ground",
    office: "Main Gate",
    coordinates: { x: 6.8, y: 40 },
  },
  entrance: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  entry: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  campus_entry: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  campus_exit: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  arduino_reader: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  arduino_reader_1: {
    floor: "ground",
    office: "Entrance / Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  lobby: {
    floor: "ground",
    office: "Lobby",
    coordinates: { x: 6.8, y: 40 },
  },
  cashier: {
    floor: "ground",
    office: "Cashier",
    coordinates: { x: 15.2, y: 28.5 },
  },
  staff: {
    floor: "ground",
    office: "Staff",
    coordinates: { x: 15.2, y: 46.8 },
  },
  administration: {
    floor: "ground",
    office: "Administration",
    coordinates: { x: 62, y: 40 },
  },
  registrar: {
    floor: "ground",
    office: "Registrar's Office",
    coordinates: { x: 26.9, y: 46.8 },
  },
  registrar_office: {
    floor: "ground",
    office: "Registrar's Office",
    coordinates: { x: 26.9, y: 46.8 },
  },
  accounting: {
    floor: "ground",
    office: "Accounting Office",
    coordinates: { x: 21.8, y: 46.8 },
  },
  accounting_office: {
    floor: "ground",
    office: "Accounting Office",
    coordinates: { x: 21.8, y: 46.8 },
  },
  file_room: {
    floor: "ground",
    office: "File Room",
    coordinates: { x: 32.4, y: 28.5 },
  },
  storage: {
    floor: "ground",
    office: "Storage",
    coordinates: { x: 33.1, y: 46.8 },
  },
  offices: {
    floor: "ground",
    office: "Offices",
    coordinates: { x: 62, y: 40 },
  },
  pwd_cr: {
    floor: "ground",
    office: "PWD CR",
    coordinates: { x: 78.6, y: 32.5 },
  },
  he_she: {
    floor: "ground",
    office: "HE, SHE",
    coordinates: { x: 78.9, y: 41.8 },
  },
  kitchen: {
    floor: "ground",
    office: "Kitchen",
    coordinates: { x: 88.4, y: 33 },
  },
  conference_room: {
    floor: "first",
    office: "Conference Room",
    coordinates: { x: 7.6, y: 41 },
  },
  chairman: {
    floor: "first",
    office: "Chairman",
    coordinates: { x: 16.8, y: 45 },
  },
  flight_operations: {
    floor: "first",
    office: "Flight Operations",
    coordinates: { x: 27.2, y: 47 },
  },
  head_of_training_room: {
    floor: "first",
    office: "Head Of Training Room",
    coordinates: { x: 36, y: 44 },
  },
  it_room: {
    floor: "first",
    office: "I.T Room",
    coordinates: { x: 47, y: 45 },
  },
  faculty_room: {
    floor: "first",
    office: "Faculty Room",
    coordinates: { x: 61.8, y: 38 },
  },
  academy_director: {
    floor: "first",
    office: "Academy Director",
    coordinates: { x: 77.4, y: 39 },
  },
  cr: {
    floor: "first",
    office: "CR",
    coordinates: { x: 86.8, y: 27.5 },
  },
  sto: {
    floor: "first",
    office: "STO",
    coordinates: { x: 86.8, y: 47 },
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
  const checkpointCandidates = [
    body.checkpointId,
    body.checkpoint,
    body.readerId,
    body.gateId,
    body.location,
    body.office,
    body.deviceId,
  ];
  const checkpointId =
    checkpointCandidates.map(normalizeCheckpointId).find(Boolean) || "";
  const knownCheckpoint =
    checkpointCandidates
      .map(normalizeCheckpointId)
      .map((candidate) => CHECKPOINT_LOCATIONS[candidate])
      .find(Boolean) || null;
  const coordinates = body.coordinates || {};

  return {
    checkpointId: knownCheckpoint
      ? Object.keys(CHECKPOINT_LOCATIONS).find(
          (key) => CHECKPOINT_LOCATIONS[key] === knownCheckpoint,
        ) || checkpointId
      : checkpointId,
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

const getVisitorCheckInLocation = (visitor, source = "mobile_app") => {
  const sourceValue = String(source || "").trim();
  const candidates = [
    visitor?.assignedOffice,
    visitor?.appointmentDepartment,
    visitor?.host,
    sourceValue === "virtual_nfc_card" ? "main_gate" : "",
  ];

  for (const candidate of candidates) {
    const checkpointId = normalizeCheckpointId(candidate);
    const knownCheckpoint = CHECKPOINT_LOCATIONS[checkpointId];
    if (knownCheckpoint) {
      return {
        checkpointId,
        floor: knownCheckpoint.floor,
        office: knownCheckpoint.office,
        coordinates: knownCheckpoint.coordinates,
        source: sourceValue || "mobile_app",
      };
    }
  }

  const fallback = CHECKPOINT_LOCATIONS.main_gate;
  return {
    checkpointId: "main_gate",
    floor: fallback.floor,
    office: fallback.office,
    coordinates: fallback.coordinates,
    source: sourceValue || "mobile_app",
  };
};

const validateDeviceKey = (req, res, next) => {
  const expectedKey = String(process.env.ARDUINO_DEVICE_KEY || "").trim();
  const providedKey = req.header("x-device-key") || req.body?.deviceKey;

  if (!expectedKey) {
    return res.status(503).json({
      success: false,
      message: "Arduino device access is not configured",
    });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid device key",
    });
  }

  next();
};

// ========== EMAIL DELIVERY ==========
let mailTransporter = null;
let nodemailerLoadError = null;

try {
  const nodemailer = require("nodemailer");
  const mailHost = String(process.env.MAIL_HOST || "").trim();
  const mailUser = String(process.env.MAIL_USER || "").trim();
  const mailPass = String(process.env.MAIL_PASS || "").trim();
  const mailPort = Number(process.env.MAIL_PORT || 587);
  const mailSecure = String(process.env.MAIL_SECURE || "false").trim() === "true";

  if (mailHost && mailUser && mailPass) {
    mailTransporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailSecure,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });
  }
} catch (error) {
  nodemailerLoadError = error;
}

const verifyMailTransporter = async () => {
  if (!mailTransporter) {
    return false;
  }

  try {
    await mailTransporter.verify();
    console.log(`SMTP ready for ${String(process.env.MAIL_USER || "").trim()}`);
    return true;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    return false;
  }
};

verifyMailTransporter();

const getMailFromAddress = () =>
  String(process.env.MAIL_FROM || process.env.MAIL_USER || "no-reply@safepass.local").trim();

const getEmailGreetingName = (user = {}) =>
  String(user.firstName || user.fullName || "User").trim();

const getSupportEmailSignature = () =>
  [
    "Thank you,",
    "Sapphire SafePass",
    "Sapphire International Aviation Academy",
  ].join("\n");

const generateTemporaryPassword = (length = 10) => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password += characters[randomIndex];
  }
  return password;
};

const getEmployeeIdPrefix = (role = "staff") => {
  const normalizedRole = String(role || "").toLowerCase();
  return normalizedRole === "security" || normalizedRole === "guard" ? "SEC" : "STF";
};

const generateYearEmployeeIdCandidate = (role = "staff") => {
  const prefix = getEmployeeIdPrefix(role);
  const currentYear = new Date().getFullYear();
  const numericPart = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  return `${prefix}-${currentYear}-${numericPart}`;
};

const generateUniqueEmployeeId = async (role = "staff") => {
  let candidate = generateYearEmployeeIdCandidate(role);
  while (await User.exists({ employeeId: candidate })) {
    candidate = generateYearEmployeeIdCandidate(role);
  }
  return candidate;
};

const sendEmail = async (to, subject, body) => {
  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from: getMailFromAddress(),
        to,
        subject,
        text: body,
      });
      console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
      return { success: true, simulated: false, delivered: true, messageId: info.messageId };
    } catch (error) {
      console.error(`\nFailed to send email to ${to}:`, error.message);
      return { success: false, simulated: false, delivered: false, error: error.message };
    }
  }

  if (nodemailerLoadError) {
    console.warn(
      "\nNodemailer is not installed yet. Run npm install in the backend folder to enable real email sending.",
    );
  } else if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn(
      "\nMAIL_HOST / MAIL_USER / MAIL_PASS are not configured. Falling back to email simulation.",
    );
  }

  console.log(`Email simulation generated for ${to}. Subject: ${subject}`);
  logSensitiveDebug(`Simulated email body for ${to}:`, body);
  return { success: true, simulated: true, delivered: false };
};

const canUseBackendLogOtpFallback = () => sensitiveDebugLoggingEnabled;

const isOtpDeliveryUsable = (emailResult) =>
  Boolean(emailResult?.success || canUseBackendLogOtpFallback());

const getOtpDeliveryMode = (emailResult) => {
  if (emailResult?.delivered) {
    return "email";
  }

  if (emailResult?.simulated || canUseBackendLogOtpFallback()) {
    return "backend_log";
  }

  return "failed";
};

const logEmailOtpForDemo = ({ email, otpCode, label = "EMAIL OTP DEMO" }) => {
  console.log("");
  console.log(`========== ${label} ==========`);
  console.log(`Email  : ${email}`);
  console.log(`OTP    : ${otpCode}`);
  console.log("====================================");
  console.log("");
};

const createVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  return { token, tokenHash, expiresAt };
};

const createPasswordSetupToken = (hours = 48) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * hours);
  return { token, tokenHash, expiresAt };
};

const getApiBaseUrl = (req) => {
  if (process.env.API_PUBLIC_URL) {
    return process.env.API_PUBLIC_URL.replace(/\/$/, "");
  }

  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  const host = req.get("host");
  return `${protocol}://${host}`;
};

const sendVerificationEmailSimulation = async (req, user) => {
  const otp = await createRegistrationOtp(user);
  return {
    expiresAt: otp.expiresAt,
    otpExpiresAt: otp.expiresAt,
    emailResult: otp.emailResult,
  };
};

const createRegistrationOtp = async (user) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  user.verificationOtpHash = otpHash;
  user.verificationOtpExpiresAt = expiresAt;
  user.verificationOtpAttempts = 0;
  user.verificationTokenHash = "";
  user.verificationExpiresAt = null;

  const emailResult = await sendEmail(
    user.email,
    "Sapphire SafePass Visitor Verification Code",
    [
      `Good day, ${getEmailGreetingName(user)}.`,
      "",
      "Thank you for creating your Sapphire SafePass visitor account.",
      "Enter the one-time password below in the SafePass app to verify your account:",
      "",
      `OTP Code: ${otpCode}`,
      "",
      "This code will expire in 10 minutes.",
      "For your security, do not share this code with anyone. SafePass will never ask for your OTP outside the app.",
      "",
      "If you did not request this code, you may safely ignore this email.",
      "",
      getSupportEmailSignature(),
    ].join("\n"),
  );

  console.log(`Visitor registration OTP generated for ${user.email}.`);
  logSensitiveDebug(`Visitor registration OTP for ${user.email}: ${otpCode}`);
  if (emailResult?.simulated || canUseBackendLogOtpFallback()) {
    logEmailOtpForDemo({
      email: user.email,
      otpCode,
      label: "VISITOR REGISTRATION OTP",
    });
  }

  return { expiresAt, emailResult };
};

const normalizeOtpCode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);
const createPasswordResetOtp = async (req, user) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  const resetLink = `${FRONTEND_URL}?resetEmail=${encodeURIComponent(user.email)}&resetToken=${encodeURIComponent(resetToken)}`;

  user.passwordResetTokenHash = resetTokenHash;
  user.passwordResetOtpHash = otpHash;
  user.passwordResetExpiresAt = expiresAt;
  user.passwordResetAttempts = 0;
  user.passwordResetVerifiedAt = null;

  const emailResult = await sendEmail(
    user.email,
    "Sapphire SafePass Password Reset Code",
    [
      `Good day, ${getEmailGreetingName(user)}.`,
      "",
      "We received a request to reset the password for your Sapphire SafePass account.",
      "Use the code below or open the secure link to continue:",
      "",
      `Password reset code: ${otpCode}`,
      `Password reset link: ${resetLink}`,
      "",
      "This code will expire in 10 minutes.",
      "The reset link expires at the same time.",
      "If you did not request a password reset, you may ignore this email and keep your current password.",
      "",
      getSupportEmailSignature(),
    ].join("\n"),
  );

  console.log(`Password reset code generated for ${user.email}.`);
  logSensitiveDebug(`Password reset link for ${user.email}: ${resetLink}`);
  if (emailResult?.simulated) {
    logEmailOtpForDemo({
      email: user.email,
      otpCode,
      label: "PASSWORD RESET OTP",
    });
    console.log(`Password reset link: ${resetLink}`);
  }

  return { expiresAt, emailResult, resetLink };
};

const clearPasswordResetState = (user) => {
  user.passwordResetTokenHash = "";
  user.passwordResetOtpHash = "";
  user.passwordResetExpiresAt = null;
  user.passwordResetAttempts = 0;
  user.passwordResetVerifiedAt = null;
};

const normalizePhoneForOtp = (value) => {
  let cleanPhone = String(value || "").replace(/[^\d]/g, "");

  if (cleanPhone.startsWith("63")) {
    cleanPhone = `0${cleanPhone.slice(2)}`;
  } else if (cleanPhone.startsWith("9") && cleanPhone.length === 10) {
    cleanPhone = `0${cleanPhone}`;
  }

  if (!cleanPhone.startsWith("09") && cleanPhone.length >= 9) {
    cleanPhone = `09${cleanPhone.slice(-9)}`;
  }

  return cleanPhone;
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
    )
      .trim()
      .toUpperCase();
    const normalizedCardId = normalizeNfcCardId(cardId);
    const deviceId = String(req.body?.deviceId || "arduino-reader").trim();
    const tapLocation = getTapLocationFromRequest(req.body || {});
    const tapAction = String(req.body?.action || req.body?.tapAction || "auto")
      .trim()
      .toLowerCase();

    if (!normalizedCardId) {
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
      role: "visitor",
      nfcCardId: { $in: Array.from(new Set([cardId, normalizedCardId])) },
    }).select("_id email firstName lastName nfcCardId role status accessPermissions");

    if (!visitorUser) {
      await AccessLog.create({
        userEmail: "",
        userName: "Unknown NFC Card",
        actorRole: "device",
        location: tapLocation.office,
        accessType: "system",
        activityType: "arduino_location_tap",
        status: "denied",
        nfcCardId: normalizedCardId,
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

    if (!isUserSafePassCardActive(visitorUser)) {
      await AccessLog.create({
        userId: visitorUser._id,
        userEmail: visitorUser.email,
        userName: `${visitorUser.firstName || ""} ${visitorUser.lastName || ""}`.trim(),
        actorRole: "device",
        location: tapLocation.office,
        accessType: "system",
        activityType: "arduino_location_tap",
        status: "denied",
        nfcCardId: normalizedCardId,
        relatedUser: visitorUser._id,
        metadata: {
          deviceId,
          tapLocation,
          accountStatus: visitorUser.status,
        },
        notes: `Inactive NFC card tapped at ${tapLocation.office}`,
      });

      return res.status(403).json({
        success: false,
        message: "NFC card is not active",
      });
    }

    const checkedInVisitor = await Visitor.findOne({
      email: visitorUser.email,
      status: "checked_in",
    }).sort({ checkedInAt: -1 });

    const latestVisitor =
      checkedInVisitor ||
      (await Visitor.findOne({
        email: visitorUser.email,
        status: { $ne: "checked_out" },
      }).sort({ visitDate: -1, registeredAt: -1 }));

    if (!latestVisitor) {
      await AccessLog.create({
        userId: visitorUser._id,
        userEmail: visitorUser.email,
        userName: `${visitorUser.firstName || ""} ${visitorUser.lastName || ""}`.trim(),
        actorRole: "device",
        location: tapLocation.office,
        accessType: "system",
        activityType: "arduino_location_tap",
        status: "denied",
        nfcCardId: normalizedCardId,
        relatedUser: visitorUser._id,
        metadata: {
          deviceId,
          tapLocation,
        },
        notes: `Card tapped at ${tapLocation.office}, but no active visit was found`,
      });

      return res.status(409).json({
        success: false,
        message: "No active visit found for this NFC card",
      });
    }

    const normalizedCheckpoint = normalizeCheckpointId(tapLocation.checkpointId || tapLocation.office);
    const isMainGateTap =
      normalizedCheckpoint === "main_gate" ||
      normalizedCheckpoint === "gate" ||
      normalizedCheckpoint === "campus_entry" ||
      normalizedCheckpoint === "campus_exit";
    const isAutoGateTap =
      tapAction === "auto" ||
      tapAction === "gate" ||
      tapAction === "entry" ||
      tapAction === "exit" ||
      isMainGateTap;
    const shouldCheckOut =
      checkedInVisitor &&
      tapAction !== "location" &&
      tapAction !== "track" &&
      (tapAction === "checkout" || tapAction === "check_out" || isAutoGateTap);
    const shouldCheckIn =
      !checkedInVisitor &&
      tapAction !== "location" &&
      tapAction !== "track" &&
      (tapAction === "checkin" || tapAction === "check_in" || isAutoGateTap);

    const visitor = latestVisitor;
    let action = "location_update";
    let accessType = "system";
    let activityType = "arduino_location_tap";
    let responseMessage = "Visitor location updated";

    if (shouldCheckOut) {
      visitor.updateCurrentLocation(tapLocation, { deviceId });
      visitor.markCheckedOut(null);
      action = "check_out";
      accessType = "exit";
      activityType = "nfc_card_checkout";
      responseMessage = "Visitor checked out automatically by NFC card";
    } else if (shouldCheckIn) {
      if (!visitor.hasApprovedVisitWindow()) {
        await AccessLog.create({
          userId: visitorUser._id,
          userEmail: visitorUser.email,
          userName: visitor.fullName,
          actorRole: "device",
          location: tapLocation.office,
          accessType: "entry",
          activityType: "nfc_card_checkin",
          status: "denied",
          nfcCardId: normalizedCardId,
          relatedVisitor: visitor._id,
          relatedUser: visitorUser._id,
          metadata: {
            deviceId,
            tapLocation,
            visitorStatus: visitor.status,
            approvalStatus: visitor.approvalStatus,
            appointmentStatus: visitor.appointmentStatus,
          },
          notes: `${visitor.fullName} tapped at ${tapLocation.office}, but the visit is not approved`,
        });

        return res.status(403).json({
          success: false,
          message: "Visit is not approved for check-in",
        });
      }

      visitor.markCheckedIn(null);
      visitor.updateCurrentLocation(tapLocation, { deviceId });
      action = "check_in";
      accessType = "entry";
      activityType = "nfc_card_checkin";
      responseMessage = "Visitor checked in automatically by NFC card";
    } else {
      if (visitor.status !== "checked_in") {
        await AccessLog.create({
          userId: visitorUser._id,
          userEmail: visitorUser.email,
          userName: visitor.fullName,
          actorRole: "device",
          location: tapLocation.office,
          accessType: "system",
          activityType: "arduino_location_tap",
          status: "denied",
          nfcCardId: normalizedCardId,
          relatedVisitor: visitor._id,
          relatedUser: visitorUser._id,
          metadata: {
            deviceId,
            tapLocation,
            visitorStatus: visitor.status,
          },
          notes: `${visitor.fullName} tapped at ${tapLocation.office}, but visitor is not checked in`,
        });

        return res.status(409).json({
          success: false,
          message: "Visitor must be checked in before location tracking can start",
        });
      }

      visitor.updateCurrentLocation(tapLocation, { deviceId });
    }

    await visitor.save();

    await AccessLog.create({
      userId: visitorUser._id,
      userEmail: visitor.email,
      userName: visitor.fullName,
      actorRole: "device",
      location: tapLocation.office,
      accessType,
      activityType,
      status: "granted",
      nfcCardId: normalizedCardId,
      relatedVisitor: visitor._id,
      relatedUser: visitorUser._id,
      metadata: {
        deviceId,
        action,
        tapLocation,
        currentLocation: visitor.currentLocation,
      },
      notes: `${visitor.fullName} ${action.replace("_", " ")} by NFC card at ${tapLocation.office}`,
    });

    if (action === "check_in" || action === "check_out") {
      const isCheckIn = action === "check_in";
      await Promise.all([
        createRoleNotification({
          title: isCheckIn ? "Visitor Checked In" : "Visitor Checked Out",
          message: `${visitor.fullName} ${isCheckIn ? "checked in" : "checked out"} automatically using the NFC card at ${tapLocation.office}.`,
          targetRole: "security",
          relatedVisitor: visitor._id,
          relatedUser: visitorUser._id,
          type: "info",
          severity: "low",
          metadata: {
            activityType,
            source: "nfc_card_tap",
            deviceId,
            action,
          },
        }),
        createRoleNotification({
          title: isCheckIn ? "Visitor Checked In" : "Visitor Checked Out",
          message: `${visitor.fullName} ${isCheckIn ? "checked in" : "checked out"} automatically using the NFC card at ${tapLocation.office}.`,
          targetRole: "admin",
          relatedVisitor: visitor._id,
          relatedUser: visitorUser._id,
          type: "info",
          severity: "low",
          metadata: {
            activityType,
            source: "nfc_card_tap",
            deviceId,
            action,
          },
        }),
      ]);
    }

    res.json({
      success: true,
      message: responseMessage,
      action,
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
const sanitizeAccountEmailPart = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getGeneratedAccountEmailRolePart = ({ role, department, position } = {}) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "security" || normalizedRole === "guard") return "security";
  return sanitizeAccountEmailPart(department || position || "staff") || "staff";
};

const generateUniqueAccountEmail = async ({ firstName, role, department, position } = {}) => {
  const firstNamePart = sanitizeAccountEmailPart(firstName);
  if (!firstNamePart) return "";

  const rolePart = getGeneratedAccountEmailRolePart({ role, department, position });
  const baseLocalPart = `${firstNamePart}${rolePart}`;
  let suffix = 1;
  let candidate = `${baseLocalPart}@sapphire.edu`;

  while (await User.exists({ email: candidate })) {
    suffix += 1;
    candidate = `${baseLocalPart}${suffix}@sapphire.edu`;
  }

  return candidate;
};
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
    "information desk": "information desk",
    lobby: "information desk",
    "front desk": "information desk",
    "ground offices": "administration",
    "file room": "registrar",
    laboratory: "laboratory",
    tesda: "tesda",
    workshop: "workshop",
    "tools room": "workshop",
    library: "library",
    "students lounge": "student services",
    "student lounge": "student services",
    "student services": "student services",
    sto: "sto",
  };

  return aliases[normalized] || normalized;
};

const formatDepartmentLabel = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const APPOINTMENT_SLOT_LIMIT = DEFAULT_APPOINTMENT_SLOT_LIMIT || 2;
const APPOINTMENT_SLOT_STATUSES = ["pending", "approved", "adjusted"];
const APPOINTMENT_PURPOSE_OPTIONS = DEFAULT_APPOINTMENT_PURPOSE_OPTIONS;
const APPOINTMENT_DEPARTMENT_OPTIONS = DEFAULT_APPOINTMENT_DEPARTMENT_OPTIONS;
const ACCOUNT_ROLE_OPTIONS = ["admin", "staff", "security", "guard", "visitor"];
const ACCOUNT_STATUS_OPTIONS = ["active", "inactive", "pending", "suspended"];

const normalizeOptionValue = (value = "") =>
  String(value || "").trim().replace(/\s+/g, " ").toLowerCase();

const isAllowedOption = (value, options) => {
  const normalizedValue = normalizeOptionValue(value);
  return options.some((option) => normalizeOptionValue(option) === normalizedValue);
};

const getAppointmentSlotLimit = (slot = {}) => {
  const parsedLimit = Number(slot?.capacity ?? slot?.limit ?? APPOINTMENT_SLOT_LIMIT);
  return Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : APPOINTMENT_SLOT_LIMIT;
};

const findAppointmentConfiguredSlot = (timeSlots = [], appointmentDateTime) => {
  if (!appointmentDateTime) return null;
  return timeSlots.find(
    (slot) =>
      Number(slot.hour) === appointmentDateTime.getHours() &&
      Number(slot.minute) === appointmentDateTime.getMinutes(),
  ) || null;
};

const normalizePhoneValue = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^639\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;

  return String(value || "").trim().replace(/\s+/g, " ");
};

const isValidPhoneValue = (value = "") =>
  /^09\d{9}$/.test(normalizePhoneValue(value));

const PHONE_VALIDATION_MESSAGE =
  "Please enter a valid Philippine mobile number, e.g. 09123456789 or +639123456789.";

const isSameObjectId = (left, right) =>
  Boolean(left && right && String(left) === String(right));

const isVisitorOwner = (user = {}, visitor = {}) => {
  if (String(user.role || "").toLowerCase() !== "visitor") return false;

  const sameVisitorId = isSameObjectId(user.visitorId, visitor._id);
  const sameEmail =
    String(user.email || "").trim().toLowerCase() ===
    String(visitor.email || "").trim().toLowerCase();

  return sameVisitorId || sameEmail;
};

const isUserSafePassCardActive = (user = {}) =>
  Boolean(user?.nfcCardId) &&
  String(user?.status || "").toLowerCase() === "active" &&
  user?.accessPermissions?.cardActive !== false;

const getVisitorAccountPayload = (user = {}) => ({
  _id: user._id,
  fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  email: user.email,
  phoneNumber: user.phone,
  status: user.status,
  nfcCardId: user.nfcCardId || "",
  cardActive: isUserSafePassCardActive(user),
  accessPermissions: {
    canAccess: user.accessPermissions?.canAccess || [],
    restrictedAreas: user.accessPermissions?.restrictedAreas || [],
    cardActive: user.accessPermissions?.cardActive !== false,
  },
  registeredAt: user.createdAt,
});

const activateVisitorSafePassCardForUser = async (user, visitor = {}) => {
  if (!user) return "";

  if (!String(user.nfcCardId || "").trim()) {
    user.nfcCardId = await generateSafePassAccountId(user.createdAt || new Date());
  }

  user.role = "visitor";
  user.status = "active";
  user.isActive = true;
  if (visitor?._id) {
    user.visitorId = visitor._id;
  }
  user.accessPermissions = {
    canAccess: user.accessPermissions?.canAccess || [],
    restrictedAreas: user.accessPermissions?.restrictedAreas || [],
    timeRestrictions: user.accessPermissions?.timeRestrictions || [],
    cardActive: true,
  };

  await user.save();
  return user.nfcCardId || "";
};

const findVisitorForUser = async (user) => {
  if (!user) return null;

  const visitors = await findVisitorsForUser(user);
  const visitor = getPrioritizedVisitor(visitors);

  if (
    visitor &&
    (!user.visitorId || String(user.visitorId) !== String(visitor._id))
  ) {
    user.visitorId = visitor._id;
    await user.save();
  }

  return visitor;
};

const findVisitorsForUser = async (user) => {
  if (!user) return [];

  const filters = [];
  if (user.visitorId) {
    filters.push({ _id: user.visitorId });
  }
  if (user.email) {
    filters.push({ email: String(user.email).trim().toLowerCase() });
  }

  if (!filters.length) return [];

  return Visitor.find({ $or: filters }).sort({
    visitDate: 1,
    visitTime: 1,
    registeredAt: -1,
    createdAt: -1,
  });
};

const buildUserCleanupTargets = async (user) => {
  const userId = user?._id;
  const visitorFilters = [];

  if (user?.visitorId) {
    visitorFilters.push({ _id: user.visitorId });
  }

  if (user?.email) {
    visitorFilters.push({ email: String(user.email).trim().toLowerCase() });
  }

  const visitorIds = visitorFilters.length
    ? await Visitor.distinct("_id", { $or: visitorFilters })
    : [];

  return {
    visitorIds,
    accessLogQuery: {
      $or: [
        { userId },
        { relatedUser: userId },
        { relatedVisitor: { $in: visitorIds } },
      ],
    },
    notificationQuery: {
      $or: [
        { userId },
        { targetUser: userId },
        { relatedUser: userId },
        { relatedVisitor: { $in: visitorIds } },
      ],
    },
  };
};

const syncVisitorRecordsForUserUpdate = async (existingUser, updatedUser) => {
  const wasVisitor = String(existingUser?.role || "").toLowerCase() === "visitor";
  const isVisitor = String(updatedUser?.role || "").toLowerCase() === "visitor";

  if (!wasVisitor && !isVisitor) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const filters = [];
  if (existingUser?.visitorId) {
    filters.push({ _id: existingUser.visitorId });
  }
  if (existingUser?.email) {
    filters.push({ email: String(existingUser.email).trim().toLowerCase() });
  }
  if (updatedUser?.email) {
    filters.push({ email: String(updatedUser.email).trim().toLowerCase() });
  }

  if (!filters.length) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  return Visitor.updateMany(
    { $or: filters },
    {
      $set: {
        fullName: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
        email: String(updatedUser.email || "").trim().toLowerCase(),
        phoneNumber: updatedUser.phone || "",
        updatedAt: new Date(),
      },
    },
  );
};

const attachSafePassIdsToVisitors = async (visitors = []) => {
  if (!Array.isArray(visitors) || !visitors.length) return [];

  const emails = [
    ...new Set(
      visitors
        .map((visitor) => String(visitor?.email || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  const users = emails.length
    ? await User.find({ role: "visitor", email: { $in: emails } })
    : [];

  await Promise.all(users.map((user) => ensureSafePassAccountId(user)));

  const safePassByEmail = new Map(
    users.map((user) => [String(user.email || "").trim().toLowerCase(), user.nfcCardId || ""]),
  );

  return visitors.map((visitor) => {
    const payload = typeof visitor.toObject === "function" ? visitor.toObject() : { ...visitor };
    const email = String(payload.email || "").trim().toLowerCase();
    payload.nfcCardId = safePassByEmail.get(email) || payload.nfcCardId || "";
    payload.safePassId = payload.nfcCardId;
    return payload;
  });
};

const getVisitorScheduleTime = (visitor) => {
  const combined = getCombinedAppointmentDateTime(visitor?.visitDate, visitor?.visitTime);
  if (combined) return combined.getTime();

  const fallback = new Date(visitor?.visitDate || visitor?.visitTime || visitor?.registeredAt || 0);
  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
};

const getPrioritizedVisitor = (visitors = []) => {
  if (!Array.isArray(visitors) || !visitors.length) return null;

  const now = Date.now();
  const checkedIn = visitors
    .filter((visitor) => String(visitor?.status || "").toLowerCase() === "checked_in")
    .sort((left, right) => getVisitorScheduleTime(right) - getVisitorScheduleTime(left));

  if (checkedIn[0]) return checkedIn[0];

  const active = visitors.filter((visitor) =>
    !["checked_out", "expired", "rejected"].includes(String(visitor?.status || "").toLowerCase()) &&
    String(visitor?.appointmentStatus || "").toLowerCase() !== "rejected"
  );
  const upcoming = active
    .filter((visitor) => getVisitorScheduleTime(visitor) >= now - 60 * 1000)
    .sort((left, right) => getVisitorScheduleTime(left) - getVisitorScheduleTime(right));

  if (upcoming[0]) return upcoming[0];

  return [...visitors].sort((left, right) => getVisitorScheduleTime(right) - getVisitorScheduleTime(left))[0];
};

const getCombinedAppointmentDateTime = (visitDateValue, visitTimeValue) => {
  const visitDate = new Date(visitDateValue);
  const visitTime = new Date(visitTimeValue);

  if (Number.isNaN(visitDate.getTime()) || Number.isNaN(visitTime.getTime())) {
    return null;
  }

  const combined = new Date(visitDate);
  combined.setHours(visitTime.getHours(), visitTime.getMinutes(), 0, 0);
  return Number.isNaN(combined.getTime()) ? null : combined;
};

const getAppointmentSlotWindow = (visitDateValue, visitTimeValue) => {
  const visitDate = new Date(visitDateValue);
  const visitTime = new Date(visitTimeValue);

  if (Number.isNaN(visitDate.getTime()) || Number.isNaN(visitTime.getTime())) {
    return null;
  }

  const dayStart = new Date(visitDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const slotStart = new Date(visitDate);
  slotStart.setHours(visitTime.getHours(), visitTime.getMinutes(), 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 1);

  return { dayStart, dayEnd, slotStart, slotEnd };
};

const isAppointmentServiceDay = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getDay() !== 0;
};

const countStaffAppointmentsForSlot = async ({
  assignedStaff,
  visitDate,
  visitTime,
  excludeVisitorId = null,
}) => {
  const slot = getAppointmentSlotWindow(visitDate, visitTime);
  if (!slot) return 0;

  const query = {
    requestCategory: "appointment",
    approvalFlow: "staff",
    appointmentStatus: { $in: APPOINTMENT_SLOT_STATUSES },
    assignedStaff,
    visitDate: { $gte: slot.dayStart, $lt: slot.dayEnd },
    visitTime: { $gte: slot.slotStart, $lt: slot.slotEnd },
  };

  if (excludeVisitorId) {
    query._id = { $ne: excludeVisitorId };
  }

  return Visitor.countDocuments(query);
};

const getStaffDepartmentQuery = (department = "") => {
  const normalizedDepartment = normalizeDepartmentValue(department);
  const aliasGroups = {
    registrar: ["Registrar", "Registrar's Office"],
    accounting: ["Accounting", "Finance", "Finance Office", "Cashier"],
    guidance: ["Guidance", "Guidance Office", "Student Services"],
    administration: ["Administration", "Administration Office"],
    admissions: ["Admissions", "Admissions Office"],
    "information desk": ["Information Desk", "Lobby", "Front Desk"],
    "flight operations": ["Flight Operations"],
    training: ["Training", "Head of Training Room"],
    "i.t room": ["I.T Room", "IT Room"],
    "faculty room": ["Faculty Room"],
    laboratory: ["Laboratory"],
    tesda: ["TESDA"],
    workshop: ["Workshop", "Tools Room"],
    library: ["Library"],
    "student services": ["Student Services", "Students Lounge"],
    sto: ["STO"],
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
  console.log("Registration attempt received.");

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

    const normalizedPhone = normalizePhoneValue(phone);
    if (!isValidPhoneValue(normalizedPhone)) {
      return res.status(400).json({
        error: PHONE_VALIDATION_MESSAGE,
        field: "phone",
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
      employeeId = await generateUniqueEmployeeId(role);
    }

const userData = {
  firstName,
  lastName,
  username: normalizedUsername || undefined,
  email: normalizedEmail,
  password,
  phone: normalizedPhone,
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
      await ensureSafePassAccountId(req.user);
      const visitors = await findVisitorsForUser(req.user);
      const visitor = getPrioritizedVisitor(visitors);

      if (visitor) {
        if (!req.user.visitorId || String(req.user.visitorId) !== String(visitor._id)) {
          req.user.visitorId = visitor._id;
          await req.user.save();
        }

        const visitorPayload = visitor.toObject();
        visitorPayload.nfcCardId = req.user.nfcCardId || "";

        return res.json({
          success: true,
          visitor: visitorPayload,
          appointments: visitors,
          account: getVisitorAccountPayload(req.user),
        });
      }

      return res.json({
        success: true,
        visitor: null,
        appointments: [],
        account: getVisitorAccountPayload(req.user),
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
  try {
    const { email, password } = req.body;
    const loginIdentifier = String(email || "").toLowerCase().trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Username/email and password are required" });
    }

    const loginRateLimit = authAttemptLimiter.hit({
      req,
      identifier: loginIdentifier,
    });
    if (!loginRateLimit.allowed) {
      return applyRateLimit(
        res,
        loginRateLimit,
        "Too many login attempts. Please wait a few minutes before trying again.",
      );
    }

    // Visitors can sign in using either their username or email address.
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
    });
    if (!user) {
      return res.status(401).json({ error: GENERIC_AUTH_ERROR_MESSAGE });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: GENERIC_AUTH_ERROR_MESSAGE });
    }

    // Only disclose account state after the password is valid.
    if (user.status === "inactive" || user.status === "suspended") {
      const isActivationPending = ["staff", "security", "guard"].includes(String(user.role || "").toLowerCase()) &&
        user.passwordResetTokenHash &&
        user.passwordResetExpiresAt &&
        user.passwordResetExpiresAt > new Date();
      return res.status(401).json({
        error: isActivationPending
          ? "Account activation required. Please open the setup link sent to your email."
          : "Account is deactivated",
      });
    }

    if (user.role === "visitor" && user.isVerified === false) {
      return res.status(403).json({
        success: false,
        error: "Your account is not yet verified",
        message:
          "Please verify your account using the OTP sent during registration before logging in.",
        requiresOtpVerification: true,
      });
    }

    await ensureSafePassAccountId(user);

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

    console.log(`Login successful for ${user.email}.`);

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
    const existingUser = await User.findById(req.user._id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const body = req.body || {};
    const updates = {};

    if (body.firstName !== undefined) updates.firstName = String(body.firstName || "").trim();
    if (body.lastName !== undefined) updates.lastName = String(body.lastName || "").trim();
    if (body.phone !== undefined) updates.phone = String(body.phone || "").trim();
    if (body.emergencyContact !== undefined) {
      updates.emergencyContact = String(body.emergencyContact || "").trim();
    }
    if (body.profilePhoto !== undefined) updates.profilePhoto = body.profilePhoto || null;

    if (body.email !== undefined) {
      const normalizedEmail = normalizeEmailValue(body.email);
      if (!normalizedEmail || !isValidEmailValue(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      const duplicateEmail = await User.findOne({
        _id: { $ne: existingUser._id },
        email: normalizedEmail,
      });

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "That email address is already used by another account.",
        });
      }

      updates.email = normalizedEmail;
    }

    if (body.username !== undefined) {
      const normalizedUsername = normalizeUsernameValue(body.username);
      if (!normalizedUsername) {
        return res.status(400).json({
          success: false,
          message: "Username cannot be empty.",
        });
      }

      const duplicateUsername = await User.findOne({
        _id: { $ne: existingUser._id },
        username: normalizedUsername,
      });

      if (duplicateUsername) {
        return res.status(409).json({
          success: false,
          message: "That username is already used by another account.",
        });
      }

      updates.username = normalizedUsername;
    }

    if (updates.firstName !== undefined && !updates.firstName) {
      return res.status(400).json({ success: false, message: "First name is required." });
    }

    if (updates.lastName !== undefined && !updates.lastName) {
      return res.status(400).json({ success: false, message: "Last name is required." });
    }

    const user = await User.findByIdAndUpdate(
      existingUser._id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");

    if (user?.role === "visitor") {
      const visitorUpdates = {};
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        visitorUpdates.fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      }
      if (updates.email !== undefined) visitorUpdates.email = user.email;
      if (updates.phone !== undefined && updates.phone) visitorUpdates.phoneNumber = updates.phone;

      if (Object.keys(visitorUpdates).length > 0) {
        let visitor = null;
        if (user.visitorId) visitor = await Visitor.findById(user.visitorId);
        if (!visitor) visitor = await Visitor.findOne({ email: existingUser.email }).sort({ registeredAt: -1 });
        if (visitor) {
          Object.assign(visitor, visitorUpdates);
          await visitor.save();
        }
      }
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
    res.json({
      success: true,
      message: "Use registration or password reset to continue.",
    });
  } catch (error) {
    console.error("❌ Check email error:", error);
    res.status(500).json({ error: "Failed to check email" });
  }
});

app.post("/api/auth/request-password-reset", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);

    if (!email || !isValidEmailValue(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const resetRateLimit = passwordResetRequestLimiter.hit({
      req,
      identifier: email,
    });
    if (!resetRateLimit.allowed) {
      return applyRateLimit(
        res,
        resetRateLimit,
        "Too many password reset requests. Please wait a few minutes before trying again.",
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      const otp = await createPasswordResetOtp(req, user);
      if (!otp.emailResult?.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send password reset code.",
        });
      }
      user.updatedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE,
        expiresIn: 600,
        otpExpiresAt: otp.expiresAt,
      });
    }

    const fallbackExpiry = new Date(Date.now() + 1000 * 60 * 10);

    res.json({
      success: true,
      message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE,
      expiresIn: 600,
      otpExpiresAt: fallbackExpiry,
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset code.",
    });
  }
});

app.post("/api/auth/verify-password-reset", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);
    const otpCode = normalizeOtpCode(req.body?.otpCode);

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({
        success: false,
        message: "OTP code must be exactly 6 digits.",
      });
    }

    const resetVerifyRateLimit = passwordResetVerifyLimiter.hit({
      req,
      identifier: email,
    });
    if (!resetVerifyRateLimit.allowed) {
      return applyRateLimit(
        res,
        resetVerifyRateLimit,
        "Too many verification attempts. Please request a new reset code and try again later.",
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: GENERIC_PASSWORD_RESET_VERIFY_MESSAGE,
      });
    }

    if (
      !user.passwordResetOtpHash ||
      !user.passwordResetExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: GENERIC_PASSWORD_RESET_VERIFY_MESSAGE,
      });
    }

    if (user.passwordResetExpiresAt <= new Date()) {
      clearPasswordResetState(user);
      await user.save();
      return res.status(400).json({
        success: false,
        message: GENERIC_PASSWORD_RESET_VERIFY_MESSAGE,
      });
    }

    if ((user.passwordResetAttempts || 0) >= 5) {
      clearPasswordResetState(user);
      await user.save();
      return res.status(400).json({
        success: false,
        message: GENERIC_PASSWORD_RESET_VERIFY_MESSAGE,
      });
    }

    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    if (otpHash !== user.passwordResetOtpHash) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: GENERIC_PASSWORD_RESET_VERIFY_MESSAGE,
      });
    }

    user.passwordResetAttempts = 0;
    user.passwordResetVerifiedAt = new Date();
    await user.save();

    res.json({
      success: true,
      verified: true,
      message: "Password reset code verified successfully.",
    });
  } catch (error) {
    console.error("Verify password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify password reset code.",
    });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);
    const newPassword = String(req.body?.newPassword || "");
    const resetToken = String(req.body?.resetToken || "").trim();

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const resetChangeRateLimit = passwordResetChangeLimiter.hit({
      req,
      identifier: email,
    });
    if (!resetChangeRateLimit.allowed) {
      return applyRateLimit(
        res,
        resetChangeRateLimit,
        "Too many password reset attempts. Please wait a few minutes before trying again.",
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please verify the reset code before changing your password.",
      });
    }

    if (!user.passwordResetExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No verified password reset request was found.",
      });
    }

    if (user.passwordResetExpiresAt <= new Date()) {
      clearPasswordResetState(user);
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Reset session expired. Please request a new code.",
      });
    }

    const resetTokenHash = resetToken
      ? crypto.createHash("sha256").update(resetToken).digest("hex")
      : "";
    const hasValidResetToken =
      resetTokenHash &&
      user.passwordResetTokenHash &&
      resetTokenHash === user.passwordResetTokenHash;

    if (!user.passwordResetVerifiedAt && !hasValidResetToken) {
      return res.status(400).json({
        success: false,
        message: "Please verify the reset code or use the secure reset link before changing your password.",
      });
    }

    user.password = newPassword;
    if (
      hasValidResetToken &&
      ["staff", "security", "guard"].includes(String(user.role || "").toLowerCase()) &&
      (user.status === "inactive" || user.isActive === false)
    ) {
      user.status = "active";
      user.isActive = true;
      user.isVerified = true;
      user.verifiedAt = new Date();
    }
    clearPasswordResetState(user);
    user.updatedAt = new Date();
    await user.save();

    await createSystemActivity({
      actorUser: user,
      relatedUser: user,
      activityType: "password_reset",
      status: "granted",
      location: "Login Screen",
      notes: `${user.email} completed a password reset via forgot password.`,
    });

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();

    if (!token) {
      return res.status(400).send("Missing verification token.");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send(
        "This verification request is invalid or expired. Please request a new OTP code.",
      );
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationTokenHash = "";
    user.verificationExpiresAt = null;
    if (user.status === "pending") {
      user.status = "active";
    }
    await user.save();

    console.log(`Email verified for ${user.email}`);

    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f7f5; color: #0f172a; padding: 40px; }
            .card { max-width: 520px; margin: 8vh auto; background: white; border-radius: 18px; padding: 32px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12); }
            h1 { color: #047857; margin-top: 0; }
            a { display: inline-block; margin-top: 18px; background: #047857; color: white; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Email verified</h1>
            <p>Your Sapphire SafePass account has been verified. You can now return to the app and log in.</p>
            <a href="${FRONTEND_URL}">Go to SafePass</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).send("Failed to verify email.");
  }
});

app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Missing verification token.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification request is invalid or expired. Please request a new OTP code.",
      });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationTokenHash = "";
    user.verificationExpiresAt = null;
    if (user.status === "pending") {
      user.status = "active";
    }
    await user.save();

    console.log(`Email verified for ${user.email}`);

    return res.json({
      success: true,
      message: "Email verified. You can now log in.",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify email API error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email.",
    });
  }
});

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email, role: "visitor" });

    if (!user) {
      return res.json({
        success: true,
        message: "A verification OTP has been sent if the account is eligible.",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "This account is already verified.",
      });
    }

    const otp = await createRegistrationOtp(user);
    if (!isOtpDeliveryUsable(otp.emailResult)) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend verification OTP.",
      });
    }
    await user.save();

    res.json({
      success: true,
      message:
        "A verification OTP has been sent if the account is eligible.",
      requiresOtpVerification: true,
      otpExpiresAt: otp.expiresAt,
      otpDeliveryMode: getOtpDeliveryMode(otp.emailResult),
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification OTP.",
    });
  }
});

app.post("/api/auth/verify-registration-otp", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);
    const otpCode = normalizeOtpCode(req.body?.otpCode);

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit OTP code.",
      });
    }

    const registrationVerifyRateLimit = registrationOtpVerifyLimiter.hit({
      req,
      identifier: email,
    });
    if (!registrationVerifyRateLimit.allowed) {
      return applyRateLimit(
        res,
        registrationVerifyRateLimit,
        "Too many OTP verification attempts. Please request a new code and try again later.",
      );
    }

    const user = await User.findOne({ email, role: "visitor" });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code. Please request a new code and try again.",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        verified: true,
        message: "This account is already verified.",
      });
    }

    if (!user.verificationOtpHash || !user.verificationOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP verification code was found. Please request a new code.",
      });
    }

    if (new Date(user.verificationOtpExpiresAt).getTime() < Date.now()) {
      user.verificationOtpHash = "";
      user.verificationOtpExpiresAt = null;
      user.verificationOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new code.",
      });
    }

    if ((user.verificationOtpAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect OTP attempts. Please request a new code.",
      });
    }

    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    if (otpHash !== user.verificationOtpHash) {
      user.verificationOtpAttempts = (user.verificationOtpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${Math.max(0, 5 - user.verificationOtpAttempts)} attempts remaining.`,
      });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationOtpHash = "";
    user.verificationOtpExpiresAt = null;
    user.verificationOtpAttempts = 0;
    user.verificationTokenHash = "";
    user.verificationExpiresAt = null;
    if (user.status === "pending") {
      user.status = "active";
    }
    await user.save();

    await createRoleNotification({
      title: "Visitor Account Verified",
      message: `${getFullName(user)} verified their visitor account using OTP.`,
      targetRole: "admin",
      relatedUser: user._id,
      type: "visitor",
      severity: "low",
      metadata: {
        activityType: "visitor_account_otp_verified",
        email: user.email,
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      verified: true,
      message: "OTP verified. You can now log in.",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
});

app.post("/api/auth/resend-registration-otp", async (req, res) => {
  try {
    const email = normalizeEmailValue(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const registrationRequestRateLimit = registrationOtpRequestLimiter.hit({
      req,
      identifier: email,
    });
    if (!registrationRequestRateLimit.allowed) {
      return applyRateLimit(
        res,
        registrationRequestRateLimit,
        "Too many OTP requests. Please wait a few minutes before requesting a new code.",
      );
    }

    const user = await User.findOne({ email, role: "visitor" });
    if (!user) {
      return res.json({
        success: true,
        message: "A new OTP code has been sent if the account is eligible.",
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 10),
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        verified: true,
        message: "This account is already verified.",
      });
    }

    const otp = await createRegistrationOtp(user);
    if (!isOtpDeliveryUsable(otp.emailResult)) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification OTP. Please try again.",
      });
    }
    await user.save();

    res.json({
      success: true,
      message: "A new OTP code has been sent if the account is eligible.",
      otpExpiresAt: otp.expiresAt,
      otpDeliveryMode: getOtpDeliveryMode(otp.emailResult),
    });
  } catch (error) {
    console.error("Resend registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
    });
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
    const normalizedPhone = normalizePhoneValue(visitorData.phone || visitorData.phoneNumber);
    const password = String(visitorData.password || "");
    const dataPrivacyAccepted = visitorData.privacyAccepted === true;
    const dataPrivacyAcceptedAt = visitorData.privacyAcceptedAt
      ? new Date(visitorData.privacyAcceptedAt)
      : new Date();

    if (!normalizedFullName || !normalizedEmail || !normalizedUsername || !normalizedPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, username, contact number, and password are required.",
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

    if (!isValidPhoneValue(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: PHONE_VALIDATION_MESSAGE,
        field: "phone",
      });
    }

    if (!dataPrivacyAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "By registering, you must agree that your personal data will be collected and used for visitor monitoring and security purposes.",
      });
    }

    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    const existingUsernameUser = await User.findOne({ username: normalizedUsername });
    if (existingUsernameUser) {
      return res.status(400).json({
        success: false,
        field: "username",
        message: "That username is already taken. Please choose another username.",
      });
    }

    const existingVisitor = await Visitor.findOne({ email: normalizedEmail }).sort({
      registeredAt: -1,
    });
    const nameParts = normalizedFullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() || "Visitor";
    const lastName = nameParts.join(" ") || "User";

    const user = new User();

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = normalizedUsername;
    user.email = normalizedEmail;
    user.password = password;
    user.phone = normalizedPhone;
    user.role = "visitor";
    user.status = "active";
    user.isVerified = false;
    user.nfcCardId = await generateSafePassAccountId(user.createdAt || new Date());
    user.dataPrivacyAccepted = true;
    user.dataPrivacyAcceptedAt = dataPrivacyAcceptedAt;
    user.isActive = true;
    user.visitorId = existingVisitor?._id || user.visitorId || null;

    const otp = await createRegistrationOtp(user);
    if (!isOtpDeliveryUsable(otp.emailResult)) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification OTP. Please try again.",
      });
    }
    await user.save();
    console.log(
      "Visitor account created, waiting for OTP verification:",
      normalizedEmail
    );

    await createSystemActivity({
      actorUser: user,
      relatedVisitor: existingVisitor?._id ? existingVisitor : null,
      relatedUser: user,
      activityType: "visitor_account_registration",
      status: "pending",
      location: "Visitor Registration",
      notes: `${normalizedFullName} created a visitor account and must verify OTP before login.`,
      metadata: {
        username: user.username,
        email: user.email,
        requiresOtpVerification: true,
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
      status: "pending",
      relatedUser: user._id,
      relatedVisitor: existingVisitor?._id || null,
      notes: "Visitor account created and waiting for OTP verification",
    });

    await createRoleNotification({
      title: "New Visitor Account Registered",
      message: `New visitor account registered: ${normalizedFullName}`,
      targetRole: "admin",
      relatedVisitor: existingVisitor?._id || null,
      relatedUser: user._id,
      type: "visitor",
      severity: "low",
      metadata: {
        activityType: "visitor_account_registration",
        userId: user._id,
        email: user.email,
        fullName: normalizedFullName,
        isVerified: false,
        requiresOtpVerification: true,
        timestamp: new Date().toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Visitor account created. Please enter the OTP code sent to your email before logging in.",
      requiresOtpVerification: true,
      otpExpiresAt: otp.expiresAt,
      otpDeliveryMode: getOtpDeliveryMode(otp.emailResult),
      user: {
        _id: user._id,
        fullName: normalizedFullName,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        nfcCardId: user.nfcCardId,
        isVerified: user.isVerified,
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

// Get pending visitors (admin only)
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

    const visitorsWithSafePassIds = await attachSafePassIdsToVisitors(visitors);

    res.json({
      success: true,
      visitors: visitorsWithSafePassIds,
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
      .limit(parseInt(limit))
      .populate("reports.reportedBy", "firstName lastName email role department");

    const total = await Visitor.countDocuments(query);
    const visitorsWithSafePassIds = await attachSafePassIdsToVisitors(visitors);

    res.json({
      success: true,
      visitors: visitorsWithSafePassIds,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all visitors error:", error);
    res.status(500).json({ success: false, message: "Failed to get visitors" });
  }
});

app.put("/api/admin/visitors/:id/appointment-office", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const office = String(
      req.body?.office ||
      req.body?.appointmentDepartment ||
      req.body?.assignedOffice ||
      "",
    ).trim();

    if (!office) {
      return res.status(400).json({
        success: false,
        message: "Office or department is required.",
      });
    }

    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    const nextVisitDate = req.body?.visitDate ? new Date(req.body.visitDate) : null;
    if (req.body?.visitDate && Number.isNaN(nextVisitDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid appointment date.",
      });
    }

    let nextVisitTime = null;
    if (req.body?.visitTime) {
      const timeValue = String(req.body.visitTime).trim();
      const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        const hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2]);
        if (hours > 23 || minutes > 59) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid appointment time.",
          });
        }
        const baseDate = nextVisitDate || new Date(visitor.visitDate || Date.now());
        nextVisitTime = new Date(baseDate);
        nextVisitTime.setHours(hours, minutes, 0, 0);
      } else {
        nextVisitTime = new Date(timeValue);
      }

      if (Number.isNaN(nextVisitTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid appointment time.",
        });
      }
    }

    const previousOffice = visitor.appointmentDepartment || visitor.assignedOffice || visitor.host || "";
    const previousVisitDate = visitor.visitDate;
    const previousVisitTime = visitor.visitTime;
    visitor.appointmentDepartment = office;
    visitor.assignedOffice = office;
    visitor.host = office;
    if (nextVisitDate) visitor.visitDate = nextVisitDate;
    if (nextVisitTime) visitor.visitTime = nextVisitTime;
    visitor.updatedAt = new Date();
    await visitor.save();

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      activityType: "admin_updated_appointment_request",
      status: "granted",
      location: office,
      notes: `${getFullName(req.user)} updated ${visitor.fullName}'s appointment request details.`,
      metadata: {
        previousOffice,
        office,
        previousVisitDate,
        previousVisitTime,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    const [visitorPayload] = await attachSafePassIdsToVisitors([visitor]);
    res.json({
      success: true,
      message: "Appointment request updated successfully.",
      visitor: visitorPayload,
    });
  } catch (error) {
    console.error("Update appointment request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment request.",
    });
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

    // Resolve the visitor's permanent SafePass account ID.
    let realNfcCardId = null;

    // Generate temporary password if not already set
    const tempPassword =
      visitor.temporaryPassword ||
      `VIS${Math.random().toString(36).slice(-8).toUpperCase()}`;

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
    realNfcCardId =
      user
        ? await activateVisitorSafePassCardForUser(user, visitor)
        : await generateSafePassAccountId(new Date());
    console.log("SafePass Account ID:", realNfcCardId);

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
        accessPermissions: {
          canAccess: [],
          restrictedAreas: [],
          timeRestrictions: [],
          cardActive: true,
        },
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
      user.accessPermissions = {
        canAccess: user.accessPermissions?.canAccess || [],
        restrictedAreas: user.accessPermissions?.restrictedAreas || [],
        timeRestrictions: user.accessPermissions?.timeRestrictions || [],
        cardActive: true,
      };
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
    console.log(`Visitor approved successfully for ${visitor.email}.`);

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
        nfcCardId: user.nfcCardId,
        safePassId: user.nfcCardId,
        cardActive: user.accessPermissions?.cardActive !== false,
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
      phone,
      department,
      position,
      employeeId,
    } = req.body;

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    let normalizedEmail = normalizeEmailValue(email);
    const normalizedUsername = normalizeUsernameValue(username);
    const normalizedPhone = normalizePhoneValue(phone);
    const normalizedDepartment = String(department || "").trim();
    const normalizedPosition = String(position || "Staff Member").trim();
    let normalizedEmployeeId = String(employeeId || "").trim();

    if (!normalizedEmail) {
      normalizedEmail = await generateUniqueAccountEmail({
        firstName: normalizedFirstName,
        role: "staff",
        department: normalizedDepartment,
        position: normalizedPosition,
      });
    }

    if (!normalizedEmployeeId) {
      normalizedEmployeeId = await generateUniqueEmployeeId("staff");
    }

    const resolvedUsername = normalizedUsername || normalizeUsernameValue(normalizedEmployeeId || normalizedEmail.split("@")[0]);

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmail ||
      !normalizedEmployeeId ||
      !normalizedDepartment
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["firstName", "lastName", "employeeId", "email", "department"],
      });
    }

    if (!isValidEmailValue(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        field: "email",
      });
    }

    if (normalizedPhone && !isValidPhoneValue(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: PHONE_VALIDATION_MESSAGE,
        field: "phone",
      });
    }

    const duplicateChecks = [
      { email: normalizedEmail },
      { username: resolvedUsername },
      { employeeId: normalizedEmployeeId },
    ];

    const existingUser = await User.findOne({ $or: duplicateChecks });
    if (existingUser) {
      const duplicateField =
        existingUser.email === normalizedEmail
          ? "email"
          : existingUser.username === resolvedUsername
            ? "username"
            : existingUser.employeeId === normalizedEmployeeId
              ? "employeeId"
            : "email";

      return res.status(400).json({
        success: false,
        message:
          duplicateField === "username"
            ? "Username already registered"
            : duplicateField === "employeeId"
              ? "Staff/Security number already registered"
            : "Email already registered",
        field: duplicateField,
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const setupToken = createPasswordSetupToken(48);
    const setupLink = `${FRONTEND_URL}?resetEmail=${encodeURIComponent(normalizedEmail)}&resetToken=${encodeURIComponent(setupToken.token)}&activation=1`;

    const nfcCardId = `SAFEPASS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const user = new User({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      username: resolvedUsername,
      email: normalizedEmail,
      password: temporaryPassword,
      phone: normalizedPhone || "",
      role: "staff",
      status: "inactive",
      isActive: false,
      isVerified: false,
      employeeId: normalizedEmployeeId,
      department: normalizedDepartment,
      position: normalizedPosition,
      nfcCardId,
      passwordResetTokenHash: setupToken.tokenHash,
      passwordResetExpiresAt: setupToken.expiresAt,
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

    const credentialEmail = await sendEmail(
      user.email,
      "Activate Your Sapphire SafePass Staff Account",
      [
        `Good day, ${user.firstName} ${user.lastName}.`,
        "",
        "An administrator created your Sapphire SafePass staff account.",
        "",
        "Account details:",
        `Name: ${user.firstName} ${user.lastName}`,
        "Assigned role: Staff",
        `Login email: ${user.email}`,
        `Staff/Security number: ${user.employeeId}`,
        `Department: ${user.department}`,
        "",
        "To activate your account, open the secure setup link below and create your password:",
        setupLink,
        "",
        "This secure link expires in 48 hours. Your account remains inactive until you complete this step.",
        "If you did not expect this account, please ignore this email and contact the SafePass administrator.",
        "",
        getSupportEmailSignature(),
      ].join("\n"),
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    const credentialEmailDelivered = Boolean(credentialEmail?.delivered);

    res.status(201).json({
      success: true,
      message: credentialEmailDelivered
        ? "Staff account created successfully and credentials were emailed"
        : credentialEmail?.simulated
          ? "Staff account created successfully and credential email was simulated"
        : "Staff account created, but credential email could not be sent",
      user: userResponse,
      emailDelivery: {
        success: Boolean(credentialEmail?.success),
        delivered: credentialEmailDelivered,
        simulated: Boolean(credentialEmail?.simulated),
        error: credentialEmail?.error || "",
        setupLink: credentialEmail?.simulated ? setupLink : undefined,
      },
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
              ? "Staff/Security number already registered"
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

    const { firstName, lastName, email, phone, shift, position, employeeId } = req.body;

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    let normalizedEmail = normalizeEmailValue(email);
    const normalizedPhone = normalizePhoneValue(phone);
    const normalizedPosition = String(position || "Security Guard").trim();
    let normalizedEmployeeId = String(employeeId || "").trim();

    if (!normalizedEmail) {
      normalizedEmail = await generateUniqueAccountEmail({
        firstName: normalizedFirstName,
        role: "security",
        department: "Security Department",
        position: normalizedPosition,
      });
    }

    if (!normalizedEmployeeId) {
      normalizedEmployeeId = await generateUniqueEmployeeId("security");
    }

    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !normalizedEmployeeId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["firstName", "lastName", "employeeId", "email"],
      });
    }

    if (!isValidEmailValue(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format", field: "email" });
    }

    if (normalizedPhone && !isValidPhoneValue(normalizedPhone)) {
      return res.status(400).json({ success: false, message: PHONE_VALIDATION_MESSAGE, field: "phone" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { employeeId: normalizedEmployeeId }],
    });
    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? "email" : "employeeId";
      return res.status(400).json({
        success: false,
        message: field === "employeeId" ? "Staff/Security number already registered" : "Email already registered",
        field,
      });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nfcCardId = `SAFEPASS-${timestamp}-${randomString}`;
    const temporaryPassword = generateTemporaryPassword();
    const setupToken = createPasswordSetupToken(48);
    const setupLink = `${FRONTEND_URL}?resetEmail=${encodeURIComponent(normalizedEmail)}&resetToken=${encodeURIComponent(setupToken.token)}&activation=1`;

    const user = new User({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      username: normalizeUsernameValue(normalizedEmployeeId || normalizedEmail.split("@")[0]),
      email: normalizedEmail,
      password: temporaryPassword,
      phone: normalizedPhone || "",
      role: "guard",
      nfcCardId,
      employeeId: normalizedEmployeeId,
      position: normalizedPosition,
      shift: String(shift || "").trim(),
      department: "Security Department",
      status: "inactive",
      isActive: false,
      isVerified: false,
      passwordResetTokenHash: setupToken.tokenHash,
      passwordResetExpiresAt: setupToken.expiresAt,
    });

    await user.save();

    const credentialEmail = await sendEmail(
      user.email,
      "Activate Your Sapphire SafePass Security Account",
      [
        `Good day, ${user.firstName} ${user.lastName}.`,
        "",
        "An administrator created your Sapphire SafePass security account.",
        "",
        "Account details:",
        `Name: ${user.firstName} ${user.lastName}`,
        "Assigned role: Security",
        `Login email: ${user.email}`,
        `Staff/Security number: ${user.employeeId}`,
        `Position: ${user.position}`,
        `Shift: ${user.shift || "To be assigned"}`,
        "",
        "To activate your account, open the secure setup link below and create your password:",
        setupLink,
        "",
        "This secure link expires in 48 hours. Your account remains inactive until you complete this step.",
        "If you did not expect this account, please ignore this email and contact the SafePass administrator.",
        "",
        getSupportEmailSignature(),
      ].join("\n"),
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    const credentialEmailDelivered = Boolean(credentialEmail?.delivered);
    res.status(201).json({
      success: true,
      message: credentialEmailDelivered
        ? "Security account created successfully and activation email was sent"
        : credentialEmail?.simulated
          ? "Security account created successfully and activation email was simulated"
          : "Security account created, but activation email could not be sent",
      user: userResponse,
      emailDelivery: {
        success: Boolean(credentialEmail?.success),
        delivered: credentialEmailDelivered,
        simulated: Boolean(credentialEmail?.simulated),
        error: credentialEmail?.error || "",
        setupLink: credentialEmail?.simulated ? setupLink : undefined,
      },
    });
  } catch (error) {
    console.error("Create security guard error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: duplicateField === "employeeId"
          ? "Staff/Security number already registered"
          : "Email already registered",
        field: duplicateField,
      });
    }

    res.status(500).json({ success: false, message: "Failed to create security guard", error: error.message });
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

  try {
    const { phoneNumber, method } = req.body;
    const cleanPhone = normalizePhoneForOtp(phoneNumber);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Philippine mobile number.",
      });
    }

    const phoneRequestRateLimit = phoneOtpRequestLimiter.hit({
      req,
      identifier: cleanPhone,
    });
    if (!phoneRequestRateLimit.allowed) {
      return applyRateLimit(
        res,
        phoneRequestRateLimit,
        "Too many OTP requests. Please wait a few minutes before requesting another code.",
      );
    }

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (5 minutes)
    otpStore.set(cleanPhone, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Generate a temporary token
    const tempToken =
      "otp_" + Math.random().toString(36).substring(2) + Date.now();
    let deliveryProvider = getPhoneOtpDeliveryProvider();

    if (deliveryProvider === "semaphore") {
      try {
        await sendSemaphoreOtp({ phoneNumber: cleanPhone, otpCode });
      } catch (smsError) {
        console.error("Semaphore OTP SMS error:", smsError?.data || smsError);
        if (shouldFallbackPhoneOtpToBackendLog()) {
          deliveryProvider = "backend_log";
          logPhoneOtpBackendFallback({
            phoneNumber: cleanPhone,
            otpCode,
            method: method || "sms",
            reason: "Semaphore account is not ready for SMS sending.",
          });
        } else {
          otpStore.delete(cleanPhone);
          return res.status(502).json({
            success: false,
            message:
              "Unable to send SMS OTP right now. Please check Semaphore credits, API key, and active sender name.",
            deliveryMode: "semaphore",
          });
        }
      }
    }

    console.log(`Phone OTP generated for ${cleanPhone}.`);
    logPhoneOtpForDemo({
      phoneNumber: cleanPhone,
      otpCode,
      method: method || "sms",
    });
    logSensitiveDebug(`Phone OTP for ${cleanPhone}: ${otpCode}`);

    res.json({
      success: true,
      tempToken: tempToken,
      expiresIn: 300,
      method: method || "sms",
      phoneNumber: cleanPhone,
      deliveryMode: deliveryProvider,
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

  try {
    const { phoneNumber, otpCode, tempToken } = req.body;
    const cleanPhone = normalizePhoneForOtp(phoneNumber);
    const cleanOtpCode = normalizeOtpCode(otpCode);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Please enter a valid Philippine mobile number.",
      });
    }

    if (!/^\d{6}$/.test(cleanOtpCode)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Please enter the 6-digit OTP code.",
      });
    }

    const phoneVerifyRateLimit = phoneOtpVerifyLimiter.hit({
      req,
      identifier: cleanPhone,
    });
    if (!phoneVerifyRateLimit.allowed) {
      return applyRateLimit(
        res,
        phoneVerifyRateLimit,
        "Too many verification attempts. Please request a new code and try again later.",
      );
    }

    const storedData = otpStore.get(cleanPhone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    if (storedData.code === cleanOtpCode) {
      otpStore.delete(cleanPhone);
      return res.json({
        success: true,
        verified: true,
        message: "OTP verified successfully",
      });
    } else {
      storedData.attempts += 1;
      otpStore.set(cleanPhone, storedData);
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
  if (!sensitiveDebugLoggingEnabled) {
    return res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
  const { phone } = req.params;
  const cleanPhone = normalizePhoneForOtp(phone);
  const storedData = otpStore.get(cleanPhone);
  if (storedData) {
    res.json({
      phone: cleanPhone,
      otp: storedData.code,
      expiresAt: new Date(storedData.expiresAt),
      attempts: storedData.attempts,
    });
  } else {
    res.json({ phone: cleanPhone, otp: null, message: "No OTP found for this number" });
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
      device: {
        locationTap: "POST /api/device/location-tap",
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

    if (!isVisitorOwner(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only check in using your own visitor appointment.",
      });
    }

    if (!isUserSafePassCardActive(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Your SafePass card is not active. Please contact admin or security.",
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
    visitor.updateCurrentLocation(getVisitorCheckInLocation(visitor, checkInSource), {
      deviceId: checkInSource === "virtual_nfc_card" ? "visitor-app" : "mobile-app",
    });
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
      checkOutSource === "virtual_nfc_card"
        ? "virtual NFC card"
        : checkOutSource === "visitor_dashboard"
          ? "visitor dashboard"
          : "mobile app";

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (!isVisitorOwner(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only check out using your own visitor appointment.",
      });
    }

    if (!isUserSafePassCardActive(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Your SafePass card is not active. Please contact admin or security.",
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
      location:
        checkOutSource === "virtual_nfc_card"
          ? "Virtual NFC Card"
          : checkOutSource === "visitor_dashboard"
            ? "Visitor Dashboard"
            : "Mobile App",
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

    const requesterRole = String(req.user.role || "").toLowerCase();
    const canReadLogs =
      ["admin", "security", "guard", "staff"].includes(requesterRole) ||
      isVisitorOwner(req.user, visitor);

    if (!canReadLogs) {
      return res.status(403).json({
        success: false,
        message: "You cannot view another visitor's access logs.",
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

// Appointment request form options
app.get("/api/appointments/options", authMiddleware, async (req, res) => {
  try {
    const options = await getAppointmentOptions({ activeOnly: true });
    res.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error("Get appointment options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load appointment options.",
    });
  }
});

// Visitor appointment ID OCR validation
app.post("/api/appointments/id-ocr/validate", authMiddleware, async (req, res) => {
  try {
    const { idType, imageUri } = req.body || {};
    const normalizedIdType = String(idType || "").trim();
    const normalizedImageUri = String(imageUri || "").trim();

    if (!normalizedIdType) {
      return res.status(400).json({
        success: false,
        isValid: false,
        status: "missing_id_type",
        confidence: 0,
        message: "Choose the valid ID type before scanning.",
      });
    }

    if (!normalizedImageUri) {
      return res.status(400).json({
        success: false,
        isValid: false,
        status: "missing_image",
        confidence: 0,
        message: "Upload a clear ID image before scanning.",
      });
    }

    if (
      !normalizedImageUri.startsWith("data:image/") &&
      !normalizedImageUri.startsWith("http://") &&
      !normalizedImageUri.startsWith("https://")
    ) {
      return res.status(400).json({
        success: false,
        isValid: false,
        status: "unsupported_image_source",
        confidence: 0,
        message: "Please upload the ID photo from your device before scanning.",
      });
    }

    const ocrResult = await callOcrSpace({ imageUri: normalizedImageUri });
    if (!ocrResult.success) {
      const status =
        ocrResult.skipped && !REQUIRE_OCR_ID_VALIDATION
          ? "ocr_validation_skipped"
          : "ocr_validation_error";
      const responseStatus = ocrResult.skipped && !REQUIRE_OCR_ID_VALIDATION ? 200 : 502;
      return res.status(responseStatus).json({
        success: !REQUIRE_OCR_ID_VALIDATION && ocrResult.skipped,
        isValid: !REQUIRE_OCR_ID_VALIDATION && ocrResult.skipped,
        status,
        confidence: 0,
        message:
          ocrResult.message ||
          "OCR verification is unavailable right now. Please try again later.",
        checkedAt: new Date().toISOString(),
      });
    }

    const match = scoreOcrIdMatch({
      idType: normalizedIdType,
      rawText: ocrResult.text,
    });
    const isValid = match.hasMeaningfulText && match.hasExpectedMatch && !match.hasConflict;
    const hasReadableButWrongType =
      match.hasMeaningfulText && !match.hasExpectedMatch && match.conflictingMatches.length > 0;

    return res.json({
      success: true,
      isValid,
      status: isValid ? "ocr_validation_passed" : "ocr_validation_failed",
      confidence: match.confidence,
      idType: normalizedIdType,
      checkedAt: new Date().toISOString(),
      message: isValid
        ? `${normalizedIdType} passed OCR verification. Staff or security will still complete the final review.`
        : hasReadableButWrongType
          ? `The uploaded ID appears to be a different ID type. Please upload a ${normalizedIdType}.`
          : "OCR could not confirm that this photo matches the selected ID type. Please upload a brighter, clearer front photo.",
      checks: [
        {
          key: "ocr_text",
          passed: match.hasMeaningfulText,
          label: "Readable ID text detected",
        },
        {
          key: "id_type_match",
          passed: match.hasExpectedMatch,
          label: "Detected ID type matches selection",
        },
        {
          key: "no_conflicting_id_type",
          passed: !match.hasConflict,
          label: "No conflicting ID type detected",
        },
      ],
      details: {
        matchedKeywords: match.matchedKeywords,
        conflictingMatches: match.conflictingMatches,
      },
    });
  } catch (error) {
    console.error("OCR ID validation error:", error);
    res.status(500).json({
      success: false,
      isValid: false,
      status: "ocr_validation_error",
      confidence: 0,
      message: "Failed to validate the ID image. Please try again.",
    });
  }
});

app.get("/api/admin/appointments/options", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const options = await getAppointmentOptions();
    res.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error("Get admin appointment options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load appointment management options.",
    });
  }
});

app.put("/api/admin/appointments/options", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const options = sanitizeAppointmentOptions(req.body?.options || req.body || {});
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

    await createSystemActivity({
      actorUser: req.user,
      activityType: "admin_updated_appointment_options",
      status: "granted",
      location: "Appointment Management",
      notes: "Appointment request form options updated.",
      metadata: {
        officeCount: options.offices.length,
        purposeCount: options.purposes.length,
        timeSlotCount: options.timeSlots.length,
      },
    });

    res.json({
      success: true,
      message: "Appointment options updated successfully.",
      options,
    });
  } catch (error) {
    console.error("Update appointment options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment management options.",
    });
  }
});

// Visitor appointment slot availability
app.get("/api/appointments/availability", authMiddleware, async (req, res) => {
  try {
    const { date, department, departments } = req.query || {};
    const requestedDepartments = [
      ...new Set(
        String(departments || department || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
    const activeAppointmentOptions = await getAppointmentOptions({ activeOnly: true });

    if (!date || !requestedDepartments.length) {
      return res.status(400).json({
        success: false,
        message: "Date and office or department are required.",
      });
    }

    const enabledOfficeLabels = activeAppointmentOptions.offices.map((option) => option.label);
    const invalidDepartment = requestedDepartments.find(
      (requestedDepartment) => !isAllowedOption(requestedDepartment, enabledOfficeLabels),
    );
    if (invalidDepartment) {
      return res.status(400).json({
        success: false,
        message: "Please select an enabled office to visit.",
      });
    }

    const staffRoutes = [];
    for (const requestedDepartment of requestedDepartments) {
      const routedStaff = await User.findOne({
        role: "staff",
        isActive: true,
        status: "active",
        department: getStaffDepartmentQuery(requestedDepartment),
      }).sort({ lastLogin: -1, createdAt: 1 });

      if (!routedStaff) {
        return res.json({
          success: true,
          limit: APPOINTMENT_SLOT_LIMIT,
          department: formatDepartmentLabel(requestedDepartment),
          departments: requestedDepartments.map(formatDepartmentLabel),
          assignedStaff: null,
          slots: [],
          message: `No active staff account is assigned to ${requestedDepartment}.`,
        });
      }

      staffRoutes.push({ department: requestedDepartment, routedStaff });
    }


    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid appointment date.",
      });
    }

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDay < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past.",
      });
    }

    if (!isAppointmentServiceDay(selectedDay)) {
      return res.status(400).json({
        success: false,
        message: "Appointments are only available from Monday to Saturday.",
      });
    }

    const slots = [];
    for (const configuredSlot of activeAppointmentOptions.timeSlots) {
      const hour = Number(configuredSlot.hour);
      const minute = Number(configuredSlot.minute);
      if (!Number.isInteger(hour) || !Number.isInteger(minute)) continue;
      const slotLimit = getAppointmentSlotLimit(configuredSlot);

      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);
      const routeCounts = await Promise.all(
        staffRoutes.map(async ({ department: routedDepartment, routedStaff }, routeIndex) => {
          const count = await countStaffAppointmentsForSlot({
            assignedStaff: routedStaff._id,
            visitDate: selectedDate,
            visitTime: slotTime,
          });
          const selectedOfficeLoadForStaff = staffRoutes.filter((route, compareIndex) =>
            compareIndex <= routeIndex && isSameObjectId(route.routedStaff._id, routedStaff._id),
          ).length;
          const effectiveCount = count + selectedOfficeLoadForStaff - 1;
          return {
            department: formatDepartmentLabel(routedDepartment),
            assignedStaff: {
              id: routedStaff._id,
              name: getFullName(routedStaff),
            },
            count: effectiveCount,
            limit: slotLimit,
            available: Math.max(slotLimit - effectiveCount, 0),
            isFull: effectiveCount >= slotLimit,
          };
        }),
      );
      const maxCount = Math.max(...routeCounts.map((route) => route.count), 0);
      const minAvailable = Math.min(...routeCounts.map((route) => route.available));

      slots.push({
        value: slotTime.toISOString(),
        label: configuredSlot.label,
        hour,
        minute,
        count: maxCount,
        limit: slotLimit,
        capacity: slotLimit,
        available: Math.max(minAvailable, 0),
        isFull: routeCounts.some((route) => route.isFull),
        departments: routeCounts,
      });
    }

    res.json({
      success: true,
      limit: Math.max(...activeAppointmentOptions.timeSlots.map(getAppointmentSlotLimit), APPOINTMENT_SLOT_LIMIT),
      department: requestedDepartments.map(formatDepartmentLabel).join(", "),
      departments: requestedDepartments.map(formatDepartmentLabel),
      assignedStaff:
        staffRoutes.length === 1
          ? {
              id: staffRoutes[0].routedStaff._id,
              name: getFullName(staffRoutes[0].routedStaff),
            }
          : {
              id: "multiple",
              name: `${staffRoutes.length} staff offices`,
            },
      slots,
    });
  } catch (error) {
    console.error("Get appointment availability error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load appointment availability.",
    });
  }
});

// Visitor appointment request / reappointment
app.put("/api/visitors/:userId/visit", authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user.role || "").toLowerCase();
    if (requesterRole !== "visitor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only visitors can create appointment requests.",
      });
    }

    if (requesterRole === "visitor" && !isSameObjectId(req.user._id, req.params.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only request appointments for your own account.",
      });
    }

    const requestedUserId =
      requesterRole === "visitor" ? req.user._id : req.params.userId;
    const {
      visitDate,
      preferredDate,
      visitTime,
      preferredTime,
      purposeOfVisit,
      purposeCategory,
      customPurposeOfVisit,
      department,
      departments,
      officeToVisit,
      assignedOffice,
      appointmentDepartment,
      idType,
      idNumber,
      idImage,
      idVerification,
      dataPrivacyAccepted,
      dataPrivacyAcceptedAt,
    } = req.body || {};

    const finalVisitDate = visitDate || preferredDate;
    const finalVisitTime = visitTime || preferredTime;
    const normalizedPurposeCategory = String(purposeCategory || "").trim();
    const normalizedCustomPurpose = String(customPurposeOfVisit || "").trim();
    const activeAppointmentOptions = await getAppointmentOptions({ activeOnly: true });
    const requestedDepartments = [
      ...new Set(
        (Array.isArray(departments)
          ? departments
          : String(
              appointmentDepartment || department || officeToVisit || assignedOffice || "",
            ).split(",")
        )
          .map((item) => String(item || "").trim())
          .filter(Boolean),
      ),
    ];
    const requestedDepartment = requestedDepartments[0] || "";
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

    if (!isAllowedOption(normalizedPurposeCategory, activeAppointmentOptions.purposes.map((option) => option.label))) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid purpose of visit.",
      });
    }

    if (normalizedPurposeCategory === "Other" && !normalizedCustomPurpose) {
      return res.status(400).json({
        success: false,
        message: "Please enter your custom purpose of visit.",
      });
    }

    if (!requestedDepartments.length) {
      return res.status(400).json({
        success: false,
        message: "Office or department is required for this appointment.",
      });
    }

    const enabledOfficeLabels = activeAppointmentOptions.offices.map((option) => option.label);
    const invalidDepartment = requestedDepartments.find(
      (departmentLabel) => !isAllowedOption(departmentLabel, enabledOfficeLabels),
    );
    if (invalidDepartment) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid office to visit.",
      });
    }

    const appointmentDateTime = getCombinedAppointmentDateTime(finalVisitDate, finalVisitTime);
    if (!appointmentDateTime) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid appointment date and time.",
      });
    }

    const selectedConfiguredSlot = findAppointmentConfiguredSlot(activeAppointmentOptions.timeSlots, appointmentDateTime);
    if (!selectedConfiguredSlot) {
      return res.status(400).json({
        success: false,
        message: "Please select an enabled appointment time slot.",
      });
    }
    const selectedSlotLimit = getAppointmentSlotLimit(selectedConfiguredSlot);

    const minimumScheduleTime = new Date(Date.now() - 60 * 1000);
    if (appointmentDateTime < minimumScheduleTime) {
      return res.status(400).json({
        success: false,
        message: "Appointment schedule cannot be in the past.",
      });
    }

    if (!isAppointmentServiceDay(finalVisitDate)) {
      return res.status(400).json({
        success: false,
        message: "Appointments are only available from Monday to Saturday.",
      });
    }

    const normalizedIdType = String(idType || idNumber || "").trim();
    const normalizedIdImage = String(idImage || "").trim();

    if (!normalizedIdType) {
      return res.status(400).json({
        success: false,
        message: "Please choose which valid ID you will present for appointment verification.",
      });
    }

    if (!normalizedIdImage) {
      return res.status(400).json({
        success: false,
        message: "A clear valid ID picture is required for appointment verification.",
      });
    }

    if (dataPrivacyAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "Please confirm the data privacy agreement before submitting.",
      });
    }

    if (!isAllowedOption(normalizedIdType, APPOINTMENT_ID_TYPE_OPTIONS)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid ID type from the list.",
      });
    }

    let idReview = reviewAppointmentIdImage({
      idType: normalizedIdType,
      idImage: normalizedIdImage,
      idVerification,
    });

    if (!idReview.isAccepted) {
      return res.status(400).json({
        success: false,
        code: "ID_PRECHECK_FAILED",
        idValidationStatus: idReview.status,
        message: idReview.message,
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

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Please verify your visitor account with OTP before requesting an appointment.",
        requiresOtpVerification: true,
      });
    }

    if (String(user.status).toLowerCase() !== "active") {
      return res.status(400).json({
        success: false,
        message: "Your visitor account must be active before requesting another appointment.",
      });
    }

    const visitorFullName = `${user.firstName} ${user.lastName}`.trim();
    const staffRoutes = [];
    for (const departmentLabel of requestedDepartments) {
      const routedStaff = await User.findOne({
        role: "staff",
        isActive: true,
        status: "active",
        department: getStaffDepartmentQuery(departmentLabel),
      }).sort({ lastLogin: -1, createdAt: 1 });

      if (!routedStaff) {
        return res.status(400).json({
          success: false,
          message: `No active staff account is assigned to ${departmentLabel}. Please choose another office or contact admin.`,
        });
      }

      const slotCount = await countStaffAppointmentsForSlot({
        assignedStaff: routedStaff._id,
        visitDate: finalVisitDate,
        visitTime: finalVisitTime,
      });

      const plannedForStaff = staffRoutes.filter((route) =>
        isSameObjectId(route.routedStaff._id, routedStaff._id),
      ).length;

      if (slotCount + plannedForStaff >= selectedSlotLimit) {
        return res.status(409).json({
          success: false,
          code: "APPOINTMENT_SLOT_FULL",
          message: `${formatDepartmentLabel(departmentLabel)} is already full for that time. Slots are full please select another time or date.`,
          limit: selectedSlotLimit,
          currentCount: slotCount + plannedForStaff,
        });
      }

      staffRoutes.push({ department: departmentLabel, routedStaff });
    }

    const createdVisitors = [];
    for (const { department: departmentLabel, routedStaff } of staffRoutes) {
      const visitor = new Visitor({
        fullName: visitorFullName,
        email: user.email,
        phoneNumber: user.phone || "Not provided",
        idType: normalizedIdType,
        idNumber: normalizedIdType,
        idImage: normalizedIdImage,
        idValidationStatus: idReview.status,
        idValidationNotes: idReview.message,
        idValidationConfidence: idReview.confidence,
        idValidationCheckedAt: idVerification?.checkedAt
          ? new Date(idVerification.checkedAt)
          : new Date(),
        dataPrivacyAccepted: true,
        dataPrivacyAcceptedAt: dataPrivacyAcceptedAt
          ? new Date(dataPrivacyAcceptedAt)
          : new Date(),
      });
      visitor.queueAppointmentRequest({
        purposeOfVisit: resolvedPurpose,
        purposeCategory: normalizedPurposeCategory || undefined,
        customPurposeOfVisit: normalizedCustomPurpose || undefined,
        visitDate: new Date(finalVisitDate),
        visitTime: new Date(finalVisitTime),
        department: formatDepartmentLabel(departmentLabel),
        assignedStaff: routedStaff._id,
        assignedStaffName: getFullName(routedStaff),
      });
      await visitor.save();
      createdVisitors.push({ visitor, routedStaff, departmentLabel });
    }

    const prioritizedVisitor = getPrioritizedVisitor(await findVisitorsForUser(user));
    if (prioritizedVisitor) {
      user.visitorId = prioritizedVisitor._id;
      await user.save();
    }

    for (const { visitor, routedStaff } of createdVisitors) {
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

      await createRoleNotification({
        title: "Appointment Request Queued",
        message: `${visitor.fullName} requested an appointment for ${visitor.appointmentDepartment || visitor.assignedOffice}. Security will handle gate entry after staff approval.`,
        type: "info",
        severity: "low",
        targetRole: "security",
        relatedVisitor: visitor._id,
        relatedUser: user._id,
        metadata: {
          activityType: "visitor_appointment_request",
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          purposeOfVisit: visitor.purposeOfVisit,
          department: visitor.appointmentDepartment || visitor.assignedOffice,
          assignedStaff: routedStaff._id,
          pendingStaffApproval: true,
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
    }

    res.json({
      success: true,
      message: createdVisitors.length > 1
        ? "Appointment requests submitted successfully"
        : "Appointment request submitted successfully",
      visitor: createdVisitors[0]?.visitor,
      visitors: createdVisitors.map(({ visitor }) => visitor),
      idValidationStatus: idReview.status,
      idValidationMessage: idReview.message,
      idValidationConfidence: idReview.confidence,
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

    const appointmentDateTime = getCombinedAppointmentDateTime(visitor.visitDate, visitor.visitTime);
    if (!appointmentDateTime || appointmentDateTime < new Date(Date.now() - 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: "This appointment schedule is no longer valid. Please adjust it before approving.",
      });
    }

    visitor.approveAppointment(req.user, req.body?.note || "");
    await visitor.save();

    let visitorUser = await User.findOne({ email: visitor.email });
    if (visitorUser) {
      await activateVisitorSafePassCardForUser(visitorUser, visitor);
    }
    const visitSchedule = formatVisitSchedule(visitor.visitDate, visitor.visitTime);
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");
    const [updatedVisitorPayload] = await attachSafePassIdsToVisitors([updatedVisitor]);

    await createRoleNotification({
      title: "Appointment Approved",
      message: `${visitor.fullName}'s appointment for ${visitSchedule} was approved by ${getFullName(req.user)}.`,
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
        message: `Your visit on ${visitSchedule} has been approved. Please provide internet before going to the site.`,
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

    await createRoleNotification({
      title: "Appointment Approved",
      message: `${visitor.fullName}'s appointment for ${visitSchedule} has been approved and recorded.`,
      type: "success",
      severity: "low",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_approved_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

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
      visitor: updatedVisitorPayload,
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

    const adjustedDate = finalVisitDate || visitor.visitDate;
    const adjustedDateTime = getCombinedAppointmentDateTime(adjustedDate, finalVisitTime);
    if (!adjustedDateTime) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid adjusted date and time.",
      });
    }

    const minimumScheduleTime = new Date(Date.now() - 60 * 1000);
    if (adjustedDateTime < minimumScheduleTime) {
      return res.status(400).json({
        success: false,
        message: "Adjusted appointment time cannot be in the past.",
      });
    }

    const activeAppointmentOptions = await getAppointmentOptions({ activeOnly: true });
    const adjustedConfiguredSlot = findAppointmentConfiguredSlot(activeAppointmentOptions.timeSlots, adjustedDateTime);
    if (!adjustedConfiguredSlot) {
      return res.status(400).json({
        success: false,
        message: "Please select an enabled appointment time slot.",
      });
    }
    const adjustedSlotLimit = getAppointmentSlotLimit(adjustedConfiguredSlot);

    const slotStaffId = visitor.assignedStaff || req.user._id;
    const adjustedSlotCount = await countStaffAppointmentsForSlot({
      assignedStaff: slotStaffId,
      visitDate: adjustedDate,
      visitTime: finalVisitTime,
      excludeVisitorId: visitor._id,
    });

    if (adjustedSlotCount >= adjustedSlotLimit) {
      return res.status(409).json({
        success: false,
        code: "APPOINTMENT_SLOT_FULL",
        message: "That adjusted time slot is already full. Please choose another time.",
        limit: adjustedSlotLimit,
        currentCount: adjustedSlotCount,
      });
    }

    visitor.adjustAppointment(req.user, {
      visitDate: finalVisitDate ? new Date(finalVisitDate) : null,
      visitTime: new Date(finalVisitTime),
      note,
    });
    await visitor.save();

    let visitorUser = await User.findOne({ email: visitor.email });
    if (visitorUser) {
      await activateVisitorSafePassCardForUser(visitorUser, visitor);
    }
    const visitSchedule = formatVisitSchedule(visitor.visitDate, visitor.visitTime);
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department");
    const [updatedVisitorPayload] = await attachSafePassIdsToVisitors([updatedVisitor]);

    await createRoleNotification({
      title: "Appointment Time Adjusted",
      message: `${getFullName(req.user)} adjusted ${visitor.fullName}'s appointment to ${visitSchedule}.`,
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
        message: `Your appointment was adjusted to ${visitSchedule}. Please provide internet before going to the site.`,
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

    await createRoleNotification({
      title: "Appointment Time Adjusted",
      message: `${visitor.fullName}'s appointment has been updated to ${visitSchedule}.`,
      type: "warning",
      severity: "medium",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_adjusted_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        note: visitor.staffAdjustmentNote,
      },
    });

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
      visitor: updatedVisitorPayload,
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
    const visitSchedule = formatVisitSchedule(visitor.visitDate, visitor.visitTime);
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

    await createRoleNotification({
      title: "Appointment Request Declined",
      message: `${visitor.fullName}'s appointment for ${visitSchedule} was declined. Reason: ${rejectionReason}`,
      type: "alert",
      severity: "medium",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_rejected_appointment",
        reason: rejectionReason,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

    await createRoleNotification({
      title: "Appointment Request Declined",
      message: `${visitor.fullName}'s appointment for ${visitSchedule} was declined by ${getFullName(req.user)}.`,
      type: "alert",
      severity: "medium",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_rejected_appointment",
        reason: rejectionReason,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
      },
    });

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

app.put("/api/staff/appointments/:id/complete", authMiddleware, async (req, res) => {
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
        message: "Only staff appointment requests can be completed here.",
      });
    }

    if (!isStaffAllowedForAppointment(req.user, visitor)) {
      return res.status(403).json({
        success: false,
        message: "You can only complete appointments assigned to your department.",
      });
    }

    if (visitor.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: "The visitor must be checked in before the appointment can be completed.",
      });
    }

    if (visitor.checkedOutAt) {
      return res.status(400).json({
        success: false,
        message: "This visit has already been checked out.",
      });
    }

    if (visitor.appointmentCompletedAt) {
      return res.status(400).json({
        success: false,
        message: "This appointment has already been marked complete.",
      });
    }

    const completionNote = String(
      req.body?.note || "Appointment completed. Visitor can proceed to check-out.",
    ).trim();

    visitor.completeAppointment(req.user, completionNote);
    await visitor.save();

    const visitorUser = await User.findOne({ email: visitor.email });
    const visitSchedule = formatVisitSchedule(visitor.visitDate, visitor.visitTime);
    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate("assignedStaff", "firstName lastName email department")
      .populate("staffActionBy", "firstName lastName email department")
      .populate("appointmentCompletedBy", "firstName lastName email department");

    await createRoleNotification({
      title: "Appointment Completed",
      message: `${getFullName(req.user)} marked ${visitor.fullName}'s appointment complete. Please prepare for check-out.`,
      type: "info",
      severity: "medium",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_completed_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        note: completionNote,
      },
    });

    await createRoleNotification({
      title: "Appointment Completed",
      message: `${visitor.fullName}'s appointment for ${visitSchedule} was marked complete by ${getFullName(req.user)}.`,
      type: "info",
      severity: "medium",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "staff_completed_appointment",
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        note: completionNote,
      },
    });

    if (visitorUser) {
      await createRoleNotification({
        title: "Appointment Completed",
        message: "Your appointment is complete. Please proceed to check-out with security before leaving the site.",
        type: "info",
        severity: "medium",
        targetRole: "visitor",
        targetUser: visitorUser._id,
        relatedVisitor: visitor._id,
        relatedUser: visitorUser._id,
        metadata: {
          activityType: "staff_completed_appointment",
          note: completionNote,
        },
      });
    }

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: visitorUser,
      activityType: "staff_completed_appointment",
      status: "granted",
      location: visitor.assignedOffice || visitor.host || req.user.department || "Staff Office",
      notes: `${getFullName(req.user)} completed ${visitor.fullName}'s appointment.`,
      metadata: {
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        note: completionNote,
      },
    });

    res.json({
      success: true,
      message: "Appointment marked complete successfully",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Staff complete appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete appointment",
    });
  }
});

// Check-in visitor (by security)
app.put("/api/visitors/:id/checkin", authMiddleware, async (req, res) => {
  try {
    if (!["admin", "security", "guard"].includes(req.user.role)) {
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
        message: "Visitor does not have an approved visit window yet",
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
    if (!["admin", "security", "guard"].includes(req.user.role)) {
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
        message: "Visitor does not have an approved visit window yet",
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
    const reportReason = String(reason || "").trim();

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (!reportReason) {
      return res.status(400).json({
        success: false,
        message: "A report reason is required.",
      });
    }

    visitor.reports.push({
      reason: reportReason,
      reportedBy: req.user._id,
      reportedAt: new Date(),
    });

    await visitor.save();
    const visitorUser = await User.findOne({ email: visitor.email, role: "visitor" });
    const reporterName = getFullName(req.user) || req.user.email || "A staff member";

    await createRoleNotification({
      title: "Visitor Reported",
      message: `${visitor.fullName} was reported by ${reporterName}: ${reportReason}`,
      type: "alert",
      severity: "high",
      targetRole: "security",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "visitor_reported",
        reportedBy: req.user._id,
        reason: reportReason,
      },
    });

    await createRoleNotification({
      title: "Visitor Incident Report",
      message: `${visitor.fullName} was reported and needs admin review. Reason: ${reportReason}`,
      type: "warning",
      severity: "high",
      targetRole: "admin",
      relatedVisitor: visitor._id,
      relatedUser: visitorUser?._id || null,
      metadata: {
        activityType: "visitor_reported",
        reportedBy: req.user._id,
        reason: reportReason,
      },
    });

    if (visitorUser) {
      await createRoleNotification({
        title: "Security Warning",
        message: `A report has been filed on your visitor account. Reason: ${reportReason}. Please coordinate with school staff or security before your next visit.`,
        type: "warning",
        severity: "high",
        targetRole: "visitor",
        targetUser: visitorUser._id,
        relatedVisitor: visitor._id,
        relatedUser: visitorUser._id,
        metadata: {
          activityType: "visitor_reported",
          reportedBy: req.user._id,
          reason: reportReason,
        },
      });
    }

    await createSystemActivity({
      actorUser: req.user,
      relatedVisitor: visitor,
      relatedUser: visitorUser,
      activityType: "visitor_reported",
      status: "flagged",
      location: visitor.assignedOffice || visitor.host || req.user.department || "Security Desk",
      notes: `${reporterName} reported ${visitor.fullName}.`,
      metadata: {
        reason: reportReason,
      },
    });

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
    await ensureOverstayAlerts();

    const { read, limit = 50 } = req.query;
    const targetRoles = getNotificationTargetRoles(req.user.role);
    const now = new Date();

    let query = {
      targetRole: { $in: targetRoles },
      $or: [{ targetUser: null }, { targetUser: req.user._id }],
      $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }],
    };

    if (read === "false") {
      query["readBy.user"] = { $ne: req.user._id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("relatedVisitor", "fullName visitDate visitTime appointmentStatus appointmentDepartment assignedOffice")
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

    if (!notificationIsAccessibleToUser(notification, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this notification",
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
    const now = new Date();
    await Notification.updateMany(
      {
        targetRole: { $in: targetRoles },
        $or: [{ targetUser: null }, { targetUser: req.user._id }],
        $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }],
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
      await ensureSafePassAccountId(req.user);
      const visitor = await findVisitorForUser(req.user);

      if (visitor) {
        const visitorPayload = visitor.toObject();
        visitorPayload.nfcCardId = req.user.nfcCardId || "";
        return res.json({
          success: true,
          visitor: visitorPayload,
          account: getVisitorAccountPayload(req.user),
        });
      }

      return res.json({
        success: true,
        visitor: null,
        account: getVisitorAccountPayload(req.user),
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

// Get visitor by user ID
app.get("/api/visitors/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterRole = String(req.user.role || "").toLowerCase();

    if (
      requesterRole === "visitor" &&
      !isSameObjectId(req.user._id, userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own visitor profile.",
      });
    }

    if (
      !["visitor", "admin", "security", "guard", "staff"].includes(requesterRole)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

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
      .populate("relatedUser", "firstName lastName email role department nfcCardId");

    const visitorActivityUsers = activities
      .map((activity) => activity.relatedUser)
      .filter((user) => user && String(user.role || "").toLowerCase() === "visitor");
    await Promise.all(visitorActivityUsers.map((user) => ensureSafePassAccountId(user)));

    const activityPayloads = activities.map((activity) => {
      const payload = activity.toObject();
      if (payload.relatedUser?.nfcCardId) {
        payload.nfcCardId = payload.relatedUser.nfcCardId;
      }
      if (payload.relatedVisitor && payload.relatedUser?.nfcCardId) {
        payload.relatedVisitor.nfcCardId = payload.relatedUser.nfcCardId;
        payload.relatedVisitor.safePassId = payload.relatedUser.nfcCardId;
      }
      return payload;
    });

    const summary = {
      registrationRequests: activityPayloads.filter((item) => item.activityType === "visitor_registration_request").length,
      appointmentRequests: activityPayloads.filter((item) => item.activityType === "visitor_appointment_request").length,
      staffActions: activityPayloads.filter((item) =>
        [
          "staff_approved_appointment",
          "staff_adjusted_appointment",
          "staff_rejected_appointment",
          "staff_completed_appointment",
        ].includes(item.activityType),
      ).length,
      completedVisits: activityPayloads.filter((item) =>
        item.activityType === "security_checkout" || item.activityType === "visitor_self_checkout",
      ).length,
      approvals: activityPayloads.filter((item) =>
        item.activityType === "admin_approved_registration" || item.activityType === "staff_approved_appointment",
      ).length,
    };

    res.json({
      success: true,
      activities: activityPayloads,
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

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (updates.firstName !== undefined) {
      updates.firstName = String(updates.firstName || "").trim();
      if (!updates.firstName) {
        return res.status(400).json({
          success: false,
          message: "First name is required.",
          field: "firstName",
        });
      }
    }

    if (updates.lastName !== undefined) {
      updates.lastName = String(updates.lastName || "").trim();
      if (!updates.lastName) {
        return res.status(400).json({
          success: false,
          message: "Last name is required.",
          field: "lastName",
        });
      }
    }

    if (updates.email !== undefined) {
      const normalizedEmail = normalizeEmailValue(updates.email);
      if (!normalizedEmail || !isValidEmailValue(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
          field: "email",
        });
      }

      const emailConflict = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.params.id },
      });

      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
          field: "email",
        });
      }

      updates.email = normalizedEmail;
    }

    if (updates.phone !== undefined) {
      updates.phone = normalizePhoneValue(updates.phone);
      if (updates.phone && !isValidPhoneValue(updates.phone)) {
        return res.status(400).json({
          success: false,
          message: PHONE_VALIDATION_MESSAGE,
          field: "phone",
        });
      }
    }

    if (updates.role !== undefined) {
      updates.role = String(updates.role || "").toLowerCase().trim();
      if (!ACCOUNT_ROLE_OPTIONS.includes(updates.role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
          field: "role",
        });
      }
    }

    if (updates.status !== undefined) {
      updates.status = String(updates.status || "").toLowerCase().trim();
      if (!ACCOUNT_STATUS_OPTIONS.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account status",
          field: "status",
        });
      }
      updates.isActive = updates.status === "active";
    }

    if (updates.department !== undefined) {
      updates.department = String(updates.department || "").trim();
    }

    if (updates.position !== undefined) {
      updates.position = String(updates.position || "").trim();
    }

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

    const finalRole = updates.role || existingUser.role;
    const finalDepartment =
      updates.department !== undefined ? updates.department : existingUser.department;
    if (finalRole === "staff" && !String(finalDepartment || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required for staff accounts.",
        field: "department",
      });
    }

    if (updates.status !== undefined) {
      updates.status = String(updates.status || "").toLowerCase().trim();
      updates.isActive = updates.status === "active";
    } else if (updates.isActive !== undefined) {
      updates.isActive = updates.isActive === true;
      updates.status = updates.isActive ? "active" : "inactive";
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");

    const visitorSync = await syncVisitorRecordsForUserUpdate(existingUser, user);

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

    res.json({
      success: true,
      message: "User updated successfully",
      user,
      synced: {
        visitors: visitorSync?.modifiedCount || 0,
      },
    });
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

    const normalizedRole = String(role || "").toLowerCase().trim();

    if (!ACCOUNT_ROLE_OPTIONS.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: normalizedRole, updatedAt: new Date() },
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
      notes: `Updated role for ${user.email} to ${normalizedRole}`,
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
      { status: "inactive", isActive: false, updatedAt: new Date() },
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
      { status: "active", isActive: true, updatedAt: new Date() },
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

    const cleanupTargets = await buildUserCleanupTargets(user);
    const deletedVisitors = cleanupTargets.visitorIds.length
      ? await Visitor.deleteMany({ _id: { $in: cleanupTargets.visitorIds } })
      : { deletedCount: 0 };
    const deletedAccessLogs = await AccessLog.deleteMany(cleanupTargets.accessLogQuery);
    const deletedNotifications = await Notification.deleteMany(cleanupTargets.notificationQuery);
    const updatedNotifications = await Notification.updateMany(
      { "readBy.user": user._id },
      { $pull: { readBy: { user: user._id } } },
    );
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

    res.json({
      success: true,
      message: "User deleted successfully",
      deleted: {
        users: 1,
        visitors: deletedVisitors.deletedCount || 0,
        accessLogs: deletedAccessLogs.deletedCount || 0,
        notifications: deletedNotifications.deletedCount || 0,
        notificationReadReceipts: updatedNotifications.modifiedCount || 0,
      },
    });
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
    user.accessPermissions = {
      canAccess: user.accessPermissions?.canAccess || [],
      restrictedAreas: user.accessPermissions?.restrictedAreas || [],
      cardActive: true,
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

// Assign a physical NFC/RFID card UID to a visitor account
app.post("/api/admin/nfc-cards/assign", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId, email, cardId, nfcCardId, uid } = req.body || {};
    const normalizedCardId = normalizeNfcCardId(cardId || nfcCardId || uid);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedCardId) {
      return res.status(400).json({
        success: false,
        message: "Card UID is required.",
      });
    }

    const existingCardOwner = await User.findOne({
      nfcCardId: normalizedCardId,
    }).select("_id email role nfcCardId");

    if (existingCardOwner && String(existingCardOwner._id) !== String(userId || "")) {
      return res.status(409).json({
        success: false,
        message: `Card ${normalizedCardId} is already assigned to ${existingCardOwner.email}.`,
      });
    }

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ email: normalizedEmail, role: "visitor" });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Visitor account not found.",
      });
    }

    const previousCardId = user.nfcCardId || "";
    user.nfcCardId = normalizedCardId;
    user.role = "visitor";
    user.status = "active";
    user.isActive = true;
    user.accessPermissions = {
      canAccess: user.accessPermissions?.canAccess || [],
      restrictedAreas: user.accessPermissions?.restrictedAreas || [],
      timeRestrictions: user.accessPermissions?.timeRestrictions || [],
      cardActive: true,
    };
    await user.save();

    await AccessLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      location: "Admin Panel",
      accessType: "system",
      status: "granted",
      nfcCardId: normalizedCardId,
      relatedUser: user._id,
      metadata: {
        previousCardId,
        assignedCardId: normalizedCardId,
      },
      notes: `Assigned NFC card ${normalizedCardId} to ${user.email}`,
    });

    res.json({
      success: true,
      message: "NFC card assigned successfully",
      card: {
        id: user._id,
        cardNumber: user.nfcCardId,
        previousCardNumber: previousCardId,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        status: "active",
        issuedDate: new Date(),
        userId: user._id,
      },
    });
  } catch (error) {
    console.error("Assign NFC card error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign NFC card",
    });
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
    user.accessPermissions = {
      canAccess: user.accessPermissions?.canAccess || [],
      restrictedAreas: user.accessPermissions?.restrictedAreas || [],
      cardActive: false,
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

    const settingsRecord = await getSystemSettingsRecord();

    res.json({
      success: true,
      settings: sanitizeSystemSettings(settingsRecord?.toObject?.() || settingsRecord || {}),
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

    const settings = sanitizeSystemSettings(req.body || {});
    await AppSettings.findOneAndUpdate(
      { key: "system" },
      { $set: { ...settings, updatedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

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

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
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

if (!isVercelRuntime && require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Database: ${MONGODB_URI}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`✅ Test endpoint: http://localhost:${PORT}/api/health`);
    console.log(`✅ Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`👑 Admin routes available at /api/admin/*`);
    console.log(`📝 Visitor approval routes available at /api/admin/visitors/*`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Try a different port:`);
      console.log(`   Try: PORT=5001 npm run dev`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", error);
    }
  });

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
}

module.exports = app;





