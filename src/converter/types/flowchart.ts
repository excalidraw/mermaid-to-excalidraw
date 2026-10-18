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
const EXCALIDRAW_LINE_HEIGHT = 1.25;
const EXCALIDRAW_BOUND_TEXT_PADDING = 5;

const estimateLabelWidth = (text: string, fontSize: number) => {
  const longestLineLength = Math.max(
    ...text.split("\n").map((line) => line.length)
  );

  return Math.max(
    20,
    Math.ceil(longestLineLength * fontSize * SUBGRAPH_LABEL_WIDTH_RATIO)
  );
};

type VerticalExpansion = {
  y: number;
  amount: number;
};

type RoutePoint = { x: number; y: number };
type SubGraphHorizontalLayout = {
  x: number;
  width: number;
  leftExpansion: number;
  rightExpansion: number;
};

const getElementBounds = (element: ExcalidrawElementSkeleton) => ({
  x: element.x ?? 0,
  y: element.y ?? 0,
  width: element.width || 0,
  height: element.height || 0,
});

const getElementCenter = (element: ExcalidrawElementSkeleton): RoutePoint => {
  const { x, y, width, height } = getElementBounds(element);
  return { x: x + width / 2, y: y + height / 2 };
};

const isPointInsideElement = (
  point: RoutePoint,
  element: ExcalidrawElementSkeleton
) => {
  const { x, y, width, height } = getElementBounds(element);
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
};

const getElementBoundaryPoint = (
  element: ExcalidrawElementSkeleton,
  target: RoutePoint
): RoutePoint => {
  const center = getElementCenter(element);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const halfWidth = (element.width || 0) / 2;
  const halfHeight = (element.height || 0) / 2;
  const scale = Math.min(
    dx ? halfWidth / Math.abs(dx) : Number.POSITIVE_INFINITY,
    dy ? halfHeight / Math.abs(dy) : Number.POSITIVE_INFINITY
  );

  if (!Number.isFinite(scale)) {
    return center;
  }

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
};

const attachRouteToElement = (
  routePoints: RoutePoint[],
  element: ExcalidrawElementSkeleton,
  endpoint: "start" | "end",
  fallbackTarget: RoutePoint
) => {
  const orderedPoints =
    endpoint === "start" ? routePoints : routePoints.slice().reverse();
  const firstOutsideIndex = orderedPoints.findIndex(
    (point) => !isPointInsideElement(point, element)
  );

  if (firstOutsideIndex === -1) {
    const adjustedPoints = [...orderedPoints];
    adjustedPoints[0] = getElementBoundaryPoint(element, fallbackTarget);
    return endpoint === "start" ? adjustedPoints : adjustedPoints.reverse();
  }

  const adjustedPoints = [
    getElementBoundaryPoint(element, orderedPoints[firstOutsideIndex]),
    ...orderedPoints.slice(firstOutsideIndex),
  ];

  return endpoint === "start" ? adjustedPoints : adjustedPoints.reverse();
};

const computeSubGraphHorizontalLayouts = (graph: Flowchart, fontSize: number) =>
  new Map<string, SubGraphHorizontalLayout>(
    graph.subGraphs.map((subGraph) => {
      const estimatedTextWidth = estimateLabelWidth(
        getText(subGraph),
        fontSize
      );
      const minWidth =
        estimatedTextWidth + SUBGRAPH_LABEL_HORIZONTAL_PADDING * 2;
      const width = Math.max(subGraph.width, minWidth);
      const x = subGraph.x - (width - subGraph.width) / 2;

      return [
        subGraph.id,
        {
          x,
          width,
          leftExpansion: subGraph.x - x,
          rightExpansion: x + width - (subGraph.x + subGraph.width),
        },
      ];
    })
  );

const computeHorizontalOffsets = (
  graph: Flowchart,
  layouts: ReadonlyMap<string, SubGraphHorizontalLayout>
) => {
  const parentById = new Map<string, string>();
  graph.subGraphs.forEach((subGraph) => {
    subGraph.nodeIds.forEach((nodeId) => parentById.set(nodeId, subGraph.id));
  });

  const allIds = [
    ...Object.keys(graph.vertices),
    ...graph.subGraphs.map((subGraph) => subGraph.id),
  ];
  const getRootId = (id: string) => {
    const visited = new Set<string>();
    let rootId = id;
    while (parentById.has(rootId) && !visited.has(rootId)) {
      visited.add(rootId);
      rootId = parentById.get(rootId)!;
    }
    return rootId;
  };
  const componentMembers = new Map<string, string[]>();
  allIds.forEach((id) => {
    const rootId = getRootId(id);
    const members = componentMembers.get(rootId) || [];
    members.push(id);
    componentMembers.set(rootId, members);
  });

  const offsets = new Map(allIds.map((id) => [id, 0]));
  graph.subGraphs.forEach((subGraph) => {
    if (parentById.has(subGraph.id) || !getText(subGraph).includes("\n")) {
      return;
    }

    const layout = layouts.get(subGraph.id);
    if (!layout || (!layout.leftExpansion && !layout.rightExpansion)) {
      return;
    }

    const sourceCenter = subGraph.x + subGraph.width / 2;
    componentMembers.forEach((members, componentId) => {
      if (componentId === subGraph.id) {
        return;
      }

      const componentSubGraph = graph.subGraphs.find(
        (candidate) => candidate.id === componentId
      );
      const componentVertex = graph.vertices[componentId];
      const componentCenter = componentSubGraph
        ? componentSubGraph.x + componentSubGraph.width / 2
        : componentVertex
        ? componentVertex.x + componentVertex.width / 2
        : sourceCenter;
      const shift =
        componentCenter < sourceCenter
          ? -layout.leftExpansion
          : layout.rightExpansion;

      members.forEach((id) => offsets.set(id, (offsets.get(id) || 0) + shift));
    });
  });

  return offsets;
};

const getSubGraphChildTop = (
  graph: Flowchart,
  subGraphId: string,
  nodeIds: string[]
) => {
  return Math.min(
    ...nodeIds.map((nodeId) => {
      const vertex = graph.vertices[nodeId];
      if (vertex) {
        return vertex.y;
      }

      return (
        graph.subGraphs.find(
          (candidate) => candidate.id === nodeId && candidate.id !== subGraphId
        )?.y ?? Number.POSITIVE_INFINITY
      );
    })
  );
};

const getSubGraphRequiredHeaderHeight = (text: string, fontSize: number) => {
  const lineCount = text.split("\n").length;
  if (lineCount < 2) {
    return 0;
  }

  return Math.ceil(
    lineCount * fontSize * EXCALIDRAW_LINE_HEIGHT +
      EXCALIDRAW_BOUND_TEXT_PADDING * 2
  );
};

const computeVerticalExpansions = (graph: Flowchart, fontSize: number) => {
  const expansions: VerticalExpansion[] = [];

  graph.subGraphs.forEach((subGraph) => {
    const requiredHeaderHeight = getSubGraphRequiredHeaderHeight(
      getText(subGraph),
      fontSize
    );
    if (!requiredHeaderHeight) {
      return;
    }

    const childTop = getSubGraphChildTop(graph, subGraph.id, subGraph.nodeIds);
    if (!Number.isFinite(childTop)) {
      return;
    }

    const amount = Math.ceil(requiredHeaderHeight - (childTop - subGraph.y));
    if (amount <= 0) {
      return;
    }

    const expansionAtSamePosition = expansions.find(
      (expansion) => Math.abs(expansion.y - childTop) < 0.5
    );
    if (expansionAtSamePosition) {
      expansionAtSamePosition.y = Math.min(expansionAtSamePosition.y, childTop);
      expansionAtSamePosition.amount = Math.max(
        expansionAtSamePosition.amount,
        amount
      );
      return;
    }

    expansions.push({ y: childTop, amount });
  });

  return expansions.sort((left, right) => left.y - right.y);
};

const getVerticalOffset = (expansions: VerticalExpansion[], y: number) =>
  expansions.reduce(
    (offset, expansion) =>
      expansion.y <= y ? offset + expansion.amount : offset,
    0
  );

const computeSubGraphLayouts = (
  graph: Flowchart,
  expansions: VerticalExpansion[],
  fontSize: number
) => {
  const layouts = new Map<string, { y: number; height: number }>();
  const subGraphsById = new Map(
    graph.subGraphs.map((subGraph) => [subGraph.id, subGraph])
  );

  const computeLayout = (subGraphId: string) => {
    const existing = layouts.get(subGraphId);
    if (existing) {
      return existing;
    }

    const subGraph = subGraphsById.get(subGraphId);
    if (!subGraph) {
      return null;
    }

    const y = subGraph.y + getVerticalOffset(expansions, subGraph.y);
    const minHeight = getSubGraphRequiredHeaderHeight(
      getText(subGraph),
      fontSize
    );
    let bottom = y + Math.max(subGraph.height, minHeight);

    subGraph.nodeIds.forEach((nodeId) => {
      const vertex = graph.vertices[nodeId];
      if (vertex) {
        const childBottom =
          vertex.y + getVerticalOffset(expansions, vertex.y) + vertex.height;
        if (childBottom > bottom) {
          bottom = childBottom + EXCALIDRAW_BOUND_TEXT_PADDING * 2;
        }
        return;
      }

      if (nodeId === subGraphId) {
        return;
      }
      const childLayout = computeLayout(nodeId);
      if (childLayout && childLayout.y + childLayout.height > bottom) {
        bottom =
          childLayout.y +
          childLayout.height +
          EXCALIDRAW_BOUND_TEXT_PADDING * 2;
      }
    });

    const layout = { y, height: bottom - y };
    layouts.set(subGraphId, layout);
    return layout;
  };

  graph.subGraphs.forEach((subGraph) => computeLayout(subGraph.id));
  return layouts;
};

const computeVertexLabelFontSize = (
  vertexType: string,
  text: string,
  width: number,
  fontSize?: number
) => {
  const safeFontSize = fontSize || DEFAULT_FONT_SIZE;
  if (vertexType !== VERTEX_TYPE.CYLINDER || !text) {
    return safeFontSize;
  }

  const availableWidth = Math.max(20, width - VERTEX_LABEL_HORIZONTAL_PADDING);
  const estimatedWidth = estimateLabelWidth(text, safeFontSize);
  if (estimatedWidth <= availableWidth) {
    return safeFontSize;
  }

  const longestLineLength = Math.max(
    ...text.split("\n").map((line) => line.length)
  );
  return Math.max(
    MIN_VERTEX_LABEL_FONT_SIZE,
    Math.floor(
      availableWidth / (longestLineLength * SUBGRAPH_LABEL_WIDTH_RATIO)
    )
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
    const safeFontSize = fontSize || DEFAULT_FONT_SIZE;
    const verticalExpansions = computeVerticalExpansions(graph, safeFontSize);
    const subGraphLayouts = computeSubGraphLayouts(
      graph,
      verticalExpansions,
      safeFontSize
    );
    const subGraphHorizontalLayouts = computeSubGraphHorizontalLayouts(
      graph,
      safeFontSize
    );
    const horizontalOffsets = computeHorizontalOffsets(
      graph,
      subGraphHorizontalLayouts
    );
    const subGraphIds = new Set(graph.subGraphs.map((subGraph) => subGraph.id));
    const resizedSubGraphIds = new Set(
      graph.subGraphs
        .filter((subGraph) => {
          const horizontalLayout = subGraphHorizontalLayouts.get(subGraph.id);
          const verticalLayout = subGraphLayouts.get(subGraph.id);
          const hasMultilineLabel = getText(subGraph).includes("\n");

          return (
            (hasMultilineLabel && horizontalLayout?.width !== subGraph.width) ||
            verticalLayout?.height !== subGraph.height
          );
        })
        .map((subGraph) => subGraph.id)
    );

    // SubGraphs
    graph.subGraphs
      .slice()
      .reverse()
      .forEach((subGraph) => {
        const groupIds = getGroupIds(subGraph.id);
        const subGraphText = getText(subGraph);
        const subGraphLabelFontSize = safeFontSize;
        const horizontalLayout = subGraphHorizontalLayouts.get(subGraph.id) || {
          x: subGraph.x,
          width: subGraph.width,
        };
        const width = horizontalLayout.width;
        const x =
          horizontalLayout.x + (horizontalOffsets.get(subGraph.id) || 0);
        const layout = subGraphLayouts.get(subGraph.id) || subGraph;

        const containerStyle = computeExcalidrawVertexStyle(
          subGraph.containerStyle
        );
        const labelStyle = computeExcalidrawVertexLabelStyle(
          subGraph.labelStyle
        );

        const containerElement: ExcalidrawElementSkeleton = {
          id: subGraph.id,
          type: "rectangle",
          groupIds,
          x,
          y: layout.y,
          width,
          height: layout.height,
          label: {
            groupIds,
            text: subGraphText,
            fontSize: subGraphLabelFontSize,
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
      const transformedX = vertex.x + (horizontalOffsets.get(vertex.id) || 0);
      const transformedY =
        vertex.y + getVerticalOffset(verticalExpansions, vertex.y);
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
        x: transformedX,
        y: transformedY,
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
            x: transformedX + CIRCLE_MARGIN,
            y: transformedY + CIRCLE_MARGIN,
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
      const startHorizontalOffset = horizontalOffsets.get(edge.start) || 0;
      const endHorizontalOffset = horizontalOffsets.get(edge.end) || 0;
      let transformedReflectionPoints = reflectionPoints.map((point, index) => {
        const progress =
          reflectionPoints.length > 1
            ? index / (reflectionPoints.length - 1)
            : 0;
        return {
          ...point,
          x:
            point.x +
            startHorizontalOffset +
            (endHorizontalOffset - startHorizontalOffset) * progress,
          y: point.y + getVerticalOffset(verticalExpansions, point.y),
        };
      });

      // Get supported arrow type
      const arrowType = computeExcalidrawArrowType(edge.type || "arrow_point");

      // Bind start and end vertex to arrow
      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);
      if (!startVertex || !endVertex) {
        return;
      }

      const startsAtSubGraph = subGraphIds.has(edge.start);
      if (resizedSubGraphIds.has(edge.start)) {
        transformedReflectionPoints = attachRouteToElement(
          transformedReflectionPoints,
          startVertex,
          "start",
          getElementCenter(endVertex)
        );
      }
      if (resizedSubGraphIds.has(edge.end)) {
        transformedReflectionPoints = attachRouteToElement(
          transformedReflectionPoints,
          endVertex,
          "end",
          getElementCenter(startVertex)
        );
      }

      // Calculate Excalidraw arrow's points
      const points = transformedReflectionPoints.map((point) =>
        localPoint(
          point.x - transformedReflectionPoints[0].x,
          point.y - transformedReflectionPoints[0].y
        )
      );
      const transformedStartY = startsAtSubGraph
        ? transformedReflectionPoints[0].y
        : startY + getVerticalOffset(verticalExpansions, startY);

      const arrowId = `${edge.start}_${edge.end}`;
      const containerElement: ValidLinearElement = {
        id: arrowId,
        type: "arrow",
        groupIds,
        x: startsAtSubGraph
          ? transformedReflectionPoints[0].x
          : startX + startHorizontalOffset,
        y: transformedStartY,
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
