import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { LocalPoint } from "@excalidraw/excalidraw/math/types";
import { Arrow, Line, Node, Text } from "../elementSkeleton.js";

const point = (x: number, y: number) => [x, y] as LocalPoint;

export const normalizeText = (text: string) => {
  return text.replace(/\\n/g, "\n");
};

export const transformToExcalidrawLineSkeleton = (line: Line) => {
  const lineElement: ExcalidrawElementSkeleton = {
    type: "line",
    x: line.startX,
    y: line.startY,
    points: [
      point(0, 0),
      point(line.endX - line.startX, line.endY - line.startY),
    ],
    width: line.endX - line.startX,
    height: line.endY - line.startY,
    strokeStyle: line.strokeStyle || "solid",
    strokeColor: line.strokeColor || "#000",
    strokeWidth: line.strokeWidth || 1,
  };
  if (line.groupId) {
    Object.assign(lineElement, { groupIds: [line.groupId] });
  }
  if (line.id) {
    Object.assign(lineElement, { id: line.id });
  }
  return lineElement;
};

export const transformToExcalidrawTextSkeleton = (element: Text) => {
  const textElement: ExcalidrawElementSkeleton = {
    type: "text",
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    text: normalizeText(element.text) || "",
    fontSize: element.fontSize,
    verticalAlign: "top",
    strokeColor: element.color,
  };
  if (element.groupId) {
    Object.assign(textElement, { groupIds: [element.groupId] });
  }
  if (element.id) {
    Object.assign(textElement, { id: element.id });
  }
  return textElement;
};

export const transformToExcalidrawContainerSkeleton = (
  element: Exclude<Node, Line | Arrow | Text>
) => {
  const label = {
    text: normalizeText(element?.label?.text || ""),
    fontSize: element?.label?.fontSize,
    textAlign: element.label?.textAlign,
    verticalAlign: element.label?.verticalAlign || "middle",
    strokeColor: element.label?.color || "#000",
  } as ExcalidrawElementSkeleton["label"];

  if (element.groupId) {
    label.groupIds = [element.groupId];
  }

  let extraProps = {};
  if (element.type === "rectangle" && element.subtype === "activation") {
    extraProps = {
      backgroundColor: "#e9ecef",
      fillStyle: "solid",
    };
  }
  const container: ExcalidrawElementSkeleton = {
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    label,
    strokeStyle: element?.strokeStyle,
    strokeWidth: element?.strokeWidth,
    strokeColor: element?.strokeColor,
    backgroundColor: element?.bgColor,
    fillStyle: "solid",
    ...extraProps,
  };
  if (element.groupId) {
    Object.assign(container, { groupIds: [element.groupId] });
  }

  return container;
};

export const transformToExcalidrawArrowSkeleton = (arrow: Arrow) => {
  const arrowElement: ExcalidrawElementSkeleton = {
    type: "arrow",
    x: arrow.startX,
    y: arrow.startY,
    points: arrow.points?.map(([x, y]) => point(x, y)) || [
      point(0, 0),
      point(arrow.endX - arrow.startX, arrow.endY - arrow.startY),
    ],
    width: arrow.endX - arrow.startX,
    height: arrow.endY - arrow.startY,
    strokeStyle: arrow?.strokeStyle || "solid",
    endArrowhead: (arrow?.endArrowhead || null) as any,
    startArrowhead: (arrow?.startArrowhead || null) as any,
    label: {
      text: normalizeText(arrow?.label?.text || ""),
      fontSize: 16,
      textAlign: arrow?.label?.textAlign,
      verticalAlign: arrow?.label?.verticalAlign,
    },
    roundness: {
      type: 2,
    },
    start: arrow.start,
    end: arrow.end,
  };
  if (arrow.groupId) {
    Object.assign(arrowElement, { groupIds: [arrow.groupId] });
  }

  return arrowElement;
};
