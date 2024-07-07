import express from "express";
import * as interestStockController from "../controllers/interestStock-controller.js";

const router = express.Router();

router.get("/interest/getInterestStocks", interestStockController.getInterestStocks); // 관심 주식 이름만 전체 가져오기
router.get("/interest/getDetailInterestStocks", interestStockController.getDetailInterestStocks); // 관심 주식 전체 가져오기 (주식 정보 포함)
router.post("/interest/insertInterestStock", interestStockController.insertInterestStock); // 관심 주식 1개 추가
router.put("/interest/updateInterestStockOrder", interestStockController.updateInterestStockOrder); // 관심 주식 순서 바꾸기
router.delete("/interest/deleteInterestStock/:stockName", interestStockController.deleteInterestStock); // 관심 주식 1개 삭제

export default router;
