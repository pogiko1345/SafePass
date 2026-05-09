const mongoose = require("mongoose");

const nfcCheckpointSchema = new mongoose.Schema(
  {
    checkpointId: { type: String, required: true, unique: true, trim: true, index: true },
    readerId: { type: String, default: "", trim: true, index: true },
    officeName: { type: String, required: true, trim: true, index: true },
    floor: { type: String, default: "", trim: true, index: true },
    checkpointType: {
      type: String,
      enum: ["gate", "office", "area"],
      default: "office",
      index: true,
    },
    coordinates: {
      x: { type: Number, default: null },
      y: { type: Number, default: null },
    },
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("NfcCheckpoint", nfcCheckpointSchema);
