/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["visual-tests/**", "node_modules/**"],
    coverage: {
      reporter: ["text", "json-summary", "json", "html", "lcovonly"],
    },
  },
});
