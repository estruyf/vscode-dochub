import { Framework } from "./../models/FrameworkInfo";
import { Uri, workspace } from "vscode";
import { Extension } from "./Extension";

export class FrameworkDiscovery {
  private static frameworks: Framework[] = [];
  private static frameworkDocs: { [key: string]: string } = {};
  private static frameworkFiles: { [key: string]: any } = {};

  public static async discover() {
    await FrameworkDiscovery.loadFrameworks();

    let frameworkLinks: {
      name: string;
      link: string;
    }[] = [];

    const frameworks = await FrameworkDiscovery.getFrameworks();
    if (frameworks) {
      // Return all the frameworks with their documentation links
      frameworkLinks = frameworks.map((framework) => {
        return {
          name: framework,
          link:
            FrameworkDiscovery.frameworkDocs[
              framework as keyof typeof FrameworkDiscovery.frameworkDocs
            ] || "",
        };
      });
    }

    FrameworkDiscovery.frameworkFiles = {};
    return frameworkLinks;
  }

  private static async getFrameworks() {
    const frameworks: string[] = [];

    for (const framework of FrameworkDiscovery.frameworks) {
      const files = framework.files;
      for (const file of files) {
        if (file === "package.json") {
          const discovered = await FrameworkDiscovery.processPackageJson(
            framework
          );
          frameworks?.push(...discovered);
        }
      }
    }

    return frameworks.flat().filter((framework) => framework !== null);
  }

  private static async processPackageJson(framework: Framework) {
    const packageJson = await FrameworkDiscovery.getPackageJson();
    if (!packageJson) {
      return [];
    }

    const packageJsonDependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];
    if (!packageJsonDependencies) {
      return [];
    }

    const frameworks = FrameworkDiscovery.getFrameworkFromDependencies(
      packageJsonDependencies,
      framework
    );
    return frameworks;
  }

  private static async getPackageJson() {
    if (FrameworkDiscovery.frameworkFiles["package.json"]) {
      return FrameworkDiscovery.frameworkFiles["package.json"];
    }

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    for (const folder of workspaceFolders) {
      const packageJsonUri = Uri.joinPath(folder.uri, "package.json");
      const packageJson = await workspace.fs.readFile(packageJsonUri);
      if (packageJson) {
        const packageTxt = Buffer.from(packageJson).toString("utf-8");
        FrameworkDiscovery.frameworkFiles["package.json"] =
          JSON.parse(packageTxt);
        return FrameworkDiscovery.frameworkFiles["package.json"];
      }
    }

    return;
  }

  private static getFrameworkFromDependencies(
    dependencies: string[],
    framework: Framework
  ): string[] {
    const frameworks = dependencies.filter((dependency) => {
      return framework.contents.some((content) => {
        return dependency.includes(content);
      });
    });
    return frameworks;
  }

  private static async loadFrameworks() {
    if (FrameworkDiscovery.frameworks.length > 0) {
      return;
    }

    const ext = Extension.getInstance();
    if (!ext) {
      return;
    }

    const extensionUri = ext.extensionUri;
    const frameworksJsonUri = Uri.joinPath(extensionUri, "frameworks.json");
    const frameworksJson = await workspace.fs.readFile(frameworksJsonUri);
    if (frameworksJson) {
      const frameworksTxt = Buffer.from(frameworksJson).toString("utf-8");
      const frameworksData = JSON.parse(frameworksTxt);
      FrameworkDiscovery.frameworks = frameworksData.frameworks;
      FrameworkDiscovery.frameworkDocs = frameworksData.frameworks.reduce(
        (acc: any, framework: any) => {
          acc[framework.contents[0]] = framework.links[0];
          return acc;
        },
        {}
      );
    }
  }
}
