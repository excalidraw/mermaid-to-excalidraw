import { nanoid } from "nanoid";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { LocalPoint } from "@excalidraw/excalidraw/math/types";

import { DEFAULT_TEXT_COLOR, NODE_BACKGROUND_COLOR } from "../../constants.js";
import { parseCSSColor } from "../../cssUtils.js";
import type {
  Box,
  Position,
  Timeline,
  TimelineBox,
  TimelineColor,
  TimelinePeriod,
} from "../../interfaces.js";
import { GraphConverter } from "../GraphConverter.js";
import { getElbowArrowProps } from "../helpers.js";
import { transformToExcalidrawTextSkeleton } from "../transformToExcalidrawSkeleton.js";

interface Colors {
  /** Fills of sections' headers, of periods and of events. */
  section: string;
  period: string;
  event: string;
  /** Outlines, and the dots on the axis. */
  stroke: string;
  /** Text on sections' headers and on periods. */
  text: string;
}

// Excalidraw's palette's shades of a color: a header's, a period's and an
// event's fill, and the outline
const shades = (
  section: string,
  period: string,
  event: string,
  stroke: string
): Colors => ({ section, period, event, stroke, text: DEFAULT_TEXT_COLOR });

// Pele's series colors (blue, orange, green, red, teal, yellow, purple and
// brown), as the closest of Excalidraw's palette's colors
const SERIES_COLORS = [
  shades("#4dabf7", "#a5d8ff", "#e7f5ff", "#1971c2"),
  shades("#ffa94d", "#ffd8a8", "#fff4e6", "#e8590c"),
  shades("#69db7c", "#b2f2bb", "#ebfbee", "#2f9e44"),
  shades("#ff8787", "#ffc9c9", "#fff5f5", "#e03131"),
  shades("#38d9a9", "#96f2d7", "#e6fcf5", "#099268"),
  shades("#ffd43b", "#ffec99", "#fff9db", "#f08c00"),
  shades("#da77f2", "#eebefa", "#f8f0fc", "#9c36b5"),
  shades("#d2bab0", "#eaddd7", "#f8f1ee", "#846358"),
];
// Of periods before the first section
const MUTED_COLORS = shades("#ced4da", "#e9ecef", "#f8f9fa", "#868e96");

// The axis, and the arrows from periods to their events
const AXIS_COLOR = DEFAULT_TEXT_COLOR;
const CONNECTOR_COLOR = "#868e96";

// Excalidraw's bold strokes, for everything
const STROKE_WIDTH = 2;

// How opaque Pele draws events' boxes, in their period's color
const EVENT_FILL_OPACITY = 0.16;

/**
 * A color drawn with an opacity over white, as an opaque color (e.g. an
 * event's fill): Excalidraw's opacity is the whole element's, its text too.
 */
const overWhite = (color: string, opacity: number) => {
  const rgba = parseCSSColor(color);
  if (!rgba) {
    return undefined;
  }
  return `#${[rgba.r, rgba.g, rgba.b]
    .map((channel) =>
      Math.round(255 - (255 - channel) * opacity * rgba.a)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
};

/**
 * The colors of a section, or of a period and its events: Excalidraw's for
 * Pele's series (or its muted color), or the themed color (`cScale0`, …), with
 * events drawn lighter as Pele draws them.
 */
const getColors = ({ series, fill, text }: TimelineColor): Colors => {
  if (fill) {
    return {
      section: fill,
      period: fill,
      event: overWhite(fill, EVENT_FILL_OPACITY) ?? NODE_BACKGROUND_COLOR,
      stroke: fill,
      text: text ?? DEFAULT_TEXT_COLOR,
    };
  }
  return series === undefined
    ? MUTED_COLORS
    : SERIES_COLORS[series % SERIES_COLORS.length];
};

/** A box, its text bound to it (centered, as Pele centers it). */
const toBox = (
  { box, label }: TimelineBox,
  fill: string,
  stroke: string,
  textColor: string,
  id?: string
): ExcalidrawElementSkeleton => ({
  type: "rectangle",
  ...(id ? { id } : {}),
  ...box,
  backgroundColor: fill,
  fillStyle: "solid",
  strokeColor: stroke,
  strokeWidth: STROKE_WIDTH,
  roundness: { type: 3 },
  ...(label
    ? {
        label: {
          text: label.text,
          fontSize: label.fontSize,
          strokeColor: textColor,
          textAlign: "center",
          verticalAlign: "middle",
        },
      }
    : {}),
});

const toPoints = (points: Position[]) =>
  points.map(
    ({ x, y }) => [x - points[0].x, y - points[0].y] as unknown as LocalPoint
  );

const convertAxis = ({
  start,
  end,
}: NonNullable<Timeline["axis"]>): ExcalidrawElementSkeleton => ({
  type: "arrow",
  x: start.x,
  y: start.y,
  points: toPoints([start, end]),
  strokeColor: AXIS_COLOR,
  strokeWidth: STROKE_WIDTH,
  startArrowhead: null,
  endArrowhead: "triangle",
});

/** An elbow arrow without arrowheads, bound to the boxes it connects. */
const toLink = (
  route: Position[],
  start: string,
  end: string
): ExcalidrawElementSkeleton => {
  const points = toPoints(route);
  return {
    type: "arrow",
    x: route[0].x,
    y: route[0].y,
    points,
    strokeColor: CONNECTOR_COLOR,
    strokeWidth: STROKE_WIDTH,
    startArrowhead: null,
    endArrowhead: null,
    ...getElbowArrowProps(points),
    start: { id: start },
    end: { id: end },
  };
};

const middleY = ({ y, height }: Box) => y + height / 2;
const middleX = ({ x, width }: Box) => x + width / 2;

/**
 * The routes of the lines Pele draws from a period to its events: down from
 * the period to its first event and on from one event to the next, or with
 * `timeline TD`, across the axis to each event, along a bracket halfway
 * between the axis and the events.
 */
const getLinkRoutes = (
  period: TimelinePeriod,
  timeline: Timeline
): Position[][] => {
  if (timeline.direction === "LR") {
    const boxes = [period, ...period.events].map(({ box }) => box);
    return boxes.slice(1).map((to, index) => {
      const from = boxes[index];
      return [
        { x: middleX(from), y: from.y + from.height },
        { x: middleX(from), y: to.y },
      ];
    });
  }
  const start = {
    x: period.box.x + period.box.width,
    y: middleY(period.box),
  };
  return period.events.map(({ box }) => {
    const end = { x: box.x, y: middleY(box) };
    if (Math.abs(end.y - start.y) < 1) {
      return [start, { x: end.x, y: start.y }];
    }
    const bracketX = ((timeline.axis?.start.x ?? start.x) + end.x) / 2;
    return [start, { x: bracketX, y: start.y }, { x: bracketX, y: end.y }, end];
  });
};

/**
 * A period, its events and the elbow arrows connecting them (moving a box
 * keeps them connected), and its dot on the axis (connected to the period if
 * it has no events).
 */
const convertPeriod = (
  period: TimelinePeriod,
  timeline: Timeline
): ExcalidrawElementSkeleton[] => {
  const colors = getColors(period.color);
  const ids = [period, ...period.events].map(() => nanoid());
  const dotId = nanoid();
  const { dot } = period;
  // (with `timeline TD`, each event is connected to the period)
  const getStartId = (index: number) =>
    timeline.direction === "LR" ? ids[index] : ids[0];
  const links = getLinkRoutes(period, timeline).map((route, index) =>
    toLink(route, getStartId(index), ids[index + 1])
  );
  // A period without events is connected to its dot, as Pele draws it
  if (!links.length && dot) {
    const start =
      timeline.direction === "LR"
        ? { x: dot.x, y: period.box.y + period.box.height }
        : { x: period.box.x + period.box.width, y: dot.y };
    links.push(toLink([start, dot], ids[0], dotId));
  }
  return [
    ...links,
    toBox(period, colors.period, colors.stroke, colors.text, ids[0]),
    ...(dot
      ? [
          {
            type: "ellipse",
            id: dotId,
            x: dot.x - dot.radius,
            y: dot.y - dot.radius,
            width: dot.radius * 2,
            height: dot.radius * 2,
            backgroundColor: colors.stroke,
            fillStyle: "solid",
            strokeColor: colors.stroke,
            strokeWidth: STROKE_WIDTH,
          } as const,
        ]
      : []),
    ...period.events.map((event, index) =>
      toBox(
        event,
        colors.event,
        colors.stroke,
        DEFAULT_TEXT_COLOR,
        ids[index + 1]
      )
    ),
  ];
};

export const timelineToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (timeline: Timeline) => {
    const elements: ExcalidrawElementSkeleton[] = [
      // (behind sections' headers, which it runs through in `timeline TD`)
      ...(timeline.axis ? [convertAxis(timeline.axis)] : []),
      ...timeline.sections.map((section) => {
        const colors = getColors(section.color);
        return toBox(section, colors.section, colors.stroke, colors.text);
      }),
      ...timeline.periods.flatMap((period) => convertPeriod(period, timeline)),
      ...(timeline.title
        ? [
            transformToExcalidrawTextSkeleton({
              ...timeline.title,
              color: timeline.title.color ?? DEFAULT_TEXT_COLOR,
            }),
          ]
        : []),
    ];

    return { elements };
  },
});
