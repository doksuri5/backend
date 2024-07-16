import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const PropensitySchema = new mongoose.Schema({
  user_snsId: { type: String, required: true },
  login_type: { type: String, required: true },
  isAgreeCreditInfo: { type: Boolean, required: true },
  investPropensity: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // 조건: isAgreeCreditInfo가 true인 경우 investPropensity가 null이 아니어야 함
        return this.isAgreeCreditInfo ? value !== undefined : true;
      },
      message: "investPropensity is required when isAgreeCreditInfo is true",
    },
    default: function () {
      // 조건: isAgreeCreditInfo가 false인 경우 기본값을 undefined로 설정
      return this.isAgreeCreditInfo ? undefined : undefined;
    },
  },
  created_at: { type: Date, default: () => getKoreanTime() },
  updated_at: { type: Date, default: null },
});

const Propensity = mongoose.models.Propensity || mongoose.model("Propensity", PropensitySchema);
export default Propensity;
