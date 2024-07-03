import axios from "axios";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

import connectDB from "../database/db.js";
import User from "../schemas/user-schema.js";
import Log from "../schemas/log-schema.js";
import Withdraw from "../schemas/withdraw-schema.js";

import uploadProfileImg from "../middleware/imageUpload.js";
import deleteFileFromS3 from "../middleware/imageDelete.js";

export const validation = async (req, res) => {
  const user = await User.findById(req.session.userId);

  if (!user) {
    res.status(401).json({ ok: false, message: "로그인 해주시기 바랍니다." });
  } else {
    res.status(200).json({ ok: true, message: "ok" });
  }
};

// 전체 유저 조회 (테스트)
export const getAllUser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({
      ok: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
    return;
  }
};

// 로그인 (JWT 생성)
export const login = async (req, res) => {
  const { login_email, login_pw } = req.body;
  try {
    await connectDB();
    console.log(login_email, login_pw);

    const user = await User.findOne({ email: login_email });

    // 존재하지 않는 이메일인 경우
    if (!user) {
      res.status(404).json({
        ok: false,
        message: "존재하지 않는 이메일입니다.",
      });
      return;
    }

    // 비밀번호 해시 검증
    const isMatch = await user.comparePassword(login_pw);

    // 비밀번호가 일치하지 않을 때
    if (!isMatch) {
      res.status(401).json({
        ok: false,
        message: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    const userInfo = {
      user_id: user._id,
      user_email: user.email,
      user_name: user.name,
      user_language: user.language,
    };

    req.session.userId = user._id; // 세션 저장

    // // JWT access Token 생성
    // const accessToken = jwt.generateAccessToken(userInfo);

    // // JWT refresh Token 생성
    // const refreshToken = jwt.generateRefreshToken(userInfo);

    // // JWT 쿠키에 저장
    // res.cookie("accessToken", accessToken, {
    //   domain: process.env.COOKIE_DOMAIN,
    //   path: "/",
    //   httpOnly: true,
    //   sameSite: process.env.COOKIE_SAMESITE,
    //   secure: process.env.COOKIE_SECURE,
    // });
    // res.cookie("refreshToken", refreshToken, {
    //   domain: process.env.COOKIE_DOMAIN,
    //   path: "/",
    //   httpOnly: true,
    //   sameSite: process.env.COOKIE_SAMESITE,
    //   secure: process.env.COOKIE_SECURE,
    // });

    // 로그 추가
    await Log.create({ user_email: user.email });

    res.status(200).json({
      ok: true,
      data: {
        user_id: user._id,
        user_email: user.email,
        user_name: user.name,
        user_language: user.language,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
    return;
  }
};

export const naverLogin = async (req, res, next) => {
  const { code, state } = req.body;

  try {
    const {
      data: { access_token, expires_in, refresh_token },
    } = await axios.post(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&redirect_uri=${process.env.NAVER_REDIRECT_URL}&code=${code}&state=${state}`,

      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const {
      data: { response },
    } = await axios.post(
      "https://openapi.naver.com/v1/nid/me",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const exUser = await User.findOne({
      email: response.email,
      login_type: "naver",
    });

    // 로그인해서 회원가입 한 적이 있으면
    req.session.auth = {
      access_token,
      expires_in,
      refresh_token,
    };
    if (exUser) {
      req.session.userId = exUser._id;
      res.status(200).json({ ok: true, message: "로그인 진행" });
    }
    // 회원가입을 해야 되는 경우
    else {
      res.status(200).json({ ok: true, message: "회원가입 진행", data: response });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 카카오 로그인 (해야 함)
export const kakaoLogin = async (req, res, next) => {
  const { code } = req.body;

  try {
    const {
      data: { access_token, expires_in, refresh_token, refresh_token_expires_in },
    } = await axios.post(
      `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}&code=${code}`,

      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const { data } = await axios.post(
      "https://kapi.kakao.com/v2/user/me",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const exUser = await User.findOne({
      snsId: data.id,
      provider: "kakao",
    });

    if (exUser) {
      req.session.userId = exUser._id;
    } else {
      const newUser = await User.create({
        email: data?.properties?.email,
        nick: data?.properties?.nickname,
        snsId: data.id,
        provider: "kakao",
      });

      req.session.userId = newUser._id;
    }

    req.session.auth = {
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
    };

    res.status(200).json({ message: "카카오 로그인 성공" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 언어 변경
export const language = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const userId = "6682e16dfae77a1869b25865";

    const { language } = req.body;

    // 언어를 선택하지 않은 경우
    if (!language) {
      res.status(400).json({ ok: false, message: "언어를 선택해주세요." });
      return;
    }

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = await User.findOneAndUpdate({ _id: userId }, { $set: { language: language } }, { new: true });
    res.status(200).json({ ok: true, data: user });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 아이디(이메일) 중복 확인
export const duplicatedEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // 이메일을 입력하지 않은 경우
    if (!email) {
      res.status(400).json({ ok: false, message: "이메일을 입력해주세요." });
      return;
    }

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = await User.findOne({ email: email }).exec();
    if (user) {
      res.status(200).json({ ok: true, data: user.email });
    } else {
      res.status(200).json({ ok: true, data: null });
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 유저 탈퇴
export const withdraw = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const userId = "6682e16dfae77a1869b25865";

    const { email, reason, reason_other = null } = req.body;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { is_delete: true, deleted_at: Date.now } },
      { new: true }
    );

    // 클라이언트에서 보낸 이메일과 세션으로 DB 조회한 이메일이 다른 경우
    if (email !== user.email) {
      res.status(400).json({ ok: false, message: "입력한 이메일이 현재 사용자의 이메일과 일치하지 않습니다." });
      return;
    }

    await Withdraw.create({
      user_id: user._id,
      user_email: user.email,
      reason: reason,
      reason_other: reason_other,
    });

    res.status(200).json({ ok: true, message: "탈퇴 완료" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 로컬 회원가입
export const register = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        birth,
        phone,
        gender,
        nickname,
        interest_stocks = [""],
        language = "ko",
      } = req.body;

      // 데이터베이스 연결
      await connectDB().catch((err) => {
        res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
        return;
      });

      // 동일한 이메일을 가진 사용자가 이미 존재하는지 확인
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ ok: false, message: "이미 존재하는 이메일입니다." });
        return;
      }

      // 비밀번호 해시 처리
      const hashedPassword = await bcrypt.hash(password, 10);

      // 파일 이름
      const profile_img_name = req.file ? `${req.file.key}` : "";

      const user = new User({
        sns_id: uuid(),
        name,
        email,
        password: hashedPassword, // 해싱된 비밀번호 저장
        birth,
        phone,
        gender,
        profile: profile_img_name,
        nickname,
        interest_stocks,
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

// 유저 개인정보 수정
export const updateUser = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    try {
      // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
      const userId = "66851b104c108bdb12c7973e";

      const { name, email, password, birth, phone, gender, nickname, interest_stocks = [] } = req.body;

      // 데이터베이스 연결
      await connectDB().catch((err) => {
        res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
        return;
      });

      // 고정 값으로 보낸 이메일과 DB에 저장된 이메일이 같은지 확인
      const user = await User.findById(userId).select("+password");
      if (!user) {
        res.status(404).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
        return;
      }

      // 클라이언트에서 보낸 이메일과 db에 저장된 이메일이 다른 경우
      if (user.email !== email) {
        res.status(404).json({ ok: false, message: "회원 정보가 일치하지 않습니다." });
        return;
      }

      // 비밀번호 같은지 여부 판별
      let hashedPassword = user.password;
      if (password !== "" && !(await bcrypt.compare(password, user.password))) {
        hashedPassword = await bcrypt.hash(password, 10); // 새로운 비밀번호의 경우 해시처리
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

      const updateUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            name,
            password: hashedPassword,
            phone,
            birth,
            profile: new_profile_img,
            nickname,
            interest_stocks,
            gender,
          },
        },
        { new: true } // 업데이트된 문서를 반환
      );

      res.status(200).json({ ok: true, data: updateUser });
    } catch (err) {
      res.status(500).json({ ok: false, message: err.message });
    }
  },
];
