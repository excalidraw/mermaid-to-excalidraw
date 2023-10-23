import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { GraphConverter } from "../GraphConverter.js";

import { Arrow, Line, Node, Sequence, Text } from "../../parser/sequence.js";
import {
  ExcalidrawFrameElement,
  StrokeStyle,
} from "@excalidraw/excalidraw/types/element/types.js";
import { nanoid } from "nanoid";

// Arrow mapper for the supported sequence arrow types
const EXCALIDRAW_STROKE_STYLE_FOR_ARROW: { [key: string]: StrokeStyle } = {
  SOLID: "solid",
  DOTTED: "dotted",
  SOLID_CROSS: "solid",
  DOTTED_CROSS: "dotted",
  SOLID_OPEN: "solid",
  DOTTED_OPEN: "dotted",
  SOLID_POINT: "solid",
  DOTTED_POINT: "dotted",
};

const createLine = (line: Line) => {
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

const createText = (element: Text) => {
  const textElement: ExcalidrawElementSkeleton = {
    type: "text",
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    text: element.text || "",
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

const createContainer = (element: Exclude<Node, Line | Arrow | Text>) => {
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
      text: element?.label?.text || "",
      fontSize: element?.label?.fontSize,
      verticalAlign: "middle",
      strokeColor: element.label?.color || "#000",
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

const createArrow = (arrow: Arrow) => {
  const strokeStyle = EXCALIDRAW_STROKE_STYLE_FOR_ARROW[arrow.strokeStyle];
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
    strokeStyle,
    endArrowhead:
      arrow.strokeStyle === "SOLID_OPEN" || arrow.strokeStyle === "DOTTED_OPEN"
        ? null
        : "arrow",
    label: {
      text: arrow?.label?.text || "",
      fontSize: 16,
    },
    roundness: {
      type: 2,
    },
  };
  if (arrow.groupId) {
    Object.assign(arrowElement, { groupIds: [arrow.groupId] });
  }
  return arrowElement;
};

export const SequenceToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Sequence) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const activations: ExcalidrawElementSkeleton[] = [];
    Object.values(chart.nodes).forEach((node) => {
      if (!node || !node.length) {
        return;
      }
      node.forEach((element) => {
        let excalidrawElement: ExcalidrawElementSkeleton;

        switch (element.type) {
          case "line":
            excalidrawElement = createLine(element);
            break;

          case "rectangle":
          case "ellipse":
            excalidrawElement = createContainer(element);
            break;

          case "text":
            excalidrawElement = createText(element);
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
        if (element.type === "rectangle" && element?.subtype === "activation") {
          activations.push(excalidrawElement);
        } else {
          elements.push(excalidrawElement);
        }
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      elements.push(createLine(line));
    });

    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }

      elements.push(createArrow(arrow));
      if (arrow.sequenceNumber) {
        elements.push(createContainer(arrow.sequenceNumber));
      }
    });
    elements.push(...activations);

    // loops
    if (chart.loops) {
      const { lines, texts, nodes } = chart.loops;
      lines.forEach((line) => {
        elements.push(createLine(line));
      });
      texts.forEach((text) => {
        elements.push(createText(text));
      });
      nodes.forEach((node) => {
        elements.push(createContainer(node));
      });
    }

    if (chart.groups) {
      chart.groups.forEach((group) => {
        const { actorKeys, name } = group;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = 0;
        let maxY = 0;
        if (!actorKeys.length) {
          return;
        }
        const actors = elements.filter((ele) => {
          if (ele.id) {
            const hyphenIndex = ele.id.indexOf("-");
            const id = ele.id.substring(0, hyphenIndex);
            return actorKeys.includes(id);
          }
        });
        actors.forEach((actor) => {
          minX = Math.min(minX, actor.x);
          minY = Math.min(minY, actor.y);
          maxX = Math.max(maxX, actor.x + actor.width!);
          maxY = Math.max(maxY, actor.y + actor.height!);
        });
        // Draw the outer rectangle enclosing the group elements
        const PADDING = 10;
        const groupRectX = minX - PADDING;
        const groupRectY = minY - PADDING;
        const groupRectWidth = maxX - minX + PADDING * 2;
        const groupRectHeight = maxY - minY + PADDING * 2;

        const groupRect = createContainer({
          type: "rectangle",
          x: groupRectX,
          y: groupRectY,
          width: groupRectWidth,
          height: groupRectHeight,
          bgColor: group.fill,
        });
        elements.unshift(groupRect);
        const frameId = nanoid();

        // compute frame coordinates and dimensions
        const frameWidth = groupRectWidth + PADDING * 2;
        const frameHeight = groupRectHeight + PADDING * 2;
        const frameX1 = groupRectX - PADDING;
        const frameY1 = groupRectY - PADDING;
        const frameX2 = frameX1 + frameWidth;
        const frameY2 = frameY1 + frameHeight;

        elements.forEach((ele) => {
          if (
            ele.x >= frameX1 &&
            ele.x + ele.width! <= frameX2 &&
            ele.y >= frameY1 &&
            ele.y + ele.height! <= frameY2
          ) {
            Object.assign(ele, { frameId });
          }
        });
        // TODO remove extra attributes once we support frames in programmatic API
        const frame: ExcalidrawFrameElement = {
          type: "frame",
          version: 262,
          versionNonce: 1383486180,
          isDeleted: false,
          id: frameId,
          fillStyle: "solid",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 0,
          opacity: 100,
          angle: 0,
          x: frameX1,
          y: frameY1,
          strokeColor: "#bbb",
          backgroundColor: "transparent",
          width: frameWidth,
          height: frameHeight,
          seed: 1792453604,
          groupIds: [],
          frameId: null,
          roundness: null,
          boundElements: [],
          updated: 1697731885168,
          link: null,
          locked: false,
          name,
        };
        elements.push(frame);
      });
    }
    return { elements };
  },
});
