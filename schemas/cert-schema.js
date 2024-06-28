const mongoose = require("mongoose");

const CertSchema = new mongoose.Schema({
  userEmail: { type: String },
  userPhone: { type: String },
  code: { type: String, required: true },
  expiresAt: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, select: false },
});

CertSchema.methods.generateCode = function () {
  this.code = crypto.randomInt(100000, 1000000).toString(); // 6자리 랜덤 숫자
  this.expiresAt = new Date(Date.now() + 180000); // 3분 후 만료
  return this.code;
};

CertSchema.methods.verifyCode = function (code) {
  // 현재 시간이 만료 시간 이전인지 확인
  if (this.expiresAt < new Date()) {
    return false;
  }

  // 입력된 코드와 저장된 코드가 일치하는지 확인
  return this.code === code;
};

module.exports = mongoose.models.Cert || mongoose.model("Cert", CertSchema);
