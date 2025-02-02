import * as ts from "typescript";
import { TypeComparator } from "./TypeComparator";

export class FunctionComparator {
  constructor(
    private typeChecker: ts.TypeChecker,
    private typeComparator: TypeComparator
  ) {}

  public compareFunctionSignatures(
    functionName: string,
    prevFunction: ts.Node,
    currFunction: ts.Node
  ): string[] {
    const changes: string[] = [];
    const prevType = this.typeChecker.getTypeAtLocation(prevFunction);
    const currType = this.typeChecker.getTypeAtLocation(currFunction);

    // Check for generic type parameter changes
    if (ts.isFunctionDeclaration(prevFunction) && ts.isFunctionDeclaration(currFunction)) {
      this.compareGenericTypeParameters(functionName, prevFunction, currFunction, changes);
    }

    const prevSig = this.typeChecker.getSignaturesOfType(prevType, ts.SignatureKind.Call)[0];
    const currSig = this.typeChecker.getSignaturesOfType(currType, ts.SignatureKind.Call)[0];

    if (!prevSig || !currSig) return changes;

    const prevParams = prevSig.getParameters();
    const currParams = currSig.getParameters();
  
    // First, check if the signatures are identical
    const prevSigText = this.getFunctionSignature(prevFunction);
    const currSigText = this.getFunctionSignature(currFunction);
    
    if (prevSigText === currSigText) {
      return changes; // If signatures are identical, no changes needed
    }
  
    if (currParams.length < prevParams.length) {
      changes.push(`BREAKING: Removed parameters from function ${functionName}`);
      return changes;
    }
  
    // Compare parameter types
    for (let i = 0; i < prevParams.length; i++) {
      const prevParam = prevParams[i];
      const currParam = currParams[i];
      const prevParamType = this.typeChecker.getTypeOfSymbol(prevParam);
      const currParamType = this.typeChecker.getTypeOfSymbol(currParam);
  
      // Skip if the types are identical
      if (this.typeChecker.typeToString(prevParamType) === this.typeChecker.typeToString(currParamType)) {
        continue;
      }
  
      if (this.typeComparator.isTypeMoreRestrictive(prevParamType, currParamType)) {
        changes.push(
          `BREAKING: Changed function signature of ${functionName}: ${prevSigText} is not assignable to ${currSigText}`
        );
        return changes;
      }
    }
  
    // Check return type compatibility
    const prevReturnType = this.typeChecker.getReturnTypeOfSignature(prevSig);
    const currReturnType = this.typeChecker.getReturnTypeOfSignature(currSig);
    
    if (this.typeChecker.typeToString(prevReturnType) !== this.typeChecker.typeToString(currReturnType) &&
        !this.typeChecker.isTypeAssignableTo(currReturnType, prevReturnType)) {
      changes.push(
        `BREAKING: Changed return type of function ${functionName}`
      );
      return changes;
    }
  
    // Handle added parameters
    if (currParams.length > prevParams.length) {
      const addedParams = currParams.slice(prevParams.length);
      const allOptional = addedParams.every(param => {
        const declaration = param.valueDeclaration as ts.ParameterDeclaration;
        return !!declaration.questionToken;
      });
  
      if (allOptional) {
        addedParams.forEach(param => {
          changes.push(`MINOR: Added optional parameter ${param.name} to function ${functionName}`);
        });
      } else {
        changes.push(`BREAKING: Added required parameters to function ${functionName}`);
      }
    }
  
    return changes;
  }

  private compareGenericTypeParameters(
    functionName: string,
    prevFunction: ts.FunctionDeclaration,
    currFunction: ts.FunctionDeclaration,
    changes: string[]
  ): void {
    const prevParams = prevFunction.typeParameters || [];
    const currParams = currFunction.typeParameters || [];

    for (let i = 0; i < Math.min(prevParams.length, currParams.length); i++) {
      const prevParam = prevParams[i];
      const currParam = currParams[i];
      const paramName = prevParam.name.text;

      // Check if a constraint was added
      if (!prevParam.constraint && currParam.constraint) {
        changes.push(
          `BREAKING: Added type constraint to generic parameter ${paramName} in function ${functionName}`
        );
      }
      // Check if constraint was changed
      else if (prevParam.constraint && currParam.constraint) {
        const prevType = this.typeChecker.getTypeFromTypeNode(prevParam.constraint);
        const currType = this.typeChecker.getTypeFromTypeNode(currParam.constraint);
        if (!this.typeComparator.areTypesCompatible(prevType, currType)) {
          changes.push(
            `BREAKING: Changed type constraint on generic parameter ${paramName} in function ${functionName}`
          );
        }
      }
    }

    // Check for removed or added type parameters
    if (prevParams.length > currParams.length) {
      changes.push(`BREAKING: Removed generic type parameters from function ${functionName}`);
    } else if (prevParams.length < currParams.length) {
      changes.push(`BREAKING: Added generic type parameters to function ${functionName}`);
    }
  }

  private getFunctionSignature(node: ts.Node): string {
    if (ts.isPropertySignature(node) && node.type && ts.isFunctionTypeNode(node.type)) {
      return this.getFunctionTypeSignature(node.type);
    }
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      return this.getFunctionDeclarationSignature(node);
    }
    throw new Error("Unsupported function node type");
  }

  private getFunctionTypeSignature(node: ts.FunctionTypeNode): string {
    const parameters = this.getParameterSignatures(node.parameters);
    const returnType = node.type?.getText() || "void";
    return `(${parameters}) => ${returnType}`;
  }

  private getFunctionDeclarationSignature(
    node: ts.FunctionDeclaration | ts.MethodDeclaration
  ): string {
    const parameters = this.getParameterSignatures(node.parameters);
    const returnType = node.type?.getText() || "void";
    return `(${parameters}) => ${returnType}`;
  }

  private getParameterSignatures(parameters: readonly ts.ParameterDeclaration[]): string {
    return parameters
      .map(param => {
        const paramName = param.name.getText();
        const paramType = param.type?.getText() || "any";
        const isOptional = param.questionToken !== undefined;
        return `${paramName}${isOptional ? "?" : ""}: ${paramType}`;
      })
      .join(", ");
  }
}