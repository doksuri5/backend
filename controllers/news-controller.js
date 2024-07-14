import connectDB from "../database/db.js";
import InterestStock from "../schemas/interestStock-schema.js";
import News from "../schemas/news-schema.js";

// 오늘 인기있는 뉴스
export const getTodayPopularNews = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const koreanOffset = 9 * 60 * 60 * 1000; // 한국 시간은 UTC+9

    const today = new Date(new Date().setHours(0, 0, 0, 0) + koreanOffset);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const padZero = (num) => (num < 10 ? "0" : "") + num;

    const formatDate = (date) =>
      `${date.getFullYear()}.${padZero(date.getMonth() + 1)}.${padZero(date.getDate())} 00:00`;

    let startDate = new Date(today);
    let endDate = new Date(tomorrow);
    let news = [];

    while (news.length < 3) {
      const startDateString = formatDate(startDate);
      const endDateString = formatDate(endDate);

      const todayNews = await News.find({ published_time: { $gte: startDateString, $lte: endDateString } })
        .sort({ score: -1, view: -1, published_time: -1 })
        .limit(3 - news.length);

      news = news.concat(todayNews);

      if (news.length >= 3) break;

      // 하루 전으로 범위를 조정
      endDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - 1);
    }

    res.status(200).json({ ok: true, data: news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 관심종목과 관련된 뉴스
export const getInterestStockNews = async (req, res) => {
  try {
    // const {snsId} = req.session;
    const snsId = "4c4f028e-b42c-4174-b8c2-368b20c30be9";

    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const { stock_list } = await InterestStock.findOne({ user_snsId: snsId, is_delete: false });
    const interest_stock_list = stock_list.map((item) => item.reuters_code);

    const interestStockNews = await News.find({ relative_stock: { $in: interest_stock_list } })
      .sort({
        published_time: -1,
        score: -1,
        view: -1,
      })
      .limit(6);

    res.status(200).json({ ok: true, data: interestStockNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 최신 뉴스
export const getRecentNews = async (req, res) => {
  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });
    const recentNews = await News.find().sort({ published_time: -1 });

    res.status(200).json({ ok: true, data: recentNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// 1개 뉴스 조회 (관련 기사 포함)
export const getNews = async (req, res) => {
  const { index } = req.params;

  try {
    // 데이터베이스 연결
    await connectDB().catch((err) => {
      res.status(500).json({ ok: false, message: "데이터베이스 연결에 실패했습니다." });
      return;
    });

    const news = await News.findOne({ index });
    const relative_stock = news.relative_stock;

    const relativeNews = await News.find({ relative_stock: { $in: relative_stock }, index: { $nin: index } })
      .sort({
        published_time: -1,
      })
      .limit(4);

    res.status(200).json({ ok: true, data: { news, relativeNews } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
};