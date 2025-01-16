import * as vscode from "vscode";
import { Extension } from "./services/Extension";
import { CommandsService, ConfigListeners, PanelService } from "./services";

export function activate(context: vscode.ExtensionContext) {
  Extension.getInstance(context);

  ConfigListeners.register();
  CommandsService.register();
  PanelService.register();

  console.log("📓 DocHub is now active!");
}

// This method is called when your extension is deactivated
export function deactivate() {}
