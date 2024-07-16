import connectDB from "../database/db.js";
import Propensity from "../schemas/propensity-schema.js";
import User from "../schemas/user-schema.js";

// 투자성향 가져오기
export const getPropensity = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = User.findOne({ sns_id: snsId, is_delete: false });
    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    const userPropensity = await Propensity.findOne({ user_snsId: snsId });
    res.status(200).json({ ok: true, data: userPropensity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 투자성향 업데이트
export const updatePropensity = async (req, res) => {
  try {
    const { snsId } = req.session;
    const { isAgreeCreditInfo, investPropensity } = req.body;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const user = User.findOne({ sns_id: snsId, is_delete: false });
    if (!user) {
      res.status(401).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    await Propensity.findOneAndUpdate(
      { user_snsId: snsId },
      {
        $set: {
          isAgreeCreditInfo,
          investPropensity,
          updated_at: getKoreanTime(),
        },
      }
    );

    res.status(200).json({ ok: true, message: "투자성향 업데이트 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
