import * as puppeteer from "puppeteer";
import { formatDate } from "../utils/formatDate.js";

const stock_list = [
  { 애플: "AAPL.O" },
  { APPLE: "AAPL.O" },
  { APPL: "AAPL.O" },
  { 마이크로소프트: "MSFT.O" },
  { MS: "MSFT.O" },
  { MSFT: "MSFT.O" },
  { 구글: "GOOGL.O" },
  { GOOGLE: "GOOGL.O" },
  { GOOGL: "GOOGL.O" },
  { 알파벳: "GOOGL.O" },
  { 아마존: "AMZN.O" },
  { AMZN: "AMZN.O" },
  { 테슬라: "TSLA.O" },
  { TSLA: "TSLA.O" },
  { 유니티: "U" },
  { "NYS:U": "U" },
];

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scrollPage = async (page) => {
  await page.evaluate(async () => {
    const distance = 100;
    const delay = 100;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  });
};

const getTranslatedContent = async (link, language, query) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.resourceType() === "image" || req.resourceType() === "stylesheet" || req.resourceType() === "font") {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(link, { waitUntil: "networkidle2" });

  // buttonSelector가 모두 로딩될 때까지 기다리기
  await page.waitForSelector(language.buttonSelector, { visible: true });
  await page.click(language.buttonSelector);
  await delay(3000);
  await scrollPage(page);

  const tags = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#section-list > ul > li"))
      .slice(0, 10)
      .map((t) => ({
        title: t.querySelector(".titles a")?.textContent.trim(),
        thumbnail_url: t.querySelector("a > img")?.src,
        description: t.querySelector(".lead a")?.textContent.trim(),
        link: t.querySelector(".titles a")
          ? `https://news.einfomax.co.kr${t.querySelector(".titles a").getAttribute("href")}`
          : null,
        published_time: t.querySelector(".byline em:last-child")?.textContent,
      }));
  });

  const result = [];
  const extractStockSymbols = (text) => {
    const stocks = new Set();
    stock_list.forEach((stock) => {
      const [key, value] = Object.entries(stock)[0];
      if (text.includes(key)) {
        stocks.add(value);
      }
    });
    return Array.from(stocks);
  };

  const indexCount = {};

  for (const t of tags) {
    if (t.thumbnail_url && t.description && t.link) {
      await page.goto(t.link, { waitUntil: "networkidle2" });

      const articleContent = await page.evaluate(() => {
        const content = Array.from(document.querySelectorAll("#article-view-content-div p"))
          .map((p) => p.textContent.trim())
          .filter((text) => text.length > 0)
          .join("\n");

        const contentImg = document.querySelector("#article-view-content-div img")?.src || "";

        return { content, contentImg };
      });

      const { content, contentImg } = articleContent;

      let relative_stock = [];
      if (language.lang === "ko") {
        relative_stock = extractStockSymbols(t.title + " " + t.description + " " + content);
      }
      const indexMatch = t.link.match(/idxno=(\d+)/);
      const index = indexMatch ? indexMatch[1] : null;
      indexCount[index] = (indexCount[index] || 0) + 1;

      result.push({
        index,
        stock_name: query,
        publisher: language.publisher,
        thumbnail_url: t.thumbnail_url,
        title: t.title,
        description: t.description,
        published_time: t.published_time,
        link: t.link,
        content,
        contentImg,
        relative_stock: JSON.stringify(relative_stock),
        count: indexCount[index],
      });
    }
  }

  await browser.close();
  return { lang: language.lang, data: result };
};

const getSearchNews = async (query) => {
  console.time(`Total Execution Time for ${query}`);
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const todayFormatted = formatDate(today);
  const yearStartFormatted = formatDate(yearStart);

  const url = `https://news.einfomax.co.kr/news/articleList.html?page=1&sc_section_code=S1N21&sc_area=A&sc_level=&sc_article_type=&sc_sdate=${yearStartFormatted}&sc_edate=${todayFormatted}&sc_serial_number=&sc_word=${encodeURI(
    query
  )}&box_idxno=&sc_order_by=E&view_type=sm`;

  console.log(url);

  const languages = [
    { lang: "ko", buttonSelector: ".translate-btn.kr", publisher: "연합 인포맥스" },
    { lang: "en", buttonSelector: ".translate-btn.en", publisher: "Yonhap Infomax" },
    { lang: "jp", buttonSelector: ".translate-btn.jp", publisher: "連合インフォマックス" },
    { lang: "ch", buttonSelector: ".translate-btn.cn", publisher: "韩联社 Infomax" },
  ];

  const translatedContentPromises = languages.map((language) => getTranslatedContent(url, language, query));

  const translatedContents = await Promise.all(translatedContentPromises);

  console.timeEnd(`Total Execution Time for ${query}`);
  return { query, translatedContents };
};

const main = async () => {
  const queries = ["애플", "마이크로소프트", "아마존", "테슬라", "유니티", "구글"];
  const allResults = [];
  for (const query of queries) {
    const result = await getSearchNews(query);
    allResults.push(result);
    await delay(3000);
  }
};

export { main };
