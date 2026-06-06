import { getFontString } from "@excalidraw/common";
import { FONT_FAMILY } from "@excalidraw/excalidraw";

let excalidrawFontsReadyPromise: Promise<void> | null = null;
let fontMeasureContext: CanvasRenderingContext2D | null | undefined;

const EXCALIFONT_PROBE_TEXT = "This is the note to the left.";
const EXCALIFONT_PROBE_SIZE = 18;
const EXCALIFONT_METRICS_WAIT_TIMEOUT_MS = 2000;
const EXCALIFONT_METRICS_POLL_INTERVAL_MS = 16;
const EXCALIFONT_FAMILY = "Excalifont";

const EXCALIFONT_FONT_FACES = [
  {
    filename: "Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2",
    unicodeRange:
      "U+20-7e,U+a0-a3,U+a5-a6,U+a8-ab,U+ad-b1,U+b4,U+b6-b8,U+ba-ff,U+131,U+152-153,U+2bc,U+2c6,U+2da,U+2dc,U+304,U+308,U+2013-2014,U+2018-201a,U+201c-201e,U+2020,U+2022,U+2024-2026,U+2030,U+2039-203a,U+20ac,U+2122,U+2212",
  },
  {
    filename: "Excalifont-Regular-be310b9bcd4f1a43f571c46df7809174.woff2",
    unicodeRange:
      "U+100-130,U+132-137,U+139-149,U+14c-151,U+154-17e,U+192,U+1fc-1ff,U+218-21b,U+237,U+1e80-1e85,U+1ef2-1ef3,U+2113",
  },
  {
    filename: "Excalifont-Regular-b9dcf9d2e50a1eaf42fc664b50a3fd0d.woff2",
    unicodeRange: "U+400-45f,U+490-491,U+2116",
  },
  {
    filename: "Excalifont-Regular-41b173a47b57366892116a575a43e2b6.woff2",
    unicodeRange:
      "U+37e,U+384-38a,U+38c,U+38e-393,U+395-3a1,U+3a3-3a8,U+3aa-3cf,U+3d7",
  },
  {
    filename: "Excalifont-Regular-3f2c5db56cc93c5a6873b1361d730c16.woff2",
    unicodeRange:
      "U+2c7,U+2d8-2d9,U+2db,U+2dd,U+302,U+306-307,U+30a-30c,U+326-328,U+212e,U+2211,U+fb01-fb02",
  },
  {
    filename: "Excalifont-Regular-349fac6ca4700ffec595a7150a0d1e1d.woff2",
    unicodeRange: "U+462-463,U+472-475,U+4d8-4d9,U+4e2-4e3,U+4e6-4e9,U+4ee-4ef",
  },
  {
    filename: "Excalifont-Regular-623ccf21b21ef6b3a0d87738f77eb071.woff2",
    unicodeRange: "U+300-301,U+303",
  },
];

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

const loadExcalifontFaces = async () => {
  const loadedFonts = EXCALIFONT_FONT_FACES.map(
    ({ filename, unicodeRange }) => {
      const fontFace = new FontFace(
        EXCALIFONT_FAMILY,
        `url(/fonts/Excalifont/${filename}) format("woff2")`,
        { unicodeRange }
      );

      document.fonts.add(fontFace);
      return fontFace.load();
    }
  );

  await Promise.all(loadedFonts);
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
    EXCALIFONT_PROBE_TEXT
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
      await loadExcalifontFaces();
      await document.fonts.ready;
      await waitForExcalifontMetrics();
    })();
  }

  return excalidrawFontsReadyPromise;
};
