import type { StateModel } from "pele";

import type { Line, Text } from "../elementSkeleton.js";
import {
  ContainerStyle,
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  LabelStyle,
  Position,
} from "../interfaces.js";
import type { State, StateEdge, StateNode } from "../parser/state.js";
import { hasClass, pathToLines, readEdge, toText } from "./elements.js";
import {
  Bounds,
  evenOutRoute,
  getElementsByDataId,
  getRoutePosition,
  getFontSize,
  getShapeBounds,
  getStyleColor,
  getStyleValue,
  getTextLines,
} from "./svg.js";

export interface PeleStateOptions {
  fontSize: number;
}

// Pele's node classes, and the Mermaid state shapes they're drawn as
const NODE_SHAPES: Array<[string, StateNode["shape"]]> = [
  ["pele-state-start", "stateStart"],
  ["pele-state-end", "stateEnd"],
  ["pele-state-choice", "choice"],
  ["pele-state-fork", "fork"],
  ["pele-state-join", "join"],
  ["pele-note", "note"],
];

const getContainerStyle = (shape: Element | null) => {
  const style: ContainerStyle = {};
  const fill = getStyleColor(shape, "fill");
  const stroke = getStyleColor(shape, "stroke");
  const strokeWidth = getStyleValue(shape, "stroke-width");
  const dashArray = getStyleValue(shape, "stroke-dasharray");
  if (fill) {
    style[CONTAINER_STYLE_PROPERTY.FILL] = fill;
  }
  if (stroke) {
    style[CONTAINER_STYLE_PROPERTY.STROKE] = stroke;
  }
  if (strokeWidth) {
    style[CONTAINER_STYLE_PROPERTY.STROKE_WIDTH] = strokeWidth;
  }
  if (dashArray) {
    style[CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY] = dashArray;
  }
  return style;
};

const getLabelStyle = (label: Element | null) => {
  const style: LabelStyle = {};
  // SVG text is colored with `fill`
  const color = getStyleColor(label, "fill");
  if (color) {
    style[LABEL_STYLE_PROPERTY.COLOR] = color;
  }
  return style;
};

/** A divider drawn as a single horizontal path, e.g. below a title. */
const getDividerLine = (group: Element, root: Element) => {
  const divider = Array.from(group.children).find(
    (child) =>
      child.tagName.toLowerCase() === "path" &&
      !child.getAttribute("class") &&
      child.getAttribute("fill") === "none"
  );
  const [line] = divider ? pathToLines(divider, root) : [];
  return line
    ? {
        startX: line.startX,
        startY: line.startY,
        endX: line.endX,
        endY: line.endY,
      }
    : undefined;
};

const parseNode = (
  group: Element,
  root: Element,
  isComposite: boolean,
  fontSize: number
): StateNode | undefined => {
  const id = group.getAttribute("data-id");
  const shapeElement = group.querySelector("rect, circle, polygon, path");
  // An end state is a ring around a dot: its bounds are the ring's
  const bounds = getShapeBounds(group, root);
  if (id === null || !bounds) {
    return undefined;
  }

  const description = group.querySelectorAll(".pele-state-description");
  const shape: StateNode["shape"] = isComposite
    ? "roundedWithTitle"
    : NODE_SHAPES.find(([className]) => hasClass(group, className))?.[1] ??
      (description.length ? "rectWithTitle" : "rect");
  const label = group.querySelector(".pele-label, .pele-cluster-label");

  return {
    fontSize: label ? getFontSize(label, root, fontSize) : fontSize,
    id,
    shape,
    text: getTextLines(label).join("\n"),
    description: Array.from(description).flatMap(getTextLines),
    ...bounds,
    containerStyle: getContainerStyle(shapeElement),
    labelStyle: getLabelStyle(label),
    dividerLine:
      shape === "rectWithTitle" || shape === "roundedWithTitle"
        ? getDividerLine(group, root)
        : undefined,
    isRenderable: true,
  };
};

// How far a point is from a node's outline (inside or out)
const getDistanceToOutline = (point: Position, bounds: Bounds) => {
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;
  const isInside =
    point.x >= bounds.x &&
    point.x <= right &&
    point.y >= bounds.y &&
    point.y <= bottom;
  return isInside
    ? Math.min(
        point.x - bounds.x,
        right - point.x,
        point.y - bounds.y,
        bottom - point.y
      )
    : Math.hypot(
        Math.max(bounds.x - point.x, 0, point.x - right),
        Math.max(bounds.y - point.y, 0, point.y - bottom)
      );
};

/** The node whose outline a transition's end touches (the smallest, if many). */
const findNodeAt = (point: Position, nodes: StateNode[]) =>
  nodes.reduce<{ node: StateNode; distance: number } | undefined>(
    (closest, node) => {
      const distance = getDistanceToOutline(point, node);
      return !closest ||
        distance < closest.distance - 0.5 ||
        (distance < closest.distance + 0.5 &&
          node.width * node.height < closest.node.width * closest.node.height)
        ? { node, distance }
        : closest;
    },
    undefined
  )?.node;

/**
 * Reads a state diagram from the SVG Pele rendered it to: states, composite
 * states, notes, and the transitions between them (whose ends are found from
 * where they're drawn, as Pele's model doesn't list the transitions of
 * composite states).
 */
export const parsePeleState = (
  _model: StateModel,
  root: Element,
  options: PeleStateOptions
): State => {
  const composites = Array.from(
    root.querySelectorAll("g.pele-cluster.pele-state-composite[data-id]")
  ).flatMap((group) => parseNode(group, root, true, options.fontSize) ?? []);
  const nodes = Array.from(
    root.querySelectorAll(
      "g.pele-nodes > g.pele-node[data-id], g.pele-nodes > g.pele-note[data-id]"
    )
  ).flatMap((group) => parseNode(group, root, false, options.fontSize) ?? []);
  // Composites first, behind their states
  const allNodes = [...composites, ...nodes];

  const labels = getElementsByDataId(root, "g.pele-edge-label[data-id]");
  const texts: Text[] = [];
  const edges = Array.from(
    root.querySelectorAll("g.pele-edges > g.pele-edge[data-id]")
  ).flatMap((group): StateEdge[] => {
    const id = group.getAttribute("data-id")!;
    const edge = readEdge(group, root);
    if (!edge || edge.route.length < 2) {
      return [];
    }
    const { route } = edge;
    const start = findNodeAt(route[0], allNodes);
    const end = findNodeAt(route[route.length - 1], allNodes);
    if (!start || !end) {
      return [];
    }

    const label = labels.get(id)?.querySelector("text");
    // A self-transition is a small loop, which its label would cover: the
    // label is put next to it, where Pele drew it, instead.
    const isSelfTransition = start === end;
    if (label && isSelfTransition) {
      texts.push(toText(label, root, options.fontSize));
    }
    const isNoteEdge = hasClass(group, "pele-note-edge");
    const first = route[0];
    const last = route[route.length - 1];
    const labelBounds =
      label && !isSelfTransition ? getShapeBounds(labels.get(id)!, root) : null;

    return [
      {
        id,
        start: start.id,
        end: end.id,
        text: label && !isSelfTransition ? getTextLines(label).join("\n") : "",
        startX: first.x,
        startY: first.y,
        endX: last.x,
        endY: last.y,
        reflectionPoints: evenOutRoute(route),
        strokeColor: getStyleColor(group, "stroke"),
        strokeStyle: isNoteEdge ? "dashed" : undefined,
        isNoteEdge,
        ...(labelBounds
          ? {
              labelPosition: getRoutePosition(route, {
                x: labelBounds.x + labelBounds.width / 2,
                y: labelBounds.y + labelBounds.height / 2,
              }),
            }
          : {}),
      },
    ];
  });

  // The separators between concurrent regions of a composite state
  const lines: Line[] = Array.from(
    root.querySelectorAll("path.pele-divider")
  ).flatMap((divider) => pathToLines(divider, root, { strokeStyle: "dashed" }));

  return { type: "state", nodes: allNodes, edges, lines, texts };
};
