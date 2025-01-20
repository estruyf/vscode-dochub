import * as cheerio from "cheerio";
import { fetchFavicon } from ".";

const fetchWithTimeout = (url: string, timeout: number): Promise<Response> => {
  return Promise.race<Response>([
    fetch(url),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};

export const fetchTitle = async (url: string): Promise<string> => {
  try {
    const response = await fetchWithTimeout(url, 2000);
    const text = await response.text();

    const $ = cheerio.load(text);
    const title = $("title").text();

    await fetchFavicon($, url);

    return (title || "").trim();
  } catch (error) {
    console.error(error);
    return "";
  }
};
