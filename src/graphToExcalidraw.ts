import { Graph } from "./interfaces";

interface ExcalidrawElement {
  [key: string]: any;
}
interface GraphToExcalidrawOptions {
  fontSize?: number;
}
export const graphToExcalidraw = (
  graph: Graph,
  options: GraphToExcalidrawOptions = {}
): ExcalidrawElement[] => {
  const elements: ExcalidrawElement[] = [];
  const fontSize = options.fontSize || 20;
  const { getGroupIds, getParentId } = computeGroupIds(graph);

  // Clusters
  graph.clusters.reverse().forEach((cluster) => {
    const groupIds = getGroupIds(cluster.id);

    const containerElement = {
      id: cluster.id,
      type: "rectangle",
      groupIds,
      x: cluster.x,
      y: cluster.y,
      width: cluster.width,
      height: cluster.height,
      label: {
        groupIds,
        text: cluster.title,
        fontSize: fontSize,
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
      ...((vertex.type === "round" || vertex.type === "stadium") && {
        roundness: { type: 3 },
      }),
      label: {
        groupIds,
        text: vertex.text,
        fontSize: fontSize,
      },
      link: vertex.link || undefined,
    };

    if (vertex.type === "doublecircle") {
      // Create new groupId for double circle
      groupIds.push(`doublecircle_${vertex.id}}`);
      // Create inner circle element
      const innerCircle = {
        type: "ellipse",
        groupIds,
        x: vertex.x + 5,
        y: vertex.y + 5,
        width: vertex.width - 10,
        height: vertex.height - 10,
        strokeWidth: 2,
        roundness: { type: 3 },
        label: {
          groupIds,
          text: vertex.text,
          fontSize: fontSize,
        },
      };
      containerElement.label = undefined;
      containerElement.groupIds = groupIds;
      containerElement.type = "ellipse";
      elements.push(innerCircle);
    }
    if (vertex.type === "circle") {
      containerElement.type = "ellipse";
    }
    if (vertex.type === "diamond") {
      containerElement.type = "diamond";
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
    const { startX, startY, endX, endY, reflectionPoints } = edge;

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
      x2: endX,
      y2: endY,
      strokeWidth: edge.stroke === "thick" ? 4 : 2,
      strokeStyle: edge.stroke === "dotted" ? "dashed" : undefined,
      points: points,
      ...(edge.text
        ? { label: { text: edge.text, fontSize: fontSize, groupIds } }
        : {}),
      roundness: {
        type: 2,
      },
      ...arrowType,
    };

    // Bind start and end vertex to arrow
    const startVertex = elements.find((e) => e.id === edge.start);
    const endVertex = elements.find((e) => e.id === edge.end);
    if (!startVertex || !endVertex) return;

    containerElement.start = {
      id: startVertex.id,
    };
    containerElement.end = {
      id: endVertex.id,
    };

    elements.push(containerElement);
  });

  return elements;
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
      if (!tree[id]) return;
      let curr = tree[id];
      const groupIds: string[] = [];
      if (!curr.isLeaf) groupIds.push(`cluster_group_${curr.id}`);

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
  startArrowhead?: string;
  endArrowhead?: string;
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
