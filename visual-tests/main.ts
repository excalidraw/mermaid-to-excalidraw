import mermaid from "mermaid";
import {
  convertToExcalidrawElements,
  exportToSvg,
  Fonts,
  FONT_FAMILY,
} from "@excalidraw/excalidraw";

import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../src/constants";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { parseMermaid } from "../src/parseMermaid";
import { runMermaidTaskSequentially } from "../src/mermaidExecutionQueue";

import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported";

interface TestCase {
  type: string;
  name: string;
  definition: string;
}

const ALL_TESTCASES: TestCase[] = [
  ...FLOWCHART_DIAGRAM_TESTCASES,
  ...SEQUENCE_DIAGRAM_TESTCASES,
  ...CLASS_DIAGRAM_TESTCASES,
  ...ERD_DIAGRAM_TESTCASES,
  ...UNSUPPORTED_DIAGRAM_TESTCASES,
];

mermaid.initialize({
  ...MERMAID_CONFIG,
  themeVariables: { fontSize: `${DEFAULT_FONT_SIZE}px` },
});

const mermaidOutput = document.getElementById("mermaid-output")!;
const excalidrawOutput = document.getElementById("excalidraw-output")!;
const errorDiv = document.getElementById("error")!;

let renderCounter = 0;
let currentRenderGeneration = 0;

const cleanupMermaidTempContainers = () => {
  document
    .querySelectorAll<HTMLDivElement>(".mermaid-to-excalidraw-svg-container")
    .forEach((el) => el.remove());
};

// ── Render cache (dev only) ──
// Stores rendered SVG HTML per test case index so switching is instant.
// Cleared on Vite HMR updates.
interface CacheEntry {
  mermaidHtml: string;
  excalidrawHtml: string;
  errorText: string;
}
const renderCache = new Map<number, CacheEntry>();

if (import.meta.hot) {
  // Any module update (src files, testcases, this file) → full reload clears
  // the cache naturally. For partial HMR updates, clear explicitly.
  import.meta.hot.on("vite:beforeUpdate", () => {
    renderCache.clear();
  });
}

async function renderTestCase(index: number): Promise<void> {
  const testcase = ALL_TESTCASES[index];
  if (!testcase) {
    throw new Error(`No test case at index ${index}`);
  }

  // Bump generation so any in-flight render for a previous case bails out.
  const generation = ++currentRenderGeneration;
  const isStale = () => generation !== currentRenderGeneration;

  const caseLabel = document.getElementById("case-label");
  if (caseLabel) {
    caseLabel.textContent = `#${index} [${testcase.type}] — ${testcase.name}`;
  }

  // Check cache first
  const cached = renderCache.get(index);
  if (cached) {
    errorDiv.textContent = cached.errorText;
    mermaidOutput.innerHTML = cached.mermaidHtml;
    excalidrawOutput.innerHTML = cached.excalidrawHtml;
    return;
  }

  errorDiv.textContent = "";
  mermaidOutput.innerHTML = "";
  excalidrawOutput.innerHTML = "";

  try {
    // Render mermaid SVG
    const renderId = `vt-mermaid-${renderCounter++}`;
    const tempContainer = document.createElement("div");
    tempContainer.style.cssText =
      "opacity:0;position:fixed;z-index:-1;left:-99999px;top:-99999px;";
    document.body.appendChild(tempContainer);

    const { svg: mermaidSvg } = await runMermaidTaskSequentially(() =>
      mermaid.render(renderId, testcase.definition, tempContainer),
    );
    tempContainer.remove();
    if (isStale()) {
      return;
    }

    mermaidOutput.innerHTML = mermaidSvg;

    // Mermaid adds internal padding around diagram content. Use getBBox()
    // to find the actual content bounds and crop the viewBox to fit tightly.
    // Skip for extreme aspect ratios (e.g. Gantt charts) where cropping
    // would make the SVG too short when CSS constrains the width.
    const mRenderedSvg = mermaidOutput.querySelector("svg");
    if (mRenderedSvg) {
      const PAD = 4; // small breathing room
      const bbox = mRenderedSvg.getBBox();
      const vbW = bbox.width + PAD * 2;
      const vbH = bbox.height + PAD * 2;
      if (vbW / vbH < 10) {
        const vbX = bbox.x - PAD;
        const vbY = bbox.y - PAD;
        mRenderedSvg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
        mRenderedSvg.setAttribute("width", `${vbW}`);
        mRenderedSvg.removeAttribute("height");
        mRenderedSvg.style.maxWidth = "";
      }
    }

    // Render excalidraw SVG
    const parsed = await parseMermaid(testcase.definition);
    if (isStale()) {
      return;
    }

    const { elements, files } = graphToExcalidraw(parsed, {
      fontSize: DEFAULT_FONT_SIZE,
    });

    const excalidrawElements = convertToExcalidrawElements(elements);

    // Fix seeds to make rendering deterministic across runs
    for (const el of excalidrawElements) {
      (el as any).seed = 1;
    }

    const svgElement = await exportToSvg({
      elements: excalidrawElements,
      appState: {
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
      },
      files: files ?? null,
      exportPadding: 4,
    });
    if (isStale()) {
      return;
    }

    excalidrawOutput.innerHTML = svgElement.outerHTML;

    // Let SVGs size naturally — CSS flexbox handles panel alignment.

    // Cache the rendered output
    renderCache.set(index, {
      mermaidHtml: mermaidOutput.innerHTML,
      excalidrawHtml: excalidrawOutput.innerHTML,
      errorText: "",
    });

    // Expose last render's elements for debugging
    (window as any).__LAST_ELEMENTS__ = excalidrawElements;
    (window as any).__LAST_SKELETON__ = elements;
    cleanupMermaidTempContainers();
  } catch (err) {
    cleanupMermaidTempContainers();
    if (isStale()) {
      return;
    }
    errorDiv.textContent = String(err);
    // Cache errors too (e.g. unsupported diagrams)
    renderCache.set(index, {
      mermaidHtml: "",
      excalidrawHtml: "",
      errorText: String(err),
    });
  }
}

async function renderAllTestCases(): Promise<void> {
  const allContainer = document.getElementById("all-container")!;
  allContainer.innerHTML = "";
  allContainer.classList.add("active");

  // Hide single-case view
  document.getElementById("container")!.style.display = "none";
  document.getElementById("error")!.style.display = "none";

  for (let i = 0; i < ALL_TESTCASES.length; i++) {
    const tc = ALL_TESTCASES[i];
    const card = document.createElement("div");
    card.className = "all-card";

    const title = document.createElement("a");
    title.className = "all-card-title";
    title.href = `?case=${i}`;
    title.textContent = `#${i} [${tc.type}] — ${tc.name}`;
    title.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        return; // let browser open new tab
      }
      e.preventDefault();
      (window as any).__showSingle__(i);
    });
    card.appendChild(title);

    const toolbar = document.createElement("div");
    toolbar.className = "panel-toolbar";
    const copyMSvg = document.createElement("button");
    copyMSvg.textContent = "copy mermaid svg";
    const copyESvg = document.createElement("button");
    copyESvg.textContent = "copy excalidraw svg";
    const copyDef = document.createElement("button");
    copyDef.textContent = "copy mermaid";
    copyDef.addEventListener("click", () => {
      navigator.clipboard.writeText(tc.definition);
    });
    toolbar.appendChild(copyMSvg);
    toolbar.appendChild(copyESvg);
    toolbar.appendChild(copyDef);
    card.appendChild(toolbar);

    const body = document.createElement("div");
    body.className = "all-card-body";

    const mPanel = document.createElement("div");
    mPanel.className = "panel";
    const mOut = document.createElement("div");
    mPanel.appendChild(mOut);

    const ePanel = document.createElement("div");
    ePanel.className = "panel";
    const eOut = document.createElement("div");
    ePanel.appendChild(eOut);

    copyMSvg.addEventListener("click", () => {
      const svg = mOut.querySelector("svg");
      if (svg) {
        navigator.clipboard.writeText(svg.outerHTML);
      }
    });
    copyESvg.addEventListener("click", () => {
      const svg = eOut.querySelector("svg");
      if (svg) {
        navigator.clipboard.writeText(svg.outerHTML);
      }
    });

    body.appendChild(mPanel);
    body.appendChild(ePanel);
    card.appendChild(body);
    allContainer.appendChild(card);

    try {
      const renderId = `vt-all-${renderCounter++}`;
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText =
        "opacity:0;position:fixed;z-index:-1;left:-99999px;top:-99999px;";
      document.body.appendChild(tempContainer);

      const { svg: mermaidSvg } = await runMermaidTaskSequentially(() =>
        mermaid.render(renderId, tc.definition, tempContainer),
      );
      tempContainer.remove();
      mOut.innerHTML = mermaidSvg;

      // Crop mermaid SVG padding (same as single-case view)
      const mRenderedSvg = mOut.querySelector("svg");
      if (mRenderedSvg) {
        const PAD = 4;
        const bbox = mRenderedSvg.getBBox();
        const vbW = bbox.width + PAD * 2;
        const vbH = bbox.height + PAD * 2;
        if (vbW / vbH < 10) {
          const vbX = bbox.x - PAD;
          const vbY = bbox.y - PAD;
          mRenderedSvg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
          mRenderedSvg.setAttribute("width", `${vbW}`);
          mRenderedSvg.removeAttribute("height");
          mRenderedSvg.style.maxWidth = "";
        }
      }

      const parsed = await parseMermaid(tc.definition);
      const { elements, files } = graphToExcalidraw(parsed, {
        fontSize: DEFAULT_FONT_SIZE,
      });
      const excalidrawElements = convertToExcalidrawElements(elements);
      for (const el of excalidrawElements) {
        (el as any).seed = 1;
      }
      const svgElement = await exportToSvg({
        elements: excalidrawElements,
        appState: {
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
        },
        files: files ?? null,
        exportPadding: 4,
      });
      eOut.innerHTML = svgElement.outerHTML;

      cleanupMermaidTempContainers();
    } catch (err) {
      cleanupMermaidTempContainers();
      const errDiv = document.createElement("div");
      errDiv.className = "all-card-error";
      errDiv.textContent = String(err);
      card.appendChild(errDiv);
    }
  }
}

function hideAllView(): void {
  const allContainer = document.getElementById("all-container")!;
  allContainer.classList.remove("active");
  allContainer.innerHTML = "";
  document.getElementById("container")!.style.display = "";
  document.getElementById("error")!.style.display = "";
}

// Expose to Playwright
(window as any).renderTestCase = renderTestCase;
(window as any).renderAllTestCases = renderAllTestCases;
(window as any).hideAllView = hideAllView;
(window as any).TEST_CASE_COUNT = ALL_TESTCASES.length;
(window as any).ALL_TESTCASES = ALL_TESTCASES;

// Preload Excalifont before any test case runs.
// convertToExcalidrawElements measures text synchronously via Canvas API,
// so Excalifont must be loaded BEFORE it runs, not after.
//
// Font files are copied from @excalidraw/excalidraw dist into public/fonts/
// by visual-tests/copy-fonts.mjs (run automatically via the test:visual script).
// EXCALIDRAW_ASSET_PATH tells the Fonts loader to resolve relative font URIs
// (e.g. "./fonts/Excalifont/...") against our public dir instead of esm.sh CDN.
(async () => {
  (window as any).EXCALIDRAW_ASSET_PATH = "/";

  await Fonts.loadElementsFonts([
    {
      type: "text",
      fontFamily: FONT_FAMILY.Excalifont,
      text: "preload",
      originalText: "preload",
    } as any,
  ]);
  await document.fonts.ready;

  (window as any).__HARNESS_READY__ = true;
})();
