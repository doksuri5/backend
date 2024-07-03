import mongoose from "mongoose";
import crypto from "crypto";

const CertSchema = new mongoose.Schema({
  user_email: { type: String, default: null },
  user_phone: { type: String, default: null },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

CertSchema.methods.generateCode = function () {
  this.code = crypto.randomInt(100000, 1000000).toString(); // 6자리 랜덤 숫자
  this.expires_at = new Date(Date.now() + 180000); // 3분 후 만료
  return this.code;
};

CertSchema.methods.verifyCode = function (code) {
  // 현재 시간이 만료 시간 이전인지 확인
  if (this.expires_at < new Date()) {
    return false;
  }

  // 입력된 코드와 저장된 코드가 일치하는지 확인
  return this.code === code;
};

const Cert = mongoose.models.Cert || mongoose.model("Cert", CertSchema);
export default Cert;
