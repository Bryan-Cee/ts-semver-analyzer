import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Main entry file
  format: ["cjs", "esm"], // CommonJS and ESM support
  dts: true, // Generate TypeScript declaration files
  splitting: false, // No code-splitting for better compatibility
  sourcemap: true, // Enable sourcemaps
  clean: true, // Clean output before building
  minify: true, // Minify output for better performance
  target: "node18", // Target Node.js 18+
  outDir: "dist", // Output directory
});
