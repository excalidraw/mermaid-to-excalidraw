import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";

import { GraphConverter } from "../GraphConverter.js";
import {
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawTextSkeleton,
  transformToExcalidrawLineSkeleton,
} from "../transformToExcalidrawSkeleton.js";

import type { State } from "../../parser/state.js";
import type { Arrow } from "../../elementSkeleton.js";
import type { Point } from "@excalidraw/excalidraw/types/types.js";

export const StateToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: State) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    chart.nodes.forEach((node) => {
      const groupIds = node.groupId?.split(", ");

      switch (node.type) {
        case "ellipse":
        case "diamond":
        case "rectangle":
          const element = transformToExcalidrawContainerSkeleton(node);

          if (node?.subtype !== "note") {
            Object.assign(element, {
              roundness: { type: 3 },
            });
          }

          if (node.groupId) {
            Object.assign(element, {
              label: {
                ...element.label,
                groupIds,
              },
              groupIds,
            });
          }

          elements.push(element);
          break;
        case "line":
          const line = transformToExcalidrawLineSkeleton(node);

          if (node.groupId) {
            Object.assign(line, {
              groupIds,
            });
          }

          elements.push(line);
          break;
        case "text":
          const text = transformToExcalidrawTextSkeleton(node);
          elements.push(text);
          break;
        default:
          throw `unknown type ${node.type}`;
      }
    });

    chart.edges.forEach((edge) => {
      if (!edge) {
        return;
      }

      const points = edge.reflectionPoints.map((point: Point) => [
        point.x - edge.reflectionPoints[0].x,
        point.y - edge.reflectionPoints[0].y,
      ]);

      const arrow: Arrow = {
        ...edge,
        endArrowhead: "triangle",
        points,
      };

      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);

      if (!startVertex || !endVertex) {
        return;
      }

      const groupIds = edge.groupId?.split(", ");

      if (endVertex.id?.includes("note") || startVertex.id?.includes("note")) {
        arrow.endArrowhead = null;
        arrow.strokeStyle = "dashed";
      }

      arrow.start = {
        id: startVertex.id,
        type: "rectangle",
      };
      arrow.end = {
        id: endVertex.id,
        type: "rectangle",
      };

      const arrowSkeleton = transformToExcalidrawArrowSkeleton(arrow);

      if (groupIds) {
        Object.assign(arrowSkeleton, {
          groupIds,
        });
      }

      elements.push(arrowSkeleton);
    });

    return { elements };
  },
});
