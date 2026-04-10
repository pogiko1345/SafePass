const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  userName: String,
  actorRole: String,
  location: String,
  accessType: { type: String, enum: ['entry', 'exit', 'system'] },
  activityType: { type: String, default: '' },
  status: { type: String, enum: ['granted', 'denied', 'pending'] },
  nfcCardId: String,
  relatedVisitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', default: null },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
  notes: String
});

module.exports = mongoose.model('AccessLog', accessLogSchema);
