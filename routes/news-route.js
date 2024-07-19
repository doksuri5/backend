import express from "express";
import * as newsController from "../controllers/news-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/news/getTodayPopularNews", newsController.getTodayPopularNews); // 오늘 인기있는 뉴스
router.get("/news/getInterestStockNews", checkLoggedIn, newsController.getInterestStockNews); // 관심종목과 관련된 뉴스
router.get("/news/getRecentNews", newsController.getRecentNews); // 최신 뉴스
router.get("/news/getNews/:index", newsController.getNews); // 1개 뉴스 조회 (관련 기사 포함)
router.get("/news/hotNews", newsController.hotNews); // 주요 뉴스
router.get("/news/getSearchNews/:stock_name", newsController.getSearchNews); // 발견 페이지 - 검색에 따른 뉴스 조회
router.get("/news/getSearchNewsTotalNum/:stock_name", newsController.getSearchNewsTotalNum); // 발견 페이지 - 검색에 따른 뉴스 개수

export default router;
