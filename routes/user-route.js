import express from "express";
import * as userController from "../controllers/user-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 API
 */

/**
 * @swagger
 * /getUser/{user_email}:
 *   get:
 *     summary: 유저 정보 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_email
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 사용자의 이메일
 *     responses:
 *       200:
 *         description: 유저 정보 조회 성공
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
 *                     sns_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     birth:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     profile:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     login_type:
 *                       type: string
 *                     interest_stocks:
 *                       type: array
 *                       items:
 *                         type: string
 *                     user_propensity:
 *                       type: object
 *                       properties:
 *                         is_agree_credit_info:
 *                           type: boolean
 *                         invest_propensity:
 *                           type: object
 *       401:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 사용자를 찾을 수 없습니다.
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
 * /user/emailCert:
 *   post:
 *     summary: 이메일 인증 (인증번호 발송)
 *     tags: [Users]
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
 *         description: 인증코드 전송 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 인증코드 전송 완료
 *       401:
 *         description: 사용자를 찾을 수 없거나 이메일이 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 현재 사용자가 다른 이메일을 사용하고 있습니다. 다시 로그인 해주세요.
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
 * /user/passwordCert:
 *   post:
 *     summary: 비밀번호 인증
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 인증 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 비밀번호 인증 완료
 *       401:
 *         description: 사용자를 찾을 수 없거나 이메일이 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 현재 사용자가 다른 이메일을 사용하고 있습니다. 다시 로그인 해주세요.
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
 * /user/withdraw:
 *   post:
 *     summary: 유저 탈퇴
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               reason:
 *                 type: string
 *               reason_other:
 *                 type: string
 *     responses:
 *       200:
 *         description: 탈퇴 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 탈퇴 완료
 *       400:
 *         description: 입력한 이메일이 현재 사용자의 이메일과 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 입력한 이메일이 현재 사용자의 이메일과 일치하지 않습니다.
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
 * /user/updateUserInfo:
 *   put:
 *     summary: 개인정보 수정
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               birth:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회원 정보 수정 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 회원 정보 수정 완료
 *       404:
 *         description: 회원 정보가 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 회원 정보가 일치하지 않습니다.
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
 * /user/updateUserProfile:
 *   put:
 *     summary: 프로필 수정
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               gender:
 *                 type: string
 *               interest_stocks:
 *                 type: array
 *                 items:
 *                   type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 프로필 수정 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 프로필 수정 완료
 *       401:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 사용자를 찾을 수 없습니다.
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
 * /user/language:
 *   patch:
 *     summary: 언어 변경
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: 언어 변경 성공
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
 *                     snsId:
 *                       type: string
 *                     language:
 *                       type: string
 *       400:
 *         description: 언어를 선택하지 않은 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 언어를 선택해주세요.
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

router.get("/getUser/:user_email", checkLoggedIn, userController.getUser); // 유저 정보 조회
router.post("/user/emailCert", checkLoggedIn, userController.emailCert); // 이메일 인증 (인증번호 발송)
router.post("/user/passwordCert", checkLoggedIn, userController.passwordCert); // 비밀번호 인증
router.post("/user/withdraw", checkLoggedIn, userController.withdraw); // 유저 탈퇴
router.put("/user/updateUserInfo", checkLoggedIn, userController.updateUserInfo); // 개인정보 수정
router.put("/user/updateUserProfile", checkLoggedIn, userController.updateUserProfile); // 프로필 수정
router.patch("/user/language", checkLoggedIn, userController.language); // 언어 변경

export default router;
