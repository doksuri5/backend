const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // required: true일 경우 필수 입력 값
  email: { type: String, required: true, unique: true }, // unique: 고유값 (무조건 1개)
  password: { type: String, required: true, select: false }, // select: false로 설정 시 조회가 되지 않음
  birth: { type: String, required: true }, // 950919
  phone: { type: String, required: true }, // 01047524087
  gender: { type: String, required: true, enum: ["M", "F"] }, // enum: 리스트 중 하나의 값만 가질 수 있음
  profile: { type: String, default: "" }, // 이미지 링크 (s3 생각중)
  nickname: { type: String, required: true },
  interest_stocks: { type: [String], required: true }, // [String]: string 타입의 리스트
  language: { type: String, default: "ko", enum: ["ko", "en", "ch", "jp", "fr"] }, // default: 기본 값 설정
  is_delete: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }, // 생성한 날짜
  updated_at: { type: Date, default: null }, // 업데이트한 날짜
  deleted_at: { type: Date, default: null }, // 회원 탈퇴한 날짜
});

UserSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
