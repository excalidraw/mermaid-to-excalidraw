import { GraphConverter } from "../GraphConverter";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";

import {
  computeGroupIds,
  getText,
  computeExcalidrawVertexStyle,
  computeExcalidrawVertexLabelStyle,
  computeExcalidrawArrowType,
} from "../helpers";
import { VERTEX_TYPE } from "../../interfaces";

export const FlowchartToExcalidrawSkeletonConverter = new GraphConverter({
  converter: (graph, options) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const fontSize = options.fontSize;
    const { getGroupIds, getParentId } = computeGroupIds(graph);

    // SubGraphs
    graph.subGraphs.reverse().forEach((subGraph) => {
      const groupIds = getGroupIds(subGraph.id);

      const containerElement: ExcalidrawElementSkeleton = {
        id: subGraph.id,
        type: "rectangle",
        groupIds,
        x: subGraph.x,
        y: subGraph.y,
        width: subGraph.width,
        height: subGraph.height,
        label: {
          groupIds,
          text: getText(subGraph),
          fontSize,
          verticalAlign: "top",
        },
      };

      elements.push(containerElement);
    });

    // Vertices
    Object.values(graph.vertices).forEach((vertex) => {
      if (!vertex) {
        return;
      }
      const groupIds = getGroupIds(vertex.id);

      // Compute custom style
      const containerStyle = computeExcalidrawVertexStyle(
        vertex.containerStyle
      );
      const labelStyle = computeExcalidrawVertexLabelStyle(vertex.labelStyle);

      let containerElement: ExcalidrawElementSkeleton = {
        id: vertex.id,
        type: "rectangle",
        groupIds,
        x: vertex.x,
        y: vertex.y,
        width: vertex.width,
        height: vertex.height,
        strokeWidth: 2,
        label: {
          groupIds,
          text: getText(vertex),
          fontSize,
          ...labelStyle,
        },
        link: vertex.link || null,
        ...containerStyle,
      };

      switch (vertex.type) {
        case VERTEX_TYPE.STADIUM: {
          containerElement = { ...containerElement, roundness: { type: 3 } };
          break;
        }
        case VERTEX_TYPE.ROUND: {
          containerElement = { ...containerElement, roundness: { type: 3 } };
          break;
        }
        case VERTEX_TYPE.DOUBLECIRCLE: {
          const CIRCLE_MARGIN = 5;
          // Create new groupId for double circle
          groupIds.push(`doublecircle_${vertex.id}}`);
          // Create inner circle element
          const innerCircle: ExcalidrawElementSkeleton = {
            type: "ellipse",
            groupIds,
            x: vertex.x + CIRCLE_MARGIN,
            y: vertex.y + CIRCLE_MARGIN,
            width: vertex.width - CIRCLE_MARGIN * 2,
            height: vertex.height - CIRCLE_MARGIN * 2,
            strokeWidth: 2,
            roundness: { type: 3 },
            label: {
              groupIds,
              text: getText(vertex),
              fontSize,
            },
          };
          containerElement = { ...containerElement, groupIds, type: "ellipse" };
          elements.push(innerCircle);
          break;
        }
        case VERTEX_TYPE.CIRCLE: {
          containerElement.type = "ellipse";
          break;
        }
        case VERTEX_TYPE.DIAMOND: {
          containerElement.type = "diamond";
          break;
        }
      }

      elements.push(containerElement);
    });

    // Edges
    graph.edges.forEach((edge) => {
      let groupIds: string[] = [];
      const startParentId = getParentId(edge.start);
      const endParentId = getParentId(edge.end);
      if (startParentId && startParentId === endParentId) {
        groupIds = getGroupIds(startParentId);
      }

      // Get arrow position data
      const { startX, startY, reflectionPoints } = edge;

      // Calculate Excalidraw arrow's points
      const points = reflectionPoints.map((point) => [
        point.x - reflectionPoints[0].x,
        point.y - reflectionPoints[0].y,
      ]);

      // Get supported arrow type
      const arrowType = computeExcalidrawArrowType(edge.type);

      const arrowId = `${edge.start}_${edge.end}`;
      const containerElement: ExcalidrawElementSkeleton = {
        id: arrowId,
        type: "arrow",
        groupIds,
        x: startX,
        y: startY,
        // 4 and 2 are the Excalidraw's stroke width of thick and thin respectively
        // TODO: use constant exported from Excalidraw package
        strokeWidth: edge.stroke === "thick" ? 4 : 2,
        strokeStyle: edge.stroke === "dotted" ? "dashed" : undefined,
        points,
        ...(edge.text
          ? { label: { text: getText(edge), fontSize, groupIds } }
          : {}),
        roundness: {
          type: 2,
        },
        ...arrowType,
      };

      // Bind start and end vertex to arrow
      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);
      if (!startVertex || !endVertex) {
        return;
      }

      containerElement.start = {
        id: startVertex.id || "",
      };
      containerElement.end = {
        id: endVertex.id || "",
      };

      elements.push(containerElement);
    });

    return {
      elements,
    };
  },
});
