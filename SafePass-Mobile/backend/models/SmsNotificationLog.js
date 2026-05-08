const mongoose = require("mongoose");

const smsNotificationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    recipientName: { type: String, default: "", trim: true },
    recipientPhone: { type: String, default: "", trim: true, index: true },
    messageType: {
      type: String,
      enum: ["student_check_in", "student_check_out", "otp", "system"],
      default: "system",
      index: true,
    },
    messageBody: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "skipped"],
      default: "queued",
      index: true,
    },
    provider: { type: String, default: "", trim: true },
    providerMessageId: { type: String, default: "", trim: true },
    sentAt: { type: Date, default: null, index: true },
    errorMessage: { type: String, default: "", trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SmsNotificationLog", smsNotificationLogSchema);
