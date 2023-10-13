import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { GraphConverter } from "../GraphConverter.js";
import {
  ExcalidrawRectangleElement,
  ExcalidrawTextElement,
  StrokeStyle,
} from "@excalidraw/excalidraw/types/element/types.js";
import { Arrow, Line, Node, Sequence } from "../../parser/sequence.js";
import { ExcalidrawElement } from "../../types.js";
import { MermaidOptions } from "../../index.js";

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
  console.log(line, "LINE");
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
  };
  console.log(lineElement);
  return lineElement;
};

const createText = (element: Node) => {
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

const createContainer = (element: Node, options: MermaidOptions) => {
  const container: ExcalidrawElementSkeleton = {
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    label: {
      text: element.text || "",
      fontSize: options.fontSize,
      verticalAlign: "middle",
    },
  };
  return container;
};

const createArrow = (arrow: Arrow) => {
  const strokeStyle = EXCALIDRAW_STROKE_STYLE_FOR_ARROW[arrow.strokeStyle];
  const arrowElement: ExcalidrawElementSkeleton = {
    type: "arrow",
    x: arrow.startX,
    y: arrow.startY,
    points: [
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
      text: arrow.text || "",
    },
  };
  return arrowElement;
};
export const SequenceToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Sequence, options: any) => {
    const elements: ExcalidrawElementSkeleton[] = [];
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
            excalidrawElement = createContainer(element, options);
            break;

          case "text":
            excalidrawElement = createText(element);
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
        elements.push(excalidrawElement);
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
    console.log(elements, "ELEMNETS");
    return { elements };
  },
});
