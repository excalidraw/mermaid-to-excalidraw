import { Diagram } from "mermaid/dist/Diagram.js";
import { Vertex } from "../interfaces.js";

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

type ARROW_KEYS = keyof typeof SUPPORTED_SEQUENCE_ARROW_TYPES;

export type Arrow = Line & {
  text?: string | null;
  strokeStyle: (typeof SUPPORTED_SEQUENCE_ARROW_TYPES)[ARROW_KEYS];
};

export interface Sequence {
  type: "sequence";
  nodes: Vertex[];
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

const parseActor = (actors: Array<any>, containerEl: Element) => {
  const textNodes = Array.from(containerEl.querySelectorAll(".actor")).filter(
    (node: any) => node.tagName === "text"
  ) as SVGSVGElement[];
  const nodes: Vertex[] = [];
  const lines: Array<Line> = [];
  textNodes.forEach((textNode) => {
    const text = textNode.textContent!;
    const vertexNode = textNode.previousElementSibling as SVGSVGElement | null;
    if (!vertexNode) {
      return [];
    }
    const node = {} as Vertex;
    node.text = text;

    // Get dimension
    const boundingBox = vertexNode.getBBox();
    node.x = boundingBox.x;
    node.y = boundingBox.y;
    node.width = boundingBox.width;
    node.height = boundingBox.height;
    nodes.push(node);

    const lineNode = textNode.parentElement?.parentElement
      ?.firstChild as SVGLineElement;
    const line = {} as Line;
    if (lineNode?.tagName === "line") {
      line.id = `${text}-line`;
      line.startX = Number(lineNode.getAttribute("x1"));
      line.startY = node.y + node.height;
      line.endX = Number(lineNode.getAttribute("x2"));
      line.endY = Number(lineNode.getAttribute("y2"));
      line.strokeColor = lineNode.getAttribute("stroke");
      line.strokeWidth = lineNode.getAttribute("stroke-width");
      line.type = "line";
      lines.push(line);
    } else {
      const lineConnectingNodes = lines.find(
        (line) => line.id === `${text}-line`
      );
      // Make sure lines don't overlap with the containers, in mermaid it overlaps but isn't visible as its pushed back and containers are non transparent
      if (lineConnectingNodes) {
        Object.assign(lineConnectingNodes, { endY: node.y });
      }
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
    const textNode = arrowNode.nextElementSibling as SVGTextElement | null;
    const message = messages[index];
    const arrow = {} as Arrow;
    if (textNode) {
      arrow.text = textNode.textContent;
      arrow.startX = Number(arrowNode.getAttribute("x1"));
      arrow.startY = Number(arrowNode.getAttribute("y1"));
      arrow.endX = Number(arrowNode.getAttribute("x2"));
      arrow.endY = Number(arrowNode.getAttribute("y2"));
      arrow.strokeColor = arrowNode.getAttribute("stroke");
      arrow.strokeWidth = arrowNode.getAttribute("stroke-width");
      arrow.type = "arrow";
      arrow.strokeStyle = SUPPORTED_SEQUENCE_ARROW_TYPES[message.type];
      arrows.push(arrow);
    }
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
  console.log("parsing", mermaidParser.LINETYPE, messages);
  return { type: "sequence", lines, arrows, nodes };
};
