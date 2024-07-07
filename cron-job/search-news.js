import * as cheerio from "cheerio";

export const getSearchNews = async (query) => {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURI(
    query
  )}`;
  const response = await fetch(url, { cache: "no-store" });
  const html = await response.text();

  const $ = cheerio.load(html);

  const crawlingList = [];
  $(".news_area").each((_, element) => {
    const thumbnailUrl = $(element).find(".thumb").attr("data-lazysrc");
    const time = $(element).find(".info_group span").text();
    const title = $(element).find(".news_tit").attr("title");
    const description = $(element)
      .find(".dsc_wrap .dsc_txt_wrap")
      .text()
      .trim();

    const crawlingDic = {
      title,
      time,
      thumbnailUrl,
      description,
    };
    crawlingList.push(crawlingDic);
  });

  return crawlingList;
};
