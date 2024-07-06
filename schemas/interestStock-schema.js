import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const InterestStockSchema = new mongoose.Schema({
  user_email: { type: String, required: true, index: true },
  stock_list: [
    {
      stockName: {
        type: String,
        required: true,
      },
      created_at: {
        type: Date,
        default: () => getKoreanTime(),
      },
    },
  ],
});

// 한 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStock = async function (stock) {
  this.stock_list.unshift({ stockName: stock, created_at: getKoreanTime() });
  await this.save();
};

// 여러 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStocks = async function (stocks) {
  const stockEntries = stocks.map((stock) => ({
    stockName: stock,
    created_at: getKoreanTime(),
  }));
  this.stock_list = [...stockEntries, ...this.stock_list];
  await this.save();
};

// 한 개의 주식을 삭제하는 메서드
InterestStockSchema.methods.removeStock = async function (stock) {
  this.stock_list = this.stock_list.filter((s) => s.stockName !== stock);
  await this.save();
};

// 전체 주식 리스트를 업데이트하는 메서드
InterestStockSchema.methods.updateStockList = async function (stocks) {
  const stockEntries = stocks.map((stock) => ({
    stock,
    created_at: getKoreanTime(),
  }));
  this.stock_list = stockEntries;
  await this.save();
};

const InterestStock = mongoose.models.InterestStock || mongoose.model("InterestStock", InterestStockSchema);
export default InterestStock;
