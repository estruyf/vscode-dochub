import { Uri, workspace } from "vscode";

export const findFileInWorkspace = async (fileName: string): Promise<Uri | undefined> => {
  const files = await workspace.findFiles(`**/${fileName}`, '**/node_modules/**');
  return files.length > 0 ? files[0] : undefined;
};
