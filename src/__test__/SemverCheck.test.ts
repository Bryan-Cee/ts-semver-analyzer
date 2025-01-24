import { SemverChangeDetector } from "../SemverChangeDetector";

describe("SemverChangeDetector", () => {
  describe("Interface Changes", () => {
    it("should handle added interface", () => {
      const detector = new SemverChangeDetector(
        "",
        `
          export interface Config {
            items: string[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new interface Config"]
      });
    });

    it("should handle removed interface", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        ""
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed interface Config"]
      });
    });

    it("should handle added optional member", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: string[];
            debug?: boolean;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added optional member debug to interface Config"]
      });
    });

    it("should handle added required member", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: string[];
            debug: boolean;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Added required member debug to interface Config"]
      });
    });

    it("should handle removed member", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
            debug: boolean;
          }
        `,
        `
          export interface Config {
            items: string[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed member debug from interface Config"]
      });
    });

    it("should handle breaking member type changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: number[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Changed type of member items in interface Config: string[] is not assignable to number[]"]
      });
    });

    it("should handle non-breaking member type changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: string[] | number[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: [
          "MINOR: Added a union type of member items in interface Config: string[] to string[] | number[]",
        ],
      });
    });

    it("should handle nested interface changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            settings: {
              theme: string;
            };
          }
        `,
        `
          export interface Config {
            settings: {
              theme: string;
              darkMode?: boolean;
            };
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added optional member darkMode to interface Config.settings"]
      });
    });
  });

  describe("Type Alias Changes", () => {
    it("should handle added type alias", () => {
      const detector = new SemverChangeDetector(
        "",
        `
          export type Config = {
            items: string[];
          };
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new type Config"]
      });
    });

    it("should handle removed type alias", () => {
      const detector = new SemverChangeDetector(
        `
          export type Config = {
            items: string[];
          };
        `,
        ""
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed type Config"]
      });
    });

    it("should handle breaking type alias changes", () => {
      const detector = new SemverChangeDetector(
        `
          export type Config = {
            items: string[];
          };
        `,
        `
          export type Config = {
            items: number[];
          };
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed type definition of Config: { items: string[]; } is not assignable to { items: number[]; }",
        ],
      });
    });

    it("should handle non-breaking type alias changes", () => {
      const detector = new SemverChangeDetector(
        `
          export type Config = {
            items: string[];
          };
        `,
        `
          export type Config = {
            items: string[] | number[];
          };
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed type definition of Config: { items: string[]; } is not assignable to { items: string[] | number[]; }",
        ],
      });
    });
  });

  describe("Function Changes", () => {
    it("should handle added function", () => {
      const detector = new SemverChangeDetector(
        "",
        `
          export function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new function greet"]
      });
    });

    it("should handle removed function", () => {
      const detector = new SemverChangeDetector(
        `
          export function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
        `,
        ""
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed function greet"]
      });
    });

    it("should handle breaking function signature changes", () => {
      const detector = new SemverChangeDetector(
        `
          export function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
        `,
        `
          export function greet(name: string, age?: number): string {
            return \`Hello, \${name}!\`;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added optional parameter age to function greet"]
      });
    });

    it("should handle non-breaking function signature changes", () => {
      const detector = new SemverChangeDetector(
        `
          export function greet(name: string, age?: number): string {
            return \`Hello, \${name}!\`;
          }
        `,
        `
          export function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed parameters from function greet"],
      });
    });
  });

  describe("Function Property Changes", () => {
    it("should handle added function property", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: string[];
            callback: (error: Error | null) => void;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added new function callback"]
      });
    });

    it("should handle removed function property", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
            callback: (error: Error | null) => void;
          }
        `,
        `
          export interface Config {
            items: string[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: ["BREAKING: Removed member callback from interface Config"]
      });
    });

    it("should handle breaking function property signature changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            callback: (error: Error | null) => void;
          }
        `,
        `
          export interface Config {
            callback: (error: Error) => void;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed function signature of callback: (error: Error | null) => void is not assignable to (error: Error) => void",
        ],
      });
    });

    it("should handle non-breaking function property signature changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            callback: (error: Error | null) => void;
          }
        `,
        `
          export interface Config {
            callback: (error: Error | null, data?: any) => void;
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "minor",
        changes: ["MINOR: Added optional parameter data to function callback"]
      });
    });
  });

  describe("Combination Changes", () => {
    it("should handle multiple changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
          export function greet(name: string): string { return "" };
        `,
        `
          export interface Config {
            items: number[];
            callback: (error: Error | null) => void;
          }
          export function greet(name: string, age?: number): string { return "" };
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "major",
        changes: [
          "BREAKING: Changed type of member items in interface Config: string[] is not assignable to number[]",
          "MINOR: Added new function callback",
          "MINOR: Added optional parameter age to function greet"
        ]
      });
    });

    it("should handle no changes", () => {
      const detector = new SemverChangeDetector(
        `
          export interface Config {
            items: string[];
          }
        `,
        `
          export interface Config {
            items: string[];
          }
        `
      );
      expect(detector.detectChanges()).toEqual({
        changeType: "patch",
        changes: []
      });
    });
  });
});