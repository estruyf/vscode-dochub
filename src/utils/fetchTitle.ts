import * as path from "path";
import { Uri, workspace } from "vscode";
import { Extension } from "../services";
import * as cheerio from "cheerio";

export const fetchTitle = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const text = await response.text();

  const $ = cheerio.load(text);
  const title = $("title").text();

  await fetchFavicon($, url);

  return title || "";
};

const fetchFavicon = async ($: cheerio.CheerioAPI, url: string) => {
  let favicon =
    $(`link[rel="shortcut icon"]`).attr("href") ||
    $('link[rel="icon"]').attr("href") ||
    "";
  if (!favicon) {
    return;
  }

  if (!favicon.startsWith("http")) {
    const crntUrl = new URL(url);
    favicon = `${crntUrl.origin}${favicon}`;
  }

  const response = await fetch(favicon);
  const blob = await response.blob();

  const ext = Extension.getInstance();
  await ext.createGlobalStorageIfNotExists();

  const storageStatePath = ext.globalStorageUri;
  if (!storageStatePath) {
    return;
  }

  const fileExtension = path.extname(favicon);
  const crntUrl = new URL(url);
  const hostName = crntUrl.hostname;
  const base64Url = Buffer.from(hostName).toString("base64");
  const fileName = `${base64Url}${fileExtension}`;
  const filePath = Uri.joinPath(storageStatePath, fileName);

  const arrayBuffer = await blob.arrayBuffer();
  await workspace.fs.writeFile(filePath, Buffer.from(arrayBuffer));
};
