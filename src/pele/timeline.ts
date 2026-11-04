import {
  isValidCSSColor,
  parseCSSColor,
  parseCSSDeclarations,
} from "../cssUtils.js";
import type {
  Position,
  Timeline,
  TimelineBox,
  TimelineColor,
  TimelinePeriod,
} from "../interfaces.js";
import { toText } from "./elements.js";
import { getOffset, getShapeBounds, parsePath, simplifyRoute } from "./svg.js";

export interface PeleTimelineOptions {
  fontSize: number;
}

const children = (root: Element, selector: string) =>
  Array.from(root.querySelectorAll(selector));

const SERIES = /^var\(\s*--pele-series-(\d+)\b/;
// A CSS variable's fallback, e.g. the color of `var(--pele-fg-on-dark,#fff)`
const FALLBACK = /^var\(\s*--[\w-]+\s*,\s*(.+?)\s*\)$/;

// (colors that can be read are usable where `isValidCSSColor` can't tell,
// e.g. `hsl(270 50% 40%)` without `CSS.supports`)
const isUsableColor = (value: string | undefined): value is string =>
  !!value &&
  !/\bvar\(/i.test(value) &&
  (isValidCSSColor(value) || !!parseCSSColor(value));

/**
 * Reads a timeline from the SVG Pele rendered it to: its sections' headers,
 * its periods with their events, as Pele placed them along the axis (in a row,
 * or `timeline TD`, in a column), and the colors Pele gave them.
 */
export const parsePeleTimeline = (
  root: Element,
  options: PeleTimelineOptions
): Timeline => {
  const readText = (element: Element | null) => {
    const text = element && toText(element, root, options.fontSize);
    return text?.text.trim() ? text : undefined;
  };

  // Themed series colors (`cScale0`, …), which Pele sets on the root
  const themed = new Map(
    parseCSSDeclarations(root.getAttribute("style") || "").map(
      ({ property, value }) => [property, value]
    )
  );

  /**
   * The color Pele filled a section's or period's box with: a series', as
   * themed if it is (text on it in the color Pele picked for it), or muted.
   */
  const readColor = (
    rect: Element | null,
    label: Element | null
  ): TimelineColor => {
    const series = rect?.getAttribute("fill")?.trim().match(SERIES)?.[1];
    if (!series) {
      return {};
    }
    const fill = themed.get(`--pele-series-${series}`);
    if (!isUsableColor(fill)) {
      return { series: Number(series) - 1 };
    }
    const text = label?.getAttribute("fill")?.trim().match(FALLBACK)?.[1];
    return {
      series: Number(series) - 1,
      fill,
      text: isUsableColor(text) ? text : undefined,
    };
  };

  const readBox = (group: Element): TimelineBox | undefined => {
    const rect = group.querySelector(":scope > rect");
    const box = rect && getShapeBounds(rect, root);
    return box
      ? { box, label: readText(group.querySelector(":scope > text")) }
      : undefined;
  };

  const readColoredBox = (group: Element) => {
    const box = readBox(group);
    return box
      ? {
          ...box,
          color: readColor(
            group.querySelector(":scope > rect"),
            group.querySelector(":scope > text")
          ),
        }
      : undefined;
  };

  const readPeriod = (group: Element): TimelinePeriod | undefined => {
    const period = readColoredBox(group);
    if (!period) {
      return undefined;
    }
    const dot = group.querySelector(":scope > circle.pele-dot");
    const dotBox = dot && getShapeBounds(dot, root);
    return {
      ...period,
      dot: dotBox
        ? {
            x: dotBox.x + dotBox.width / 2,
            y: dotBox.y + dotBox.height / 2,
            radius: dotBox.width / 2,
          }
        : undefined,
      events: children(group, ":scope > g.pele-event").flatMap(
        (event) => readBox(event) ?? []
      ),
    };
  };

  const axis = readAxis(root);
  return {
    type: "timeline",
    // (Pele lays periods out along the axis)
    direction:
      axis &&
      Math.abs(axis.end.x - axis.start.x) < Math.abs(axis.end.y - axis.start.y)
        ? "TD"
        : "LR",
    axis,
    sections: children(root, "g.pele-section").flatMap(
      (group) => readColoredBox(group) ?? []
    ),
    periods: children(root, "g.pele-period").flatMap(
      (group) => readPeriod(group) ?? []
    ),
    title: readText(root.querySelector(":scope > text.pele-title")),
  };
};

/** A path's subpaths, as polylines in `root` coordinates. */
const readPolylines = (path: Element, root: Element) => {
  const offset = getOffset(path, root);
  const polylines: Position[][] = [];
  parsePath(path.getAttribute("d") || "").forEach(({ command, points }) => {
    if (command.toUpperCase() === "M" || !polylines.length) {
      polylines.push([]);
    }
    const end = points[points.length - 1];
    polylines[polylines.length - 1].push({
      x: end.x + offset.x,
      y: end.y + offset.y,
    });
  });
  return polylines
    .map((points) => simplifyRoute(points))
    .filter((points) => points.length > 1);
};

/**
 * The axis, from its start to the tip of its arrowhead (which Pele draws as a
 * separate shape, the line ending at its base).
 */
const readAxis = (root: Element): Timeline["axis"] => {
  const line = root.querySelector(":scope > path.pele-axis");
  const [points] = line ? readPolylines(line, root) : [];
  if (!points) {
    return undefined;
  }
  const start = points[0];
  const marker = root.querySelector(":scope > path.pele-marker");
  const distance = (point: Position) =>
    Math.hypot(point.x - start.x, point.y - start.y);
  const tip = (marker ? readPolylines(marker, root).flat() : []).reduce(
    (farthest, point) =>
      distance(point) > distance(farthest) ? point : farthest,
    points[points.length - 1]
  );
  return { start, end: tip };
};
