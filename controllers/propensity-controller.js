import connectDB from "../database/db.js";
import Propensity from "../schemas/propensity-schema.js";

export const getPropensity = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const userPropensity = await Propensity.findOne({ user_snsId: snsId });
    res.status(200).json({ ok: false, data: userPropensity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const updatePropensity = async (req, res) => {
  try {
    const { snsId } = req.session;

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
