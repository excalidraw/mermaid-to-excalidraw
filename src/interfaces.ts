export interface Vertice {
  id: string;
  type: string;
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
  nodes: string[];
  title: string;
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
  vertices: { [key: string]: Vertice };
  edges: Edge[];
}
