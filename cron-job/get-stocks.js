import connectDB from "../database/db.js";
import StockCode from "../schemas/stock-code.js";
import Stock from "../schemas/stock-schema.js";

export const getStocks = async () => {
  await connectDB().catch((err) => {
    console.error(err);
    return;
  });

  try {
    const codes = await StockCode.find({});
    const stockCodes = codes.map((item) => item.code);

    const res = await Promise.allSettled(
      stockCodes.map(async (code) => {
        const response = await fetch(
          `https://api.stock.naver.com/stock/${code}/basic`
        );
        return response.json();
      })
    );

    const stocks = res
      .filter((item) => item.status === "fulfilled")
      .map((item) => {
        const data = item.value;

        const selectedData = {
          stock_name: data.stockName,
          stock_name_eng: data.stockNameEng,
          symbol_code: data.symbolCode,
          reuters_code: data.reutersCode,
          close_price: data.closePrice,
          nation_type: data.nationType,
          compare_to_previous_close_price: data.compareToPreviousClosePrice,
          fluctuations_ratio: data.fluctuationsRatio,
        };

        return selectedData;
      });

    const bulkOps = stocks.map((stock) => ({
      updateOne: {
        filter: { reuters_code: stock.reuters_code },
        update: { $set: stock },
        upsert: true, // If the stock does not exist, insert it
      },
    }));

    try {
      const result = await Stock.bulkWrite(bulkOps);
      console.log("Bulk operation success:", result);
    } catch (err) {
      console.error("Bulk operation error:", err);
    }
  } catch (err) {
    console.error(err);
  }
};
