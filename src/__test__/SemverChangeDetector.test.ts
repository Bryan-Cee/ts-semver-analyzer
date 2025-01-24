import { SemverChangeDetector } from "../core/SemverChangeDetector";
import { DetectorOptions } from "../interfaces/DetectorOptions";
import { fixtures } from "./fixtures/typeDefinitions";

describe("SemverChangeDetector", () => {
  let detector: SemverChangeDetector;
  const createDetector = (previous: DetectorOptions['previous'], current: DetectorOptions['current']): SemverChangeDetector => {
    return new SemverChangeDetector({ previous, current });
  };

  describe("Basic Functionality", () => {
    it("should detect no changes between identical definitions", async () => {
      detector = createDetector(fixtures.basic.previous, fixtures.basic.previous);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "patch",
        changes: []
      });
    });

    it("should detect added interfaces", async () => {
      detector = createDetector(
        fixtures.basic.previous,
        {
          ...fixtures.basic.current,
          content: `
            ${fixtures.basic.previous.content}
            export interface Baz {
              qux: number;
            }
          `
        }
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new interface Baz"]
      });
    });

    it("should detect removed interfaces", async () => {
      detector = createDetector(
        {
          ...fixtures.basic.previous,
          content: `
            ${fixtures.basic.previous.content}
            export interface Baz {
              qux: number;
            }
          `
        },
        fixtures.basic.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Removed interface Baz",
          "MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]",
        ]
      });
    });

    it("should detect basic type changes", async () => {
      detector = createDetector(fixtures.basic.previous, fixtures.basic.current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]"]
      });
    });
  });

  describe("Function Changes", () => {
    it("should handle function signature changes", async () => {
      detector = createDetector(
        fixtures.functionSignatures.previous,
        fixtures.functionSignatures.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "MINOR: Added optional parameter data to function onSuccess",
          "BREAKING: Changed generic type parameters of function transform",
          "MINOR: Added new interface Process",
          "BREAKING: Removed type ProcessFunction",
        ]
      });
    });

    it("should handle function property changes", async () => {
      detector = createDetector(
        fixtures.withFunction.previous,
        fixtures.withFunction.current
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
    it("should detect incompatible primitive types", async () => {
      detector = createDetector(
        fixtures.basic.previous,
        {
          ...fixtures.basic.current,
          content: `
            export interface Config {
              items: number;
            }
          `
        }
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed type of member items in interface Config: string[] is not assignable to number"]
      });
    });

    it("should detect incompatible array types", async () => {
      detector = createDetector(
        fixtures.basic.previous,
        {
          ...fixtures.basic.current,
          content: `
            export interface Config {
              items: number[];
            }
          `
        }
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed type of member items in interface Config: string[] is not assignable to number[]"]
      });
    });
  });

  describe("Complex Type Changes", () => {
    it("should handle intersection type changes", async () => {
      detector = createDetector(
        fixtures.complexTypes.previous,
        fixtures.complexTypes.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed type of member data in interface Config: { id: number } & { name: string } is not assignable to { id: number }",
        ]
      });
    });

    it("should handle nested type changes", async () => {
      detector = createDetector(
        fixtures.nestedTypes.previous,
        fixtures.nestedTypes.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "MINOR: Added a union type of member theme in interface Settings: 'light' | 'dark' to 'light' | 'dark' | 'system'",
          "BREAKING: Added required member logLevel to interface Settings",
        ]
      });
    });

    it("should detect changes in optional and required members", async () => {
      detector = createDetector(
        {
          ...fixtures.basic.previous,
          content: `
            export interface Config {
              items?: string[];
            }
          `
        },
        fixtures.basic.current
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
    it("should handle generic constraint changes", async () => {
      detector = createDetector(
        fixtures.genericTypes.previous,
        fixtures.genericTypes.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added constraint object to generic parameter T in interface Container"]
      });
    });

    it("should handle type inference changes", async () => {
      detector = createDetector(
        fixtures.typeInference.previous,
        fixtures.typeInference.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added type constraint to generic parameter U in function transform"]
      });
    });
  });

  describe("Advanced Type Features", () => {
    it("should handle mapped type changes", async () => {
      detector = createDetector(
        fixtures.mappedTypes.previous,
        fixtures.mappedTypes.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed mapped type definition in type ReadOnly"]
      });
    });

    it("should handle conditional type changes", async () => {
      detector = createDetector(
        fixtures.conditionalTypes.previous,
        fixtures.conditionalTypes.current
      );
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added conditional branches to type TypeName"]
      });
    });

    it("should handle template literal type changes", async () => {
      detector = createDetector(
        fixtures.templateLiterals.previous,
        fixtures.templateLiterals.current
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
      detector = createDetector(fixtures.empty.previous, fixtures.empty.current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "patch",
        changes: []
      });
    });

    it("should handle invalid typescript", async () => {
      detector = createDetector(
        { ...fixtures.basic.previous, content: "invalid typescript!!!" },
        fixtures.basic.current
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });

    it("should handle malformed type definitions", async () => {
      detector = createDetector(
        { ...fixtures.basic.previous, content: "export interface Config { items: Invalid[] }" },
        fixtures.basic.current
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });
  });
});
