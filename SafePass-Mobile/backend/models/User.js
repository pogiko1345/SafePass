const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    trim: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    trim: true,
    lowercase: true,
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  emergencyContact: { type: String, default: "" },
  profilePhoto: { type: String, default: "" },
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    trim: true,
  },
  teacherId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    trim: true,
  },
  course: { type: String, default: "", trim: true },
  yearLevel: { type: String, default: "", trim: true },
  section: { type: String, default: "", trim: true },
  scheduleProfile: {
    startTime: { type: String, default: "", trim: true },
    endTime: { type: String, default: "", trim: true },
    graceMinutes: { type: Number, default: 10 },
  },
  
  department: { type: String, default: "" },
  position: { type: String, default: "" },
  shift: { type: String, default: "" },
  
role: {
  type: String,
  enum: ["visitor", "security", "guard", "admin", "staff", "student", "teacher"],
  default: "visitor",
},
  status: {
    type: String,
    enum: ["pending", "active", "suspended", "inactive"],
    default: "pending",
  },
  nfcCardId: { type: String, unique: true, sparse: true },
  cardExpiry: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    },
  },

  // Access Permissions
  accessPermissions: {
    canAccess: { type: [String], default: [] },
    restrictedAreas: { type: [String], default: [] },
    timeRestrictions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    cardActive: { type: Boolean, default: true },
  },

  isVerified: { type: Boolean, default: false },
  verificationTokenHash: { type: String, default: "" },
  verificationExpiresAt: { type: Date, default: null },
  verificationOtpHash: { type: String, default: "" },
  verificationOtpExpiresAt: { type: Date, default: null },
  verificationOtpAttempts: { type: Number, default: 0 },
  passwordResetTokenHash: { type: String, default: "" },
  passwordResetOtpHash: { type: String, default: "" },
  passwordResetExpiresAt: { type: Date, default: null },
  passwordResetAttempts: { type: Number, default: 0 },
  passwordResetVerifiedAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null },
  dataPrivacyAccepted: { type: Boolean, default: false },
  dataPrivacyAcceptedAt: { type: Date, default: null },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.employeeId === null || this.employeeId === "") {
    this.employeeId = undefined;
  }

  if (this.username === null || this.username === "") {
    this.username = undefined;
  }

  if (this.studentId === null || this.studentId === "") {
    this.studentId = undefined;
  }

  if (this.teacherId === null || this.teacherId === "") {
    this.teacherId = undefined;
  }

  if (this.nfcCardId === null || this.nfcCardId === "") {
    this.nfcCardId = undefined;
  }

  if (this.email) {
    this.email = String(this.email).toLowerCase().trim();
  }

  if (this.username) {
    this.username = String(this.username).toLowerCase().trim();
  }

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
