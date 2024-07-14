import express from "express";
import * as recentSearchController from "../controllers/recentSearch-controller.js";

const router = express.Router();

router.get("/getRecentSearches", recentSearchController.getRecentSearches); // 발견 페이지 - 최근 검색어 보여줄 때 사용
router.get(
  "/getRecentSearchDetails",
  recentSearchController.getRecentSearchDetails
); // 관심 종목 페이지 모달 - 최근 검색한 종목 보여줄 때 사용
router.patch("/saveRecentSearch", recentSearchController.saveRecentSearch); // 최근 검색어 저장
router.delete(
  "/deleteRecentSearches",
  recentSearchController.deleteRecentSearches
); // 유저 인덱스 따른 최근 검색어 삭제
router.get("/getPopularSearches", recentSearchController.getPopularSearches); // 인기 검색어 가져오기

export default router;
