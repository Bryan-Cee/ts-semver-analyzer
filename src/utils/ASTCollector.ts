import * as ts from "typescript";

export class ASTCollector {
  public collectInterfaces(sourceFile: ts.SourceFile): Map<string, ts.InterfaceDeclaration> {
    const interfaces = new Map<string, ts.InterfaceDeclaration>();
    this.visit(sourceFile, node => {
      if (ts.isInterfaceDeclaration(node) && node.name) {
        interfaces.set(node.name.text, node);
      }
    });
    return interfaces;
  }

  public collectInterfaceMembers(interfaceDecl: ts.InterfaceDeclaration): Map<string, ts.PropertySignature> {
    const members = new Map<string, ts.PropertySignature>();
    interfaceDecl.members.forEach(member => {
      if (ts.isPropertySignature(member) && member.name) {
        members.set(member.name.getText(), member);
      }
    });
    return members;
  }

  public collectTypeAliases(sourceFile: ts.SourceFile): Map<string, ts.TypeNode> {
    const types = new Map<string, ts.TypeNode>();
    this.visit(sourceFile, node => {
      if (ts.isTypeAliasDeclaration(node) && node.name && node.type) {
        types.set(node.name.text, node.type);
      }
    });
    return types;
  }

  public collectFunctions(
    sourceFile: ts.SourceFile
  ): Map<string, ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertySignature> {
    const functions = new Map<string, ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertySignature>();
    this.visit(sourceFile, node => {
      if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) {
        functions.set(node.name.getText(), node);
      }
    });
    return functions;
  }

  private visit(node: ts.Node, callback: (node: ts.Node) => void): void {
    callback(node);
    ts.forEachChild(node, child => this.visit(child, callback));
  }
}