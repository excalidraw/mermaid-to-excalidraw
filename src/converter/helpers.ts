import type { ExcalidrawTextElement } from "@excalidraw/excalidraw/element/types";
import type { Arrowhead } from "@excalidraw/excalidraw/element/types";
import type { ValidContainer } from "@excalidraw/excalidraw/element/transform";
import {
  DEFAULT_TEXT_COLOR,
  NODE_BACKGROUND_COLOR,
  TITLE_BAND_STROKE_CLEARANCE,
} from "../constants.js";
import {
  ContainerStyle,
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  LabelStyle,
  SubGraph,
  Vertex,
  Edge,
} from "../interfaces.js";
import { ExcalidrawVertexElement } from "../types.js";
import type { Mutable } from "@excalidraw/excalidraw/common/utility-types";
import { removeMarkdown } from "@excalidraw/markdown-to-text";

const removeMarkdownPreservingLineBreaks = (text: string) => {
  let lineBreakPlaceholder = "\uE000";
  while (text.includes(lineBreakPlaceholder)) {
    lineBreakPlaceholder += "\uE000";
  }

  return removeMarkdown(text.replace(/\n/g, lineBreakPlaceholder)).replace(
    new RegExp(lineBreakPlaceholder, "g"),
    "\n"
  );
};

let labelMeasureContext: CanvasRenderingContext2D | null | undefined;

const getLabelMeasureContext = () => {
  if (labelMeasureContext !== undefined) {
    return labelMeasureContext;
  }

  if (typeof document === "undefined") {
    labelMeasureContext = null;
    return labelMeasureContext;
  }

  try {
    labelMeasureContext = document.createElement("canvas").getContext("2d");
  } catch {
    labelMeasureContext = null;
  }
  return labelMeasureContext;
};

/**
 * The width of a line of Excalifont text (estimated when there's no canvas to
 * measure it on)
 */
export const measureLabelLineWidthAtFontSize = (
  line: string,
  fontSize: number
) => {
  const context = getLabelMeasureContext();
  if (!context) {
    return line.length * fontSize * 0.6;
  }

  context.font = `${fontSize}px Excalifont, sans-serif`;
  return context.measureText(line).width;
};

/**
 * Compute groupIds for each element
 */
export interface ArrowType {
  startArrowhead?: Arrowhead | null;
  endArrowhead?: Arrowhead | null;
}
/**
 * Convert mermaid edge type to Excalidraw arrow type
 */
const MERMAID_EDGE_TYPE_MAPPER: { [key: string]: ArrowType } = {
  arrow_circle: {
    endArrowhead: "circle",
  },
  arrow_cross: {
    endArrowhead: "bar",
  },
  arrow_open: {
    endArrowhead: null,
    startArrowhead: null,
  },
  double_arrow_circle: {
    endArrowhead: "circle",
    startArrowhead: "circle",
  },
  double_arrow_cross: {
    endArrowhead: "bar",
    startArrowhead: "bar",
  },
  double_arrow_point: {
    endArrowhead: "arrow",
    startArrowhead: "arrow",
  },
};

export const computeExcalidrawArrowType = (
  mermaidArrowType: string
): ArrowType => {
  return MERMAID_EDGE_TYPE_MAPPER[mermaidArrowType];
};

// Get text from graph elements, fallback markdown to text
export const getText = (element: Vertex | Edge | SubGraph): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    text = removeMarkdownPreservingLineBreaks(text);
  }

  return removeFontAwesomeIcons(text);
};

/**
 * Remove font awesome icons support from text
 */
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};

/**
 * Compute style for vertex
 */
export const computeExcalidrawVertexStyle = (
  style: ContainerStyle
): Partial<Mutable<ExcalidrawVertexElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawVertexElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case CONTAINER_STYLE_PROPERTY.FILL: {
        excalidrawProperty.backgroundColor = style[property];
        excalidrawProperty.fillStyle = "solid";
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH: {
        excalidrawProperty.strokeWidth = Number(
          style[property]?.split("px")[0]
        );
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY: {
        excalidrawProperty.strokeStyle = "dashed";
        break;
      }
    }
  });
  return excalidrawProperty;
};

/**
 * Compute style for label
 */
export const computeExcalidrawVertexLabelStyle = (
  style: LabelStyle
): Partial<Mutable<ExcalidrawTextElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawTextElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case LABEL_STYLE_PROPERTY.COLOR: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
    }
  });
  return excalidrawProperty;
};

const EXCALIDRAW_BOUND_TEXT_PADDING = 5;
const EXCALIDRAW_LINE_HEIGHT = 1.25;
// a title's band, beyond its text, on either side
const TITLE_BAND_PADDING = 8;

/**
 * A box's (subgraph's, namespace's) title, on its top (centered on `centerX`,
 * or on the box), on an opaque band (in the box's fill) above the arrows,
 * which would otherwise cross it: the box is behind them. Only as wide as the
 * title, so arrows entering the box elsewhere stay whole.
 */
export const createTitleBandElement = ({
  id,
  box,
  centerX = box.x + box.width / 2,
  text,
  fontSize,
  containerStyle,
  labelStyle = {},
}: {
  id: string;
  box: { x: number; y: number; width: number };
  centerX?: number;
  text: string;
  fontSize: number;
  containerStyle: Partial<Mutable<ExcalidrawVertexElement>>;
  labelStyle?: Partial<Mutable<ExcalidrawTextElement>>;
}): ValidContainer => {
  const strokeWidth = containerStyle.strokeWidth ?? 2;
  const lines = text.split("\n");
  const width = Math.min(
    box.width - strokeWidth * 2,
    Math.max(
      ...lines.map((line) => measureLabelLineWidthAtFontSize(line, fontSize))
    ) +
      (EXCALIDRAW_BOUND_TEXT_PADDING + TITLE_BAND_PADDING) * 2 +
      // leeway for Excalidraw to fit it without wrapping
      2
  );

  return {
    id,
    type: "rectangle",
    // within the box's stroke
    x: Math.max(
      box.x + strokeWidth,
      Math.min(centerX - width / 2, box.x + box.width - strokeWidth - width)
    ),
    y: box.y + strokeWidth + TITLE_BAND_STROKE_CLEARANCE,
    width: Math.max(1, width),
    height:
      lines.length * fontSize * EXCALIDRAW_LINE_HEIGHT +
      EXCALIDRAW_BOUND_TEXT_PADDING * 2,
    strokeColor: "transparent",
    backgroundColor: containerStyle.backgroundColor ?? NODE_BACKGROUND_COLOR,
    fillStyle: "solid",
    // a hand-drawn fill wobbles past its bounds, over the box's stroke
    roughness: 0,
    label: {
      text,
      fontSize,
      // in the box's stroke color (the band, which it'd inherit, has none)
      strokeColor: containerStyle.strokeColor ?? DEFAULT_TEXT_COLOR,
      ...labelStyle,
    },
  };
};
