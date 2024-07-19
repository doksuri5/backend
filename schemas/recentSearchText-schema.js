import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const { Schema, model, models } = mongoose;

const RecentSearchTextSchema = new Schema({
  user_snsId: { type: String, required: true },
  is_delete: { type: Boolean, default: false },
  search_text: { type: String, required: true },
  search_date: { type: Date, default: () => getKoreanTime() },
});

// 인덱스 설정으로 user_snsId와 stock_name을 조합하여 고유 인덱스를 만듦
// user_snsId와 stock_name을 둘 다 만족하는 값은 오로지 1개만 설정
RecentSearchTextSchema.index({ user_snsId: 1, search_text: 1 }, { unique: true });

const RecentSearchText = models.RecentSearchText || model("RecentSearchText", RecentSearchTextSchema);
export default RecentSearchText;
