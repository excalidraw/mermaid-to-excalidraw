import type { Line } from "../elementSkeleton.js";
import type { Box, Gantt, GanttTask } from "../interfaces.js";
import { hasClass, pathToLines, toText } from "./elements.js";
import { getShapeBounds, getStyleColor, getStyleValue } from "./svg.js";

export interface PeleGanttOptions {
  fontSize: number;
}

const children = (root: Element, selector: string) =>
  Array.from(root.querySelectorAll(selector));

/** Every straight segment of the paths matching `selector`. */
const readLines = (
  root: Element,
  selector: string,
  extra: Partial<Line> = {}
) => children(root, selector).flatMap((path) => pathToLines(path, root, extra));

/** A rectangle's bounds (`getShapeBounds` of a single `<rect>`). */
const readBox = (rect: Element, root: Element): Box | undefined =>
  getShapeBounds(rect, root) ?? undefined;

const readTask = (
  group: Element,
  root: Element,
  options: PeleGanttOptions
): GanttTask | undefined => {
  const label = group.querySelector("text.pele-label");
  if (!label) {
    return undefined;
  }
  const isMilestone = hasClass(group, "pele-milestone");
  // (Pele wraps clickable tasks' shapes and labels in a link)
  const shape = isMilestone
    ? group.querySelector("path")
    : group.querySelector("rect");
  const box =
    shape && !hasClass(group, "pele-unscheduled")
      ? readBox(shape, root)
      : undefined;
  const text = toText(label, root, options.fontSize);
  // Pele centers a name in its bar where it fits, and puts it next to the
  // bar otherwise (or next to a milestone, always)
  const isInside =
    !!box &&
    !isMilestone &&
    text.textAlign === "center" &&
    Math.abs(text.x - (box.x + box.width / 2)) < 1;

  return {
    id: group.getAttribute("data-id") ?? "",
    shape: box ? (isMilestone ? "milestone" : "bar") : undefined,
    box,
    status: hasClass(group, "pele-active")
      ? "active"
      : hasClass(group, "pele-done")
      ? "done"
      : undefined,
    crit: hasClass(group, "pele-crit"),
    label: { inside: isInside, text },
    link: group.querySelector("a[href]")?.getAttribute("href") || undefined,
  };
};

const parseNumber = (value: string | null | undefined) => {
  const number = parseFloat(value ?? "");
  return Number.isFinite(number) ? number : undefined;
};

/** A CSS opacity (`0.5` or `50%`), clamped to 0–1: 1 if not set. */
const readOpacity = (value: string | undefined) => {
  const number = parseNumber(value);
  if (number === undefined) {
    return 1;
  }
  const opacity = value?.trim().endsWith("%") ? number / 100 : number;
  return Math.min(1, Math.max(0, opacity));
};

/**
 * The line marking today, styled as `todayMarker <style>` sets it (Pele puts
 * that in the line's inline style), or `undefined` if not drawn: off, or
 * styled to be invisible (e.g. `stroke:none`, `stroke-width:0`, `opacity:0`).
 */
const readToday = (root: Element): Gantt["today"] => {
  // (Pele draws a triangle above the line too, its tip on the line)
  const path = root.querySelector(".pele-today > path[stroke]");
  const [line] = path ? pathToLines(path, root) : [];
  if (!path || !line) {
    return undefined;
  }
  const stroke = getStyleValue(path, "stroke")?.trim().toLowerCase();
  const width = parseNumber(
    getStyleValue(path, "stroke-width") ?? path.getAttribute("stroke-width")
  );
  const opacity =
    readOpacity(getStyleValue(path, "opacity")) *
    readOpacity(getStyleValue(path, "stroke-opacity"));
  if (
    stroke === "none" ||
    stroke === "transparent" ||
    width === 0 ||
    opacity === 0
  ) {
    return undefined;
  }
  const dashArray = getStyleValue(path, "stroke-dasharray");
  return {
    ...line,
    strokeColor: getStyleColor(path, "stroke"),
    strokeWidth: width && width > 0 ? width : undefined,
    strokeStyle: dashArray && dashArray !== "none" ? "dashed" : undefined,
    opacity: opacity < 1 ? opacity : undefined,
  };
};

/**
 * Reads a Gantt chart from the SVG Pele rendered it to: its tasks' bars,
 * milestones and names where Pele placed them (on the time scale it picked,
 * e.g. in rows packed by `displayMode: compact`), and the sections, ticks,
 * excluded days and markers around them.
 */
export const parsePeleGantt = (
  root: Element,
  options: PeleGanttOptions
): Gantt => {
  const readTexts = (selector: string) =>
    children(root, selector).map((text) =>
      toText(text, root, options.fontSize)
    );

  const verticalStrokeWidth = Number(
    root.querySelector(".pele-verts")?.getAttribute("stroke-width")
  );

  const [title] = readTexts(":scope > text.pele-title");

  return {
    type: "gantt",
    sections: children(root, ".pele-sections > rect.pele-section")
      // (every other one is unfilled)
      .filter((rect) => (rect.getAttribute("fill") ?? "none") !== "none")
      .flatMap((rect) => readBox(rect, root) ?? []),
    excluded: children(root, ".pele-excluded > rect").flatMap(
      (rect) => readBox(rect, root) ?? []
    ),
    gridLines: readLines(root, ".pele-grid > path[stroke-dasharray]"),
    axisLines: readLines(root, ".pele-grid > path:not([stroke-dasharray])"),
    verticals: readLines(root, ".pele-verts > path.pele-vert", {
      strokeWidth: verticalStrokeWidth || undefined,
    }),
    today: readToday(root),
    tasks: children(root, ".pele-tasks > g.pele-task").flatMap(
      (group) => readTask(group, root, options) ?? []
    ),
    sectionLabels: readTexts(".pele-section-labels > text.pele-section-label"),
    axisLabels: readTexts(".pele-axis > text"),
    verticalLabels: readTexts(".pele-vert-labels > text.pele-vert-label"),
    title: title?.text ? title : undefined,
  };
};

/**
 * The stretch of the time axis a task covers: its bar (or diamond), and its
 * name if it's next to it. Pele puts a name a gap away from its bar, so the
 * bar's near edge, mirrored across the name's center, is the name's far edge
 * plus that gap.
 */
const getTaskSpan = ({ box, label }: GanttTask) => {
  if (!box) {
    return undefined;
  }
  const start = box.x;
  const end = box.x + box.width;
  if (label.inside) {
    return { start, end };
  }
  const center = label.text.x;
  return center > (start + end) / 2
    ? { start, end: Math.max(end, 2 * center - end) }
    : { start: Math.min(start, 2 * center - start), end };
};

/**
 * Whether tasks drawn in the same row run into each other, e.g. into the name
 * next to a bar: `displayMode: compact` packs tasks into rows by their bars
 * alone.
 */
export const hasOverlappingTasks = (chart: Gantt) => {
  const rows = new Map<number, { start: number; end: number }[]>();
  chart.tasks.forEach((task) => {
    const span = getTaskSpan(task);
    if (span && task.box) {
      const row = Math.round(task.box.y);
      rows.set(row, [...(rows.get(row) ?? []), span]);
    }
  });
  // (bars may touch: Pele starts a task's bar where the one before it ends)
  return Array.from(rows.values()).some((spans) =>
    spans
      .sort((a, b) => a.start - b.start)
      .some(
        (span, index, sorted) =>
          index > 0 && span.start < sorted[index - 1].end - 0.5
      )
  );
};
