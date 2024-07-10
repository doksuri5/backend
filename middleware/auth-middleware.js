import User from "../schemas/user-schema.js";

export const checkLoggedIn = async (req, res, next) => {
  if (req.session && req.session.snsId) {
    const { snsId, email } = req.session;
    const exUser = await User.findOne({ sns_id: snsId, email, is_delete: false });

    req.snsId = exUser.sns_id;
    next();
  } else {
    res.status(401).json({ ok: false, message: "로그인 후 이용해주세요." }); // 로그인하지 않은 사용자에게 오류 메시지 전송
  }
};
