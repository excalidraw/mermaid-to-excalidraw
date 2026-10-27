import {
  parse,
  PeleError,
  render,
  type ParsedDiagramModel,
  type RenderOptions,
} from "pele";

import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../constants.js";
import {
  GraphImage,
  Flowchart,
  Sequence,
  Class,
  ERD,
  State,
} from "../interfaces.js";
import { withLineBreakFallback } from "../text.js";
import { parsePeleFlowchart } from "./flowchart.js";
import { parsePeleSequence } from "./sequence.js";
import { parsePeleClass } from "./class.js";
import { parsePeleERD } from "./er.js";
import { parsePeleState } from "./state.js";
import { parseSvg, svgToDataURL } from "./svg.js";

/**
 * The font family Excalidraw draws Excalifont (its default font) with. Pele
 * measures labels with it, so nodes are sized for the text Excalidraw puts in
 * them. Falls back to a generic font if Excalifont isn't loaded.
 */
const EXCALIFONT_FONT_FAMILY =
  "Excalifont, Xiaolai, sans-serif, Segoe UI Emoji";

export interface PeleConfig {
  fontSize?: number;
  maxEdges?: number;
  /** Maximum number of characters in the definition. */
  maxTextSize?: number;
  curve?: string;
}

let canvasContext:
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D
  | null
  | undefined;

/** Measures text with Excalifont, like Pele does (if there's a canvas). */
const measureExcalifontText = (text: string, fontSize: number) => {
  if (canvasContext === undefined) {
    try {
      canvasContext =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(1, 1).getContext("2d")
          : typeof document !== "undefined"
          ? document.createElement("canvas").getContext("2d")
          : null;
    } catch {
      canvasContext = null;
    }
  }
  if (!canvasContext) {
    return null;
  }
  canvasContext.font = `${fontSize}px ${EXCALIFONT_FONT_FAMILY}`;
  return canvasContext.measureText(text).width;
};

// Excalidraw draws shapes with heavier, hand-drawn strokes and bigger
// arrowheads than Pele does, so the space Pele leaves between them is scaled
// up (Pele's defaults, per diagram type, times this).
const SPACING_SCALE = 1.5;

const spacing = (nodeSpacing: number, rankSpacing: number) => ({
  nodeSpacing: nodeSpacing * SPACING_SCALE,
  rankSpacing: rankSpacing * SPACING_SCALE,
});

// Diagrams' own config (front matter, `%%{init}%%`) takes precedence
const getPeleConfig = (config: PeleConfig) => ({
  flowchart: {
    curve: config.curve ?? MERMAID_CONFIG.flowchart.curve,
    ...spacing(40, 48),
  },
  class: spacing(40, 56),
  er: spacing(48, 64),
  state: spacing(40, 44),
  sequence: {
    // The minimum space between lifelines, and between messages
    actorMargin: 40 * SPACING_SCALE,
    messageMargin: 35 * SPACING_SCALE,
  },
});

const getRenderOptions = (config: PeleConfig): RenderOptions => ({
  fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
  // Lay diagrams out at their natural size and direction, instead of adapting
  // them to the width of a container.
  responsive: false,
  autoDirection: false,
  config: getPeleConfig(config),
});

/** Diagram types converted to Excalidraw elements (others become images). */
const CONVERTED_DIAGRAM_TYPES = new Set<ParsedDiagramModel["type"]>([
  "flowchart",
  "sequence",
  "class",
  "er",
  "state",
]);

// Converted diagrams are measured with Excalifont, the font their labels are
// drawn with in Excalidraw.
const getModelRenderOptions = (
  model: ParsedDiagramModel,
  config: PeleConfig
): RenderOptions =>
  CONVERTED_DIAGRAM_TYPES.has(model.type)
    ? { ...getRenderOptions(config), fontFamily: EXCALIFONT_FONT_FAMILY }
    : getRenderOptions(config);

/**
 * Pele reports syntax errors at the end of a definition (e.g. a missing `end`)
 * on the line after its last one, with an empty excerpt. They're moved to the
 * end of its last non-empty line instead, as Mermaid reports them: that's the
 * line Excalidraw highlights, shows and tries fixing.
 *
 * Lines are numbered as Pele (and Mermaid) parse them, i.e. without e.g. the
 * comments before them, but trailing (blank) lines are always kept.
 */
export const pointEndOfInputErrorAtLastLine = (
  error: unknown,
  definition: string
) => {
  if (
    !(error instanceof PeleError) ||
    error.code !== "syntax" ||
    // not at the end
    error.snippet.split("\n")[0].trim()
  ) {
    return error;
  }
  const lines = definition.split(/\r?\n/);
  let lastIndex = lines.length - 1;
  while (lastIndex >= 0 && !lines[lastIndex].trim()) {
    lastIndex--;
  }
  const line = error.line - 1 - (lines.length - 1 - lastIndex);
  if (lastIndex < 0 || line < 1) {
    return error;
  }

  const lastLine = lines[lastIndex];
  const snippet = `${lastLine}\n${"-".repeat(lastLine.length)}^`;
  error.message = error.message
    .replace(`on line ${error.line}`, `on line ${line}`)
    .replace(error.snippet, snippet);
  error.line = line;
  error.column = lastLine.length + 1;
  error.snippet = snippet;
  return error;
};

const parsePeleModel = async (definition: string, config: PeleConfig) => {
  try {
    return await withLineBreakFallback(definition, async (candidate) =>
      parse(candidate, {
        limit: config.maxTextSize ?? MERMAID_CONFIG.maxTextSize,
        maxEdges: config.maxEdges ?? MERMAID_CONFIG.maxEdges,
        config: getPeleConfig(config),
      })
    );
  } catch (error) {
    throw pointEndOfInputErrorAtLastLine(error, definition);
  }
};

const renderGraphImage = (
  model: ParsedDiagramModel,
  config: PeleConfig
): GraphImage => {
  // Measured with Pele's default font, which the image is drawn with
  const { svg, width, height } = render(model, getRenderOptions(config));

  return {
    type: "graphImage",
    mimeType: "image/svg+xml",
    dataURL: svgToDataURL(svg),
    width,
    height,
  };
};

/**
 * Renders a Mermaid definition to the SVG `parsePele` reads it from (or, for
 * diagram types it doesn't convert, returns as an image), e.g. to compare it
 * with the conversion.
 */
export const renderPeleSvg = async (
  definition: string,
  config: PeleConfig = {}
) => {
  const model = await parsePeleModel(definition, config);
  return render(model, getModelRenderOptions(model, config)).svg;
};

/**
 * Parses a Mermaid definition with Pele, a Mermaid renderer that lays diagrams
 * out without a DOM.
 *
 * Flowcharts, sequence, class, ER and state diagrams are converted to
 * Excalidraw elements; other diagram types are returned as an image.
 */
export const parsePele = async (
  definition: string,
  config: PeleConfig = {}
): Promise<Flowchart | Sequence | Class | ERD | State | GraphImage> => {
  const model = await parsePeleModel(definition, config);

  try {
    switch (model.type) {
      case "flowchart": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        const fontSize = config.fontSize ?? DEFAULT_FONT_SIZE;
        return parsePeleFlowchart(model, parseSvg(svg), {
          fontSize,
          measureText: (text) => measureExcalifontText(text, fontSize),
        });
      }
      case "sequence": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        return parsePeleSequence(model, parseSvg(svg), {
          fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
          measureText: measureExcalifontText,
        });
      }
      case "class": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        return parsePeleClass(model, parseSvg(svg), {
          fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
        });
      }
      case "er": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        return parsePeleERD(model, parseSvg(svg), {
          fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
        });
      }
      case "state": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        return parsePeleState(model, parseSvg(svg), {
          fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
        });
      }
    }
  } catch (error) {
    console.error("Error processing Pele diagram:", error);
  }

  return renderGraphImage(model, config);
};
