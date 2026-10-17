import { defineConfig, devices } from "@playwright/test";

// Deliberately not the `yarn test:visual:dev` port (3419): reusing a
// long-running dev server can test a stale module graph (e.g. when its file
// watcher missed a change), so every run starts its own server.
const PORT = Number(process.env.VISUAL_TESTS_PORT) || 3420;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./visual-tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx vite --config visual-tests/vite.config.ts --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 2,
    },
  },
});
