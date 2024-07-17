import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

import connectDB from "../database/db.js";
import User from "../schemas/user-schema.js";
import Cert from "../schemas/cert-schema.js";
import InterestStock from "../schemas/interestStock-schema.js";
import Log from "../schemas/log-schema.js";

import uploadProfileImg from "../middleware/imageUpload.js";
import { send_main_func } from "../utils/emailSendUtil.js";
import { getKoreanTime } from "../utils/getKoreanTime.js";
import { generatePassword } from "../utils/generatePassword.js";

// 인증코드 이메일 발송 (탈퇴여부 체크)
export const sendEmail = async (req, res) => {
  const { email } = req.body;
  try {
    await connectDB();

    const user = await User.findOne({ email, is_delete: false });
    if (user) {
      res.status(401).json({ ok: false, message: "이미 가입된 이메일입니다." });
      return;
    }

    // 인증 코드 생성 및 Cert 인스턴스 생성
    const cert = new Cert({ user_email: email });
    const code = cert.generateCode(); // 인증 코드 및 만료 시간 생성

    await send_main_func({ type: "code", to: email, VALUE: code });
    await cert.save();

    res.status(200).json({ ok: true, message: "이메일 전송 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 인증 코드 체크
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    await connectDB();
    const cert = await Cert.findOne({ user_email: email }).sort({
      created_at: -1,
    });

    if (!cert) {
      res.status(404).json({ ok: false, message: "인증 요청이 없습니다." });
      return;
    }

    const isValid = cert.verifyCode(code);

    if (!isValid) {
      res.status(400).json({
        ok: false,
        message: "인증 코드가 유효하지 않거나 만료되었습니다.",
      });
      return;
    }

    res.status(200).json({ ok: true, message: "인증 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 로컬 회원가입
export const register = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    try {
      const { name, email, password, birth, phone, gender, nickname, reuters_code, language = "ko" } = req.body;

      // 데이터베이스 연결
      await connectDB().catch((err) => {
        res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
        return;
      });

      // 동일한 이메일을 가진 사용자가 이미 존재하는지 확인 (탈퇴여부 체크)
      const existingUser = await User.findOne({ email, is_delete: false });
      if (existingUser) {
        res.status(400).json({ ok: false, message: "이미 회원가입이 된 이메일입니다." });
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
        await interestStock.addStocks(parse_stockList);
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
      await user.save();

      res.status(200).json({ ok: true, message: "회원가입 성공" });
    } catch (err) {
      res.status(500).json({ ok: false, message: err.message });
    }
  },
];

// 소셜 회원가입
export const registerSocial = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
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
      } = req.body;

      // 데이터베이스 연결
      await connectDB().catch((err) => {
        res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
        return;
      });

      // 동일한 이메일을 가진 사용자가 이미 존재하는지 확인 (탈퇴여부 체크)
      const existingUser = await User.findOne({ email, is_delete: false });
      if (existingUser) {
        res.status(400).json({ ok: false, message: "이미 회원가입이 된 이메일입니다." });
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
        await interestStock.addStocks(parse_stockList);
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
      await user.save();

      res.status(200).json({ ok: true, message: "회원가입 성공" });
    } catch (err) {
      res.status(500).json({ ok: false, message: err.message });
    }
  },
];

// 비밀번호 찾기
export const findPassword = async (req, res) => {
  const { name, email } = req.body;

  try {
    await connectDB();

    const user = await User.findOne({ name, email, is_delete: false });
    if (!user) {
      res.status(404).json({ ok: false, message: "가입되지 않은 이메일입니다." });
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
      }
    );

    res.status(200).json({ ok: true, message: "이메일 전송 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 로그인
export const login = async (req, res) => {
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
    await Log.create({ user_email: email, login_type: login_type });

    res.status(200).json({ ok: true, message: "로그인 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
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
