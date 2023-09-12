import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";
import { BinaryFiles } from "@excalidraw/excalidraw/types/types";

export enum VERTEX_TYPE {
  ROUND = "round",
  STADIUM = "stadium",
  DOUBLECIRCLE = "doublecircle",
  CIRCLE = "circle",
  DIAMOND = "diamond",
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
  containerStyle: { [key in CONTAINER_STYLE_PROPERTY]?: string };
  labelStyle: { [key in LABEL_STYLE_PROPERTY]?: string };
}

export interface SubGraphs {
  id: string;
  nodeIds: string[];
  text: string;
  labelType: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Edge {
  start: string;
  end: string;
  type: string;
  text: string;
  labelType: string;
  stroke: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}

export interface GraphImage {
  type: "graphImage";
  mimeType: string;
  dataURL: string;
  width: number;
  height: number;
}

type ImplementedGraphTypes = "flowchart";

export interface Graph {
  type: ImplementedGraphTypes;
  subGraphs: SubGraphs[];
  vertices: { [key: string]: Vertex | undefined };
  edges: Edge[];
}

export interface MermaidToExcalidrawResult {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}
