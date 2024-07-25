import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../database/db.js";
import User from "../schemas/user-schema.js";
import Withdraw from "../schemas/withdraw-schema.js";
import InterestStock from "../schemas/interestStock-schema.js";
import Cert from "../schemas/cert-schema.js";
import Propensity from "../schemas/propensity-schema.js";
import RecentSearch from "../schemas/recentSearch-schema.js";
import RecentSearchText from "../schemas/recentSearchText-schema.js";

import uploadProfileImg from "../middleware/imageUpload.js";
import deleteFileFromS3 from "../middleware/imageDelete.js";
import { getKoreanTime } from "../utils/getKoreanTime.js";
import { send_main_func } from "../utils/emailSendUtil.js";

// 언어 변경
export const language = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { language } = req.body;

    // 언어를 선택하지 않은 경우
    if (!language) {
      res.status(400).json({ ok: false, message: "언어를 선택해주세요." });
      await session.abortTransaction();
      return;
    }

    // 데이터베이스 연결
    await connectDB();

    const user = await User.findOneAndUpdate({ snsId }, { $set: { language: language } }, { new: true }).session(
      session
    );
    await session.commitTransaction();
    res.status(200).json({ ok: true, data: user });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 유저 탈퇴
export const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { email, reason, reason_other = null } = req.body;

    // 데이터베이스 연결
    await connectDB();

    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);

    // 클라이언트에서 보낸 이메일과 세션으로 DB 조회한 이메일이 다른 경우
    if (!user || email !== user.email) {
      res.status(400).json({ ok: false, message: "입력한 이메일이 현재 사용자의 이메일과 일치하지 않습니다." });
      await session.abortTransaction();
      return;
    }

    const updatedUser = await User.findOneAndUpdate(
      { sns_id: snsId, email, is_delete: false },
      { $set: { is_delete: true, deleted_at: getKoreanTime() } },
      { new: true, session }
    );

    const withdraw = new Withdraw({
      user_snsId: updatedUser.sns_id,
      user_email: updatedUser.email,
      reason,
      reason_other,
    });
    await withdraw.save({ session });

    await InterestStock.findOneAndUpdate(...deleteOption(updatedUser.sns_id, session));
    await RecentSearch.findOneAndUpdate(...deleteOption(updatedUser.sns_id, session));
    await RecentSearchText.findOneAndUpdate(...deleteOption(updatedUser.sns_id, session));
    await Propensity.findOneAndUpdate(...deleteOption(updatedUser.sns_id, session));

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "탈퇴 완료" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

const deleteOption = (sns_id, session) => {
  return [{ user_snsId: sns_id, is_delete: false }, { $set: { is_delete: true } }, { session }];
};

// 유저 프로필 수정
export const updateUserProfile = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { snsId } = req.session;
      const { nickname, gender, interest_stocks } = req.body;

      // 데이터베이스 연결
      await connectDB();

      // 유저 조회
      const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
      if (!user) {
        res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
        await session.abortTransaction();
        return;
      }

      let new_profile_img = "";

      // 프로필 이미지 교체
      if (user.profile && req.file) {
        new_profile_img = `${req.file.key}`;
        await deleteFileFromS3(user.profile);
      }

      // 기존 프로필 이미지 삭제
      if (user.profile && !req.file) {
        new_profile_img = "";
        await deleteFileFromS3(user.profile);
      }

      // 프로필 이미지 추가
      if (user.profile === "" && req.file) {
        new_profile_img = `${req.file.key}`;
      }

      // 프로필 수정
      await User.findOneAndUpdate(
        { sns_id: snsId, is_delete: false },
        {
          $set: { nickname, gender, profile: new_profile_img, updated_at: getKoreanTime() },
        },
        { session }
      );

      // 유저 관심주식 조회
      const interestStock = await InterestStock.findOne({ user_snsId: user.sns_id, is_delete: false }).session(session);

      const parse_stockList = typeof interest_stocks === "string" ? JSON.parse(interest_stocks) : interest_stocks;

      // body에 관심 주식을 넣은 경우
      if (parse_stockList && parse_stockList.length > 0) {
        // DB에 유저 관심 주식이 있는 경우
        if (interestStock) {
          await interestStock.updateStockList(parse_stockList, { session });
        }
        // DB에 유저 관심 주식이 없을 경우 새로 생성
        else {
          await interestStock.addStocks(parse_stockList, { session });
        }
      }

      await session.commitTransaction();
      res.status(200).json({ ok: true, message: "프로필 수정 완료" });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ ok: false, message: err.message });
    } finally {
      session.endSession();
    }
  },
];

// 유저 개인정보 수정
export const updateUserInfo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { email, password, phone, birth } = req.body;

    // 데이터베이스 연결
    await connectDB();

    // 고정 값으로 보낸 이메일과 DB에 저장된 이메일이 같은지 확인
    const user = await User.findOne({ sns_id: snsId, is_delete: false }).select("+password").session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      await session.abortTransaction();
      return;
    }

    // 클라이언트에서 보낸 이메일과 db에 저장된 이메일이 다른 경우
    if (user.email !== email) {
      res.status(404).json({ ok: false, message: "회원 정보가 일치하지 않습니다." });
      await session.abortTransaction();
      return;
    }

    // 비밀번호 같은지 여부 판별
    let hashedPassword = user.password;
    if (password !== "" && !(await bcrypt.compare(password, user.password))) {
      hashedPassword = await bcrypt.hash(password, 10); // 새로운 비밀번호의 경우 해시처리
    }

    // 프로필 수정
    await User.findOneAndUpdate(
      { sns_id: snsId, is_delete: false },
      {
        $set: {
          password: hashedPassword,
          phone,
          birth,
          updated_at: getKoreanTime(),
        },
      },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "회원 정보 수정 완료" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 유저 조회
export const getUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { user_email } = req.params;

    // 데이터베이스 연결
    await connectDB();

    const user = await User.findOne(
      { sns_id: snsId, email: user_email, is_delete: false },
      {
        sns_id: 1,
        name: 1,
        email: 1,
        birth: 1,
        phone: 1,
        gender: 1,
        profile: 1,
        nickname: 1,
        login_type: 1,
      }
    ).session(session);

    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      await session.abortTransaction();
      return;
    }

    const userPropensity = await Propensity.findOne(
      { user_snsId: user.sns_id },
      { _id: 0, is_agree_credit_info: 1, invest_propensity: 1 }
    ).session(session);

    const interestStock = await InterestStock.findOne({
      user_snsId: user.sns_id,
      is_delete: false,
    }).session(session);

    const { sns_id, ...userWithoutSnsId } = user.toObject();

    await session.commitTransaction();
    if (interestStock) {
      interestStock.stock_list.sort((a, b) => a.order - b.order);

      const reutersCodeList = interestStock.stock_list.map((stock) => stock.reuters_code);
      res.status(200).json({
        ok: true,
        data: { ...userWithoutSnsId, interest_stocks: reutersCodeList, user_propensity: userPropensity },
      });
    } else {
      res.status(200).json({
        ok: true,
        data: { ...userWithoutSnsId, interest_stocks: null, user_propensity: userPropensity },
      }); // 없으면 null 반환
    }
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 비밀번호 인증 API
export const passwordCert = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { email, password } = req.body;

    // 데이터베이스 연결
    await connectDB();

    const user = await User.findOne({ sns_id: snsId, is_delete: false }).select("+password").session(session);

    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      await session.abortTransaction();
      return;
    }

    if (user.email !== email) {
      res
        .status(401)
        .json({ ok: false, message: "현재 사용자가 다른 이메일을 사용하고 있습니다. 다시 로그인 해주세요." });
      await session.abortTransaction();
      return;
    }

    if (password !== "" && (await bcrypt.compare(password, user.password))) {
      await session.commitTransaction();
      res.status(200).json({ ok: true, message: "비밀번호 인증 완료" });
    } else {
      await session.commitTransaction();
      res.status(200).json({ ok: false, message: "비밀번호 인증 실패" });
    }
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 사용자 인증 이메일 인증 API (인증코드 발송)
export const emailCert = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { snsId } = req.session;
    const { email } = req.body;

    // 데이터베이스 연결
    await connectDB();

    const user = await User.findOne({ sns_id: snsId, is_delete: false }).session(session);
    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      await session.abortTransaction();
      return;
    }

    if (user.email !== email) {
      res
        .status(401)
        .json({ ok: false, message: "현재 사용자가 다른 이메일을 사용하고 있습니다. 다시 로그인 해주세요." });
      await session.abortTransaction();
      return;
    }

    // 인증 코드 생성 및 Cert 인스턴스 생성
    const cert = new Cert({ user_email: email });
    const code = cert.generateCode(); // 인증 코드 및 만료 시간 생성

    await send_main_func({ type: "cert", to: email, VALUE: code });
    await cert.save({ session });

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "인증코드 전송 완료" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};
