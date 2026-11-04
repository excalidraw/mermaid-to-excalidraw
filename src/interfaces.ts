import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { ExcalidrawLinearElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";

import type { Arrow, Container, Line, Node, Text } from "./elementSkeleton.js";

export enum VERTEX_TYPE {
  ROUND = "round",
  STADIUM = "stadium",
  DOUBLECIRCLE = "doublecircle",
  CIRCLE = "circle",
  DIAMOND = "diamond",
  CYLINDER = "cylinder",
}
export enum LABEL_STYLE_PROPERTY {
  COLOR = "color",
}
export enum CONTAINER_STYLE_PROPERTY {
  FILL = "fill",
  STROKE = "stroke",
  STROKE_WIDTH = "stroke-width",
  STROKE_DASHARRAY = "stroke-dasharray",
}

export type ContainerStyle = {
  [key in CONTAINER_STYLE_PROPERTY]?: string;
};

export type LabelStyle = {
  [key in LABEL_STYLE_PROPERTY]?: string;
};

export interface Vertex {
  id: string;
  type: VERTEX_TYPE;
  labelType: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  link?: string;
  containerStyle: ContainerStyle;
  labelStyle: LabelStyle;
}

export interface SubGraph {
  id: string;
  nodeIds: string[];
  text: string;
  labelType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  containerStyle: ContainerStyle;
  labelStyle: LabelStyle;
  /**
   * A swimlane's (`swimlane-beta`) header, its title in it: a column on its
   * side, the title reading upwards (`vertical`), or a row on its top.
   */
  laneHeader?: {
    x: number;
    y: number;
    width: number;
    height: number;
    vertical: boolean;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Flowchart {
  type: "flowchart";
  subGraphs: SubGraph[];
  vertices: { [key: string]: Vertex | undefined };
  edges: Edge[];
}

export interface Edge {
  id?: string;
  start: string;
  end: string;
  type?: string;
  text: string;
  labelType: string;
  stroke?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
  /**
   * Where along the edge (0 at its start, 1 at its end, by length) its label
   * is centered, if not halfway.
   */
  labelPosition?: number;
  /**
   * Routed orthogonally (as Pele routes swimlanes' and stepped edges): drawn as an elbow
   * arrow along its route, not curved through its points.
   */
  orthogonal?: boolean;
}

type Loop = {
  lines: Line[];
  texts: Text[];
  nodes: Container[];
};

type Group = {
  name: string;
  actorKeys: Array<string>;
  fill: string;
  /** Where the box is drawn, if known. Otherwise, it's fitted to its actors. */
  bounds?: { x: number; y: number; width: number; height: number };
};

export interface Sequence {
  type: "sequence";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  loops: Loop | undefined;
  groups: Group[];
}

/** A class diagram's namespace: a box around its classes, titled */
export interface ClassNamespace {
  id: string;
  text: string;
  fontSize: number;
  /** The center of the title, if known. Otherwise, it's centered. */
  titleX?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Class {
  type: "class";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  text: Text[];
  namespaces: ClassNamespace[];
}

export interface ERD {
  type: "erd";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  text: Text[];
}

/** How a state is drawn (Mermaid's names for its state shapes) */
type StateShape =
  | "rect"
  | "rectWithTitle"
  | "roundedWithTitle"
  | "stateStart"
  | "stateEnd"
  | "choice"
  | "fork"
  | "join"
  | "note"
  | "divider";

type DividerLine = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export interface StateNode {
  id: string;
  shape: StateShape;
  text: string;
  description: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  position?: string;
  containerStyle: ContainerStyle;
  labelStyle: LabelStyle;
  dividerLine?: DividerLine;
  endInnerColor?: string;
  isRenderable: boolean;
  /** The label's font size, if it was laid out for one (shrunk to fit). */
  fontSize?: number;
}

export interface StateEdge {
  id: string;
  start: string;
  end: string;
  text: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: ExcalidrawLinearElement["strokeStyle"];
  isNoteEdge?: boolean;
  /**
   * Where along the edge (0 at its start, 1 at its end, by length) its label
   * is centered, if not halfway.
   */
  labelPosition?: number;
  /**
   * Routed orthogonally (stepped): drawn as an elbow arrow along its route,
   * not curved through its points.
   */
  orthogonal?: boolean;
}

export interface State {
  type: "state";
  nodes: StateNode[];
  edges: StateEdge[];
  /** Drawn as is, e.g. the dashed separators of concurrent regions. */
  lines?: Line[];
  /** Drawn as is, e.g. labels drawn beside their transition. */
  texts?: Text[];
}

/** A rectangle's bounds. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A Gantt task: a bar (or a milestone's diamond) and its name. */
export interface GanttTask {
  id: string;
  /** Not drawn for tasks without dates (`undefined`), only labeled. */
  shape?: "bar" | "milestone";
  /** The bar's (or diamond's) bounds. */
  box?: Box;
  status?: "active" | "done";
  crit: boolean;
  /** Where Pele drew the name: in the bar, or next to it. */
  label: { inside: boolean; text: Text };
  /** The link set by `click <id> href`. */
  link?: string;
}

/** A Gantt chart, its parts listed in the order they're drawn (back to front). */
export interface Gantt {
  type: "gantt";
  /** The (filled, every other) sections' background bands. */
  sections: Box[];
  /** Days excluded by `excludes` (e.g. weekends). */
  excluded: Box[];
  /** The ticks' (dotted) lines across the chart. */
  gridLines: Line[];
  /** The time axis' lines, below the chart (and above it, with `topAxis`). */
  axisLines: Line[];
  /** `vert` tasks' (dashed) lines across the chart. */
  verticals: Line[];
  /** The line marking today (unless `todayMarker off`), styled as set. */
  today?: Line & { opacity?: number };
  tasks: GanttTask[];
  /** Sections', ticks' and `vert` tasks' labels, and the title. */
  sectionLabels: Text[];
  axisLabels: Text[];
  verticalLabels: Text[];
  title?: Text;
}

/** A quadrant chart's point: a circle, and its name next to it. */
export interface QuadrantPoint {
  /** The circle's center. */
  x: number;
  y: number;
  radius: number;
  /** As styled (`color`, by `classDef` or on the point), if set. */
  fill?: string;
  /** The outline, drawn only if `stroke-width` is set. */
  stroke?: { color?: string; width: number };
  label?: Text;
}

/** A quadrant chart, its parts listed in the order they're drawn (back to front). */
export interface QuadrantChart {
  type: "quadrant";
  /** `quadrant-1` (top right) to `quadrant-4` (bottom right). */
  quadrants: { box: Box; label?: Text }[];
  /** The axes' labels, the y axis' ones turned (`angle`, in radians). */
  axisLabels: (Text & { angle?: number })[];
  /** In the order Pele draws them: last to first (the first one on top). */
  points: QuadrantPoint[];
  title?: Text;
}

/**
 * A timeline's color, as Pele colors sections (or, without sections, periods)
 * in turn: one of its series' colors, or its muted color.
 */
export interface TimelineColor {
  /**
   * The series' index (from 0; Pele has 8 colors, then repeats them), or
   * `undefined` for the muted color, of periods before the first section.
   */
  series?: number;
  /** The series' color as themed (`cScale0` to `cScale7`), if set. */
  fill?: string;
  /** The color Pele picked for text on a themed `fill`. */
  text?: string;
}

/** A timeline's box: a section's, a period's or an event's, and its text. */
export interface TimelineBox {
  box: Box;
  label?: Text;
}

/** A time period, its events below it (or next to it, `timeline TD`). */
export interface TimelinePeriod extends TimelineBox {
  color: TimelineColor;
  /** The dot marking the period on the axis. */
  dot?: Position & { radius: number };
  events: TimelineBox[];
}

/** A timeline, its parts listed in the order they're drawn (back to front). */
export interface Timeline {
  type: "timeline";
  /**
   * `LR`: periods in a row, their events below them; `TD` (`timeline TD`):
   * periods in a column, their events next to them.
   */
  direction: "LR" | "TD";
  /** The arrow periods are placed along, if there are periods. */
  axis?: { start: Position; end: Position };
  /** Sections' headers, above their periods (or `timeline TD`, before them). */
  sections: (TimelineBox & { color: TimelineColor })[];
  periods: TimelinePeriod[];
  title?: Text;
}

export interface GraphImage {
  type: "graphImage";
  mimeType: string;
  dataURL: string;
  width: number;
  height: number;
}

/**
 * The Mermaid config options `parseMermaidToExcalidraw` supports (the rest of
 * Mermaid's config is ignored).
 */
export interface MermaidConfig {
  /**
   * Whether flowchart edges and state transitions are drawn as elbow arrows
   * (routed orthogonally): for both, or per diagram type. A curve set in the
   * definition (front matter, `%%{init}%%`) wins. Swimlanes' edges are always
   * elbow arrows.
   * @default false
   */
  elbow?: boolean | { flowchart?: boolean; state?: boolean };
  /**
   * Theme variables
   * @default { fontSize: "20px" }
   */
  themeVariables?: {
    fontSize?: string;
  };
  /**
   * Maximum number of edges to be rendered.
   * @default 500
   */
  maxEdges?: number;
  /**
   * Maximum number of characters to be rendered.
   * @default 50000
   */
  maxTextSize?: number;
}

export interface MermaidToExcalidrawResult {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}
