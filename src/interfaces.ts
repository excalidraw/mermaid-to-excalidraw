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
   * Routed orthogonally (as Pele routes swimlanes' edges): drawn as an elbow
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
   * The flowchart curve style.
   * @default "linear"
   */
  flowchart?: {
    curve?: "linear" | "basis";
  };
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
