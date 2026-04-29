const mongoose = require('mongoose');

const APPOINTMENT_APPROVED_STATUSES = ["approved", "adjusted"];

const deriveVisitProgressStatus = (visitor) => {
  if (visitor.checkedOutAt) {
    return "checked_out";
  }

  if (visitor.checkedInAt) {
    return "checked_in";
  }

  if (
    visitor.approvalStatus === "rejected" ||
    visitor.appointmentStatus === "rejected"
  ) {
    return "rejected";
  }

  if (visitor.requestCategory === "appointment") {
    if (APPOINTMENT_APPROVED_STATUSES.includes(visitor.appointmentStatus)) {
      return "approved";
    }

    if (visitor.appointmentStatus === "pending") {
      return "pending";
    }
  }

  if (visitor.approvalStatus === "approved") {
    return "approved";
  }

  if (visitor.approvalStatus === "pending") {
    return "pending";
  }

  return visitor.status || "pending";
};

const visitorSchema = new mongoose.Schema({
  // ============ Personal Information ============
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    index: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    index: true
  },
  phoneNumber: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  idNumber: { 
    type: String, 
    default: "",
    trim: true,
    index: true
  },
  idType: {
    type: String,
    default: "",
    trim: true,
  },
  idImage: { 
    type: String,
    default: null
  },
  idValidationStatus: {
    type: String,
    default: "pending",
    trim: true,
  },
  idValidationNotes: {
    type: String,
    default: "",
    trim: true,
  },
  dataPrivacyAccepted: {
    type: Boolean,
    default: false,
  },
  dataPrivacyAcceptedAt: {
    type: Date,
    default: null,
  },
  
  // ============ Visit Details ============
  purposeOfVisit: { 
    type: String, 
    required: [true, 'Purpose of visit is required'],
    trim: true
  },
  purposeCategory: {
    type: String,
    default: "",
    trim: true,
  },
  customPurposeOfVisit: {
    type: String,
    default: "",
    trim: true,
  },
  host: {
    type: String,
    default: "",
    trim: true,
  },
  assignedOffice: {
    type: String,
    default: "",
    trim: true,
  },
  appointmentDepartment: {
    type: String,
    default: "",
    trim: true,
    index: true,
  },
  vehicleNumber: { 
    type: String, 
    default: "",
    trim: true
  },
  visitDate: { 
    type: Date, 
    required: [true, 'Visit date is required'],
    index: true
  },
  visitTime: { 
    type: Date, 
    required: [true, 'Visit time is required']
  },
  
  // ============ Approval Status ============
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  approvedAt: { 
    type: Date,
    default: null
  },
  rejectionReason: { 
    type: String,
    default: null
  },
  adminNotes: { 
    type: String,
    default: null
  },
  requestCategory: {
    type: String,
    enum: ["registration", "appointment"],
    default: "registration",
    index: true,
  },
  approvalFlow: {
    type: String,
    enum: ["admin", "staff"],
    default: "admin",
    index: true,
  },
  appointmentStatus: {
    type: String,
    enum: ["not_requested", "pending", "approved", "adjusted", "rejected"],
    default: "not_requested",
    index: true,
  },
  appointmentRequestedAt: {
    type: Date,
    default: null,
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assignedStaffName: {
    type: String,
    default: "",
    trim: true,
  },
  staffActionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  staffActionAt: {
    type: Date,
    default: null,
  },
  staffAdjustmentNote: {
    type: String,
    default: "",
    trim: true,
  },
  staffRejectionReason: {
    type: String,
    default: "",
    trim: true,
  },
  appointmentCompletedAt: {
    type: Date,
    default: null,
  },
  appointmentCompletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  appointmentCompletionNote: {
    type: String,
    default: "",
    trim: true,
  },
  overstayAlertedAt: {
    type: Date,
    default: null,
  },
  
  // ============ Check-in/out Status ============
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'checked_in', 'checked_out', 'expired', 'rejected'],
    default: 'pending',
    index: true
  },
  checkedInAt: { 
    type: Date,
    default: null
  },
  checkedOutAt: { 
    type: Date,
    default: null
  },
  checkedInBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  checkedOutBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },

  // ============ Live Location Tracking ============
  currentLocation: {
    floor: {
      type: String,
      default: "",
      trim: true,
    },
    office: {
      type: String,
      default: "",
      trim: true,
    },
    checkpointId: {
      type: String,
      default: "",
      trim: true,
    },
    coordinates: {
      x: { type: Number, default: null },
      y: { type: Number, default: null },
    },
    gps: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      altitude: { type: Number, default: null },
      heading: { type: Number, default: null },
      speed: { type: Number, default: null },
    },
    source: {
      type: String,
      default: "",
      trim: true,
    },
    deviceId: {
      type: String,
      default: "",
      trim: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  locationHistory: [
    {
      floor: String,
      office: String,
      checkpointId: String,
      coordinates: {
        x: Number,
        y: Number,
      },
      gps: {
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        altitude: Number,
        heading: Number,
        speed: Number,
      },
      source: String,
      deviceId: String,
      tappedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // ============ Notifications ============
  hostNotified: { 
    type: Boolean, 
    default: false 
  },
  securityNotified: { 
    type: Boolean, 
    default: false 
  },
  adminNotified: { 
    type: Boolean, 
    default: false 
  },
  
  // ============ Temporary Credentials ============
  temporaryPassword: { 
    type: String,
    default: null
  },
  
  // ============ Timestamps ============
  registeredAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // ============ Reports ============
  reports: [{
    reason: {
      type: String,
      required: true
    },
    reportedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    reportedAt: { 
      type: Date, 
      default: Date.now 
    },
    resolved: { 
      type: Boolean, 
      default: false 
    },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: String
  }]
}, {
  timestamps: { createdAt: 'registeredAt', updatedAt: 'updatedAt' }
});

// ============ Indexes for Better Query Performance ============
visitorSchema.index({ email: 1, status: 1 });
visitorSchema.index({ approvalStatus: 1, status: 1 });
visitorSchema.index({ visitDate: 1, status: 1 });
visitorSchema.index({ registeredAt: -1 });
visitorSchema.index({ requestCategory: 1, appointmentStatus: 1, visitDate: 1 });

// ============ Virtual Fields ============
visitorSchema.virtual('isApproved').get(function() {
  return this.approvalStatus === 'approved';
});

visitorSchema.virtual('isPending').get(function() {
  return this.approvalStatus === 'pending';
});

visitorSchema.virtual('isRejected').get(function() {
  return this.approvalStatus === 'rejected';
});

visitorSchema.virtual('isCheckedIn').get(function() {
  return this.status === 'checked_in';
});

visitorSchema.virtual('visitDateTime').get(function() {
  if (!this.visitDate && !this.visitTime) return null;
  const date = this.visitDate || this.visitTime;
  const time = this.visitTime || this.visitDate;
  return new Date(Math.max(date, time));
});

visitorSchema.virtual("workflowState").get(function () {
  return deriveVisitProgressStatus(this);
});

// ============ Methods ============
visitorSchema.methods = {
  syncWorkflowState() {
    const category = this.requestCategory === "appointment" ? "appointment" : "registration";
    this.requestCategory = category;
    this.approvalFlow = category === "appointment" ? "staff" : "admin";

    if (category === "registration") {
      this.appointmentStatus = "not_requested";
      this.appointmentRequestedAt = null;
      this.assignedStaff = null;
      this.assignedStaffName = "";
      this.staffActionBy = null;
      this.staffActionAt = null;
      this.staffAdjustmentNote = "";
      this.staffRejectionReason = "";
      this.appointmentCompletedAt = null;
      this.appointmentCompletedBy = null;
      this.appointmentCompletionNote = "";
      this.overstayAlertedAt = null;
    } else {
      if (this.appointmentStatus === "rejected") {
        this.approvalStatus = "rejected";
      } else if (this.approvalStatus !== "approved") {
        this.approvalStatus = "approved";
      }
      if (!this.appointmentStatus || this.appointmentStatus === "not_requested") {
        this.appointmentStatus = "pending";
      }
      this.appointmentRequestedAt =
        this.appointmentRequestedAt || this.registeredAt || new Date();
    }

    this.status = deriveVisitProgressStatus(this);
    return this.status;
  },

  hasApprovedVisitWindow() {
    const category = this.requestCategory === "appointment" ? "appointment" : "registration";

    if (category === "appointment") {
      return (
        this.approvalStatus === "approved" &&
        APPOINTMENT_APPROVED_STATUSES.includes(this.appointmentStatus)
      );
    }

    return this.approvalStatus === "approved";
  },

  markRegistrationPending() {
    this.requestCategory = "registration";
    this.approvalFlow = "admin";
    this.approvalStatus = "pending";
    this.approvedBy = null;
    this.approvedAt = null;
    this.rejectionReason = null;
    this.adminNotes = null;
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  approveRegistration(adminId, notes = "") {
    this.requestCategory = "registration";
    this.approvalFlow = "admin";
    this.approvalStatus = "approved";
    this.approvedBy = adminId;
    this.approvedAt = new Date();
    this.rejectionReason = null;
    this.adminNotes = notes || "";
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  rejectRegistration(adminId, reason = "") {
    this.requestCategory = "registration";
    this.approvalFlow = "admin";
    this.approvalStatus = "rejected";
    this.approvedBy = adminId;
    this.approvedAt = new Date();
    this.rejectionReason = reason || "No reason provided";
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  queueAppointmentRequest({
    visitDate,
    visitTime,
    purposeOfVisit,
    purposeCategory = "",
    customPurposeOfVisit = "",
    department = "",
    assignedStaff = null,
    assignedStaffName = "",
  }) {
    this.requestCategory = "appointment";
    this.approvalFlow = "staff";
    this.approvalStatus = "approved";
    this.visitDate = visitDate;
    this.visitTime = visitTime;
    this.purposeOfVisit = purposeOfVisit;
    this.purposeCategory = String(purposeCategory || "").trim();
    this.customPurposeOfVisit = String(customPurposeOfVisit || "").trim();
    this.appointmentDepartment = String(department || "").trim();
    this.assignedOffice = this.appointmentDepartment || this.assignedOffice || "";
    this.host = this.appointmentDepartment || this.host || "";
    this.appointmentStatus = "pending";
    this.appointmentRequestedAt = new Date();
    this.staffActionBy = null;
    this.staffActionAt = null;
    this.staffAdjustmentNote = "";
    this.staffRejectionReason = "";
    this.appointmentCompletedAt = null;
    this.appointmentCompletedBy = null;
    this.appointmentCompletionNote = "";
    this.overstayAlertedAt = null;
    this.assignedStaff = assignedStaff || null;
    this.assignedStaffName = String(assignedStaffName || "").trim();
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  approveAppointment(staffUser, note = "") {
    this.requestCategory = "appointment";
    this.approvalFlow = "staff";
    this.approvalStatus = "approved";
    this.appointmentStatus = "approved";
    this.assignedStaff = staffUser?._id || null;
    this.assignedStaffName = staffUser
      ? `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
      : this.assignedStaffName;
    this.staffActionBy = staffUser?._id || null;
    this.staffActionAt = new Date();
    this.staffAdjustmentNote = String(note || "").trim();
    this.staffRejectionReason = "";
    this.appointmentCompletedAt = null;
    this.appointmentCompletedBy = null;
    this.appointmentCompletionNote = "";
    this.overstayAlertedAt = null;
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  adjustAppointment(staffUser, { visitDate, visitTime, note = "" } = {}) {
    this.requestCategory = "appointment";
    this.approvalFlow = "staff";
    this.approvalStatus = "approved";
    if (visitDate) {
      this.visitDate = visitDate;
    }
    if (visitTime) {
      this.visitTime = visitTime;
    }
    this.appointmentStatus = "adjusted";
    this.assignedStaff = staffUser?._id || null;
    this.assignedStaffName = staffUser
      ? `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
      : this.assignedStaffName;
    this.staffActionBy = staffUser?._id || null;
    this.staffActionAt = new Date();
    this.staffAdjustmentNote = String(note || "Preferred time adjusted by staff.").trim();
    this.staffRejectionReason = "";
    this.appointmentCompletedAt = null;
    this.appointmentCompletedBy = null;
    this.appointmentCompletionNote = "";
    this.overstayAlertedAt = null;
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  rejectAppointment(staffUser, reason = "") {
    this.requestCategory = "appointment";
    this.approvalFlow = "staff";
    this.approvalStatus = "rejected";
    this.appointmentStatus = "rejected";
    this.assignedStaff = staffUser?._id || null;
    this.assignedStaffName = staffUser
      ? `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
      : this.assignedStaffName;
    this.staffActionBy = staffUser?._id || null;
    this.staffActionAt = new Date();
    this.staffRejectionReason = String(reason || "Appointment request declined by staff.").trim();
    this.staffAdjustmentNote = "";
    this.appointmentCompletedAt = null;
    this.appointmentCompletedBy = null;
    this.appointmentCompletionNote = "";
    this.overstayAlertedAt = null;
    this.checkedInAt = null;
    this.checkedOutAt = null;
    this.checkedInBy = null;
    this.checkedOutBy = null;
    this.syncWorkflowState();
    return this;
  },

  completeAppointment(staffUser, note = "") {
    this.requestCategory = "appointment";
    this.approvalFlow = "staff";
    this.approvalStatus = "approved";
    if (!APPOINTMENT_APPROVED_STATUSES.includes(this.appointmentStatus)) {
      this.appointmentStatus = "approved";
    }
    this.assignedStaff = staffUser?._id || this.assignedStaff || null;
    this.assignedStaffName = staffUser
      ? `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
      : this.assignedStaffName;
    this.staffActionBy = staffUser?._id || null;
    this.staffActionAt = new Date();
    this.appointmentCompletedAt = new Date();
    this.appointmentCompletedBy = staffUser?._id || null;
    this.appointmentCompletionNote = String(
      note || "Appointment completed. Visitor can proceed to check-out.",
    ).trim();
    this.overstayAlertedAt = null;
    this.syncWorkflowState();
    return this;
  },

  markCheckedIn(actorId) {
    this.checkedInAt = new Date();
    this.checkedInBy = actorId || null;
    this.checkedOutAt = null;
    this.checkedOutBy = null;
    this.overstayAlertedAt = null;
    this.syncWorkflowState();
    return this;
  },

  markCheckedOut(actorId) {
    this.checkedOutAt = new Date();
    this.checkedOutBy = actorId || null;
    this.currentLocation = {
      ...(this.currentLocation || {}),
      isActive: false,
      lastSeenAt: this.currentLocation?.lastSeenAt || new Date(),
    };
    this.overstayAlertedAt = null;
    this.syncWorkflowState();
    return this;
  },

  updateCurrentLocation(location = {}, metadata = {}) {
    const now = new Date();
    const coordinates = location.coordinates || {};
    const gps = location.gps || {};
    const nextLocation = {
      floor: String(location.floor || "").trim(),
      office: String(location.office || "").trim(),
      checkpointId: String(location.checkpointId || "").trim(),
      coordinates: {
        x: Number.isFinite(Number(coordinates.x)) ? Number(coordinates.x) : null,
        y: Number.isFinite(Number(coordinates.y)) ? Number(coordinates.y) : null,
      },
      gps: {
        latitude: Number.isFinite(Number(gps.latitude)) ? Number(gps.latitude) : null,
        longitude: Number.isFinite(Number(gps.longitude)) ? Number(gps.longitude) : null,
        accuracy: Number.isFinite(Number(gps.accuracy)) ? Number(gps.accuracy) : null,
        altitude: Number.isFinite(Number(gps.altitude)) ? Number(gps.altitude) : null,
        heading: Number.isFinite(Number(gps.heading)) ? Number(gps.heading) : null,
        speed: Number.isFinite(Number(gps.speed)) ? Number(gps.speed) : null,
      },
      source: String(location.source || "arduino_tap").trim(),
      deviceId: String(metadata.deviceId || location.deviceId || "").trim(),
      lastSeenAt: now,
      isActive: this.status === "checked_in",
    };

    this.currentLocation = nextLocation;
    this.locationHistory.push({
      ...nextLocation,
      tappedAt: now,
    });

    if (this.locationHistory.length > 50) {
      this.locationHistory = this.locationHistory.slice(-50);
    }

    return this;
  },

  // Backward-compatible aliases
  async approve(adminId, notes = '') {
    this.approveRegistration(adminId, notes);
    return this.save();
  },
  
  async reject(adminId, reason = '') {
    this.rejectRegistration(adminId, reason);
    return this.save();
  },
  
  async checkIn(securityId) {
    this.markCheckedIn(securityId);
    return this.save();
  },
  
  async checkOut(securityId) {
    this.markCheckedOut(securityId);
    return this.save();
  },
  
  // Add report
  async addReport(reason, reportedBy) {
    this.reports.push({
      reason,
      reportedBy,
      reportedAt: new Date()
    });
    return this.save();
  },
  
  // Resolve report
  async resolveReport(reportIndex, resolvedBy, notes = '') {
    if (this.reports[reportIndex]) {
      this.reports[reportIndex].resolved = true;
      this.reports[reportIndex].resolvedAt = new Date();
      this.reports[reportIndex].resolvedBy = resolvedBy;
      this.reports[reportIndex].resolutionNotes = notes;
      return this.save();
    }
    return this;
  }
};

// ============ Static Methods ============
visitorSchema.statics = {
  // Find pending visitors
  findPending() {
    return this.find({
      $or: [
        { requestCategory: 'registration', approvalStatus: 'pending' },
        { requestCategory: 'appointment', appointmentStatus: 'pending' }
      ]
    }).sort({ registeredAt: -1 });
  },
  
  // Find approved visitors
  findApproved() {
    return this.find({
      approvalStatus: 'approved',
      $or: [
        { requestCategory: 'registration' },
        { requestCategory: 'appointment', appointmentStatus: { $in: APPOINTMENT_APPROVED_STATUSES } }
      ],
      status: { $ne: 'checked_out' }
    }).sort({ visitDate: 1 });
  },
  
  // Find visitors by date range
  findByDateRange(startDate, endDate) {
    return this.find({
      visitDate: { $gte: startDate, $lte: endDate }
    }).sort({ visitDate: 1 });
  },
  
  // Get statistics
  async getStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      checkedIn: 0,
      checkedOut: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      if (stat._id === 'pending') result.pending = stat.count;
      if (stat._id === 'approved') result.approved = stat.count;
      if (stat._id === 'rejected') result.rejected = stat.count;
    });
    
    result.checkedIn = await this.countDocuments({ status: 'checked_in' });
    result.checkedOut = await this.countDocuments({ status: 'checked_out' });
    result.total = await this.countDocuments();
    
    return result;
  }
};

// ============ Middleware ============
// Update timestamp on save
visitorSchema.pre('save', function() {
  this.updatedAt = new Date();
});

visitorSchema.pre('save', function() {
  this.syncWorkflowState();
});

// ============ Ensure Virtuals are Included in JSON ============
visitorSchema.set('toJSON', { virtuals: true });
visitorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Visitor', visitorSchema);
