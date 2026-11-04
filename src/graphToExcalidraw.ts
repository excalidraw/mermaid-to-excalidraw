import { ExcalidrawConfig } from "./index.js";
import { FlowchartToExcalidrawSkeletonConverter } from "./converter/types/flowchart.js";
import { GraphImageConverter } from "./converter/types/graphImage.js";
import {
  GraphImage,
  MermaidToExcalidrawResult,
  Sequence,
  Flowchart,
  Class,
  ERD,
  State,
  Gantt,
  QuadrantChart,
  Timeline,
} from "./interfaces.js";
import { SequenceToExcalidrawSkeletonConvertor } from "./converter/types/sequence.js";
import { classToExcalidrawSkeletonConvertor } from "./converter/types/class.js";
import { erToExcalidrawSkeletonConvertor } from "./converter/types/er.js";
import { stateToExcalidrawSkeletonConvertor } from "./converter/types/state.js";
import { ganttToExcalidrawSkeletonConvertor } from "./converter/types/gantt.js";
import { quadrantToExcalidrawSkeletonConvertor } from "./converter/types/quadrant.js";
import { timelineToExcalidrawSkeletonConvertor } from "./converter/types/timeline.js";
import { normalizeLinearElementPoints } from "./utils.js";

/**
 * Converts a graph with the converters of all diagram types, synchronously
 * (`parseMermaidToExcalidraw` loads each diagram type's on first use).
 */
export const graphToExcalidraw = (
  graph:
    | Flowchart
    | GraphImage
    | Sequence
    | Class
    | ERD
    | State
    | Gantt
    | QuadrantChart
    | Timeline,
  options: ExcalidrawConfig = {}
): MermaidToExcalidrawResult => {
  const result = (() => {
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

      case "erd": {
        return erToExcalidrawSkeletonConvertor.convert(graph, options);
      }

      case "state": {
        return stateToExcalidrawSkeletonConvertor.convert(graph, options);
      }

      case "gantt": {
        return ganttToExcalidrawSkeletonConvertor.convert(graph, options);
      }

      case "quadrant": {
        return quadrantToExcalidrawSkeletonConvertor.convert(graph, options);
      }

      case "timeline": {
        return timelineToExcalidrawSkeletonConvertor.convert(graph, options);
      }

      default: {
        throw new Error(
          `graphToExcalidraw: unknown graph type "${
            (graph as any).type
          }, only flowcharts are supported!"`
        );
      }
    }
  })();

  return normalizeLinearElementPoints(result);
};
