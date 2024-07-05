import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const LogSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  created_at: { type: Date, default: () => getKoreanTime() },
});

const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);
export default Log;
