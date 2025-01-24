export interface DefinitionFile {
  path: string;
  name: string;
  content?: string;
}

export interface DetectorOptions {
  previous: DefinitionFile;
  current: DefinitionFile;
  ignorePatterns?: string[];
}