import express from "express";
import {
  getCurrencyExchanges,
  getStockByReutersCode,
  getStocks,
  saveStockCurrency,
} from "../controllers/stock-controller.js";

/**
 * @swagger
 * tags:
 *   name: Stocks
 *   description: 주식 관련 API
 */

/**
 * @swagger
 * /stocks:
 *   get:
 *     summary: 모든 주식 조회
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: 주식 목록 조회 성공
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
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /stocks/{reuters_code}:
 *   get:
 *     summary: 특정 주식 조회
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: reuters_code
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 주식의 Reuters 코드
 *     responses:
 *       200:
 *         description: 주식 조회 성공
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
 *                     reuters_code:
 *                       type: string
 *                     symbol_code:
 *                       type: string
 *                     stock_name:
 *                       type: string
 *                     stock_name_eng:
 *                       type: string
 *                     close_price:
 *                       type: number
 *                     nation_type:
 *                       type: string
 *                     compare_to_previous_close_price:
 *                       type: number
 *                     fluctuations_ratio:
 *                       type: number
 *                     market_price:
 *                       type: number
 *                     investment_index:
 *                       type: number
 *                     profitability:
 *                       type: number
 *                     growth_rate:
 *                       type: number
 *                     interest_rate:
 *                       type: number
 *       404:
 *         description: 주식을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Stock not found
 *       500:
 *         description: 서버 오류
 */

const router = express.Router();

router.get("/stocks", getStocks);
router.post("/stocks/currency", saveStockCurrency);
router.get("/stocks/currency", getCurrencyExchanges);
router.get("/stocks/:reuters_code", getStockByReutersCode);

export default router;
