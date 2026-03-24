import {
  ContainerStyle,
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  LabelStyle,
  Position,
} from "../interfaces.js";
import {
  computeEdgePositions,
  entityCodesToText,
  getTransformAttr,
} from "../utils.js";
import {
  cleanCSSValue,
  isValidCSSColor,
  parseCSSDeclarations,
} from "./cssUtils.js";

import type { ExcalidrawLinearElement } from "@excalidraw/excalidraw/element/types";
import type {
  Edge as MermaidStateEdge,
  NodeData as MermaidStateNode,
  StateDB,
} from "mermaid/dist/diagrams/state/stateDb.js";

type StateShape = MermaidStateNode["shape"];

type DividerLine = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export interface StateNode {
  id: string;
  shape: StateShape;
  text: string;
  description: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  position?: string;
  containerStyle: ContainerStyle;
  labelStyle: LabelStyle;
  dividerLine?: DividerLine;
  endInnerColor?: string;
  isRenderable: boolean;
}

export interface StateEdge {
  id: string;
  start: string;
  end: string;
  text: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: ExcalidrawLinearElement["strokeStyle"];
  isNoteEdge?: boolean;
}

export interface State {
  type: "state";
  nodes: StateNode[];
  edges: StateEdge[];
}

const isMeaningfulCSSColor = (value?: string | null) => {
  const normalizedValue = cleanCSSValue(value || "");
  if (!normalizedValue) {
    return false;
  }

  if (
    normalizedValue === "none" ||
    normalizedValue === "transparent" ||
    normalizedValue === "rgba(0, 0, 0, 0)" ||
    normalizedValue === "rgba(0,0,0,0)"
  ) {
    return false;
  }

  return isValidCSSColor(normalizedValue);
};

const applyContainerStyleProperty = (
  style: ContainerStyle,
  property: string,
  value: string
) => {
  switch (property) {
    case CONTAINER_STYLE_PROPERTY.FILL:
    case CONTAINER_STYLE_PROPERTY.STROKE:
      if (isMeaningfulCSSColor(value)) {
        style[property] = cleanCSSValue(value);
      }
      break;
    case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH:
    case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY:
      if (cleanCSSValue(value)) {
        style[property] = cleanCSSValue(value);
      }
      break;
  }
};

const applyLabelStyleProperty = (
  style: LabelStyle,
  property: string,
  value: string
) => {
  if (property === LABEL_STYLE_PROPERTY.COLOR && isMeaningfulCSSColor(value)) {
    style[LABEL_STYLE_PROPERTY.COLOR] = cleanCSSValue(value);
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

  parseCSSDeclarations(styleText).forEach(({ property, value }) => {
    applyContainerStyleProperty(containerStyle, property, value);
    applyLabelStyleProperty(labelStyle, property, value);
  });
};

const applyStyleTextToLabelStyle = (
  styleText: string | null | undefined,
  labelStyle: LabelStyle
) => {
  if (!styleText) {
    return;
  }

  parseCSSDeclarations(styleText).forEach(({ property, value }) => {
    if (
      property === CONTAINER_STYLE_PROPERTY.FILL &&
      isMeaningfulCSSColor(value)
    ) {
      labelStyle[LABEL_STYLE_PROPERTY.COLOR] = cleanCSSValue(value);
      return;
    }

    applyLabelStyleProperty(labelStyle, property, value);
  });
};

const getExplicitStyleProperties = (
  styleTexts: Array<string | null | undefined>
) => {
  const properties = new Set<string>();

  styleTexts.filter(Boolean).forEach((styleText) => {
    parseCSSDeclarations(styleText || "").forEach(({ property }) => {
      properties.add(property);
    });
  });

  return properties;
};

const applyElementAttributesToContainerStyle = (
  element: Element | null,
  containerStyle: ContainerStyle,
  explicitProperties: Set<string>
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

  attrs.forEach(([property, rawValue]) => {
    if (!explicitProperties.has(property)) {
      return;
    }
    if (containerStyle[property]) {
      return;
    }

    const value = cleanCSSValue(rawValue || "");
    if (!value) {
      return;
    }

    applyContainerStyleProperty(containerStyle, property, value);
  });
};

const applyElementAttributesToLabelStyle = (
  element: Element | null,
  labelStyle: LabelStyle,
  explicitProperties: Set<string>
) => {
  if (!element) {
    return;
  }

  const candidates = [
    element,
    ...Array.from(
      element.querySelectorAll<HTMLElement>("text, foreignObject, div, span, p")
    ),
  ];

  for (const candidate of candidates) {
    if (labelStyle[LABEL_STYLE_PROPERTY.COLOR]) {
      break;
    }

    if (
      explicitProperties.has(LABEL_STYLE_PROPERTY.COLOR) ||
      explicitProperties.has(CONTAINER_STYLE_PROPERTY.FILL)
    ) {
      applyStyleTextToLabelStyle(candidate.getAttribute("style"), labelStyle);
      if (labelStyle[LABEL_STYLE_PROPERTY.COLOR]) {
        break;
      }
    }

    const color = cleanCSSValue(
      candidate.getAttribute("fill") || candidate.getAttribute("color") || ""
    );
    if (
      (explicitProperties.has(LABEL_STYLE_PROPERTY.COLOR) ||
        explicitProperties.has(CONTAINER_STYLE_PROPERTY.FILL)) &&
      isMeaningfulCSSColor(color)
    ) {
      labelStyle[LABEL_STYLE_PROPERTY.COLOR] = color;
    }
  }
};

const accumulateTranslation = (node: Element, stopAt?: Element | null) => {
  let tx = 0;
  let ty = 0;
  let current: Element | null = node;

  while (current && current !== stopAt) {
    const { transformX, transformY } = getTransformAttr(current);
    tx += transformX;
    ty += transformY;
    current = current.parentElement;
  }

  return { tx, ty };
};

const getAbsoluteBounds = (node: SVGGraphicsElement, containerEl: Element) => {
  const bbox = node.getBBox();
  const { tx, ty } = accumulateTranslation(node, containerEl);

  return {
    x: bbox.x + tx,
    y: bbox.y + ty,
    width: bbox.width,
    height: bbox.height,
  };
};

const getDividerLine = (
  nodeEl: Element,
  containerEl: Element
): DividerLine | undefined => {
  const dividerLine = nodeEl.querySelector<SVGLineElement>("line.divider");
  if (!dividerLine) {
    return undefined;
  }

  const { tx, ty } = accumulateTranslation(dividerLine, containerEl);

  return {
    startX: Number(dividerLine.getAttribute("x1")) + tx,
    startY: Number(dividerLine.getAttribute("y1")) + ty,
    endX: Number(dividerLine.getAttribute("x2")) + tx,
    endY: Number(dividerLine.getAttribute("y2")) + ty,
  };
};

const getShapeArea = (element: SVGGraphicsElement) => {
  const bounds = element.getBBox();
  return Math.abs(bounds.width * bounds.height);
};

const getExplicitStyleValue = (element: Element, property: string) => {
  const styleText = element.getAttribute("style");
  if (!styleText) {
    return undefined;
  }

  const declaration = parseCSSDeclarations(styleText).find(
    (entry) => entry.property === property
  );
  if (!declaration) {
    return undefined;
  }

  return cleanCSSValue(declaration.value);
};

const pickShapeElement = (
  elements: SVGGraphicsElement[],
  strategy: "largest" | "smallest"
) => {
  const candidates = elements
    .map((element) => ({ element, area: getShapeArea(element) }))
    .filter(({ area }) => Number.isFinite(area) && area > 0);

  if (candidates.length === 0) {
    return null;
  }

  const sortedCandidates = candidates.sort((left, right) =>
    strategy === "largest" ? right.area - left.area : left.area - right.area
  );

  return sortedCandidates[0].element;
};

const getElementShapeColor = (
  element: Element | null,
  explicitProperties: Set<string>
) => {
  if (!element) {
    return undefined;
  }

  if (
    !explicitProperties.has(CONTAINER_STYLE_PROPERTY.FILL) &&
    !explicitProperties.has(CONTAINER_STYLE_PROPERTY.STROKE)
  ) {
    return undefined;
  }

  const fill = cleanCSSValue(
    element.getAttribute("fill") ||
      getExplicitStyleValue(element, CONTAINER_STYLE_PROPERTY.FILL) ||
      ""
  );
  const stroke = cleanCSSValue(
    element.getAttribute("stroke") ||
      getExplicitStyleValue(element, CONTAINER_STYLE_PROPERTY.STROKE) ||
      ""
  );

  if (isMeaningfulCSSColor(fill)) {
    return fill;
  }

  if (isMeaningfulCSSColor(stroke)) {
    return stroke;
  }

  return undefined;
};

const getEndStateInnerColor = (
  nodeEl: SVGGraphicsElement,
  explicitProperties: Set<string>
) => {
  const shapeElements = Array.from(
    nodeEl.querySelectorAll<SVGGraphicsElement>("circle, ellipse, path")
  );
  const innerShapeElement = pickShapeElement(shapeElements, "smallest");

  return getElementShapeColor(innerShapeElement, explicitProperties);
};

const trimSharedTrailingLineIndentation = (lines: string[]) => {
  if (lines.length < 2) {
    return lines;
  }

  const trailingLines = lines.slice(1);
  const commonIndent = trailingLines
    .filter((line) => line.trim().length > 0)
    .reduce((minIndent, line) => {
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      return Math.min(minIndent, indent);
    }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(commonIndent) || commonIndent <= 0) {
    return lines.map((line) => line.trimEnd());
  }

  return [
    lines[0].trimEnd(),
    ...trailingLines.map((line) =>
      line.replace(new RegExp(`^\\s{0,${commonIndent}}`), "").trimEnd()
    ),
  ];
};

const getStateLabelText = (node: MermaidStateNode) => {
  const labelLines = Array.isArray(node.label)
    ? node.label.map((entry) => entityCodesToText(entry))
    : entityCodesToText(node.label || "").split("\n");
  const labelText = trimSharedTrailingLineIndentation(labelLines).join("\n");

  return labelText;
};

const getStateDescription = (node: MermaidStateNode) => {
  if (!node.description) {
    return [];
  }

  const description = Array.isArray(node.description)
    ? node.description
    : [node.description];

  return description
    .map((entry) => entityCodesToText(entry))
    .filter((entry) => entry.length > 0);
};

const createNodeElementResolver = (containerEl: Element) => {
  const usedElements = new Set<Element>();

  const markAndReturn = (element: SVGGraphicsElement | null) => {
    if (element) {
      usedElements.add(element);
    }

    return element;
  };

  const getNextUnusedCandidate = (elements: SVGGraphicsElement[]) => {
    const candidate = elements.find((element) => !usedElements.has(element));
    return markAndReturn(candidate || null);
  };

  return (node: MermaidStateNode): SVGGraphicsElement | null => {
    const selectors = [
      `[id='${node.domId}']`,
      `[id='${node.id}']`,
      `[data-id='${node.id}']`,
    ];

    for (const selector of selectors) {
      const element = containerEl.querySelector<SVGGraphicsElement>(selector);
      if (element) {
        return markAndReturn(element);
      }
    }

    // Mermaid generates random ids for anonymous divider sections during parse
    // and regenerates them during render, so exact ids do not always line up.
    switch (node.shape) {
      case "divider":
        return getNextUnusedCandidate(
          Array.from(
            containerEl.querySelectorAll<SVGGraphicsElement>(
              "g.statediagram-cluster-alt"
            )
          )
        );
      case "stateStart":
        return getNextUnusedCandidate(
          Array.from(
            containerEl.querySelectorAll<SVGGraphicsElement>("g.node.default")
          ).filter((element) => element.querySelector("circle.state-start"))
        );
      case "stateEnd":
        return getNextUnusedCandidate(
          Array.from(
            containerEl.querySelectorAll<SVGGraphicsElement>("g.node.default")
          ).filter((element) => !element.querySelector("circle.state-start"))
        );
      default:
        return null;
    }
  };
};

const findShapeElement = (
  nodeEl: SVGGraphicsElement,
  shape: StateShape
): SVGGraphicsElement => {
  switch (shape) {
    case "roundedWithTitle":
      return (
        nodeEl.querySelector<SVGGraphicsElement>("rect.outer") ||
        nodeEl.querySelector<SVGGraphicsElement>("rect") ||
        nodeEl
      );
    case "divider":
      return (
        nodeEl.querySelector<SVGGraphicsElement>("rect.divider") ||
        nodeEl.querySelector<SVGGraphicsElement>("rect") ||
        nodeEl
      );
    case "rectWithTitle":
      return (
        nodeEl.querySelector<SVGGraphicsElement>("rect.outer") ||
        nodeEl.querySelector<SVGGraphicsElement>("rect") ||
        nodeEl
      );
    case "stateStart":
      return (
        pickShapeElement(
          Array.from(
            nodeEl.querySelectorAll<SVGGraphicsElement>("circle, ellipse, path")
          ),
          "largest"
        ) || nodeEl
      );
    case "stateEnd":
      return (
        pickShapeElement(
          Array.from(
            nodeEl.querySelectorAll<SVGGraphicsElement>("circle, ellipse, path")
          ),
          "largest"
        ) || nodeEl
      );
    case "choice":
    case "fork":
    case "join":
    case "note":
    case "rect":
    default:
      return (
        nodeEl.querySelector<SVGGraphicsElement>(
          "rect, path, circle, ellipse, polygon"
        ) || nodeEl
      );
  }
};

const parseStateNode = (
  node: MermaidStateNode,
  containerEl: Element,
  resolveNodeElement: ReturnType<typeof createNodeElementResolver>
): StateNode => {
  const nodeEl = resolveNodeElement(node);
  if (!nodeEl) {
    throw new Error(`State node element not found for "${node.id}"`);
  }

  const shapeEl = findShapeElement(nodeEl, node.shape);
  const containerStyle: ContainerStyle = {};
  const labelStyle: LabelStyle = {};
  const explicitStyleTexts = [
    node.labelStyle,
    ...(node.cssCompiledStyles || []),
    ...(node.cssStyles || []),
  ];
  const explicitStyleProperties =
    getExplicitStyleProperties(explicitStyleTexts);

  explicitStyleTexts.filter(Boolean).forEach((styleText) => {
    applyStyleTextToStyles(styleText, containerStyle, labelStyle);
  });

  applyElementAttributesToContainerStyle(
    shapeEl,
    containerStyle,
    explicitStyleProperties
  );
  applyElementAttributesToLabelStyle(
    nodeEl,
    labelStyle,
    explicitStyleProperties
  );

  const bounds = getAbsoluteBounds(shapeEl, containerEl);

  return {
    id: node.id,
    shape: node.shape,
    text: getStateLabelText(node),
    description: getStateDescription(node),
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    parentId: node.parentId,
    position: node.position,
    containerStyle,
    labelStyle,
    dividerLine:
      node.shape === "rectWithTitle"
        ? getDividerLine(nodeEl, containerEl)
        : undefined,
    endInnerColor:
      node.shape === "stateEnd"
        ? getEndStateInnerColor(nodeEl, explicitStyleProperties)
        : undefined,
    isRenderable: node.shape !== "noteGroup",
  };
};

const parseStateEdge = (
  edge: MermaidStateEdge,
  containerEl: Element
): StateEdge | null => {
  const edgeEl = containerEl.querySelector<SVGPathElement>(`[id='${edge.id}']`);
  if (!edgeEl) {
    return null;
  }

  const { tx, ty } = accumulateTranslation(edgeEl, containerEl);
  const edgePositionData = computeEdgePositions(
    edgeEl,
    { x: tx, y: ty },
    "MCL"
  );

  if (edgePositionData.reflectionPoints.length < 2) {
    return null;
  }

  const edgeStyle: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: ExcalidrawLinearElement["strokeStyle"];
  } = {};
  const applyEdgeStyleProperty = (property: string, value: string) => {
    switch (property) {
      case CONTAINER_STYLE_PROPERTY.STROKE:
        if (isMeaningfulCSSColor(value)) {
          edgeStyle.strokeColor = cleanCSSValue(value);
        }
        break;
      case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH: {
        const strokeWidth = parseFloat(cleanCSSValue(value));
        if (Number.isFinite(strokeWidth) && strokeWidth > 0) {
          edgeStyle.strokeWidth = strokeWidth;
        }
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY:
        if (cleanCSSValue(value)) {
          edgeStyle.strokeStyle = "dashed";
        }
        break;
    }
  };

  [edge.style].filter(Boolean).forEach((styleText) => {
    parseCSSDeclarations(styleText || "").forEach(({ property, value }) => {
      applyEdgeStyleProperty(property, value);
    });
  });
  const isNoteEdge =
    edge.arrowhead === "none" || edge.classes?.includes("note-edge");

  return {
    id: edge.id,
    start: edge.start,
    end: edge.end,
    text: entityCodesToText(edge.label || ""),
    ...edgePositionData,
    strokeColor: edgeStyle.strokeColor,
    strokeWidth: edgeStyle.strokeWidth,
    strokeStyle: isNoteEdge ? "dashed" : edgeStyle.strokeStyle,
    isNoteEdge,
  };
};

export const parseMermaidStateDiagram = (
  db: StateDB,
  containerEl: Element
): State => {
  const { nodes, edges } = db.getData();
  const resolveNodeElement = createNodeElementResolver(containerEl);

  return {
    type: "state",
    nodes: nodes.map((node) =>
      parseStateNode(node, containerEl, resolveNodeElement)
    ),
    edges: edges
      .map((edge) => parseStateEdge(edge, containerEl))
      .filter((edge): edge is StateEdge => edge !== null),
  };
};
