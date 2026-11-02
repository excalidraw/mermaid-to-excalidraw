// "pele/lazy" loads each diagram type's code on first use ("pele" bundles all
// of them). Don't import from "pele" too: its copy of Pele doesn't share state
// (registered diagram types, `PeleError`, cached text widths) with this one.
import {
  detectType,
  load,
  parse,
  render,
  type DiagramType,
  type ParsedDiagramModel,
  type RenderOptions,
} from "pele/lazy";

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

/** Loads the code Pele parses and renders `definition`'s diagram type with. */
const loadDiagramType = async (definition: string) => {
  let type: DiagramType | null = null;
  try {
    type = detectType(definition);
  } catch {
    // `parse` throws it
  }
  await load(type);
};

const parsePeleModel = async (definition: string, config: PeleConfig) => {
  await loadDiagramType(definition);
  return withLineBreakFallback(definition, async (candidate) =>
    parse(candidate, {
      limit: config.maxTextSize ?? MERMAID_CONFIG.maxTextSize,
      maxEdges: config.maxEdges ?? MERMAID_CONFIG.maxEdges,
      config: getPeleConfig(config),
    })
  );
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

type FlowchartSection = { curve?: string };

// A config directive. Pele reads them wherever they are (in comments too).
const DIRECTIVE = /%%\{\s*init(?:ialize)?\s*:([\s\S]*?)\}%%/g;

const CURVE = /["']?\bcurve["']?\s*:\s*["']?([A-Za-z]+)/;

/** A directive's `flowchart` config (just its curve). */
const readDirectiveFlowchart = (
  directive: string
): FlowchartSection | undefined => {
  try {
    const flowchart = JSON.parse(directive.replace(/'/g, '"'))?.flowchart;
    return flowchart && typeof flowchart === "object"
      ? {
          curve:
            typeof flowchart.curve === "string" ? flowchart.curve : undefined,
        }
      : undefined;
  } catch {
    // e.g. unquoted keys
    return /["']?\bflowchart["']?\s*:/.test(directive)
      ? { curve: directive.match(CURVE)?.[1] }
      : undefined;
  }
};

/**
 * The front matter's `config.flowchart` (just its curve), read as a YAML block
 * mapping, by indentation, without its comments.
 */
const readFrontMatterFlowchart = (
  definition: string
): FlowchartSection | undefined => {
  const yaml = definition.match(
    /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/
  )?.[1];
  if (yaml === undefined) {
    return undefined;
  }
  let flowchart: FlowchartSection | undefined;
  const path: { indent: number; key: string }[] = [];
  for (const line of yaml.split(/\r?\n/)) {
    const match = line
      .replace(/(^|\s)#.*$/, "")
      .match(/^(\s*)["']?([\w-]+)["']?\s*:\s*(.*?)\s*$/);
    if (!match) {
      continue;
    }
    const [, space, key, value] = match;
    while (path.length && path[path.length - 1].indent >= space.length) {
      path.pop();
    }
    const keys = [...path.map((entry) => entry.key), key].join(".");
    if (keys === "config.flowchart") {
      // (or inline: `flowchart: { curve: step }`)
      flowchart = { curve: value.match(CURVE)?.[1] };
    } else if (keys === "config.flowchart.curve" && flowchart) {
      flowchart.curve = value.replace(/^["']|["']$/g, "") || undefined;
    }
    path.push({ indent: space.length, key });
  }
  return flowchart;
};

/**
 * The curve Pele draws a definition's flowchart edges (and state transitions)
 * with, as it merges configs: the definition's own `flowchart` config, its
 * directives (the last one first) over its front matter, or else `curve`, the
 * caller's. A definition's `flowchart` config replaces the caller's whole.
 * Pele doesn't tell which it used (and draws straight edges the same with any
 * curve).
 */
export const getFlowchartCurve = (
  definition: string,
  curve: string | undefined
) => {
  const sections = [
    readFrontMatterFlowchart(definition),
    ...Array.from(definition.matchAll(DIRECTIVE), ([, directive]) =>
      readDirectiveFlowchart(directive)
    ),
  ].filter((section): section is FlowchartSection => !!section);
  return sections.length
    ? sections.reduce<string | undefined>(
        (resolved, section) => section.curve ?? resolved,
        undefined
      )
    : curve;
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
  // (the default curve isn't stepped)
  const curve = getFlowchartCurve(definition, config.curve);

  try {
    switch (model.type) {
      case "flowchart": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        const fontSize = config.fontSize ?? DEFAULT_FONT_SIZE;
        return parsePeleFlowchart(model, parseSvg(svg), {
          fontSize,
          measureText: (text) => measureExcalifontText(text, fontSize),
          curve,
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
          curve,
        });
      }
    }
  } catch (error) {
    console.error("Error processing Pele diagram:", error);
  }

  return renderGraphImage(model, config);
};
