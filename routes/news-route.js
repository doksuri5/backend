import express from "express";
import * as newsController from "../controllers/news-controller.js";

const router = express.Router();

router.get("/news/getTodayPopularNews", newsController.getTodayPopularNews);
router.get("/news/getInterestStockNews", newsController.getInterestStockNews);
router.get("/news/getRecentNews", newsController.getRecentNews);
router.get("/news/getNews/:index", newsController.getNews);

export default router;
