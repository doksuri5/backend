import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);
export default Log;
