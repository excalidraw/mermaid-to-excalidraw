import {
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";
import { GraphConverter } from "../GraphConverter.js";
import { NODE_BACKGROUND_COLOR } from "../../constants.js";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { ERD } from "../../interfaces.js";

export const erToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: ERD) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    // relationships below the (opaque) entities they connect
    chart.arrows.forEach((arrow) => {
      elements.push(transformToExcalidrawArrowSkeleton(arrow));
    });

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
            excalidrawElement = transformToExcalidrawContainerSkeleton({
              ...element,
              bgColor: element.bgColor ?? NODE_BACKGROUND_COLOR,
            });
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

    chart.text.forEach((textElement) => {
      elements.push(transformToExcalidrawTextSkeleton(textElement));
    });

    return { elements };
  },
});
