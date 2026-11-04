import { nanoid } from "nanoid";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { Radians } from "@excalidraw/excalidraw/math/types";

import { DEFAULT_TEXT_COLOR, MUTED_TEXT_COLOR } from "../../constants.js";
import type { Text } from "../../elementSkeleton.js";
import type { Box, QuadrantChart, QuadrantPoint } from "../../interfaces.js";
import { GraphConverter } from "../GraphConverter.js";
import { transformToExcalidrawTextSkeleton } from "../transformToExcalidrawSkeleton.js";

// Colors from Excalidraw's palette, in the roles Pele's quadrant chart theme
// gives them
const QUADRANT_FILL_COLOR = "#f1f3f5";
const QUADRANT_STROKE_COLOR = "#adb5bd";
const POINT_COLOR = "#1971c2";

const toText = (text: Text, color = DEFAULT_TEXT_COLOR) =>
  transformToExcalidrawTextSkeleton({ ...text, color: text.color ?? color });

/**
 * A quadrant, its name bound to it where Pele drew it: at its top if there are
 * points (which Pele keeps the points' names away from), else in its middle.
 */
const convertQuadrant = ({
  box,
  label,
}: QuadrantChart["quadrants"][number]): ExcalidrawElementSkeleton => {
  const isMiddle =
    !!label &&
    Math.abs(label.y + (label.height ?? 0) / 2 - (box.y + box.height / 2)) < 1;
  return {
    type: "rectangle",
    ...box,
    backgroundColor: QUADRANT_FILL_COLOR,
    fillStyle: "solid",
    strokeColor: QUADRANT_STROKE_COLOR,
    strokeWidth: 1,
    roundness: null,
    ...(label
      ? {
          label: {
            text: label.text,
            fontSize: label.fontSize,
            strokeColor: label.color ?? DEFAULT_TEXT_COLOR,
            textAlign: "center",
            verticalAlign: isMiddle ? "middle" : "top",
          },
        }
      : {}),
  };
};

const toCircle = (point: QuadrantPoint): Box => ({
  x: point.x - point.radius,
  y: point.y - point.radius,
  width: point.radius * 2,
  height: point.radius * 2,
});

/** A point, outlined in its fill unless `stroke-width` sets an outline. */
const convertPoint = (
  point: QuadrantPoint,
  groupIds: string[]
): ExcalidrawElementSkeleton => {
  const fill = point.fill ?? POINT_COLOR;
  return {
    type: "ellipse",
    ...toCircle(point),
    groupIds,
    backgroundColor: fill,
    fillStyle: "solid",
    strokeColor: point.stroke ? point.stroke.color ?? POINT_COLOR : fill,
    strokeWidth: point.stroke?.width ?? 1,
  };
};

export const quadrantToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: QuadrantChart) => {
    // A point's name moves with it
    const groupIds = chart.points.map((point) =>
      point.label && point.radius > 0 ? [nanoid()] : []
    );
    const elements: ExcalidrawElementSkeleton[] = [
      ...chart.quadrants.map(convertQuadrant),
      ...chart.axisLabels.map(({ angle, ...text }) => ({
        ...toText(text, MUTED_TEXT_COLOR),
        ...(angle ? { angle: angle as Radians } : {}),
      })),
      // (as Pele draws them: names above all points)
      // (a point with no radius isn't drawn, only its name)
      ...chart.points.flatMap((point, index) =>
        point.radius > 0 ? [convertPoint(point, groupIds[index])] : []
      ),
      ...chart.points.flatMap(({ label }, index) =>
        label ? [{ ...toText(label), groupIds: groupIds[index] }] : []
      ),
      ...(chart.title ? [toText(chart.title)] : []),
    ];

    return { elements };
  },
});
