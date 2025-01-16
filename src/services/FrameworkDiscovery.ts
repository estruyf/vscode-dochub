import { Uri, workspace } from "vscode";

export class FrameworkDiscovery {
  private static frameworks: Array<
    keyof typeof FrameworkDiscovery.frameworkDocs
  > = ["react", "vue", "angular", "@slidev/cli"];
  private static frameworkDocs: { [key: string]: string } = {
    react: "https://react.dev/",
    vue: "https://vuejs.org/guide/introduction.html",
    angular: "https://angular.io/start",
    "@slidev/cli": "https://sli.dev/guide/",
  };

  public static async discover() {
    const frameworks = await FrameworkDiscovery.getFrameworks();
    if (frameworks) {
      // Retrun all the frameworks with their documentation links
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
}
