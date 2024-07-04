import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  stockName: { type: String, required: true, unique: true },
  symbolCode: { type: String, required: true },
  reutersCode: { type: String, required: true },
  price: { type: Number, required: true },
  nationType: { type: String, required: true },
  compareToPreviousClosePrice: { type: Number, required: true },
  fluctuationsRatio: { type: Number, required: true },
  market_price: { type: Number, default: 0 },
  investment_index: { type: Number, default: 0 },
  profitability: { type: Number, default: 0 },
  growth_rate: { type: Number, default: 0 },
  interest_rate: { type: Number, default: 0 },
});

const Stock = mongoose.models.Stock || mongoose.model("Stock", StockSchema);
export default Stock;
