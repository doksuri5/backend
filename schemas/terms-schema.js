import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const UpdateSchema = new mongoose.Schema({
  reason: { type: String, default: null },
  date: { type: Date, default: () => getKoreanTime() },
});

const TermsSchema = new mongoose.Schema({
  terms_of_service: {
    content: { type: String, required: true },
    last_updated: { type: Date, default: () => getKoreanTime() },
    updates: [UpdateSchema],
  },
  privacy_policy: {
    content: { type: String, required: true },
    last_updated: { type: Date, default: () => getKoreanTime() },
    updates: [UpdateSchema],
  },
});

TermsSchema.methods.updateTermsOfService = async function (content, reason) {
  this.terms_of_service.content = content;
  this.terms_of_service.last_updated = getKoreanTime();
  this.terms_of_service.updates.push({ reason });
  await this.save();
};

TermsSchema.methods.updatePrivacyPolicy = async function (content, reason) {
  this.privacy_policy.content = content;
  this.privacy_policy.last_updated = getKoreanTime();
  this.privacy_policy.updates.push({ reason });
  await this.save();
};

const Terms = mongoose.models.Terms || mongoose.model("Terms", TermsSchema);
export default Terms;
