import connectDB from "../database/db.js";
import Terms from "../schemas/terms-schema.js";

export const getTerms = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const terms = await Terms.findOne();
    if (!terms) {
      res.status(404).json({ ok: false, message: "약관을 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({ ok: true, data: terms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 서비스 이용약관 업데이트
export const updateTermsOfService = async (req, res) => {
  try {
    const { content, reason } = req.body;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const terms = await Terms.findOne();
    if (!terms) {
      res.status(404).json({ ok: false, message: "약관을 찾을 수 없습니다." });
      return;
    }

    await terms.updateTermsOfService(content, reason);
    res.status(200).json({ ok: true, message: "서비스 이용약관이 업데이트되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 개인정보 처리방침 업데이트
export const updatePrivacyPolicy = async (req, res) => {
  try {
    const { content, reason } = req.body;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const terms = await Terms.findOne();
    if (!terms) {
      res.status(404).json({ ok: false, message: "약관을 찾을 수 없습니다." });
      return;
    }

    await terms.updatePrivacyPolicy(content, reason);
    res.status(200).json({ ok: true, message: "개인정보 처리방침이 업데이트되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
