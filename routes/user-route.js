import express from "express";
import * as userController from "../controllers/user-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/getUser/:user_email", checkLoggedIn, userController.getUser); // 유저 정보 조회
router.post("/user/emailCert", checkLoggedIn, userController.emailCert); // 이메일 인증 (인증번호 발송)
router.post("/user/passwordCert", checkLoggedIn, userController.passwordCert); // 비밀번호 인증
router.post("/user/withdraw", checkLoggedIn, userController.withdraw); // 유저 탈퇴
router.put("/user/updateUserInfo", checkLoggedIn, userController.updateUserInfo); // 개인정보 수정
router.put("/user/updateUserProfile", checkLoggedIn, userController.updateUserProfile); // 프로필 수정
router.patch("/user/language", checkLoggedIn, userController.language); // 언어 변경

export default router;
