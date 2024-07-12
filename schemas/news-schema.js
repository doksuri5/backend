import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  index: { type: String, required: true },
  stock_name: { type: String, required: true },
  publisher: {
    type: [
      {
        ko: String,
        en: String,
        ch: String,
        jp: String,
        fr: String,
      },
    ],
    required: true,
  },
  thumbnail_url: { type: String, required: true },
  title: {
    type: [
      {
        ko: String,
        en: String,
        ch: String,
        jp: String,
        fr: String,
      },
    ],
    required: true,
  },
  description: {
    type: [
      {
        ko: String,
        en: String,
        ch: String,
        jp: String,
        fr: String,
      },
    ],
    required: true,
  },
  published_time: { type: String, required: true },
  ai_summary: {
    type: [
      {
        ko: String,
        en: String,
        ch: String,
        jp: String,
        fr: String,
      },
    ],
  },
  view: { type: Number, default: 0 },
  relative_stock: { type: [String] },
  count: { type: Number, default: 0 },
});

const News = mongoose.models.News || mongoose.model("News", NewsSchema);
export default News;
