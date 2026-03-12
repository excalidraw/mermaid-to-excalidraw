import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";

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
}

export interface Position {
  x: number;
  y: number;
}

export interface GraphImage {
  type: "graphImage";
  mimeType: string;
  dataURL: string;
  width: number;
  height: number;
}

export interface MermaidToExcalidrawResult {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}
