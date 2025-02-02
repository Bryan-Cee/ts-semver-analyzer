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

      // Additional validation for type definition files using type checker
      if (!this.isValidTypeDefinition(sourceFile, program)) {
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

  private static isValidTypeDefinition(sourceFile: ts.SourceFile, program: ts.Program): boolean {
    const typeChecker = program.getTypeChecker();
    let hasTypeDeclarations = false;
    let hasValueDeclarations = false;

    function visit(node: ts.Node) {
      // Skip triple-slash directives and imports
      if (node.kind === ts.SyntaxKind.SingleLineCommentTrivia ||
          ts.isImportDeclaration(node)) {
        return;
      }

      // Check for type declarations
      if (ts.isTypeAliasDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isEnumDeclaration(node) ||
          ts.isModuleDeclaration(node) ||
          (ts.isFunctionDeclaration(node) && !node.body)) { // Consider ambient function declarations as type declarations
        hasTypeDeclarations = true;
      }

      // Check for value declarations
      if (ts.isFunctionDeclaration(node)) {
        // Allow function declarations only if they're ambient (no implementation)
        if (node.body) {
          hasValueDeclarations = true;
        }
      } else if (ts.isClassDeclaration(node)) {
        // Allow class declarations only if they're ambient (no implementation)
        if (node.members.some(member => ts.isMethodDeclaration(member) && member.body)) {
          hasValueDeclarations = true;
        }
      } else if (ts.isVariableStatement(node)) {
        // Check if it's a value declaration or a type declaration
        const declarations = node.declarationList.declarations;
        for (const decl of declarations) {
          const symbol = typeChecker.getSymbolAtLocation(decl.name);
          if (symbol) {
            const type = typeChecker.getTypeAtLocation(decl);
            // If it's not a type declaration and has a value, it's a value declaration
            if (!type.isTypeParameter() && decl.initializer) {
              hasValueDeclarations = true;
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // A valid definition file should have type declarations and no value declarations
    return hasTypeDeclarations && !hasValueDeclarations;
  }
}
