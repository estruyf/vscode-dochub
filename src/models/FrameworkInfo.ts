export interface FrameworkInfo {
  frameworks: Framework[];
}

export interface Framework {
  name: string;
  files: string[];
  contents: string[];
  links: string[];
}
