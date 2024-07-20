import express from "express";
import * as searchController from "../controllers/search-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

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
