import { commands, ProgressLocation, Uri, window } from "vscode";
import { Subscription } from "../models";
import { Extension } from "./Extension";
import { COMMAND, General } from "../constants";
import { fetchTitle, fileExists, findFileInWorkspace } from "../utils";
import { DocHubTreeItem, DocsService, PanelService } from ".";

export class CommandsService {
  public static register() {
    const subscriptions: Subscription[] = Extension.getInstance().subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.addDocs, CommandsService.addDocs)
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.openDocs, CommandsService.openDocs)
    );
    subscriptions.push(
      commands.registerCommand(
        COMMAND.openInBrowser,
        CommandsService.openInBrowser
      )
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.openConfig, CommandsService.openConfig)
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.collapseAll, PanelService.collapseAll)
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.removeDocs, CommandsService.removeDocs)
    );
  }

  private static async addDocs() {
    const url = await window.showInputBox({
      prompt: "Enter the URL of the documentation",
    });

    if (!url) {
      return;
    }

    let title: string | undefined = await fetchTitle(url);
    title = await window.showInputBox({
      prompt: "Enter the title of the documentation",
      value: title,
    });

    await DocsService.addToDocs(url, title);
    PanelService.update();
  }

  private static async openInBrowser(
    item: string | DocHubTreeItem | undefined
  ) {
    let url = item;
    if (typeof item === "object") {
      url = item.url;
    }

    if (!url) {
      return;
    }

    await commands.executeCommand("vscode.open", url);
  }

  private static async openDocs(item: string | DocHubTreeItem | undefined) {
    let url = item;
    if (typeof item === "object") {
      url = item.url;
    }

    if (!url) {
      return;
    }

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: "Opening documentation...",
      },
      async () => {
        await commands.executeCommand("browse-lite.open", url);
      }
    );
  }

  private static async openConfig() {
    const workspaceFolder = Extension.getInstance().workspaceFolder;
    if (!workspaceFolder) {
      return;
    }

    const docsUri = await findFileInWorkspace(General.docsFile);
    if (docsUri && await fileExists(docsUri)) {
      await window.showTextDocument(docsUri);
    }
  }

  private static async removeDocs(item: string | DocHubTreeItem | undefined) {
    let title = item;
    let url = item;
    if (typeof item === "object") {
      title = item.label;
      url = item.url;
    }

    if (!url) {
      return;
    }

    const confirm = await window.showWarningMessage(
      `Are you sure you want to remove the documentation link for "${title}"?`,
      { modal: true },
      "Yes"
    );

    if (confirm === "Yes") {
      await DocsService.removeFromDocs(url as string);
      PanelService.update();
    }
  }
}
