import mongoose from "mongoose";

const WithdrawSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_email: { type: String, required: true },
  reason: { type: String, required: true },
  reason_other: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

const Withdraw = mongoose.models.Withdraw || mongoose.model("Withdraw", WithdrawSchema);
export default Withdraw;
