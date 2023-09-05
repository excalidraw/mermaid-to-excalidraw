import { FlowchartConverter } from "./converter/types/flowchart";
import { GraphImageConverter } from "./converter/types/graphImage";
import {
  Graph,
  GraphImage,
  GraphToExcalidrawOptions,
  GraphToExcalidrawResult,
} from "./interfaces";

export const graphToExcalidraw = (
  graph: Graph | GraphImage,
  options: GraphToExcalidrawOptions = {}
): GraphToExcalidrawResult => {
  switch (graph.type) {
    case "graphImage": {
      return GraphImageConverter.convert(graph, options);
    }
    case "flowchart": {
      return FlowchartConverter.convert(graph, options);
    }
    default: {
      throw new Error(
        `graphToExcalidraw: unknown graph type "${(graph as any).type}"`
      );
    }
  }
};
