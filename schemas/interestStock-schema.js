import mongoose from "mongoose";
import { getKoreanTime } from "../utils/getKoreanTime.js";

const InterestStockSchema = new mongoose.Schema({
  user_snsId: { type: String, required: true, index: true },
  user_email: { type: String, required: true },
  is_delete: { type: Boolean, default: false },
  stock_list: [
    {
      reuters_code: { type: String, required: true },
      order: { type: Number, required: true },
      created_at: { type: Date, default: () => getKoreanTime() },
      updated_at: { type: Date, default: null },
    },
  ],
});

// 한 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStock = async function (stock, options = {}) {
  // 이미 추가된 주식인지 확인
  if (this.stock_list.find((s) => s.reuters_code === stock)) {
    throw new Error("이미 추가된 주식입니다.");
  }

  // 모든 주식의 order를 1씩 증가시킴
  this.stock_list.forEach((s) => {
    s.order += 1;
  });

  // 새로운 주식을 order 1로 추가
  this.stock_list.push({
    reuters_code: stock,
    created_at: getKoreanTime(),
    order: 1,
  });

  await this.save(options);
};

// 여러 개의 주식을 추가하는 메서드
InterestStockSchema.methods.addStocks = async function (stocks, options = {}) {
  const currentMaxOrder = this.stock_list.length > 0 ? Math.max(...this.stock_list.map((s) => s.order)) : 0;
  const stockEntries = stocks.map((stock, index) => ({
    reuters_code: stock,
    created_at: getKoreanTime(),
    order: currentMaxOrder + index + 1,
  }));
  this.stock_list = [...this.stock_list, ...stockEntries];
  await this.save(options);
};

// 한 개의 주식을 삭제하는 메서드
InterestStockSchema.methods.removeStock = async function (stock, options = {}) {
  this.stock_list = this.stock_list.filter((s) => s.reuters_code !== stock);

  // order 재정렬
  this.stock_list
    .sort((a, b) => a.order - b.order)
    .forEach((s, index) => {
      s.order = index + 1;
    });

  await this.save(options);
};

// 전체 주식 리스트를 업데이트하는 메서드
InterestStockSchema.methods.updateStockList = async function (stocks, options = {}) {
  const stockEntries = stocks.map((stock, index) => ({
    reuters_code: stock,
    updated_at: getKoreanTime(),
    order: index + 1,
  }));
  this.stock_list = stockEntries;
  await this.save(options);
};

// 주식 리스트 순서 업데이트 메서드
InterestStockSchema.methods.updateStockOrder = async function (newOrder, options = {}) {
  this.stock_list.forEach((s) => {
    s.order = newOrder.indexOf(s.reuters_code) + 1;
    s.updated_at = getKoreanTime();
  });

  await this.save(options);
};

const InterestStock = mongoose.models.InterestStock || mongoose.model("InterestStock", InterestStockSchema);
export default InterestStock;
