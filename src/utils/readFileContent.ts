import { Uri, workspace } from "vscode";

export const readFileContent = async (fileUri: Uri): Promise<string> => {
  try {
    const fileContent = await workspace.fs.readFile(fileUri);
    return Buffer.from(fileContent).toString("utf-8");
  } catch (error) {
    throw new Error(`Failed to read file content: ${(error as Error).message}`);
  }
};
