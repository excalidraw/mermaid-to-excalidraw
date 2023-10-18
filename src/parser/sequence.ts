import { Diagram } from "mermaid/dist/Diagram.js";
import { SVG_TO_SHAPE_MAPPER } from "../constants.js";
import { ExcalidrawLinearElement } from "@excalidraw/excalidraw/types/element/types.js";

export type Line = {
  id?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor: string | null;
  strokeWidth: number | null;
  strokeStyle: ExcalidrawLinearElement["strokeStyle"] | null;
  type: "line";
};

type ARROW_KEYS = keyof typeof SUPPORTED_SEQUENCE_ARROW_TYPES;

export type Arrow = Omit<Line, "type" | "strokeStyle"> & {
  type: "arrow";
  label?: {
    text: string | null;
    fontSize: number;
  };
  strokeStyle: (typeof SUPPORTED_SEQUENCE_ARROW_TYPES)[ARROW_KEYS];
  points?: number[][];
};

export type Text = {
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
};

export type Container = {
  id: string;
  type: "rectangle" | "ellipse";
  label?: {
    text: string | null;
    fontSize: number;
  };
  x: number;
  y: number;
  width?: number;
  height?: number;
  strokeStyle?: "dashed" | "solid";
  strokeWidth?: number;
  strokeColor?: string;
  bgColor?: string;
  subtype?: "activation" | "highlight" | "note";
};
export type Node = Container | Line | Arrow | Text;

type Loop = {
  lines: Line[];
  texts: Text[];
  nodes: Container[];
};
export interface Sequence {
  type: "sequence";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  loops: Loop | undefined;
}

type Message = {
  type: ARROW_KEYS;
  to: string;
  from: string;
  message: string;
  wrap: boolean;
};

type Actor = {
  name: string;
  description: string;
  type: "actor" | "participant";
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

const createContainerElement = (
  actorNode: SVGSVGElement | SVGRectElement,
  type: Container["type"],
  text?: string,
  subtype?: Container["subtype"]
) => {
  const node = {} as Container;
  node.type = type;
  if (text) {
    node.label = {
      text,
      fontSize: 16,
    };
  }
  const boundingBox = actorNode.getBBox();
  node.x = boundingBox.x;
  node.y = boundingBox.y;
  node.width = boundingBox.width;
  node.height = boundingBox.height;
  node.subtype = subtype;

  switch (subtype) {
    case "highlight":
      const bgColor = actorNode.getAttribute("fill");
      if (bgColor) {
        node.bgColor = bgColor;
      }
      break;
    case "note":
      node.strokeStyle = "dashed";
      break;
  }

  return node;
};

const createTextElement = (textNode: SVGTextElement, text: string) => {
  const node = {} as Text;
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
  line.strokeWidth = Number(lineNode.getAttribute("stroke-width"));
  line.type = "line";
  return line;
};

const createArrowElement = (
  arrowNode: SVGLineElement | SVGPathElement,
  message: Message
) => {
  const arrow = {} as Arrow;
  arrow.label = { text: message.message, fontSize: 16 };
  const tagName = arrowNode.tagName;

  if (tagName === "line") {
    arrow.startX = Number(arrowNode.getAttribute("x1"));
    arrow.startY = Number(arrowNode.getAttribute("y1"));
    arrow.endX = Number(arrowNode.getAttribute("x2"));
    arrow.endY = Number(arrowNode.getAttribute("y2"));
  } else if (tagName === "path") {
    const dAttr = arrowNode.getAttribute("d");
    if (!dAttr) {
      throw new Error('Path element does not contain a "d" attribute');
    }
    // Split the d attribute based on M (Move To)  and C (Curve) commands
    const commands = dAttr.split(/(?=[LC])/);

    const startPosition = commands[0]
      .substring(1)
      .split(",")
      .map((coord) => parseFloat(coord));
    const points: Arrow["points"] = [];
    commands.forEach((command) => {
      const currPoints = command
        .substring(1)
        .trim()
        .split(" ")
        .map((pos) => {
          return pos
            .split(",")
            .map((coord, index) => parseFloat(coord) - startPosition[index]);
        });
      points.push(...currPoints);
    });

    const endPosition = points[points.length - 1];

    arrow.startX = startPosition[0];
    arrow.startY = startPosition[1];
    arrow.endX = endPosition[0];
    arrow.endY = endPosition[1];
    arrow.points = points;
  }
  if (message) {
    // In mermaid the text is positioned above arrow but in Excalidraw
    // its postioned on the arrow hence the elements below it might look cluttered so shifting the arrow by an offset of 10px
    const offset = 10;
    arrow.startY = arrow.startY - offset;
    arrow.endY = arrow.endY - offset;
  }

  arrow.strokeColor = arrowNode.getAttribute("stroke");
  arrow.strokeWidth = Number(arrowNode.getAttribute("stroke-width"));
  arrow.type = "arrow";
  arrow.strokeStyle = SUPPORTED_SEQUENCE_ARROW_TYPES[message.type];
  return arrow;
};

const createActorSymbol = (rootNode: SVGGElement, text: string) => {
  if (!rootNode) {
    throw "root node not found";
  }
  const children = Array.from(rootNode.children) as SVGElement[];
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
        ele = createTextElement(child as SVGTextElement, text);
        break;
      default:
        ele = createContainerElement(
          child as SVGSVGElement,
          SVG_TO_SHAPE_MAPPER[child.tagName],
          child.textContent || undefined
        );
    }
    nodeElements.push(ele);
  });
  return nodeElements;
};

const parseActor = (actors: { [key: string]: Actor }, containerEl: Element) => {
  const actorRootNodes = Array.from(containerEl.querySelectorAll(".actor"))
    .filter((node) => node.tagName === "text")
    .map((actor) => actor.tagName === "text" && actor.parentElement)!;

  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const actorsLength = Object.keys(actors).length;
  Object.values(actors).forEach((actor, index) => {
    //@ts-ignore
    // For each actor there are two nodes top and bottom which is connected by a line
    const topRootNode = actorRootNodes[index] as SVGGElement;
    //@ts-ignore
    const bottomRootNode = actorRootNodes[actorsLength + index] as SVGGElement;

    if (!topRootNode) {
      throw "root not found";
    }
    const text = actor.description;
    if (actor.type === "participant") {
      // creating top actor node element
      const topNodeElement = createContainerElement(
        topRootNode.firstChild as SVGSVGElement,
        "rectangle",
        text
      );
      if (!topNodeElement) {
        throw "Top Node element not found!";
      }
      nodes.push([topNodeElement]);

      // creating bottom actor node element
      const bottomNodeElement = createContainerElement(
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
      if (!topNodeElement.height) {
        throw "Top node element height is null";
      }
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
  const supportedMessageTypes = Object.keys(SUPPORTED_SEQUENCE_ARROW_TYPES);
  const arrowMessages = messages.filter((message) =>
    supportedMessageTypes.includes(message.type.toString())
  );

  arrowNodes.forEach((arrowNode, index) => {
    const message = arrowMessages[index];
    const arrow = createArrowElement(arrowNode, message);

    arrows.push(arrow);
  });
  return arrows;
};

const parseNotes = (containerEl: Element) => {
  const noteNodes = Array.from(containerEl.querySelectorAll(".note")).map(
    (node) => node.parentElement
  );
  const notes: Container[] = [];
  noteNodes.forEach((node) => {
    if (!node) {
      return;
    }
    const rect = node.firstChild as SVGSVGElement;
    const text = node.lastChild?.textContent!;
    const note = createContainerElement(rect, "rectangle", text, "note");
    notes.push(note);
  });
  return notes;
};

const parseActivations = (containerEl: Element) => {
  const activationNodes = Array.from(
    containerEl.querySelectorAll(`[class*=activation]`)
  ) as SVGSVGElement[];
  const activations: Container[] = [];
  activationNodes.forEach((node) => {
    const rect = createContainerElement(node, "rectangle", "", "activation");
    activations.push(rect);
  });

  return activations;
};

const parseLoops = (containerEl: Element) => {
  const lineNodes = Array.from(
    containerEl.querySelectorAll(".loopLine")
  ) as SVGLineElement[];
  const lines: Line[] = [];
  const texts: Text[] = [];
  const nodes: Container[] = [];
  lineNodes.forEach((node) => {
    const startX = Number(node.getAttribute("x1"));
    const startY = Number(node.getAttribute("y1"));
    const endX = Number(node.getAttribute("x2"));
    const endY = Number(node.getAttribute("y2"));
    const line = createLineElement(node, startX, startY, endX, endY);
    line.strokeStyle = "dotted";
    line.strokeColor = "#adb5bd";
    line.strokeWidth = 2;
    lines.push(line);
  });

  const loopText = Array.from(
    containerEl.querySelectorAll(".loopText")
  ) as SVGTextElement[];

  loopText.forEach((node) => {
    const text = node.textContent || "";
    const textElement = createTextElement(node, text);

    texts.push(textElement);
  });
  if (!loopText.length) {
    return;
  }
  const parentElement = loopText[0].parentElement;
  const labelBox = parentElement?.querySelector(".labelBox")! as SVGSVGElement;
  const labelTextNode = parentElement?.querySelector(".labelText");
  const labelText = labelTextNode?.textContent || "";
  const container = createContainerElement(labelBox, "rectangle", labelText);
  container.strokeColor = "#adb5bd";
  container.bgColor = "#e9ecef";
  // So width is calculated based on label
  container.width = undefined;

  nodes.push(container);
  return { lines, texts, nodes };
};

const computeHighlights = (containerEl: Element) => {
  const rects = Array.from(
    containerEl.querySelectorAll(".rect")
  ) as SVGRectElement[];
  const nodes: Container[] = [];

  rects.forEach((rect) => {
    const node = createContainerElement(rect, "rectangle", "", "highlight");
    nodes.push(node);
  });
  return nodes;
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
  const notes = parseNotes(containerEl);
  const activations = parseActivations(containerEl);
  const loops = parseLoops(containerEl);
  const bgHightlights = computeHighlights(containerEl);
  nodes.push(bgHightlights);
  nodes.push(notes);
  nodes.push(activations);

  return { type: "sequence", lines, arrows, nodes, loops };
};
