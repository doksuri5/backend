import express from "express";
import * as propensityController from "../controllers/propensity-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

/**
 * @swagger
 * tags:
 *   name: Propensity
 *   description: 투자 성향 관련 API
 */

/**
 * @swagger
 * /propensity/getPropensity:
 *   get:
 *     summary: 투자 성향 가져오기
 *     tags: [Propensity]
 *     responses:
 *       200:
 *         description: 투자 성향 조회 성공
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
 *                     user_snsId:
 *                       type: string
 *                     login_type:
 *                       type: string
 *                     is_agree_credit_info:
 *                       type: boolean
 *                     invest_propensity:
 *                       type: object
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
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
 * /propensity/updatePropensity:
 *   put:
 *     summary: 투자 성향 업데이트
 *     tags: [Propensity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAgreeCreditInfo:
 *                 type: boolean
 *               investPropensity:
 *                 type: object
 *     responses:
 *       200:
 *         description: 투자 성향 업데이트 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 투자성향 업데이트 완료
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

const router = express.Router();

router.get("/propensity/getPropensity", checkLoggedIn, propensityController.getPropensity);
router.put("/propensity/updatePropensity", checkLoggedIn, propensityController.updatePropensity);

export default router;
