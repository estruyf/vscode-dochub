import { Uri, workspace } from "vscode";

export class FrameworkDiscovery {
  private static frameworks: Array<string> = [];
  private static frameworkDocs: { [key: string]: string } = {};

  public static async discover() {
    const frameworks = await FrameworkDiscovery.getFrameworks();
    if (frameworks) {
      // Return all the frameworks with their documentation links
      return frameworks.map((framework) => {
        return {
          name: framework,
          link:
            FrameworkDiscovery.frameworkDocs[
              framework as keyof typeof FrameworkDiscovery.frameworkDocs
            ] || "",
        };
      });
    }
    return null;
  }

  private static async getFrameworks() {
    const packageJson = await FrameworkDiscovery.getPackageJson();
    if (!packageJson) {
      return null;
    }

    const packageJsonDependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];
    if (!packageJsonDependencies) {
      return null;
    }

    const frameworks = FrameworkDiscovery.getFrameworkFromDependencies(
      packageJsonDependencies
    );
    return frameworks;
  }

  private static async getPackageJson() {
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
      return null;
    }

    for (const folder of workspaceFolders) {
      const packageJsonUri = Uri.joinPath(folder.uri, "package.json");
      const packageJson = await workspace.fs.readFile(packageJsonUri);
      if (packageJson) {
        const packageTxt = Buffer.from(packageJson).toString("utf-8");
        return JSON.parse(packageTxt);
      }
    }

    return null;
  }

  private static getFrameworkFromDependencies(
    dependencies: string[]
  ): string[] {
    const frameworks = dependencies.filter((dependency) =>
      FrameworkDiscovery.frameworks.includes(dependency)
    );
    return frameworks;
  }

  public static async loadFrameworks() {
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    for (const folder of workspaceFolders) {
      const frameworksJsonUri = Uri.joinPath(folder.uri, "frameworks.json");
      const frameworksJson = await workspace.fs.readFile(frameworksJsonUri);
      if (frameworksJson) {
        const frameworksTxt = Buffer.from(frameworksJson).toString("utf-8");
        const frameworksData = JSON.parse(frameworksTxt);
        FrameworkDiscovery.frameworks = frameworksData.frameworks.map(
          (framework: any) => framework.contents[0]
        );
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
}

// Load frameworks from frameworks.json
FrameworkDiscovery.loadFrameworks();
