import * as vscode from "vscode";
import { Extension } from "./services/Extension";
import {
  BackgroundService,
  CommandsService,
  ConfigListeners,
  PanelService,
} from "./services";

export function activate(context: vscode.ExtensionContext) {
  Extension.getInstance(context);

  ConfigListeners.register();
  CommandsService.register();
  PanelService.register();
  BackgroundService.onStartup();

  console.log("📓 DocHub is now active!");
}

// This method is called when your extension is deactivated
export function deactivate() {}
