import express from "express";
import * as userController from "../controllers/user-controller.js";
import { userAuthenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/getAllUser", userController.getAllUser); // 전체 유저 조회
router.get("/auth/duplicatedEmail/:email", userController.duplicatedEmail); // 중복 이메일 체크
router.post("/auth/sendEmail", userController.sendEmail); // 인증코드 이메일 발송
router.post("/auth/verifyCode", userController.verifyCode); // 인증코드 검증
router.post("/auth/register", userController.register); // 회원가입
router.post("/auth/registerSocial", userController.registerSocial); // 소셜 회원가입
router.put("/user/updateUserProfile", userController.updateUserProfile); // 프로필 수정
router.put("/user/updateUserInfo", userController.updateUserInfo); // 개인정보 수정
router.post("/user/withdraw", userController.withdraw); // 유저 탈퇴
router.patch("/user/language", userController.language); // 언어 변경

export default router;
