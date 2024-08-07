import { ExcalidrawConfig } from "./index.js";
import { FlowchartToExcalidrawSkeletonConverter } from "./converter/types/flowchart.js";
import { GraphImageConverter } from "./converter/types/graphImage.js";
import { GraphImage, MermaidToExcalidrawResult } from "./interfaces.js";
import { SequenceToExcalidrawSkeletonConvertor } from "./converter/types/sequence.js";
import { Sequence } from "./parser/sequence.js";
import { Flowchart } from "./parser/flowchart.js";
import { Class } from "./parser/class.js";
import { classToExcalidrawSkeletonConvertor } from "./converter/types/class.js";

export const graphToExcalidraw = (
  graph: Flowchart | GraphImage | Sequence | Class,
  options: ExcalidrawConfig = {}
): MermaidToExcalidrawResult => {
  switch (graph.type) {
    case "graphImage": {
      return GraphImageConverter.convert(graph, options);
    }

    case "flowchart": {
      return FlowchartToExcalidrawSkeletonConverter.convert(graph, options);
    }

    case "sequence": {
      return SequenceToExcalidrawSkeletonConvertor.convert(graph, options);
    }

    case "class": {
      return classToExcalidrawSkeletonConvertor.convert(graph, options);
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
