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
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
  
  department: { type: String, default: "" },
  position: { type: String, default: "" },
  shift: { type: String, default: "" },
  
role: {
  type: String,
  enum: ["visitor", "security", "guard", "admin", "staff"],
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
    cardActive: { type: Boolean, default: true },
  },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.employeeId === null || this.employeeId === "") {
    this.employeeId = undefined;
  }

  if (this.username === null || this.username === "") {
    this.username = undefined;
  }

  if (this.email) {
    this.email = String(this.email).toLowerCase().trim();
  }

  if (this.username) {
    this.username = String(this.username).toLowerCase().trim();
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
