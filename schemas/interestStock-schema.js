import mongoose from "mongoose";

const InterestStockSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  stock_name: { type: String, required: true, unique: true },
  interest_date: { type: Date, default: Date.now },
});

const InterestStock = mongoose.models.InterestStock || mongoose.model("InterestStock", InterestStockSchema);
export default InterestStock;
