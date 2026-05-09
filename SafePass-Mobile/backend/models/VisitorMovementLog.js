const mongoose = require("mongoose");

const visitorMovementLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
      index: true,
    },
    visitorName: { type: String, required: true, trim: true, index: true },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      default: null,
      index: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    nfcCardId: { type: String, default: "", trim: true, index: true },
    readerId: { type: String, required: true, trim: true, index: true },
    checkpointId: { type: String, required: true, trim: true, index: true },
    officeName: { type: String, required: true, trim: true, index: true },
    floor: { type: String, default: "", trim: true },
    expectedDestination: { type: String, default: "", trim: true, index: true },
    actualLocation: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["correct_location", "wrong_location", "redirected", "completed", "invalid_tap"],
      required: true,
      index: true,
    },
    message: { type: String, default: "", trim: true },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    coordinates: {
      x: { type: Number, default: null },
      y: { type: Number, default: null },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    tappedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  },
);

visitorMovementLogSchema.index({ visitorId: 1, tappedAt: -1 });
visitorMovementLogSchema.index({ status: 1, tappedAt: -1 });
visitorMovementLogSchema.index({ officeName: 1, tappedAt: -1 });

module.exports = mongoose.model("VisitorMovementLog", visitorMovementLogSchema);
