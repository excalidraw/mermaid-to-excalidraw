export enum VERTEX_TYPE {
  ROUND = "round",
  STADIUM = "stadium",
  DOUBLECIRCLE = "doublecircle",
  CIRCLE = "circle",
  DIAMOND = "diamond",
}
export enum STYLE_PROPERTY {
  COLOR = "color",
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
  style: { [key in STYLE_PROPERTY]: string };
}

export interface Cluster {
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

export interface Graph {
  type: "graph";
  clusters: Cluster[];
  vertices: { [key: string]: Vertex };
  edges: Edge[];
}
