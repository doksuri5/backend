import jwt from "jsonwebtoken";

const secret_key = process.env.COOKIE_SECRET;

// access Token 생성
const generateAccessToken = (user) => {
  return jwt.sign(user, secret_key, {
    expiresIn: "5h",
  });
};

// refresh Token 생성
const generateRefreshToken = (user) => {
  return jwt.sign(user, secret_key, {
    expiresIn: "7d",
  });
};

// 토큰 검증
const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (err) {
    return null;
  }
};

export default { generateAccessToken, generateRefreshToken, verifyToken };
