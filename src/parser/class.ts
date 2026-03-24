import { nanoid } from "nanoid";

import {
  dedupeConsecutivePoints,
  entityCodesToText,
  getDecodedEdgePoints,
  getPathCoordinates,
  getTransformAttr,
} from "../utils.js";
import {
  Arrow,
  Container,
  Line,
  Node,
  Text,
  createArrowSkeletion,
  createContainerSkeletonFromSVG,
  createLineSkeletonFromSVG,
  createTextSkeleton,
} from "../elementSkeleton.js";
import {
  cleanCSSValue,
  isValidCSSColor,
  parseCSSDeclarations,
  resolveElementTextColor,
} from "./cssUtils.js";
import type { Position } from "../interfaces.js";

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

import type { Diagram } from "mermaid/dist/Diagram.js";
import type {
  ClassNode,
  ClassNote,
  ClassRelation,
  NamespaceNode,
} from "mermaid/dist/diagrams/class/classTypes.js";
import type { ExcalidrawLinearElement } from "@excalidraw/excalidraw/element/types";

// Taken from mermaidParser.relationType
const RELATION_TYPE = {
  AGGREGATION: 0,
  EXTENSION: 1,
  COMPOSITION: 2,
  DEPENDENCY: 3,
  LOLLIPOP: 4,
};

type RELATION_TYPE_VALUES =
  | (typeof RELATION_TYPE)[keyof typeof RELATION_TYPE]
  | "none";
// Taken from mermaidParser.lineType
const LINE_TYPE = {
  LINE: 0,
  DOTTED_LINE: 1,
};

// This is the offset to update the arrow head postition for rendering in excalidraw as mermaid calculates the position until the start of arrowhead
const MERMAID_ARROW_HEAD_OFFSET = 16;

export interface Class {
  type: "class";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  text: Text[];
  namespaces: NamespaceNode[];
}

const getStrokeStyle = (type: number) => {
  let lineType: ExcalidrawLinearElement["strokeStyle"];
  switch (type) {
    case LINE_TYPE.LINE:
      lineType = "solid";
      break;
    case LINE_TYPE.DOTTED_LINE:
      lineType = "dotted";
      break;
    default:
      lineType = "solid";
  }
  return lineType;
};

const getArrowhead = (type: RELATION_TYPE_VALUES) => {
  let arrowhead: ExcalidrawLinearElement["startArrowhead"];
  switch (type) {
    case RELATION_TYPE.AGGREGATION:
      arrowhead = "diamond_outline";
      break;

    case RELATION_TYPE.COMPOSITION:
      arrowhead = "diamond";
      break;
    case RELATION_TYPE.EXTENSION:
      arrowhead = "triangle_outline";
      break;
    case "none":
      arrowhead = null;
      break;

    case RELATION_TYPE.DEPENDENCY:
    default:
      arrowhead = "arrow";
      break;
  }
  return arrowhead;
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

const ARROWHEAD_OFFSET_SHAPES = new Set([
  "triangle_outline",
  "diamond",
  "diamond_outline",
]);

const simplifyRoutePoints = (
  points: readonly Position[],
  tolerance = 0.5
): Position[] => {
  if (points.length <= 2) {
    return [...points];
  }

  const simplifiedPoints: Position[] = [points[0]];

  for (let index = 1; index < points.length - 1; index++) {
    const previousPoint = simplifiedPoints[simplifiedPoints.length - 1];
    const currentPoint = points[index];
    const nextPoint = points[index + 1];

    const baseX = nextPoint.x - previousPoint.x;
    const baseY = nextPoint.y - previousPoint.y;
    const baseLength = Math.hypot(baseX, baseY);

    if (!baseLength) {
      continue;
    }

    const areaTwice = Math.abs(
      baseX * (currentPoint.y - previousPoint.y) -
        baseY * (currentPoint.x - previousPoint.x)
    );
    const distanceFromSegment = areaTwice / baseLength;
    const projection =
      ((currentPoint.x - previousPoint.x) * baseX +
        (currentPoint.y - previousPoint.y) * baseY) /
      (baseLength * baseLength);

    if (
      distanceFromSegment <= tolerance &&
      projection >= -tolerance &&
      projection <= 1 + tolerance
    ) {
      continue;
    }

    simplifiedPoints.push(currentPoint);
  }

  simplifiedPoints.push(points[points.length - 1]);
  return simplifiedPoints;
};

const getEdgeRoutePoints = (edgePath: SVGPathElement): Position[] => {
  const routePoints = dedupeConsecutivePoints(
    getDecodedEdgePoints(edgePath).map(
      (point) => [point.x, point.y] as [number, number]
    )
  ).map(([x, y]) => ({ x, y }));

  const renderedPathCoordinates = getPathCoordinates(edgePath);
  if (renderedPathCoordinates && routePoints.length >= 2) {
    routePoints[0] = {
      x: renderedPathCoordinates.startX,
      y: renderedPathCoordinates.startY,
    };
    routePoints[routePoints.length - 1] = {
      x: renderedPathCoordinates.endX,
      y: renderedPathCoordinates.endY,
    };
  }

  return simplifyRoutePoints(routePoints);
};

const movePointAwayFromAdjacent = (
  point: Position,
  adjacentPoint: Position,
  distance: number
): Position => {
  const dx = point.x - adjacentPoint.x;
  const dy = point.y - adjacentPoint.y;
  const magnitude = Math.hypot(dx, dy);

  if (!magnitude) {
    return point;
  }

  return {
    x: point.x + (dx / magnitude) * distance,
    y: point.y + (dy / magnitude) * distance,
  };
};

const setArrowRoutePoints = (arrow: Arrow, points: readonly Position[]) => {
  const dedupedPoints = dedupeConsecutivePoints(
    points.map((point) => [point.x, point.y] as [number, number])
  ).map(([x, y]) => ({ x, y }));

  if (dedupedPoints.length < 2) {
    throw new Error("Arrow route must contain at least two points");
  }

  const startPoint = dedupedPoints[0];
  const endPoint = dedupedPoints[dedupedPoints.length - 1];

  arrow.startX = startPoint.x;
  arrow.startY = startPoint.y;
  arrow.endX = endPoint.x;
  arrow.endY = endPoint.y;
  arrow.points = dedupedPoints.map((point) => [
    point.x - startPoint.x,
    point.y - startPoint.y,
  ]);
};

const adjustArrowPosition = (arrow: Arrow) => {
  const routePoints = arrow.points
    ?.map(([x, y]) => ({ x: arrow.startX + x, y: arrow.startY + y }))
    .filter(
      (point): point is Position =>
        Number.isFinite(point.x) && Number.isFinite(point.y)
    );

  if (!routePoints || routePoints.length < 2) {
    return arrow;
  }

  const updatedPoints = [...routePoints];
  const shouldUpdateStartArrowhead =
    !!arrow.startArrowhead && ARROWHEAD_OFFSET_SHAPES.has(arrow.startArrowhead);
  const shouldUpdateEndArrowhead =
    !!arrow.endArrowhead && ARROWHEAD_OFFSET_SHAPES.has(arrow.endArrowhead);

  if (!shouldUpdateStartArrowhead && !shouldUpdateEndArrowhead) {
    return arrow;
  }

  if (shouldUpdateStartArrowhead) {
    updatedPoints[0] = movePointAwayFromAdjacent(
      updatedPoints[0],
      updatedPoints[1],
      MERMAID_ARROW_HEAD_OFFSET
    );
  }

  if (shouldUpdateEndArrowhead) {
    const lastIndex = updatedPoints.length - 1;
    updatedPoints[lastIndex] = movePointAwayFromAdjacent(
      updatedPoints[lastIndex],
      updatedPoints[lastIndex - 1],
      MERMAID_ARROW_HEAD_OFFSET
    );
  }

  setArrowRoutePoints(arrow, updatedPoints);
  return arrow;
};

const applyPathStylingToArrow = (edgePath: SVGPathElement, arrow: Arrow) => {
  const strokeColor = cleanCSSValue(
    edgePath.getAttribute("stroke") || getComputedStyle(edgePath).stroke || ""
  );
  const strokeWidth = parseFloat(
    edgePath.getAttribute("stroke-width") ||
      getComputedStyle(edgePath).strokeWidth ||
      "1"
  );

  if (isValidCSSColor(strokeColor) && strokeColor !== "none") {
    arrow.strokeColor = strokeColor;
  }
  if (Number.isFinite(strokeWidth) && strokeWidth > 0) {
    arrow.strokeWidth = strokeWidth;
  }
};

const mergeEdgeRoutePoints = (edgePaths: readonly SVGPathElement[]) => {
  const mergedPoints: Position[] = [];

  edgePaths.forEach((edgePath) => {
    getEdgeRoutePoints(edgePath).forEach((point) => {
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

  return simplifyRoutePoints(mergedPoints);
};

const createArrowFromRoutePoints = (
  routePoints: readonly Position[],
  primaryEdgePath: SVGPathElement | undefined,
  opts: NonNullable<Parameters<typeof createArrowSkeletion>[4]>
) => {
  if (routePoints.length < 2) {
    throw new Error(
      `Class diagram edge ${primaryEdgePath?.id || "<unknown>"} is missing usable path points`
    );
  }

  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];
  const arrow = createArrowSkeletion(
    startPoint.x,
    startPoint.y,
    endPoint.x,
    endPoint.y,
    {
      id:
        primaryEdgePath?.getAttribute("data-id") ||
        primaryEdgePath?.id ||
        undefined,
      ...opts,
      points: routePoints.map((point) => [
        point.x - startPoint.x,
        point.y - startPoint.y,
      ]),
    }
  );

  if (primaryEdgePath) {
    applyPathStylingToArrow(primaryEdgePath, arrow);
  }
  return adjustArrowPosition(arrow);
};

const createPreservedRouteArrowFromEdgePaths = (
  edgePaths: readonly SVGPathElement[],
  opts: NonNullable<Parameters<typeof createArrowSkeletion>[4]>
) =>
  createArrowFromRoutePoints(mergeEdgeRoutePoints(edgePaths), edgePaths[0], opts);

// Standard class relations read better in Excalidraw as direct connections.
// Keep this separate from preserved-route arrows so we can remove/adjust this
// policy later without touching self-loops or note connectors.
const createStraightClassRelationArrowFromEdgePath = (
  edgePath: SVGPathElement,
  opts: NonNullable<Parameters<typeof createArrowSkeletion>[4]>
) => {
  const routePoints = getEdgeRoutePoints(edgePath);
  return createArrowFromRoutePoints(
    [routePoints[0], routePoints[routePoints.length - 1]],
    edgePath,
    opts
  );
};

const createArrowFromEdgePath = (
  edgePath: SVGPathElement,
  opts: NonNullable<Parameters<typeof createArrowSkeletion>[4]>
) => createPreservedRouteArrowFromEdgePaths([edgePath], opts);

const getSelfRelationEdgePaths = (
  classId: string,
  containerEl: Element
): SVGPathElement[] => {
  const cyclicPathIds = [
    `${classId}-cyclic-special-1`,
    `${classId}-cyclic-special-mid`,
    `${classId}-cyclic-special-2`,
  ];

  return cyclicPathIds
    .map((pathId) =>
      containerEl.querySelector<SVGPathElement>(
        `path[id="${pathId}"][data-edge="true"]`
      )
    )
    .filter((path): path is SVGPathElement => path !== null);
};

const getArrowRoutePoints = (arrow: Arrow): Position[] => {
  return (
    arrow.points
      ?.map(([x, y]) => ({ x: arrow.startX + x, y: arrow.startY + y }))
      .filter(
        (point): point is Position =>
          Number.isFinite(point.x) && Number.isFinite(point.y)
      ) || []
  );
};

const getSelfRelationTitlePosition = (
  arrow: Arrow,
  side: "start" | "end"
): Position | null => {
  const routePoints = getArrowRoutePoints(arrow);
  if (routePoints.length < 2) {
    return null;
  }

  const isStart = side === "start";
  const endpoint = isStart ? routePoints[0] : routePoints[routePoints.length - 1];
  const adjacentPoint = isStart
    ? routePoints[1]
    : routePoints[routePoints.length - 2];

  const horizontalDirection =
    adjacentPoint.x === endpoint.x
      ? isStart
        ? -1
        : 1
      : Math.sign(adjacentPoint.x - endpoint.x);
  const verticalDirection =
    adjacentPoint.y === endpoint.y
      ? 1
      : Math.sign(adjacentPoint.y - endpoint.y);

  return {
    x: endpoint.x + horizontalDirection * 20,
    y: endpoint.y + (verticalDirection >= 0 ? 12 : -28),
  };
};

type ClassTextSection = "header" | "members" | "methods" | "other";

const getClassTextSection = (
  textNode: Element,
  classNode: Element
): ClassTextSection => {
  let current: Element | null = textNode;

  while (current && current !== classNode) {
    if (current.classList.contains("annotation-group")) {
      return "header";
    }
    if (current.classList.contains("label-group")) {
      return "header";
    }
    if (current.classList.contains("members-group")) {
      return "members";
    }
    if (current.classList.contains("methods-group")) {
      return "methods";
    }
    current = current.parentElement;
  }

  return "other";
};

const parseClasses = (
  classes: { [key: string]: ClassNode },
  containerEl: Element,
  lookUpDomId?: (id: string) => string | undefined
) => {
  const nodes: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];

  Object.values(classes).forEach((classNode) => {
    const { domId, id: classId } = classNode;
    const groupId = nanoid();

    const classStyles = parseStyleStrings(
      // @ts-ignore
      (classNode as any).styles || (classNode as any).cssStyles
    );

    // Mermaid v11 generates class groups with ids like "classId-<id>-<n>"
    // but the domId stored on the class might not exactly match. Try a
    // few fallbacks so we can find the correct group.
    let lookedUpId: string | undefined;
    try {
      lookedUpId = lookUpDomId ? lookUpDomId(classId) : undefined;
    } catch {
      lookedUpId = undefined;
    }

    const findByPrefix = (id: string) => {
      const regex = new RegExp(`^classId-${id}(?:-|$)`);
      const all = Array.from(
        containerEl.querySelectorAll<SVGGElement>("[id]")
      ).filter((el) => regex.test(el.id));
      return all[0];
    };

    const domNode =
      (lookedUpId &&
        containerEl.querySelector<SVGGElement>(`#${lookedUpId}`)) ||
      containerEl.querySelector<SVGGElement>(`#${domId}`) ||
      containerEl.querySelector<SVGGElement>(`[data-id='${classId}']`) ||
      findByPrefix(classId);

    if (!domNode) {
      throw Error(`DOM Node with id ${domId} not found`);
    }

    // Prefer the explicit rect if present, otherwise fall back to the group bbox
    const containerSource =
      (domNode.querySelector("rect") as SVGGraphicsElement | null) || domNode;

    const containerBBox = containerSource.getBBox();
    const { tx: containerTx, ty: containerTy } = accumulateTranslation(
      containerSource,
      containerEl
    );

    const container: Container = {
      type: "rectangle",
      id: classId,
      groupId,
      x: containerBBox.x + containerTx,
      y: containerBBox.y + containerTy,
      width: containerBBox.width,
      height: containerBBox.height,
      metadata: { classId },
    };

    // Apply styles from rendered shape (fill/stroke/dash)
    const fill = containerSource.getAttribute("fill");
    const stroke = containerSource.getAttribute("stroke");
    const strokeWidth = containerSource.getAttribute("stroke-width");
    const dashArray = containerSource.getAttribute("stroke-dasharray");

    const computed = getComputedStyle(containerSource as Element);
    // Only fall back to computed styles when an explicit attribute exists; otherwise leave undefined for defaults
    const resolvedFill = cleanCSSValue(
      fill || classStyles.fill || (fill ? computed.fill : "")
    );
    const resolvedStroke = cleanCSSValue(
      stroke || classStyles.stroke || (stroke ? computed.stroke : "")
    );
    const resolvedStrokeWidth =
      strokeWidth ||
      classStyles["stroke-width"] ||
      (strokeWidth ? computed.strokeWidth : "");
    const resolvedDash =
      dashArray ||
      classStyles["stroke-dasharray"] ||
      (dashArray
        ? computed.strokeDasharray === "none"
          ? ""
          : computed.strokeDasharray
        : "");

    const isMeaningfulColor = (value: string) => {
      if (!value) {
        return false;
      }
      if (!isValidCSSColor(value)) {
        return false;
      }
      const v = value.toLowerCase();
      return !(
        v === "none" ||
        v === "transparent" ||
        v === "rgba(0, 0, 0, 0)" ||
        v === "black" ||
        v === "#000" ||
        v === "#000000" ||
        v === "rgb(0, 0, 0)" ||
        v === "rgba(0, 0, 0, 1)"
      );
    };

    if (isMeaningfulColor(resolvedFill)) {
      container.bgColor = resolvedFill;
    } else {
      container.bgColor = undefined;
    }
    if (isMeaningfulColor(resolvedStroke)) {
      container.strokeColor = resolvedStroke;
    } else {
      container.strokeColor = undefined;
    }
    if (resolvedStrokeWidth) {
      container.strokeWidth = Number(resolvedStrokeWidth);
    } else {
      container.strokeWidth = undefined;
    }
    if (resolvedDash && resolvedDash.trim().length > 0) {
      container.strokeStyle = "dashed";
    } else {
      container.strokeStyle = undefined;
    }

    nodes.push(container);

    // Divider lines inside the class container (members/methods split)
    const lineNodes = [
      ...Array.from(domNode.querySelectorAll("line")),
      ...Array.from(domNode.querySelectorAll("g.divider path")),
    ] as SVGGraphicsElement[];

    lineNodes.forEach((lineNode) => {
      const { tx, ty } = accumulateTranslation(lineNode, containerEl);

      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;

      if (lineNode.tagName.toLowerCase() === "line") {
        startX = Number(lineNode.getAttribute("x1")) + tx;
        startY = Number(lineNode.getAttribute("y1")) + ty;
        endX = Number(lineNode.getAttribute("x2")) + tx;
        endY = Number(lineNode.getAttribute("y2")) + ty;
      } else {
        const bbox = lineNode.getBBox();
        startX = bbox.x + tx;
        endX = bbox.x + bbox.width + tx;
        const centerY = bbox.y + bbox.height / 2 + ty;
        startY = centerY;
        endY = centerY;
      }

      // Skip zero-length lines (happens when class has no members)
      if (startX === endX && startY === endY) {
        return;
      }

      const line = createLineSkeletonFromSVG(
        // @ts-ignore
        lineNode,
        startX,
        startY,
        endX,
        endY,
        {
          groupId,
          id: nanoid(),
        }
      );
      // Only inherit styling when explicitly set; otherwise keep defaults
      if (container.strokeColor) {
        line.strokeColor = container.strokeColor;
      } else {
        line.strokeColor = undefined;
      }
      if (container.strokeWidth !== undefined) {
        line.strokeWidth = container.strokeWidth;
      } else {
        line.strokeWidth = undefined;
      }
      if (container.strokeStyle) {
        line.strokeStyle = container.strokeStyle;
      } else {
        line.strokeStyle = undefined;
      }
      line.metadata = { classId };

      lines.push(line);
    });

    // Parse text elements (class titles, members, methods)
    const textElements = Array.from(
      domNode.querySelectorAll("text, foreignObject")
    ) as SVGGraphicsElement[];

    const parsedTextElements: Array<{
      section: ClassTextSection;
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      color?: string;
    }> = [];

    textElements.forEach((textNode) => {
      const isForeignObject =
        textNode.tagName.toLowerCase() === "foreignobject";

      const tspans = !isForeignObject
        ? Array.from(textNode.querySelectorAll("tspan"))
        : [];

      const rawText = tspans.length
        ? tspans
            .map((span) => span.textContent?.trim())
            .filter(Boolean)
            .join("\n")
        : textNode.textContent?.trim() || "";

      if (!rawText) {
        return;
      }

      const boundingBox = textNode.getBBox();
      const { ty } = accumulateTranslation(textNode, containerEl);
      let fontSize = parseFloat(getComputedStyle(textNode).fontSize || "");

      if (isForeignObject && (!Number.isFinite(fontSize) || !fontSize)) {
        const inner = textNode.querySelector<HTMLElement>("div, span, p");
        if (inner) {
          fontSize = parseFloat(getComputedStyle(inner).fontSize || "");
        }
      }

      if (!Number.isFinite(fontSize) || fontSize <= 0) {
        fontSize = Math.max(12, boundingBox.height * 0.6);
      }

      // Slightly reduce font size to better fit the original box dimensions
      fontSize = fontSize * 0.9;

      const resolvedTextColor = resolveElementTextColor(
        textNode,
        classStyles.color
      );

      parsedTextElements.push({
        section: getClassTextSection(textNode, domNode),
        text: entityCodesToText(rawText),
        x: boundingBox.x,
        y: boundingBox.y + ty,
        width:
          container && container.width
            ? Math.max(container.width - 8, boundingBox.width)
            : boundingBox.width,
        height: boundingBox.height,
        fontSize,
        color: resolvedTextColor,
      });
    });

    const headerTextElements = parsedTextElements
      .filter((element) => element.section === "header")
      .sort((a, b) => a.y - b.y || a.x - b.x);

    if (!container.label) {
      const fallbackHeaderTextElements =
        headerTextElements.length === 0 && parsedTextElements.length === 1
          ? parsedTextElements
          : headerTextElements;

      if (fallbackHeaderTextElements.length > 0) {
        container.label = {
          text: fallbackHeaderTextElements
            .map((element) => element.text)
            .join("\n"),
          fontSize: Math.max(
            ...fallbackHeaderTextElements.map((element) => element.fontSize)
          ),
          color: fallbackHeaderTextElements.find((element) => element.color)
            ?.color,
          verticalAlign: "top",
        };
      }
    }

    parsedTextElements
      .filter((element) => {
        if (headerTextElements.length > 0) {
          return element.section !== "header";
        }
        return !(container.label && parsedTextElements.length === 1);
      })
      .forEach((element) => {
        const textElement = createTextSkeleton(
          (container?.x || 0) + 4,
          element.y,
          element.text,
          {
            width: element.width,
            height: element.height,
            fontSize: element.fontSize,
            color: element.color,
            id: nanoid(),
            groupId,
            metadata: { classId },
          }
        );

        text.push(textElement);
      });
  });
  return { nodes, lines, text };
};

const parseRelations = (
  relations: ClassRelation[],
  classNodes: Container[],
  containerEl: Element,
  direction: "LR" | "RL" | "TB" | "BT"
) => {
  const relationEdges = Array.from(
    containerEl.querySelectorAll<SVGPathElement>(
      '.edgePaths path[data-edge="true"]:not([id^="edgeNote"]):not([id*="-cyclic-special-"])'
    )
  );

  // If there are no relations, return empty arrays
  if (relations.length === 0) {
    return { arrows: [], text: [] };
  }
  const arrows: Arrow[] = [];
  const text: Text[] = [];

  let relationEdgeIndex = 0;

  relations.forEach((relationNode) => {
    const { id1, id2, relation } = relationNode;
    const node1 = classNodes.find((node) => node.id === id1);
    const node2 = classNodes.find((node) => node.id === id2);

    if (!node1) {
      throw new Error(`parseRelations: Cannot find node with id ${id1}`);
    }
    if (!node2) {
      throw new Error(`parseRelations: Cannot find node with id ${id2}`);
    }

    const strokeStyle = getStrokeStyle(relation.lineType);
    const startArrowhead = getArrowhead(relation.type1);
    const endArrowhead = getArrowhead(relation.type2);

    let arrow: Arrow;

    if (id1 === id2) {
      const edgePaths = getSelfRelationEdgePaths(id1, containerEl);
      if (!edgePaths.length) {
        throw new Error(
          `parseRelations: Cannot find rendered SVG edge for relation ${id1} -> ${id2}`
        );
      }

      arrow = createPreservedRouteArrowFromEdgePaths(edgePaths, {
        strokeStyle,
        startArrowhead,
        endArrowhead,
        label: relationNode.title ? { text: relationNode.title } : undefined,
        start: { type: "rectangle", id: node1.id },
        end: { type: "rectangle", id: node2.id },
      });
    } else {
      const edgePath = relationEdges[relationEdgeIndex];
      if (!edgePath) {
        throw new Error(
          `parseRelations: Cannot find rendered SVG edge for relation ${id1} -> ${id2}`
        );
      }

      relationEdgeIndex += 1;
      arrow = createStraightClassRelationArrowFromEdgePath(edgePath, {
        strokeStyle,
        startArrowhead,
        endArrowhead,
        label: relationNode.title ? { text: relationNode.title } : undefined,
        start: { type: "rectangle", id: node1.id },
        end: { type: "rectangle", id: node2.id },
      });
    }

    arrows.push(arrow);

    // Add cardianlities and Multiplicities
    const { relationTitle1, relationTitle2 } = relationNode;
    const isSelfRelation = id1 === id2;
    const offsetX = 20;
    const offsetY = 15;
    const directionOffset = 15;
    let x;
    let y;

    if (relationTitle1 && relationTitle1 !== "none") {
      if (isSelfRelation) {
        const position = getSelfRelationTitlePosition(arrow, "start");
        if (position) {
          x = position.x;
          y = position.y;
        }
      } else {
        switch (direction) {
          case "TB":
            x = arrow.startX - offsetX;
            if (arrow.endX < arrow.startX) {
              x -= directionOffset;
            }
            y = arrow.startY + offsetY;
            break;
          case "BT":
            x = arrow.startX + offsetX;
            if (arrow.endX > arrow.startX) {
              x += directionOffset;
            }
            y = arrow.startY - offsetY;
            break;
          case "LR":
            x = arrow.startX + offsetX;
            y = arrow.startY + offsetY;
            if (arrow.endY > arrow.startY) {
              y += directionOffset;
            }
            break;
          case "RL":
            x = arrow.startX - offsetX;
            y = arrow.startY - offsetY;
            if (arrow.startY > arrow.endY) {
              y -= directionOffset;
            }
            break;
          default:
            x = arrow.startX - offsetX;
          y = arrow.startY + offsetY;
        }
      }

      x ??= arrow.startX - offsetX;
      y ??= arrow.startY + offsetY;

      const relationTitleElement = createTextSkeleton(x, y, relationTitle1, {
        fontSize: 16,
      });

      text.push(relationTitleElement);
    }
    if (relationTitle2 && relationTitle2 !== "none") {
      if (isSelfRelation) {
        const position = getSelfRelationTitlePosition(arrow, "end");
        if (position) {
          x = position.x;
          y = position.y;
        }
      } else {
        switch (direction) {
          case "TB":
            x = arrow.endX + offsetX;
            if (arrow.endX < arrow.startX) {
              x += directionOffset;
            }
            y = arrow.endY - offsetY;
            break;
          case "BT":
            x = arrow.endX - offsetX;
            if (arrow.endX > arrow.startX) {
              x -= directionOffset;
            }
            y = arrow.endY + offsetY;
            break;
          case "LR":
            x = arrow.endX - offsetX;
            y = arrow.endY - offsetY;
            if (arrow.endY > arrow.startY) {
              y -= directionOffset;
            }
            break;
          case "RL":
            x = arrow.endX + offsetX;
            y = arrow.endY + offsetY;
            if (arrow.startY > arrow.endY) {
              y += directionOffset;
            }
            break;
          default:
            x = arrow.endX + offsetX;
          y = arrow.endY - offsetY;
        }
      }

      x ??= arrow.endX + offsetX;
      y ??= arrow.endY + offsetY;

      const relationTitleElement = createTextSkeleton(x, y, relationTitle2, {
        fontSize: 16,
      });

      text.push(relationTitleElement);
    }
  });
  return { arrows, text };
};

const parseNotes = (
  notes: ClassNote[],
  containerEl: Element,
  classNodes: Container[]
) => {
  const noteContainers: Container[] = [];
  const connectors: Arrow[] = [];
  notes.forEach((note, index) => {
    const { id, text, class: classId } = note;
    const node = containerEl.querySelector<SVGSVGElement>(`#${id}`);
    if (!node) {
      throw new Error(`Node with id ${id} not found!`);
    }
    const { transformX, transformY } = getTransformAttr(node);
    const rect = node.firstChild as SVGRectElement;
    const container = createContainerSkeletonFromSVG(rect, "rectangle", {
      id,
      subtype: "note",
      label: { text },
    });
    Object.assign(container, {
      x: container.x + transformX,
      y: container.y + transformY,
    });
    noteContainers.push(container);
    if (classId) {
      const classNode = classNodes.find((node) => node.id === classId);
      if (!classNode) {
        throw new Error(`class node with id ${classId} not found!`);
      }

      const edgePath = containerEl.querySelector<SVGPathElement>(
        `path[id="edgeNote${index + 1}"][data-edge="true"]`
      );

      if (edgePath) {
        connectors.push(
          createArrowFromEdgePath(edgePath, {
            strokeStyle: "dotted",
            startArrowhead: null,
            endArrowhead: null,
            start: { id: container.id, type: "rectangle" },
            end: { id: classNode.id, type: "rectangle" },
          })
        );
        return;
      }

      const startX = container.x + (container.width || 0) / 2;
      const startY = container.y + (container.height || 0);
      const endX = startX;
      const endY = classNode.y;
      const connector = createArrowSkeletion(startX, startY, endX, endY, {
        strokeStyle: "dotted",
        startArrowhead: null,
        endArrowhead: null,
        start: { id: container.id, type: "rectangle" },
        end: { id: classNode.id, type: "rectangle" },
      });
      connectors.push(connector);
    }
  });
  return { notes: noteContainers, connectors };
};

export const parseMermaidClassDiagram = (
  diagram: Diagram,
  containerEl: Element
): Class => {
  // In Mermaid v11, use diagram.db instead of parser.yy
  //@ts-ignore - ClassDB type not properly exported
  const db = diagram.db;

  //@ts-ignore
  const direction: "LR" | "RL" | "TB" | "BT" = db.getDirection?.() || "TB";

  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const text: Array<Text> = [];
  const classNodes: Array<Container> = [];

  //@ts-ignore
  const namespaces: NamespaceNode[] = db.getNamespaces?.() || [];

  //@ts-ignore
  const classesData = db.getClasses?.() || {};

  // Convert Map to object if necessary
  const classes: { [key: string]: ClassNode } =
    classesData instanceof Map ? Object.fromEntries(classesData) : classesData;

  if (classes && Object.keys(classes).length) {
    const lookUpDomId =
      //@ts-ignore
      typeof db.lookUpDomId === "function"
        ? //@ts-ignore
          db.lookUpDomId.bind(db)
        : undefined;

    const classData = parseClasses(classes, containerEl, lookUpDomId);
    nodes.push(classData.nodes);
    lines.push(...classData.lines);
    text.push(...classData.text);
    classNodes.push(...classData.nodes);
  }

  //@ts-ignore
  const relations = db.getRelations?.() || [];
  const { arrows, text: relationTitles } = parseRelations(
    relations,
    classNodes,
    containerEl,
    direction
  );

  //@ts-ignore
  const notes = db.getNotes?.() || [];
  const { notes: noteContainers, connectors } = parseNotes(
    notes,
    containerEl,
    classNodes
  );
  nodes.push(noteContainers);
  arrows.push(...connectors);
  text.push(...relationTitles);

  return { type: "class", nodes, lines, arrows, text, namespaces };
};
