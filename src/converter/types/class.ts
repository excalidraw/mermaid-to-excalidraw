import {
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";
import { GraphConverter } from "../GraphConverter.js";
import { createTitleBandElement } from "../helpers.js";
import { NODE_BACKGROUND_COLOR } from "../../constants.js";

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { Class } from "../../interfaces.js";

export const classToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Class) => {
    const elements: ExcalidrawElementSkeleton[] = [];

    // Namespaces, around their classes, like subgraphs: behind the relations,
    // and not grouped with their classes (Excalidraw keeps a group's elements
    // together in z-order, which would put relations above the classes).
    // Outer ones first, behind the namespaces in them.
    const namespaces = [...chart.namespaces].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    // Apart from the classes' ids (a class's is its name, which can be e.g.
    // `Foo__namespace`), which relations bind to
    const takenIds = new Set(
      [...chart.nodes.flat(), ...chart.lines, ...chart.arrows, ...chart.text]
        .map(({ id }) => id)
        .filter(Boolean)
    );
    const getUniqueId = (id: string) => {
      let uniqueId = id;
      for (let index = 2; takenIds.has(uniqueId); index++) {
        uniqueId = `${id}_${index}`;
      }
      takenIds.add(uniqueId);
      return uniqueId;
    };
    const ids = new Map(
      namespaces.map((namespace) => [
        namespace,
        {
          box: getUniqueId(`${namespace.id}__namespace`),
          title: getUniqueId(`${namespace.id}__namespace_title`),
        },
      ])
    );
    namespaces.forEach((namespace) => {
      elements.push({
        type: "rectangle",
        id: ids.get(namespace)!.box,
        x: namespace.x,
        y: namespace.y,
        width: namespace.width,
        height: namespace.height,
      });
    });

    // relations below the (opaque) classes they connect
    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }
      const excalidrawElement = transformToExcalidrawArrowSkeleton(arrow);
      elements.push(excalidrawElement);
    });

    // namespaces' titles, above the relations crossing them
    namespaces.forEach((namespace) => {
      elements.push(
        createTitleBandElement({
          id: ids.get(namespace)!.title,
          box: namespace,
          centerX: namespace.titleX,
          text: namespace.text,
          fontSize: namespace.fontSize,
          containerStyle: {},
        })
      );
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
            break;
        }
        elements.push(excalidrawElement);
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      elements.push(transformToExcalidrawLineSkeleton(line));
    });

    Object.values(chart.text).forEach((ele) => {
      const excalidrawElement = transformToExcalidrawTextSkeleton(ele);

      elements.push(excalidrawElement);
    });

    return { elements };
  },
});
