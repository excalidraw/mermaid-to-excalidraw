import { Diagram } from "mermaid/dist/Diagram.js";
import {
  Arrow,
  Line,
  Node,
  Text,
  createArrowElement,
  createContainerElement,
  createLineElement,
} from "./sequence.js";
import {
  ClassNode,
  ClassRelation,
} from "mermaid/dist/diagrams/class/classTypes.js";
import { getTransformAttr } from "../utils.js";
import { nanoid } from "nanoid";
import { createArrow } from "../converter/types/sequence.js";
import { createArrowSkeleton } from "../elementSkeleton.js";

// Taken from mermaidParser.relationType
const RELATION_TYPE = {
  AGGREGATION: 0,
  EXTENSION: 1,
  COMPOSITION: 2,
  DEPENDENCY: 3,
  LOLLIPOP: 4,
};

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

const getLineType = (type: number) => {
  Object.keys(LINE_TYPE).find((key) => LINE_TYPE[key] === type);
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
  const nodes: Node[] = [];
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

const parseRelations = (relations: ClassRelation[], containerEl: Element) => {
  const edges = containerEl.querySelector(".edgePaths")?.children;
  const arrows: Arrow[] = [];
  relations.forEach((relationNode, index) => {
    const { id1, id2, relation } = relationNode;
    const strokeStyle = getLineType(relation.lineType);
    const arrow = createArrowSkeleton(edges[index], {
      strokeStyle,
      startArrowhead: "arrow",
    });
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
  const arrows = parseRelations(relations, containerEl);
  return { type: "class", nodes, lines, arrows, text };
};
