import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const InterestStockSchema = new mongoose.Schema({
  user_snsId: { type: String, required: true, index: true },
  user_email: { type: String, required: true },
  is_delete: { type: Boolean, default: false },
  stock_list: [
    {
      stockName: { type: String, required: true },
      order: { type: Number, required: true },
      created_at: { type: Date, default: () => getKoreanTime() },
      updated_at: { type: Date, default: null },
    },
  ],
});

// 한 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStock = async function (stock) {
  const maxOrder = this.stock_list.length > 0 ? Math.max(...this.stock_list.map((s) => s.order)) : 0;
  this.stock_list.push({ stockName: stock, created_at: getKoreanTime(), order: maxOrder + 1 });
  await this.save();
};

// 여러 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStocks = async function (stocks) {
  const currentMaxOrder = this.stock_list.length > 0 ? Math.max(...this.stock_list.map((s) => s.order)) : 0;
  const stockEntries = stocks.map((stock, index) => ({
    stockName: stock,
    created_at: getKoreanTime(),
    order: currentMaxOrder + index + 1,
  }));
  this.stock_list = [...this.stock_list, ...stockEntries];
  await this.save();
};

// 한 개의 주식을 삭제하는 메서드
InterestStockSchema.methods.removeStock = async function (stock) {
  this.stock_list = this.stock_list.filter((s) => s.stockName !== stock);

  // order 재정렬
  this.stock_list.forEach((s, index) => {
    s.order = index + 1;
  });

  await this.save();
};

// 전체 주식 리스트를 업데이트하는 메서드
InterestStockSchema.methods.updateStockList = async function (stocks) {
  const stockEntries = stocks.map((stock, index) => ({
    stockName: stock,
    updated_at: getKoreanTime(),
    order: index + 1,
  }));
  this.stock_list = stockEntries;
  await this.save();
};

// 주식 리스트 순서 업데이트 메서드
InterestStockSchema.methods.updateStockOrder = async function (newOrder) {
  this.stock_list.forEach((s) => {
    s.order = newOrder.indexOf(s.stockName) + 1;
    s.updated_at = getKoreanTime();
  });

  await this.save();
};

const InterestStock = mongoose.models.InterestStock || mongoose.model("InterestStock", InterestStockSchema);
export default InterestStock;
