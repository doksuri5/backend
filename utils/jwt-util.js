const jwt = require("jsonwebtoken");
const secret_key = process.env.COOKIE_SECRET;

// access Token 생성
exports.generateAccessToken = (user) => {
  return jwt.sign(user, secret_key, {
    expiresIn: "5h",
  });
};

// refresh Token 생성
exports.generateRefreshToken = (user) => {
  return jwt.sign(user, secret_key, {
    expiresIn: "7d",
  });
};

// 토큰 검증
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (err) {
    return null;
  }
};
