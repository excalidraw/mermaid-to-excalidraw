import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import { nanoid } from "nanoid";

import { GraphConverter } from "../GraphConverter.js";
import type { Sequence } from "../../interfaces.js";
import {
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawArrowSkeleton,
} from "../transformToExcalidrawSkeleton.js";

const GROUP_RECT_PADDING = 10;
const GROUP_LABEL_FONT_SIZE = 16;
const GROUP_LABEL_MIN_HEIGHT = 24;
const GROUP_LABEL_HORIZONTAL_OFFSET = 4;
const EXCALIDRAW_LINE_HEIGHT = 1.25;

const isTransparentFill = (fill?: string) => {
  if (!fill) {
    return true;
  }
  const normalizedFill = fill.trim().toLowerCase();
  return (
    normalizedFill === "transparent" ||
    normalizedFill === "none" ||
    normalizedFill === "rgba(0,0,0,0)" ||
    normalizedFill === "rgba(0, 0, 0, 0)"
  );
};

const estimateTextWidth = (text: string, fontSize: number) => {
  const longestLineLength = Math.max(
    ...text.split("\n").map((line) => line.length)
  );
  return Math.max(20, Math.round(longestLineLength * fontSize * 0.6));
};

const estimateTextHeight = (text: string, fontSize: number) =>
  Math.max(
    GROUP_LABEL_MIN_HEIGHT,
    text.split("\n").length * fontSize * EXCALIDRAW_LINE_HEIGHT
  );

export const SequenceToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Sequence) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const activations: ExcalidrawElementSkeleton[] = [];
    const notes: ExcalidrawElementSkeleton[] = [];
    Object.values(chart.nodes).forEach((node) => {
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
            break;
        }
        if (element.type === "rectangle" && element?.subtype === "activation") {
          activations.push(excalidrawElement);
        } else if (element.type === "rectangle" && element.subtype === "note") {
          notes.push(excalidrawElement);
        } else {
          elements.push(excalidrawElement);
        }
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      elements.push(transformToExcalidrawLineSkeleton(line));
    });

    const sequenceNumbers: ExcalidrawElementSkeleton[] = [];
    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }

      elements.push(transformToExcalidrawArrowSkeleton(arrow));
      if (arrow.sequenceNumber) {
        sequenceNumbers.push(
          transformToExcalidrawContainerSkeleton(arrow.sequenceNumber)
        );
      }
    });
    elements.push(...activations);
    // On top of the lifelines and activations, which a note over them, or a
    // message's number, can sit on
    elements.push(...notes);
    elements.push(...sequenceNumbers);

    // loops
    if (chart.loops) {
      const { lines, texts, nodes } = chart.loops;
      lines.forEach((line) => {
        elements.push(transformToExcalidrawLineSkeleton(line));
      });
      texts.forEach((text) => {
        elements.push(transformToExcalidrawTextSkeleton(text));
      });
      nodes.forEach((node) => {
        elements.push(transformToExcalidrawContainerSkeleton(node));
      });
    }

    if (chart.groups) {
      chart.groups.forEach((group) => {
        const { actorKeys, name } = group;
        const groupLabelHeight = name
          ? estimateTextHeight(name, GROUP_LABEL_FONT_SIZE)
          : 0;
        const groupLabelWidth = name
          ? estimateTextWidth(name, GROUP_LABEL_FONT_SIZE)
          : 0;
        let groupRectX: number;
        let groupRectY: number;
        let groupRectWidth: number;
        let groupRectHeight: number;

        if (group.bounds) {
          ({
            x: groupRectX,
            y: groupRectY,
            width: groupRectWidth,
            height: groupRectHeight,
          } = group.bounds);
        } else {
          if (!actorKeys.length) {
            return;
          }
          const actors = elements.filter((ele) => {
            if (ele.id) {
              const hyphenIndex = ele.id.indexOf("-");
              const id = ele.id.substring(0, hyphenIndex);
              return actorKeys.includes(id);
            }
            return false;
          });
          if (!actors.length) {
            return;
          }

          let minX = Infinity;
          let minY = Infinity;
          let maxX = 0;
          let maxY = 0;
          actors.forEach((actor) => {
            if (
              actor.x === undefined ||
              actor.y === undefined ||
              actor.width === undefined ||
              actor.height === undefined
            ) {
              return;
            }
            minX = Math.min(minX, actor.x);
            minY = Math.min(minY, actor.y);
            maxX = Math.max(maxX, actor.x + actor.width);
            maxY = Math.max(maxY, actor.y + actor.height);
          });
          if (
            !Number.isFinite(minX) ||
            !Number.isFinite(minY) ||
            !Number.isFinite(maxX) ||
            !Number.isFinite(maxY)
          ) {
            return;
          }

          const contentWidth = maxX - minX + GROUP_RECT_PADDING * 2;
          groupRectWidth = Math.max(
            contentWidth,
            groupLabelWidth + GROUP_RECT_PADDING * 2
          );
          // Reserve a header inside the group instead of placing its title
          // above the border, where multiline names otherwise collide with
          // neighbors.
          groupRectX =
            minX - GROUP_RECT_PADDING - (groupRectWidth - contentWidth) / 2;
          groupRectY = minY - GROUP_RECT_PADDING - groupLabelHeight;
          groupRectHeight =
            maxY - minY + GROUP_RECT_PADDING * 2 + groupLabelHeight;
        }
        // Not grouped with what's in it: Excalidraw keeps a group's elements
        // together in z-order, which would put them under the `rect`
        // highlights drawn over the box
        const groupRect = transformToExcalidrawContainerSkeleton({
          type: "rectangle",
          x: groupRectX,
          y: groupRectY,
          width: groupRectWidth,
          height: groupRectHeight,
          bgColor: isTransparentFill(group.fill) ? undefined : group.fill,
          strokeColor: "#1f1f1f",
          strokeWidth: 1,
          id: nanoid(),
        });
        elements.unshift(groupRect);

        if (name) {
          const groupLabel = transformToExcalidrawTextSkeleton({
            type: "text",
            id: nanoid(),
            text: name,
            x: groupRectX + GROUP_LABEL_HORIZONTAL_OFFSET,
            y: groupRectY + GROUP_RECT_PADDING,
            width: groupLabelWidth,
            height: groupLabelHeight,
            fontSize: GROUP_LABEL_FONT_SIZE,
            color: "#1f1f1f",
          });
          elements.push(groupLabel);
        }
      });
    }
    return { elements };
  },
});
