import * as ts from "typescript";
import { DefinitionFile } from "../interfaces/DetectorOptions";
import { CompilerConfig } from './CompilerConfig';

export class FileValidator {
  static async validateDefinitionFile(file: DefinitionFile): Promise<string> {
    if (!file || !file.path) {
      throw new Error(`Invalid definition file: ${file?.path || "unknown"}`);
    }

    const content = file?.content?.trim() || "";
    try {
      const sourceFile = ts.createSourceFile(
        file.name || "temp.d.ts",
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const sourceFiles = new Map([[file.name || "temp.d.ts", sourceFile]]);
      const program = CompilerConfig.createProgram(sourceFiles);

      // Get the semantic diagnostics
      const diagnostics = [
        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile),
      ];

      if (diagnostics.length > 0) {
        const errors = diagnostics
          .map((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            );
            const position = diagnostic.start
              ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
              : undefined;
            const location = position
              ? ` at line ${position.line + 1}, column ${
                  position.character + 1
                }`
              : "";
            return `${message}${location}`;
          })
          .join("\n");

        throw new Error(`TypeScript validation failed:\n${errors}`);
      }

      // Additional validation for type definition files
      if (!this.isValidTypeDefinition(content)) {
        throw new Error(
          `File ${
            file.path || "unknown"
          } is not a valid TypeScript definition file. It should only contain type declarations.`
        );
      }
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Failed to validate TypeScript definition: Unknown error`
      );
    }
  }

  private static isValidTypeDefinition(content: string): boolean {
    // Basic validation for type definition files
    const invalidPatterns = [
      /\bimport\s+[^{]\s+from\b/, // No value imports
      /\bexport\s+(?:default|const|let|var)\b/, // No value exports
      /\bfunction\s+\w+\s*\([^)]*\)\s*{/, // No function implementations
      /\bclass\s+\w+\s*{/, // No class implementations
    ];

    return !invalidPatterns.some((pattern) => pattern.test(content));
  }
}
