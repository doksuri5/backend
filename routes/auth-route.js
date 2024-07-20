// routes/auth-route.js
import express from "express";
import * as authController from "../controllers/auth-controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       500:
 *         description: 서버 세션 삭제 오류
 */
router.get("/auth/logout", authController.logout); // 로그아웃

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sns_id:
 *                 type: string
 *               email:
 *                 type: string
 *               autoLogin:
 *                 type: boolean
 *               login_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/login", authController.login); // 로그인

/**
 * @swagger
 * /auth/sendEmail:
 *   post:
 *     summary: 인증코드 이메일 발송
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 이메일 전송 완료
 *       401:
 *         description: 이미 가입된 이메일
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/sendEmail", authController.sendEmail); // 인증코드 이메일 발송

/**
 * @swagger
 * /auth/verifyCode:
 *   post:
 *     summary: 인증코드 검증
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 성공
 *       400:
 *         description: 인증 코드가 유효하지 않거나 만료됨
 *       404:
 *         description: 인증 요청이 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/verifyCode", authController.verifyCode); // 인증코드 검증

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birth:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               nickname:
 *                 type: string
 *               reuters_code:
 *                 type: string
 *               language:
 *                 type: string
 *               isAgreeCreditInfo:
 *                 type: boolean
 *               investPropensity:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *       400:
 *         description: 이미 회원가입된 이메일
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/register", authController.register); // 회원가입

/**
 * @swagger
 * /auth/registerSocial:
 *   post:
 *     summary: 소셜 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sns_id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               birth:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               nickname:
 *                 type: string
 *               reuters_code:
 *                 type: string
 *               language:
 *                 type: string
 *               login_type:
 *                 type: string
 *               isAgreeCreditInfo:
 *                 type: boolean
 *               investPropensity:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *       400:
 *         description: 이미 회원가입된 이메일
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/registerSocial", authController.registerSocial); // 소셜 회원가입

/**
 * @swagger
 * /auth/findPassword:
 *   post:
 *     summary: 비밀번호 찾기
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 이메일 전송 완료
 *       404:
 *         description: 가입되지 않은 이메일
 *       500:
 *         description: 서버 오류
 */
router.post("/auth/findPassword", authController.findPassword); // 비밀번호 찾기 (임시 비밀번호 발급)

export default router;
