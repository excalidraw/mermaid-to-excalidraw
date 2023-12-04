import { ExcalidrawArrowElement } from "@excalidraw/excalidraw/types/element/types.js";
import { Arrow, Text } from "./parser/sequence.js";
import { entityCodesToText } from "./utils.js";

export const createArrowSkeletonFromSVG = (
  arrowNode: SVGLineElement | SVGPathElement,
  opts?: {
    label?: string;
    strokeStyle?: ExcalidrawArrowElement["strokeStyle"];
    startArrowhead?: ExcalidrawArrowElement["startArrowhead"];
    endArrowhead?: ExcalidrawArrowElement["endArrowhead"];
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
  }
) => {
  const textElement: Text = {
    type: "text",
    x,
    y,
    width: opts?.width || 20,
    height: opts?.height || 20,
    text,
    fontSize: opts?.fontSize || 16,
    id: opts?.id,
    groupId: opts?.groupId,
  };
  return textElement;
};
