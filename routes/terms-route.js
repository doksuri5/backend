import express from "express";
import * as termsController from "../controllers/terms-controller.js";

const router = express.Router();

router.get("/terms/getTerms", termsController.getTerms); // 서비스 이용약관, 개인정보 처리방침 가져오기
router.put("/terms/updateTermsOfService", termsController.updateTermsOfService); // 서비스 이용약관 수정
router.put("/terms/updatePrivacyPolicy", termsController.updatePrivacyPolicy); // 개인정보 처리방침 수정

export default router;
