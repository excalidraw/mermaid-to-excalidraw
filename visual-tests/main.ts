import mermaid from "mermaid";
import {
  convertToExcalidrawElements,
  exportToSvg,
  FONT_FAMILY,
  Fonts,
} from "@excalidraw/excalidraw";
import { charWidth } from "@excalidraw/element";
import { getFontString } from "@excalidraw/common";

import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../src/constants";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { parseMermaid, resolveMermaidConfig } from "../src/parseMermaid";
import { runMermaidTaskSequentially } from "../src/mermaidExecutionQueue";
import {
  withLineBreakFallback,
  withMermaidLineBreaks,
} from "../src/mermaidLineBreaks";

import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er";
import { STATE_DIAGRAM_TESTCASES } from "../playground/testcases/state";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported";
import { LINE_BREAK_TESTCASES } from "../playground/testcases/lineBreaks";
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
  ...LINE_BREAK_TESTCASES,
];

// Apply Playwright-mode layout before the harness reports ready, so the first
// render in a page is never measured under the interactive layout.
if (new URLSearchParams(location.search).has("pw")) {
  document.body.classList.add("pw");
}

// Mermaid draws shapes with rough.js, which randomizes curve control points
// unless seeded. Unseeded, every render jitters by sub-pixels, both in the
// Mermaid panel and in the bboxes parseMermaid reads geometry from.
const HARNESS_MERMAID_CONFIG = { ...MERMAID_CONFIG, handDrawnSeed: 1 };

// Must match the config parseMermaid initializes with. Otherwise the Mermaid
// panel of whichever case renders first in a page (before parseMermaid has
// re-initialized Mermaid) is laid out differently from all later cases.
mermaid.initialize(resolveMermaidConfig(HARNESS_MERMAID_CONFIG));

const mermaidOutput = document.getElementById("mermaid-output")!;
const excalidrawOutput = document.getElementById("excalidraw-output")!;
const errorDiv = document.getElementById("error")!;
const SVG_EXPORT_PADDING = 4;
const EXCALIDRAW_SVG_EXPORT_PADDING = 16;
const EXCALIFONT_PROBE_TEXT = "This is the note to the left.";

let renderCounter = 0;
let currentRenderGeneration = 0;

const renderMermaidSvg = async (renderId: string, definition: string) => {
  const tempContainer = document.createElement("div");
  tempContainer.style.cssText =
    "opacity:0;position:fixed;z-index:-1;left:-99999px;top:-99999px;";
  document.body.appendChild(tempContainer);

  try {
    const { svg } = await runMermaidTaskSequentially(() =>
      withLineBreakFallback(definition, (candidate) =>
        withMermaidLineBreaks(candidate, () =>
          mermaid.render(renderId, candidate, tempContainer)
        )
      )
    );
    return svg;
  } finally {
    tempContainer.remove();
  }
};

// Excalifont is split into unicode-range subsets that load lazily. Load the
// subsets a case needs before measuring its text, otherwise glyphs outside the
// preloaded subset are measured with fallback metrics and the layout depends
// on which cases happened to run earlier in the same page.
const loadExcalifontGlyphs = async (
  elements: ReadonlyArray<{
    type?: string;
    text?: unknown;
    label?: { text?: unknown };
  }>
) => {
  const text = elements
    .flatMap((element) => [
      element.type === "text" ? element.text : undefined,
      element.label?.text,
    ])
    .filter((value): value is string => typeof value === "string")
    .join("");

  if (text) {
    await Fonts.loadElementsFonts([
      {
        type: "text",
        fontFamily: FONT_FAMILY.Excalifont,
        originalText: text,
      } as any,
    ]);
  }
};

// `ensureExcalidrawFontsLoaded` gives up silently after a timeout. Rendering
// with fallback metrics would produce plausible but wrong snapshots, so fail
// loudly instead.
const assertExcalifontMetricsActive = () => {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    return;
  }

  const measure = (font: string) => {
    context.font = font;
    return context.measureText(EXCALIFONT_PROBE_TEXT).width;
  };
  const excalifontWidth = measure(
    getFontString({
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: FONT_FAMILY.Excalifont,
    })
  );
  const fallbackWidth = measure(`${DEFAULT_FONT_SIZE}px sans-serif`);

  if (Math.abs(excalifontWidth - fallbackWidth) < 0.5) {
    throw new Error("Excalifont metrics are not active (font failed to load)");
  }
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
  lastElements?: unknown;
  lastSkeleton?: unknown;
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
    (window as any).__LAST_ELEMENTS__ = cached.lastElements;
    (window as any).__LAST_SKELETON__ = cached.lastSkeleton;
    return;
  }

  errorDiv.textContent = "";
  mermaidOutput.innerHTML = "";
  excalidrawOutput.innerHTML = "";

  try {
    // Render mermaid SVG
    const mermaidSvg = await renderMermaidSvg(
      `vt-mermaid-${renderCounter++}`,
      testcase.definition
    );
    if (isStale()) {
      return;
    }

    mermaidOutput.innerHTML = mermaidSvg;

    const mRenderedSvg = mermaidOutput.querySelector("svg");
    if (mRenderedSvg) {
      cropSvgToRenderedContent(mRenderedSvg, "mermaid");
    }

    // Render excalidraw SVG
    const parsed = await parseMermaid(
      testcase.definition,
      HARNESS_MERMAID_CONFIG
    );
    if (isStale()) {
      return;
    }

    const { elements, files } = graphToExcalidraw(parsed, {
      fontSize: DEFAULT_FONT_SIZE,
    });
    await ensureExcalidrawFontsLoaded();
    await loadExcalifontGlyphs(elements);
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
      lastElements: excalidrawElements,
      lastSkeleton: elements,
    });

    // Expose last render's elements for debugging
    (window as any).__LAST_ELEMENTS__ = excalidrawElements;
    (window as any).__LAST_SKELETON__ = elements;
  } catch (err) {
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
      const mermaidSvg = await renderMermaidSvg(
        `vt-all-${renderCounter++}`,
        tc.definition
      );
      mOut.innerHTML = mermaidSvg;

      const mRenderedSvg = mOut.querySelector("svg");
      if (mRenderedSvg) {
        cropSvgToRenderedContent(mRenderedSvg, "mermaid");
      }

      const parsed = await parseMermaid(tc.definition, HARNESS_MERMAID_CONFIG);
      const { elements, files } = graphToExcalidraw(parsed, {
        fontSize: DEFAULT_FONT_SIZE,
      });
      await ensureExcalidrawFontsLoaded();
      await loadExcalifontGlyphs(elements);
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
    } catch (err) {
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
  assertExcalifontMetricsActive();

  (window as any).__HARNESS_READY__ = true;
})().catch((error) => {
  console.error(error);
  (window as any).__HARNESS_ERROR__ = String(error);
});
