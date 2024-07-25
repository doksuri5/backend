import { hangulIncludes } from "es-hangul";
import mongoose from "mongoose";
import connectDB from "../database/db.js";
import InterestStock from "../schemas/interestStock-schema.js";
import News from "../schemas/news-schema.js";
import Stock from "../schemas/stock-schema.js";
import { EN_STOCK_NAMES_TO_REUTERS_CODE, VARIOUS_STOCK_TO_REUTERS_CODE } from "../constants/app.constants.js";

// 오늘 인기있는 뉴스
export const getTodayPopularNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 데이터베이스 연결
    await connectDB();

    const koreanOffset = 9 * 60 * 60 * 1000; // 한국 시간은 UTC+9

    const today = new Date(new Date().setHours(0, 0, 0, 0) + koreanOffset);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const padZero = (num) => (num < 10 ? "0" : "") + num;

    const formatDate = (date) =>
      `${date.getFullYear()}.${padZero(date.getMonth() + 1)}.${padZero(date.getDate())} 00:00`;

    let startDate = new Date(today);
    let endDate = new Date(tomorrow);
    let news = [];

    while (news.length < 3) {
      const startDateString = formatDate(startDate);
      const endDateString = formatDate(endDate);

      const todayNews = await News.find({ published_time: { $gte: startDateString, $lte: endDateString } })
        .sort({ score: -1, view: -1, published_time: -1 })
        .limit(3 - news.length)
        .session(session);

      news = news.concat(todayNews);

      if (news.length >= 3) break;

      // 하루 전으로 범위를 조정
      endDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - 1);
    }

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: news ?? [] });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 관심종목과 관련된 뉴스
export const getInterestStockNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB();

    const { stock_list } = await InterestStock.findOne({ user_snsId: snsId, is_delete: false }).session(session);
    const interest_stock_list = stock_list.map((item) => item.reuters_code);

    const interestStockNews = await News.find({ relative_stock: { $in: interest_stock_list } })
      .sort({
        published_time: -1,
        score: -1,
        view: -1,
      })
      .limit(6)
      .session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: interestStockNews ?? [] });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 최신 뉴스
export const getRecentNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { page = 1 } = req.query;
    const limit = 4;
    const skip = (page - 1) * limit;

    // 데이터베이스 연결
    await connectDB();

    const recent_news = await News.find().sort({ published_time: -1 }).skip(skip).limit(limit).session(session);
    const total_page = Math.ceil((await News.countDocuments().session(session)) / 4);
    const now_page = Number(page);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: { total_page, now_page, recent_news } });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 1개 뉴스 조회 (관련 기사 포함)
export const getNews = async (req, res) => {
  const { index } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 데이터베이스 연결
    await connectDB();

    const news = await News.findOne({ index }).session(session);
    const relative_stock = news.relative_stock;

    // 관련 주식
    const stock_data = await Stock.find({ reuters_code: { $in: relative_stock } }).session(session);

    // 관련 뉴스
    const relative_news = await News.find(
      { relative_stock: { $in: relative_stock }, index: { $nin: index } },
      { _id: 0, index: 1, title: 1, published_time: 1, publisher: 1 }
    )
      .sort({
        published_time: -1,
      })
      .limit(4)
      .session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: { news, stock_data, relative_news } });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 주요 뉴스
export const hotNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 데이터베이스 연결
    await connectDB();

    const hotNews = await News.findOne().sort({ score: -1, view: -1, published_time: -1 }).session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: hotNews });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 발견 페이지 - 검색에 따른 뉴스 조회
export const getSearchNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { stock_name } = req.params;

    const result = [];
    const lowerQuery = stock_name.toLowerCase();

    // 영어 검색
    for (const code in EN_STOCK_NAMES_TO_REUTERS_CODE) {
      if (code.includes(lowerQuery)) {
        result.push(EN_STOCK_NAMES_TO_REUTERS_CODE[code]);
      }
    }

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const searchStockList = Object.entries(VARIOUS_STOCK_TO_REUTERS_CODE)
      .filter((stock) => hangulIncludes(stock[0], stock_name))
      .map((stock) => stock[1]);

    const searchList = [...new Set([...result, ...searchStockList])];

    if (searchList.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 페이지에 맞는 뉴스 리스트를 가져옴
    const searchNews = await News.find(
      { relative_stock: { $in: searchList } },
      { index: 1, title: 1, published_time: 1, publisher: 1, thumbnail_url: 1, _id: 1 }
    )
      .sort({
        published_time: -1,
        score: -1,
        view: -1,
      })
      .session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: searchNews ?? [] });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 발견 페이지 - 검색에 따른 뉴스 조회
export const getSearchNewsTotalNum = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { stock_name } = req.params;

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const searchStockList = Object.entries(VARIOUS_STOCK_TO_REUTERS_CODE)
      .filter((stock) => hangulIncludes(stock[0], stock_name))
      .map((stock) => stock[1]);

    if (searchStockList.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 전체 뉴스 개수를 가져옵니다
    const totalNewsCount = await News.countDocuments({
      relative_stock: { $in: searchStockList },
    }).session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: [totalNewsCount] });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};
