/// <reference types="vitest" />
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "visual-tests/**"],
    coverage: {
      reporter: ["text", "json-summary", "json", "html", "lcovonly"],
    },
  },
});
