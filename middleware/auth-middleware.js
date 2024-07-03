import jwt from "../utils/jwt-util.js";
import User from "../schemas/user-schema.js";
import connectDB from "../database/db.js";

// 공통된 토큰 처리 로직
export const authenticateToken = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  let payload = accessToken ? jwt.verifyToken(accessToken) : null;

  // access 토큰 검증 후 없으면 refresh 토큰 검증
  await connectDB();
  if (!payload) {
    const refreshToken = req.cookies.refreshToken;
    payload = refreshToken ? jwt.verifyToken(refreshToken) : null;

    // refresh 토큰 검증
    if (payload) {
      const user = await User.findById(payload.user_id);
      if (!user) return false;

      const userInfo = {
        user_id: user._id,
        user_email: user.email,
        user_name: user.name,
        user_language: user.language,
      };
      const newAccessToken = jwt.generateAccessToken(userInfo);
      res.cookie("accessToken", newAccessToken, {
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: "/",
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      console.log("accessToken 재발급");
    }
  }

  // access 토큰이 있는 경우
  if (payload) {
    req.user_id = payload.user_id;
    req.user_email = payload.user_email;
    req.user_name = payload.user_name;
    req.user_language = payload.user_language;
    return true;
  }
  return false;
};

// 일반 유저 권한 토큰 검증
export const userAuthenticate = async (req, res, next) => {
  if (await authenticateToken(req, res)) {
    next();
  } else {
    res.status(401).json({ ok: false, message: "로그인 후 이용해주세요.", errorCode: "NOT_LOGGED_IN" });
  }

  console.log("cookies", req.cookies);
  console.log("-------------------------------------------------------");
};
