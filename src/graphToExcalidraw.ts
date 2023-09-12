import { MermaidOptions } from ".";
import { FlowchartToExcalidrawSkeletonConverter } from "./converter/types/flowchart";
import { GraphImageConverter } from "./converter/types/graphImage";
import { Graph, GraphImage, MermaidToExcalidrawResult } from "./interfaces";

export const graphToExcalidraw = (
  graph: Graph | GraphImage,
  options: MermaidOptions = {}
): MermaidToExcalidrawResult => {
  switch (graph.type) {
    case "graphImage": {
      return GraphImageConverter.convert(graph, options);
    }
    case "flowchart": {
      return FlowchartToExcalidrawSkeletonConverter.convert(graph, options);
    }
    default: {
      throw new Error(
        `graphToExcalidraw: unknown graph type "${
          (graph as any).type
        }, only flowcharts are supported!"`
      );
    }
  }
};
