import type { FlowchartModel } from "pele";

import {
  ContainerStyle,
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  LabelStyle,
  Position,
  SubGraph,
  Vertex,
  VERTEX_TYPE,
} from "../interfaces.js";
import type { Edge, Flowchart } from "../parser/flowchart.js";
import { isValidCSSColor, parseCSSDeclarations } from "../parser/cssUtils.js";
import { decodeMermaidText } from "../text.js";
import { withPeleLineBreaks } from "./elements.js";
import {
  Bounds,
  evenOutRoute,
  extendRouteToMarkers,
  getElementsByDataId,
  getPathRoute,
  getRoutePosition,
  getShapeBounds,
  getTextLines,
  simplifyRoute,
} from "./svg.js";

type PeleNode = NonNullable<ReturnType<FlowchartModel["nodes"]["get"]>>;
type PeleEdge = FlowchartModel["edges"][number];
type PeleSubGraph = FlowchartModel["subgraphs"][number];

const SHAPE_SELECTOR = "rect, circle, ellipse, polygon, path";

// Excalidraw's bound text padding and Excalifont's line height
const EXCALIDRAW_BOUND_TEXT_PADDING = 5;
const EXCALIDRAW_LINE_HEIGHT = 1.25;

export interface PeleFlowchartOptions {
  fontSize: number;
  /** Width of a line of label text in Excalidraw, if it can be measured. */
  measureText?: (text: string) => number | null;
}

// Pele's own colors are CSS variables, which Excalidraw can't use.
const isUsableColor = (value: string) =>
  !/\bvar\(/i.test(value) && isValidCSSColor(value);

// Pele resolves `style`, `classDef` (including `default`) and `class`
// statements into the inline style of the shapes and labels it draws, keeping
// only safe properties.
const getContainerStyle = (shape: Element | null) => {
  const style: ContainerStyle = {};
  parseCSSDeclarations(shape?.getAttribute("style") || "").forEach(
    ({ property, value }) => {
      switch (property) {
        case CONTAINER_STYLE_PROPERTY.FILL:
        case CONTAINER_STYLE_PROPERTY.STROKE:
          if (isUsableColor(value)) {
            style[property] = value;
          }
          break;
        case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH:
        case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY:
          style[property] = value;
          break;
      }
    }
  );
  return style;
};

const getLabelStyle = (label: Element | null) => {
  const style: LabelStyle = {};
  parseCSSDeclarations(label?.getAttribute("style") || "").forEach(
    ({ property, value }) => {
      // SVG text is colored with `fill`
      if (
        (property === "fill" || property === LABEL_STYLE_PROPERTY.COLOR) &&
        isUsableColor(value)
      ) {
        style[LABEL_STYLE_PROPERTY.COLOR] = value;
      }
    }
  );
  return style;
};

const parseVertex = (
  node: PeleNode,
  group: Element,
  root: Element
): Vertex | undefined => {
  const bounds = getShapeBounds(group, root);
  if (!bounds) {
    return undefined;
  }

  return {
    id: node.id,
    type: node.type as VERTEX_TYPE,
    labelType: node.labelType,
    text: withPeleLineBreaks(
      decodeMermaidText(node.text ?? node.id),
      group.querySelector(".pele-label")
    ),
    ...bounds,
    // Pele only renders links whose URL scheme is allowed
    link: group.querySelector("a[href]")?.getAttribute("href") || undefined,
    containerStyle: getContainerStyle(group.querySelector(SHAPE_SELECTOR)),
    labelStyle: getLabelStyle(group.querySelector(".pele-label")),
  };
};

// `|dx| / halfWidth + |dy| / halfHeight` from the center: 1 on the outline
const getDiamondDistance = (diamond: Bounds, point: Position) =>
  Math.abs(point.x - (diamond.x + diamond.width / 2)) / (diamond.width / 2) +
  Math.abs(point.y - (diamond.y + diamond.height / 2)) / (diamond.height / 2);

// The same for an ellipse
const getEllipseDistance = (ellipse: Bounds, point: Position) =>
  Math.hypot(
    (point.x - (ellipse.x + ellipse.width / 2)) / (ellipse.width / 2),
    (point.y - (ellipse.y + ellipse.height / 2)) / (ellipse.height / 2)
  );

// The converter's gap between a double circle's circles, the inner one
// holding the label
const DOUBLE_CIRCLE_MARGIN = 5;

/**
 * Shapes Excalidraw fits a label in the rectangle inscribed in (`ratio` times
 * smaller than the shape, less `inset`), and how far a point is from their
 * center (1 on the outline).
 */
const INSCRIBED_LABEL_SHAPES: Partial<
  Record<
    VERTEX_TYPE,
    {
      ratio: number;
      inset: number;
      getDistance: (shape: Bounds, point: Position) => number;
    }
  >
> = {
  [VERTEX_TYPE.DIAMOND]: {
    ratio: 2,
    inset: 0,
    getDistance: getDiamondDistance,
  },
  [VERTEX_TYPE.CIRCLE]: {
    ratio: Math.SQRT2,
    inset: 0,
    getDistance: getEllipseDistance,
  },
  [VERTEX_TYPE.DOUBLECIRCLE]: {
    ratio: Math.SQRT2,
    inset: DOUBLE_CIRCLE_MARGIN * 2,
    getDistance: getEllipseDistance,
  },
};

/**
 * Excalidraw fits the label of a diamond or a circle in the rectangle
 * inscribed in it, which is tighter than how Pele sizes them: the label would
 * wrap more, and the shape grow downwards, away from its edges. These shapes
 * are enlarged around their center to fit the lines Pele laid their label out
 * in instead (Excalidraw then wraps it the same way).
 */
const fitShapeToLabel = (
  vertex: Vertex,
  lines: string[],
  { fontSize, measureText }: PeleFlowchartOptions
): Vertex => {
  const shape = INSCRIBED_LABEL_SHAPES[vertex.type];
  if (!shape || !lines.length) {
    return vertex;
  }
  const lineWidths = lines.map((line) => measureText?.(line) ?? null);
  if (lineWidths.some((width) => width === null)) {
    return vertex;
  }

  const padding = EXCALIDRAW_BOUND_TEXT_PADDING * 2;
  const textWidth = Math.max(...(lineWidths as number[]));
  const textHeight = lines.length * fontSize * EXCALIDRAW_LINE_HEIGHT;
  // +1 for Excalidraw rounding the inscribed rectangle's size
  let width = Math.max(
    vertex.width,
    shape.ratio * (textWidth + padding + 1) + shape.inset
  );
  let height = Math.max(
    vertex.height,
    shape.ratio * (textHeight + padding + 1) + shape.inset
  );
  if (vertex.type !== VERTEX_TYPE.DIAMOND) {
    // circles stay round
    width = height = Math.max(width, height);
  }

  return {
    ...vertex,
    x: vertex.x - (width - vertex.width) / 2,
    y: vertex.y - (height - vertex.height) / 2,
    width,
    height,
  };
};

const parseSubGraph = (
  subGraph: PeleSubGraph,
  group: Element,
  title: Element | null,
  root: Element
): SubGraph | undefined => {
  const bounds = getShapeBounds(group, root);
  if (!bounds) {
    return undefined;
  }

  return {
    id: subGraph.id,
    nodeIds: subGraph.nodes,
    text: decodeMermaidText(subGraph.title),
    labelType: subGraph.labelType,
    ...bounds,
    containerStyle: getContainerStyle(group.querySelector(SHAPE_SELECTOR)),
    labelStyle: getLabelStyle(
      group.querySelector(".pele-cluster-label") ||
        title?.querySelector(".pele-cluster-label") ||
        null
    ),
  };
};

/**
 * Pele spreads the edges leaving a node's side apart, which on a diamond puts
 * them next to its vertex, with a short and steep first segment, and shapes
 * fit to their label (see `fitShapeToLabel`) cover the start of their routes.
 * Instead, the route starts where the line from the shape's center to the
 * rest of the route crosses its outline, as in Mermaid.
 */
const attachRouteStartToShape = (route: Position[], vertex: Vertex) => {
  const shape = INSCRIBED_LABEL_SHAPES[vertex.type];
  if (!shape) {
    return route;
  }
  const nextIndex = route.findIndex(
    (point, index) => index > 0 && shape.getDistance(vertex, point) > 1.01
  );
  if (nextIndex === -1) {
    return route;
  }

  const next = route[nextIndex];
  const centerX = vertex.x + vertex.width / 2;
  const centerY = vertex.y + vertex.height / 2;
  const scale = 1 / shape.getDistance(vertex, next);
  return [
    {
      x: centerX + (next.x - centerX) * scale,
      y: centerY + (next.y - centerY) * scale,
    },
    ...route.slice(nextIndex),
  ];
};

const parseEdge = (
  edge: PeleEdge,
  group: Element,
  label: Element | undefined,
  root: Element,
  vertices: Flowchart["vertices"]
): Edge | undefined => {
  const paths = Array.from(group.querySelectorAll("path"));
  const line = paths.find(
    (path) => !path.getAttribute("class")?.includes("pele-marker")
  );
  if (!line) {
    return undefined;
  }

  let route = extendRouteToMarkers(
    getPathRoute(line, root),
    Array.from(group.querySelectorAll(".pele-marker")),
    root
  );
  const startVertex = vertices[edge.start];
  if (startVertex) {
    route = attachRouteStartToShape(route, startVertex);
  }
  const endVertex = vertices[edge.end];
  if (endVertex) {
    route = attachRouteStartToShape(route.reverse(), endVertex).reverse();
  }
  route = simplifyRoute(route);
  if (route.length < 2) {
    return undefined;
  }

  const start = route[0];
  const end = route[route.length - 1];
  // Pele doesn't always put a label halfway along its edge, e.g. it puts
  // the labels of long edges where there's room for them
  const labelBounds = label && getShapeBounds(label, root);
  return {
    id: edge.id,
    start: edge.start,
    end: edge.end,
    type: edge.type,
    text: withPeleLineBreaks(
      decodeMermaidText(edge.text),
      label?.querySelector("text") ?? null
    ),
    labelType: edge.labelType,
    stroke: edge.stroke,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    reflectionPoints: evenOutRoute(route),
    ...(edge.text && labelBounds
      ? {
          labelPosition: getRoutePosition(route, {
            x: labelBounds.x + labelBounds.width / 2,
            y: labelBounds.y + labelBounds.height / 2,
          }),
        }
      : {}),
  };
};

/**
 * Reads a flowchart from Pele's parsed model (labels, shapes, links between
 * nodes) and the SVG Pele rendered it to (positions, sizes, routes, resolved
 * styles). Elements Pele didn't draw (e.g. invisible `~~~` links, `style`
 * statements targeting a subgraph) are skipped, and so are links between a
 * subgraph and what's inside it, which Mermaid doesn't draw either.
 */
export const parsePeleFlowchart = (
  model: FlowchartModel,
  root: Element,
  options: PeleFlowchartOptions
): Flowchart => {
  const nodeGroups = getElementsByDataId(root, "g.pele-node[data-id]");
  const edgeGroups = getElementsByDataId(root, "g.pele-edge[data-id]");
  const edgeLabels = getElementsByDataId(root, "g.pele-edge-label[data-id]");
  const clusterGroups = getElementsByDataId(root, "g.pele-cluster[data-id]");
  const clusterTitles = getElementsByDataId(
    root,
    "g.pele-cluster-title[data-id]"
  );

  const vertices: Flowchart["vertices"] = {};
  model.nodes.forEach((node, id) => {
    const group = nodeGroups.get(id);
    const vertex = group && parseVertex(node, group, root);
    if (vertex) {
      vertices[id] = fitShapeToLabel(
        vertex,
        getTextLines(group.querySelector(".pele-label")),
        options
      );
    }
  });

  const parentIds = new Map<string, string>();
  model.subgraphs.forEach((subGraph) =>
    subGraph.nodes.forEach((id) => parentIds.set(id, subGraph.id))
  );
  const isInside = (id: string, subGraphId: string) => {
    const visited = new Set<string>();
    for (
      let parentId = parentIds.get(id);
      parentId !== undefined && !visited.has(parentId);
      parentId = parentIds.get(parentId)
    ) {
      if (parentId === subGraphId) {
        return true;
      }
      visited.add(parentId);
    }
    return false;
  };

  const edges = model.edges.flatMap((edge) => {
    if (isInside(edge.start, edge.end) || isInside(edge.end, edge.start)) {
      return [];
    }
    const group = edge.id !== undefined && edgeGroups.get(edge.id);
    const parsed =
      group &&
      parseEdge(
        edge,
        group,
        edgeLabels.get(edge.id!) ?? undefined,
        root,
        vertices
      );
    return parsed ? [parsed] : [];
  });

  const subGraphs = model.subgraphs.flatMap((subGraph) => {
    const group = clusterGroups.get(subGraph.id);
    const parsed =
      group &&
      parseSubGraph(
        subGraph,
        group,
        clusterTitles.get(subGraph.id) || null,
        root
      );
    return parsed ? [parsed] : [];
  });

  return {
    type: "flowchart",
    subGraphs,
    vertices,
    edges,
  };
};
