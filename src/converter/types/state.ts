import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";

import { GraphConverter } from "../GraphConverter.js";
import {
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawArrowSkeleton,
} from "../transformToExcalidrawSkeleton.js";

import type { State } from "../../parser/state.js";
import type { Arrow } from "../../elementSkeleton.js";

export const StateToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: State) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    chart.nodes.forEach((node) => {
      const element = transformToExcalidrawContainerSkeleton(node);

      Object.assign(element, {
        roundness: { type: 3 },
      });

      elements.push(element);
    });

    chart.edges.forEach((edge) => {
      const points = edge.reflectionPoints.map((point) => [
        point.x - edge.reflectionPoints[0].x,
        point.y - edge.reflectionPoints[0].y,
      ]);

      const arrow: Arrow = {
        ...edge,
        endArrowhead: "arrow",
        points,
      };

      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);

      if (!startVertex || !endVertex) {
        return;
      }

      arrow.start = {
        id: startVertex.id,
        type: "rectangle",
      };
      arrow.end = {
        id: endVertex.id,
        type: "rectangle",
      };

      elements.push(transformToExcalidrawArrowSkeleton(arrow));
    });

    return { elements };
  },
});
