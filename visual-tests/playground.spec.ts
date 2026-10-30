import { test, expect, Page } from "@playwright/test";
import { readdirSync } from "node:fs";

// The feature test cases (testcases/testcases.ts), by id: Playwright runs in
// Node, without Vite's import.meta.glob. A snapshot per file, named after it.
const TESTCASE_IDS = readdirSync(
  new URL("../testcases/features", import.meta.url)
)
  .filter((file) => file.endsWith(".mmd"))
  .map((file) => file.replace(/\.mmd$/, ""))
  .sort();

// One page per worker, reused across that worker's tests (no reload between
// cases). Tests run in parallel and in no fixed order, so each render must not
// depend on what rendered before it in the same page.
let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  await sharedPage.goto("/?pw");
  await sharedPage.waitForFunction(
    () => (window as any).__HARNESS_READY__ || (window as any).__HARNESS_ERROR__
  );
  const harnessError = await sharedPage.evaluate(
    () => (window as any).__HARNESS_ERROR__
  );
  if (harnessError) {
    throw new Error(`Visual test harness failed to start: ${harnessError}`);
  }
});

test.afterAll(async () => {
  await sharedPage.close();
});

TESTCASE_IDS.forEach((id) => {
  test(id, async () => {
    await sharedPage.evaluate((id) => (window as any).renderTestCase(id), id);

    // Wait for both panels to have SVG content (or error for unsupported)
    await sharedPage.waitForFunction(
      () => {
        const mermaidSvg = document.querySelector("#mermaid-output svg");
        const excalidrawSvg = document.querySelector("#excalidraw-output svg");
        const error = document.getElementById("error")?.textContent;
        return (mermaidSvg && excalidrawSvg) || (error && error.length > 0);
      },
      { timeout: 15000 }
    );

    const container = sharedPage.locator("#container");
    await expect(container).toHaveScreenshot(`${id}.png`);
  });
});
