// "pele/lazy" loads each diagram type's code on first use ("pele" bundles all
// of them). Don't import from "pele" too: its copy of Pele doesn't share state
// (registered diagram types, `PeleError`, cached text widths) with this one.
import {
  detectType,
  load,
  parse,
  render,
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
  Gantt,
  QuadrantChart,
  Timeline,
  type MermaidConfig,
} from "../interfaces.js";
import { withLineBreakFallback } from "../text.js";
import { parsePeleFlowchart } from "./flowchart.js";
import { parsePeleSequence } from "./sequence.js";
import { parsePeleClass } from "./class.js";
import { parsePeleERD } from "./er.js";
import { parsePeleState } from "./state.js";
import { hasOverlappingTasks, parsePeleGantt } from "./gantt.js";
import { countOverlaps, parsePeleQuadrant } from "./quadrant.js";
import { parsePeleTimeline } from "./timeline.js";
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
  /**
   * Pele's flowchart curve, which it steps state diagrams by too: "step"
   * draws their edges as elbow arrows.
   * @default "linear"
   */
  curve?: string;
  /** Overrides `curve` where set (see `MermaidConfig.elbow`). */
  elbow?: MermaidConfig["elbow"];
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

// Diagrams' own config (front matter, `%%{init}%%`) takes precedence: any key
// of a section replaces the whole section here. No `quadrantChart` section, as
// busy quadrant charts are laid out bigger by a directive (`withQuadrantSize`),
// which would drop it.
const getPeleConfig = (config: PeleConfig) => ({
  flowchart: {
    curve: config.curve ?? "linear",
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
  "gantt",
  "quadrantChart",
  "timeline",
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

const detectDiagramType = (definition: string) => {
  try {
    return detectType(definition);
  } catch {
    // `parse` throws it
    return null;
  }
};

/**
 * `config` with its `elbow` resolved to the curve Pele lays `definition`'s
 * diagram type out with: Pele steps flowcharts and state diagrams by the
 * flowchart curve.
 */
const resolveElbow = (definition: string, config: PeleConfig): PeleConfig => {
  const type = detectDiagramType(definition);
  const elbow =
    typeof config.elbow === "object"
      ? type === "flowchart" || type === "state"
        ? config.elbow[type]
        : undefined
      : config.elbow;
  const curve = elbow === undefined ? config.curve : elbow ? "step" : undefined;
  return { ...config, curve, elbow: undefined };
};

const getParseOptions = (config: PeleConfig) => ({
  limit: config.maxTextSize ?? MERMAID_CONFIG.maxTextSize,
  maxEdges: config.maxEdges ?? MERMAID_CONFIG.maxEdges,
  config: getPeleConfig(config),
});

/** The model, and the definition it was parsed from (see `withLineBreakFallback`). */
const parsePeleModel = async (definition: string, config: PeleConfig) => {
  // Loads the code Pele parses and renders the diagram type with
  await load(detectDiagramType(definition));
  return withLineBreakFallback(definition, async (candidate) => ({
    model: parse(candidate, getParseOptions(config)),
    parsedDefinition: candidate,
  }));
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
 * Lays a Gantt chart out, and reads it from its SVG. `displayMode: compact`
 * packs tasks into rows by their bars alone, so names drawn next to short bars
 * run into the bars and names after them: such charts are laid out with a row
 * per task instead.
 */
const layOutGantt = (
  model: Extract<ParsedDiagramModel, { type: "gantt" }>,
  config: PeleConfig
) => {
  const layOut = () => {
    const { svg } = render(model, getModelRenderOptions(model, config));
    const chart = parsePeleGantt(parseSvg(svg), {
      fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
    });
    return { svg, chart };
  };
  const compact = layOut();
  if (model.displayMode !== "compact" || !hasOverlappingTasks(compact.chart)) {
    return compact;
  }
  model.displayMode = "";
  return layOut();
};

// The scales a busy quadrant chart is laid out again at, in turn, while its
// points' names run into each other (or into points, or quadrants' names)
const QUADRANT_SCALES = [1.25, 1.5, 1.75, 2];

/**
 * The definition with a directive setting the chart's size before its
 * `quadrantChart` line: after its own config (front matter, directives), which
 * Pele merges it with, so that it wins (a caller's config doesn't, as a
 * definition's own `quadrantChart` config replaces it).
 */
const withQuadrantSize = (
  definition: string,
  chartWidth: number,
  chartHeight: number
) =>
  definition.replace(
    // (not the `quadrantChart:` key of front matter config)
    /^[ \t]*quadrantChart\b(?![ \t]*:)/m,
    (line) =>
      `%%{init: ${JSON.stringify({
        quadrantChart: { chartWidth, chartHeight },
      })}}%%\n${line}`
  );

/**
 * Lays a quadrant chart out, and reads it from its SVG. Pele places points'
 * names where they don't run into anything, but in busy charts it doesn't
 * always find room, and places them over whatever is there: such charts are
 * laid out bigger (the points spread out, their names don't grow), at the
 * smallest size without overlaps, or else with the fewest.
 */
const layOutQuadrant = (
  model: Extract<ParsedDiagramModel, { type: "quadrantChart" }>,
  parsedDefinition: string,
  config: PeleConfig
) => {
  const fontSize = config.fontSize ?? DEFAULT_FONT_SIZE;
  const layOut = (model: ParsedDiagramModel) => {
    const { svg, width, height } = render(
      model,
      getModelRenderOptions(model, config)
    );
    const chart = parsePeleQuadrant(parseSvg(svg), { fontSize });
    return {
      svg,
      width,
      height,
      chart,
      overlaps: countOverlaps(chart, measureExcalifontText),
    };
  };
  let best = layOut(model);
  const { width, height } = best;
  for (const scale of QUADRANT_SCALES) {
    if (best.overlaps === 0) {
      break;
    }
    let scaled;
    try {
      scaled = layOut(
        parse(
          withQuadrantSize(
            parsedDefinition,
            Math.round(width * scale),
            Math.round(height * scale)
          ),
          getParseOptions(config)
        )
      );
    } catch (error) {
      console.error("Error laying out a quadrant chart bigger:", error);
      break;
    }
    if (scaled.overlaps < best.overlaps) {
      best = scaled;
    }
  }
  return best;
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
  config = resolveElbow(definition, config);
  const { model, parsedDefinition } = await parsePeleModel(definition, config);
  if (model.type === "gantt") {
    return layOutGantt(model, config).svg;
  }
  if (model.type === "quadrantChart") {
    return layOutQuadrant(model, parsedDefinition, config).svg;
  }
  return render(model, getModelRenderOptions(model, config)).svg;
};

// Edges that Pele draws with a bend, so stepped with rounded corners, between
// nodes whose ids a definition's own are unlikely to clash with
const PROBE_ID = "peleStepProbe";
const STEP_PROBE = `${PROBE_ID}A --> ${PROBE_ID}B\n${PROBE_ID}A --> ${PROBE_ID}C`;

/**
 * Whether Pele steps a flowchart's edges (or a state diagram's transitions) by
 * its config: by the caller's `config`, unless the definition's front matter
 * or directives set the curve, or replace the caller's whole `flowchart`
 * config. Pele doesn't tell which curve it used, and draws straight edges the
 * same with any curve, so it's asked to draw the definition with probe edges
 * with a bend appended: it reads and merges the configs as it does for the
 * definition alone. As costly as laying the definition out again, so for when
 * its drawing doesn't tell. Needs its diagram type loaded, and the definition
 * as Pele parsed it (e.g. after `withLineBreakFallback`).
 */
export const isSteppedDefinition = (
  definition: string,
  config?: RenderOptions["config"]
) => {
  try {
    const model = parse(`${definition}\n${STEP_PROBE}\n`, {
      config,
      limit: Infinity,
      maxEdges: Infinity,
    });
    const { svg } = render(model, {
      config,
      responsive: false,
      autoDirection: false,
    });
    return Array.from(
      svg.matchAll(
        /class="pele-edge[^"]*"[^>]*data-id="([^"]*)"[^>]*><path d="([^"]*)"/g
      )
    ).some(
      ([, id, path]) =>
        // (a flowchart's other edges may have their own curve)
        (model.type !== "flowchart" || id.includes(PROBE_ID)) && /q/i.test(path)
    );
  } catch {
    // (e.g. a definition Pele can't parse either)
    return false;
  }
};

/**
 * Parses a Mermaid definition with Pele, a Mermaid renderer that lays diagrams
 * out without a DOM.
 *
 * Flowcharts, sequence, class, ER and state diagrams, Gantt charts, quadrant
 * charts and timelines are converted to Excalidraw elements; other diagram
 * types are returned as an image.
 */
export const parsePele = async (
  definition: string,
  config: PeleConfig = {}
): Promise<
  | Flowchart
  | Sequence
  | Class
  | ERD
  | State
  | Gantt
  | QuadrantChart
  | Timeline
  | GraphImage
> => {
  config = resolveElbow(definition, config);
  const { model, parsedDefinition } = await parsePeleModel(definition, config);

  try {
    switch (model.type) {
      case "flowchart": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        const fontSize = config.fontSize ?? DEFAULT_FONT_SIZE;
        return parsePeleFlowchart(model, parseSvg(svg), {
          fontSize,
          measureText: (text) => measureExcalifontText(text, fontSize),
          stepped: () =>
            isSteppedDefinition(parsedDefinition, getPeleConfig(config)),
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
          stepped: () =>
            isSteppedDefinition(parsedDefinition, getPeleConfig(config)),
        });
      }
      case "gantt": {
        return layOutGantt(model, config).chart;
      }
      case "quadrantChart": {
        return layOutQuadrant(model, parsedDefinition, config).chart;
      }
      case "timeline": {
        const { svg } = render(model, getModelRenderOptions(model, config));
        return parsePeleTimeline(parseSvg(svg), {
          fontSize: config.fontSize ?? DEFAULT_FONT_SIZE,
        });
      }
    }
  } catch (error) {
    console.error("Error processing Pele diagram:", error);
  }

  return renderGraphImage(model, config);
};
