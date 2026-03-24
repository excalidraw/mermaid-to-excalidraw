import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual-tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3419",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx vite --config visual-tests/vite.config.ts",
    url: "http://localhost:3419",
    reuseExistingServer: true,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 2,
    },
  },
});
