import { test, expect, Page } from "@playwright/test";
import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er";
import { STATE_DIAGRAM_TESTCASES } from "../playground/testcases/state";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported";

test.describe.configure({ mode: "serial" });

const ALL_TESTCASES = [
  ...FLOWCHART_DIAGRAM_TESTCASES.map((tc) => ({
    ...tc,
    chartType: "flowchart",
  })),
  ...SEQUENCE_DIAGRAM_TESTCASES.map((tc) => ({ ...tc, chartType: "sequence" })),
  ...CLASS_DIAGRAM_TESTCASES.map((tc) => ({ ...tc, chartType: "class" })),
  ...ERD_DIAGRAM_TESTCASES.map((tc) => ({ ...tc, chartType: "erd" })),
  ...STATE_DIAGRAM_TESTCASES.map((tc) => ({ ...tc, chartType: "state" })),
  ...UNSUPPORTED_DIAGRAM_TESTCASES.map((tc) => ({
    ...tc,
    chartType: "unsupported",
  })),
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Shared page instance — reused across all tests (no reload between cases)
let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  await sharedPage.goto("/?pw");
  await sharedPage.waitForFunction(() => (window as any).__HARNESS_READY__);
});

test.afterAll(async () => {
  await sharedPage.close();
});

ALL_TESTCASES.forEach((tc, index) => {
  test(`#${index} ${tc.name}`, async () => {
    await sharedPage.evaluate((i) => (window as any).renderTestCase(i), index);

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
    await expect(container).toHaveScreenshot(
      `${index}-${tc.chartType}-${slugify(tc.name)}.png`
    );
  });
});
