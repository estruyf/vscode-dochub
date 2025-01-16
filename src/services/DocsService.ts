import { Uri, workspace } from "vscode";
import { General } from "../constants";
import { fileExists, findFileInWorkspace } from "../utils";
import { Extension } from "./Extension";
import { parse } from "jsonc-parser/lib/esm/main.js";
import { DocLink } from "../models";

export class DocsService {
  public static async addToDocs(
    url: string,
    title?: string,
    category?: string
  ) {
    const docsFile = await DocsService.getDocs();
    if (!docsFile) {
      return;
    }

    const newDocs = {
      title: title || url,
      url,
      category,
    };

    docsFile.push(newDocs);

    await DocsService.updateDocsFile(docsFile);
  }

  public static async getDocs(): Promise<DocLink[] | undefined> {
    const workspaceFolder = Extension.getInstance().workspaceFolder;
    if (!workspaceFolder) {
      return;
    }

    const docsUri = await findFileInWorkspace(General.docsFile);
    if (docsUri && await fileExists(docsUri)) {
      const fileContent = await workspace.fs.readFile(docsUri);
      const fileTxt = Buffer.from(fileContent).toString("utf-8");
      const json = parse(fileTxt);
      return json;
    }

    return [];
  }

  public static async removeFromDocs(url: string) {
    const docsFile = await DocsService.getDocs();
    if (!docsFile) {
      return;
    }

    const updatedDocs = docsFile.filter((doc) => doc.url !== url);

    await DocsService.updateDocsFile(updatedDocs);
  }

  private static async updateDocsFile(docs: DocLink[]) {
    const workspaceFolder = Extension.getInstance().workspaceFolder;
    if (!workspaceFolder) {
      return;
    }

    const docsUri = await findFileInWorkspace(General.docsFile);
    if (docsUri) {
      await workspace.fs.writeFile(
        docsUri,
        Buffer.from(JSON.stringify(docs, null, 2))
      );
    }
  }
}
