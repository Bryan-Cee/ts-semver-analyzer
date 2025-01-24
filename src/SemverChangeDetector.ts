import * as ts from "typescript";

/**
 * Represents a report of changes between two TypeScript definitions.
 */
export interface ChangeReport {
  changeType: "major" | "minor" | "patch";
  changes: string[];
}

/**
 * A class to detect semantic versioning changes between two TypeScript definitions.
 */
export class SemverChangeDetector {
  private previousAST: ts.SourceFile;
  private currentAST: ts.SourceFile;
  private typeChecker: ts.TypeChecker;

  /**
   * Initializes the detector with the previous and current TypeScript definitions.
   * @param previousDefinition - The previous TypeScript definition as a string.
   * @param currentDefinition - The current TypeScript definition as a string.
   */
  constructor(previousDefinition: string, currentDefinition: string) {
    this.previousAST = this.createSourceFile(
      "previous.d.ts",
      previousDefinition
    );
    this.currentAST = this.createSourceFile("current.d.ts", currentDefinition);
    this.typeChecker = this.createTypeChecker(
      this.previousAST,
      this.currentAST
    );
  }

  /**
   * Creates a TypeScript SourceFile from a definition string.
   * @param fileName - The name of the file.
   * @param definition - The TypeScript definition as a string.
   * @returns The parsed SourceFile.
   */
  private createSourceFile(
    fileName: string,
    definition: string
  ): ts.SourceFile {
    return ts.createSourceFile(
      fileName,
      definition,
      ts.ScriptTarget.Latest,
      true
    );
  }

  /**
   * Creates a TypeScript TypeChecker for the given SourceFiles.
   * @param previousAST - The previous SourceFile.
   * @param currentAST - The current SourceFile.
   * @returns The TypeChecker instance.
   */
  private createTypeChecker(
    previousAST: ts.SourceFile,
    currentAST: ts.SourceFile
  ): ts.TypeChecker {
    const compilerOptions: ts.CompilerOptions = {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
    };

    const program = ts.createProgram({
      rootNames: ["previous.d.ts", "current.d.ts"],
      options: compilerOptions,
      host: {
        getSourceFile: (fileName) =>
          fileName === "previous.d.ts"
            ? previousAST
            : fileName === "current.d.ts"
            ? currentAST
            : undefined,
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

  /**
   * Detects changes between the previous and current definitions.
   * @returns A `ChangeReport` object containing the change type and a list of changes.
   */
  public detectChanges(): { changeType: string; changes: string[] } {
    const changes: string[] = [];
    // Check interfaces first
    this.compareInterfaces(changes);
    // Check types
    this.compareTypes(changes);
    // Check functions last to ensure all type information is available
    this.compareFunctions(changes);
    // Determine final change type
    const changeType = this.determineChangeType(changes);

    return { changeType, changes };
  }

  /**
   * Determines the overall change type based on the detected changes.
   * @param changes - An array of detected changes.
   * @returns The overall change type ("major", "minor", or "patch").
   */
  private determineChangeType(changes: string[]): "major" | "minor" | "patch" {
    if (changes.some((change) => change.startsWith("BREAKING:"))) {
      return "major";
    }
    if (changes.some((change) => change.startsWith("MINOR:"))) {
      return "minor";
    }
    return "patch";
  }

  /**
   * Compares interfaces between the previous and current definitions.
   * @param changes - An array to store detected changes.
   */
  private compareInterfaces(changes: string[]) {
    const previousInterfaces = this.collectInterfaces(this.previousAST);
    const currentInterfaces = this.collectInterfaces(this.currentAST);

    // Check for removed interfaces
    previousInterfaces.forEach((prevInterface, name) => {
      if (!currentInterfaces.has(name)) {
        changes.push(`BREAKING: Removed interface ${name}`);
      }
    });

    // Check for added or modified interfaces
    currentInterfaces.forEach((currInterface, name) => {
      const prevInterface = previousInterfaces.get(name);

      if (!prevInterface) {
        changes.push(`MINOR: Added new interface ${name}`);
        return;
      }

      this.compareInterfaceMembers(name, prevInterface, currInterface, changes);
    });
  }

  /**
   * Compares members of two interfaces.
   * @param interfaceName - The name of the interface being compared.
   * @param prevInterface - The previous interface declaration.
   * @param currInterface - The current interface declaration.
   * @param changes - An array to store detected changes.
   */
  private compareInterfaceMembers(
    interfaceName: string,
    prevInterface: ts.InterfaceDeclaration,
    currInterface: ts.InterfaceDeclaration,
    changes: string[]
  ) {
    const prevMembers = this.collectInterfaceMembers(prevInterface);
    const currMembers = this.collectInterfaceMembers(currInterface);

    // Check for removed or modified members
    // Add debug log for member comparison
    prevMembers.forEach((prevMember, name) => {
      const currMember = currMembers.get(name);
      if (!currMember) {
        changes.push(
          `BREAKING: Removed member ${name} from interface ${interfaceName}`
        );
        return;
      }

      // Check for changes in optionality
      const prevIsOptional = prevMember.questionToken !== undefined;
      const currIsOptional = currMember.questionToken !== undefined;

      if (prevIsOptional && !currIsOptional) {
        changes.push(
          `BREAKING: Changed member ${name} in interface ${interfaceName} from optional to required`
        );
      }

      // Check for type changes
      if (prevMember.type && currMember.type) {
        if (
          ts.isFunctionTypeNode(prevMember.type) &&
          ts.isFunctionTypeNode(currMember.type)
        ) {
          // Handle function property signature changes
          this.compareFunctionSignatures(name, prevMember, currMember, changes);
        } else if (
          ts.isTypeLiteralNode(prevMember.type) &&
          ts.isTypeLiteralNode(currMember.type)
        ) {
          // Handle nested interface changes
          this.compareInterfaceMembers(
            `${interfaceName}.${name}`,
            {
              ...prevInterface,
              members: prevMember.type.members,
            } as ts.InterfaceDeclaration,
            {
              ...currInterface,
              members: currMember.type.members,
            } as ts.InterfaceDeclaration,
            changes
          );
        } else {
          const prevText = this.normalizeTypeText(prevMember.type.getText());
          const currText = this.normalizeTypeText(currMember.type.getText());

          if (currText.includes(prevText) && currText !== prevText) {
            changes.push(
              `MINOR: Added a union type of member ${name} in interface ${interfaceName}: ${prevText} to ${currText}`
            );
          } else if (
            !this.areTypesCompatible(prevMember.type, currMember.type)
          ) {
            changes.push(
              `BREAKING: Changed type of member ${name} in interface ${interfaceName}: ${prevText} is not assignable to ${currText}`
            );
          }
        }
      }
    });

    // Check for added members
    currMembers.forEach((currMember, name) => {
      if (!prevMembers.has(name)) {
        const isOptional = currMember.questionToken !== undefined;

        // Handle function properties
        if (currMember.type && ts.isFunctionTypeNode(currMember.type)) {
          changes.push(`MINOR: Added new function ${name}`);
          return;
        }

        // Handle non-function properties
        if (isOptional) {
          changes.push(
            `MINOR: Added optional member ${name} to interface ${interfaceName}`
          );
        } else {
          changes.push(
            `BREAKING: Added required member ${name} to interface ${interfaceName}`
          );
        }
      }
    });
  }

  /**
   * Compares type aliases between the previous and current definitions.
   * @param changes - An array to store detected changes.
   */
  private compareTypes(changes: string[]) {
    const previousTypes = this.collectTypeAliases(this.previousAST);
    const currentTypes = this.collectTypeAliases(this.currentAST);

    // Check for removed types (unchanged)
    previousTypes.forEach((prevType, name) => {
      if (!currentTypes.has(name)) {
        changes.push(`BREAKING: Removed type ${name}`);
      }
    });

    // Modified section for type comparison
    currentTypes.forEach((currType, name) => {
      const prevType = previousTypes.get(name);
      if (!prevType) {
        changes.push(`MINOR: Added new type ${name}`);
        return;
      }

      // Handle type literal nodes specifically
      if (ts.isTypeLiteralNode(prevType) && ts.isTypeLiteralNode(currType)) {
        const prevMembers = new Map(
          prevType.members.map((m) => [m.name?.getText() ?? "", m])
        );
        const currMembers = new Map(
          currType.members.map((m) => [m.name?.getText() ?? "", m])
        );

        prevMembers.forEach((prevMember, memberName) => {
          const currMember = currMembers.get(memberName);
          if (
            currMember &&
            ts.isPropertySignature(prevMember) &&
            ts.isPropertySignature(currMember) &&
            prevMember.type &&
            currMember.type
          ) {
            if (!this.areTypesCompatible(prevMember.type, currMember.type)) {
              changes.push(
                `BREAKING: Changed type definition of ${name}: ${this.normalizeTypeText(
                  prevType.getText()
                )} is not assignable to ${this.normalizeTypeText(
                  currType.getText()
                )}`
              );
            }
          }
        });
      } else {
        // For non-literal types, use type checker
        const prevTypeObj = this.typeChecker.getTypeFromTypeNode(prevType);
        const currTypeObj = this.typeChecker.getTypeFromTypeNode(currType);

        if (!this.typeChecker.isTypeAssignableTo(currTypeObj, prevTypeObj)) {
          changes.push(
            `BREAKING: Changed type definition of ${name}: ${this.normalizeTypeText(
              prevType.getText()
            )} is not assignable to ${this.normalizeTypeText(
              currType.getText()
            )}`
          );
        }
      }
    });
  }

  /**
   * Compares functions between the previous and current definitions.
   * @param changes - An array to store detected changes.
   */
  private compareFunctions(changes: string[]) {
    const previousFunctions = this.collectFunctions(this.previousAST);
    const currentFunctions = this.collectFunctions(this.currentAST);

    // Check for removed functions
    previousFunctions.forEach((prevFunction, name) => {
      if (!currentFunctions.has(name)) {
        changes.push(`BREAKING: Removed function ${name}`);
      }
    });

    // Check for added or modified functions
    currentFunctions.forEach((currFunction, name) => {
      const prevFunction = previousFunctions.get(name);

      if (!prevFunction) {
        changes.push(`MINOR: Added new function ${name}`);
        return;
      }

      this.compareFunctionSignatures(name, prevFunction, currFunction, changes);
    });
  }

  /**
   * Collects all functions in a source file, including function properties in interfaces.
   * @param sourceFile - The source file to analyze.
   * @returns A map of function names to their declarations or property signatures.
   */
  private collectFunctions(
    sourceFile: ts.SourceFile
  ): Map<
    string,
    ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertySignature
  > {
    const functions = new Map<
      string,
      ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertySignature
    >();

    function visit(node: ts.Node) {
      // Collect standalone function declarations
      if (
        (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
        node.name
      ) {
        const name = node.name.getText();
        functions.set(name, node);
      }

      // Skip function properties in interfaces as they're handled by compareInterfaceMembers
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return functions;
  }

  /**
   * Compares the signatures of two functions or function properties.
   * @param functionName - The name of the function being compared.
   * @param prevFunction - The previous function declaration or property signature.
   * @param currFunction - The current function declaration or property signature.
   * @param changes - An array to store detected changes.
   */
  // private compareFunctionSignatures(
  //   functionName: string,
  //   prevFunction: ts.Node,
  //   currFunction: ts.Node,
  //   changes: string[]
  // ): void {
  //   const prevType = this.typeChecker.getTypeAtLocation(prevFunction);
  //   const currType = this.typeChecker.getTypeAtLocation(currFunction);

  //   const prevSig = this.typeChecker.getSignaturesOfType(
  //     prevType,
  //     ts.SignatureKind.Call
  //   )[0];
  //   const currSig = this.typeChecker.getSignaturesOfType(
  //     currType,
  //     ts.SignatureKind.Call
  //   )[0];

  //   if (!prevSig || !currSig) return;

  //   const prevParams = prevSig.getParameters();
  //   const currParams = currSig.getParameters();

  //   // Parameter count check remains the same
  //   if (currParams.length < prevParams.length) {
  //     changes.push(
  //       `BREAKING: Removed parameters from function ${functionName}`
  //     );
  //     return;
  //   }

  //   // Check existing parameters with improved type comparison
  //   for (let i = 0; i < prevParams.length; i++) {
  //     const prevParam = prevParams[i];
  //     const currParam = currParams[i];

  //     const prevParamType = this.typeChecker.getTypeOfSymbol(prevParam);
  //     const currParamType = this.typeChecker.getTypeOfSymbol(currParam);

  //     // Check both directions for parameter type compatibility
  //     const currToPrev = this.typeChecker.isTypeAssignableTo(
  //       currParamType,
  //       prevParamType
  //     );
  //     const prevToCurr = this.typeChecker.isTypeAssignableTo(
  //       prevParamType,
  //       currParamType
  //     );

  //     // Breaking change if current type is more restrictive
  //     if (!currToPrev || (prevToCurr && !currToPrev)) {
  //       const prevSigText = this.getFunctionSignature(
  //         prevFunction as
  //           | ts.FunctionDeclaration
  //           | ts.MethodDeclaration
  //           | ts.PropertySignature
  //       );
  //       const currSigText = this.getFunctionSignature(
  //         currFunction as
  //           | ts.FunctionDeclaration
  //           | ts.MethodDeclaration
  //           | ts.PropertySignature
  //       );
  //       changes.push(
  //         `BREAKING: Changed function signature of ${functionName}: ${prevSigText} is not assignable to ${currSigText}`
  //       );
  //       return;
  //     }
  //   }

  //   // Check added parameters
  //   if (currParams.length > prevParams.length) {
  //     const addedParams = currParams.slice(prevParams.length);
  //     const allOptional = addedParams.every((param) => {
  //       const declaration = param.valueDeclaration as ts.ParameterDeclaration;
  //       return !!declaration.questionToken;
  //     });

  //     if (allOptional) {
  //       addedParams.forEach((param) => {
  //         changes.push(
  //           `MINOR: Added optional parameter ${param.name} to function ${functionName}`
  //         );
  //       });
  //     } else {
  //       changes.push(
  //         `BREAKING: Added required parameters to function ${functionName}`
  //       );
  //     }
  //   }
  // }

  private compareFunctionSignatures(
    functionName: string,
    prevFunction: ts.Node,
    currFunction: ts.Node,
    changes: string[]
  ): void {
    const prevType = this.typeChecker.getTypeAtLocation(prevFunction);
    const currType = this.typeChecker.getTypeAtLocation(currFunction);

    const prevSig = this.typeChecker.getSignaturesOfType(
      prevType,
      ts.SignatureKind.Call
    )[0];
    const currSig = this.typeChecker.getSignaturesOfType(
      currType,
      ts.SignatureKind.Call
    )[0];

    if (!prevSig || !currSig) return;

    const prevParams = prevSig.getParameters();
    const currParams = currSig.getParameters();

    // Check parameter count
    if (currParams.length < prevParams.length) {
      changes.push(
        `BREAKING: Removed parameters from function ${functionName}`
      );
      return;
    }

    // Check existing parameters for type compatibility
    for (let i = 0; i < prevParams.length; i++) {
      const prevParam = prevParams[i];
      const currParam = currParams[i];

      const prevParamType = this.typeChecker.getTypeOfSymbol(prevParam);
      const currParamType = this.typeChecker.getTypeOfSymbol(currParam);

      // Check if the new type is more restrictive
      if (!this.typeChecker.isTypeAssignableTo(prevParamType, currParamType)) {
        const prevSigText = this.getFunctionSignature(
          prevFunction as
            | ts.FunctionDeclaration
            | ts.MethodDeclaration
            | ts.PropertySignature
        );
        const currSigText = this.getFunctionSignature(
          currFunction as
            | ts.FunctionDeclaration
            | ts.MethodDeclaration
            | ts.PropertySignature
        );
        changes.push(
          `BREAKING: Changed function signature of ${functionName}: ${prevSigText} is not assignable to ${currSigText}`
        );
        return;
      }
    }

    // Check added parameters
    if (currParams.length > prevParams.length) {
      const addedParams = currParams.slice(prevParams.length);
      const allOptional = addedParams.every((param) => {
        const declaration = param.valueDeclaration as ts.ParameterDeclaration;
        return !!declaration.questionToken;
      });

      if (allOptional) {
        addedParams.forEach((param) => {
          changes.push(
            `MINOR: Added optional parameter ${param.name} to function ${functionName}`
          );
        });
      } else {
        changes.push(
          `BREAKING: Added required parameters to function ${functionName}`
        );
      }
    }
  }

  /**
   * Extracts the signature of a function or function property.
   * @param functionNode - The function declaration or property signature to analyze.
   * @returns A string representing the function signature.
   */
  private getFunctionSignature(
    functionNode:
      | ts.FunctionDeclaration
      | ts.MethodDeclaration
      | ts.PropertySignature
  ): string {
    let parameters: string;
    let returnType: string;

    if (
      ts.isPropertySignature(functionNode) &&
      functionNode.type && // Ensure functionNode.type is defined
      ts.isFunctionTypeNode(functionNode.type) // Now safe to call ts.isFunctionTypeNode
    ) {
      // Handle function properties (e.g., `callback: (error: Error) => void`)
      parameters = functionNode.type.parameters
        .map((param) => {
          const paramName = param.name.getText();
          const paramType = param.type ? param.type.getText() : "any";
          const isOptional = param.questionToken !== undefined;
          return `${paramName}${isOptional ? "?" : ""}: ${paramType}`;
        })
        .join(", ");
      returnType = functionNode.type.type?.getText() || "void";
    } else if (
      ts.isFunctionDeclaration(functionNode) ||
      ts.isMethodDeclaration(functionNode)
    ) {
      // Handle standalone function declarations
      parameters = functionNode.parameters
        .map((param) => {
          const paramName = param.name.getText();
          const paramType = param.type ? param.type.getText() : "any";
          const isOptional = param.questionToken !== undefined;
          return `${paramName}${isOptional ? "?" : ""}: ${paramType}`;
        })
        .join(", ");
      returnType = functionNode.type ? functionNode.type.getText() : "void";
    } else {
      throw new Error("Unsupported function node type");
    }

    return `(${parameters}) => ${returnType}`;
  }

  /**
   * Checks if the old function signature is backward compatible with the new one.
   * @param oldSignature - The old function signature.
   * @param newSignature - The new function signature.
   * @returns `true` if the old signature is backward compatible, otherwise `false`.
   */
  private areFunctionSignaturesCompatible(
    oldSignature: string,
    newSignature: string
  ): boolean {
    // Parse the signatures into their components
    const oldMatch = oldSignature.match(/\((.*?)\)\s*=>\s*(.*)/);
    const newMatch = newSignature.match(/\((.*?)\)\s*=>\s*(.*)/);

    if (!oldMatch || !newMatch) {
      return false;
    }

    const [, oldParams, oldReturn] = oldMatch;
    const [, newParams, newReturn] = newMatch;

    // Return types must be identical
    if (oldReturn !== newReturn) {
      return false;
    }

    // Split parameters into arrays
    const oldParamList = oldParams
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    const newParamList = newParams
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    // If new signature has fewer parameters, it's not compatible
    if (newParamList.length < oldParamList.length) {
      return false;
    }

    // Check that all old parameters match exactly with new parameters
    for (let i = 0; i < oldParamList.length; i++) {
      if (oldParamList[i] !== newParamList[i]) {
        return false;
      }
    }

    // Check that any additional parameters in new signature are optional
    for (let i = oldParamList.length; i < newParamList.length; i++) {
      if (!newParamList[i].includes("?")) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if the old type is backward compatible with the new type.
   * @param oldType - The old type to compare.
   * @param newType - The new type to compare.
   * @returns `true` if the old type is backward compatible, otherwise `false`.
   */
  private areTypesCompatible(
    oldType: ts.Type | ts.TypeNode,
    newType: ts.Type | ts.TypeNode
  ): boolean {
    // If we have TypeNodes, get their text representation first
    if ("kind" in oldType && "kind" in newType) {
      const oldTypeText = (oldType as ts.TypeNode).getText();
      const newTypeText = (newType as ts.TypeNode).getText();

      // For array types, handle them directly
      if (oldTypeText.endsWith("[]") && newTypeText.endsWith("[]")) {
        const oldElementType = oldTypeText.slice(0, -2);
        const newElementType = newTypeText.slice(0, -2);

        // Direct comparison for primitive array types
        if (
          ["string", "number", "boolean"].includes(oldElementType) ||
          ["string", "number", "boolean"].includes(newElementType)
        ) {
          return oldElementType === newElementType;
        }
      }
    }

    // For other cases, use type checker
    const oldTypeObj =
      "kind" in oldType
        ? this.typeChecker.getTypeAtLocation(oldType as ts.TypeNode)
        : (oldType as ts.Type);

    const newTypeObj =
      "kind" in newType
        ? this.typeChecker.getTypeAtLocation(newType as ts.TypeNode)
        : (newType as ts.Type);

    return this.compareNodeTypes(oldTypeObj, newTypeObj);
  }


  private compareNodeTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    // If new type contains the old type as part of a union, it's compatible
    if (newTypeStr.includes(oldTypeStr)) {
      return true;
    }

    // Handle array types
    if (oldTypeStr.endsWith("[]")) {
      if (!newTypeStr.includes("[]")) return false;

      // Get element types
      const oldElementType = this.typeChecker.getTypeArguments(
        oldType as ts.TypeReference
      )[0];
      const newElementType = this.typeChecker.getTypeArguments(
        newType as ts.TypeReference
      )[0];

      if (!oldElementType || !newElementType) {
        // Fallback to string comparison for primitive types
        const oldElement = oldTypeStr.slice(0, -2);
        const newElement = newTypeStr.slice(0, -2);
        return oldElement === newElement;
      }

      return this.typeChecker.isTypeAssignableTo(
        newElementType,
        oldElementType
      );
    }

    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private isUnionType(type: ts.Type): boolean {
    return !!(type.flags & ts.TypeFlags.Union);
  }

  private isArrayType(type: ts.Type): boolean {
    const symbol = type.getSymbol();
    const isArray = Boolean(
      (type.flags & ts.TypeFlags.Object) !== 0 &&
        ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) !==
          0 &&
        (symbol?.getName() === "Array" ||
          this.typeChecker.typeToString(type).endsWith("[]"))
    );

    return isArray;
  }

  /**
   * Extracts type arguments from a type node (e.g., `Array<string | number>` -> `[string | number]`).
   * @param typeNode - The type node to extract arguments from.
   * @returns An array of type nodes representing the type arguments, or `null` if not applicable.
   */
  private extractTypeArguments(typeNode: ts.TypeNode): ts.TypeNode[] | null {
    if (ts.isArrayTypeNode(typeNode)) {
      return [typeNode.elementType];
    }
    if (ts.isTypeReferenceNode(typeNode) && typeNode.typeArguments) {
      return Array.from(typeNode.typeArguments);
    }
    return null;
  }

  /**
   * Collects all interfaces in a source file.
   * @param sourceFile - The source file to analyze.
   * @returns A map of interface names to their declarations.
   */
  private collectInterfaces(
    sourceFile: ts.SourceFile
  ): Map<string, ts.InterfaceDeclaration> {
    const interfaces = new Map<string, ts.InterfaceDeclaration>();

    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node) && node.name) {
        interfaces.set(node.name.text, node);
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return interfaces;
  }

  /**
   * Collects all members of an interface.
   * @param interfaceDecl - The interface declaration to analyze.
   * @returns A map of member names to their property signatures.
   */
  private collectInterfaceMembers(
    interfaceDecl: ts.InterfaceDeclaration
  ): Map<string, ts.PropertySignature> {
    const members = new Map<string, ts.PropertySignature>();

    interfaceDecl.members.forEach((member) => {
      if (ts.isPropertySignature(member) && member.name) {
        const name = member.name.getText();
        members.set(name, member);
      }
    });

    return members;
  }

  /**
   * Collects all type aliases in a source file.
   * @param sourceFile - The source file to analyze.
   * @returns A map of type names to their type nodes.
   */
  private collectTypeAliases(
    sourceFile: ts.SourceFile
  ): Map<string, ts.TypeNode> {
    const types = new Map<string, ts.TypeNode>();

    function visit(node: ts.Node) {
      if (ts.isTypeAliasDeclaration(node) && node.name && node.type) {
        types.set(node.name.text, node.type);
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return types;
  }

  /**
   * Normalizes the text representation of a type by removing unnecessary whitespace and newlines.
   * @param text - The text to normalize.
   * @returns The normalized text.
   */
  private normalizeTypeText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }
}
