import { nanoid } from "nanoid";

import {
  computeEdgePositions,
  entityCodesToText,
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
} from "./cssUtils.js";

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

      const resolvedTextColor = cleanCSSValue(
        (textNode as any).style?.color ||
          (getComputedStyle(textNode) as any).fill ||
          classStyles.color ||
          ""
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
        color: isValidCSSColor(resolvedTextColor)
          ? resolvedTextColor
          : undefined,
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

// update arrow position by certain offset for triangle and diamond arrow head types
// as mermaid calculates the position until the start of arrowhead
// for reference - https://github.com/mermaid-js/mermaid/issues/5417
const adjustArrowPosition = (direction: string, arrow: Arrow) => {
  // The arrowhead shapes where we need to update the position by a 16px offset
  const arrowHeadShapes = ["triangle_outline", "diamond", "diamond_outline"];

  const shouldUpdateStartArrowhead =
    arrow.startArrowhead && arrowHeadShapes.includes(arrow.startArrowhead);

  const shouldUpdateEndArrowhead =
    arrow.endArrowhead && arrowHeadShapes.includes(arrow.endArrowhead);

  if (!shouldUpdateEndArrowhead && !shouldUpdateStartArrowhead) {
    return arrow;
  }

  if (shouldUpdateStartArrowhead) {
    if (direction === "LR") {
      arrow.startX -= MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "RL") {
      arrow.startX += MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "TB") {
      arrow.startY -= MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "BT") {
      arrow.startY += MERMAID_ARROW_HEAD_OFFSET;
    }
  }

  if (shouldUpdateEndArrowhead) {
    if (direction === "LR") {
      arrow.endX += MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "RL") {
      arrow.endX -= MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "TB") {
      arrow.endY += MERMAID_ARROW_HEAD_OFFSET;
    } else if (direction === "BT") {
      arrow.endY -= MERMAID_ARROW_HEAD_OFFSET;
    }
  }
  return arrow;
};

const parseRelations = (
  relations: ClassRelation[],
  classNodes: Container[],
  containerEl: Element,
  direction: "LR" | "RL" | "TB" | "BT"
) => {
  const edges = containerEl.querySelector(".edgePaths")?.children;

  // If there are no relations, return empty arrays
  if (!edges || relations.length === 0) {
    return { arrows: [], text: [] };
  }
  const arrows: Arrow[] = [];
  const text: Text[] = [];

  relations.forEach((relationNode, index) => {
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

    const edgePositionData = computeEdgePositions(
      edges[index] as SVGPathElement
    );
    const arrowSkeletion = createArrowSkeletion(
      edgePositionData.startX,
      edgePositionData.startY,
      edgePositionData.endX,
      edgePositionData.endY,
      {
        strokeStyle,
        startArrowhead,
        endArrowhead,
        label: relationNode.title ? { text: relationNode.title } : undefined,
        start: { type: "rectangle", id: node1.id },
        end: { type: "rectangle", id: node2.id },
      }
    );

    const arrow = adjustArrowPosition(direction, arrowSkeletion);
    arrows.push(arrow);

    // Add cardianlities and Multiplicities
    const { relationTitle1, relationTitle2 } = relationNode;
    const offsetX = 20;
    const offsetY = 15;
    const directionOffset = 15;
    let x;
    let y;

    if (relationTitle1 && relationTitle1 !== "none") {
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

      const relationTitleElement = createTextSkeleton(x, y, relationTitle1, {
        fontSize: 16,
      });

      text.push(relationTitleElement);
    }
    if (relationTitle2 && relationTitle2 !== "none") {
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
  notes.forEach((note) => {
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
