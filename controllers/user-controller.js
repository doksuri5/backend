const User = require("../schemas/user-schema");

// 전체 유저 조회
exports.getAllUser = async (req, res) => {
  try {
    const result = await User.find();
    res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err,
    });
    return;
  }
};
