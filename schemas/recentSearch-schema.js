import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const RecentSearchSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  stock_name: { type: String, required: true },
  search_date: { type: Date, default: () => getKoreanTime() },
});

// 인덱스 설정으로 user_id와 stock_name을 조합하여 고유 인덱스를 만듦
// user_id와 stock_name을 둘 다 만족하는 값은 오로지 1개만 설정
RecentSearchSchema.index({ user_id: 1, stock_name: 1 }, { unique: true });

const RecentSearch = mongoose.models.RecentSearch || mongoose.model("RecentSearch", RecentSearchSchema);
export default RecentSearch;
