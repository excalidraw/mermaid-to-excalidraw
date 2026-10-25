import { SVG_TO_SHAPE_MAPPER } from "../constants.js";
import { nanoid } from "nanoid";
import {
  Arrow,
  Container,
  Line,
  Node,
  SupportedArrowhead,
  Text,
  createArrowSkeletonFromSVG,
  createContainerSkeletonFromSVG,
  createLineSkeletonFromSVG,
  createTextSkeletonFromSVG,
} from "../elementSkeleton.js";
import { cleanCSSValue } from "./cssUtils.js";

import type { Diagram } from "mermaid/dist/Diagram.js";
import type { StrokeStyle } from "@excalidraw/excalidraw/element/types";
import { decodeMermaidText, getTextContentWithLineBreaks } from "../text.js";

type ARROW_KEYS = keyof typeof SEQUENCE_ARROW_TYPES;

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

type MermaidSequenceParser = {
  getBoxes: () => Group[];
  getActors: () => { [key: string]: Actor } | Map<string, Actor>;
  getMessages: () => Message[];
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

type ParsedActor = {
  topId?: string;
  bottomId?: string;
  bindType?: "rectangle" | "ellipse";
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

const getStrokeStyle = (type: number) => {
  let strokeStyle: StrokeStyle;
  switch (type) {
    case MESSAGE_TYPE.SOLID:
    case MESSAGE_TYPE.SOLID_CROSS:
    case MESSAGE_TYPE.SOLID_OPEN:
    case MESSAGE_TYPE.SOLID_POINT:
      strokeStyle = "solid";
      break;
    case MESSAGE_TYPE.DOTTED:
    case MESSAGE_TYPE.DOTTED_CROSS:
    case MESSAGE_TYPE.DOTTED_OPEN:
    case MESSAGE_TYPE.DOTTED_POINT:
      strokeStyle = "dotted";
      break;
    default:
      strokeStyle = "solid";
      break;
  }
  return strokeStyle;
};

const getSequenceEndArrowhead = (
  messageType: (typeof SEQUENCE_ARROW_TYPES)[ARROW_KEYS]
): SupportedArrowhead => {
  switch (messageType) {
    case "SOLID_OPEN":
    case "DOTTED_OPEN":
      return null;
    case "SOLID_CROSS":
    case "DOTTED_CROSS":
      return "bar";
    case "SOLID_POINT":
    case "DOTTED_POINT":
      return "circle";
    default: // SOLID, DOTTED
      return "triangle";
  }
};

const attachSequenceNumberToArrow = (
  node: SVGLineElement | SVGPathElement,
  arrow: Arrow
) => {
  const showSequenceNumber =
    !!node.nextElementSibling?.classList.contains("sequenceNumber");

  if (showSequenceNumber) {
    const text = node.nextElementSibling?.textContent;
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
    Object.assign(arrow, { sequenceNumber });
  }
};

const createActorSymbol = (
  rootNode: SVGElement,
  text: string,
  opts?: { id?: string }
) => {
  if (!rootNode) {
    throw "root node not found";
  }
  const groupId = nanoid();
  const children = Array.from(rootNode.children);
  const firstTextChild = children.find((child) => child.tagName === "text");
  const nodeElements: Node[] = [];
  children.forEach((child, index) => {
    if (child.tagName === "text" && child !== firstTextChild) {
      return;
    }

    const id = `${opts?.id}-${index}`;
    let ele: Node;
    switch (child.tagName) {
      case "line":
        const startX = Number(child.getAttribute("x1"));
        const startY = Number(child.getAttribute("y1"));
        const endX = Number(child.getAttribute("x2"));
        const endY = Number(child.getAttribute("y2"));

        ele = createLineSkeletonFromSVG(
          child as SVGLineElement,
          startX,
          startY,
          endX,
          endY,
          { groupId, id }
        );
        break;
      case "text":
        const textElement = createTextSkeletonFromSVG(
          child as SVGTextElement,
          text,
          {
            groupId,
            id,
          }
        );
        if (text.includes("\n")) {
          const centerX = textElement.x + (textElement.width || 0) / 2;
          const lines = text.split("\n");
          textElement.width = Math.max(
            textElement.width || 0,
            ...lines.map((line) => line.length * textElement.fontSize * 0.6)
          );
          textElement.height = Math.max(
            textElement.height || 0,
            lines.length * textElement.fontSize * 1.25
          );
          textElement.x = centerX - textElement.width / 2;
        }
        ele = textElement;
        break;
      case "circle":
        ele = createContainerSkeletonFromSVG(
          child as SVGSVGElement,
          "ellipse",
          {
            label: child.textContent ? { text: child.textContent } : undefined,
            groupId,
            id,
          }
        );
      default:
        ele = createContainerSkeletonFromSVG(
          child as SVGSVGElement,
          SVG_TO_SHAPE_MAPPER[child.tagName],

          {
            label: child.textContent ? { text: child.textContent } : undefined,
            groupId,
            id,
          }
        );
    }
    nodeElements.push(ele);
  });
  return nodeElements;
};

const applyRectStyles = (container: Container, rect: Element) => {
  const fill = rect.getAttribute("fill");
  const stroke = rect.getAttribute("stroke");
  const strokeWidth = rect.getAttribute("stroke-width");
  const dashArray = rect.getAttribute("stroke-dasharray");
  if (fill && fill !== "none") {
    container.bgColor = cleanCSSValue(fill);
  }
  if (stroke && stroke !== "none") {
    container.strokeColor = cleanCSSValue(stroke);
  }
  if (strokeWidth) {
    container.strokeWidth = Number(strokeWidth);
  }
  if (dashArray && dashArray.trim()) {
    container.strokeStyle = "dashed";
  }
};

const parseActor = (
  actors: { [key: string]: Actor } | Map<string, Actor>,
  containerEl: Element
): {
  nodes: Array<Node[]>;
  lines: Array<Line>;
  actorMap: Record<string, ParsedActor>;
} => {
  const actorTopNodes = Array.from(
    containerEl.querySelectorAll<SVGElement>(".actor-top")
  );
  const actorBottomNodes = Array.from(
    containerEl.querySelectorAll<SVGElement>(".actor-bottom")
  );

  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const actorMap: Record<string, ParsedActor> = {};
  const actorList =
    actors instanceof Map ? Array.from(actors.values()) : Object.values(actors);
  const actorLineNodes = Array.from(
    containerEl.querySelectorAll<SVGLineElement>(".actor-line")
  );

  const resolveActorLineNode = (
    actor: Actor,
    topRootNode: SVGElement
  ): SVGLineElement | null => {
    const actorName = actor.name;
    const actorLineNode = actorLineNodes.find(
      (lineNode) => lineNode.getAttribute("name") === actorName
    );
    if (actorLineNode) {
      return actorLineNode;
    }

    // Fallback to DOM traversal in case Mermaid changes actor line markup/class.
    const candidateNode =
      actor.type === "participant"
        ? topRootNode.parentElement?.previousElementSibling
        : topRootNode.previousElementSibling;

    if (!candidateNode) {
      return null;
    }
    if (candidateNode.tagName === "line") {
      return candidateNode as SVGLineElement;
    }
    return candidateNode.querySelector<SVGLineElement>("line");
  };

  actorList.forEach((actor) => {
    const topRootNode = actorTopNodes.find(
      (actorNode) => actorNode.getAttribute("name") === actor.name
    ) as SVGElement;
    const bottomRootNode = actorBottomNodes.find(
      (actorNode) => actorNode.getAttribute("name") === actor.name
    ) as SVGElement;

    if (!topRootNode || !bottomRootNode) {
      throw "root not found";
    }
    const text = decodeMermaidText(actor.description);
    if (actor.type === "participant") {
      // creating top actor node element
      const topNodeElement = createContainerSkeletonFromSVG(
        topRootNode as SVGRectElement,
        "rectangle",
        { id: `${actor.name}-top`, label: { text }, subtype: "actor" }
      );
      applyRectStyles(topNodeElement, topRootNode);
      if (!topNodeElement) {
        throw "Top Node element not found!";
      }
      nodes.push([topNodeElement]);

      // creating bottom actor node element
      const bottomNodeElement = createContainerSkeletonFromSVG(
        bottomRootNode as SVGRectElement,
        "rectangle",
        { id: `${actor.name}-bottom`, label: { text }, subtype: "actor" }
      );
      actorMap[actor.name] = {
        topId: `${actor.name}-top`,
        bottomId: `${actor.name}-bottom`,
        bindType: "rectangle",
      };
      applyRectStyles(bottomNodeElement, bottomRootNode);
      nodes.push([bottomNodeElement]);

      const lineNode = resolveActorLineNode(actor, topRootNode);

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
      const line = createLineSkeletonFromSVG(
        lineNode,
        startX,
        startY,
        endX,
        endY
      );
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
      const lineNode = resolveActorLineNode(actor, topRootNode);

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
        const line = createLineSkeletonFromSVG(
          lineNode,
          startX,
          startY,
          endX,
          endY
        );
        lines.push(line);
      }

      const topEllipseNode = topNodeElement.find(
        (node): node is Container => node.type === "ellipse"
      );
      const bottomEllipseActorNode = bottomNodeElement.find(
        (node): node is Container => node.type === "ellipse"
      );
      if (topEllipseNode?.id && bottomEllipseActorNode?.id) {
        actorMap[actor.name] = {
          topId: topEllipseNode.id,
          bottomId: bottomEllipseActorNode.id,
          bindType: "ellipse",
        };
      }
    }
  });

  return { nodes, lines, actorMap };
};

const computeArrows = (
  messages: Message[],
  containerEl: Element,
  actorMap: Record<string, ParsedActor>
) => {
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
    const messageType = SEQUENCE_ARROW_TYPES[message.type];
    const arrow = createArrowSkeletonFromSVG(arrowNode, {
      label: message?.message,
      strokeStyle: getStrokeStyle(message.type),
      endArrowhead: getSequenceEndArrowhead(messageType),
    });
    // Attach to actors if available
    const from = actorMap[message.from];
    const to = actorMap[message.to];
    if (from?.topId && to?.topId) {
      arrow.start = { type: from.bindType || "rectangle", id: from.topId };
      arrow.end = { type: to.bindType || "rectangle", id: to.topId };
    }
    attachSequenceNumberToArrow(arrowNode, arrow);
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
    const note = createContainerSkeletonFromSVG(rect, "rectangle", {
      label: { text },
      subtype: "note",
    });
    const fill = rect.getAttribute("fill");
    const stroke = rect.getAttribute("stroke");
    const strokeWidth = rect.getAttribute("stroke-width");
    const dashArray = rect.getAttribute("stroke-dasharray");
    if (fill && fill !== "none") {
      note.bgColor = cleanCSSValue(fill);
    }
    if (stroke && stroke !== "none") {
      note.strokeColor = cleanCSSValue(stroke);
    }
    if (strokeWidth) {
      note.strokeWidth = Number(strokeWidth);
    }
    if (dashArray && dashArray.trim()) {
      note.strokeStyle = "dashed";
    }
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
    const rect = createContainerSkeletonFromSVG(node, "rectangle", {
      label: { text: "" },
      subtype: "activation",
    });
    const applyRectStyles = () => {
      const fill = node.getAttribute("fill");
      const stroke = node.getAttribute("stroke");
      const strokeWidth = node.getAttribute("stroke-width");
      const dashArray = node.getAttribute("stroke-dasharray");
      if (fill && fill !== "none") {
        rect.bgColor = cleanCSSValue(fill);
      }
      if (stroke && stroke !== "none") {
        rect.strokeColor = cleanCSSValue(stroke);
      }
      if (strokeWidth) {
        rect.strokeWidth = Number(strokeWidth);
      }
      if (dashArray && dashArray.trim()) {
        rect.strokeStyle = "dashed";
      }
    };
    applyRectStyles();
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
    const line = createLineSkeletonFromSVG(node, startX, startY, endX, endY);
    line.strokeStyle = "dotted";
    line.strokeColor = "#adb5bd";
    line.strokeWidth = 2;
    lines.push(line);
  });

  const loopTextNodes = Array.from(
    containerEl.querySelectorAll(".loopText")
  ) as SVGTextElement[];

  const frameLabelTypes = new Set([
    MESSAGE_TYPE.LOOP_START,
    MESSAGE_TYPE.ALT_START,
    MESSAGE_TYPE.ALT_ELSE,
    MESSAGE_TYPE.OPT_START,
    MESSAGE_TYPE.PAR_START,
    MESSAGE_TYPE.PAR_AND,
    MESSAGE_TYPE.CRITICAL_START,
    MESSAGE_TYPE.CRITICAL_OPTION,
    MESSAGE_TYPE.BREAK_START,
    MESSAGE_TYPE.PAR_OVER_START,
  ]);
  const frameMessages = messages
    .filter((message) => frameLabelTypes.has(message.type))
    .map((message) => message.message);
  const criticalMessages = messages
    .filter((message) => message.type === MESSAGE_TYPE.CRITICAL_START)
    .map((message) => message.message);
  const textNodeGroups: SVGTextElement[][] = [];

  loopTextNodes.forEach((node) => {
    const previousGroup = textNodeGroups[textNodeGroups.length - 1];
    const previousNode = previousGroup?.[previousGroup.length - 1];
    const y = node.getBBox().y;
    const previousY = previousNode?.getBBox().y;
    const fontSize = parseFloat(getComputedStyle(node).fontSize) || 20;
    const continuesPreviousLabel =
      previousNode?.parentElement === node.parentElement &&
      previousY !== undefined &&
      Math.abs(y - previousY) <= fontSize * 1.5;

    if (continuesPreviousLabel) {
      previousGroup.push(node);
    } else {
      textNodeGroups.push([node]);
    }
  });

  const unusedFrameMessageIndexes = new Set(
    frameMessages.map((_message, index) => index)
  );
  const normalizeWhitespace = (text: string) =>
    text.replace(/\s+/g, " ").trim();
  // Matches a rendered label back to its frame message, to recognize critical
  // regions. Mermaid's `wrap` option replaces spaces with line breaks.
  const findFrameMessage = (renderedText: string) => {
    const renderedLabel = normalizeWhitespace(
      renderedText.match(/^\[([\s\S]*)\]$/)?.[1] ?? renderedText
    );
    const index = Array.from(unusedFrameMessageIndexes).find(
      (candidate) =>
        normalizeWhitespace(frameMessages[candidate]) === renderedLabel
    );
    if (index === undefined) {
      return undefined;
    }
    unusedFrameMessageIndexes.delete(index);
    return frameMessages[index];
  };

  textNodeGroups.forEach((nodeGroup) => {
    const node = nodeGroup[0];
    const text = nodeGroup
      .map((textNode) => getTextContentWithLineBreaks(textNode))
      .join("\n");
    const frameMessage = findFrameMessage(text);
    const textElement = createTextSkeletonFromSVG(node, text);
    if (nodeGroup.length > 1) {
      // Mermaid renders each line as its own centered <text>; keep the lines'
      // measured extent and center them like Mermaid does.
      const boxes = nodeGroup.map((textNode) => textNode.getBBox());
      const centerX = Number(node.getAttribute("x"));
      const top = Math.min(...boxes.map((box) => box.y));
      const bottom = Math.max(...boxes.map((box) => box.y + box.height));
      textElement.width = Math.max(...boxes.map((box) => box.width));
      textElement.height = Math.max(
        bottom - top,
        text.split("\n").length * textElement.fontSize * 1.25
      );
      // With center alignment Excalidraw treats `x` as the text's center and
      // offsets it by its own measured width.
      textElement.x = centerX;
      textElement.textAlign = "center";
    }
    const isCritical =
      frameMessage !== undefined && criticalMessages.includes(frameMessage);
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
    const text = labelTextNode[index]
      ? getTextContentWithLineBreaks(labelTextNode[index])
      : "";
    const container = createContainerSkeletonFromSVG(labelBox, "rectangle", {
      label: { text },
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
    const node = createContainerSkeletonFromSVG(rect, "rectangle", {
      label: { text: "" },
      subtype: "highlight",
    });
    nodes.push(node);
  });
  return nodes;
};

const expandMultilineParticipantRows = (
  actors: Array<Node[]>,
  lines: Line[],
  arrows: Arrow[],
  highlights: Container[],
  notes: Container[],
  activations: Container[],
  loops: Loop | undefined
) => {
  const actorElements = actors.flat();
  const topParticipants = actorElements.filter(
    (node): node is Container =>
      node.type === "rectangle" &&
      node.subtype === "actor" &&
      Boolean(node.id?.endsWith("-top"))
  );
  const bottomParticipants = actorElements.filter(
    (node): node is Container =>
      node.type === "rectangle" &&
      node.subtype === "actor" &&
      Boolean(node.id?.endsWith("-bottom"))
  );
  // Participant boxes only grow as much as their own labels need. Like in
  // Mermaid, stick-figure labels may hang below the row, so they only push the
  // content below the row down rather than stretching every box.
  const boxGrowth = Math.max(
    0,
    ...topParticipants.map((participant) => {
      const lineCount = participant.label?.text?.split("\n").length || 1;
      const fontSize = participant.label?.fontSize || 16;
      const requiredHeight = lineCount * fontSize * 1.25 + 10;
      return requiredHeight - (participant.height || 0);
    })
  );
  const expansionHeight = Math.max(
    boxGrowth,
    ...actorElements
      .filter(
        (node): node is Text =>
          node.type === "text" &&
          Boolean(node.id?.includes("-top-")) &&
          node.text.includes("\n")
      )
      .map((text) => {
        const contentTop = Math.min(...lines.map((line) => line.startY));
        return text.y + (text.height || 0) + 5 - contentTop;
      })
  );

  if (expansionHeight <= 0) {
    return;
  }

  topParticipants.forEach((participant) => {
    participant.height = (participant.height || 0) + boxGrowth;
  });
  bottomParticipants.forEach((participant) => {
    participant.y += expansionHeight;
    participant.height = (participant.height || 0) + boxGrowth;
  });

  // Stick-figure actors are made from several primitives rather than one
  // bound container. Keep their bottom row aligned with participant boxes.
  actorElements.forEach((node) => {
    if (!node.id?.includes("-bottom-")) {
      return;
    }
    if (node.type === "line" || node.type === "arrow") {
      node.startY += expansionHeight;
      node.endY += expansionHeight;
    } else {
      node.y += expansionHeight;
    }
  });

  // Lifelines run from the (grown) top boxes to the shifted bottom row.
  lines.forEach((line) => {
    line.startY += boxGrowth;
    line.endY += expansionHeight;
  });
  arrows.forEach((arrow) => {
    arrow.startY += expansionHeight;
    arrow.endY += expansionHeight;
    if (arrow.sequenceNumber) {
      arrow.sequenceNumber.y += expansionHeight;
    }
  });

  [...highlights, ...notes, ...activations].forEach((node) => {
    node.y += expansionHeight;
  });
  loops?.lines.forEach((line) => {
    line.startY += expansionHeight;
    line.endY += expansionHeight;
  });
  loops?.texts.forEach((text) => {
    text.y += expansionHeight;
  });
  loops?.nodes.forEach((node) => {
    node.y += expansionHeight;
  });
};

export const parseMermaidSequenceDiagram = (
  diagram: Diagram,
  containerEl: Element
): Sequence => {
  // Mermaid already parsed the diagram when creating `diagram`.
  // Re-parsing here can duplicate sequence state (notably boxed participants).
  const mermaidParser = diagram.db as MermaidSequenceParser;
  const nodes: Array<Node[]> = [];
  const rawGroups = mermaidParser.getBoxes();
  // Clean CSS values from groups to remove !important declarations
  const groups = rawGroups.map((group: Group) => ({
    ...group,
    name:
      typeof group.name === "string"
        ? decodeMermaidText(group.name)
        : group.name,
    fill: cleanCSSValue(group.fill || ""),
  }));

  const bgHightlights = computeHighlights(containerEl);
  const actorData = mermaidParser.getActors();
  const { nodes: actors, lines, actorMap } = parseActor(actorData, containerEl);
  const messages = mermaidParser.getMessages().map((message) => ({
    ...message,
    message:
      typeof message.message === "string"
        ? decodeMermaidText(message.message)
        : message.message,
  }));
  const arrows = computeArrows(messages, containerEl, actorMap);
  const notes = computeNotes(messages, containerEl);
  const activations = parseActivations(containerEl);
  const loops = parseLoops(messages, containerEl);
  expandMultilineParticipantRows(
    actors,
    lines,
    arrows,
    bgHightlights,
    notes,
    activations,
    loops
  );
  nodes.push(bgHightlights);
  nodes.push(...actors);
  nodes.push(notes);
  nodes.push(activations);

  return { type: "sequence", lines, arrows, nodes, loops, groups };
};
