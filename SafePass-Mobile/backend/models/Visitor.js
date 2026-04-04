const mongoose = require('mongoose');

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
    required: [true, 'ID number is required'],
    trim: true,
    index: true
  },
  idImage: { 
    type: String,
    default: null
  },
  
  // ============ Visit Details ============
  purposeOfVisit: { 
    type: String, 
    required: [true, 'Purpose of visit is required'],
    trim: true
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

// ============ Methods ============
visitorSchema.methods = {
  // Approve visitor
  async approve(adminId, notes = '') {
    this.approvalStatus = 'approved';
    this.status = 'approved';
    this.approvedBy = adminId;
    this.approvedAt = new Date();
    if (notes) this.adminNotes = notes;
    return this.save();
  },
  
  // Reject visitor
  async reject(adminId, reason = '') {
    this.approvalStatus = 'rejected';
    this.status = 'rejected';
    this.approvedBy = adminId;
    this.rejectionReason = reason;
    return this.save();
  },
  
  // Check in
  async checkIn(securityId) {
    this.status = 'checked_in';
    this.checkedInAt = new Date();
    this.checkedInBy = securityId;
    return this.save();
  },
  
  // Check out
  async checkOut(securityId) {
    this.status = 'checked_out';
    this.checkedOutAt = new Date();
    this.checkedOutBy = securityId;
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
        { status: 'pending' },
        { approvalStatus: 'pending' }
      ]
    }).sort({ registeredAt: -1 });
  },
  
  // Find approved visitors
  findApproved() {
    return this.find({
      approvalStatus: 'approved',
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
visitorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Before saving, ensure status and approvalStatus are consistent
visitorSchema.pre('save', function(next) {
  if (this.approvalStatus === 'approved' && this.status === 'pending') {
    this.status = 'approved';
  }
  if (this.approvalStatus === 'rejected' && this.status !== 'rejected') {
    this.status = 'rejected';
  }
  next();
});

// ============ Ensure Virtuals are Included in JSON ============
visitorSchema.set('toJSON', { virtuals: true });
visitorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Visitor', visitorSchema);