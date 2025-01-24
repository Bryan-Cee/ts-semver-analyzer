export interface ChangeReport {
  changeType: "major" | "minor" | "patch";
  changes: string[];
}