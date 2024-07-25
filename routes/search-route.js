import express from "express";
import * as searchController from "../controllers/search-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: 검색 관련 API
 */

/**
 * @swagger
 * /getRecentSearches:
 *   get:
 *     summary: 발견 페이지 - 최근 검색어 보여줄 때 사용
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 최근 검색어 목록 조회 성공
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
 *                       search_text:
 *                         type: string
 *                       search_date:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /getSearchStocks/{search_text}:
 *   get:
 *     summary: 발견 페이지 - 검색한 주식 조회
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: search_text
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *     responses:
 *       200:
 *         description: 검색한 주식 목록 조회 성공
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
 * /getPopularSearchesName:
 *   get:
 *     summary: 인기 검색어 가져오기 (이름만)
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 인기 검색어 목록 조회 성공
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
 *                       stock_name:
 *                         type: string
 *                       count:
 *                         type: number
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /deleteRecentSearchTextList:
 *   delete:
 *     summary: 유저 인덱스 따른 최근 검색어 전체 삭제
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 최근 검색어 전체 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /deleteRecentSearchTextItem/{search_text}:
 *   delete:
 *     summary: 유저 인덱스 따른 최근 검색어 개별 삭제
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: search_text
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 검색어
 *     responses:
 *       200:
 *         description: 최근 검색어 개별 삭제 성공
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
 *                       search_text:
 *                         type: string
 *                       search_date:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /getRecentSearchDetails:
 *   get:
 *     summary: 관심 종목 페이지 모달 - 최근 검색한 종목 보여줄 때 사용
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 최근 검색한 종목 목록 조회 성공
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
 *                       search_date:
 *                         type: string
 *                         format: date-time
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
 * /getPopularSearches:
 *   get:
 *     summary: 인기 검색어 가져오기 (디테일 정보까지)
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 인기 검색어 목록 및 디테일 정보 조회 성공
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
 *                       stock_name:
 *                         type: string
 *                       count:
 *                         type: number
 *                       reuters_code:
 *                         type: string
 *                       close_price:
 *                         type: number
 *                       compare_to_previous_close_price:
 *                         type: number
 *                       fluctuations_ratio:
 *                         type: number
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /deleteRecentSearches:
 *   delete:
 *     summary: 유저 인덱스 따른 최근 검색어 및 검색한 주식 전부 삭제
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 최근 검색어 및 검색한 주식 전부 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /saveRecentSearch:
 *   patch:
 *     summary: 최근 검색어 저장
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 최근 검색어 저장 성공
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

const router = express.Router();

// 발견 페이지
router.get("/getRecentSearches", checkLoggedIn, searchController.getRecentSearches); // 발견 페이지 - 최근 검색어 보여줄 때 사용
router.get("/getSearchStocks/:search_text", searchController.getSearchStocks); // 발견 페이지 - 검색한 주식 조회
router.get("/getPopularSearchesName", searchController.getPopularSearchesName); // 인기 검색어 가져오기 이름만
router.delete("/deleteRecentSearchTextList", checkLoggedIn, searchController.deleteRecentSearchTextList); // 유저 인덱스 따른 최근 검색어 개별 삭제
router.delete("/deleteRecentSearchTextItem/:search_text", checkLoggedIn, searchController.deleteRecentSearchTextItem); // 유저 인덱스 따른 최근 검색어 개별 삭제

// 관심 주식 페이지
router.get("/getRecentSearchDetails", checkLoggedIn, searchController.getRecentSearchDetails); // 관심 종목 페이지 모달 - 최근 검색한 종목 보여줄 때 사용
router.get("/getPopularSearches", searchController.getPopularSearches); // 인기 검색어 가져오기 디테일 정보까지
router.delete("/deleteRecentSearches", checkLoggedIn, searchController.deleteRecentSearches); // 유저 인덱스 따른 최근 검색어 및 검색한 주식 전부 삭제

// 공통
router.patch("/saveRecentSearch", checkLoggedIn, searchController.saveRecentSearch); // 최근 검색어 저장

export default router;
