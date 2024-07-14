import express from "express";
import * as interestStockController from "../controllers/interestStock-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get(
  "/interest/getInterestStocks",
  checkLoggedIn,
  interestStockController.getInterestStocks
); // 관심 주식 이름만 전체 가져오기
router.get(
  "/interest/getDetailInterestStocks",
  checkLoggedIn,
  interestStockController.getDetailInterestStocks
); // 관심 주식 전체 가져오기 (주식 정보 포함)
router.post(
  "/interest/insertInterestStock",
  checkLoggedIn,
  interestStockController.insertInterestStock
); // 관심 주식 1개 추가
router.put(
  "/interest/updateInterestStockOrder",
  checkLoggedIn,
  interestStockController.updateInterestStockOrder
); // 관심 주식 순서 바꾸기
router.delete(
  "/interest/deleteInterestStock/:reuters_code",
  checkLoggedIn,
  interestStockController.deleteInterestStock
); // 관심 주식 1개 삭제

export default router;
