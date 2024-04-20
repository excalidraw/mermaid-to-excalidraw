import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { Arrow, Line, Node, Text } from "../elementSkeleton.js";

export const normalizeText = (text: string) => {
  return text.replace(/\\n/g, "\n");
};

export const transformToExcalidrawLineSkeleton = (line: Line) => {
  const lineElement: ExcalidrawElementSkeleton = {
    type: "line",
    x: line.startX,
    y: line.startY,
    points: [
      [0, 0],
      [line.endX - line.startX, line.endY - line.startY],
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
    verticalAlign: "middle",
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
    label: {
      text: normalizeText(element?.label?.text || ""),
      fontSize: element?.label?.fontSize,
      verticalAlign: element.label?.verticalAlign || "middle",
      strokeColor: element.label?.color || "#000",
      groupIds: element.groupId ? [element.groupId] : [],
    },
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
    points: arrow.points || [
      [0, 0],
      [arrow.endX - arrow.startX, arrow.endY - arrow.startY],
    ],
    width: arrow.endX - arrow.startX,
    height: arrow.endY - arrow.startY,
    strokeStyle: arrow?.strokeStyle || "solid",
    endArrowhead: arrow?.endArrowhead || null,
    startArrowhead: arrow?.startArrowhead || null,
    label: {
      text: normalizeText(arrow?.label?.text || ""),
      fontSize: 16,
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
