import { Diagram } from "mermaid/dist/Diagram.js";
import { SVG_TO_SHAPE_MAPPER } from "../constants.js";
import { ExcalidrawLinearElement } from "@excalidraw/excalidraw/types/element/types.js";
import { nanoid } from "nanoid";
import { entityCodesToText } from "../utils.js";

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
  groupId?: string;
};

type ARROW_KEYS = keyof typeof SEQUENCE_ARROW_TYPES;

export type Arrow = Omit<Line, "type" | "strokeStyle"> & {
  type: "arrow";
  label?: {
    text: string | null;
    fontSize: number;
  };
  strokeStyle: (typeof SEQUENCE_ARROW_TYPES)[ARROW_KEYS];
  points?: number[][];
  sequenceNumber: Container;
};

export type Text = {
  id?: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  groupId?: string;
};

export type Container = {
  id?: string;
  type: "rectangle" | "ellipse";
  label?: {
    text: string | null;
    fontSize: number;
    color?: string;
  };
  x: number;
  y: number;
  width?: number;
  height?: number;
  strokeStyle?: "dashed" | "solid";
  strokeWidth?: number;
  strokeColor?: string;
  bgColor?: string;
  subtype?: "actor" | "activation" | "highlight" | "note" | "sequence";
  groupId?: string;
};

export type Node = Container | Line | Arrow | Text;

type Loop = {
  lines: Line[];
  texts: Text[];
  nodes: Container[];
};

type Group = {
  name: string;
  actorKeys: Array<string>;
  fill: string;
};
export interface Sequence {
  type: "sequence";
  nodes: Array<Node[]>;
  lines: Line[];
  arrows: Arrow[];
  loops: Loop | undefined;
  groups: Group[];
}

type Message = {
  type: ARROW_KEYS & (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
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
const SEQUENCE_ARROW_TYPES = {
  0: "SOLID",
  1: "DOTTED",
  3: "SOLID_CROSS",
  4: "DOTTED_CROSS",
  5: "SOLID_OPEN",
  6: "DOTTED_OPEN",
  24: "SOLID_POINT",
  25: "DOTTED_POINT",
};

const MESSAGE_TYPE = {
  SOLID: 0,
  DOTTED: 1,
  NOTE: 2,
  SOLID_CROSS: 3,
  DOTTED_CROSS: 4,
  SOLID_OPEN: 5,
  DOTTED_OPEN: 6,
  LOOP_START: 10,
  LOOP_END: 11,
  ALT_START: 12,
  ALT_ELSE: 13,
  ALT_END: 14,
  OPT_START: 15,
  OPT_END: 16,
  ACTIVE_START: 17,
  ACTIVE_END: 18,
  PAR_START: 19,
  PAR_AND: 20,
  PAR_END: 21,
  RECT_START: 22,
  RECT_END: 23,
  SOLID_POINT: 24,
  DOTTED_POINT: 25,
  AUTONUMBER: 26,
  CRITICAL_START: 27,
  CRITICAL_OPTION: 28,
  CRITICAL_END: 29,
  BREAK_START: 30,
  BREAK_END: 31,
  PAR_OVER_START: 32,
};

const createContainerElement = (
  node: SVGSVGElement | SVGRectElement,
  type: Container["type"],
  opts: {
    id?: string;
    text?: string;
    subtype?: Container["subtype"];
    groupId?: string;
  } = {}
) => {
  const container = {} as Container;
  container.type = type;
  const { text, subtype, id, groupId } = opts;
  container.id = id;
  if (groupId) {
    container.groupId = groupId;
  }
  if (text) {
    container.label = {
      text: entityCodesToText(text),
      fontSize: 16,
    };
  }
  const boundingBox = node.getBBox();
  container.x = boundingBox.x;
  container.y = boundingBox.y;
  container.width = boundingBox.width;
  container.height = boundingBox.height;
  container.subtype = subtype;

  switch (subtype) {
    case "highlight":
      const bgColor = node.getAttribute("fill");
      if (bgColor) {
        container.bgColor = bgColor;
      }
      break;
    case "note":
      container.strokeStyle = "dashed";
      break;
  }

  return container;
};

const createTextElement = (
  textNode: SVGTextElement,
  text: string,
  opts?: { groupId?: string; id?: string }
) => {
  const node = {} as Text;
  const x = Number(textNode.getAttribute("x"));
  const y = Number(textNode.getAttribute("y"));
  node.type = "text";
  node.text = entityCodesToText(text);
  if (opts?.id) {
    node.id = opts.id;
  }
  if (opts?.groupId) {
    node.groupId = opts.groupId;
  }
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
  endY: number,
  opts?: { groupId?: string; id?: string }
) => {
  const line = {} as Line;
  line.startX = startX;
  line.startY = startY;
  line.endX = endX;
  if (opts?.groupId) {
    line.groupId = opts.groupId;
  }
  if (opts?.id) {
    line.id = opts.id;
  }
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
  arrow.label = { text: entityCodesToText(message.message), fontSize: 16 };
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
          const [x, y] = pos.split(",");
          return [
            parseFloat(x) - startPosition[0],
            parseFloat(y) - startPosition[1],
          ];
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

  const showSequenceNumber =
    !!arrowNode.nextElementSibling?.classList.contains("sequenceNumber");

  if (showSequenceNumber) {
    const text = arrowNode.nextElementSibling?.textContent;
    if (!text) {
      throw new Error("sequence number not present");
    }
    const height = 30;
    const yOffset = height / 2;
    const xOffset = 10;
    const sequenceNumber: Container = {
      type: "rectangle",
      x: arrow.startX - xOffset,
      y: arrow.startY - yOffset,
      label: { text, fontSize: 14 },
      bgColor: "#e9ecef",
      height,
      subtype: "sequence",
    };
    arrow.sequenceNumber = sequenceNumber;
  }

  arrow.strokeColor = arrowNode.getAttribute("stroke");
  arrow.strokeWidth = Number(arrowNode.getAttribute("stroke-width"));
  arrow.type = "arrow";
  arrow.strokeStyle = SEQUENCE_ARROW_TYPES[message.type];
  return arrow;
};

const createActorSymbol = (
  rootNode: SVGGElement,
  text: string,
  opts?: { id?: string }
) => {
  if (!rootNode) {
    throw "root node not found";
  }
  const groupId = nanoid();
  const children = Array.from(rootNode.children) as SVGElement[];
  const nodeElements: Node[] = [];
  children.forEach((child, index) => {
    const id = `${opts?.id}-${index}`;
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
          endY,
          { groupId, id }
        );
        break;
      case "text":
        ele = createTextElement(child as SVGTextElement, text, { groupId, id });
        break;
      case "circle":
        ele = createContainerElement(child as SVGSVGElement, "ellipse", {
          text: child.textContent || undefined,
          groupId,
          id,
        });
      default:
        ele = createContainerElement(
          child as SVGSVGElement,
          SVG_TO_SHAPE_MAPPER[child.tagName],
          { text: child.textContent || undefined, groupId, id }
        );
    }
    nodeElements.push(ele);
  });
  return nodeElements;
};

const parseActor = (actors: { [key: string]: Actor }, containerEl: Element) => {
  const actorRootNodes = Array.from(containerEl.querySelectorAll(".actor"))
    .filter((node) => node.tagName === "text")
    .map((actor) => actor.tagName === "text" && actor.parentElement);

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
        { id: `${actor.name}-top`, text, subtype: "actor" }
      );
      if (!topNodeElement) {
        throw "Top Node element not found!";
      }
      nodes.push([topNodeElement]);

      // creating bottom actor node element
      const bottomNodeElement = createContainerElement(
        bottomRootNode.firstChild as SVGSVGElement,
        "rectangle",
        { id: `${actor.name}-bottom`, text, subtype: "actor" }
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
      const topNodeElement = createActorSymbol(topRootNode, text, {
        id: `${actor.name}-top`,
      });
      nodes.push(topNodeElement);
      const bottomNodeElement = createActorSymbol(bottomRootNode, text, {
        id: `${actor.name}-bottom`,
      });
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
        (node): node is Container => node.type === "ellipse"
      );
      if (bottomEllipseNode) {
        const endY = bottomEllipseNode.y;
        const line = createLineElement(lineNode, startX, startY, endX, endY);
        lines.push(line);
      }
    }
  });

  return { nodes, lines };
};

const computeArrows = (messages: Message[], containerEl: Element) => {
  const arrows: Arrow[] = [];

  const arrowNodes = Array.from<SVGLineElement>(
    containerEl.querySelectorAll('[class*="messageLine"]')
  );
  const supportedMessageTypes = Object.keys(SEQUENCE_ARROW_TYPES);
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

const computeNotes = (messages: Message[], containerEl: Element) => {
  const noteNodes = Array.from(containerEl.querySelectorAll(".note")).map(
    (node) => node.parentElement
  );
  const noteText = messages.filter(
    (message) => message.type === MESSAGE_TYPE.NOTE
  );
  const notes: Container[] = [];
  noteNodes.forEach((node, index) => {
    if (!node) {
      return;
    }
    const rect = node.firstChild as SVGSVGElement;
    const text = noteText[index].message;
    const note = createContainerElement(rect, "rectangle", {
      text,
      subtype: "note",
    });
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
    const rect = createContainerElement(node, "rectangle", {
      text: "",
      subtype: "activation",
    });
    activations.push(rect);
  });

  return activations;
};

const parseLoops = (messages: Message[], containerEl: Element) => {
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

  const loopTextNodes = Array.from(
    containerEl.querySelectorAll(".loopText")
  ) as SVGTextElement[];

  const criticalMessages = messages
    .filter((message) => message.type === MESSAGE_TYPE.CRITICAL_START)
    .map((message) => message.message);

  loopTextNodes.forEach((node) => {
    const text = node.textContent || "";
    const textElement = createTextElement(node, text);
    // The text is rendered between [ ] in DOM hence getting the text excluding the [ ]
    const rawText = text.match(/\[(.*?)\]/)?.[1] || "";
    const isCritical = criticalMessages.includes(rawText);
    // For critical label the coordinates are not accurate in mermaid as there is
    // no padding left hence shifting the text next to critical label by 16px (font size)
    if (isCritical) {
      textElement.x += 16;
    }
    texts.push(textElement);
  });

  const labelBoxes = Array.from(
    containerEl?.querySelectorAll(".labelBox")
  ) as SVGSVGElement[];
  const labelTextNode = Array.from(containerEl?.querySelectorAll(".labelText"));

  labelBoxes.forEach((labelBox, index) => {
    const labelText = labelTextNode[index]?.textContent || "";
    const container = createContainerElement(labelBox, "rectangle", {
      text: labelText,
    });
    container.strokeColor = "#adb5bd";
    container.bgColor = "#e9ecef";
    // So width is calculated based on label
    container.width = undefined;

    nodes.push(container);
  });

  return { lines, texts, nodes };
};

const computeHighlights = (containerEl: Element) => {
  const rects = (
    Array.from(containerEl.querySelectorAll(".rect")) as SVGRectElement[]
  )
    // Only drawing specifically for highlights as the same selector is for grouping as well. For grouping we
    // draw it ourselves
    .filter((node) => node.parentElement?.tagName !== "g");
  const nodes: Container[] = [];

  rects.forEach((rect) => {
    const node = createContainerElement(rect, "rectangle", {
      text: "",
      subtype: "highlight",
    });
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
  const nodes: Array<Node[]> = [];
  const groups = mermaidParser.getBoxes();
  const bgHightlights = computeHighlights(containerEl);
  const actorData = mermaidParser.getActors();
  const { nodes: actors, lines } = parseActor(actorData, containerEl);
  const messages = mermaidParser.getMessages();
  const arrows = computeArrows(messages, containerEl);
  const notes = computeNotes(messages, containerEl);
  const activations = parseActivations(containerEl);
  const loops = parseLoops(messages, containerEl);
  nodes.push(bgHightlights);
  nodes.push(...actors);
  nodes.push(notes);
  nodes.push(activations);

  return { type: "sequence", lines, arrows, nodes, loops, groups };
};
