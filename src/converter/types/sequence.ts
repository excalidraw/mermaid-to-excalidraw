import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { GraphConverter } from "../GraphConverter.js";
import { StrokeStyle } from "@excalidraw/excalidraw/types/element/types.js";
import { Sequence } from "../../parser/sequence.js";

// Arrow mapper for the supported sequence arrow types
const EXCALIDRAW_STROKE_STYLE_FOR_ARROW: { [key: string]: StrokeStyle } = {
  SOLID: "solid",
  DOTTED: "dotted",
  SOLID_CROSS: "solid",
  DOTTED_CROSS: "dotted",
  DOTTED_OPEN: "dotted",
  SOLID_POINT: "solid",
  DOTTED_POINT: "dotted",
};
export const SequenceToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Sequence, options: any) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const fontSize = options.fontSize;
    console.log(chart, "CHART");
    Object.values(chart.nodes).forEach((vertex) => {
      if (!vertex) {
        return;
      }
      const container: ExcalidrawElementSkeleton = {
        type: "rectangle",
        x: vertex.x,
        y: vertex.y,
        width: vertex.width,
        height: vertex.height,
        label: {
          text: vertex.text,
          fontSize,
          verticalAlign: "middle",
        },
      };
      elements.push(container);
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
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
      elements.push(lineElement);
    });

    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }
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
          strokeStyle === EXCALIDRAW_STROKE_STYLE_FOR_ARROW.SOLID ||
          strokeStyle === EXCALIDRAW_STROKE_STYLE_FOR_ARROW.DOTTED
            ? null
            : "arrow",
        label: {
          text: arrow.text || "",
        },
      };
      elements.push(arrowElement);
    });
    return { elements };
  },
});
