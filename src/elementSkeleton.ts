import { ExcalidrawTextElement } from "@excalidraw/excalidraw/types/element/types.js";
import { entityCodesToText } from "./utils.js";
import { ValidLinearElement } from "@excalidraw/excalidraw/types/data/transform.js";
import { DEFAULT_FONT_SIZE } from "./constants.js";

export type Arrow = Omit<Line, "type" | "strokeStyle"> & {
  type: "arrow";
  label?: {
    text: string | null;
    fontSize?: number;
  };
  strokeStyle?: ValidLinearElement["strokeStyle"] | null;
  strokeWidth?: ValidLinearElement["strokeWidth"];
  points?: number[][];
  sequenceNumber?: Container;
  startArrowhead?: ValidLinearElement["startArrowhead"];
  endArrowhead?: ValidLinearElement["endArrowhead"];
  start?: ValidLinearElement["start"];
  end?: ValidLinearElement["end"];
};

export type Line = {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id?: string;
  strokeColor?: string | null;
  strokeWidth?: number | null;
  strokeStyle?: ValidLinearElement["strokeStyle"] | null;
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Text = {
  type: "text";
  text: string;
  x: number;
  y: number;
  id?: string;
  width?: number;
  height?: number;
  fontSize: number;
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Container = {
  type: "rectangle" | "ellipse";
  x: number;
  y: number;
  id?: string;
  label?: {
    text: string | null;
    fontSize: number;
    color?: string;
    verticalAlign?: ExcalidrawTextElement["verticalAlign"];
  };
  width?: number;
  height?: number;
  strokeStyle?: "dashed" | "solid";
  strokeWidth?: number;
  strokeColor?: string;
  bgColor?: string;
  subtype?: "actor" | "activation" | "highlight" | "note" | "sequence";
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Node = Container | Line | Arrow | Text;

export const createArrowSkeletonFromSVG = (
  arrowNode: SVGLineElement | SVGPathElement,
  opts?: {
    label?: string;
    strokeStyle?: ValidLinearElement["strokeStyle"];
    startArrowhead?: ValidLinearElement["startArrowhead"];
    endArrowhead?: ValidLinearElement["endArrowhead"];
  }
) => {
  const arrow = {} as Arrow;
  if (opts?.label) {
    arrow.label = { text: entityCodesToText(opts.label), fontSize: 16 };
  }
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
  if (opts?.label) {
    // In mermaid the text is positioned above arrow but in Excalidraw
    // its postioned on the arrow hence the elements below it might look cluttered so shifting the arrow by an offset of 10px
    const offset = 10;
    arrow.startY = arrow.startY - offset;
    arrow.endY = arrow.endY - offset;
  }

  arrow.strokeColor = arrowNode.getAttribute("stroke");
  arrow.strokeWidth = Number(arrowNode.getAttribute("stroke-width"));
  arrow.type = "arrow";
  arrow.strokeStyle = opts?.strokeStyle || "solid";
  arrow.startArrowhead = opts?.startArrowhead || null;
  arrow.endArrowhead = opts?.endArrowhead || null;
  return arrow;
};

export const createArrowSkeletion = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  opts?: {
    id?: string;
    label?: Arrow["label"];
    strokeColor?: Arrow["strokeColor"];
    strokeStyle?: Arrow["strokeStyle"];
    startArrowhead?: Arrow["startArrowhead"];
    endArrowhead?: Arrow["endArrowhead"];
    start?: Arrow["start"];
    end?: Arrow["end"];
    points?: Arrow["points"];
  }
) => {
  const arrow = {} as Arrow;
  arrow.type = "arrow";
  arrow.startX = startX;
  arrow.startY = startY;
  arrow.endX = endX;
  arrow.endY = endY;

  Object.assign(arrow, { ...opts });
  return arrow;
};

export const createTextSkeleton = (
  x: number,
  y: number,
  text: string,
  opts?: {
    id?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    groupId?: string;
    metadata?: { [key: string]: any };
  }
) => {
  const textElement: Text = {
    type: "text",
    x,
    y,
    text,
    width: opts?.width || 20,
    height: opts?.height || 20,

    fontSize: opts?.fontSize || DEFAULT_FONT_SIZE,
    id: opts?.id,
    groupId: opts?.groupId,
    metadata: opts?.metadata,
  };
  return textElement;
};

export const createTextSkeletonFromSVG = (
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

export const createContainerSkeletonFromSVG = (
  node: SVGSVGElement | SVGRectElement | SVGCircleElement,
  type: Container["type"],
  opts: {
    id?: string;
    label?: {
      text: string;
      verticalAlign?: ExcalidrawTextElement["verticalAlign"];
    };
    subtype?: Container["subtype"];
    groupId?: string;
  } = {}
) => {
  const container = {} as Container;
  container.type = type;
  const { label, subtype, id, groupId } = opts;
  container.id = id;
  if (groupId) {
    container.groupId = groupId;
  }
  if (label) {
    container.label = {
      text: entityCodesToText(label.text),
      fontSize: 16,
      verticalAlign: label?.verticalAlign,
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

export const createLineSkeletonFromSVG = (
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
