import { getFontString } from "@excalidraw/common";
import { FONT_FAMILY, Fonts } from "@excalidraw/excalidraw";

let excalidrawFontsReadyPromise: Promise<void> | null = null;
let fontMeasureContext: CanvasRenderingContext2D | null | undefined;

const EXCALIFONT_PROBE_TEXT = "This is the note to the left.";
const EXCALIFONT_PROBE_SIZE = 18;
const EXCALIFONT_METRICS_WAIT_TIMEOUT_MS = 2000;
const EXCALIFONT_METRICS_POLL_INTERVAL_MS = 16;

const getFontMeasureContext = () => {
  if (fontMeasureContext !== undefined) {
    return fontMeasureContext;
  }

  try {
    fontMeasureContext = document.createElement("canvas").getContext("2d");
  } catch {
    fontMeasureContext = null;
  }

  return fontMeasureContext;
};

const measureTextWidth = (font: string, text: string) => {
  const context = getFontMeasureContext();
  if (!context) {
    return null;
  }

  context.font = font;
  return context.measureText(text).width;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitForExcalifontMetrics = async () => {
  const font = getFontString({
    fontSize: EXCALIFONT_PROBE_SIZE,
    fontFamily: FONT_FAMILY.Excalifont,
  });

  await document.fonts.load(font, EXCALIFONT_PROBE_TEXT);

  const fallbackWidth = measureTextWidth(
    `${EXCALIFONT_PROBE_SIZE}px sans-serif`,
    EXCALIFONT_PROBE_TEXT,
  );

  if (fallbackWidth === null) {
    return;
  }

  const deadline = Date.now() + EXCALIFONT_METRICS_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const excalifontWidth = measureTextWidth(font, EXCALIFONT_PROBE_TEXT);
    if (
      document.fonts.check(font, EXCALIFONT_PROBE_TEXT) &&
      excalifontWidth !== null &&
      Math.abs(excalifontWidth - fallbackWidth) > 0.5
    ) {
      return;
    }

    // `requestAnimationFrame` can stop firing in headless/background tabs,
    // which would wedge Playwright visual runs. Poll on wall-clock time instead.
    await wait(EXCALIFONT_METRICS_POLL_INTERVAL_MS);
  }
};

export const ensureExcalidrawFontsLoaded = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if ((window as any).EXCALIDRAW_ASSET_PATH === undefined) {
    (window as any).EXCALIDRAW_ASSET_PATH = "/";
  }

  if (!excalidrawFontsReadyPromise) {
    excalidrawFontsReadyPromise = (async () => {
      await Fonts.loadElementsFonts([
        {
          type: "text",
          fontFamily: FONT_FAMILY.Excalifont,
          text: "preload",
          originalText: "preload",
        } as any,
      ]);
      await document.fonts.ready;
      await waitForExcalifontMetrics();
    })();
  }

  return excalidrawFontsReadyPromise;
};
