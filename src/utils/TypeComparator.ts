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
    const oldTypeObj = this.getTypeObject(oldType);
    const newTypeObj = this.getTypeObject(newType);
    
    if (oldTypeStr === newTypeStr) {
      return true;
    }

    if (newTypeStr.includes(oldTypeStr)) {
      return true;
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
  private isUnionType(type: ts.Type): boolean {
    return type.isUnion();
  }

  private isIntersectionType(type: ts.Type): boolean {
    return type.isIntersection();
  }

  private isGenericType(type: ts.Type): boolean {
    return type.getSymbol()?.getName() === "GenericType";
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
    const oldTypeArgs = this.typeChecker.getTypeArguments(
      oldType as ts.TypeReference
    );
    const newTypeArgs = this.typeChecker.getTypeArguments(
      newType as ts.TypeReference
    );

    if (oldTypeArgs.length !== newTypeArgs.length) return false;

    return oldTypeArgs.every((oldArg, i) =>
      this.areTypesCompatible(oldArg, newTypeArgs[i])
    );
  }

  private isArrayType(type: ts.Type): boolean {
    const typeStr = this.typeChecker.typeToString(type);
    return typeStr.endsWith("[]");
  }

  private compareArrayTypes(oldType: ts.Type, newType: ts.Type): boolean {
    const oldTypeStr = this.typeChecker.typeToString(oldType);
    const newTypeStr = this.typeChecker.typeToString(newType);

    if (!newTypeStr.includes("[]")) return false;

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