import mongoose from "mongoose";

const stockCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

const StockCode = mongoose.models.StockCode || mongoose.model("StockCode", stockCodeSchema);

export default StockCode;
