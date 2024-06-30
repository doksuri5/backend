const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Log || mongoose.model("Log", LogSchema);
