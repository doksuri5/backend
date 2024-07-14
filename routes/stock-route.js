import express from "express";
import {
  getStockByReutersCode,
  getStocks,
} from "../controllers/stock-controller.js";

const router = express.Router();

router.get("/stocks", getStocks);
router.get("/stocks/:reuters_code", getStockByReutersCode);

export default router;
