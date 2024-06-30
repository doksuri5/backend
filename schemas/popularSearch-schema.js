const mongoose = require("mongoose");

const PopularSearchSchema = new mongoose.Schema({
  stock_name: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.models.PopularSearch || mongoose.model("PopularSearch", PopularSearchSchema);
