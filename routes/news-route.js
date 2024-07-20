import express from "express";
import * as newsController from "../controllers/news-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

// /**
//  * @swagger
//  * tags:
//  *   name: News
//  *   description: 뉴스 관련 API
//  */

// /**
//  * @swagger
//  * /news/getTodayPopularNews:
//  *   get:
//  *     summary: 오늘 인기있는 뉴스 가져오기
//  *     tags: [News]
//  *     responses:
//  *       200:
//  *         description: 오늘 인기있는 뉴스 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       index:
//  *                         type: string
//  *                       publisher:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       thumbnail_url:
//  *                         type: string
//  *                       title:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       description:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       published_time:
//  *                         type: string
//  *                       link:
//  *                         type: string
//  *                       content:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       content_img:
//  *                         type: string
//  *                       relative_stock:
//  *                         type: array
//  *                         items:
//  *                           type: string
//  *                       score:
//  *                         type: number
//  *                       view:
//  *                         type: number
//  *                       ai_summary:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *       500:
//  *         description: 서버 오류
//  */

// /**
//  * @swagger
//  * /news/getInterestStockNews:
//  *   get:
//  *     summary: 관심종목과 관련된 뉴스 가져오기
//  *     tags: [News]
//  *     responses:
//  *       200:
//  *         description: 관심종목과 관련된 뉴스 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       index:
//  *                         type: string
//  *                       publisher:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       thumbnail_url:
//  *                         type: string
//  *                       title:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       description:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       published_time:
//  *                         type: string
//  *                       link:
//  *                         type: string
//  *                       content:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       content_img:
//  *                         type: string
//  *                       relative_stock:
//  *                         type: array
//  *                         items:
//  *                           type: string
//  *                       score:
//  *                         type: number
//  *                       view:
//  *                         type: number
//  *                       ai_summary:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *       401:
//  *         description: 사용자를 찾을 수 없음
//  *       500:
//  *         description: 서버 오류
//  */

// /**
//  * @swagger
//  * /news/getRecentNews:
//  *   get:
//  *     summary: 최신 뉴스 가져오기
//  *     tags: [News]
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         required: false
//  *         schema:
//  *           type: integer
//  *         description: 페이지 번호
//  *     responses:
//  *       200:
//  *         description: 최신 뉴스 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       index:
//  *                         type: string
//  *                       publisher:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       thumbnail_url:
//  *                         type: string
//  *                       title:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       description:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       published_time:
//  *                         type: string
//  *                       link:
//  *                         type: string
//  *                       content:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       content_img:
//  *                         type: string
//  *                       relative_stock:
//  *                         type: array
//  *                         items:
//  *                           type: string
//  *                       score:
//  *                         type: number
//  *                       view:
//  *                         type: number
//  *                       ai_summary:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *       500:
//  *         description: 서버 오류
//  */

// /**
//  * @swagger
//  * /news/getNews/{index}:
//  *   get:
//  *     summary: 1개 뉴스 조회 (관련 기사 포함)
//  *     tags: [News]
//  *     parameters:
//  *       - in: path
//  *         name: index
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: 뉴스 인덱스
//  *     responses:
//  *       200:
//  *         description: 뉴스 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     news:
//  *                       type: object
//  *                       properties:
//  *                         index:
//  *                           type: string
//  *                         publisher:
//  *                           type: object
//  *                           properties:
//  *                             ko:
//  *                               type: string
//  *                             en:
//  *                               type: string
//  *                             ch:
//  *                               type: string
//  *                             jp:
//  *                               type: string
//  *                         thumbnail_url:
//  *                           type: string
//  *                         title:
//  *                           type: object
//  *                           properties:
//  *                             ko:
//  *                               type: string
//  *                             en:
//  *                               type: string
//  *                             ch:
//  *                               type: string
//  *                             jp:
//  *                               type: string
//  *                         description:
//  *                           type: object
//  *                           properties:
//  *                             ko:
//  *                               type: string
//  *                             en:
//  *                               type: string
//  *                             ch:
//  *                               type: string
//  *                             jp:
//  *                               type: string
//  *                         published_time:
//  *                           type: string
//  *                         link:
//  *                           type: string
//  *                         content:
//  *                           type: object
//  *                           properties:
//  *                             ko:
//  *                               type: string
//  *                             en:
//  *                               type: string
//  *                             ch:
//  *                               type: string
//  *                             jp:
//  *                               type: string
//  *                         content_img:
//  *                           type: string
//  *                         relative_stock:
//  *                           type: array
//  *                           items:
//  *                             type: string
//  *                         score:
//  *                           type: number
//  *                         view:
//  *                           type: number
//  *                         ai_summary:
//  *                           type: object
//  *                           properties:
//  *                             ko:
//  *                               type: string
//  *                             en:
//  *                               type: string
//  *                             ch:
//  *                               type: string
//  *                             jp:
//  *                               type: string
//  *                     relativeNews:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           index:
//  *                             type: string
//  *                           title:
//  *                             type: object
//  *                             properties:
//  *                               ko:
//  *                                 type: string
//  *                               en:
//  *                                 type: string
//  *                               ch:
//  *                                 type: string
//  *                               jp:
//  *                                 type: string
//  *                           published_time:
//  *                             type: string
//  *                           publisher:
//  *                             type: object
//  *                             properties:
//  *                               ko:
//  *                                 type: string
//  *                               en:
//  *                                 type: string
//  *                               ch:
//  *                                 type: string
//  *                               jp:
//  *                                 type: string
//  *       500:
//  *         description: 서버 오류
//  */

// /**
//  * @swagger
//  * /news/hotNews:
//  *   get:
//  *     summary: 주요 뉴스 가져오기
//  *     tags: [News]
//  *     responses:
//  *       200:
//  *         description: 주요 뉴스 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     index:
//  *                       type: string
//  *                     publisher:
//  *                       type: object
//  *                       properties:
//  *                         ko:
//  *                           type: string
//  *                         en:
//  *                           type: string
//  *                         ch:
//  *                           type: string
//  *                         jp:
//  *                           type: string
//  *                     thumbnail_url:
//  *                       type: string
//  *                     title:
//  *                       type: object
//  *                       properties:
//  *                         ko:
//  *                           type: string
//  *                         en:
//  *                           type: string
//  *                         ch:
//  *                           type: string
//  *                         jp:
//  *                           type: string
//  *                     description:
//  *                       type: object
//  *                       properties:
//  *                         ko:
//  *                           type: string
//  *                           en:
//  *                           type: string
//  *                           ch:
//  *                           type: string
//  *                           jp:
//  *                           type: string
//  *                     published_time:
//  *                       type: string
//  *                     link:
//  *                       type: string
//  *                     content:
//  *                       type: object
//  *                       properties:
//  *                         ko:
//  *                           type: string
//  *                         en:
//  *                           type: string
//  *                         ch:
//  *                           type: string
//  *                         jp:
//  *                           type: string
//  *                     content_img:
//  *                       type: string
//  *                     relative_stock:
//  *                       type: array
//  *                       items:
//  *                         type: string
//  *                     score:
//  *                       type: number
//  *                     view:
//  *                       type: number
//  *                     ai_summary:
//  *                       type: object
//  *                       properties:
//  *                         ko:
//  *                           type: string
//  *                         en:
//  *                           type: string
//  *                         ch:
//  *                           type: string
//  *                         jp:
//  *                           type: string
//  *       500:
//  *         description: 서버 오류
//  */

// /**
//  * @swagger
//  * /news/getSearchNews/{stock_name}:
//  *   get:
//  *     summary: 발견 페이지 - 검색에 따른 뉴스 조회
//  *     tags: [News]
//  *     parameters:
//  *       - in: path
//  *         name: stock_name
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: 검색어
//  *     responses:
//  *       200:
//  *         description: 검색어에 따른 뉴스 목록 조회 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 ok:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       index:
//  *                         type: string
//  *                       title:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       published_time:
//  *                         type: string
//  *                       publisher:
//  *                         type: object
//  *                         properties:
//  *                           ko:
//  *                             type: string
//  *                           en:
//  *                             type: string
//  *                           ch:
//  *                             type: string
//  *                           jp:
//  *                             type: string
//  *                       thumbnail_url:
//  *                         type: string
//  *                       _id:
//  *                         type: string
//  *       500:
//  *         description: 서버 오류
//  */

const router = express.Router();

router.get("/news/getTodayPopularNews", newsController.getTodayPopularNews); // 오늘 인기있는 뉴스
router.get("/news/getInterestStockNews", checkLoggedIn, newsController.getInterestStockNews); // 관심종목과 관련된 뉴스
router.get("/news/getRecentNews", newsController.getRecentNews); // 최신 뉴스
router.get("/news/getNews/:index", newsController.getNews); // 1개 뉴스 조회 (관련 기사 포함)
router.get("/news/hotNews", newsController.hotNews); // 주요 뉴스
router.get("/news/getSearchNews/:stock_name", newsController.getSearchNews); // 발견 페이지 - 검색에 따른 뉴스 조회
router.get("/news/getSearchNewsTotalNum/:stock_name", newsController.getSearchNewsTotalNum); // 발견 페이지 - 검색에 따른 뉴스 개수

export default router;
