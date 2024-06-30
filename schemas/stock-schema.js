const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  stock_name: { type: String, required: true, unique: true },
  symbol_code: { type: String, required: true },
  reuters_code: { type: String, required: true },
  price: { type: Number, required: true },
  nationType: { type: String, required: true },
  compareToPreviousClosePrice: { type: Number, required: true },
  fluctuationsRatio: { type: Number, required: true },
  investment_index: { type: Number, default: 0 },
  profitability: { type: Number, default: 0 },
  growth_rate: { type: Number, default: 0 },
  interest_rate: { type: Number, default: 0 },
});

module.exports = mongoose.models.Stock || mongoose.model("Stock", StockSchema);
