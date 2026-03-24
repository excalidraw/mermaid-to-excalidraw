import type {
  ExcalidrawElementSkeleton,
  ValidContainer,
  ValidLinearElement,
} from "@excalidraw/excalidraw/element/transform";
import type { LocalPoint } from "@excalidraw/excalidraw/math/types";

import { GraphConverter } from "../GraphConverter.js";
import {
  computeExcalidrawVertexLabelStyle,
  computeExcalidrawVertexStyle,
} from "../helpers.js";

import type { State, StateEdge, StateNode } from "../../parser/state.js";

const point = (x: number, y: number) => [x, y] as LocalPoint;
const DEFAULT_STATE_NODE_LABEL_FONT_SIZE = 18;
const MIN_STATE_NODE_LABEL_FONT_SIZE = 14;
const STATE_NODE_LABEL_FONT_SIZE_STEP = 2;
const DEFAULT_STATE_FILLED_COLOR = "#000000";
const STATE_NODE_LABEL_HORIZONTAL_PADDING = 36;

const STATE_PSEUDO_STATE_SHAPES_WITHOUT_LABEL = new Set<StateNode["shape"]>([
  "choice",
  "fork",
  "join",
  "stateStart",
  "stateEnd",
  "divider",
]);

const getNodeText = (node: StateNode) => {
  if (node.shape === "rectWithTitle" && node.description.length) {
    return [node.text, ...node.description].join("\n");
  }

  return node.text;
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

  if (
    typeof navigator !== "undefined" &&
    /jsdom/i.test(navigator.userAgent || "")
  ) {
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

const measureLabelLineWidthAtFontSize = (line: string, fontSize: number) => {
  const context = getLabelMeasureContext();
  if (!context) {
    return line.length * fontSize * 0.6;
  }

  context.font = `${fontSize}px Excalifont, sans-serif`;
  return context.measureText(line).width;
};

const getNodeLabelFontSize = (node: StateNode) => {
  const text = getNodeText(node);
  if (!text || STATE_PSEUDO_STATE_SHAPES_WITHOUT_LABEL.has(node.shape)) {
    return DEFAULT_STATE_NODE_LABEL_FONT_SIZE;
  }

  if (!text.includes("\n")) {
    return DEFAULT_STATE_NODE_LABEL_FONT_SIZE;
  }

  const availableWidth = Math.max(
    1,
    node.width - STATE_NODE_LABEL_HORIZONTAL_PADDING
  );
  const lines = text.split("\n");

  for (
    let fontSize = DEFAULT_STATE_NODE_LABEL_FONT_SIZE;
    fontSize >= MIN_STATE_NODE_LABEL_FONT_SIZE;
    fontSize -= STATE_NODE_LABEL_FONT_SIZE_STEP
  ) {
    const longestLineWidth = Math.max(
      ...lines.map((line) => measureLabelLineWidthAtFontSize(line, fontSize))
    );

    if (longestLineWidth <= availableWidth) {
      return fontSize;
    }
  }

  return MIN_STATE_NODE_LABEL_FONT_SIZE;
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

const createContainerElement = (node: StateNode): ValidContainer => {
  const baseStyle = computeExcalidrawVertexStyle(node.containerStyle);
  const label = createLabel(node);
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
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    ...(label ? { label } : {}),
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
          },
        }
      : {}),
  };
};

export const stateToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: State) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    chart.nodes.forEach((node) => {
      if (!node.isRenderable) {
        return;
      }

      const containerElement = createContainerElement(node);
      elements.push(containerElement);

      const dividerLineElement = createDividerLineElement(node);
      if (dividerLineElement) {
        elements.push(dividerLineElement);
      }

      if (node.shape === "stateEnd") {
        elements.push(createEndStateInnerEllipse(node));
      }
    });

    chart.edges.forEach((edge) => {
      elements.push(createArrowElement(edge));
    });

    return { elements };
  },
});
