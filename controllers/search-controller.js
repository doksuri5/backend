import _ from "lodash";
import { hangulIncludes } from "es-hangul";
import NodeCache from "node-cache";
import mongoose from "mongoose";

import connectDB from "../database/db.js";
import Stock from "../schemas/stock-schema.js";
import RecentSearch from "../schemas/recentSearch-schema.js";
import RecentSearchText from "../schemas/recentSearchText-schema.js";
import PopularSearch from "../schemas/popularSearch-schema.js";
import SchedulePopularSearch from "../schemas/schedulePopularSearch-schema.js";
import User from "../schemas/user-schema.js";

import { getKoreanTime } from "../utils/getKoreanTime.js";
import { EN_STOCK_NAMES_TO_KO_STOCK_NAMES, VARIOUS_STOCK_TO_NAME } from "../constants/app.constants.js";

// 검색 캐시 초기화 (5초)
const searchCache = new NodeCache({ stdTTL: 5 });

// 발견 페이지 - 최근 검색어 보여줄 때 사용
export const getRecentSearches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB();

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    const searches = await RecentSearchText.find(
      { user_snsId: snsId, is_delete: false },
      { _id: 0, search_text: 1, search_date: 1 }
    )
      .sort({
        search_date: -1,
      })
      .session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: searches });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const getSearchStocks = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { search_text } = req.params;
    const { snsId } = req.session;

    const result = [];
    const lowerQuery = search_text.toLowerCase();

    // 영어 검색
    for (const code in EN_STOCK_NAMES_TO_KO_STOCK_NAMES) {
      if (code.includes(lowerQuery)) {
        result.push(EN_STOCK_NAMES_TO_KO_STOCK_NAMES[code]);
      }
    }

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const searchStockList = Object.entries(VARIOUS_STOCK_TO_NAME)
      .filter((stock) => hangulIncludes(stock[0], search_text))
      .map((stock) => stock[1]);

    const searchList = [...new Set([...result, ...searchStockList])];

    if (searchList.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    const stockData = await Stock.find({ stock_name: { $in: searchList } }).session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: stockData });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 관심 종목 페이지 모달 - 최근 검색한 종목 보여줄 때 사용
export const getRecentSearchDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB();

    // 최근 검색어 DB 조회
    const searches = await RecentSearch.find({ user_snsId: snsId, is_delete: false })
      .sort({
        search_date: -1,
      })
      .session(session);

    // 주식 DB 조회
    const stockNames = searches.map((search) => search.stock_name); // 최근 검색어에서 주식 이름만 가져와서 리스트로 변환
    const stockData = await Stock.find({ stock_name: { $in: stockNames } }).session(session); // stockNames 리스트에 있는 값들만 조회

    // 최근 검색어와 주식 데이터 병합
    const mergedList = _.map(searches, (search) => {
      const stock = _.find(stockData, { stock_name: search.stock_name });
      return { ...search.toObject(), ...stock?.toObject() };
    });

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: mergedList });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 인기 검색어 이름만
export const getPopularSearchesName = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 데이터베이스 연결
    await connectDB();

    // 인기 검색어 조회
    const popularSearches = await SchedulePopularSearch.find({}, { _id: 0, stock_name: 1, count: 1 })
      .sort({ count: -1 })
      .session(session);

    if (popularSearches.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: popularSearches });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 인기 검색어 디테일 정보까지
export const getPopularSearches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 데이터베이스 연결
    await connectDB();

    // 인기 검색어 조회
    const popularSearches = await SchedulePopularSearch.find().sort({ count: -1 }).session(session);

    if (popularSearches.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    const stocks = await Stock.find(
      {
        stock_name: {
          $in: popularSearches.map((search) => search.stock_name),
        },
      },
      {
        _id: 0,
        reuters_code: 1,
        close_price: 1,
        compare_to_previous_close_price: 1,
        fluctuations_ratio: 1,
        stock_name: 1,
      }
    ).session(session);

    const mergedList = _.map(popularSearches, (search) => {
      const stock = _.find(stocks, { stock_name: search.stock_name });
      return { ...search.toObject(), ...stock?.toObject() };
    });

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: mergedList });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 최근 검색어 저장
export const saveRecentSearch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const search_text = req.body.stock_name;
    const { snsId } = req.session;

    const lowerQuery = search_text.toLowerCase();

    // 영어 검색
    const EnStockList = [];
    for (const code in EN_STOCK_NAMES_TO_KO_STOCK_NAMES) {
      if (code.includes(lowerQuery)) {
        EnStockList.push(EN_STOCK_NAMES_TO_KO_STOCK_NAMES[code]);
      }
    }

    // 검색어가 6가지 종목 안에 포함되는 경우 (초성 포함)
    const KoStockList = Object.entries(VARIOUS_STOCK_TO_NAME)
      .filter((stock) => hangulIncludes(stock[0], search_text))
      .map((stock) => stock[1]);

    const searchList = [...new Set([...EnStockList, ...KoStockList])];

    if (searchList.length === 0) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    // 검색어 저장
    await RecentSearchText.findOneAndUpdate(
      { user_snsId: snsId, is_delete: false, search_text },
      { $set: { search_date: getKoreanTime(), is_delete: false } },
      { upsert: true, session }
    );

    // searchStockList를 기반으로 검색어 존재 여부 확인 및 업데이트 또는 추가
    for (const stock of searchList) {
      const existingSearch = await RecentSearch.findOne({
        user_snsId: snsId,
        is_delete: false,
        stock_name: stock,
      }).session(session);

      if (existingSearch) {
        // 존재하면 검색 날짜를 최신으로 업데이트
        existingSearch.search_date = getKoreanTime();
        await existingSearch.save({ session });
      } else {
        // 새로운 검색어 저장
        const newSearch = new RecentSearch({
          user_id: user._id,
          user_snsId: snsId,
          is_delete: false,
          stock_name: stock,
          search_date: getKoreanTime(),
        });
        await newSearch.save({ session });
      }
    }

    // 인기 검색어 카운트 +1 (5초 이내로 계속 검색 시 카운터가 되진 않음)
    const cacheKey = `${snsId}:search_${search_text}`;
    if (!searchCache.has(cacheKey)) {
      for (const stock of searchList) {
        await PopularSearch.findOneAndUpdate(
          { stock_name: stock },
          { $inc: { count: 1 }, $setOnInsert: { stock_name: stock } },
          { upsert: true, session }
        );
      }
      searchCache.set(cacheKey, true);
    }

    // 저장 후 검색어에 대한 정보 출력
    const result = await Stock.find({ stock_name: { $in: searchList } }).session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 유저 인덱스 따른 최근 검색어 삭제
export const deleteRecentSearches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const { snsId } = req.session;

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    await RecentSearch.deleteMany({ user_snsId: snsId, is_delete: false }).session(session); // sns_id에 따른 검색한 주식 전부 삭제

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: [], message: "recent searches deleted" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const deleteRecentSearchTextList = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const { snsId } = req.session;

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    await RecentSearchText.deleteMany({ user_snsId: snsId, is_delete: false }).session(session); // sns_id에 따른 검색어 전부 삭제

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: [], message: "recent searches deleted" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const deleteRecentSearchTextItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { search_text } = req.params;
    const { snsId } = req.session;

    // 유저 정보 조회
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "존재하지 않는 유저입니다." });
      await session.abortTransaction();
      return;
    }

    const searchStockList = Object.entries(VARIOUS_STOCK_TO_NAME)
      .filter((stock) => hangulIncludes(stock[0], search_text))
      .map((stock) => stock[1]);

    await RecentSearchText.deleteOne({ user_snsId: snsId, search_text, is_delete: false }).session(session);

    const searchesText = await RecentSearchText.find(
      { user_snsId: snsId, is_delete: false },
      { _id: 0, search_text: 1, search_date: 1 }
    )
      .sort({
        search_date: -1,
      })
      .session(session);

    await session.commitTransaction();
    res.status(200).json({ ok: true, data: searchesText });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};
