import { GraphConverter } from "../GraphConverter.js";
import type {
  ExcalidrawElementSkeleton,
  ValidLinearElement,
} from "@excalidraw/excalidraw/element/transform";
import type { LocalPoint } from "@excalidraw/excalidraw/math/types";

const localPoint = (x: number, y: number) => [x, y] as LocalPoint;

import {
  getText,
  computeExcalidrawVertexStyle,
  computeExcalidrawVertexLabelStyle,
  computeExcalidrawArrowType,
} from "../helpers.js";
import { VERTEX_TYPE } from "../../interfaces.js";
import { Flowchart } from "../../parser/flowchart.js";
import { DEFAULT_FONT_SIZE } from "../../constants.js";

const SUBGRAPH_LABEL_HORIZONTAL_PADDING = 32;
const SUBGRAPH_LABEL_WIDTH_RATIO = 0.62;
const VERTEX_LABEL_HORIZONTAL_PADDING = 12;
const MIN_VERTEX_LABEL_FONT_SIZE = 12;

const estimateLabelWidth = (text: string, fontSize: number) => {
  return Math.max(
    20,
    Math.ceil(text.length * fontSize * SUBGRAPH_LABEL_WIDTH_RATIO)
  );
};

const computeVertexLabelFontSize = (
  vertexType: string,
  text: string,
  width: number,
  fontSize?: number
) => {
  const safeFontSize = fontSize || DEFAULT_FONT_SIZE;
  if ((vertexType !== VERTEX_TYPE.CYLINDER) || !text || text.includes("\n")) {
    return safeFontSize;
  }

  const availableWidth = Math.max(20, width - VERTEX_LABEL_HORIZONTAL_PADDING);
  const estimatedWidth = estimateLabelWidth(text, safeFontSize);
  if (estimatedWidth <= availableWidth) {
    return safeFontSize;
  }

  return Math.max(
    MIN_VERTEX_LABEL_FONT_SIZE,
    Math.floor(availableWidth / (text.length * SUBGRAPH_LABEL_WIDTH_RATIO))
  );
};

const computeGroupIds = (
  graph: Flowchart
): {
  getGroupIds: (elementId: string) => string[];
  getParentId: (elementId: string) => string | null;
} => {
  // Parse the diagram into a tree for rendering and grouping
  const tree: {
    [key: string]: {
      id: string;
      parent: string | null;
      isLeaf: boolean; // true = vertex, false = subGraph
    };
  } = {};
  graph.subGraphs.map((subGraph) => {
    subGraph.nodeIds.forEach((nodeId) => {
      tree[subGraph.id] = {
        id: subGraph.id,
        parent: null,
        isLeaf: false,
      };
      tree[nodeId] = {
        id: nodeId,
        parent: subGraph.id,
        isLeaf: graph.vertices[nodeId] !== undefined,
      };
    });
  });
  const mapper: {
    [key: string]: string[];
  } = {};
  [...Object.keys(graph.vertices), ...graph.subGraphs.map((c) => c.id)].forEach(
    (id) => {
      if (!tree[id]) {
        return;
      }
      let curr = tree[id];
      const groupIds: string[] = [];
      if (!curr.isLeaf) {
        groupIds.push(`subgraph_group_${curr.id}`);
      }

      while (true) {
        if (curr.parent) {
          groupIds.push(`subgraph_group_${curr.parent}`);
          curr = tree[curr.parent];
        } else {
          break;
        }
      }

      mapper[id] = groupIds;
    }
  );

  return {
    getGroupIds: (elementId) => {
      return mapper[elementId] || [];
    },
    getParentId: (elementId) => {
      return tree[elementId] ? tree[elementId].parent : null;
    },
  };
};

export const FlowchartToExcalidrawSkeletonConverter = new GraphConverter({
  converter: (graph: Flowchart, options) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const fontSize = options.fontSize;
    const { getGroupIds, getParentId } = computeGroupIds(graph);

    // SubGraphs
    graph.subGraphs.reverse().forEach((subGraph) => {
      const groupIds = getGroupIds(subGraph.id);
      const subGraphText = getText(subGraph);
      const safeFontSize = fontSize || 16;
      const estimatedTextWidth = estimateLabelWidth(subGraphText, safeFontSize);
      const minSubGraphWidth =
        estimatedTextWidth + SUBGRAPH_LABEL_HORIZONTAL_PADDING * 2;
      const width = Math.max(subGraph.width, minSubGraphWidth);
      const x = subGraph.x - (width - subGraph.width) / 2;

      const containerStyle = computeExcalidrawVertexStyle(
        subGraph.containerStyle
      );
      const labelStyle = computeExcalidrawVertexLabelStyle(subGraph.labelStyle);

      const containerElement: ExcalidrawElementSkeleton = {
        id: subGraph.id,
        type: "rectangle",
        groupIds,
        x,
        y: subGraph.y,
        width,
        height: subGraph.height,
        label: {
          groupIds,
          text: subGraphText,
          fontSize,
          verticalAlign: "top",
          ...labelStyle,
        },
        ...containerStyle,
      };

      elements.push(containerElement);
    });

    // Vertices
    Object.values(graph.vertices).forEach((vertex) => {
      if (!vertex) {
        return;
      }
      const groupIds = getGroupIds(vertex.id);
      const vertexText = getText(vertex);
      const vertexLabelFontSize = computeVertexLabelFontSize(
        vertex.type,
        vertexText,
        vertex.width,
        fontSize
      );

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
          text: vertexText,
          fontSize: vertexLabelFontSize,
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
              text: vertexText,
              fontSize: vertexLabelFontSize,
              ...labelStyle,
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
      const points = reflectionPoints.map((point) =>
        localPoint(
          point.x - reflectionPoints[0].x,
          point.y - reflectionPoints[0].y
        )
      );

      // Get supported arrow type
      const arrowType = computeExcalidrawArrowType(edge.type || "arrow_point");

      // Bind start and end vertex to arrow
      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);
      if (!startVertex || !endVertex) {
        return;
      }

      const arrowId = `${edge.start}_${edge.end}`;
      const containerElement: ValidLinearElement = {
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
        start: {
          id: startVertex.id || "",
        },
        end: {
          id: endVertex.id || "",
        },
      };

      elements.push(containerElement);
    });

    return {
      elements,
    };
  },
});
