import express from "express";
import * as authController from "../controllers/auth-controller.js";
// import { userAuthenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/auth/logout", authController.logout); // 로그아웃
router.post("/auth/login", authController.login); // 로그인
router.post("/auth/sendEmail", authController.sendEmail); // 인증코드 이메일 발송
router.post("/auth/verifyCode", authController.verifyCode); // 인증코드 검증
router.post("/auth/register", authController.register); // 회원가입
router.post("/auth/registerSocial", authController.registerSocial); // 소셜 회원가입
router.post("/auth/findPassword", authController.findPassword); // 비밀번호 찾기 (임시 비밀번호 발급)

export default router;
