const mongoose = require("mongoose");

const RecentSearchSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  stock_name: { type: String, required: true },
  search_date: { type: Date, default: Date.now },
});

// 인덱스 설정으로 user_id와 stockName을 조합하여 고유 인덱스를 만듦
// user_id와 stockName을 둘 다 만족하는 값은 오로지 1개만 설정
RecentSearchSchema.index({ user_id: 1, stock_name: 1 }, { unique: true });

module.exports = mongoose.models.RecentSearch || mongoose.model("RecentSearch", RecentSearchSchema);
