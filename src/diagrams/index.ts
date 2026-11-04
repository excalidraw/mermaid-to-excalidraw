import type { ParsedDiagramModel } from "pele/lazy";

import type { MermaidToExcalidrawResult } from "../interfaces.js";
import type { ParsedDiagram } from "../parseDiagram.js";

/**
 * The code that reads each converted diagram type from Pele's layout and
 * converts it to Excalidraw elements, loaded on first use: bundlers emit a
 * chunk per diagram type, so converting a diagram downloads the code for its
 * type only (as Pele's own code, with "pele/lazy").
 */
const DIAGRAM_TYPES = {
  flowchart: () => import("./flowchart.js"),
  sequence: () => import("./sequence.js"),
  class: () => import("./class.js"),
  er: () => import("./er.js"),
  state: () => import("./state.js"),
  gantt: () => import("./gantt.js"),
  quadrantChart: () => import("./quadrant.js"),
  timeline: () => import("./timeline.js"),
} satisfies Partial<Record<ParsedDiagramModel["type"], () => Promise<unknown>>>;

/** Pele's diagram types converted to Excalidraw elements (others become images) */
export type ConvertedDiagramType = keyof typeof DIAGRAM_TYPES;

export const isConvertedDiagramType = (
  type: string | null
): type is ConvertedDiagramType =>
  !!type && Object.prototype.hasOwnProperty.call(DIAGRAM_TYPES, type);

/** Loads a diagram type's code (once: later calls get the same module). */
export const loadDiagramType = <T extends ConvertedDiagramType>(type: T) =>
  DIAGRAM_TYPES[type]() as ReturnType<(typeof DIAGRAM_TYPES)[T]>;

// The diagram types of the graphs `parsePele` reads diagrams into
const GRAPH_DIAGRAM_TYPES: Record<
  Exclude<ParsedDiagram["type"], "graphImage">,
  ConvertedDiagramType
> = {
  flowchart: "flowchart",
  sequence: "sequence",
  class: "class",
  erd: "er",
  state: "state",
  gantt: "gantt",
  quadrant: "quadrantChart",
  timeline: "timeline",
};

/** Converts a graph (but not an image) with its diagram type's converter. */
export const convertGraph = async (
  graph: Exclude<ParsedDiagram, { type: "graphImage" }>,
  options: { fontSize?: number }
): Promise<MermaidToExcalidrawResult> => {
  const { converter } = await loadDiagramType(GRAPH_DIAGRAM_TYPES[graph.type]);
  // (each converter takes its own diagram type's graph)
  return (
    converter as { convert: (graph: unknown, options: object) => unknown }
  ).convert(graph, options) as MermaidToExcalidrawResult;
};
