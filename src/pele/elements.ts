import type { Arrow, Line, Text } from "../elementSkeleton.js";
import type { Position } from "../interfaces.js";
import {
  Bounds,
  extendRouteToMarkers,
  getOffset,
  getPathRoute,
  getRouteMarkers,
  getRoutePosition,
  getShapeBounds,
  getStyleColor,
  getTextBlock,
  getTextLines,
  parsePath,
  simplifyRoute,
} from "./svg.js";

// Builds the converters' elements from the parts of Pele's SVG that all
// diagram types share.

/**
 * A label's text, broken into lines where Pele wrapped it: Pele sizes shapes
 * for the lines it wraps labels into, which Excalidraw would wrap elsewhere
 * (or not at all).
 */
export const withPeleLineBreaks = (text: string, label: Element | null) => {
  const lines = getTextLines(label);
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  return lines.length > text.split("\n").length &&
    normalize(lines.join(" ")) === normalize(text)
    ? lines.join("\n")
    : text;
};

export const hasClass = (element: Element, className: string) =>
  (element.getAttribute("class") || "").split(/\s+/).includes(className);

/** Where Pele drew a text, as a text element (colored as styled). */
export const toText = (
  element: Element,
  root: Element,
  defaultFontSize: number,
  extra: Partial<Text> = {}
): Text => {
  const { text, x, y, height, fontSize, textAlign } = getTextBlock(
    element,
    root,
    defaultFontSize
  );
  return {
    type: "text",
    text,
    x,
    y,
    height,
    fontSize,
    textAlign,
    color: getStyleColor(element, "fill"),
    ...extra,
  };
};

export const toLine = (
  start: Position,
  end: Position,
  extra: Partial<Line> = {}
) =>
  ({
    type: "line",
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    ...extra,
  } as Line);

/** Every straight segment of a path (e.g. dividers, a stick figure's limbs). */
export const pathToLines = (
  path: Element,
  root: Element,
  extra: Partial<Line> = {}
) => {
  const offset = getOffset(path, root);
  const lines: Line[] = [];
  let current: Position | undefined;
  parsePath(path.getAttribute("d") || "").forEach(({ command, points }) => {
    const end = points[points.length - 1];
    if (command !== "M" && current) {
      lines.push(
        toLine(
          { x: current.x + offset.x, y: current.y + offset.y },
          { x: end.x + offset.x, y: end.y + offset.y },
          extra
        )
      );
    }
    current = end;
  });
  return lines;
};

/**
 * An edge's route (extended to the far end of its arrowheads) and whether it
 * has arrowheads at its start and at its end.
 */
export const readEdge = (group: Element, root: Element) => {
  const line = Array.from(group.children).find(
    (child) =>
      child.tagName.toLowerCase() === "path" && !hasClass(child, "pele-marker")
  );
  if (!line) {
    return undefined;
  }
  const markers = Array.from(group.querySelectorAll(".pele-marker"));
  const path = getPathRoute(line, root);
  const { startMarkers, endMarkers } = getRouteMarkers(path, markers, root);
  return {
    line,
    route: simplifyRoute(extendRouteToMarkers(path, markers, root)),
    hasStartMarker: startMarkers.length > 0,
    hasEndMarker: endMarkers.length > 0,
  };
};

const getDistance = (point: Position, bounds: Bounds) =>
  Math.hypot(
    Math.max(bounds.x - point.x, 0, point.x - (bounds.x + bounds.width)),
    Math.max(bounds.y - point.y, 0, point.y - (bounds.y + bounds.height))
  );

/**
 * The route, reversed if needed to start at `start` (or, if only `end` is
 * known, to end at `end`).
 */
export const orientRoute = (
  route: Position[],
  start: Bounds | undefined,
  end: Bounds | undefined
) => {
  const anchor = start ?? end;
  if (!anchor || route.length < 2) {
    return route;
  }
  const startDistance = getDistance(route[0], anchor);
  const endDistance = getDistance(route[route.length - 1], anchor);
  const isReversed = start
    ? startDistance > endDistance
    : startDistance < endDistance;
  return isReversed ? [...route].reverse() : route;
};

/** An arrow along a route (of at least 2 points). */
export const routeToArrow = (
  route: Position[],
  extra: Partial<Arrow> = {}
): Arrow => {
  const [first] = route;
  const last = route[route.length - 1];
  return {
    type: "arrow",
    startX: first.x,
    startY: first.y,
    endX: last.x,
    endY: last.y,
    points: route.map(
      (point) => [point.x - first.x, point.y - first.y] as [number, number]
    ),
    ...extra,
  };
};

/**
 * Where along the route Pele drew an edge's label (0 to 1), e.g. away from
 * other labels.
 */
export const getLabelPosition = (
  route: Position[],
  label: Element | undefined,
  root: Element
) => {
  const bounds = label && getShapeBounds(label, root);
  return bounds
    ? getRoutePosition(route, {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      })
    : undefined;
};

export const toBounds = (element: {
  x: number;
  y: number;
  width?: number;
  height?: number;
}): Bounds => ({
  x: element.x,
  y: element.y,
  width: element.width ?? 0,
  height: element.height ?? 0,
});
