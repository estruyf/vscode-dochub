import { commands, ProgressLocation, Uri, window, workspace } from "vscode";
import { Subscription } from "../models";
import { Extension } from "./Extension";
import { COMMAND, General } from "../constants";
import { fetchTitle, fileExists, findFileInWorkspace } from "../utils";
import {
  BackgroundService,
  DocHubTreeItem,
  DocsService,
  PanelService,
} from ".";

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
    subscriptions.push(
      commands.registerCommand(
        COMMAND.refreshFavicons,
        CommandsService.refreshFavicons
      )
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

    const existingCategories = await DocsService.getCategories();
    const category = await window.showQuickPick(
      [...existingCategories, "Add new category..."],
      {
        placeHolder: "Select a category or add a new one",
      }
    );

    let newCategory: string | undefined;
    if (category === "Add new category...") {
      newCategory = await window.showInputBox({
        prompt: "Enter the new category",
      });
    }

    await DocsService.addToDocs(url, title, newCategory || category);
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
    if (docsUri && (await fileExists(docsUri))) {
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

  private static async refreshFavicons() {
    const ext = Extension.getInstance();
    await ext.createGlobalStorageIfNotExists();

    const storageStatePath = ext.globalStorageUri;
    if (!storageStatePath) {
      return;
    }

    const files = await workspace.fs.readDirectory(storageStatePath);
    for (const [fileName] of files) {
      const filePath = Uri.joinPath(storageStatePath, fileName);
      await workspace.fs.delete(filePath);
    }

    PanelService.update();
    await BackgroundService.onStartup(true);
  }
}
