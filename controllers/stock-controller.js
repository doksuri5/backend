import Stock from "../schemas/stock-schema.js";

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
