import * as ts from "typescript";

export class TypeComparator {
  constructor(private typeChecker: ts.TypeChecker) {}

  public isTypeMoreRestrictive(prevType: ts.Type, currType: ts.Type): boolean {
    const prevTypeStr = this.typeChecker.typeToString(prevType);
    const currTypeStr = this.typeChecker.typeToString(currType);
    const prevTypeObj = this.getTypeObject(prevType);
    const currTypeObj = this.getTypeObject(currType);

    if (prevTypeStr.includes("|") || currTypeStr.includes("|")) {
      return this.compareUnionTypes(prevTypeObj, currTypeObj);
    }

    if (prevTypeStr === "any" && currTypeStr !== "any") {
      return true;
    }

    return this.compareRegularTypes(prevType, currType);
  }

  public areTypesCompatible(
    oldType: ts.Type | ts.TypeNode,
    newType: ts.Type | ts.TypeNode
  ): boolean {
    const oldTypeObj = this.getTypeObject(oldType);
    const newTypeObj = this.getTypeObject(newType);

    return this.compareNodeTypes(oldTypeObj, newTypeObj);
  }

  private getTypeObject(type: ts.Type | ts.TypeNode): ts.Type {
    return "kind" in type
      ? this.typeChecker.getTypeAtLocation(type as ts.TypeNode)
      : (type as ts.Type);
  }

  private compareRegularTypes(prevType: ts.Type, currType: ts.Type): boolean {
    const currToPrev = this.typeChecker.isTypeAssignableTo(currType, prevType);
    const prevToCurr = this.typeChecker.isTypeAssignableTo(prevType, currType);

    return currToPrev && !prevToCurr;
  }

  private compareNodeTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);
    
    // Handle array type to primitive type comparison
    if (oldTypeStr.includes('[]') && !newTypeStr.includes('[]')) {
      return false;
    }

    // Get the base types for comparison
    const oldTypeObj = this.getTypeObject(oldType);
    const newTypeObj = this.getTypeObject(newType);
    
    if (oldTypeStr === newTypeStr) {
      return true;
    }

    // Handle conditional types first
    if (oldTypeStr.includes('extends') && oldTypeStr.includes('?') &&
        newTypeStr.includes('extends') && newTypeStr.includes('?')) {
      // If the new type starts with the same condition and adds more branches,
      // consider it a compatible change
      const oldFirstBranch = oldTypeStr.split('?')[0];
      if (newTypeStr.startsWith(oldFirstBranch)) {
        return true;
      }
    }

    // Handle union types
    if (this.isUnionType(oldTypeObj) || this.isUnionType(newTypeObj)) {
      return this.compareUnionTypes(oldTypeObj, newTypeObj);
    }

    // Handle intersection types
    if (
      this.isIntersectionType(oldTypeObj) ||
      this.isIntersectionType(newTypeObj)
    ) {
      return this.compareIntersectionTypes(oldTypeObj, newTypeObj);
    }

    // Handle generics
    if (this.isGenericType(oldTypeObj) || this.isGenericType(newTypeObj)) {
      return this.compareGenericTypes(oldTypeObj, newTypeObj);
    }

    if (this.isArrayType(oldType)) {
      return this.compareArrayTypes(oldType, newType);
    }

    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private isConditionalType(type: ts.Type): boolean {
    return type.flags === ts.TypeFlags.Conditional;
  }

  private compareConditionalTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    // If the new type includes all branches from the old type and adds more,
    // consider it a compatible change
    if (newTypeStr.includes(oldTypeStr)) {
      return true;
    }

    // Check if the new type is a more specific conditional type that maintains
    // backward compatibility with the old type
    const oldBranches = oldTypeStr.split('?').length - 1;
    const newBranches = newTypeStr.split('?').length - 1;

    if (newBranches > oldBranches && newTypeStr.startsWith(oldTypeStr.split('?')[0])) {
      return true;
    }

    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }
  private isUnionType(type: ts.Type): boolean {
    return type.isUnion();
  }

  private isIntersectionType(type: ts.Type): boolean {
    return type.isIntersection();
  }

  private isGenericType(type: ts.Type): boolean {
    const symbol = type.getSymbol();
    if (!symbol) return false;
    const declarations = symbol.getDeclarations();
    if (!declarations || declarations.length === 0) return false;
    return ts.isTypeParameterDeclaration(declarations[0]);
  }

  private compareUnionTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypes = oldType.isUnion() ? oldType.types : [oldType];
    const newTypes = newType.isUnion() ? newType.types : [newType];

    return newTypes.every((newT) =>
      oldTypes.some((oldT) => this.typeChecker.isTypeAssignableTo(newT, oldT))
    );
  }

  private compareIntersectionTypes(
    oldType: ts.Type,
    newType: ts.Type
  ): boolean {
    const oldTypes = oldType.isIntersection() ? oldType.types : [oldType];
    const newTypes = newType.isIntersection() ? newType.types : [newType];

    return oldTypes.every((oldT) =>
      newTypes.some((newT) => this.typeChecker.isTypeAssignableTo(oldT, newT))
    );
  }

  private compareGenericTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldSymbol = oldType.getSymbol();
    const newSymbol = newType.getSymbol();
    
    if (!oldSymbol || !newSymbol) return false;
    
    const oldDecl = oldSymbol.getDeclarations()?.[0];
    const newDecl = newSymbol.getDeclarations()?.[0];
    
    if (!oldDecl || !newDecl) return false;
    
    if (ts.isTypeParameterDeclaration(oldDecl) && ts.isTypeParameterDeclaration(newDecl)) {
      const oldConstraint = oldDecl.constraint ? this.typeChecker.getTypeFromTypeNode(oldDecl.constraint) : undefined;
      const newConstraint = newDecl.constraint ? this.typeChecker.getTypeFromTypeNode(newDecl.constraint) : undefined;
      
      // If a constraint is added to a previously unconstrained type parameter,
      // or if the constraint is changed to be more restrictive, it's a breaking change
      if (!oldConstraint && newConstraint) {
        return false;
      }
      
      if (oldConstraint && newConstraint) {
        // Check if the new constraint is more restrictive
        const isAssignable = this.typeChecker.isTypeAssignableTo(newConstraint, oldConstraint);
        const isReverse = this.typeChecker.isTypeAssignableTo(oldConstraint, newConstraint);
        
        // If the new constraint is not assignable to the old one, or if they're not equivalent,
        // it's a breaking change
        if (!isAssignable || (isAssignable && isReverse)) {
          return false;
        }
      }
    }
    
    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private isArrayType(type: ts.Type): boolean {
    const typeStr = this.typeChecker.typeToString(type);
    return typeStr.endsWith("[]");
  }

  private compareArrayTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    // If either type is not an array, they are incompatible
    if (!oldTypeStr.includes("[]") || !newTypeStr.includes("[]")) return false;

    const oldElementType = this.typeChecker.getTypeArguments(
      oldType as ts.TypeReference
    )[0];
    const newElementType = this.typeChecker.getTypeArguments(
      newType as ts.TypeReference
    )[0];

    if (!oldElementType || !newElementType) {
      const oldElement = oldTypeStr.slice(0, -2);
      const newElement = newTypeStr.slice(0, -2);
      return oldElement === newElement;
    }

    return this.typeChecker.isTypeAssignableTo(newElementType, oldElementType);
  }
}