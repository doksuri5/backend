import express from "express";
import * as termsController from "../controllers/terms-controller.js";

/**
 * @swagger
 * tags:
 *   name: Terms
 *   description: 약관 관련 API
 */

/**
 * @swagger
 * /terms/getTerms:
 *   get:
 *     summary: 서비스 이용약관 및 개인정보 처리방침 가져오기
 *     tags: [Terms]
 *     responses:
 *       200:
 *         description: 약관 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     terms_of_service:
 *                       type: object
 *                       properties:
 *                         content:
 *                           type: string
 *                         last_updated:
 *                           type: string
 *                           format: date-time
 *                         updates:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               reason:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                     privacy_policy:
 *                       type: object
 *                       properties:
 *                         content:
 *                           type: string
 *                         last_updated:
 *                           type: string
 *                           format: date-time
 *                         updates:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               reason:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *       404:
 *         description: 약관을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 약관을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /terms/updateTermsOfService:
 *   put:
 *     summary: 서비스 이용약관 수정
 *     tags: [Terms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 서비스 이용약관 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 서비스 이용약관이 업데이트되었습니다.
 *       404:
 *         description: 약관을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 약관을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /terms/updatePrivacyPolicy:
 *   put:
 *     summary: 개인정보 처리방침 수정
 *     tags: [Terms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 개인정보 처리방침 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 개인정보 처리방침이 업데이트되었습니다.
 *       404:
 *         description: 약관을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 약관을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

const router = express.Router();

router.get("/terms/getTerms", termsController.getTerms); // 서비스 이용약관, 개인정보 처리방침 가져오기
router.put("/terms/updateTermsOfService", termsController.updateTermsOfService); // 서비스 이용약관 수정
router.put("/terms/updatePrivacyPolicy", termsController.updatePrivacyPolicy); // 개인정보 처리방침 수정

export default router;
