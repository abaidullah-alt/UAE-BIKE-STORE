// Note: this file uses ESM import syntax; Vitest loads it fine as-is.
// If you see a "native config loader" warning, it's non-blocking — Vitest
// still transpiles this correctly. Safe to ignore.
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
