import { nanoid } from "nanoid";

import {
  Arrow,
  CardinalityArrowhead,
  Container,
  Line,
  Node,
  Text,
  createArrowSkeletion,
  createTextSkeleton,
} from "../elementSkeleton.js";
import { entityCodesToText, getTransformAttr } from "../utils.js";
import {
  cleanCSSValue,
  isValidCSSColor,
  parseCSSDeclarations,
  resolveElementTextColor,
} from "./cssUtils.js";

import type { ErDB } from "mermaid/dist/diagrams/er/erDb.js";
import type { EntityNode } from "mermaid/dist/diagrams/er/erTypes.js";

type ERLayoutEdge = {
  id: string;
  start: string;
  end: string;
  label?: string;
  pattern?: string;
  arrowTypeStart?: string;
  arrowTypeEnd?: string;
};

type ParsedTextGroup = {
  className: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color?: string;
};

const ERD_TABLE_TEXT_FONT_SIZE = 18;

export interface ERD {
  type: "erd";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  text: Text[];
}

const parseStyleStrings = (styles?: string[]) => {
  const styleObj: Record<string, string> = {};
  if (!styles) {
    return styleObj;
  }

  styles.forEach((style) => {
    parseCSSDeclarations(style).forEach(({ property, value }) => {
      if (property && value) {
        styleObj[property] = cleanCSSValue(value);
      }
    });
  });

  return styleObj;
};

const parseStrokeWidth = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numericValue =
    typeof value === "number" ? value : parseFloat(cleanCSSValue(value));

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return undefined;
  }

  return numericValue;
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

const getTextContent = (node: Element) => {
  const tspans = Array.from(node.querySelectorAll("tspan"));
  const text = tspans.length
    ? tspans
        .map((span) => span.textContent?.trim())
        .filter(Boolean)
        .join("\n")
    : node.textContent?.trim() || "";

  return entityCodesToText(text);
};

const getFontSize = (node: Element) => {
  const textNode =
    node.querySelector<HTMLElement>("text, foreignObject, div, span, p") ||
    (node as HTMLElement);
  let fontSize = parseFloat(getComputedStyle(textNode).fontSize || "");

  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    fontSize = Math.max(
      12,
      (node as SVGGraphicsElement).getBBox().height * 0.75
    );
  }

  return fontSize;
};

const parseTextGroup = (
  group: SVGGraphicsElement,
  containerEl: Element,
  fallbackColor?: string
): ParsedTextGroup | null => {
  const text = getTextContent(group);
  if (!text) {
    return null;
  }

  const bbox = group.getBBox();
  const { tx, ty } = accumulateTranslation(group, containerEl);

  return {
    className: group.getAttribute("class") || "",
    text,
    x: bbox.x + tx,
    y: bbox.y + ty,
    width: bbox.width,
    height: bbox.height,
    fontSize: getFontSize(group),
    color: resolveElementTextColor(group, fallbackColor),
  };
};

const getPathCoordinates = (path: SVGPathElement) => {
  const dAttr = path.getAttribute("d");
  if (!dAttr) {
    return null;
  }

  const numericTokens = Array.from(
    dAttr.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi),
    (match) => Number(match[0])
  );

  if (numericTokens.length < 4) {
    return null;
  }

  return {
    startX: numericTokens[0],
    startY: numericTokens[1],
    endX: numericTokens[numericTokens.length - 2],
    endY: numericTokens[numericTokens.length - 1],
  };
};

const getDividerLine = (
  dividerNode: SVGPathElement | SVGLineElement,
  containerEl: Element,
  groupId: string | undefined,
  entityId: string,
  fallbackStrokeColor?: string,
  fallbackStrokeWidth?: number,
  fallbackStrokeStyle?: Line["strokeStyle"]
): Line | null => {
  const { tx, ty } = accumulateTranslation(dividerNode, containerEl);
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  if (dividerNode.tagName.toLowerCase() === "line") {
    startX = Number(dividerNode.getAttribute("x1")) + tx;
    startY = Number(dividerNode.getAttribute("y1")) + ty;
    endX = Number(dividerNode.getAttribute("x2")) + tx;
    endY = Number(dividerNode.getAttribute("y2")) + ty;
  } else {
    const coords = getPathCoordinates(dividerNode);
    if (!coords) {
      return null;
    }

    startX = coords.startX + tx;
    startY = coords.startY + ty;
    endX = coords.endX + tx;
    endY = coords.endY + ty;
  }

  const line: Line = {
    type: "line",
    id: nanoid(),
    groupId,
    startX,
    startY,
    endX,
    endY,
    metadata: { entityId },
  };

  if (
    fallbackStrokeColor &&
    isValidCSSColor(fallbackStrokeColor) &&
    fallbackStrokeColor !== "none"
  ) {
    line.strokeColor = fallbackStrokeColor;
  }
  if (fallbackStrokeWidth !== undefined) {
    line.strokeWidth = fallbackStrokeWidth;
  }
  if (fallbackStrokeStyle) {
    line.strokeStyle = fallbackStrokeStyle;
  }

  return line;
};

const getCardinalityArrowhead = (
  arrowType?: string
): CardinalityArrowhead | null => {
  switch (arrowType?.toLowerCase()) {
    case "one":
      return "cardinality_one";
    case "many":
      return "cardinality_many";
    case "only_one":
      return "cardinality_exactly_one";
    case "one_or_more":
      return "cardinality_one_or_many";
    case "zero_or_one":
      return "cardinality_zero_or_one";
    case "zero_or_more":
      return "cardinality_zero_or_many";
    default:
      return null;
  }
};

const getStrokeStyle = (pattern?: string) => {
  switch (pattern) {
    case "dotted":
      return "dotted" as const;
    case "dashed":
      return "dashed" as const;
    default:
      return "solid" as const;
  }
};

const getDecodedEdgePoints = (
  edgePath: SVGPathElement
): Array<{ x: number; y: number }> => {
  const encodedPoints = edgePath.getAttribute("data-points");
  if (!encodedPoints) {
    const coords = getPathCoordinates(edgePath);
    return coords
      ? [
          { x: coords.startX, y: coords.startY },
          { x: coords.endX, y: coords.endY },
        ]
      : [];
  }

  try {
    const decoded = atob(encodedPoints);
    const points = JSON.parse(decoded);
    return Array.isArray(points)
      ? points.filter(
          (point): point is { x: number; y: number } =>
            point &&
            typeof point.x === "number" &&
            typeof point.y === "number" &&
            Number.isFinite(point.x) &&
            Number.isFinite(point.y)
        )
      : [];
  } catch {
    return [];
  }
};

const getRelationshipPaths = (
  edge: ERLayoutEdge,
  containerEl: Element
): SVGPathElement[] => {
  const directPath = containerEl.querySelector<SVGPathElement>(
    `path[id="${edge.id}"][data-edge="true"]`
  );
  if (directPath) {
    return [directPath];
  }

  if (edge.start !== edge.end) {
    return [];
  }

  const cyclicPathIds = [
    `${edge.start}-cyclic-special-1`,
    `${edge.start}-cyclic-special-mid`,
    `${edge.start}-cyclic-special-2`,
  ];

  return cyclicPathIds
    .map((pathId) =>
      containerEl.querySelector<SVGPathElement>(
        `path[id="${pathId}"][data-edge="true"]`
      )
    )
    .filter((path): path is SVGPathElement => path !== null);
};

const mergeEdgePoints = (edgePaths: SVGPathElement[]) => {
  const mergedPoints: Array<{ x: number; y: number }> = [];

  edgePaths.forEach((edgePath) => {
    getDecodedEdgePoints(edgePath).forEach((point) => {
      const previousPoint = mergedPoints[mergedPoints.length - 1];
      if (
        previousPoint &&
        previousPoint.x === point.x &&
        previousPoint.y === point.y
      ) {
        return;
      }

      mergedPoints.push(point);
    });
  });

  return mergedPoints;
};

const parseEntity = (
  entity: EntityNode,
  containerEl: Element
): { container: Container; lines: Line[]; text: Text[] } => {
  const domNode = containerEl.querySelector<SVGGElement>(`[id="${entity.id}"]`);
  if (!domNode) {
    throw new Error(`ER entity ${entity.id} not found in rendered SVG`);
  }

  const groupId = entity.attributes.length ? nanoid() : undefined;
  const bbox = domNode.getBBox();
  const { tx, ty } = accumulateTranslation(domNode, containerEl);
  const nodeStyle = parseStyleStrings([
    ...(entity.cssStyles || []),
    ...(entity.cssCompiledStyles || []),
  ]);
  const fill = cleanCSSValue(nodeStyle.fill || "");
  const stroke = cleanCSSValue(nodeStyle.stroke || "");
  const strokeWidth = parseStrokeWidth(nodeStyle["stroke-width"]);
  const dashArray = cleanCSSValue(nodeStyle["stroke-dasharray"] || "");

  const labelGroups = Array.from(
    domNode.querySelectorAll<SVGGraphicsElement>("g.label")
  )
    .map((group) => parseTextGroup(group, containerEl, nodeStyle.color))
    .filter((group): group is ParsedTextGroup => group !== null);

  const titleGroup =
    labelGroups.find((group) => group.className.includes("name")) ||
    labelGroups[0];
  const attributeGroups = labelGroups.filter((group) => group !== titleGroup);

  const titleText =
    titleGroup?.text || entityCodesToText(entity.alias || entity.label || "");

  const container: Container = {
    type: "rectangle",
    id: entity.id,
    groupId,
    x: bbox.x + tx,
    y: bbox.y + ty,
    width: bbox.width,
    height: bbox.height,
    label: {
      text: titleText,
      fontSize: entity.attributes.length
        ? ERD_TABLE_TEXT_FONT_SIZE
        : titleGroup?.fontSize || 16,
      color: titleGroup?.color,
      textAlign: "center",
      verticalAlign: entity.attributes.length ? "top" : "middle",
    },
    metadata: {
      entityId: entity.id,
      entityLabel: entity.label,
      entityAlias: entity.alias,
    },
  };

  if (isValidCSSColor(fill) && fill !== "none") {
    container.bgColor = fill;
  }
  if (isValidCSSColor(stroke) && stroke !== "none") {
    container.strokeColor = stroke;
  }
  if (strokeWidth && Number.isFinite(strokeWidth) && strokeWidth > 0) {
    container.strokeWidth = strokeWidth;
  }
  if (dashArray && dashArray !== "none") {
    container.strokeStyle = "dashed";
  }

  const lines = Array.from(
    domNode.querySelectorAll<SVGPathElement | SVGLineElement>(
      ".divider path, path.divider, line.divider"
    )
  )
    .map((dividerNode) =>
      getDividerLine(
        dividerNode,
        containerEl,
        groupId,
        entity.id,
        container.strokeColor,
        container.strokeWidth,
        container.strokeStyle
      )
    )
    .filter((line): line is Line => line !== null);

  const text = attributeGroups.map((group) =>
    createTextSkeleton(group.x, group.y, group.text, {
      id: nanoid(),
      groupId,
      width: group.width,
      height: group.height,
      fontSize: ERD_TABLE_TEXT_FONT_SIZE,
      color: group.color,
      metadata: { entityId: entity.id },
    })
  );

  return { container, lines, text };
};

const parseRelationship = (edge: ERLayoutEdge, containerEl: Element): Arrow => {
  const edgePaths = getRelationshipPaths(edge, containerEl);
  if (!edgePaths.length) {
    throw new Error(`ER relationship ${edge.id} not found in rendered SVG`);
  }

  const points = mergeEdgePoints(edgePaths);
  if (points.length < 2) {
    throw new Error(`ER relationship ${edge.id} is missing usable path points`);
  }

  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const edgePath = edgePaths[0];
  const strokeColor = cleanCSSValue(
    edgePath.getAttribute("stroke") || getComputedStyle(edgePath).stroke || ""
  );
  const strokeWidth = Number(
    edgePath.getAttribute("stroke-width") ||
      getComputedStyle(edgePath).strokeWidth ||
      1
  );

  const arrow = createArrowSkeletion(
    startPoint.x,
    startPoint.y,
    endPoint.x,
    endPoint.y,
    {
      id: edge.id,
      label: edge.label
        ? {
            text: entityCodesToText(edge.label),
            fontSize: 16,
            textAlign: "center",
          }
        : undefined,
      strokeStyle: getStrokeStyle(edge.pattern),
      startArrowhead: getCardinalityArrowhead(edge.arrowTypeStart),
      endArrowhead: getCardinalityArrowhead(edge.arrowTypeEnd),
      start: { type: "rectangle", id: edge.start },
      end: { type: "rectangle", id: edge.end },
      points: points.map((point) => [
        point.x - startPoint.x,
        point.y - startPoint.y,
      ]),
    }
  );

  if (isValidCSSColor(strokeColor) && strokeColor !== "none") {
    arrow.strokeColor = strokeColor;
  }
  if (Number.isFinite(strokeWidth) && strokeWidth > 0) {
    arrow.strokeWidth = strokeWidth;
  }

  return arrow;
};

export const parseMermaidERDiagram = (db: ErDB, containerEl: Element): ERD => {
  const data = db.getData();
  const entities = data.nodes as unknown as EntityNode[];
  const edges = data.edges as unknown as ERLayoutEdge[];

  const containers: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];

  entities.forEach((entity) => {
    const parsedEntity = parseEntity(entity, containerEl);
    containers.push(parsedEntity.container);
    lines.push(...parsedEntity.lines);
    text.push(...parsedEntity.text);
  });

  const arrows = edges.map((edge) => parseRelationship(edge, containerEl));

  return {
    type: "erd",
    nodes: [containers],
    lines,
    arrows,
    text,
  };
};
