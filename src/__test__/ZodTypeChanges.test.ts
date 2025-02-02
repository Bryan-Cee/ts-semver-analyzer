import { SemverChangeDetector } from "../core/SemverChangeDetector";
import * as fs from "fs";
import * as path from "path";

describe("Zod Type Definition Changes", () => {
  let detector: SemverChangeDetector;

  const readTypeDefinition = (version: string): string => {
    const filePath = path.join(__dirname, "fixtures", `${version}.d.ts`);
    return fs.readFileSync(filePath, "utf-8");
  };

  it("should detect changes between Zod v3.23.6 and v3.23.7", async () => {
    const v3_23_6 = readTypeDefinition("v3_23_6");
    const v3_23_7 = readTypeDefinition("v3_23_7");

    detector = new SemverChangeDetector({
      previous: {
        content: v3_23_6,
        name: "v3_23_6.d.ts",
        path: "v3_23_6.d.ts",
      },
      current: { content: v3_23_7, name: "v3_23_7.d.ts", path: "v3_23_7.d.ts" },
    });

    const report = await detector.detectChanges();

    // The main change between v3.23.6 and v3.23.7 is in objectUtil.extendShape
    // which is a refactoring that maintains backward compatibility
    expect(report).toEqual({
      changeType: "minor",
      changes: [
        "MINOR: Changed implementation of extendShape in namespace objectUtil while maintaining compatibility"
      ]
    });
  });
});
