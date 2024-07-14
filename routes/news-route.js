import express from "express";
import * as newsController from "../controllers/news-controller.js";

const router = express.Router();

router.get("/news/getTodayPopularNews", newsController.getTodayPopularNews); // 오늘 인기있는 뉴스
router.get("/news/getInterestStockNews", newsController.getInterestStockNews); // 관심종목과 관련된 뉴스
router.get("/news/getRecentNews", newsController.getRecentNews); // 최신 뉴스
router.get("/news/getNews/:index", newsController.getNews); // 1개 뉴스 조회 (관련 기사 포함)
router.get("/news/hotNews", newsController.hotNews); // 주요 뉴스

export default router;
