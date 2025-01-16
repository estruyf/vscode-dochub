import { commands, TreeItem, TreeView, window } from "vscode";
import {
  DocHubTreeItem,
  DocHubTreeviewProvider,
  DocsService,
  FrameworkDiscovery,
} from ".";
import { COMMAND } from "../constants";
import { getFaviconPath, findFileInWorkspace } from "../utils";

export class PanelService {
  private static treeView: TreeView<TreeItem>;
  private static demoActionsProvider: DocHubTreeviewProvider;
  private static items: DocHubTreeItem[] | undefined;

  public static register() {
    PanelService.init();
  }

  /**
   * Collapses all items in the "dochub" tree view.
   *
   * @private
   */
  public static collapseAll() {
    commands.executeCommand("workbench.actions.treeView.dochub.collapseAll");
  }

  public static async update() {
    const docs = await DocsService.getDocs();
    if (!docs || docs.length <= 0) {
      PanelService.items = undefined;
    }

    const treeviewItems: DocHubTreeItem[] = [];
    const docItems: { [category: string]: DocHubTreeItem[] } = {};
    docItems["NO_CATEGORY"] = [];

    for (const doc of docs || []) {
      const icon = await getFaviconPath(doc.url);
      if (doc.category) {
        if (!docItems[doc.category]) {
          docItems[doc.category] = [];
        }

        docItems[doc.category].push(
          new DocHubTreeItem(doc.title, COMMAND.openDocs, doc.url, icon)
        );
      } else {
        docItems["NO_CATEGORY"].push(
          new DocHubTreeItem(doc.title, COMMAND.openDocs, doc.url, icon)
        );
      }
    }

    for (const category in docItems) {
      if (docItems[category].length > 0) {
        treeviewItems.push(
          new DocHubTreeItem(
            category === "NO_CATEGORY" ? "Docs" : category,
            undefined,
            undefined,
            undefined,
            docItems[category]
          )
        );
      }
    }

    const frameworkLinks = await FrameworkDiscovery.discover();
    if (frameworkLinks && frameworkLinks.length > 0) {
      treeviewItems.push(
        new DocHubTreeItem(
          "Frameworks",
          undefined,
          undefined,
          "tools",
          frameworkLinks.map(
            (framework) =>
              new DocHubTreeItem(
                framework.name,
                COMMAND.openDocs,
                framework.link,
                undefined,
                undefined,
                "dochub.framework"
              )
          )
        )
      );
    }

    PanelService.items = treeviewItems;

    PanelService.demoActionsProvider.update();
  }

  public static getDocs() {
    return PanelService.items || [];
  }

  /**
   * Initialize the command panel
   */
  private static async init() {
    PanelService.demoActionsProvider = new DocHubTreeviewProvider();

    await PanelService.update();

    this.treeView = window.createTreeView("dochub", {
      treeDataProvider: PanelService.demoActionsProvider,
    });
  }
}
