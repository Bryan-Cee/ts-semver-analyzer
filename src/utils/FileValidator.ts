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
        const errors = this.categorizeAndFormatErrors(diagnostics, sourceFile);
        throw new Error(`TypeScript validation failed:\n${errors}`);
      }

      // Additional validation for type definition files
      if (!this.isValidTypeDefinition(content)) {
        throw new Error(
          `File ${file.path || "unknown"} is not a valid TypeScript definition file. It should only contain type declarations.`
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

  private static categorizeAndFormatErrors(diagnostics: readonly ts.Diagnostic[], sourceFile: ts.SourceFile): string {
    const missingModules = new Set<string>();
    const missingTypes = new Set<string>();
    const otherErrors: string[] = [];

    diagnostics.forEach((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      const position = diagnostic.start
        ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
        : undefined;
      const location = position
        ? ` at line ${position.line + 1}, column ${position.character + 1}`
        : "";

      if (message.includes("Cannot find module")) {
        const moduleName = message.match(/Cannot find module '([^']+)'/)?.[1];
        if (moduleName) {
          missingModules.add(`Missing module '${moduleName}'. Please install @types/${moduleName} or the appropriate type definitions${location}`);
        }
      } else if (message.includes("Cannot find name")) {
        const typeName = message.match(/Cannot find name '([^']+)'/)?.[1];
        if (typeName) {
          missingTypes.add(`Missing type definition for '${typeName}'${location}. Make sure you have the correct type definitions installed`);
        }
      } else if (message.includes("File") && message.includes("not found")) {
        otherErrors.push(`Missing file: ${message}${location}. Please ensure all referenced files exist`);
      } else {
        otherErrors.push(`${message}${location}`);
      }
    });

    const errorMessages: string[] = [];
    if (missingModules.size > 0) {
      errorMessages.push("\nMissing Module Dependencies:");
      errorMessages.push([...missingModules].join("\n"));
    }
    if (missingTypes.size > 0) {
      errorMessages.push("\nMissing Type Definitions:");
      errorMessages.push([...missingTypes].join("\n"));
    }
    if (otherErrors.length > 0) {
      errorMessages.push("\nOther Validation Errors:");
      errorMessages.push(otherErrors.join("\n"));
    }

    return errorMessages.join("\n");
  }

  private static isValidTypeDefinition(content: string): boolean {
    // Basic validation for type definition files
    const invalidPatterns = [
      /\bexport\s+(?:default|const|let|var)\b/, // No value exports
      /\bfunction\s+\w+\s*\([^)]*\)\s*{/, // No function implementations (with body)
      /\bclass\s+\w+\s*{/, // No class implementations
    ];

    // Allow triple-slash directives and type imports
    const validPatterns = [
      /^\/{3}\s*<reference\s+path=/, // Triple-slash reference directives
      /^import\s+\*\s+as\s+\w+\s+from\s+'[^']+'/, // Type-only namespace imports
      /^import\s+type\s+{[^}]+}\s+from\s+'[^']+'/, // Type-only named imports
      /^import\s+{[^}]+}\s+from\s+'[^']+'/, // Regular named imports (could be types)
      /\bfunction\s+\w+\s*<[^>]*>?\s*\([^)]*\)\s*:\s*[^{;]+;/, // Function type declarations
      /\bexport\s+(?:type|interface|function)\s+\w+\s*<[^>]*>?\s*\([^)]*\)\s*:\s*[^{;]+;/, // Exported function type declarations
    ];

    const lines = content.split('\n');
    let hasValidContent = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//')) continue;

      // Check if line matches any valid pattern
      const isValidLine = validPatterns.some(pattern => pattern.test(trimmedLine));
      if (isValidLine) {
        hasValidContent = true;
        continue;
      }

      // Check if line contains any invalid patterns
      if (invalidPatterns.some(pattern => pattern.test(trimmedLine))) {
        return false;
      }

      // Consider type declarations as valid content
      if (trimmedLine.includes('type ') || trimmedLine.includes('interface ')) {
        hasValidContent = true;
      }
    }

    return hasValidContent;
  }
}
