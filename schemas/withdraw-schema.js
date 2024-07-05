import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const WithdrawSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_email: { type: String, required: true },
  reason: { type: String, required: true },
  reason_other: { type: String, default: null },
  created_at: { type: Date, default: () => getKoreanTime() },
});

const Withdraw = mongoose.models.Withdraw || mongoose.model("Withdraw", WithdrawSchema);
export default Withdraw;
