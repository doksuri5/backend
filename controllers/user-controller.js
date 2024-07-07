import axios from "axios";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

import connectDB from "../database/db.js";
import User from "../schemas/user-schema.js";
import Log from "../schemas/log-schema.js";
import Withdraw from "../schemas/withdraw-schema.js";
import Cert from "../schemas/cert-schema.js";
import InterestStock from "../schemas/interestStock-schema.js";

import uploadProfileImg from "../middleware/imageUpload.js";
import deleteFileFromS3 from "../middleware/imageDelete.js";
import { send_main_func } from "../utils/emailSendUtil.js";
import { getKoreanTime } from "../utils/getKoreanTime.js";

// 전체 유저 조회 (테스트 용도)
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

// 언어 변경 (프론트로 변경)
export const language = async (req, res) => {
  try {
    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const sns_id = "6682e16dfae77a1869b25865";

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

    const user = await User.findOneAndUpdate({ sns_id }, { $set: { language: language } }, { new: true });
    res.status(200).json({ ok: true, data: user });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 아이디(이메일) 중복 확인 (프론트로 변경)
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

    // (탈퇴여부 체크)
    const user = await User.findOne({ email: email, is_delete: false }).exec();
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
    // 유저 쿠키 값을 가지고 sns_id 값 가져오기
    const sns_id = "6682e16dfae77a1869b25865";

    const { email, reason, reason_other = null } = req.body;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = await User.findOne({ sns_id, is_delete: false });

    // 클라이언트에서 보낸 이메일과 세션으로 DB 조회한 이메일이 다른 경우
    if (!user || email !== user.email) {
      res.status(400).json({ ok: false, message: "입력한 이메일이 현재 사용자의 이메일과 일치하지 않습니다." });
      return;
    }

    const updatedUser = await User.findOneAndUpdate(
      { sns_id, email, is_delete: false },
      { $set: { is_delete: true, deleted_at: getKoreanTime() } },
      { new: true }
    );

    await Withdraw.create({
      user_snsId: updatedUser.sns_id,
      user_email: updatedUser.email,
      reason,
      reason_other,
    });

    await InterestStock.findOneAndUpdate(
      { user_snsId: updatedUser.sns_id, is_delete: false },
      { $set: { is_delete: true } }
    );

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
      const { name, email, password, birth, phone, gender, nickname, interest_stocks, language = "ko" } = req.body;

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

      // body에 관심 주식을 넣은 경우
      if (interest_stocks && interest_stocks.length > 0) {
        const newInterestStock = new InterestStock({
          user_email: email,
          stock_list: interest_stocks.map((stock) => ({ stock, created_at: getKoreanTime() })),
        });
        await newInterestStock.save();
      }

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

// 소셜 회원가입registerSocial
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
        interest_stocks,
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

      // body에 관심 주식을 넣은 경우
      if (interest_stocks && interest_stocks.length > 0) {
        const newInterestStock = new InterestStock({
          user_email: email,
          stock_list: interest_stocks.map((stock) => ({ stock, created_at: getKoreanTime() })),
        });
        await newInterestStock.save();
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

// 유저 프로필 수정
export const updateUserProfile = [
  uploadProfileImg.single("profile"),
  async (req, res) => {
    try {
      // 유저 쿠키 값을 가지고 sns_id 값 가져오기
      const sns_id = "66851b104c108bdb12c7973e";

      const { nickname, gender, interest_stocks } = req.body;

      // 데이터베이스 연결
      await connectDB().catch((err) => {
        res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
        return;
      });

      // 유저 조회
      const user = await User.findOne({ sns_id, is_delete: false });
      if (!user) {
        res.status(404).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
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
        { sns_id, is_delete: false },
        {
          $set: { nickname, gender, profile: new_profile_img },
        }
      );

      // 유저 관심주식 조회
      const interestStock = await InterestStock.findOne({ user_snsId: user.sns_id, is_delete: false });

      // body에 관심 주식을 넣은 경우
      if (interest_stocks && interest_stocks.length > 0) {
        // DB에 유저 관심 주식이 있는 경우
        if (interestStock) {
          await interestStock.updateStockList(interest_stocks);
        }
        // DB에 유저 관심 주식이 없을 경우 새로 생성
        else {
          const newInterestStock = new InterestStock({
            user_email: user.email,
            stock_list: interest_stocks.map((stock) => ({ stock, created_at: getKoreanTime() })),
          });
          await newInterestStock.save();
        }
      }

      res.status(200).json({ ok: true, message: "프로필 수정 완료" });
    } catch (err) {
      res.status(500).json({ ok: false, message: err.message });
    }
  },
];

// 유저 개인정보 수정
export const updateUserInfo = async (req, res) => {
  try {
    const { email, password, phone, birth } = req.body;

    // 유저 쿠키 값을 가지고 user_id(인덱스) 값 가져오기
    const sns_id = "66851b104c108bdb12c7973e";

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    // 고정 값으로 보낸 이메일과 DB에 저장된 이메일이 같은지 확인
    const user = await User.findOne({ sns_id, is_delet: false }).select("+password");
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

    // 프로필 수정
    await User.findOneAndUpdate(
      { sns_id, is_delete: false },
      {
        $set: {
          password: hashedPassword,
          phone,
          birth,
        },
      }
    );

    res.status(200).json({ ok: true, message: "회원 정보 수정 완료" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 인증코드 이메일 발송 (탈퇴여부 체크)
export const sendEmail = async (req, res) => {
  const { email } = req.body;
  try {
    await connectDB();

    // (탈퇴여부 체크)
    const user = await User.findOne({ email });
    if (user) {
      res.status(401).json({ ok: false, message: "이미 가입된 이메일입니다." });
      return;
    }

    // 인증 코드 생성 및 Cert 인스턴스 생성
    const cert = new Cert({ user_email: email });
    const code = cert.generateCode(); // 인증 코드 및 만료 시간 생성

    await send_main_func({ to: email, VERIFICATION_CODE: code });
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
    const cert = await Cert.findOne({ user_email: email }).sort({ created_at: -1 });

    if (!cert) {
      res.status(404).json({ ok: false, message: "인증 요청이 없습니다." });
      return;
    }

    const isValid = cert.verifyCode(code);

    if (!isValid) {
      res.status(400).json({ ok: false, message: "인증 코드가 유효하지 않거나 만료되었습니다." });
      return;
    }

    res.status(200).json({ ok: true, message: "인증 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
