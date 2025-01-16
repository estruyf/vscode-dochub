import { Uri, workspace } from "vscode";

export const fileExists = async (filePath: Uri): Promise<boolean> => {
  try {
    await workspace.fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
};

export const findDocsFileInWorkspace = async (): Promise<Uri | undefined> => {
  const files = await workspace.findFiles('**/.dochub.json', '**/node_modules/**');
  return files.length > 0 ? files[0] : undefined;
};
