import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

import connectDB from "../database/db.js";
import User from "../schemas/user-schema.js";
import Cert from "../schemas/cert-schema.js";
import InterestStock from "../schemas/interestStock-schema.js";
import Log from "../schemas/log-schema.js";
import Propensity from "../schemas/propensity-schema.js";

import uploadProfileImg from "../middleware/imageUpload.js";
import { send_main_func } from "../utils/emailSendUtil.js";
import { getKoreanTime } from "../utils/getKoreanTime.js";
import { generatePassword } from "../utils/generatePassword.js";

export const userCheck = async (req, res) => {
  try {
    const { email, pw } = req.body;
    const user = await User.findOne({ email, is_delete: false }).select("+password");
    if (!user) {
      res.status(200).json({ ok: false, message: "Credentials Login Fail : 가입되지 않은 회원" });
      return;
    }

    // 비밀번호 같은지 여부 판별
    if (pw !== "" && !(await bcrypt.compare(pw, user.password))) {
      res.status(200).json({ ok: false, message: "Credentials Login Fail : 비밀번호 불일치" });
      return;
    }

    const { password, ...userWithoutSnsId } = user.toObject();

    res.status(200).json({ ok: true, data: userWithoutSnsId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { email, is_delete } = req.body;
    const existingUser = await User.findOne(
      {
        email,
        is_delete,
      },
      { email: 1 }
    );
    res.status(200).json({ ok: true, data: existingUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const getSocialUser = async (req, res) => {
  try {
    const { email = "", is_delete, sns_id, login_type } = req.body;
    let socialUser;
    if (login_type === "kakao") {
      socialUser = await User.findOne({ is_delete, sns_id, login_type });
    } else {
      socialUser = await User.findOne({ email, is_delete, sns_id, login_type });
    }
    res.status(200).json({ ok: true, data: socialUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 인증코드 이메일 발송 (탈퇴여부 체크)
export const sendEmail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { email } = req.body;
  try {
    await connectDB();

    const user = await User.findOne({ email, is_delete: false }).session(session);
    if (user) {
      res.status(401).json({ ok: false, message: "이미 가입된 이메일입니다." });
      await session.abortTransaction();
      return;
    }

    // 인증 코드 생성 및 Cert 인스턴스 생성
    const cert = new Cert({ user_email: email });
    const code = cert.generateCode(); // 인증 코드 및 만료 시간 생성

    await send_main_func({ type: "code", to: email, VALUE: code });
    await cert.save({ session });

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "이메일 전송 완료" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 인증 코드 체크
export const verifyCode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { email, code } = req.body;
  try {
    await connectDB();
    const cert = await Cert.findOne({ user_email: email })
      .sort({
        created_at: -1,
      })
      .session(session);

    if (!cert) {
      res.status(404).json({ ok: false, message: "인증 요청이 없습니다." });
      await session.abortTransaction();
      return;
    }

    const isValid = cert.verifyCode(code);

    if (!isValid) {
      res.status(400).json({
        ok: false,
        message: "인증 코드가 유효하지 않거나 만료되었습니다.",
      });
      await session.abortTransaction();
      return;
    }

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "인증 성공" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 로컬 회원가입
export const register = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        name,
        email,
        password,
        birth,
        phone,
        gender,
        nickname,
        reuters_code,
        language = "ko",
        isAgreeCreditInfo,
        investPropensity,
      } = req.body;

      // 데이터베이스 연결
      await connectDB();

      // 동일한 이메일을 가진 사용자가 이미 존재하는지 확인 (탈퇴여부 체크)
      const existingUser = await User.findOne({ email, is_delete: false }).session(session);
      if (existingUser) {
        res.status(400).json({ ok: false, message: "이미 회원가입이 된 이메일입니다." });
        await session.abortTransaction();
        return;
      }

      // 비밀번호 해시 처리
      const hashedPassword = await bcrypt.hash(password, 10);

      // 파일 이름
      const profile_img_name = req.file ? `${req.file.key}` : "";

      // 유저 sns_id 생성
      const sns_id = uuid();

      // body에 관심 주식을 넣은 경우
      const parse_stockList = typeof reuters_code === "string" ? JSON.parse(reuters_code) : reuters_code;
      if (parse_stockList && parse_stockList.length > 0) {
        const interestStock = new InterestStock({
          user_snsId: sns_id,
          user_email: email,
        });
        await interestStock.addStocks(parse_stockList, { session });
      }

      const user = new User({
        sns_id,
        name,
        email,
        password: hashedPassword, // 해싱된 비밀번호 저장
        birth,
        phone,
        gender,
        profile: profile_img_name,
        nickname,
        language,
        login_type: "local",
      });

      // 데이터베이스에 사용자 저장
      await user.save({ session });

      // 투자성향 저장
      if (isAgreeCreditInfo) {
        const propensity = new Propensity({
          user_snsId: sns_id,
          login_type: "local",
          is_agree_credit_info: isAgreeCreditInfo,
          invest_propensity: investPropensity,
        });
        await propensity.save({ session });
      } else {
        const propensity = new Propensity({
          user_snsId: sns_id,
          login_type: "local",
          is_agree_credit_info: isAgreeCreditInfo,
        });
        await propensity.save({ session });
      }

      await session.commitTransaction();
      res.status(200).json({ ok: true, message: "회원가입 성공" });
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      res.status(500).json({ ok: false, message: err.message });
    } finally {
      session.endSession();
    }
  },
];

// 소셜 회원가입
export const registerSocial = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        sns_id,
        name,
        email,
        birth,
        phone,
        gender,
        nickname,
        reuters_code,
        language = "ko",
        login_type,
        isAgreeCreditInfo,
        investPropensity,
      } = req.body;

      // 데이터베이스 연결
      await connectDB();

      // 동일한 이메일을 가진 사용자가 이미 존재하는지 확인 (탈퇴여부 체크)
      const existingUser = await User.findOne({ email, is_delete: false }).session(session);
      if (existingUser) {
        res.status(400).json({ ok: false, message: "이미 회원가입이 된 이메일입니다." });
        await session.abortTransaction();
        return;
      }

      // 파일 이름
      const profile_img_name = req.file ? `${req.file.key}` : "";

      const parse_stockList = typeof reuters_code === "string" ? JSON.parse(reuters_code) : reuters_code;

      // body에 관심 주식을 넣은 경우
      if (parse_stockList && parse_stockList.length > 0) {
        const interestStock = new InterestStock({
          user_snsId: sns_id,
          user_email: email,
        });
        await interestStock.addStocks(parse_stockList, { session });
      }

      const user = new User({
        sns_id,
        name,
        email,
        birth,
        phone,
        gender,
        profile: profile_img_name,
        nickname,
        language,
        login_type,
      });

      // 데이터베이스에 사용자 저장
      await user.save({ session });

      // 투자성향 저장
      if (isAgreeCreditInfo) {
        const propensity = new Propensity({
          user_snsId: sns_id,
          login_type,
          is_agree_credit_info: isAgreeCreditInfo,
          invest_propensity: investPropensity,
        });
        await propensity.save({ session });
      } else {
        const propensity = new Propensity({
          user_snsId: sns_id,
          login_type,
          is_agree_credit_info: isAgreeCreditInfo,
        });
        await propensity.save({ session });
      }

      await session.commitTransaction();
      res.status(200).json({ ok: true, message: "회원가입 성공" });
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      res.status(500).json({ ok: false, message: err.message });
    } finally {
      session.endSession();
    }
  },
];

// 비밀번호 찾기
export const findPassword = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { name, email } = req.body;

  try {
    // 테스트 아이디는 수정 불가
    if (email === "test@gmail.com") {
      res.status(500).json({ ok: false, message: "해당 아이디는 임시 비밀번호를 발급할 수 없습니다." });
      await session.abortTransaction();
      return;
    }

    await connectDB();

    const user = await User.findOne({ name, email, is_delete: false }).session(session);
    if (!user) {
      res.status(404).json({ ok: false, message: "가입되지 않은 이메일입니다." });
      await session.abortTransaction();
      return;
    }

    if (user.login_type !== "local") {
      res.status(200).json({
        ok: false,
        data: {
          login_type: user.login_type,
          message: "소셜로그인 가입된 이메일입니다.",
        },
      });
      await session.abortTransaction();
      return;
    }

    const newPassword = generatePassword(); // 임시 비밀번호 발급
    const hashPassword = await bcrypt.hash(newPassword, 10); // 새로운 비밀번호의 경우 해시처리

    // 이메일 발송
    await send_main_func({ type: "password", to: email, VALUE: newPassword });

    await User.findOneAndUpdate(
      { name, email, is_delete: false },
      {
        $set: {
          password: hashPassword,
          updated_at: getKoreanTime(),
        },
      },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "이메일 전송 완료" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 로그인
export const login = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { sns_id, email, autoLogin, login_type } = req.body;

    // autoLogin에 따라 세션의 maxAge 설정
    if (autoLogin) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7일 (영속 쿠키 ms 단위)
      // req.session.cookie.maxAge = 30 * 1000; // 30초 (테스트)
    } else {
      req.session.cookie.maxAge = undefined; // 세션 쿠키
    }

    req.session.snsId = sns_id;
    req.session.email = email;
    req.session.login_type = login_type;

    // 로그 추가
    await connectDB();
    const log = new Log({ user_email: email, login_type: login_type });
    await log.save({ session });

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: "로그인 성공" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// 로그아웃
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ ok: false, message: "서버 세션 삭제 오류" });
    } else {
      res.status(200).json({ ok: true, message: "로그아웃 " });
    }
  });
};
