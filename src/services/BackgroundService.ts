import { fetchTitle } from "../utils";
import { DocsService } from "./DocsService";
import { Extension } from "./Extension";
import { FrameworkDiscovery } from "./FrameworkDiscovery";
import { PanelService } from "./PanelService";

export class BackgroundService {
  public static async onStartup(force: boolean = false) {
    const ext = Extension.getInstance();
    const lastUpdate = Number(ext.getState("lastUpdate"));
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    if (!lastUpdate || now - lastUpdate > oneHour || force) {
      ext.setState("lastUpdate", now);
    } else {
      return;
    }

    const docs = await DocsService.getDocs();
    const frameworkLinks = await FrameworkDiscovery.discover();

    for (const doc of docs || []) {
      await fetchTitle(doc.url);
    }
    for (const doc of frameworkLinks || []) {
      await fetchTitle(doc.link);
    }

    PanelService.update();
  }
}
