import { Diagram } from "mermaid/dist/Diagram.js";
import {
  Arrow,
  Container,
  Line,
  Node,
  Text,
  createContainerElement,
  createLineElement,
} from "./sequence.js";
import {
  ClassNode,
  ClassRelation,
} from "mermaid/dist/diagrams/class/classTypes.js";
import { getTransformAttr } from "../utils.js";
import { nanoid } from "nanoid";
import { createArrowSkeleton } from "../elementSkeleton.js";
import { ExcalidrawLinearElement } from "@excalidraw/excalidraw/types/element/types.js";

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
    case RELATION_TYPE.DEPENDENCY:
      arrowhead = "arrow";
      break;
    case RELATION_TYPE.EXTENSION:
    case RELATION_TYPE.COMPOSITION:
      arrowhead = "triangle";
      break;
    case "none":
      arrowhead = null;
      break;
    default:
      arrowhead = "arrow";
      break;
  }
  return arrowhead;
};

const createTextElement = (
  textNode: SVGForeignObjectElement,
  text: string,
  opts: { groupId?: string }
) => {
  const node = {} as Text;
  const { transformX, transformY } = getTransformAttr(textNode);
  node.type = "text";
  node.text = text;
  const boundingBox = textNode.getBBox();
  node.width = boundingBox.width;
  node.height = boundingBox.height;
  const offsetY = 10;
  node.x = transformX;
  node.y = transformY + offsetY;
  if (opts.groupId) {
    node.groupId = opts.groupId;
  }
  return node;
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

    const container = createContainerElement(
      domNode.firstChild as SVGRectElement,
      "rectangle",
      { id, groupId }
    );
    container.x += transformX;
    container.y += transformY;
    nodes.push(container);

    const lineNodes = Array.from(
      domNode.querySelectorAll(".divider")
    ) as SVGLineElement[];

    lineNodes.forEach((lineNode) => {
      const startX = Number(lineNode.getAttribute("x1"));
      const startY = Number(lineNode.getAttribute("y1"));
      const endX = Number(lineNode.getAttribute("x2"));
      const endY = Number(lineNode.getAttribute("y2"));
      const line = createLineElement(lineNode, startX, startY, endX, endY, {
        groupId,
      });
      line.startX += transformX;
      line.startY += transformY;
      line.endX += transformX;
      line.endY += transformY;
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
      const textElement = createTextElement(node, label, { groupId });
      textElement.x += transformX;
      textElement.y += transformY;
      text.push(textElement);
    });
  });

  return { nodes, lines, text };
};

const parseRelations = (
  relations: ClassRelation[],
  classNodes: Container[],
  containerEl: Element
) => {
  const edges = containerEl.querySelector(".edgePaths")?.children;
  if (!edges) {
    throw new Error("No Edges found!");
  }
  const arrows: Arrow[] = [];
  relations.forEach((relationNode, index) => {
    const { id1, id2, relation } = relationNode;
    const node1 = classNodes.find((node) => node.id === id1)!;
    const node2 = classNodes.find((node) => node.id === id2)!;
    const startX = node1.x + (node1?.width || 0) / 2;
    const startY = node1.y + (node1?.height || 0);
    const endX = startX;
    const endY = node2.y;
    const strokeStyle = getStrokeStyle(relation.lineType);
    const startArrowhead = getArrowhead(relation.type1);
    const endArrowhead = getArrowhead(relation.type2);
    const arrow = createArrowSkeleton(edges[index] as SVGPathElement, {
      strokeStyle,
      startArrowhead,
      endArrowhead,
      label: relationNode.title,
    });
    // Since the arrows are from one container to another hence updating it here since from path attribute we aren't able to compute it
    Object.assign(arrow, { startX, startY, endX, endY, points: undefined });
    arrows.push(arrow);
  });
  return arrows;
};

export const parseMermaidClassDiagram = (
  diagram: Diagram,
  containerEl: Element
) => {
  diagram.parse();
  const mermaidParser = diagram.parser.yy;
  const nodes: Array<Node[]> = [];
  const classes = mermaidParser.getClasses();
  const { nodes: classNodes, lines, text } = parseClasses(classes, containerEl);
  nodes.push(classNodes);

  const relations = mermaidParser.getRelations();
  const arrows = parseRelations(relations, classNodes, containerEl);
  return { type: "class", nodes, lines, arrows, text };
};
