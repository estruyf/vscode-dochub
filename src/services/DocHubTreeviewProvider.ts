import {
  Event,
  EventEmitter,
  ProviderResult,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
} from "vscode";
import { PanelService } from ".";

export class DocHubTreeviewProvider {
  private _onDidChangeTreeData = new EventEmitter<TreeItem | undefined>();
  public readonly onDidChangeTreeData: Event<TreeItem | undefined> =
    this._onDidChangeTreeData.event;

  private actions: DocHubTreeItem[];

  constructor() {
    this.actions = PanelService.getDocs();
  }

  getTreeItem(element: DocHubTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(
    element?: DocHubTreeItem | undefined
  ): ProviderResult<TreeItem[]> {
    return element && (element as any).children
      ? Promise.resolve((element as any).children)
      : Promise.resolve(this.actions);
  }

  update(): void {
    this.actions = PanelService.getDocs();
    this._onDidChangeTreeData.fire(undefined);
  }
}

export class DocHubTreeItem extends TreeItem {
  constructor(
    label: string,
    command?: string,
    public url?: string,
    icon?: Uri | string,
    private children?: DocHubTreeItem[]
  ) {
    super(
      label,
      children
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.None
    );

    this.iconPath =
      typeof icon === "string"
        ? new ThemeIcon(icon)
        : icon
        ? { light: icon, dark: icon }
        : !children
        ? new ThemeIcon("globe")
        : undefined;

    this.label = label;
    this.tooltip = label;

    this.command = command
      ? {
          command: command,
          title: label,
          arguments: [url],
        }
      : undefined;

    this.contextValue = url ? "dochub.link" : "dochub.folder";

    this.children = children;
  }
}
