import { hangulIncludes } from "es-hangul";
import connectDB from "../database/db.js";
import InterestStock from "../schemas/interestStock-schema.js";
import News from "../schemas/news-schema.js";
import Stock from "../schemas/stock-schema.js";
import { VARIOUS_STOCK_TO_REUTERS_CODE } from "../constants/app.constants.js";

// 오늘 인기있는 뉴스
export const getTodayPopularNews = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

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
        .limit(3 - news.length);

      news = news.concat(todayNews);

      if (news.length >= 3) break;

      // 하루 전으로 범위를 조정
      endDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - 1);
    }

    res.status(200).json({ ok: true, data: news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 관심종목과 관련된 뉴스
export const getInterestStockNews = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const { stock_list } = await InterestStock.findOne({ user_snsId: snsId, is_delete: false });
    const interest_stock_list = stock_list.map((item) => item.reuters_code);

    const interestStockNews = await News.find({ relative_stock: { $in: interest_stock_list } })
      .sort({
        published_time: -1,
        score: -1,
        view: -1,
      })
      .limit(6);

    res.status(200).json({ ok: true, data: interestStockNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 최신 뉴스
export const getRecentNews = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 4;
    const skip = (page - 1) * limit;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const recent_news = await News.find().sort({ published_time: -1 }).skip(skip).limit(limit);
    const total_page = Math.ceil((await News.countDocuments()) / 4);
    const now_page = Number(page);

    res.status(200).json({ ok: true, data: { total_page, now_page, recent_news } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 1개 뉴스 조회 (관련 기사 포함)
export const getNews = async (req, res) => {
  const { index } = req.params;

  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const news = await News.findOne({ index });
    const relative_stock = news.relative_stock;

    // 관련 주식
    const stock_data = await Stock.find({ reuters_code: { $in: relative_stock } });

    // 관련 뉴스
    const relative_news = await News.find(
      { relative_stock: { $in: relative_stock }, index: { $nin: index } },
      { _id: 0, index: 1, title: 1, published_time: 1, publisher: 1 }
    )
      .sort({
        published_time: -1,
      })
      .limit(4);

    res.status(200).json({ ok: true, data: { news, stock_data, relative_news } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 주요 뉴스
export const hotNews = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });
    const hotNews = await News.findOne().sort({ score: -1, view: -1, published_time: -1 });

    res.status(200).json({ ok: true, data: hotNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 발견 페이지 - 검색에 따른 뉴스 조회
export const getSearchNews = async (req, res) => {
  try {
    const { stock_name } = req.params;

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const searchStockList = Object.entries(VARIOUS_STOCK_TO_REUTERS_CODE)
      .filter((stock) => hangulIncludes(stock[0], stock_name))
      .map((stock) => stock[1]);

    if (searchStockList.length === 0) {
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 페이지에 맞는 뉴스 리스트를 가져옴
    const searchNews = await News.find(
      { relative_stock: { $in: searchStockList } },
      { index: 1, title: 1, published_time: 1, publisher: 1, thumbnail_url: 1, _id: 1 }
    ).sort({
      published_time: -1,
      score: -1,
      view: -1,
    });

    res.status(200).json({ ok: true, data: searchNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 발견 페이지 - 검색에 따른 뉴스 조회
export const getSearchNewsTotalNum = async (req, res) => {
  try {
    const { stock_name } = req.params;

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const searchStockList = Object.entries(VARIOUS_STOCK_TO_REUTERS_CODE)
      .filter((stock) => hangulIncludes(stock[0], stock_name))
      .map((stock) => stock[1]);

    if (searchStockList.length === 0) {
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 전체 뉴스 개수를 가져옵니다
    const totalNewsCount = await News.countDocuments({
      relative_stock: { $in: searchStockList },
    });

    res.status(200).json({ ok: true, data: [totalNewsCount] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
