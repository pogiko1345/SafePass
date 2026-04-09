const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['visitor', 'alert', 'info', 'success', 'warning'],
    default: 'info'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // For targeting specific users/roles
  targetRole: { 
    type: String, 
    enum: ['security', 'guard', 'staff', 'admin', 'visitor', 'all'],
    default: 'all'
  },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Specific user
  
  // Read status
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  
  // Reference to related data
  relatedVisitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date // Auto-delete after this date
});

module.exports = mongoose.model('Notification', notificationSchema);
