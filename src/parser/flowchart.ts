import {
  computeEdgePositions,
  entityCodesToText,
  getTransformAttr,
} from "../utils.js";
import {
  ContainerStyle,
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  LabelStyle,
  Position,
  SubGraph,
  Vertex,
} from "../interfaces.js";

import type { FlowDB } from "mermaid/dist/diagrams/flowchart/flowDb.js";
import type {
  FlowVertex,
  FlowEdge,
  FlowClass,
  FlowSubGraph,
} from "mermaid/dist/diagrams/flowchart/types.js";
import { cleanCSSValue } from "./cssUtils.js";

export interface Flowchart {
  type: "flowchart";
  subGraphs: SubGraph[];
  vertices: { [key: string]: Vertex | undefined };
  edges: Edge[];
}

export interface Edge {
  id?: string;
  start: string;
  end: string;
  type?: string;
  text: string;
  labelType: string;
  stroke?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}

const parseStyleProperty = (property: string) => {
  const colonIndex = property.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }

  const key = property.substring(0, colonIndex).trim().toLowerCase();
  const value = cleanCSSValue(property.substring(colonIndex + 1));
  if (!key || !value) {
    return null;
  }

  return { key, value };
};

const applyContainerStyleProperty = (
  style: ContainerStyle,
  key: string,
  value: string
) => {
  switch (key) {
    case CONTAINER_STYLE_PROPERTY.FILL:
    case CONTAINER_STYLE_PROPERTY.STROKE:
    case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH:
    case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY:
      style[key] = value;
      break;
  }
};

const applyLabelStyleProperty = (
  style: LabelStyle,
  key: string,
  value: string
) => {
  if (key === LABEL_STYLE_PROPERTY.COLOR) {
    style[LABEL_STYLE_PROPERTY.COLOR] = value;
  }
};

const applyStyleTextToStyles = (
  styleText: string | null | undefined,
  containerStyle: ContainerStyle,
  labelStyle: LabelStyle
) => {
  if (!styleText) {
    return;
  }

  styleText.split(";").forEach((property) => {
    if (!property.trim()) {
      return;
    }

    const parsed = parseStyleProperty(property);
    if (!parsed) {
      return;
    }

    applyContainerStyleProperty(containerStyle, parsed.key, parsed.value);
    applyLabelStyleProperty(labelStyle, parsed.key, parsed.value);
  });
};

const applyStyleTextToLabelStyle = (
  styleText: string | null | undefined,
  labelStyle: LabelStyle
) => {
  if (!styleText) {
    return;
  }

  styleText.split(";").forEach((property) => {
    if (!property.trim()) {
      return;
    }

    const parsed = parseStyleProperty(property);
    if (!parsed) {
      return;
    }

    if (parsed.key === "fill") {
      labelStyle[LABEL_STYLE_PROPERTY.COLOR] = parsed.value;
      return;
    }

    applyLabelStyleProperty(labelStyle, parsed.key, parsed.value);
  });
};

const applyElementAttributesToContainerStyle = (
  element: Element | null,
  containerStyle: ContainerStyle
) => {
  if (!element) {
    return;
  }

  const attrs: Array<[CONTAINER_STYLE_PROPERTY, string | null]> = [
    [CONTAINER_STYLE_PROPERTY.FILL, element.getAttribute("fill")],
    [CONTAINER_STYLE_PROPERTY.STROKE, element.getAttribute("stroke")],
    [
      CONTAINER_STYLE_PROPERTY.STROKE_WIDTH,
      element.getAttribute("stroke-width"),
    ],
    [
      CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY,
      element.getAttribute("stroke-dasharray"),
    ],
  ];

  attrs.forEach(([key, rawValue]) => {
    const value = cleanCSSValue(rawValue || "");
    if (value) {
      applyContainerStyleProperty(containerStyle, key, value);
    }
  });
};

const applyElementAttributesToLabelStyle = (
  element: Element | null,
  labelStyle: LabelStyle
) => {
  if (!element) {
    return;
  }

  const rawColor =
    element.getAttribute("fill") || element.getAttribute("color");
  const color = cleanCSSValue(rawColor || "");
  if (color) {
    labelStyle[LABEL_STYLE_PROPERTY.COLOR] = color;
  }
};

const applyClassStyles = (
  classId: string,
  classes: Map<string, FlowClass> | Record<string, never>,
  containerStyle: ContainerStyle,
  labelStyle: LabelStyle
) => {
  if (!(classes instanceof Map)) {
    return;
  }

  const classDef = classes.get(classId);
  if (!classDef) {
    return;
  }

  classDef.styles?.forEach((style) => {
    const parsed = parseStyleProperty(style);
    if (!parsed) {
      return;
    }

    applyContainerStyleProperty(containerStyle, parsed.key, parsed.value);
    applyLabelStyleProperty(labelStyle, parsed.key, parsed.value);
  });

  classDef.textStyles?.forEach((style) => {
    const parsed = parseStyleProperty(style);
    if (!parsed) {
      return;
    }

    applyLabelStyleProperty(labelStyle, parsed.key, parsed.value);
  });
};

const parseSubGraph = (
  data: FlowSubGraph,
  containerEl: Element,
  classes: Map<string, FlowClass> | Record<string, never>
): SubGraph => {
  // Extract only node id for better reference
  // e.g. full element id = "flowchart-c1-205" will map to "c1"
  const nodeIds = data.nodes.map((n: string) => {
    if (n.startsWith("flowchart-")) {
      return n.split("-")[1];
    }
    return n;
  });

  // Get position
  const el: SVGSVGElement | null = containerEl.querySelector(
    `[id='${data.id}']`
  );
  if (!el) {
    throw new Error("SubGraph element not found");
  }
  const position = computeElementPosition(el, containerEl);

  // Get dimension
  const boundingBox = el.getBBox();
  const dimension = {
    width: boundingBox.width,
    height: boundingBox.height,
  };

  const containerStyle: SubGraph["containerStyle"] = {};
  const labelStyle: SubGraph["labelStyle"] = {};

  const shapeEl =
    el.querySelector<SVGElement>(
      ":scope > rect, :scope > path, :scope > polygon, :scope > ellipse"
    ) ||
    el.querySelector<SVGElement>(
      ".cluster > rect, .cluster > path, .cluster > polygon, .cluster > ellipse"
    ) ||
    el.querySelector<SVGElement>("rect, path, polygon, ellipse");

  applyStyleTextToStyles(el.getAttribute("style"), containerStyle, labelStyle);
  applyStyleTextToStyles(
    shapeEl?.getAttribute("style"),
    containerStyle,
    labelStyle
  );
  applyElementAttributesToContainerStyle(shapeEl, containerStyle);

  const labelEl =
    el.querySelector<SVGElement>(".cluster-label text, .cluster-label tspan") ||
    el.querySelector<SVGElement>("text");
  applyStyleTextToLabelStyle(labelEl?.getAttribute("style"), labelStyle);
  applyElementAttributesToLabelStyle(labelEl, labelStyle);

  applyClassStyles(data.id, classes, containerStyle, labelStyle);
  data.classes?.forEach((classId) => {
    applyClassStyles(classId, classes, containerStyle, labelStyle);
  });

  return {
    id: data.id,
    nodeIds,
    text: entityCodesToText(data.title),
    labelType: "text",
    ...position,
    ...dimension,
    containerStyle,
    labelStyle,
  };
};

const parseVertex = (
  vertex: FlowVertex,
  containerEl: Element,
  classes: Map<string, FlowClass> | Record<string, never>
): Vertex | undefined => {
  // Find Vertex element
  const node: SVGSVGElement | null = containerEl.querySelector(
    `[id*="${vertex.domId}"]`
  );
  if (!node) {
    return undefined;
  }

  // Check if Vertex attached with link
  let link;
  if (node.parentElement?.tagName.toLowerCase() === "a") {
    link = node.parentElement.getAttribute("xlink:href");
  }

  // Get position
  const position = computeElementPosition(
    link ? node.parentElement : node,
    containerEl
  );
  // Get dimension
  const boundingBox = node.getBBox();
  const dimension = {
    width: boundingBox.width,
    height: boundingBox.height,
  };

  // Extract style
  const labelContainerStyleText = node
    .querySelector(".label-container")
    ?.getAttribute("style");
  const labelStyleText = node.querySelector(".label")?.getAttribute("style");

  const containerStyle: Vertex["containerStyle"] = {};
  labelContainerStyleText?.split(";").forEach((property) => {
    if (!property) {
      return;
    }

    const key = property.split(":")[0].trim() as CONTAINER_STYLE_PROPERTY;
    const value = cleanCSSValue(property.split(":")[1] || "");
    if (value) {
      containerStyle[key] = value;
    }
  });

  const labelStyle: Vertex["labelStyle"] = {};
  labelStyleText?.split(";").forEach((property) => {
    if (!property) {
      return;
    }

    const key = property.split(":")[0].trim() as LABEL_STYLE_PROPERTY;
    const value = cleanCSSValue(property.split(":")[1] || "");
    if (value) {
      labelStyle[key] = value;
    }
  });

  if (vertex.classes && classes instanceof Map) {
    (Array.isArray(vertex.classes) ? vertex.classes : [vertex.classes]).forEach(
      (classId) => {
        applyClassStyles(classId, classes, containerStyle, labelStyle);
      }
    );
  }
  return {
    id: vertex.id,
    labelType: vertex.labelType,
    text: entityCodesToText(vertex.text || ""),
    type: vertex.type as any,
    link: link || undefined,
    ...position,
    ...dimension,
    containerStyle,
    labelStyle,
  };
};

const parseEdge = (
  edge: FlowEdge,
  edgeIndex: number,
  containerEl: Element
): Edge => {
  // Find edge element
  const node = containerEl.querySelector<SVGPathElement>(`[id*="${edge.id}"]`);

  if (!node) {
    throw new Error("Edge element not found");
  }

  // Compute edge position data
  const position = computeElementPosition(node, containerEl);
  const edgePositionData = computeEdgePositions(node, position);

  // Remove irrelevant properties
  edge.length = undefined;

  return {
    ...edge,
    ...edgePositionData,
    text: entityCodesToText(edge.text),
  };
};

// Compute element position
const computeElementPosition = (
  el: Element | null,
  containerEl: Element
): Position => {
  if (!el) {
    throw new Error("Element not found");
  }

  let root = el.parentElement?.parentElement;

  const childElement = el.childNodes[0] as SVGSVGElement;
  let childPosition = { x: 0, y: 0 };
  if (childElement) {
    const { transformX, transformY } = getTransformAttr(childElement);

    const boundingBox = childElement.getBBox();
    childPosition = {
      x:
        Number(childElement.getAttribute("x")) ||
        transformX + boundingBox.x ||
        0,
      y:
        Number(childElement.getAttribute("y")) ||
        transformY + boundingBox.y ||
        0,
    };
  }

  const { transformX, transformY } = getTransformAttr(el);
  const position = {
    x: transformX + childPosition.x,
    y: transformY + childPosition.y,
  };
  while (root && root.id !== containerEl.id) {
    if (root.classList.value === "root" && root.hasAttribute("transform")) {
      const { transformX, transformY } = getTransformAttr(root);
      position.x += transformX;
      position.y += transformY;
    }

    root = root.parentElement;
  }

  return position;
};

export const parseMermaidFlowChartDiagram = (
  db: FlowDB,
  containerEl: Element
): Flowchart => {
  // Get mermaid parsed data from the diagram's database (Mermaid v11 API)
  const verticesData = db.getVertices();
  const edgesData = db.getEdges();
  const subGraphsData = db.getSubGraphs();
  const classesData = db.getClasses();

  // Parse vertices
  const vertices: Record<string, Vertex | undefined> = {};

  // Normalize classesData - it can be a Map or empty object {}
  const normalizedClasses: Map<string, FlowClass> | Record<string, never> =
    classesData instanceof Map ? classesData : {};

  // In v11, getVertices() returns a Map
  if (verticesData instanceof Map) {
    verticesData.forEach((vertex, id) => {
      vertices[id] = parseVertex(vertex, containerEl, normalizedClasses);
    });
  } else if (typeof verticesData === "object" && verticesData !== null) {
    // Fallback for object-based return
    Object.entries(verticesData).forEach(([id, vertex]) => {
      vertices[id] = parseVertex(
        vertex as FlowVertex,
        containerEl,
        normalizedClasses
      );
    });
  }

  // Track the count of edges based on the edge id
  const edgeCountMap = new Map<string, number>();
  const edges: Edge[] = (Array.isArray(edgesData) ? edgesData : [])
    .map((edge: any) => {
      // Filter out edges not found in the DOM
      if (!containerEl.querySelector(`[id*="${edge.id}"]`)) {
        return null;
      }

      // Calculate index for edges between the same two nodes
      const edgeMapKey = `${edge.start}-${edge.end}`;
      const count = edgeCountMap.get(edgeMapKey) || 0;
      edgeCountMap.set(edgeMapKey, count + 1);

      return parseEdge(edge as FlowEdge, count, containerEl);
    })
    .filter(
      (edge): edge is Edge => edge !== null && edge.reflectionPoints.length > 1
    );

  const subGraphs = (Array.isArray(subGraphsData) ? subGraphsData : []).map(
    (subgraph: any) => {
      return parseSubGraph(
        subgraph as FlowSubGraph,
        containerEl,
        normalizedClasses
      );
    }
  );

  return {
    type: "flowchart",
    subGraphs,
    vertices,
    edges,
  };
};
