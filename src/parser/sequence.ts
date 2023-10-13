import { Diagram } from "mermaid/dist/Diagram.js";
import { SVG_TO_SHAPE_MAPPER } from "../constants.js";

export type Line = {
  id?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor: string | null;
  strokeWidth: string | null;
  type: "line" | "arrow";
};

export type Node = {
  id: string;
  type: "rectangle" | "line" | "ellipse" | "text";
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ARROW_KEYS = keyof typeof SUPPORTED_SEQUENCE_ARROW_TYPES;

export type Arrow = Line & {
  text?: string | null;
  strokeStyle: (typeof SUPPORTED_SEQUENCE_ARROW_TYPES)[ARROW_KEYS];
};

export interface Sequence {
  type: "sequence";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
}

type Message = {
  type: ARROW_KEYS;
  to: string;
  from: string;
  message: string;
  wrap: boolean;
};

// Currently mermaid supported these 6 arrow types, the names are taken from mermaidParser.LINETYPE
const SUPPORTED_SEQUENCE_ARROW_TYPES = {
  0: "SOLID",
  1: "DOTTED",
  3: "SOLID_CROSS",
  4: "DOTTED_CROSS",
  5: "SOLID_OPEN",
  6: "DOTTED_OPEN",
  24: "SOLID_POINT",
  25: "DOTTED_POINT",
};

const createNodeElement = (
  actorNode: SVGSVGElement,
  type: Node["type"],
  text?: string
) => {
  const node = {} as Node;
  node.type = type;
  node.text = text;
  const boundingBox = actorNode.getBBox();
  node.x = boundingBox.x;
  node.y = boundingBox.y;
  node.width = boundingBox.width;
  node.height = boundingBox.height;
  return node;
};

const createTextElement = (textNode: SVGTextElement, text: string) => {
  const node = {} as Node;
  const x = Number(textNode.getAttribute("x"));
  const y = Number(textNode.getAttribute("y"));
  node.type = "text";
  node.text = text;
  const boundingBox = textNode.getBBox();
  node.width = boundingBox.width;
  node.height = boundingBox.height;
  node.x = x - boundingBox.width / 2;
  node.y = y;
  const fontSize = parseInt(getComputedStyle(textNode).fontSize);
  node.fontSize = fontSize;
  console.log(fontSize, "font");
  return node;
};
const createLineElement = (
  lineNode: SVGLineElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) => {
  const line = {} as Line;
  line.startX = startX;
  line.startY = startY;
  line.endX = endX;
  // Make sure lines don't overlap with the nodes, in mermaid it overlaps but isn't visible as its pushed back and containers are non transparent
  line.endY = endY;
  line.strokeColor = lineNode.getAttribute("stroke");
  line.strokeWidth = lineNode.getAttribute("stroke-width");
  line.type = "line";
  return line;
};

const createActorSymbol = (rootNode: SVGGElement, text: string) => {
  if (!rootNode) {
    throw "root node not found";
  }
  const children = Array.from(rootNode.children) as SVGSVGElement[];
  const nodeElements: Node[] = [];
  children.forEach((child) => {
    let ele;
    switch (child.tagName) {
      case "line":
        const startX = Number(child.getAttribute("x1"));
        const startY = Number(child.getAttribute("y1"));
        const endX = Number(child.getAttribute("x2"));
        const endY = Number(child.getAttribute("y2"));

        ele = createLineElement(
          child as SVGLineElement,
          startX,
          startY,
          endX,
          endY
        );
        break;
      case "text":
        ele = createTextElement(child, text);
        break;
      default:
        ele = createNodeElement(
          child,
          SVG_TO_SHAPE_MAPPER[child.tagName] as Node["type"],
          child.textContent || undefined
        );
    }
    nodeElements.push(ele);
  });
  return nodeElements;
};

const parseActor = (actors: any, containerEl: Element) => {
  const actorRootNodes = Array.from(containerEl.querySelectorAll(".actor"))
    .filter((node) => node.tagName === "text")
    .map((actor) => actor.tagName === "text" && actor.parentElement)!;

  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const actorsLength = Object.keys(actors).length;
  Object.values(actors).forEach((actor: any, index) => {
    //@ts-ignore
    // For each actor there are two nodes top and bottom which is connected by a line
    const topRootNode = actorRootNodes[index] as SVGGElement;
    //@ts-ignore
    const bottomRootNode = actorRootNodes[actorsLength + index] as SVGGElement;

    if (!topRootNode) {
      throw "root not not found";
    }
    const text = actor.name;
    if (actor.type === "participant") {
      // creating top actor node element
      const topNodeElement = createNodeElement(
        topRootNode.firstChild as SVGSVGElement,
        "rectangle",
        text
      );
      nodes.push([topNodeElement]);

      // creating bottom actor node element
      const bottomNodeElement = createNodeElement(
        bottomRootNode.firstChild as SVGSVGElement,
        "rectangle",
        text
      );
      nodes.push([bottomNodeElement]);

      // Get the line connecting the top and bottom nodes. As per the DOM, the line is rendered as first child of parent element
      const lineNode = topRootNode.previousElementSibling as SVGLineElement;

      if (lineNode?.tagName !== "line") {
        throw "Line not found";
      }
      const startX = Number(lineNode.getAttribute("x1"));
      const startY = topNodeElement.y + topNodeElement.height;
      // Make sure lines don't overlap with the nodes, in mermaid it overlaps but isn't visible as its pushed back and containers are non transparent
      const endY = bottomNodeElement.y;
      const endX = Number(lineNode.getAttribute("x2"));
      const line = createLineElement(lineNode, startX, startY, endX, endY);
      lines.push(line);
    } else if (actor.type === "actor") {
      const topNodeElement = createActorSymbol(topRootNode, text);
      nodes.push(topNodeElement);
      const bottomNodeElement = createActorSymbol(bottomRootNode, text);
      nodes.push(bottomNodeElement);

      // Get the line connecting the top and bottom nodes. As per the DOM, the line is rendered as first child of parent element
      const lineNode = topRootNode.previousElementSibling as SVGLineElement;

      if (lineNode?.tagName !== "line") {
        throw "Line not found";
      }
      const startX = Number(lineNode.getAttribute("x1"));
      const startY = Number(lineNode.getAttribute("y1"));

      const endX = Number(lineNode.getAttribute("x2"));
      // Make sure lines don't overlap with the nodes, in mermaid it overlaps but isn't visible as its pushed back and containers are non transparent
      const bottomEllipseNode = bottomNodeElement.find(
        (node) => node.type === "ellipse"
      )!;
      const endY = bottomEllipseNode.y;
      const line = createLineElement(lineNode, startX, startY, endX, endY);
      lines.push(line);
    }
  });

  return { nodes, lines };
};

const parseMessages = (messages: Message[], containerEl: Element) => {
  const arrows: Arrow[] = [];
  const arrowNodes = Array.from(
    containerEl.querySelectorAll('[class*="messageLine"]')
  ) as SVGLineElement[];

  arrowNodes.forEach((arrowNode, index) => {
    const message = messages[index];
    const arrow = {} as Arrow;
    arrow.text = message.message;
    arrow.startX = Number(arrowNode.getAttribute("x1"));
    arrow.startY = Number(arrowNode.getAttribute("y1"));
    arrow.endX = Number(arrowNode.getAttribute("x2"));
    arrow.endY = Number(arrowNode.getAttribute("y2"));
    arrow.strokeColor = arrowNode.getAttribute("stroke");
    arrow.strokeWidth = arrowNode.getAttribute("stroke-width");
    arrow.type = "arrow";
    arrow.strokeStyle = SUPPORTED_SEQUENCE_ARROW_TYPES[message.type];
    arrows.push(arrow);
  });
  return arrows;
};

export const parseMermaidSequenceDiagram = (
  diagram: Diagram,
  containerEl: Element
): Sequence => {
  diagram.parse();

  // Get mermaid parsed data from parser shared variable `yy`
  const mermaidParser = diagram.parser.yy;

  const actorData = mermaidParser.getActors();
  const { nodes, lines } = parseActor(actorData, containerEl);
  const messages = mermaidParser.getMessages();
  const arrows = parseMessages(messages, containerEl);
  return { type: "sequence", lines, arrows, nodes };
};
