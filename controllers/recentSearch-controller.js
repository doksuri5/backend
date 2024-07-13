import _ from "lodash";
import NodeCache from "node-cache";
import connectDB from "../database/db.js";
import Stock from "../schemas/stock-schema.js";
import RecentSearch from "../schemas/recentSearch-schema.js";
import PopularSearch from "../schemas/popularSearch-schema.js";
import { STOCK_NAME_LIST } from "../constants/app.constants.js";

// 검색 캐시 초기화 (5초)
const searchCache = new NodeCache({ stdTTL: 5 });

// 발견 페이지 - 최근 검색어 보여줄 때 사용
export const getRecentSearches = async (req, res) => {
  try {
    const { user_id } = req.session;
    // 데이터베이스 연결
    await connectDB();

    const searches = await RecentSearch.find({ user_id }).sort({
      search_date: -1,
    });

    res.status(200).json({ ok: true, data: searches });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 관심 종목 페이지 모달 - 최근 검색한 종목 보여줄 때 사용
export const getRecentSearchDetails = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const { user_id } = req.session;
    // 데이터베이스 연결
    await connectDB();

    // 최근 검색어 DB 조회
    const searches = await RecentSearch.find({ user_id }).sort({
      search_date: -1,
    });

    // 주식 DB 조회
    const stockNames = searches.map((search) => search.stock_name); // 최근 검색어에서 주식 이름만 가져와서 리스트로 변환
    const stockData = await Stock.find({ stock_name: { $in: stockNames } }); // stockNames 리스트에 있는 값들만 조회

    // 최근 검색어와 주식 데이터 병합
    const mergedList = _.map(searches, (search) => {
      const stock = _.find(stockData, { stock_name: search.stock_name });
      return { ...search.toObject(), ...stock?.toObject() };
    });

    res.status(200).json({ ok: true, data: mergedList });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const getPopularSearches = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB();

    // 인기 검색어 조회
    const popularSearches = await PopularSearch.find()
      .sort({ count: -1 })
      .limit(5);

    if (popularSearches.length === 0) {
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
    );

    const mergedList = _.map(popularSearches, (search) => {
      const stock = _.find(stocks, { stock_name: search.stock_name });
      return { ...search.toObject(), ...stock?.toObject() };
    });

    res.status(200).json({ ok: true, data: mergedList });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 최근 검색어 저장 (좀 더 생각해보기 - 한 글자만 입력했을 경우와, 영어로 입력했을 때 어떻게 해야 되는지)
export const saveRecentSearch = async (req, res) => {
  try {
    const { stock_name } = req.body;

    // 검색어가 6가지 종목 안에 없는 경우
    if (!STOCK_NAME_LIST.includes(stock_name)) {
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    const { user_id } = req.session;

    // 데이터베이스 연결
    await connectDB();

    // 검색어가 이미 존재하는지 확인
    const existingSearch = await RecentSearch.findOne({ user_id, stock_name });

    if (existingSearch) {
      // 존재하면 검색 날짜를 최신으로 업데이트
      existingSearch.search_date = new Date();
      await existingSearch.save();
    } else {
      const newSearch = new RecentSearch({
        user_id,
        stock_name,
        search_date: new Date(),
      });
      await newSearch.save();
    }

    // 인기 검색어 카운트 +1 (5초 이내로 계속 검색 시 카운터가 되진 않음)
    const cacheKey = `${user_id}:search_${stock_name}`;
    if (!searchCache.has(cacheKey)) {
      await PopularSearch.findOneAndUpdate(
        { stock_name },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
      searchCache.set(cacheKey, true);
    }

    // 저장 후 검색어에 대한 정보 출력 (한 글자라도 포함이 되어 있으면 출력)
    const result = await Stock.find({
      stock_name: { $regex: new RegExp(stock_name, "i") },
    });

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 유저 인덱스 따른 최근 검색어 삭제
export const deleteRecentSearches = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const { user_id } = req.session;

    await RecentSearch.deleteMany({ user_id }); // user_id에 따른 전부 삭제
    res
      .status(200)
      .json({ ok: true, data: [], message: "recent searches deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
