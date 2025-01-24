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

    const prevSig = this.typeChecker.getSignaturesOfType(prevType, ts.SignatureKind.Call)[0];
    const currSig = this.typeChecker.getSignaturesOfType(currType, ts.SignatureKind.Call)[0];

    if (!prevSig || !currSig) return changes;

    const prevParams = prevSig.getParameters();
    const currParams = currSig.getParameters();

    if (currParams.length < prevParams.length) {
      changes.push(`BREAKING: Removed parameters from function ${functionName}`);
      return changes;
    }

    for (let i = 0; i < prevParams.length; i++) {
      const prevParam = prevParams[i];
      const currParam = currParams[i];
      const prevParamType = this.typeChecker.getTypeOfSymbol(prevParam);
      const currParamType = this.typeChecker.getTypeOfSymbol(currParam);

      if (this.typeComparator.isTypeMoreRestrictive(prevParamType, currParamType)) {
        const prevSigText = this.getFunctionSignature(prevFunction);
        const currSigText = this.getFunctionSignature(currFunction);
        changes.push(
          `BREAKING: Changed function signature of ${functionName}: ${prevSigText} is not assignable to ${currSigText}`
        );
        return changes;
      }
    }

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