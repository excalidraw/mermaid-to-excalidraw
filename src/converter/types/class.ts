import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { Class } from "../../parser/class.js";
import { GraphConverter } from "../GraphConverter.js";
import {
  createArrow,
  createContainer,
  createLine,
  createText,
} from "./sequence.js";
import { nanoid } from "nanoid";

export const classToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Class) => {
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
            excalidrawElement = createContainer(element);
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
      const excalidrawElement = createArrow(arrow);
      elements.push(excalidrawElement);
    });

    Object.values(chart.text).forEach((ele) => {
      const excalidrawElement = createText(ele);

      elements.push(excalidrawElement);
    });

    Object.values(chart.namespaces).forEach((namespace) => {
      const classIds = Object.keys(namespace.classes);
      const children = [...classIds];
      const chartElements = [...chart.lines, ...chart.arrows, ...chart.text];
      classIds.forEach((classId) => {
        const childIds = chartElements
          .filter((ele) => ele.metadata?.classId === classId)
          .map((ele) => ele.id);

        if (childIds) {
          children.push(...childIds);
        }
      });

      const frame: ExcalidrawElementSkeleton = {
        type: "frame",
        id: nanoid(),
        name: namespace.id,
        children,
      };
      elements.push(frame);
    });
    return { elements };
  },
});
