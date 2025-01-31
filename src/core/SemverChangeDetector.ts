import * as ts from "typescript";
import { ChangeDetector } from "../interfaces/ChangeDetector";
import { ChangeReport } from "../interfaces/ChangeReport";
import { TypeComparator } from "../utils/TypeComparator";
import { FunctionComparator } from "../utils/FunctionComparator";
import { ASTCollector } from "../utils/ASTCollector";

import { FileValidator } from '../utils/FileValidator';
import { DetectorOptions, DefinitionFile } from "../interfaces/DetectorOptions";
import { CompilerConfig } from '../utils/CompilerConfig';

export class SemverChangeDetector implements ChangeDetector {
  private previousAST!: ts.SourceFile;
  private currentAST!: ts.SourceFile;
  private typeChecker!: ts.TypeChecker;
  private typeComparator!: TypeComparator;
  private functionComparator!: FunctionComparator;
  private astCollector!: ASTCollector;
  private previousContent?: string;
  private currentContent?: string;
  private initialized: boolean = false;

  constructor(private readonly options: DetectorOptions) {}

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Validate and load both files in parallel
      [this.previousContent, this.currentContent] = await Promise.all([
        FileValidator.validateDefinitionFile(this.options.previous),
        FileValidator.validateDefinitionFile(this.options.current)
      ]);

      if (!this.previousContent || !this.currentContent) {
        throw new Error('Invalid TypeScript definition files: Content is missing');
      }

      // Initialize AST and type checker
      this.previousAST = this.createSourceFile(
        this.options.previous.name || 'previous.d.ts',
        this.previousContent
      );
      this.currentAST = this.createSourceFile(
        this.options.current.name || 'current.d.ts',
        this.currentContent
      );

      // Create program and type checker with lib.d.ts
      this.typeChecker = this.createTypeChecker(this.previousAST, this.currentAST);
      
      // Initialize comparators
      this.typeComparator = new TypeComparator(this.typeChecker);
      this.functionComparator = new FunctionComparator(this.typeChecker, this.typeComparator);
      this.astCollector = new ASTCollector();
      
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      if (error instanceof Error) {
        throw new Error(`Failed to initialize SemverChangeDetector: ${error.message}`);
      }
      throw new Error(
        `Failed to initialize SemverChangeDetector: Unknown error ${JSON.stringify(error)}`
      );
    }
  }

  public async detectChanges(): Promise<ChangeReport> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.previousContent || !this.currentContent) {
      throw new Error('Failed to load TypeScript definitions. Content is missing.');
    }

    const changes: string[] = [];
    this.compareInterfaces(changes);
    this.compareTypes(changes);
    this.compareFunctions(changes);

    return {
      changeType: this.determineChangeType(changes),
      changes,
    };
  }

  private createSourceFile(fileName: string, definition: string): ts.SourceFile {
    return ts.createSourceFile(fileName, definition, ts.ScriptTarget.Latest, true);
  }

  private createTypeChecker(previousAST: ts.SourceFile, currentAST: ts.SourceFile): ts.TypeChecker {
    const sourceFiles = new Map([
      ["previous.d.ts", previousAST],
      ["current.d.ts", currentAST]
    ]);

    const program = CompilerConfig.createProgram(sourceFiles);
    return program.getTypeChecker();
  }

  private determineChangeType(changes: string[]): "major" | "minor" | "patch" {
    if (changes.some((change) => change.startsWith("BREAKING:"))) {
      return "major";
    }
    if (changes.some((change) => change.startsWith("MINOR:"))) {
      return "minor";
    }
    return "patch";
  }

  private compareInterfaces(changes: string[]): void {
    const previousInterfaces = this.astCollector.collectInterfaces(this.previousAST);
    const currentInterfaces = this.astCollector.collectInterfaces(this.currentAST);

    previousInterfaces.forEach((prevInterface, name) => {
      if (!currentInterfaces.has(name)) {
        changes.push(`BREAKING: Removed interface ${name}`);
        return;
      }

      const currInterface = currentInterfaces.get(name);
      if (!currInterface) return;

      // Check for generic type parameter changes
      if (prevInterface.typeParameters || currInterface.typeParameters) {
        this.compareGenericTypeParameters(name, prevInterface, currInterface, changes);
      }

      this.compareInterfaceMembers(name, prevInterface, currInterface, changes);
    });

    currentInterfaces.forEach((currInterface, name) => {
      if (!previousInterfaces.has(name)) {
        changes.push(`MINOR: Added new interface ${name}`);
      }
    });
  }

  private compareGenericTypeParameters(
    interfaceName: string,
    prevInterface: ts.InterfaceDeclaration,
    currInterface: ts.InterfaceDeclaration,
    changes: string[]
  ): void {
    const prevParams = prevInterface.typeParameters || [];
    const currParams = currInterface.typeParameters || [];

    for (let i = 0; i < Math.min(prevParams.length, currParams.length); i++) {
      const prevParam = prevParams[i];
      const currParam = currParams[i];
      const paramName = prevParam.name.text;

      // Check if a constraint was added
      if (!prevParam.constraint && currParam.constraint) {
        changes.push(
          `BREAKING: Added constraint ${currParam.constraint.getText()} to generic parameter ${paramName} in interface ${interfaceName}`
        );
      }
      // Check if constraint was changed
      else if (prevParam.constraint && currParam.constraint &&
               !this.typeComparator.areTypesCompatible(prevParam.constraint, currParam.constraint)) {
        changes.push(
          `BREAKING: Changed constraint on generic parameter ${paramName} in interface ${interfaceName}`
        );
      }
    }

    // Check for removed or added type parameters
    if (prevParams.length > currParams.length) {
      changes.push(`BREAKING: Removed generic type parameters from interface ${interfaceName}`);
    } else if (prevParams.length < currParams.length) {
      changes.push(`BREAKING: Added generic type parameters to interface ${interfaceName}`);
    }
  }

  private compareInterfaceMembers(
    interfaceName: string,
    prevInterface: ts.InterfaceDeclaration,
    currInterface: ts.InterfaceDeclaration,
    changes: string[]
  ): void {
    const prevMembers = this.astCollector.collectInterfaceMembers(prevInterface);
    const currMembers = this.astCollector.collectInterfaceMembers(currInterface);

    this.checkRemovedAndModifiedMembers(interfaceName, prevMembers, currMembers, changes);
    this.checkAddedMembers(interfaceName, prevMembers, currMembers, changes);
  }

  private checkRemovedAndModifiedMembers(
    interfaceName: string,
    prevMembers: Map<string, ts.PropertySignature>,
    currMembers: Map<string, ts.PropertySignature>,
    changes: string[]
  ): void {
    prevMembers.forEach((prevMember, name) => {
      const currMember = currMembers.get(name);
      if (!currMember) {
        changes.push(`BREAKING: Removed member ${name} from interface ${interfaceName}`);
        return;
      }

      const prevIsOptional = prevMember.questionToken !== undefined;
      const currIsOptional = currMember.questionToken !== undefined;
      const prevIsReadonly = prevMember.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) ?? false;
      const currIsReadonly = currMember.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) ?? false;

      if (prevIsOptional && !currIsOptional) {
        changes.push(
          `BREAKING: Changed member ${name} in interface ${interfaceName} from optional to required`
        );
      }

      if (prevIsReadonly !== currIsReadonly) {
        if (prevIsReadonly) {
          changes.push(`BREAKING: Removed readonly modifier from property ${name} in interface ${interfaceName}`);
        } else {
          changes.push(`BREAKING: Added readonly modifier to property ${name} in interface ${interfaceName}`);
        }
      }

      if (prevMember.type && currMember.type) {
        if (ts.isFunctionTypeNode(prevMember.type) && ts.isFunctionTypeNode(currMember.type)) {
          const functionChanges = this.functionComparator.compareFunctionSignatures(name, prevMember, currMember);
          changes.push(...functionChanges);
        } else {
          this.comparePropertyTypes(interfaceName, name, prevMember.type, currMember.type, changes);
        }
      }
    });
  }

  private checkAddedMembers(
    interfaceName: string,
    prevMembers: Map<string, ts.PropertySignature>,
    currMembers: Map<string, ts.PropertySignature>,
    changes: string[]
  ): void {
    currMembers.forEach((currMember, name) => {
      if (!prevMembers.has(name)) {
        const isOptional = currMember.questionToken !== undefined;
        if (currMember.type && ts.isFunctionTypeNode(currMember.type)) {
          changes.push(`MINOR: Added new function ${name}`);
        } else if (isOptional) {
          changes.push(`MINOR: Added optional member ${name} to interface ${interfaceName}`);
        } else {
          changes.push(`BREAKING: Added required member ${name} to interface ${interfaceName}`);
        }
      }
    });
  }

  private comparePropertyTypes(
    interfaceName: string,
    propertyName: string,
    prevType: ts.TypeNode,
    currType: ts.TypeNode,
    changes: string[]
  ): void {
    const prevText = prevType.getText();
    const currText = currType.getText();

    // Get the actual types from the TypeChecker for more accurate comparison
    const prevTypeObj = this.typeChecker.getTypeFromTypeNode(prevType);
    const currTypeObj = this.typeChecker.getTypeFromTypeNode(currType);

    // Check if current type is a union that includes the previous type
    if (currText.includes(prevText) && currText !== prevText) {
      changes.push(
        `MINOR: Added a union type of member ${propertyName} in interface ${interfaceName}: ${prevText} to ${currText}`
      );
      return;
    }

    // Handle array type to primitive type comparison
    if (prevText.includes('[]') && !currText.includes('[]')) {
      changes.push(
        `BREAKING: Changed type of member ${propertyName} in interface ${interfaceName}: ${prevText} is not assignable to ${currText}`
      );
      return;
    }

    if (!this.typeComparator.areTypesCompatible(prevTypeObj, currTypeObj)) {
      changes.push(
        `BREAKING: Changed type of member ${propertyName} in interface ${interfaceName}: ${prevText} is not assignable to ${currText}`
      );
    }
  }

  private compareTypes(changes: string[]): void {
    const previousTypes = this.astCollector.collectTypeAliases(this.previousAST);
    const currentTypes = this.astCollector.collectTypeAliases(this.currentAST);

    previousTypes.forEach((prevType, name) => {
      if (!currentTypes.has(name)) {
        changes.push(`BREAKING: Removed type ${name}`);
        return;
      }

      const currType = currentTypes.get(name);
      if (!currType) return;

      const prevText = prevType.getText();
      const currText = currType.getText();

      if (currText.includes('extends') && currText.includes('?')) {
        // Handle conditional type changes
        const prevBranches = prevText.split('?').length - 1;
        const currBranches = currText.split('?').length - 1;
        
        if (currText.startsWith(prevText.split('?')[0]) && currBranches > prevBranches) {
          // Adding new branches while maintaining the existing ones is a minor change
          changes.push(`MINOR: Added conditional branches to type ${name}`);
        }
      } else if ((currText.includes('|') || currText.includes('\'')) && currText !== prevText) {
        // For union types and string literal types
        const prevParts = prevText.replace(/\s+|export|type|=|;/g, '').split('|').map(p => p.trim());
        const currParts = currText.replace(/\s+|export|type|=|;/g, '').split('|').map(p => p.trim());
        // Check if all previous parts are included in current parts and there are new parts
        if (prevParts.every(p => currParts.includes(p)) && currParts.length > prevParts.length) {
          changes.push(`MINOR: Added union type option to type ${name}`);
        }
      } else if (prevText.includes('readonly') && !currText.includes('readonly')) {
        changes.push(`BREAKING: Changed mapped type definition in type ${name}`);
      } else if (currText.includes('extends') && currText.includes('?')) {
        // Handle conditional type changes
        const prevBranches = prevText.split('?').length - 1;
        const currBranches = currText.split('?').length - 1;
        
        if (currText.startsWith(prevText.split('?')[0]) && currBranches > prevBranches) {
          // Adding new branches while maintaining the existing ones is a minor change
          changes.push(`MINOR: Added conditional branches to type ${name}`);
        } else if (!this.typeComparator.areTypesCompatible(prevType.type, currType.type)) {
          // Breaking if the types are not compatible
          changes.push(
            `BREAKING: Changed type definition of ${name}: ${prevText} is not assignable to ${currText}`
          );
        }
      } else if (!this.typeComparator.areTypesCompatible(prevType.type, currType.type)) {
        changes.push(
          `BREAKING: Changed type definition of ${name}: ${prevText} is not assignable to ${currText}`
        );
      }
    });

    currentTypes.forEach((currType, name) => {
      const prevType = previousTypes.get(name);
      if (!prevType) {
        changes.push(`MINOR: Added new type ${name}`);
      } else {
        const prevIsExported = (ts.isTypeAliasDeclaration(prevType) && prevType.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) ?? false;
        const currIsExported = (ts.isTypeAliasDeclaration(currType) && currType.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) ?? false;
        
        if (!prevIsExported && currIsExported) {
          changes.push(`MINOR: Made type ${name} exported`);
        }
      }
    });
  }

  private compareFunctions(changes: string[]): void {
    const previousFunctions = this.astCollector.collectFunctions(this.previousAST);
    const currentFunctions = this.astCollector.collectFunctions(this.currentAST);

    previousFunctions.forEach((prevFunction, name) => {
      if (!currentFunctions.has(name)) {
        changes.push(`BREAKING: Removed function ${name}`);
      }
    });

    currentFunctions.forEach((currFunction, name) => {
      const prevFunction = previousFunctions.get(name);
      if (!prevFunction) {
        changes.push(`MINOR: Added new function ${name}`);
        return;
      }

      const functionChanges = this.functionComparator.compareFunctionSignatures(name, prevFunction, currFunction);
      changes.push(...functionChanges);
    });
  }
}