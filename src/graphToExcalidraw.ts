import { removeMarkdown } from "@excalidraw/markdown-to-text";
import { DEFAULT_FONT_SIZE } from "./constants";
import {
  Cluster,
  CONTAINER_STYLE_PROPERTY,
  Edge,
  Graph,
  GraphImage,
  LABEL_STYLE_PROPERTY,
  Vertex,
  VERTEX_TYPE,
} from "./interfaces";
import { BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";
import {
  Arrowhead,
  FileId,
  ExcalidrawTextElement,
} from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawVertexElement } from "./types";
import { nanoid } from "nanoid";
import { Mutable } from "./utils/types";

interface GraphToExcalidrawOptions {
  fontSize?: number;
}
interface GraphToExcalidrawResult {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}
export const graphToExcalidraw = (
  graph: Graph | GraphImage,
  options: GraphToExcalidrawOptions = {}
): GraphToExcalidrawResult => {
  if (graph.type === "graphImage") {
    const imageId = nanoid() as FileId;

    const { width, height } = graph;
    const imageElement: ExcalidrawElementSkeleton = {
      type: "image",
      x: 0,
      y: 0,
      width,
      height,
      status: "saved",
      fileId: imageId,
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

  const elements: ExcalidrawElementSkeleton[] = [];
  const fontSize = options.fontSize || DEFAULT_FONT_SIZE;
  const { getGroupIds, getParentId } = computeGroupIds(graph);

  // Clusters
  graph.clusters.reverse().forEach((cluster) => {
    const groupIds = getGroupIds(cluster.id);

    const containerElement: ExcalidrawElementSkeleton = {
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
    if (!vertex) {
      return;
    }
    const groupIds = getGroupIds(vertex.id);

    // Compute custom style
    const containerStyle = computeExcalidrawVertexStyle(vertex.containerStyle);
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
const MERMAID_EDGE_TYPE_MAPPER: { [key: string]: ArrowType } = {
  arrow_circle: {
    endArrowhead: "dot",
  },
  arrow_cross: {
    endArrowhead: "bar",
  },
  double_arrow_circle: {
    endArrowhead: "dot",
    startArrowhead: "dot",
  },
  double_arrow_cross: {
    endArrowhead: "bar",
    startArrowhead: "bar",
  },
  double_arrow_point: {
    endArrowhead: "arrow",
    startArrowhead: "arrow",
  },
};
const computeExcalidrawArrowType = (mermaidArrowType: string): ArrowType => {
  return MERMAID_EDGE_TYPE_MAPPER[mermaidArrowType];
};

// Get text from graph elements, fallback markdown to text
const getText = (element: Vertex | Edge | Cluster): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    text = removeMarkdown(element.text);
  }

  return removeFontAwesomeIcons(text);
};

// Remove font awesome icons support from text
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};

// Compute style for vertex
const computeExcalidrawVertexStyle = (
  style: Vertex["containerStyle"]
): Partial<Mutable<ExcalidrawVertexElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawVertexElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case CONTAINER_STYLE_PROPERTY.FILL: {
        excalidrawProperty.backgroundColor = style[property];
        excalidrawProperty.fillStyle = "solid";
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH: {
        excalidrawProperty.strokeWidth = Number(
          style[property]?.split("px")[0]
        );
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY: {
        excalidrawProperty.strokeStyle = "dashed";
        break;
      }
    }
  });
  return excalidrawProperty;
};

// Compute style for label
const computeExcalidrawVertexLabelStyle = (
  style: Vertex["labelStyle"]
): Partial<Mutable<ExcalidrawTextElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawTextElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case LABEL_STYLE_PROPERTY.COLOR: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
    }
  });
  return excalidrawProperty;
};
