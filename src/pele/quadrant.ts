import type { Text } from "../elementSkeleton.js";
import type { QuadrantChart, QuadrantPoint } from "../interfaces.js";
import { toText } from "./elements.js";
import {
  getFontSize,
  getOffset,
  getRotatedAncestor,
  getShapeBounds,
  getStyleColor,
  getStyleValue,
} from "./svg.js";

export interface PeleQuadrantOptions {
  fontSize: number;
}

const children = (root: Element, selector: string) =>
  Array.from(root.querySelectorAll(selector));

/**
 * A text, turned as Pele turned it (e.g. the y axis' labels): Excalidraw
 * turns an element about its center, so the text is placed where its center
 * ends up.
 */
const readTurnedText = (
  element: Element,
  root: Element,
  fontSize: number
): Text & { angle?: number } => {
  const rotated = getRotatedAncestor(element, root);
  if (!rotated) {
    return toText(element, root, fontSize);
  }
  // Laid out in the turned ancestor's coordinates, then turned about its
  // origin and moved by its (and its ancestors') offset
  const { node, degrees } = rotated;
  // (its font size is set on its ancestors, e.g. the axes' labels' group)
  const text = toText(element, node, getFontSize(element, root, fontSize));
  const height = text.height ?? 0;
  // (Pele centers turned texts on their anchor)
  const center = { x: text.x, y: text.y + height / 2 };
  const radians = (degrees * Math.PI) / 180;
  const offset = getOffset(node, root);
  const x =
    center.x * Math.cos(radians) - center.y * Math.sin(radians) + offset.x;
  const y =
    center.x * Math.sin(radians) + center.y * Math.cos(radians) + offset.y;
  return {
    ...text,
    x,
    y: y - height / 2,
    textAlign: "center",
    // (Excalidraw's angles, clockwise as SVG's, are from 0 to 2π)
    angle: (((degrees % 360) + 360) % 360) * (Math.PI / 180),
  };
};

const parseNumber = (value: string | null | undefined) => {
  const number = parseFloat(value ?? "");
  return Number.isFinite(number) ? number : undefined;
};

const readPoint = (
  circle: Element,
  root: Element
): QuadrantPoint | undefined => {
  const box = getShapeBounds(circle, root);
  if (!box) {
    return undefined;
  }
  // Pele outlines a point only where `stroke-width` is set (in the default
  // point color, unless `stroke-color` is set too)
  const strokeWidth = parseNumber(getStyleValue(circle, "stroke-width"));
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
    radius: box.width / 2,
    fill: getStyleColor(circle, "fill"),
    stroke: strokeWidth
      ? { color: getStyleColor(circle, "stroke"), width: strokeWidth }
      : undefined,
  };
};

/**
 * Reads a quadrant chart from the SVG Pele rendered it to: its quadrants, the
 * axes' labels, and its points and their names where Pele placed them (away
 * from each other, and from the quadrants' names).
 */
export const parsePeleQuadrant = (
  root: Element,
  options: PeleQuadrantOptions
): QuadrantChart => {
  const readText = (element: Element | null) => {
    const text = element && toText(element, root, options.fontSize);
    return text?.text.trim() ? text : undefined;
  };

  const quadrants = children(root, ".pele-quadrants > g.pele-quadrant")
    .sort(
      (a, b) =>
        Number(a.getAttribute("data-id")) - Number(b.getAttribute("data-id"))
    )
    .flatMap((group) => {
      const rect = group.querySelector("rect");
      const box = rect && getShapeBounds(rect, root);
      return box
        ? [{ box, label: readText(group.querySelector("text.pele-label")) }]
        : [];
    });

  // Pele draws the points in reverse (the first one on top), and their names
  // in order, except empty ones. A point's `data-id` is its name as Pele drew
  // it: trimmed, then decoded (so `&nbsp;`, decoded after trimming, is drawn)
  const circles = children(root, ".pele-points > circle.pele-point");
  const labels = children(root, ".pele-point-labels > text.pele-label");
  const named = circles
    .slice()
    .reverse()
    .filter((circle) => circle.getAttribute("data-id"));
  const getLabel = (circle: Element) =>
    // (if they don't match up, names aren't read rather than misplaced)
    named.length === labels.length
      ? readText(labels[named.indexOf(circle)] ?? null)
      : undefined;
  const points = circles.flatMap((circle) => {
    const point = readPoint(circle, root);
    return point ? [{ ...point, label: getLabel(circle) }] : [];
  });

  return {
    type: "quadrant",
    quadrants,
    axisLabels: children(root, ".pele-axis-labels text")
      .map((text) => readTurnedText(text, root, options.fontSize))
      .filter(({ text }) => text.trim()),
    points,
    title: readText(root.querySelector(":scope > text.pele-title")),
  };
};

type Rect = { left: number; top: number; right: number; bottom: number };

const intersects = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

// Excalidraw's line height, which `Text` boxes are laid out with
const LINE_HEIGHT = 1.25;
// Width of a character where text can't be measured (e.g. without a canvas),
// relative to the font size: about Excalifont's average
const FALLBACK_CHARACTER_WIDTH = 0.6;

/**
 * The box a text's glyphs take up: its lines' measured width, and from the
 * top of its first line to the bottom of its last, without the leading
 * Excalidraw's line height adds (texts Pele places a gap apart don't touch).
 */
const getTextRect = (
  text: Text,
  measureText: (text: string, fontSize: number) => number | null
): Rect => {
  const lines = text.text.split("\n");
  const width = Math.max(
    ...lines.map(
      (line) =>
        measureText(line, text.fontSize) ??
        line.length * text.fontSize * FALLBACK_CHARACTER_WIDTH
    )
  );
  const left =
    text.textAlign === "center"
      ? text.x - width / 2
      : text.textAlign === "right"
      ? text.x - width
      : text.x;
  const middle = text.y + (text.height ?? 0) / 2;
  const height = ((lines.length - 1) * LINE_HEIGHT + 1) * text.fontSize;
  return {
    left,
    top: middle - height / 2,
    right: left + width,
    bottom: middle + height / 2,
  };
};

const getPointRect = ({ x, y, radius }: QuadrantPoint): Rect => ({
  left: x - radius,
  top: y - radius,
  right: x + radius,
  bottom: y + radius,
});

/**
 * How many times points' names run into each other, into other points, or
 * into the quadrants' names, and points into the quadrants' names. Pele keeps
 * names apart where it finds room, but where it doesn't (in busy charts), it
 * places them over whatever is there.
 */
export const countOverlaps = (
  chart: QuadrantChart,
  measureText: (text: string, fontSize: number) => number | null
) => {
  const quadrantNames = chart.quadrants.flatMap(({ label }) =>
    label ? [getTextRect(label, measureText)] : []
  );
  const points = chart.points.map(getPointRect);
  const names = chart.points.map(({ label }) =>
    label ? getTextRect(label, measureText) : undefined
  );

  let count = 0;
  names.forEach((name, index) => {
    if (!name) {
      return;
    }
    count += names.filter(
      (other, otherIndex) =>
        otherIndex > index && other && intersects(name, other)
    ).length;
    count += points.filter(
      (point, pointIndex) => pointIndex !== index && intersects(name, point)
    ).length;
    count += quadrantNames.filter((quadrantName) =>
      intersects(name, quadrantName)
    ).length;
  });
  points.forEach((point) => {
    count += quadrantNames.filter((quadrantName) =>
      intersects(point, quadrantName)
    ).length;
  });
  return count;
};
