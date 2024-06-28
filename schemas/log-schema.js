const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, select: false },
});

module.exports = mongoose.models.Log || mongoose.model("Log", LogSchema);
