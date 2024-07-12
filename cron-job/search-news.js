import puppeteer from "puppeteer";
import { formatDate } from "../utils/formatDate.js";
import * as xlsx from "xlsx";

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

const getTranslatedContent = async (link, language) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1920,1080", "--disable-notifications", "--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  await page.goto(link, { waitUntil: "networkidle2" });
  await page.click(language.buttonSelector);
  await delay(5000);
  await scrollPage(page);

  const translatedResults = await page.evaluate(
    (language, stock_list) => {
      const tags = document.querySelectorAll("#section-list > ul > li");
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

      let publisher = "";
      if (language.lang === "ko") publisher = "연합 인포맥스";
      if (language.lang === "en") publisher = "Yonhap Infomax";
      if (language.lang === "jp") publisher = "連合インフォマックス";
      if (language.lang === "ch") publisher = " 韩联社 Infomax";

      const indexCount = {};

      tags.forEach((t) => {
        const title = t?.querySelector(".titles a")?.textContent.trim();
        const thumbnail_url = t?.querySelector("a > img")?.src;
        const description = t?.querySelector(".lead a")?.textContent.trim();
        const linkTag = t?.querySelector(".titles a");
        const link = linkTag ? `https://news.einfomax.co.kr${linkTag.getAttribute("href")}` : null;
        const indexMatch = link ? link.match(/idxno=(\d+)/) : null;
        const index = indexMatch ? indexMatch[1] : null;

        if (thumbnail_url && description && link) {
          let relative_stock = [];
          if (language.lang === "ko") {
            relative_stock = extractStockSymbols(title + " " + description);
          }
          indexCount[index] = (indexCount[index] || 0) + 1;

          result.push({
            index,
            publisher,
            thumbnail_url,
            title,
            description,
            published_time: t?.querySelector(".byline em:last-child")?.textContent,
            link,
            relative_stock: JSON.stringify(relative_stock),
            count: indexCount[index],
          });
        }
      });
      return result;
    },
    language,
    stock_list
  );

  await browser.close();
  return { lang: language.lang, data: translatedResults };
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
    { lang: "ko", buttonSelector: ".translate-btn.kr" },
    { lang: "en", buttonSelector: ".translate-btn.en" },
    { lang: "jp", buttonSelector: ".translate-btn.jp" },
    { lang: "ch", buttonSelector: ".translate-btn.cn" },
  ];

  const translatedContentPromises = languages.map((language) => getTranslatedContent(url, language));

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
    await delay(5000); // 다음 query 진행 전에 5초 딜레이
  }

  // 엑셀 파일로 저장
  const workbook = xlsx.utils.book_new();
  allResults.forEach(({ query, translatedContents }) => {
    translatedContents.forEach(({ lang, data }) => {
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, `${query}_${lang}`);
    });
  });
  xlsx.writeFile(workbook, "translated_content.xlsx");
};

export { main };
