import { Uri, workspace } from "vscode";
import { Extension } from "../services";

export const getFaviconPath = async (url: string): Promise<Uri | undefined> => {
  const ext = Extension.getInstance();
  const globalStorageUri = ext.globalStorageUri;

  const crntUrl = new URL(url);
  const hostName = crntUrl.hostname;
  const base64Url = Buffer.from(hostName).toString("base64");

  const files = await workspace.fs.readDirectory(globalStorageUri);
  const file = files.find((file) => file[0].includes(base64Url));

  if (file) {
    return Uri.file(Uri.joinPath(globalStorageUri, file[0]).fsPath);
  }

  return;
};
