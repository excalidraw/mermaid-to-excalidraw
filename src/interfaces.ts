export enum VertexType {
  ROUND = "round",
  STADIUM = "stadium",
  DOUBLECIRCLE = "doublecircle",
  CIRCLE = "circle",
  DIAMOND = "diamond",
}
export interface Vertex {
  id: string;
  type: VertexType;
  labelType: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  link?: string;
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

export interface Graph {
  clusters: Cluster[];
  vertices: { [key: string]: Vertex };
  edges: Edge[];
}
