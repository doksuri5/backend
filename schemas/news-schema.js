const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
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
  image: { type: String },
  hit: { type: Number, required: true, default: 0 },
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
  news_date: { type: String, required: true },
});

module.exports = mongoose.models.News || mongoose.model("News", NewsSchema);
