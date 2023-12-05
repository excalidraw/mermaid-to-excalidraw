import { nanoid } from "nanoid";

import { computeEdgePositions, getTransformAttr } from "../utils.js";
import {
  Arrow,
  Container,
  Line,
  Node,
  Text,
  createArrowSkeletion,
  createContainerSkeleton,
  createLineSkeleton,
  createTextSkeleton,
} from "../elementSkeleton.js";

import type { Diagram } from "mermaid/dist/Diagram.js";
import type {
  ClassNode,
  ClassNote,
  ClassRelation,
  NamespaceNode,
} from "mermaid/dist/diagrams/class/classTypes.js";
import type { ExcalidrawLinearElement } from "@excalidraw/excalidraw/types/element/types.js";

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
      arrowhead = "uml_diamond";
      break;

    case RELATION_TYPE.COMPOSITION:
      arrowhead = "uml_diamond_filled";
      break;
    case RELATION_TYPE.EXTENSION:
      arrowhead = "uml_triangle";
      break;
    case "none":
      arrowhead = null;
      break;

    case RELATION_TYPE.DEPENDENCY:
    default:
      arrowhead = "uml_arrow";
      break;
  }
  return arrowhead;
};

const parseClasses = (
  classes: { [key: string]: ClassNode },
  containerEl: Element
) => {
  const nodes: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];

  Object.values(classes).forEach((classNode) => {
    const { domId, id } = classNode;
    const groupId = nanoid();
    const domNode = containerEl.querySelector(`[id*=classId-${id}]`);
    if (!domNode) {
      throw Error(`DOM Node with id ${domId} not found`);
    }
    const { transformX, transformY } = getTransformAttr(domNode);

    const container = createContainerSkeleton(
      domNode.firstChild as SVGRectElement,
      "rectangle",
      { id, groupId }
    );
    container.x += transformX;
    container.y += transformY;
    container.metadata = { classId: id };
    nodes.push(container);

    const lineNodes = Array.from(
      domNode.querySelectorAll(".divider")
    ) as SVGLineElement[];

    lineNodes.forEach((lineNode) => {
      const startX = Number(lineNode.getAttribute("x1"));
      const startY = Number(lineNode.getAttribute("y1"));
      const endX = Number(lineNode.getAttribute("x2"));
      const endY = Number(lineNode.getAttribute("y2"));
      const line = createLineSkeleton(lineNode, startX, startY, endX, endY, {
        groupId,
        id: nanoid(),
      });
      line.startX += transformX;
      line.startY += transformY;
      line.endX += transformX;
      line.endY += transformY;
      line.metadata = { classId: id };
      lines.push(line);
    });

    const labelNodes = domNode.querySelector(".label")?.children;

    if (!labelNodes) {
      throw "label nodes not found";
    }

    Array.from(labelNodes).forEach((node) => {
      const label = node.textContent;
      if (!label) {
        return;
      }

      const id = nanoid();
      const { transformX: textTransformX, transformY: textTransformY } =
        getTransformAttr(node);
      const boundingBox = (node as SVGForeignObjectElement).getBBox();
      const offsetY = 10;

      const textElement = createTextSkeleton(
        transformX + textTransformX,
        transformY + textTransformY + offsetY,
        label,
        {
          width: boundingBox.width,
          height: boundingBox.height,
          id,
          groupId,
          metadata: { classId: id },
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
  const edges = containerEl.querySelector(".edgePaths")?.children;

  if (!edges) {
    throw new Error("No Edges found!");
  }
  const arrows: Arrow[] = [];
  const text: Text[] = [];

  relations.forEach((relationNode, index) => {
    const { id1, id2, relation } = relationNode;
    const node1 = classNodes.find((node) => node.id === id1)!;
    const node2 = classNodes.find((node) => node.id === id2)!;

    const strokeStyle = getStrokeStyle(relation.lineType);
    const startArrowhead = getArrowhead(relation.type1);
    const endArrowhead = getArrowhead(relation.type2);

    const edgePositionData = computeEdgePositions(
      edges[index] as SVGPathElement
    );
    const { startX, startY, endX, endY } = edgePositionData;

    const arrow = createArrowSkeletion(startX, startY, endX, endY, {
      strokeStyle,
      startArrowhead,
      endArrowhead,
      label: relationNode.title ? { text: relationNode.title } : undefined,
      start: { type: "rectangle", id: node1.id },
      end: { type: "rectangle", id: node2.id },
    });

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
          x = startX - offsetX;
          if (endX < startX) {
            x -= directionOffset;
          }
          y = startY + offsetY;
          break;
        case "BT":
          x = startX + offsetX;
          if (endX > startX) {
            x += directionOffset;
          }
          y = startY - offsetY;
          break;
        case "LR":
          x = startX + offsetX;
          y = startY + offsetY;
          if (endY > startY) {
            y += directionOffset;
          }
          break;
        case "RL":
          x = startX - offsetX;
          y = startY - offsetY;
          if (startY > endY) {
            y -= directionOffset;
          }
          break;
        default:
          x = startX - offsetX;
          y = startY + offsetY;
      }

      const relationTitleElement = createTextSkeleton(x, y, relationTitle1, {
        fontSize: 16,
      });

      text.push(relationTitleElement);
    }
    if (relationTitle2 && relationTitle2 !== "none") {
      switch (direction) {
        case "TB":
          x = endX + offsetX;
          if (endX < startX) {
            x += directionOffset;
          }
          y = endY - offsetY;
          break;
        case "BT":
          x = endX - offsetX;
          if (endX > startX) {
            x -= directionOffset;
          }
          y = endY + offsetY;
          break;
        case "LR":
          x = endX - offsetX;
          y = endY - offsetY;
          if (endY > startY) {
            y -= directionOffset;
          }
          break;
        case "RL":
          x = endX + offsetX;
          y = endY + offsetY;
          if (startY > endY) {
            y += directionOffset;
          }
          break;
        default:
          x = endX + offsetX;
          y = endY - offsetY;
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
    const container = createContainerSkeleton(rect, "rectangle", {
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
  diagram.parse();
  const mermaidParser = diagram.parser.yy;
  const direction = mermaidParser.getDirection();

  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const text: Array<Text> = [];
  const classNodes: Array<Container> = [];

  const namespaces: NamespaceNode[] = mermaidParser.getNamespaces();

  if (Object.keys(namespaces).length) {
    Object.values(namespaces).forEach((namespace) => {
      const namespaceClassData = parseClasses(namespace.classes, containerEl);
      nodes.push(namespaceClassData.nodes);
      lines.push(...namespaceClassData.lines);
      text.push(...namespaceClassData.text);
      classNodes.push(...namespaceClassData.nodes);
    });
  }

  const classes = mermaidParser.getClasses();
  if (Object.keys(classes).length) {
    const classData = parseClasses(classes, containerEl);
    nodes.push(classData.nodes);
    lines.push(...classData.lines);
    text.push(...classData.text);
    classNodes.push(...classData.nodes);
  }
  const relations = mermaidParser.getRelations();
  const { arrows, text: relationTitles } = parseRelations(
    relations,
    classNodes,
    containerEl,
    direction
  );

  const { notes, connectors } = parseNotes(
    mermaidParser.getNotes(),
    containerEl,
    classNodes
  );
  nodes.push(notes);
  arrows.push(...connectors);
  text.push(...relationTitles);

  return { type: "class", nodes, lines, arrows, text, namespaces };
};
