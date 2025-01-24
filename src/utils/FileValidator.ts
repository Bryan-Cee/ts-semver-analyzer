import { DefinitionFile } from "../interfaces/DetectorOptions";

export class FileValidator {
  static async validateDefinitionFile(file: DefinitionFile): Promise<string> {
    if (!file || !file.content) {
      throw new Error(`Invalid definition file: ${file?.path || 'unknown'}`);
    }

    const content = file.content.trim();
    if (!content) {
      throw new Error(`Empty definition file: ${file.path}`);
    }

    // Validate .d.ts format
    if (!this.isValidTypeDefinition(content)) {
      throw new Error(`File ${file.path} is not a valid TypeScript definition file. It should only contain type declarations.`);
    }

    return content;
  }

  private static isValidTypeDefinition(content: string): boolean {
    // Basic validation for type definition files
    const invalidPatterns = [
      /\bimport\s+[^{]\s+from\b/, // No value imports
      /\bexport\s+(?:default|const|let|var)\b/, // No value exports
      /\bfunction\s+\w+\s*\([^)]*\)\s*{/, // No function implementations
      /\bclass\s+\w+\s*{/, // No class implementations
    ];

    return !invalidPatterns.some(pattern => pattern.test(content));
  }
}