import {
  Arrowhead,
  ExcalidrawTextElement,
} from "@excalidraw/excalidraw/types/element/types";
import {
  CONTAINER_STYLE_PROPERTY,
  Edge,
  Graph,
  LABEL_STYLE_PROPERTY,
  SubGraph,
  Vertex,
} from "../interfaces";
import { ExcalidrawVertexElement } from "../types";
import { Mutable } from "@excalidraw/excalidraw/types/utility-types";
import { removeMarkdown } from "@excalidraw/markdown-to-text";

/**
 * Compute groupIds for each element
 */
export const computeGroupIds = (
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

interface ArrowType {
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
}
/**
 * Convert mermaid edge type to Excalidraw arrow type
 */
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

export const computeExcalidrawArrowType = (
  mermaidArrowType: string
): ArrowType => {
  return MERMAID_EDGE_TYPE_MAPPER[mermaidArrowType];
};

// Get text from graph elements, fallback markdown to text
export const getText = (element: Vertex | Edge | SubGraph): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    text = removeMarkdown(element.text);
  }

  return removeFontAwesomeIcons(text);
};

/**
 * Remove font awesome icons support from text
 */
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};

/**
 * Compute style for vertex
 */
export const computeExcalidrawVertexStyle = (
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

/**
 * Compute style for label
 */
export const computeExcalidrawVertexLabelStyle = (
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
