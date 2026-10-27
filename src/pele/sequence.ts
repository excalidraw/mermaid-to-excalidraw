import type { SequenceModel } from "pele";
import { nanoid } from "nanoid";

import type { Arrow, Container, Line, Node, Text } from "../elementSkeleton.js";
import type { Sequence } from "../interfaces.js";
import { decodeMermaidText } from "../text.js";
import {
  hasClass,
  pathToLines,
  readEdge,
  routeToArrow,
  toLine,
  toText,
  withPeleLineBreaks,
} from "./elements.js";
import {
  getElementsByDataId,
  getFontSize,
  getPathRoute,
  getShapeBounds,
  getStyleColor,
} from "./svg.js";

export interface PeleSequenceOptions {
  fontSize: number;
  /** Width of a line of text in Excalidraw, if it can be measured. */
  measureText?: (text: string, fontSize: number) => number | null;
}

// The colors the Mermaid engine gives the same parts of a sequence diagram,
// so that diagrams look the same with either engine.
const LIFELINE_COLOR = "#999";
const FRAME_COLOR = "#adb5bd";
const FRAME_LABEL_BACKGROUND = "#e9ecef";
const SEQUENCE_NUMBER_BACKGROUND = "#e9ecef";
const SEQUENCE_NUMBER_FONT_SIZE = 14;
const SEQUENCE_NUMBER_BADGE_SIZE = 28;
// Excalidraw's padding around a container's label, and some leeway, so that
// a number doesn't wrap
const SEQUENCE_NUMBER_PADDING = 2 * 5 + 4;
// Notes are opaque, hiding the lifelines and activations they're drawn over
// (in the canvas' color, also in the dark theme, which inverts it)
const NOTE_BACKGROUND = "#ffffff";
// Excalidraw arrow labels (see `transformToExcalidrawArrowSkeleton`)
const ARROW_LABEL_FONT_SIZE = 16;
const EXCALIDRAW_LINE_HEIGHT = 1.25;

const getRect = getShapeBounds;

const rectToLines = (rect: Element, root: Element, extra: Partial<Line>) => {
  const bounds = getShapeBounds(rect, root);
  if (!bounds) {
    return [];
  }
  const { x, y, width, height } = bounds;
  const corners = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
  return corners.map((corner, index) =>
    toLine(corner, corners[(index + 1) % corners.length], extra)
  );
};

/**
 * Participants (boxes) and actors (stick figures), at the top and, unless
 * destroyed, at the bottom of their lifeline. Element ids start with the
 * actor's name: the converter finds a box's actors by it.
 */
const parseActors = (
  model: SequenceModel,
  root: Element,
  options: PeleSequenceOptions
) => {
  const nodes: Node[][] = [];

  root.querySelectorAll("g.pele-node.pele-actor[data-id]").forEach((group) => {
    const name = group.getAttribute("data-id")!;
    const position = hasClass(group, "pele-actor-footer") ? "bottom" : "top";
    const id = `${name}-${position}`;
    const label = group.querySelector(".pele-label");

    if (hasClass(group, "pele-actor-actor")) {
      const groupId = nanoid();
      const parts: Node[] = [];
      Array.from(group.children).forEach((child) => {
        const partId = `${id}-${parts.length}`;
        switch (child.tagName.toLowerCase()) {
          case "circle": {
            const bounds = getRect(child, root);
            if (bounds) {
              parts.push({
                type: "ellipse",
                id: partId,
                ...bounds,
                groupId,
              });
            }
            break;
          }
          case "path":
          case "line":
            parts.push(
              ...pathToLines(child, root, { groupId }).map((line, index) => ({
                ...line,
                id: `${partId}-${index}`,
              }))
            );
            break;
          case "text":
            parts.push(
              toText(child, root, options.fontSize, { id: partId, groupId })
            );
            break;
        }
      });
      nodes.push(parts);
      return;
    }

    const bounds = getRect(group, root);
    if (!bounds) {
      return;
    }
    const shape = group.querySelector("rect, path, polygon, circle");
    const actor = model.actors.get(name);
    nodes.push([
      {
        type: "rectangle",
        id,
        ...bounds,
        label: {
          text: withPeleLineBreaks(
            decodeMermaidText(actor?.description ?? name),
            label
          ),
          fontSize: label
            ? getFontSize(label, root, options.fontSize)
            : options.fontSize,
        },
        bgColor: shape ? getStyleColor(shape, "fill") : undefined,
        strokeColor: shape ? getStyleColor(shape, "stroke") : undefined,
        subtype: "actor",
      },
    ]);
  });

  return nodes;
};

const getLifelines = (root: Element) =>
  Array.from(root.querySelectorAll("path.pele-lifeline")).flatMap((path) => {
    const route = getPathRoute(path, root);
    return route.length < 2
      ? []
      : [
          toLine(route[0], route[route.length - 1], {
            strokeColor: LIFELINE_COLOR,
            strokeWidth: 1,
          }),
        ];
  });

const getMessageText = (message: SequenceModel["messages"][number]) =>
  typeof message.message === "string" ? decodeMermaidText(message.message) : "";

const parseMessages = (
  model: SequenceModel,
  root: Element,
  options: PeleSequenceOptions
) => {
  const messages = new Map(
    model.messages.map((message) => [`i${message.id}`, message])
  );
  const labels = getElementsByDataId(root, "g.pele-edge-label[data-id]");
  const arrows: Arrow[] = [];
  const texts: Text[] = [];

  getElementsByDataId(root, "g.pele-edge.pele-message[data-id]").forEach(
    (group, id) => {
      const message = messages.get(id);
      const edge = readEdge(group, root);
      if (!message || !edge || edge.route.length < 2) {
        return;
      }

      // A message to self is a small loop, which its label would cover: the
      // label is put next to it, where Pele drew it, instead.
      const selfMessageLabel =
        message.from !== undefined &&
        message.from === message.to &&
        labels.get(id)?.querySelector("text");
      if (selfMessageLabel) {
        // In the font size of the other messages' labels, centered where
        // Pele drew it
        const label = toText(selfMessageLabel, root, options.fontSize);
        const { height = 0 } = label;
        const scaledHeight = (height * ARROW_LABEL_FONT_SIZE) / label.fontSize;
        texts.push({
          ...label,
          fontSize: ARROW_LABEL_FONT_SIZE,
          y: label.y + (height - scaledHeight) / 2,
          height: scaledHeight,
        });
      }

      // Excalidraw draws an arrow's label on the arrow, Pele above it: the
      // arrow is moved up into the space Pele kept for the label, as the
      // Mermaid engine does.
      const text = selfMessageLabel ? "" : getMessageText(message);
      const labelOffset = text
        ? (text.split("\n").length *
            ARROW_LABEL_FONT_SIZE *
            EXCALIDRAW_LINE_HEIGHT) /
          2
        : 0;
      const route = edge.route.map((point) => ({
        x: point.x,
        y: point.y - labelOffset,
      }));

      // Not bound to the actors: they're far up the lifelines, and Excalidraw
      // moves a bound arrow's ends onto what it's bound to (e.g. on undo/redo)
      const arrow = routeToArrow(route, {
        label: text ? { text } : undefined,
        strokeStyle: edge.line.hasAttribute("stroke-dasharray")
          ? "dotted"
          : "solid",
        startArrowhead: edge.hasStartMarker ? "arrow" : null,
        endArrowhead: edge.hasEndMarker ? "arrow" : null,
      });

      const number = group.querySelector(".pele-sequence-number");
      const badge = number?.querySelector("rect, circle");
      const badgeBounds = badge && getShapeBounds(badge, root);
      if (number && badgeBounds) {
        // Centered on Pele's badge, and big enough for Excalidraw to fit the
        // number in without growing it
        const text = number.textContent || "";
        const height = SEQUENCE_NUMBER_BADGE_SIZE;
        const textWidth =
          options.measureText?.(text, SEQUENCE_NUMBER_FONT_SIZE) ??
          text.length * SEQUENCE_NUMBER_FONT_SIZE * 0.7;
        const width = Math.max(
          SEQUENCE_NUMBER_BADGE_SIZE,
          textWidth + SEQUENCE_NUMBER_PADDING
        );
        arrow.sequenceNumber = {
          type: "rectangle",
          x: badgeBounds.x + badgeBounds.width / 2 - width / 2,
          y: badgeBounds.y + badgeBounds.height / 2 - labelOffset - height / 2,
          width,
          height,
          label: { text, fontSize: SEQUENCE_NUMBER_FONT_SIZE },
          bgColor: SEQUENCE_NUMBER_BACKGROUND,
          subtype: "sequence",
        };
      }

      arrows.push(arrow);
    }
  );

  return { arrows, texts };
};

const parseNotes = (
  model: SequenceModel,
  root: Element,
  options: PeleSequenceOptions
) => {
  const messages = new Map(
    model.messages.map((message) => [`i${message.id}`, message])
  );
  return Array.from(getElementsByDataId(root, "g.pele-note[data-id]")).flatMap(
    ([id, group]): Container[] => {
      const rect = group.querySelector("rect");
      const bounds = rect && getRect(rect, root);
      const message = messages.get(id);
      if (!rect || !bounds) {
        return [];
      }
      const label = group.querySelector(".pele-label");
      return [
        {
          type: "rectangle",
          ...bounds,
          label: {
            text: message
              ? withPeleLineBreaks(getMessageText(message), label)
              : label?.textContent || "",
            fontSize: label
              ? getFontSize(label, root, options.fontSize)
              : options.fontSize,
          },
          bgColor: getStyleColor(rect, "fill") ?? NOTE_BACKGROUND,
          strokeStyle: "dashed",
          subtype: "note",
        },
      ];
    }
  );
};

const parseRects = (
  root: Element,
  selector: string,
  subtype: Container["subtype"]
) =>
  Array.from(root.querySelectorAll(selector)).flatMap((rect): Container[] => {
    const bounds = getRect(rect, root);
    return bounds
      ? [
          {
            type: "rectangle",
            ...bounds,
            label: { text: "", fontSize: ARROW_LABEL_FONT_SIZE },
            ...(subtype === "highlight"
              ? // Pele draws highlights without an outline
                {
                  bgColor: getStyleColor(rect, "fill"),
                  strokeColor: "transparent",
                }
              : {}),
            subtype,
          },
        ]
      : [];
  });

/**
 * Frames (`loop`, `alt`, `opt`, `par`, `critical`, `break`): dotted outlines
 * and section separators, the frame's kind in a tab, and section labels.
 */
const parseFrames = (root: Element, options: PeleSequenceOptions) => {
  const lines: Line[] = [];
  const texts: Text[] = [];
  const nodes: Container[] = [];
  const frameLine: Partial<Line> = {
    strokeStyle: "dotted",
    strokeColor: FRAME_COLOR,
    strokeWidth: 2,
  };

  root.querySelectorAll("g.pele-frame").forEach((frame) => {
    const outline = Array.from(frame.children).find(
      (child) =>
        child.tagName.toLowerCase() === "rect" &&
        child.getAttribute("fill") === "none"
    );
    if (outline) {
      lines.push(...rectToLines(outline, root, frameLine));
    }

    Array.from(frame.children)
      .filter(
        (child) =>
          child.tagName.toLowerCase() === "path" &&
          child.hasAttribute("stroke-dasharray")
      )
      .forEach((separator) =>
        lines.push(...pathToLines(separator, root, frameLine))
      );

    const kind = frame.querySelector(".pele-frame-kind");
    const tab = kind?.previousElementSibling;
    const tabBounds = tab && getRect(tab, root);
    if (kind && tabBounds) {
      nodes.push({
        type: "rectangle",
        x: tabBounds.x,
        y: tabBounds.y,
        height: tabBounds.height,
        label: {
          text: kind.textContent || "",
          fontSize: getFontSize(kind, root, options.fontSize),
        },
        strokeColor: FRAME_COLOR,
        bgColor: FRAME_LABEL_BACKGROUND,
      });
    }

    frame
      .querySelectorAll(".pele-frame-label")
      .forEach((label) => texts.push(toText(label, root, options.fontSize)));
  });

  return { lines, texts, nodes };
};

/**
 * Reads a sequence diagram from Pele's parsed model (actors, messages, notes,
 * boxes) and the SVG Pele rendered it to (positions and sizes).
 */
export const parsePeleSequence = (
  model: SequenceModel,
  root: Element,
  options: PeleSequenceOptions
): Sequence => {
  const actors = parseActors(model, root, options);
  const boxes = Array.from(root.querySelectorAll("g.pele-box"));
  const destroys = Array.from(
    root.querySelectorAll("path.pele-destroy")
  ).flatMap((path) => pathToLines(path, root));
  const messages = parseMessages(model, root, options);

  return {
    type: "sequence",
    nodes: [
      parseRects(root, "rect.pele-rect", "highlight"),
      ...actors,
      parseNotes(model, root, options),
      parseRects(root, "rect.pele-activation", "activation"),
      destroys,
      messages.texts,
    ],
    lines: getLifelines(root),
    arrows: messages.arrows,
    loops: parseFrames(root, options),
    groups: model.boxes.map((box, index) => {
      // Pele draws the boxes in the order they're declared
      const rect = boxes[index]?.querySelector("rect");
      const bounds = rect && getRect(rect, root);
      return {
        name: decodeMermaidText(box.name ?? ""),
        actorKeys: box.actorKeys,
        fill: box.fill,
        ...(bounds ? { bounds } : {}),
      };
    }),
  };
};
