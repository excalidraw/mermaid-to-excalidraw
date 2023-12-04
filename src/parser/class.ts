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
  NamespaceNode,
} from "mermaid/dist/diagrams/class/classTypes.js";
import { computeEdgePositions, getTransformAttr } from "../utils.js";
import { nanoid } from "nanoid";
import {
  createArrowSkeletion,
  createTextSkeleton,
} from "../elementSkeleton.js";
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
  node.id = nanoid();
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
      const line = createLineElement(lineNode, startX, startY, endX, endY, {
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
      const textElement = createTextElement(node, label, { groupId });
      textElement.x += transformX;
      textElement.y += transformY;
      textElement.metadata = { classId: id };
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
    if (relationTitle1 && relationTitle1 !== "none") {
      const x = startX - offsetX;
      const y = startY + offsetY;
      const relationTitleElement = createTextSkeleton(x, y, relationTitle1);

      text.push(relationTitleElement);
    }
    if (relationTitle2 && relationTitle2 !== "none") {
      const x = endX + offsetX;
      const y = endY - offsetY;
      const relationTitleElement = createTextSkeleton(x, y, relationTitle2);

      text.push(relationTitleElement);
    }
  });
  return { arrows, text };
};

export const parseMermaidClassDiagram = (
  diagram: Diagram,
  containerEl: Element
): Class => {
  diagram.parse();
  const mermaidParser = diagram.parser.yy;
  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const text: Array<Text> = [];
  const allClasses: Array<Container> = [];

  const namespaces: NamespaceNode[] = mermaidParser.getNamespaces();

  if (Object.keys(namespaces).length) {
    Object.values(namespaces).forEach((namespace) => {
      const namespaceClassData = parseClasses(namespace.classes, containerEl);
      nodes.push(namespaceClassData.nodes);
      lines.push(...namespaceClassData.lines);
      text.push(...namespaceClassData.text);
      allClasses.push(...namespaceClassData.nodes);
    });
  }

  const classes = mermaidParser.getClasses();
  if (Object.keys(classes).length) {
    const classData = parseClasses(classes, containerEl);
    nodes.push(classData.nodes);
    lines.push(...classData.lines);
    text.push(...classData.text);
    allClasses.push(...classData.nodes);
  }
  const relations = mermaidParser.getRelations();
  const { arrows, text: relationTitles } = parseRelations(
    relations,
    allClasses,
    containerEl
  );

  text.push(...relationTitles);

  return { type: "class", nodes, lines, arrows, text, namespaces };
};
