const express = require("express");
const multer = require("multer");
const router = express.Router();
const userController = require("../controllers/user-controller");
const { userAuthenticate } = require("../middleware/auth-middleware");

// 로그인, 인증 부분
router.get("/auth/validation", userController.validation);
router.post("/auth/login", userController.login); // 진행 중
router.post("/auth/naver", userController.naverLogin); // 진행 중
router.post("/auth/kakao", userController.kakaoLogin); // 진행 중

// api 개발
router.get("/getAllUser", userController.getAllUser); // 전체 유저 조회
router.get("/auth/duplicatedEmail/:email", userController.duplicatedEmail); // 중복 이메일 체크
router.post("/auth/register", multer().none(), userController.register); // 회원가입
router.put("/user/updateUser", multer().none(), userController.updateUser); // 개인정보 수정
router.post("/user/withdraw", userController.withdraw); // 유저 탈퇴
router.patch("/user/language", userController.language); // 언어 변경

module.exports = router;
