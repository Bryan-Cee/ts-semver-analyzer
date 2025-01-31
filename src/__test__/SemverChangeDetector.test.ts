import { SemverChangeDetector } from "../core/SemverChangeDetector";

describe("SemverChangeDetector", () => {
  let detector: SemverChangeDetector;

  const createDetector = (previous: string, current: string): SemverChangeDetector => {
    const detector = new SemverChangeDetector({
      previous: { content: previous, name: "test.d.ts", path: "test.d.ts" },
      current: { content: current, name: "test.d.ts", path: "test.d.ts" },
    });
    // Initialize immediately to avoid async initialization in each test
    return detector;
  };

  beforeEach(() => {
    // Clear any cached state between tests
    detector = createDetector("", "");
  });

  describe("Basic Functionality", () => {
    it("should detect no changes between identical definitions", async () => {
      const fixture = `
        export interface Config {
          items: string[];
        }
      `;
      detector = createDetector(fixture, fixture);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "patch",
        changes: []
      });
    });

    it("should detect added interfaces", async () => {
      const previous = `
        export interface Config {
          items: string[];
        }
      `;
      const current = `
        export interface Config {
          items: string[];
        }
        export interface Baz {
          qux: number;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new interface Baz"]
      });
    });

    it("should detect basic type changes", async () => {
      const previous = `
        export interface Config {
          items: string[];
        }
      `;
      const current = `
        export interface Config {
          items: string[] | number[];
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]"]
      });
    });
  });

  describe("Function Changes", () => {
    it("should handle function property changes", async () => {
      const previous = `
        export interface ErrorHandler {
          callback: (error: Error | null) => void;
        }
      `;
      const current = `
        export interface ErrorHandler {
          callback: (error: Error) => void;
        }
      `;
      detector = createDetector(previous, current);
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
      const previous = `
        export interface Config {
          items: string[];
        }
      `;
      const current = `
        export interface Config {
          items: number;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed type of member items in interface Config: string[] is not assignable to number"]
      });
    });
  });

  describe("Complex Type Changes", () => {
    it("should detect changes in optional and required members", async () => {
      const previous = `
        export interface Config {
          items?: string[];
        }
      `;
      const current = `
        export interface Config {
          items: string[] | number[];
        }
      `;
      detector = createDetector(previous, current);
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
      const previous = `
        export interface Container<T> {
          value: T;
        }
      `;
      const current = `
        export interface Container<T extends object> {
          value: T;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added constraint object to generic parameter T in interface Container"]
      });
    });

    it("should handle type inference changes", async () => {
      const previous = `
        export function transform<T, U>(input: T): U;
      `;
      const current = `
        export function transform<T, U extends object>(input: T): U;
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added type constraint to generic parameter U in function transform"]
      });
    });
  });

  describe("Advanced Type Features", () => {
    it("should handle mapped type changes", async () => {
      const previous = `
        export type ReadOnly<T> = { readonly [P in keyof T]: T[P] };
      `;
      const current = `
        export type ReadOnly<T> = { [P in keyof T]: T[P] };
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed mapped type definition in type ReadOnly"]
      });
    });

    it("should handle conditional type changes", async () => {
      const previous = `
        export type TypeName<T> = T extends string ? 'string' : 'other';
      `;
      const current = `
        export type TypeName<T> = T extends string ? 'string' : T extends number ? 'number' : 'other';
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added conditional branches to type TypeName"]
      });
    });

    it("should handle template literal type changes", async () => {
      const previous = `
        export type EventName = 'click' | 'hover';
      `;
      const current = `
        export type EventName = 'click' | 'hover' | 'focus';
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added union type option to type EventName"]
      });
    });

    it("should handle interface to type alias conversion", async () => {
      const previous = `
        export interface Shape {
          kind: string;
          width: number;
        }
      `;
      const current = `
        export type Shape = {
          kind: string;
          width: number;
        };
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Removed interface Shape",
          "MINOR: Added new type Shape",
        ],
      });
    });

    it("should handle non-exported to exported type changes", async () => {
      const previous = `
        type Internal = {
          value: string;
        };
        export interface Container {
          data: Internal;
        }
      `;
      const current = `
        export type Internal = {
          value: string;
        };
        export interface Container {
          data: Internal;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Made type Internal exported"]
      });
    });

    it("should handle property modifiers changes", async () => {
      const previous = `
        export interface Document {
          readonly content: string;
          timestamp: number;
        }
      `;
      const current = `
        export interface Document {
          content: string;
          readonly timestamp: number;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Removed readonly modifier from property content in interface Document",
          "BREAKING: Added readonly modifier to property timestamp in interface Document"
        ]
      });
    });

    it("should handle namespace to object type conversion", async () => {
      const previous = `
        export namespace Config {
          export interface Options {
            debug: boolean;
          }
        }
      `;
      const current = `
        export type Config = {
          Options: {
            debug: boolean;
          }
        };
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Removed interface Options",
          "MINOR: Added new type Config",
        ],
      });
    });

    it("should handle constant type changes", async () => {
      const previous = `
        export type HttpMethod = 'GET' | 'POST';
        export interface ApiConfig {
          method: HttpMethod;
        }
      `;
      const current = `
        export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
        export interface ApiConfig {
          method: HttpMethod;
        }
      `;
      detector = createDetector(previous, current);
      const report = await detector.detectChanges();
      expect(report).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added union type option to type HttpMethod"],
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty files", async () => {
      detector = createDetector("", "");
      await expect(detector.detectChanges()).rejects.toThrow();
    });

    it("should handle invalid typescript", async () => {
      detector = createDetector(
        "invalid typescript!!!",
        `
          export interface Config {
            items: string[];
          }
        `
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });

    it("should handle malformed type definitions", async () => {
      detector = createDetector(
        `
          export interface Config {
            items: Invalid[];
          }
        `,
        `
          export interface Config {
            items: string[];
          }
        `
      );
      await expect(detector.detectChanges()).rejects.toThrow();
    });
  });
});
