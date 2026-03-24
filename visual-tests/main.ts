import mermaid from "mermaid";
import {
  convertToExcalidrawElements,
  exportToSvg,
  FONT_FAMILY,
} from "@excalidraw/excalidraw";
import { charWidth } from "@excalidraw/element";
import { getFontString } from "@excalidraw/common";

import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../src/constants";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { parseMermaid } from "../src/parseMermaid";
import { runMermaidTaskSequentially } from "../src/mermaidExecutionQueue";

import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er";
import { STATE_DIAGRAM_TESTCASES } from "../playground/testcases/state";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported";
import { ensureExcalidrawFontsLoaded } from "../playground/loadExcalidrawFonts";

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
  ...STATE_DIAGRAM_TESTCASES,
  ...UNSUPPORTED_DIAGRAM_TESTCASES,
];

mermaid.initialize({
  ...MERMAID_CONFIG,
  themeVariables: { fontSize: `${DEFAULT_FONT_SIZE}px` },
});

const mermaidOutput = document.getElementById("mermaid-output")!;
const excalidrawOutput = document.getElementById("excalidraw-output")!;
const errorDiv = document.getElementById("error")!;
const SVG_EXPORT_PADDING = 4;
const EXCALIDRAW_SVG_EXPORT_PADDING = 16;

let renderCounter = 0;
let currentRenderGeneration = 0;

const cleanupMermaidTempContainers = () => {
  document
    .querySelectorAll<HTMLDivElement>(".mermaid-to-excalidraw-svg-container")
    .forEach((el) => el.remove());
};

const clearExcalidrawTextMeasureCache = (
  elements: ReadonlyArray<{
    fontSize?: unknown;
    label?: { fontSize?: unknown };
  }>
) => {
  const fontSizes = new Set<number>([DEFAULT_FONT_SIZE]);

  elements.forEach((element) => {
    if (typeof element.fontSize === "number") {
      fontSizes.add(element.fontSize);
    }
    if (typeof element.label?.fontSize === "number") {
      fontSizes.add(element.label.fontSize);
    }
  });

  fontSizes.forEach((fontSize) => {
    charWidth.clearCache(
      getFontString({
        fontSize,
        fontFamily: FONT_FAMILY.Excalifont,
      })
    );
  });
};

const getSvgViewBox = (svg: SVGSVGElement) => {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  const width = Number(svg.getAttribute("width")) || 0;
  const height = Number(svg.getAttribute("height")) || 0;
  return { x: 0, y: 0, width, height };
};

const getSvgContentRects = (
  svg: SVGSVGElement,
  source: "mermaid" | "excalidraw"
) => {
  if (source === "mermaid") {
    return Array.from(
      svg.querySelectorAll<SVGGraphicsElement>(
        "g, path, rect, circle, ellipse, polygon, polyline, line, foreignObject, text"
      )
    )
      .filter((element) => !element.closest("defs"))
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 || rect.height > 0);
  }

  return Array.from(svg.children)
    .filter(
      (element) =>
        element instanceof SVGGraphicsElement &&
        element.tagName !== "metadata" &&
        element.tagName !== "defs" &&
        !(
          element.tagName === "rect" &&
          element.parentElement === svg &&
          element.hasAttribute("fill")
        )
    )
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 || rect.height > 0);
};

const cropSvgToRenderedContent = (
  svg: SVGSVGElement,
  source: "mermaid" | "excalidraw",
  padding = SVG_EXPORT_PADDING
) => {
  const contentRects = getSvgContentRects(svg, source);
  if (contentRects.length === 0) {
    return;
  }

  const svgRect = svg.getBoundingClientRect();
  if (!svgRect.width || !svgRect.height) {
    return;
  }

  const currentViewBox = getSvgViewBox(svg);
  if (!currentViewBox.width || !currentViewBox.height) {
    return;
  }

  const minLeft = Math.min(...contentRects.map((rect) => rect.left));
  const minTop = Math.min(...contentRects.map((rect) => rect.top));
  const maxRight = Math.max(...contentRects.map((rect) => rect.right));
  const maxBottom = Math.max(...contentRects.map((rect) => rect.bottom));

  const scaleX = currentViewBox.width / svgRect.width;
  const scaleY = currentViewBox.height / svgRect.height;

  const nextViewBox = {
    x: currentViewBox.x + (minLeft - svgRect.left) * scaleX - padding,
    y: currentViewBox.y + (minTop - svgRect.top) * scaleY - padding,
    width: (maxRight - minLeft) * scaleX + padding * 2,
    height: (maxBottom - minTop) * scaleY + padding * 2,
  };

  svg.setAttribute(
    "viewBox",
    `${nextViewBox.x} ${nextViewBox.y} ${nextViewBox.width} ${nextViewBox.height}`
  );
  svg.setAttribute("width", `${nextViewBox.width}`);
  svg.setAttribute("height", `${nextViewBox.height}`);
  svg.style.maxWidth = "";
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
      mermaid.render(renderId, testcase.definition, tempContainer)
    );
    tempContainer.remove();
    if (isStale()) {
      return;
    }

    mermaidOutput.innerHTML = mermaidSvg;

    const mRenderedSvg = mermaidOutput.querySelector("svg");
    if (mRenderedSvg) {
      cropSvgToRenderedContent(mRenderedSvg, "mermaid");
    }

    // Render excalidraw SVG
    const parsed = await parseMermaid(testcase.definition);
    if (isStale()) {
      return;
    }

    const { elements, files } = graphToExcalidraw(parsed, {
      fontSize: DEFAULT_FONT_SIZE,
    });
    await ensureExcalidrawFontsLoaded();
    clearExcalidrawTextMeasureCache(elements);
    if (isStale()) {
      return;
    }

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
      exportPadding: EXCALIDRAW_SVG_EXPORT_PADDING,
    });
    if (isStale()) {
      return;
    }

    excalidrawOutput.innerHTML = svgElement.outerHTML;
    const eRenderedSvg = excalidrawOutput.querySelector("svg");
    if (eRenderedSvg) {
      cropSvgToRenderedContent(eRenderedSvg, "excalidraw");
    }

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
        mermaid.render(renderId, tc.definition, tempContainer)
      );
      tempContainer.remove();
      mOut.innerHTML = mermaidSvg;

      const mRenderedSvg = mOut.querySelector("svg");
      if (mRenderedSvg) {
        cropSvgToRenderedContent(mRenderedSvg, "mermaid");
      }

      const parsed = await parseMermaid(tc.definition);
      const { elements, files } = graphToExcalidraw(parsed, {
        fontSize: DEFAULT_FONT_SIZE,
      });
      await ensureExcalidrawFontsLoaded();
      clearExcalidrawTextMeasureCache(elements);
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
        exportPadding: EXCALIDRAW_SVG_EXPORT_PADDING,
      });
      eOut.innerHTML = svgElement.outerHTML;
      const eRenderedSvg = eOut.querySelector("svg");
      if (eRenderedSvg) {
        cropSvgToRenderedContent(eRenderedSvg, "excalidraw");
      }

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

// Keep the visual harness on the same font-loading path as the playground
// preview so text measurement and wrapping stay consistent.
(async () => {
  await ensureExcalidrawFontsLoaded();

  (window as any).__HARNESS_READY__ = true;
})();
