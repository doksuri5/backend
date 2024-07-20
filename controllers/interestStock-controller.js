import _ from "lodash";

import connectDB from "../database/db.js";
import InterestStock from "../schemas/interestStock-schema.js";
import Stock from "../schemas/stock-schema.js";
import User from "../schemas/user-schema.js";

// 관심 주식 전체 이름만 가져오기
export const getInterestStocks = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    // 유저 정보 가져오기
    const user = await User.findOne({ sns_id: snsId, is_delete: false });

    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 해당 유저의 주식 리스트를 조회 (is_delete가 false인 항목만)
    const interestStock = await InterestStock.findOne({
      user_snsId: snsId,
      is_delete: false,
    });

    if (interestStock) {
      interestStock.stock_list.sort((a, b) => a.order - b.order);

      const reutersCodeList = interestStock.stock_list.map((stock) => stock.reuters_code);
      res.status(200).json({ ok: true, data: reutersCodeList ?? [] }); // 없으면 null 반환
    } else {
      res.status(200).json({ ok: true, data: [] }); // 없으면 빈배열 반환
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
    return;
  }
};

// 관심 주식 전체 정보 조회 (주식 정보 포함)
export const getDetailInterestStocks = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    // 해당 유저의 주식 리스트를 조회 (is_delete가 false인 항목만)
    const interestStock = await InterestStock.findOne({
      user_snsId: snsId,
      is_delete: false,
    });

    if (interestStock) {
      const reutersCodes = interestStock.stock_list.map((stock) => stock.reuters_code);

      // 관심 주식 리스트의 주식 이름을 가지고 주식 스키마에서 정보 가져오기
      const stocks = await Stock.find({ reuters_code: { $in: reutersCodes } });

      const mergeStockList = interestStock.stock_list.map((stockItem) => {
        const stockDetail = _.find(stocks, {
          reuters_code: stockItem.reuters_code,
        });
        return {
          ...stockItem.toObject(), // toObject는 몽구스 문서 객체를 순수 자바스크립트 객체로 변환해줌
          ...(stockDetail ? stockDetail.toObject() : {}), // 없는 경우는 오류가 발생하기 때문에 조건 처리
        };
      });

      // 순서에 맞게 정렬
      const sortedStockList = _.sortBy(mergeStockList, "order");

      res.status(200).json({ ok: true, data: sortedStockList ?? [] }); // 없으면 null 반환
    } else {
      res.status(200).json({ ok: true, data: interestStock ?? [] }); // 없으면 null 반환
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
    return;
  }
};

// 관심 주식 1개 추가
export const insertInterestStock = async (req, res) => {
  try {
    const { reuters_code } = req.body;
    const { snsId } = req.session;

    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });
    // 유저 정보 가져오기
    const user = await User.findOne({ sns_id: snsId, is_delete: false });
    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 유저의 관심 주식 리스트 찾기
    let interestStock = await InterestStock.findOne({
      user_snsId: snsId,
      is_delete: false,
    });

    if (!interestStock) {
      interestStock = new InterestStock({
        user_snsId: snsId,
        user_email: user.email,
      });
    }

    // 관심 주식 추가
    await interestStock.addStock(reuters_code);

    res.status(200).json({ ok: true, data: interestStock.stock_list ?? [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
    return;
  }
};

// 관심 주식 1개 삭제
export const deleteInterestStock = async (req, res) => {
  try {
    const { reuters_code } = req.params;
    const { snsId } = req.session;

    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = await User.findOne({ sns_id: snsId, is_delete: false });

    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 유저의 관심 주식 리스트 찾기
    let interestStock = await InterestStock.findOne({
      user_snsId: snsId,
      is_delete: false,
    });

    if (!interestStock) {
      res.status(404).json({ ok: false, message: "관심 주식 리스트를 찾을 수 없습니다." });
      return;
    }
    // 관심 주식 삭제
    await interestStock.removeStock(reuters_code);

    res.status(200).json({ ok: true, data: [], message: "delete complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
    return;
  }
};

// 관심 주식 리스트 순서 변경
export const updateInterestStockOrder = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 sns_id 값 가져오기
    const { snsId } = req.session;
    const { stockList } = req.body;

    let isError = false;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      isError = true;
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    // 유저 정보 가져오기
    const user = await User.findOne({ sns_id: snsId, is_delete: false });
    if (!user) {
      isError = true;
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 유저의 관심 주식 리스트 찾기
    let interestStock = await InterestStock.findOne({
      user_snsId: snsId,
      is_delete: false,
    });
    if (!interestStock) {
      isError = true;
      res.status(404).json({ ok: false, message: "관심 주식 리스트를 찾을 수 없습니다." });
      return;
    }

    const parse_stockList = typeof stockList === "string" ? JSON.parse(stockList) : stockList;

    // DB에 저장된 값과 body로 보낸 값의 리스트 길이가 맞지 않는 경우
    if (interestStock.stock_list.length !== parse_stockList.length) {
      isError = true;
      res.status(400).json({ ok: false, message: "순서를 변경할 수 없습니다." });
      return;
    }

    const reutersCodes = interestStock.stock_list.map((s) => s.reuters_code);

    // 중복된 값 확인
    const hasDuplicates = new Set(parse_stockList).size !== parse_stockList.length;
    if (hasDuplicates) {
      isError = true;
      res.status(400).json({ ok: false, message: "중복된 주식 값이 있습니다." });
      return;
    }

    // 모든 값이 존재하는지 확인
    parse_stockList.forEach((reuters_code) => {
      if (!reuters_code.includes(reuters_code)) {
        isError = true;
        res.status(400).json({
          ok: false,
          message: `${reuters_code} 주식은 DB에 존재하지 않는 주식입니다.`,
        });
        return;
      }
    });

    // 주식 리스트 순서 업데이트
    if (!isError) {
      await interestStock.updateStockOrder(parse_stockList);
      res.status(200).json({ ok: true, data: interestStock.stock_list ?? [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
    return;
  }
};
