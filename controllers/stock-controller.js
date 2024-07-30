import Stock from "../schemas/stock-schema.js";
import User from "../schemas/user-schema.js";

// GET /stocks
export const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();

    res.status(200).json({ ok: true, data: stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /stocks/:reuters_code
export const getStockByReutersCode = async (req, res) => {
  const reuters_code = req.params.reuters_code;

  try {
    const stock = await Stock.findOne({ reuters_code: reuters_code });
    if (!stock) {
      return res.status(404).json({ ok: false, message: "Stock not found" });
    }

    res.status(200).json({ ok: true, data: stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const getStockLangName = async (req, res) => {
  try {
    const { snsId } = req.session;
    const user = await User.findOne({ sns_id: snsId }, { _id: 0, language: 1 });
    const stocks = await Stock.find({}, { _id: 0, reuters_code: 1, stock_name: 1, stock_name_eng: 1 });

    const getLabel = (stock, lang) => {
      if (lang === "ko") {
        return `#${stock.stock_name}`;
      } else {
        return `#${stock.stock_name_eng}`;
      }
    };

    const result = stocks.map((stock) => ({
      value: stock.reuters_code,
      label: getLabel(stock, user.language),
    }));

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};
