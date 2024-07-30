import mongoose from "mongoose";

const CurrencyExchangeSchema = new mongoose.Schema(
  {
    nation: { type: String, required: true, index: true },
    rate: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CurrencyExchange =
  mongoose.models.CurrencyExchange ||
  mongoose.model("CurrencyExchange", CurrencyExchangeSchema);

export default CurrencyExchange;
