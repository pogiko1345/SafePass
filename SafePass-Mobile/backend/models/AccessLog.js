const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  userName: String,
  location: String,
  accessType: { type: String, enum: ['entry', 'exit', 'system'] },
  status: { type: String, enum: ['granted', 'denied', 'pending'] },
  nfcCardId: String,
  timestamp: { type: Date, default: Date.now },
  notes: String
});

module.exports = mongoose.model('AccessLog', accessLogSchema);