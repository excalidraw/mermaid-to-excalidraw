import { nanoid } from "nanoid";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";

import { DEFAULT_TEXT_COLOR } from "../../constants.js";
import type { Line, Text } from "../../elementSkeleton.js";
import type { Box, Gantt, GanttTask } from "../../interfaces.js";
import { GraphConverter } from "../GraphConverter.js";
import {
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";

// Colors from Excalidraw's palette, in the roles Pele's (and Mermaid's) gantt
// theme gives them
const SECTION_COLOR = "#f1f3f5";
const EXCLUDED_COLOR = "#dee2e6";
const GRID_COLOR = "#adb5bd";
const AXIS_COLOR = "#868e96";
const MUTED_TEXT_COLOR = "#495057";
const TODAY_COLOR = "#e03131";

const TASK_COLORS = {
  default: { stroke: "#1971c2", fill: "#a5d8ff" },
  active: { stroke: "#1971c2", fill: "#e7f5ff" },
  done: { stroke: "#868e96", fill: "#e9ecef" },
};
const CRIT_TASK_COLORS = {
  default: { stroke: "#e03131", fill: "#ffc9c9" },
  active: { stroke: "#e03131", fill: "#fff5f5" },
  done: { stroke: "#e03131", fill: "#e9ecef" },
};

/** A filled rectangle without an outline, e.g. a section's band. */
const toBand = (box: Box, color: string): ExcalidrawElementSkeleton => ({
  type: "rectangle",
  ...box,
  backgroundColor: color,
  fillStyle: "solid",
  strokeColor: "transparent",
  strokeWidth: 1,
});

const toLine = (line: Line, extra: Partial<Line>) =>
  transformToExcalidrawLineSkeleton({ ...line, ...extra });

const toText = (text: Text, color = DEFAULT_TEXT_COLOR) =>
  transformToExcalidrawTextSkeleton({ ...text, color: text.color ?? color });

// Excalidraw's padding around a container's label
const EXCALIDRAW_BOUND_TEXT_PADDING = 5;

/**
 * Whether a name Pele drew in its bar fits it as the bar's label: Excalidraw
 * grows a container to fit its label and padding, which a bar thinner than
 * the default (`gantt.barHeight`) would grow out of its row by.
 */
const fitsAsLabel = (text: Text, box: Box) =>
  (text.height ?? 0) + EXCALIDRAW_BOUND_TEXT_PADDING * 2 <= box.height + 0.5;

const convertTask = (task: GanttTask): ExcalidrawElementSkeleton[] => {
  const { box, shape, link } = task;
  // (a task without dates has no bar, only its name)
  if (!shape || !box) {
    return [
      { ...toText(task.label.text, MUTED_TEXT_COLOR), link: link ?? null },
    ];
  }
  // A name drawn in a bar too thin for it is drawn over it instead
  const label = {
    ...task.label,
    bound: task.label.inside && fitsAsLabel(task.label.text, box),
  };
  const labelColor =
    task.status === "done" && !label.inside
      ? MUTED_TEXT_COLOR
      : DEFAULT_TEXT_COLOR;

  const colors = (task.crit ? CRIT_TASK_COLORS : TASK_COLORS)[
    task.status ?? "default"
  ];
  // A name next to (or over) its bar moves with it
  const groupIds = label.bound ? [] : [nanoid()];
  // Excalidraw shows a link's icon at its element's top right: a link is set
  // on the right one of a bar and the name next to it, not shown on both
  const isLabelOnRight = !label.inside && label.text.x > box.x + box.width / 2;
  const taskElement: ExcalidrawElementSkeleton = {
    type: shape === "milestone" ? "diamond" : "rectangle",
    ...box,
    groupIds,
    backgroundColor: colors.fill,
    fillStyle: "solid",
    strokeColor: colors.stroke,
    strokeWidth: 1,
    roundness: shape === "bar" ? { type: 3 } : null,
    link: (!isLabelOnRight && link) || null,
    ...(label.bound
      ? {
          label: {
            text: label.text.text,
            fontSize: label.text.fontSize,
            strokeColor: labelColor,
            textAlign: "center",
            verticalAlign: "middle",
          },
        }
      : {}),
  };

  return label.bound
    ? [taskElement]
    : [
        taskElement,
        {
          ...toText(label.text, labelColor),
          groupIds,
          link: (isLabelOnRight && link) || null,
        },
      ];
};

/** The today marker, red unless `todayMarker <style>` sets its color. */
const convertToday = ({
  opacity,
  ...line
}: NonNullable<Gantt["today"]>): ExcalidrawElementSkeleton => ({
  ...toLine(line, { strokeColor: line.strokeColor ?? TODAY_COLOR }),
  ...(opacity !== undefined ? { opacity: Math.round(opacity * 100) } : {}),
});

export const ganttToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Gantt) => {
    const elements: ExcalidrawElementSkeleton[] = [
      ...chart.sections.map((box) => toBand(box, SECTION_COLOR)),
      ...chart.excluded.map((box) => toBand(box, EXCLUDED_COLOR)),
      ...chart.gridLines.map((line) =>
        toLine(line, { strokeColor: GRID_COLOR, strokeStyle: "dotted" })
      ),
      ...chart.axisLines.map((line) =>
        toLine(line, { strokeColor: AXIS_COLOR })
      ),
      ...chart.verticals.map((line) =>
        toLine(line, { strokeColor: DEFAULT_TEXT_COLOR, strokeStyle: "dashed" })
      ),
      ...(chart.today ? [convertToday(chart.today)] : []),
      ...chart.tasks.flatMap(convertTask),
      ...chart.sectionLabels.map((text) => toText(text)),
      ...chart.axisLabels.map((text) => toText(text, MUTED_TEXT_COLOR)),
      ...chart.verticalLabels.map((text) => toText(text)),
      ...(chart.title ? [toText(chart.title)] : []),
    ];

    return { elements };
  },
});
