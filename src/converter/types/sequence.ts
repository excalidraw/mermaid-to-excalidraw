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
      strokeColor: "#000",
    },
    strokeStyle: element?.strokeStyle,
    strokeWidth: element?.strokeWidth,
    strokeColor: element?.strokeColor,
    backgroundColor: element?.bgColor,
    fillStyle: "solid",
    ...extraProps,
  };

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

        const frameId = nanoid();
        // There is a outer rectangle drawn to enclose the group/box in mermaid, these calculations are so we can include that rectangle inside the frame as well.
        // Later we will remove this and draw our own rectangle instead to simplify. Currently that isn't possible as we want to support background highlight as well and there is no clear distinction between group and highlight on DOM.
        const padding = 20;
        const yOffset = 25;
        minX -= padding;
        minY -= yOffset + padding;
        maxX += padding;
        maxY += yOffset;
        const width = maxX - minX;
        const height = maxY - minY;
        elements.forEach((ele) => {
          if (
            ele.x >= minX &&
            ele.x + ele.width! <= maxX &&
            ele.y >= minY &&
            ele.y + ele.height! <= maxY
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
          x: minX,
          y: minY,
          strokeColor: "#bbb",
          backgroundColor: "transparent",
          width,
          height,
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
