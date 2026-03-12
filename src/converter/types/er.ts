import {
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";
import { GraphConverter } from "../GraphConverter.js";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { ERD } from "../../parser/er.js";

export const erToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: ERD) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    chart.nodes.forEach((node) => {
      if (!node || !node.length) {
        return;
      }

      node.forEach((element) => {
        let excalidrawElement: ExcalidrawElementSkeleton;

        switch (element.type) {
          case "line":
            excalidrawElement = transformToExcalidrawLineSkeleton(element);
            break;
          case "rectangle":
          case "ellipse":
            excalidrawElement = transformToExcalidrawContainerSkeleton(element);
            break;
          case "text":
            excalidrawElement = transformToExcalidrawTextSkeleton(element);
            break;
          default:
            throw `unknown type ${element.type}`;
        }

        elements.push(excalidrawElement);
      });
    });

    chart.lines.forEach((line) => {
      elements.push(transformToExcalidrawLineSkeleton(line));
    });

    chart.arrows.forEach((arrow) => {
      elements.push(transformToExcalidrawArrowSkeleton(arrow));
    });

    chart.text.forEach((textElement) => {
      elements.push(transformToExcalidrawTextSkeleton(textElement));
    });

    return { elements };
  },
});
