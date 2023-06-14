import markdownToText from "markdown-to-text";
import { DEFAULT_FONT_SIZE } from "./constants";
import {
  Cluster,
  Edge,
  Graph,
  GraphImage,
  Vertex,
  VertexType,
} from "./interfaces";
import { BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { Arrowhead, FileId } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawElement } from "./types";

// TODO: update the README.md for the API change
interface GraphToExcalidrawOptions {
  fontSize?: number;
}
interface GraphToExcalidrawResult {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
}
export const graphToExcalidraw = (
  graph: Graph | GraphImage,
  options: GraphToExcalidrawOptions = {}
): GraphToExcalidrawResult => {
  if (graph.type === "graphImage") {
    const imageId = crypto.randomUUID() as FileId;
    // TODO: refactor image element data once the API is supported
    const { width, height } = graph;
    const imageElement: ExcalidrawElement = {
      type: "image",
      id: "61oaFzp4DF-DSUqLSzGKw",
      x: 0,
      y: 0,
      width,
      height,
      angle: 0,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 4,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      roundness: null,
      seed: 938432494,
      version: 5,
      versionNonce: 1748022382,
      isDeleted: false,
      boundElements: null,
      updated: 1686726871374,
      link: null,
      locked: false,
      status: "saved",
      fileId: imageId,
      scale: [1, 1],
    };
    const files = {
      [imageId]: {
        id: imageId,
        mimeType: graph.mimeType,
        dataURL: graph.dataURL,
      },
    } as BinaryFiles;
    return { files, elements: [imageElement] };
  }

  const elements: ExcalidrawElement[] = [];
  const fontSize = options.fontSize || DEFAULT_FONT_SIZE;
  const { getGroupIds, getParentId } = computeGroupIds(graph);

  // Clusters
  graph.clusters.reverse().forEach((cluster) => {
    const groupIds = getGroupIds(cluster.id);

    const containerElement: ExcalidrawElement = {
      id: cluster.id,
      type: "rectangle",
      groupIds,
      x: cluster.x,
      y: cluster.y,
      width: cluster.width,
      height: cluster.height,
      label: {
        groupIds,
        text: getText(cluster),
        fontSize,
        verticalAlign: "top",
      },
    };

    elements.push(containerElement);
  });

  // Vertices
  Object.values(graph.vertices).forEach((vertex) => {
    const groupIds = getGroupIds(vertex.id);

    const containerElement: ExcalidrawElement = {
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
      },
      link: vertex.link || null,
    };

    switch (vertex.type) {
      case VertexType.STADIUM: {
        containerElement.roundness = { type: 3 };
        break;
      }
      case VertexType.ROUND: {
        containerElement.roundness = { type: 3 };
        break;
      }
      case VertexType.DOUBLECIRCLE: {
        const CIRCLE_MARGIN = 5;
        // Create new groupId for double circle
        groupIds.push(`doublecircle_${vertex.id}}`);
        // Create inner circle element
        const innerCircle: ExcalidrawElement = {
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
        containerElement.label = undefined;
        containerElement.groupIds = groupIds;
        containerElement.type = "ellipse";
        elements.push(innerCircle);
        break;
      }
      case VertexType.CIRCLE: {
        containerElement.type = "ellipse";
        break;
      }
      case VertexType.DIAMOND: {
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
    const containerElement: ExcalidrawElement = {
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
};

/* Helper Functions */

// Compute groupIds for each element
const computeGroupIds = (
  graph: Graph
): {
  getGroupIds: (elementId: string) => string[];
  getParentId: (elementId: string) => string | null;
} => {
  // Parse the diagram into a tree for rendering and grouping
  const tree: {
    [key: string]: {
      id: string;
      parent: string | null;
      isLeaf: boolean; // true = vertex, false = cluster
    };
  } = {};
  graph.clusters.map((cluster) => {
    cluster.nodeIds.forEach((nodeId) => {
      tree[cluster.id] = {
        id: cluster.id,
        parent: null,
        isLeaf: false,
      };
      tree[nodeId] = {
        id: nodeId,
        parent: cluster.id,
        isLeaf: graph.vertices[nodeId] !== undefined,
      };
    });
  });
  const mapper: {
    [key: string]: string[];
  } = {};
  [...Object.keys(graph.vertices), ...graph.clusters.map((c) => c.id)].forEach(
    (id) => {
      if (!tree[id]) {
        return;
      }
      let curr = tree[id];
      const groupIds: string[] = [];
      if (!curr.isLeaf) {
        groupIds.push(`cluster_group_${curr.id}`);
      }

      while (true) {
        if (curr.parent) {
          groupIds.push(`cluster_group_${curr.parent}`);
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

// Convert mermaid edge type to Excalidraw arrow type
interface ArrowType {
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
}
const computeExcalidrawArrowType = (mermaidEdgeType: string): ArrowType => {
  const arrowType: ArrowType = {};
  if (mermaidEdgeType === "arrow_circle") {
    arrowType.endArrowhead = "dot";
  } else if (mermaidEdgeType === "arrow_cross") {
    arrowType.endArrowhead = "bar";
  } else if (mermaidEdgeType === "double_arrow_circle") {
    arrowType.endArrowhead = "dot";
    arrowType.startArrowhead = "dot";
  } else if (mermaidEdgeType === "double_arrow_cross") {
    arrowType.endArrowhead = "bar";
    arrowType.startArrowhead = "bar";
  } else if (mermaidEdgeType === "double_arrow_point") {
    arrowType.endArrowhead = "arrow";
    arrowType.startArrowhead = "arrow";
  }

  return arrowType;
};

// Get text from graph elements, fallback markdown to text
const getText = (element: Vertex | Edge | Cluster): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    text = markdownToText(element.text);
  }

  return removeFontAwesomeIcons(text);
};

// Remove font awesome icons support from text
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};
