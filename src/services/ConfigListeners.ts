import { TextDocument, Uri, workspace } from "vscode";
import { parseWinPath } from "../utils";
import { General } from "../constants";
import { PanelService } from "./PanelService";

export class ConfigListeners {
  public static register() {
    workspace.onDidSaveTextDocument(ConfigListeners.checkToUpdate);

    workspace.onDidCreateFiles((e) =>
      ConfigListeners.checkMultipleToUpdate(e.files || [])
    );
    workspace.onDidDeleteFiles((e) =>
      ConfigListeners.checkMultipleToUpdate(e.files || [])
    );
  }

  private static checkMultipleToUpdate(documents: readonly Uri[]) {
    let shouldUpdate = false;

    documents.forEach((file) => {
      const fileName = parseWinPath(file.path);
      if (
        fileName.includes(General.docsFile) ||
        fileName.includes(`package.json`)
      ) {
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      PanelService.update();
    }
  }

  private static checkToUpdate(document: TextDocument) {
    const fileName = parseWinPath(document.fileName);
    if (
      fileName.includes(General.docsFile) ||
      fileName.includes(`package.json`)
    ) {
      PanelService.update();
    }
  }
}
