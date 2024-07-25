import express from "express";
import * as interestStockController from "../controllers/interestStock-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

/**
 * @swagger
 * tags:
 *   name: InterestStocks
 *   description: 관심 주식 관련 API
 */

/**
 * @swagger
 * /interest/getInterestStocks:
 *   get:
 *     summary: 관심 주식 이름만 전체 가져오기
 *     tags: [InterestStocks]
 *     responses:
 *       200:
 *         description: 관심 주식 이름만 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
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
 * /interest/getDetailInterestStocks:
 *   get:
 *     summary: 관심 주식 전체 가져오기 (주식 정보 포함)
 *     tags: [InterestStocks]
 *     responses:
 *       200:
 *         description: 관심 주식 전체 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reuters_code:
 *                         type: string
 *                       order:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       symbol_code:
 *                         type: string
 *                       stock_name:
 *                         type: string
 *                       stock_name_eng:
 *                         type: string
 *                       close_price:
 *                         type: number
 *                       nation_type:
 *                         type: string
 *                       compare_to_previous_close_price:
 *                         type: number
 *                       fluctuations_ratio:
 *                         type: number
 *                       market_price:
 *                         type: number
 *                       investment_index:
 *                         type: number
 *                       profitability:
 *                         type: number
 *                       growth_rate:
 *                         type: number
 *                       interest_rate:
 *                         type: number
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
 * /interest/insertInterestStock:
 *   post:
 *     summary: 관심 주식 1개 추가
 *     tags: [InterestStocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reuters_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 관심 주식 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reuters_code:
 *                         type: string
 *                       order:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
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
 * /interest/updateInterestStockOrder:
 *   put:
 *     summary: 관심 주식 순서 바꾸기
 *     tags: [InterestStocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockList:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 관심 주식 순서 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reuters_code:
 *                         type: string
 *                       order:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
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
 *       400:
 *         description: 순서를 변경할 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 순서를 변경할 수 없습니다.
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
 * /interest/deleteInterestStock/{reuters_code}:
 *   delete:
 *     summary: 관심 주식 1개 삭제
 *     tags: [InterestStocks]
 *     parameters:
 *       - in: path
 *         name: reuters_code
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 주식의 Reuters 코드
 *     responses:
 *       200:
 *         description: 관심 주식 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reuters_code:
 *                         type: string
 *                       order:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: delete complete
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
 *       404:
 *         description: 관심 주식 리스트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 관심 주식 리스트를 찾을 수 없습니다.
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

router.get("/interest/getInterestStocks", checkLoggedIn, interestStockController.getInterestStocks);
router.get("/interest/getDetailInterestStocks", checkLoggedIn, interestStockController.getDetailInterestStocks);
router.post("/interest/insertInterestStock", checkLoggedIn, interestStockController.insertInterestStock);
router.put("/interest/updateInterestStockOrder", checkLoggedIn, interestStockController.updateInterestStockOrder);
router.delete(
  "/interest/deleteInterestStock/:reuters_code",
  checkLoggedIn,
  interestStockController.deleteInterestStock
);

export default router;
