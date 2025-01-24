import { SemverChangeDetector } from "../core/SemverChangeDetector";
import { DetectorOptions } from "../interfaces/DetectorOptions";
import { 
  createConfigWithItems, 
  createOptionalConfig,
  createInterfaceFixture,
  createTypeFixture,
  createGenericInterfaceFixture,
  createFunctionFixture,
  createMultipleInterfaces,
  appendInterface,
  createFixture
} from "./fixtures/factories";
import { validateFixture } from "./fixtures/validateFixture";

describe("SemverChangeDetector", () => {
  let detector: SemverChangeDetector;
  
  const createDetector = (previous: DetectorOptions['previous'], current: DetectorOptions['current']): SemverChangeDetector => {
    if (previous.content) {
      validateFixture(previous.content);
    }
    if (current.content) {
      validateFixture(current.content);
    }
    return new SemverChangeDetector({ previous, current });
  };

  describe("Basic Functionality", () => {
    it("should detect no changes between identical definitions", async () => {
      const fixture = createConfigWithItems("string[]");
      detector = createDetector(fixture, fixture);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "patch",
        changes: []
      });
    });

    it("should detect added interfaces", async () => {
      const previous = createConfigWithItems("string[]");
      const current = appendInterface(previous, "Baz", "qux: number");
      
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new interface Baz"]
      });
    });

    it("should detect basic type changes", async () => {
      detector = createDetector(
        createConfigWithItems("string[]"),
        createConfigWithItems("string[] | number[]")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]"]
      });
    });
  });

  describe("Function Changes", () => {
    it("should handle function property changes", async () => {
      detector = createDetector(
        createInterfaceFixture("ErrorHandler", "callback: (error: Error | null) => void"),
        createInterfaceFixture("ErrorHandler", "callback: (error: Error) => void")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed function signature of callback: (error: Error | null) => void is not assignable to (error: Error) => void"
        ]
      });
    });
  });

  describe("Type Compatibility", () => {
    it.skip("should detect incompatible primitive types", async () => {
      detector = createDetector(
        createConfigWithItems("string[]"),
        createConfigWithItems("number")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed type of member items in interface Config: string[] is not assignable to number"]
      });
    });
  });

  describe("Complex Type Changes", () => {
    it("should detect changes in optional and required members", async () => {
      detector = createDetector(
        createOptionalConfig("string[]", true),
        createOptionalConfig("string[] | number[]", false)
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed member items in interface Config from optional to required",
          "MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]",
        ]
      });
    });
  });

  describe("Generic Type Changes", () => {
    it.skip("should handle generic constraint changes", async () => {
      detector = createDetector(
        createGenericInterfaceFixture("Container", "<T>", "value: T"),
        createGenericInterfaceFixture("Container", "<T extends object>", "value: T")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added constraint object to generic parameter T in interface Container"]
      });
    });

    it.skip("should handle type inference changes", async () => {
      detector = createDetector(
        createFunctionFixture("transform", "<T, U>(input: T): U"),
        createFunctionFixture("transform", "<T, U extends object>(input: T): U")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added type constraint to generic parameter U in function transform"]
      });
    });
  });

  describe("Advanced Type Features", () => {
    it.skip("should handle mapped type changes", async () => {
      detector = createDetector(
        createTypeFixture("ReadOnly", "{ readonly [P in keyof T]: T[P] }"),
        createTypeFixture("ReadOnly", "{ [P in keyof T]: T[P] }")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed mapped type definition in type ReadOnly"]
      });
    });

    it.skip("should handle conditional type changes", async () => {
      detector = createDetector(
        createTypeFixture("TypeName", "T extends string ? 'string' : 'other'"),
        createTypeFixture("TypeName", "T extends string ? 'string' : T extends number ? 'number' : 'other'")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added conditional branches to type TypeName"]
      });
    });

    it.skip("should handle template literal type changes", async () => {
      detector = createDetector(
        createTypeFixture("EventName", "'click' | 'hover'"),
        createTypeFixture("EventName", "'click' | 'hover' | 'focus'")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added union type option to type EventName"]
      });
    });
  });

  describe.skip("Edge Cases", () => {
    it("should handle empty files", async () => {
      detector = createDetector(
        createFixture(""),
        createFixture("")
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "patch",
        changes: []
      });
    });

    it("should handle invalid typescript", async () => {
      detector = createDetector(
        createFixture("invalid typescript!!!"),
        createConfigWithItems("string[]")
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });

    it("should handle malformed type definitions", async () => {
      detector = createDetector(
        createFixture("export interface Config { items: Invalid[] }"),
        createConfigWithItems("string[]")
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });
  });
});
