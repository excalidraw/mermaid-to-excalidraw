import type {
  ExcalidrawElementSkeleton,
  ValidContainer,
  ValidLinearElement,
} from "@excalidraw/excalidraw/element/transform";
import type { LocalPoint } from "@excalidraw/excalidraw/math/types";

import { GraphConverter } from "../GraphConverter.js";
import {
  DEFAULT_TEXT_COLOR,
  NODE_BACKGROUND_COLOR,
  TITLE_BAND_STROKE_CLEARANCE,
} from "../../constants.js";
import {
  computeExcalidrawVertexLabelStyle,
  computeExcalidrawVertexStyle,
  measureLabelLineWidthAtFontSize,
} from "../helpers.js";
import {
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";

import type { State, StateEdge, StateNode } from "../../interfaces.js";

const point = (x: number, y: number) => [x, y] as LocalPoint;
const DEFAULT_STATE_NODE_LABEL_FONT_SIZE = 16;
const MIN_STATE_NODE_LABEL_FONT_SIZE = 14;
const STATE_NODE_LABEL_FONT_SIZE_STEP = 1;
const DEFAULT_STATE_FILLED_COLOR = "#000000";
const EXCALIDRAW_BOUND_TEXT_PADDING = 5;
const STATE_NODE_LABEL_HORIZONTAL_PADDING = EXCALIDRAW_BOUND_TEXT_PADDING * 2;
const STATE_NODE_LABEL_VERTICAL_PADDING = EXCALIDRAW_BOUND_TEXT_PADDING * 2;
const EXCALIDRAW_LINE_HEIGHT = 1.25;

const STATE_PSEUDO_STATE_SHAPES_WITHOUT_LABEL = new Set<StateNode["shape"]>([
  "choice",
  "fork",
  "join",
  "stateStart",
  "stateEnd",
  "divider",
]);

const getStateEndGroupIds = (node: StateNode) =>
  node.shape === "stateEnd" ? [`state_end_group_${node.id}`] : undefined;

const getNodeText = (node: StateNode) => {
  if (node.shape === "rectWithTitle" && node.description.length) {
    return [node.text, ...node.description].join("\n");
  }

  return node.text;
};

const wrapLabelWord = (word: string, fontSize: number, maxWidth: number) => {
  if (measureLabelLineWidthAtFontSize(word, fontSize) <= maxWidth) {
    return [word];
  }

  const wrappedParts: string[] = [];
  let currentPart = "";

  for (const char of word) {
    const candidatePart = `${currentPart}${char}`;
    if (
      currentPart &&
      measureLabelLineWidthAtFontSize(candidatePart, fontSize) > maxWidth
    ) {
      wrappedParts.push(currentPart);
      currentPart = char;
      continue;
    }

    currentPart = candidatePart;
  }

  if (currentPart) {
    wrappedParts.push(currentPart);
  }

  return wrappedParts;
};

const wrapLabelLine = (line: string, fontSize: number, maxWidth: number) => {
  if (!line.trim()) {
    return line;
  }

  if (measureLabelLineWidthAtFontSize(line, fontSize) <= maxWidth) {
    return line;
  }

  const words = line.split(/\s+/).filter(Boolean);
  const wrappedLines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const wrappedWordParts = wrapLabelWord(word, fontSize, maxWidth);

    for (const [wordPartIndex, wordPart] of wrappedWordParts.entries()) {
      const separator = currentLine ? (wordPartIndex === 0 ? " " : "") : "";
      const candidateLine = currentLine
        ? `${currentLine}${separator}${wordPart}`
        : wordPart;
      if (
        measureLabelLineWidthAtFontSize(candidateLine, fontSize) <= maxWidth
      ) {
        currentLine = candidateLine;
        continue;
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
      currentLine = wordPart;
    }

    if (wrappedWordParts.length > 1) {
      continue;
    }
  }

  wrappedLines.push(currentLine);
  return wrappedLines.join("\n");
};

const getWrappedLabelMetrics = (
  lines: string[],
  fontSize: number,
  availableWidth: number
) => {
  const wrappedText = lines
    .map((line) => wrapLabelLine(line, fontSize, availableWidth))
    .join("\n");
  const wrappedLines = wrappedText.split("\n");
  const width = Math.max(
    ...wrappedLines.map((line) =>
      measureLabelLineWidthAtFontSize(line, fontSize)
    )
  );
  const height = wrappedLines.length * fontSize * EXCALIDRAW_LINE_HEIGHT;

  return {
    width,
    height,
  };
};

const findLargestLabelFontSizeThatFitsBounds = (
  text: string,
  availableWidth: number,
  availableHeight: number,
  fallbackFontSize: number,
  maxFontSize: number
) => {
  const lines = text.split("\n");

  for (
    let fontSize = maxFontSize;
    fontSize >= MIN_STATE_NODE_LABEL_FONT_SIZE;
    fontSize -= STATE_NODE_LABEL_FONT_SIZE_STEP
  ) {
    const { height } = getWrappedLabelMetrics(lines, fontSize, availableWidth);

    if (height <= availableHeight) {
      return fontSize;
    }
  }

  return fallbackFontSize;
};

const getNodeLabelFontSize = (node: StateNode) => {
  const text = getNodeText(node);
  const defaultFontSize = node.fontSize ?? DEFAULT_STATE_NODE_LABEL_FONT_SIZE;
  if (!text || STATE_PSEUDO_STATE_SHAPES_WITHOUT_LABEL.has(node.shape)) {
    return defaultFontSize;
  }

  const availableWidth = Math.max(
    1,
    node.width - STATE_NODE_LABEL_HORIZONTAL_PADDING
  );
  const availableHeight = Math.max(
    1,
    node.height - STATE_NODE_LABEL_VERTICAL_PADDING
  );
  const lines = text.split("\n");

  if (lines.length > 1) {
    const longestLineWidth = Math.max(
      ...lines.map((line) =>
        measureLabelLineWidthAtFontSize(line, defaultFontSize)
      )
    );

    if (longestLineWidth <= availableWidth) {
      return defaultFontSize;
    }
  }

  return findLargestLabelFontSizeThatFitsBounds(
    text,
    availableWidth,
    availableHeight,
    lines.length === 1 ? defaultFontSize : MIN_STATE_NODE_LABEL_FONT_SIZE,
    defaultFontSize
  );
};

const createLabel = (node: StateNode): ValidContainer["label"] | undefined => {
  if (STATE_PSEUDO_STATE_SHAPES_WITHOUT_LABEL.has(node.shape)) {
    return undefined;
  }

  const text = getNodeText(node);
  if (!text) {
    return undefined;
  }

  return {
    text,
    fontSize: getNodeLabelFontSize(node),
    verticalAlign:
      node.shape === "rectWithTitle" || node.shape === "roundedWithTitle"
        ? "top"
        : "middle",
    ...computeExcalidrawVertexLabelStyle(node.labelStyle),
  };
};

const createContainerElement = (
  node: StateNode,
  { withLabel = true }: { withLabel?: boolean } = {}
): ValidContainer => {
  const baseStyle = computeExcalidrawVertexStyle(node.containerStyle);
  const label = withLabel ? createLabel(node) : undefined;
  const elementType =
    node.shape === "choice"
      ? "diamond"
      : node.shape === "stateStart" || node.shape === "stateEnd"
      ? "ellipse"
      : "rectangle";
  const hasRoundedCorners =
    node.shape === "rect" ||
    node.shape === "rectWithTitle" ||
    node.shape === "roundedWithTitle";
  const isFilledStateNode =
    node.shape === "stateStart" ||
    node.shape === "fork" ||
    node.shape === "join";
  // drawn above the transitions (unlike composite states, behind them)
  const isOpaqueStateNode =
    node.shape === "rect" ||
    node.shape === "rectWithTitle" ||
    node.shape === "choice" ||
    node.shape === "note";
  const fillColor =
    baseStyle.backgroundColor ||
    baseStyle.strokeColor ||
    DEFAULT_STATE_FILLED_COLOR;
  const strokeColor =
    baseStyle.strokeColor ||
    baseStyle.backgroundColor ||
    DEFAULT_STATE_FILLED_COLOR;

  return {
    id: node.id,
    type: elementType,
    ...(getStateEndGroupIds(node)
      ? { groupIds: getStateEndGroupIds(node) }
      : {}),
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    ...(label ? { label } : {}),
    ...(isOpaqueStateNode
      ? { backgroundColor: NODE_BACKGROUND_COLOR, fillStyle: "solid" }
      : {}),
    ...baseStyle,
    ...(hasRoundedCorners ? { roundness: { type: 3 } } : {}),
    ...(isFilledStateNode
      ? {
          backgroundColor: fillColor,
          strokeColor,
          fillStyle: "solid",
        }
      : {}),
  };
};

// Excalidraw's corner radius of a rectangle with adaptive roundness
const ADAPTIVE_RADIUS = 32;
const PROPORTIONAL_RADIUS = 0.25;
const getAdaptiveCornerRadius = (width: number, height: number) => {
  const size = Math.min(width, height);
  return size <= ADAPTIVE_RADIUS / PROPORTIONAL_RADIUS
    ? size * PROPORTIONAL_RADIUS
    : ADAPTIVE_RADIUS;
};

/**
 * A composite state's title, on an opaque band (in the composite's fill)
 * above the transitions, which would otherwise cross it: the composite's box
 * is behind them. The band covers the title area between the box's rounded
 * corners.
 */
const createCompositeTitleElement = (
  node: StateNode
): ValidContainer | null => {
  const label = createLabel(node);
  if (!label) {
    return null;
  }
  const baseStyle = computeExcalidrawVertexStyle(node.containerStyle);
  const strokeWidth = baseStyle.strokeWidth ?? 2;
  const fontSize = label.fontSize ?? DEFAULT_STATE_NODE_LABEL_FONT_SIZE;
  const lines: string[] = label.text.split("\n");
  const titleBottom =
    node.dividerLine?.startY ??
    node.y +
      lines.length * fontSize * EXCALIDRAW_LINE_HEIGHT +
      STATE_NODE_LABEL_VERTICAL_PADDING;
  const titleWidth =
    Math.max(
      ...lines.map((line) => measureLabelLineWidthAtFontSize(line, fontSize))
    ) +
    STATE_NODE_LABEL_HORIZONTAL_PADDING +
    // leeway for Excalidraw to fit it without wrapping
    2;
  const width = Math.min(
    node.width - strokeWidth * 2,
    Math.max(
      node.width - getAdaptiveCornerRadius(node.width, node.height) * 2,
      titleWidth
    )
  );

  return {
    id: `${node.id}__title`,
    type: "rectangle",
    x: node.x + (node.width - width) / 2,
    y: node.y + strokeWidth + TITLE_BAND_STROKE_CLEARANCE,
    width,
    height: Math.max(
      1,
      titleBottom - node.y - strokeWidth - TITLE_BAND_STROKE_CLEARANCE
    ),
    label: {
      // in the composite's stroke color (the band, which it'd inherit, has
      // none)
      strokeColor: baseStyle.strokeColor ?? DEFAULT_TEXT_COLOR,
      ...label,
      verticalAlign: "middle",
    },
    strokeColor: "transparent",
    backgroundColor: baseStyle.backgroundColor ?? NODE_BACKGROUND_COLOR,
    fillStyle: "solid",
    // a hand-drawn fill wobbles past its bounds, over the composite's stroke
    roughness: 0,
  };
};

const createDividerLineElement = (
  node: StateNode
): ExcalidrawElementSkeleton | null => {
  if (!node.dividerLine) {
    return null;
  }

  const baseStyle = computeExcalidrawVertexStyle(node.containerStyle);

  return {
    id: `${node.id}__divider`,
    type: "line",
    x: node.dividerLine.startX,
    y: node.dividerLine.startY,
    width: node.dividerLine.endX - node.dividerLine.startX,
    height: node.dividerLine.endY - node.dividerLine.startY,
    points: [
      point(0, 0),
      point(
        node.dividerLine.endX - node.dividerLine.startX,
        node.dividerLine.endY - node.dividerLine.startY
      ),
    ],
    strokeColor: baseStyle.strokeColor || "#000",
    strokeWidth: baseStyle.strokeWidth || 1,
  };
};

const createEndStateInnerEllipse = (node: StateNode): ValidContainer => {
  const outerStyle = computeExcalidrawVertexStyle(node.containerStyle);
  const inset = Math.max(2, Math.min(node.width, node.height) * 0.32);
  const fillColor =
    node.endInnerColor ||
    outerStyle.strokeColor ||
    outerStyle.backgroundColor ||
    DEFAULT_STATE_FILLED_COLOR;

  return {
    id: `${node.id}__inner`,
    type: "ellipse",
    groupIds: getStateEndGroupIds(node),
    x: node.x + inset,
    y: node.y + inset,
    width: Math.max(1, node.width - inset * 2),
    height: Math.max(1, node.height - inset * 2),
    backgroundColor: fillColor,
    strokeColor: fillColor,
    fillStyle: "solid",
    strokeWidth: 1,
  };
};

const createArrowElement = (edge: StateEdge): ValidLinearElement => {
  const points = edge.reflectionPoints.map((currentPoint, index, array) => {
    const startPoint = array[0];
    if (index === 0) {
      return point(0, 0);
    }

    return point(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
  });

  return {
    id: edge.id,
    type: "arrow",
    x: edge.startX,
    y: edge.startY,
    width: edge.endX - edge.startX,
    height: edge.endY - edge.startY,
    points,
    strokeColor: edge.strokeColor || "#000",
    strokeWidth: edge.strokeWidth || 2,
    strokeStyle: edge.strokeStyle || "solid",
    endArrowhead: edge.isNoteEdge ? null : "triangle",
    roundness: { type: 2 },
    start: { id: edge.start },
    end: { id: edge.end },
    ...(edge.text
      ? {
          label: {
            text: edge.text,
            fontSize: 16,
            // Where along the arrow Excalidraw centers the label (where
            // supported)
            ...(edge.labelPosition !== undefined
              ? { labelPosition: edge.labelPosition }
              : {}),
          },
        }
      : {}),
  };
};

export const stateToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: State) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const pushNode = (node: StateNode) => {
      const containerElement = createContainerElement(node);
      elements.push(containerElement);

      const dividerLineElement = createDividerLineElement(node);
      if (dividerLineElement) {
        elements.push(dividerLineElement);
      }

      if (node.shape === "stateEnd") {
        elements.push(createEndStateInnerEllipse(node));
      }
    };
    const nodes = chart.nodes.filter((node) => node.isRenderable);
    const isComposite = (node: StateNode) => node.shape === "roundedWithTitle";

    const composites = nodes.filter(isComposite);

    // composite states behind the transitions, but their titles and the
    // other states above them
    composites.forEach((node) => {
      elements.push(createContainerElement(node, { withLabel: false }));
    });

    chart.lines?.forEach((line) => {
      elements.push(transformToExcalidrawLineSkeleton(line));
    });

    chart.edges.forEach((edge) => {
      elements.push(createArrowElement(edge));
    });

    composites.forEach((node) => {
      const titleElement = createCompositeTitleElement(node);
      if (titleElement) {
        elements.push(titleElement);
      }
      const dividerLineElement = createDividerLineElement(node);
      if (dividerLineElement) {
        elements.push(dividerLineElement);
      }
    });

    nodes.filter((node) => !isComposite(node)).forEach(pushNode);

    chart.texts?.forEach((text) => {
      elements.push(transformToExcalidrawTextSkeleton(text));
    });

    return { elements };
  },
});
