import express from "express";
import * as authController from "../controllers/auth-controller.js";
import { userAuthenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/auth/duplicatedEmail/:email", authController.duplicatedEmail); // 중복 이메일 체크
router.post("/auth/sendEmail", authController.sendEmail); // 인증코드 이메일 발송
router.post("/auth/verifyCode", authController.verifyCode); // 인증코드 검증
router.post("/auth/register", authController.register); // 회원가입
router.post("/auth/registerSocial", authController.registerSocial); // 소셜 회원가입

export default router;