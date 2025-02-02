import * as ts from "typescript";

export interface TypeComparison {
  isCompatible: boolean;
  changeType: 'major' | 'minor' | 'patch';
}

export class TypeComparator {
  constructor(private typeChecker: ts.TypeChecker) {}

  public areTypesCompatible(oldType: ts.Type, newType: ts.Type): boolean {
    const comparison = this.compareTypes(oldType, newType);
    return comparison.isCompatible;
  }

  public compareTypes(oldType: ts.Type, newType: ts.Type): TypeComparison {
    // For mapped types and intersection types
    if ((oldType.flags & ts.TypeFlags.Intersection) || (newType.flags & ts.TypeFlags.Intersection) ||
        (oldType.flags & ts.TypeFlags.Object) || (newType.flags & ts.TypeFlags.Object)) {
      
      const forwardCompatible = this.typeChecker.isTypeAssignableTo(newType, oldType);
      const backwardCompatible = this.typeChecker.isTypeAssignableTo(oldType, newType);

      if (forwardCompatible && backwardCompatible) {
        // If types are mutually assignable, it's a refactoring (patch change)
        return { isCompatible: true, changeType: 'patch' };
      } else if (forwardCompatible) {
        // If only forward compatible, it's a minor change (addition)
        return { isCompatible: true, changeType: 'minor' };
      }
    }

    // For all other cases, check basic compatibility
    const isCompatible = this.typeChecker.isTypeAssignableTo(newType, oldType);
    return {
      isCompatible,
      changeType: isCompatible ? 'patch' : 'major'
    };
  }

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
    
    if (oldTypeStr === newTypeStr) {
      return true;
    }

    if (oldTypeStr.includes('[]') && !newTypeStr.includes('[]')) {
      return false;
    }

    if (this.isConditionalType(oldType) || this.isConditionalType(newType)) {
      return this.compareConditionalTypes(oldType, newType);
    }

    if (oldType.getCallSignatures().length > 0 || newType.getCallSignatures().length > 0) {
      return this.compareFunctionTypes(oldType, newType);
    }

    // Replace isObject() with proper object type check
    if (this.isObjectType(oldType) && this.isObjectType(newType)) {
      return this.compareObjectTypes(oldType, newType);
    }

    if (this.isUnionType(oldType) || this.isUnionType(newType)) {
      return this.compareUnionTypes(oldType, newType);
    }

    if (this.isIntersectionType(oldType) || this.isIntersectionType(newType)) {
      return this.compareIntersectionTypes(oldType, newType);
    }

    if (this.isGenericType(oldType) || this.isGenericType(newType)) {
      return this.compareGenericTypes(oldType, newType);
    }

    if (this.isArrayType(oldType)) {
      return this.compareArrayTypes(oldType, newType);
    }

    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private isObjectType(type: ts.Type): boolean {
    return !!(type.flags & ts.TypeFlags.Object) || 
           !!(type.flags & ts.TypeFlags.NonPrimitive) ||
           (type.isClassOrInterface() && !type.isTypeParameter());
  }

  private isConditionalType(type: ts.Type): boolean {
    const typeStr = this.typeChecker.typeToString(type);
    return typeStr.includes('extends') && typeStr.includes('?');
  }

  private compareConditionalTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    if (newTypeStr.includes(oldTypeStr)) {
      return true;
    }

    const oldBranches = oldTypeStr.split('?')[0];
    if (newTypeStr.startsWith(oldBranches)) {
      return true;
    }

    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private compareFunctionTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldSignatures = oldType.getCallSignatures();
    const newSignatures = newType.getCallSignatures();

    if (oldSignatures.length === 0 || newSignatures.length === 0) {
      return false;
    }

    return newSignatures.every(newSig => 
      oldSignatures.some(oldSig => this.compareSignatures(oldSig, newSig))
    );
  }

  private compareSignatures(oldSig: ts.Signature, newSig: ts.Signature): boolean {
    const oldParams = oldSig.getParameters();
    const newParams = newSig.getParameters();
    const oldReturnType = this.typeChecker.getReturnTypeOfSignature(oldSig);
    const newReturnType = this.typeChecker.getReturnTypeOfSignature(newSig);

    const returnTypeCompatible = this.typeChecker.isTypeAssignableTo(newReturnType, oldReturnType);

    const paramsCompatible = oldParams.every((oldParam, index) => {
      const newParam = newParams[index];
      if (!newParam) return false;

      const oldParamType = this.typeChecker.getTypeOfSymbol(oldParam);
      const newParamType = this.typeChecker.getTypeOfSymbol(newParam);

      return this.typeChecker.isTypeAssignableTo(oldParamType, newParamType);
    });

    return returnTypeCompatible && paramsCompatible;
  }

  private compareObjectTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldProperties = oldType.getProperties();
    const newProperties = newType.getProperties();

    return oldProperties.every(oldProp => {
      const newProp = newProperties.find(p => p.getName() === oldProp.getName());
      if (!newProp) return false;

      const oldPropType = this.typeChecker.getTypeOfSymbol(oldProp);
      const newPropType = this.typeChecker.getTypeOfSymbol(newProp);

      return this.typeChecker.isTypeAssignableTo(newPropType, oldPropType);
    });
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

  private isArrayType(type: ts.Type): boolean {
    const typeStr = this.typeChecker.typeToString(type);
    return typeStr.endsWith("[]");
  }

  private compareArrayTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    if (!oldTypeStr.includes("[]") || !newTypeStr.includes("[]")) return false;

    const oldElementType = this.typeChecker.getTypeArguments(oldType as ts.TypeReference)[0];
    const newElementType = this.typeChecker.getTypeArguments(newType as ts.TypeReference)[0];

    if (!oldElementType || !newElementType) {
      const oldElement = oldTypeStr.slice(0, -2);
      const newElement = newTypeStr.slice(0, -2);
      return oldElement === newElement;
    }

    return this.typeChecker.isTypeAssignableTo(newElementType, oldElementType);
  }

  private compareUnionTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypes = oldType.isUnion() ? oldType.types : [oldType];
    const newTypes = newType.isUnion() ? newType.types : [newType];

    return newTypes.every(newT =>
      oldTypes.some(oldT => this.typeChecker.isTypeAssignableTo(newT, oldT))
    );
  }

  private compareIntersectionTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypes = oldType.isIntersection() ? oldType.types : [oldType];
    const newTypes = newType.isIntersection() ? newType.types : [newType];

    return oldTypes.every(oldT =>
      newTypes.some(newT => this.typeChecker.isTypeAssignableTo(oldT, newT))
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
      
      if (!oldConstraint && newConstraint) {
        return false;
      }
      
      if (oldConstraint && newConstraint) {
        const isAssignable = this.typeChecker.isTypeAssignableTo(newConstraint, oldConstraint);
        const isReverse = this.typeChecker.isTypeAssignableTo(oldConstraint, newConstraint);
        
        if (!isAssignable || (isAssignable && isReverse)) {
          return false;
        }
      }
    }
    
    return this.typeChecker.isTypeAssignableTo(newType, oldType);
  }

  private compareTypeAliases(oldType: ts.Type, newType: ts.Type): TypeComparison {
    const oldTypeText = this.typeChecker.typeToString(oldType);
    const newTypeText = this.typeChecker.typeToString(newType);

    if (oldTypeText === newTypeText) {
      return { isCompatible: true, changeType: 'patch' };
    }

    if (oldType.isIntersection() || newType.isIntersection() || 
        (oldType.flags & ts.TypeFlags.Object) || (newType.flags & ts.TypeFlags.Object)) {
      
      const forwardCompatible = this.typeChecker.isTypeAssignableTo(newType, oldType);
      const backwardCompatible = this.typeChecker.isTypeAssignableTo(oldType, newType);
    
      if (forwardCompatible && backwardCompatible) {
        return { isCompatible: true, changeType: 'patch' };
      }
    }

    return { isCompatible: false, changeType: 'major' };
  }
}