import { SemverChangeDetector, ChangeReport } from "../SemverChangeDetector";

describe("SemverChangeDetector", () => {
  let detector: SemverChangeDetector;

  describe("Basic Functionality", () => {
    it("should detect no changes between identical definitions", () => {
      const definition = `
        interface Foo {
          bar: string;
        }
      `;
      detector = new SemverChangeDetector(definition, definition);
      const report = detector.detectChanges();
      expect(report.changeType).toBe("patch");
      expect(report.changes).toHaveLength(0);
    });

    it("should detect added interfaces", () => {
      const previousDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: string;
        }
        interface Baz {
          qux: number;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("minor");
      expect(report.changes).toContain("MINOR: Added new interface Baz");
    });

    it("should detect removed interfaces", () => {
      const previousDefinition = `
        interface Foo {
          bar: string;
        }
        interface Baz {
          qux: number;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain("BREAKING: Removed interface Baz");
    });

    it("should detect modified interfaces", () => {
      const previousDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: number;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed type of member bar in interface Foo: string is not assignable to number",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty definitions", () => {
      detector = new SemverChangeDetector("", "");
      const report = detector.detectChanges();
      expect(report.changeType).toBe("patch");
      expect(report.changes).toHaveLength(0);
    });

    // it("should handle invalid TypeScript definitions", () => {
    //   const invalidDefinition = `interface Foo { bar: string; `; // Missing closing brace
    //   expect(
    //     () => new SemverChangeDetector(invalidDefinition, invalidDefinition),
    //   ).toThrow();
    // });

    it("should detect changes in nested types", () => {
      const previousDefinition = `
        interface Foo {
          bar: {
            baz: string;
          };
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: {
            baz: number;
          };
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed type of member baz in interface Foo.bar: string is not assignable to number",
      );
    });

    it("should detect changes in optional and required members", () => {
      const previousDefinition = `
        interface Foo {
          bar?: string;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed member bar in interface Foo from optional to required",
      );
    });
  });

  describe("Type Compatibility", () => {
    it("should detect incompatible primitive types", () => {
      const previousDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: number;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed type of member bar in interface Foo: string is not assignable to number",
      );
    });

    it("should detect incompatible union types", () => {
      const previousDefinition = `
        interface Foo {
          bar: string | number;
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: string;
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed type of member bar in interface Foo: string | number is not assignable to string",
      );
    });

    it("should detect incompatible array types", () => {
      const previousDefinition = `
        interface Foo {
          bar: string[];
        }
      `;
      const currentDefinition = `
        interface Foo {
          bar: number[];
        }
      `;
      detector = new SemverChangeDetector(
        previousDefinition,
        currentDefinition,
      );
      const report = detector.detectChanges();
      expect(report.changeType).toBe("major");
      expect(report.changes).toContain(
        "BREAKING: Changed type of member bar in interface Foo: string[] is not assignable to number[]",
      );
    });
  });

  // describe("Error Handling", () => {
  //   it("should handle invalid inputs gracefully", () => {
  //     expect(() => new SemverChangeDetector("invalid", "invalid")).toThrow();
  //   });

  //   it("should report type errors correctly", () => {
  //     const previousDefinition = `
  //       interface Foo {
  //         bar: string;
  //       }
  //     `;
  //     const currentDefinition = `
  //       interface Foo {
  //         bar: SomeNonExistentType;
  //       }
  //     `;
  //     detector = new SemverChangeDetector(
  //       previousDefinition,
  //       currentDefinition,
  //     );
  //     const report = detector.detectChanges();
  //     expect(report.changeType).toBe("major");
  //     expect(report.changes).toContain(
  //       "BREAKING: Type change error in member bar of interface Foo: One or both types are invalid.",
  //     );
  //   });
  // });
});
