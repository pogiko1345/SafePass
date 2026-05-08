const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", default: null, index: true },
    name: { type: String, required: true, trim: true, index: true },
    userType: {
      type: String,
      enum: ["student", "teacher", "staff", "security", "guard", "visitor"],
      required: true,
      index: true,
    },
    role: { type: String, default: "", trim: true, index: true },
    module: {
      type: String,
      enum: [
        "student_attendance",
        "teacher_attendance",
        "visitor_checkin",
        "staff_access",
        "security_monitoring",
      ],
      required: true,
      index: true,
    },
    nfcCardId: { type: String, default: "", trim: true, index: true },
    attendanceDate: { type: Date, required: true, index: true },
    checkInTime: { type: Date, default: null, index: true },
    checkOutTime: { type: Date, default: null, index: true },
    lastTapTime: { type: Date, default: null, index: true },
    checkpointIn: { type: String, default: "", trim: true },
    checkpointOut: { type: String, default: "", trim: true },
    checkpointHistory: {
      type: [
        {
          checkpointId: { type: String, default: "", trim: true },
          checkpointName: { type: String, default: "", trim: true },
          floor: { type: String, default: "", trim: true },
          office: { type: String, default: "", trim: true },
          action: { type: String, default: "", trim: true },
          tappedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    location: { type: String, default: "", trim: true },
    destination: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["inside", "present", "late", "completed", "no_show", "expired", "checked_out"],
      default: "present",
      index: true,
    },
    isLate: { type: Boolean, default: false, index: true },
    lateMinutes: { type: Number, default: 0 },
    isNoShow: { type: Boolean, default: false, index: true },
    isExpired: { type: Boolean, default: false, index: true },
    isCompleted: { type: Boolean, default: false, index: true },
    sessionDurationMinutes: { type: Number, default: 0 },
    sourceDeviceId: { type: String, default: "", trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

attendanceRecordSchema.index({ userId: 1, attendanceDate: 1, module: 1 });
attendanceRecordSchema.index({ visitorId: 1, attendanceDate: 1, module: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
