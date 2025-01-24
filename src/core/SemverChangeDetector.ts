import * as ts from "typescript";
import { ChangeDetector } from "../interfaces/ChangeDetector";
import { ChangeReport } from "../interfaces/ChangeReport";
import { TypeComparator } from "../utils/TypeComparator";
import { FunctionComparator } from "../utils/FunctionComparator";
import { ASTCollector } from "../utils/ASTCollector";

import { FileValidator } from '../utils/FileValidator';
import { DetectorOptions, DefinitionFile } from "../interfaces/DetectorOptions";

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
    const compilerOptions: ts.CompilerOptions = {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      lib: ['lib.es2015.d.ts', 'lib.dom.d.ts'],
      types: [],
      declaration: true
    };

    const program = ts.createProgram({
      rootNames: ["previous.d.ts", "current.d.ts"],
      options: compilerOptions,
      host: {
        getSourceFile: (fileName) => {
          if (fileName === "previous.d.ts") return previousAST;
          if (fileName === "current.d.ts") return currentAST;
          return undefined;
        },
        getDefaultLibFileName: () => "lib.d.ts",
        writeFile: () => {},
        getCurrentDirectory: () => "",
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => "\n",
        fileExists: (fileName) =>
          fileName === "previous.d.ts" || fileName === "current.d.ts",
        readFile: () => undefined,
        directoryExists: () => true,
        getDirectories: () => [],
      },
    });

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
      }
    });

    currentInterfaces.forEach((currInterface, name) => {
      const prevInterface = previousInterfaces.get(name);
      if (!prevInterface) {
        changes.push(`MINOR: Added new interface ${name}`);
        return;
      }
      this.compareInterfaceMembers(name, prevInterface, currInterface, changes);
    });
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

      if (prevIsOptional && !currIsOptional) {
        changes.push(
          `BREAKING: Changed member ${name} in interface ${interfaceName} from optional to required`
        );
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

    if (currText.includes(prevText) && currText !== prevText) {
      changes.push(
        `MINOR: Added a union type of member ${propertyName} in interface ${interfaceName}: ${prevText} to ${currText}`
      );
    } else if (!this.typeComparator.areTypesCompatible(prevType, currType)) {
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
      }
    });

    currentTypes.forEach((currType, name) => {
      const prevType = previousTypes.get(name);
      if (!prevType) {
        changes.push(`MINOR: Added new type ${name}`);
        return;
      }

      if (!this.typeComparator.areTypesCompatible(prevType, currType)) {
        changes.push(
          `BREAKING: Changed type definition of ${name}: ${prevType.getText()} is not assignable to ${currType.getText()}`
        );
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