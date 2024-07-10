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
          stockName: data.stockName,
          stockNameEng: data.stockNameEng,
          symbolCode: data.symbolCode,
          reutersCode: data.reutersCode,
          closePrice: data.closePrice,
          nationType: data.nationType,
          compareToPreviousClosePrice: data.compareToPreviousClosePrice,
          fluctuationsRatio: data.fluctuationsRatio,
        };

        return selectedData;
      });

    const bulkOps = stocks.map((stock) => ({
      updateOne: {
        filter: { reutersCode: stock.reutersCode },
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
