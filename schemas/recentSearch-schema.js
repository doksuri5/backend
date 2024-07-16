import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const { Schema, model, models } = mongoose;

const RecentSearchSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", index: true },
    user_snsId: { type: String, required: true },
    stock_name: { type: String, required: true },
    is_delete: { type: Boolean, default: false },
    search_date: { type: Date, default: () => getKoreanTime() },
  },
  { timestamps: true }
);

// 인덱스 설정으로 user_snsId와 stock_name을 조합하여 고유 인덱스를 만듦
// user_snsId와 stock_name을 둘 다 만족하는 값은 오로지 1개만 설정
RecentSearchSchema.index({ user_snsId: 1, stock_name: 1 }, { unique: true });

const RecentSearch = models.RecentSearch || model("RecentSearch", RecentSearchSchema);
export default RecentSearch;
