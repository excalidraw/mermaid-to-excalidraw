import type { ClassModel } from "pele";
import type { NamespaceNode } from "mermaid/dist/diagrams/class/classTypes.js";
import { nanoid } from "nanoid";

import type {
  Arrow,
  Container,
  Line,
  SupportedArrowhead,
  Text,
} from "../elementSkeleton.js";
import type { Class } from "../parser/class.js";
import { decodeMermaidText } from "../text.js";
import {
  getLabelPosition,
  orientRoute,
  pathToLines,
  readEdge,
  routeToArrow,
  toBounds,
  toText,
  withPeleLineBreaks,
} from "./elements.js";
import {
  getElementsByDataId,
  getFontSize,
  getPathRoute,
  getShapeBounds,
  getStyleColor,
  getStyleValue,
  getTextLines,
  simplifyRoute,
} from "./svg.js";

export interface PeleClassOptions {
  fontSize: number;
}

// Mermaid's relation types (`ClassRelation["relation"]["type1"]`)
const RELATION_ARROWHEADS: Record<number, SupportedArrowhead> = {
  0: "diamond_outline", // aggregation
  1: "triangle_outline", // extension
  2: "diamond", // composition
  3: "arrow", // dependency
  4: "circle_outline", // lollipop
};
const DOTTED_LINE = 1;

/**
 * A class: its box, labeled with its annotations and name, its member and
 * method compartments' dividers, and its members and methods, grouped.
 */
const parseClass = (
  group: Element,
  root: Element,
  options: PeleClassOptions
) => {
  const classId = group.getAttribute("data-id")!;
  const box = group.querySelector("rect");
  const bounds = box && getShapeBounds(box, root);
  if (!box || !bounds) {
    return undefined;
  }

  const groupId = nanoid();
  const metadata = { classId };
  const strokeColor = getStyleColor(box, "stroke");
  const strokeWidth = parseFloat(getStyleValue(box, "stroke-width") || "");
  const strokeStyle = getStyleValue(box, "stroke-dasharray")
    ? "dashed"
    : undefined;

  const title = group.querySelector(".pele-label");
  // Annotations (e.g. `«interface»`) are smaller than the class's name: a
  // class with annotations has them and its name as separate texts, where
  // Pele drew them, instead of a label in a single font size.
  const annotations = Array.from(group.querySelectorAll(".pele-annotation"));
  const headerTexts = annotations.length
    ? [...annotations, ...(title ? [title] : [])].map((element) =>
        toText(element, root, options.fontSize, {
          id: nanoid(),
          groupId,
          metadata,
        })
      )
    : [];
  const container: Container = {
    type: "rectangle",
    id: classId,
    groupId,
    metadata,
    ...bounds,
    label: annotations.length
      ? undefined
      : {
          text: getTextLines(title).join("\n"),
          fontSize: title
            ? getFontSize(title, root, options.fontSize)
            : options.fontSize,
          color: getStyleColor(title, "fill"),
          verticalAlign: "top",
        },
    bgColor: getStyleColor(box, "fill"),
    strokeColor,
    strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : undefined,
    strokeStyle,
  };

  const lines: Line[] = Array.from(
    group.querySelectorAll(".pele-divider")
  ).flatMap((divider) =>
    pathToLines(divider, root).map((line) => ({
      ...line,
      id: nanoid(),
      strokeColor,
      strokeWidth: container.strokeWidth,
      strokeStyle,
      groupId,
      metadata,
    }))
  );

  const text = [
    ...headerTexts,
    ...Array.from(group.querySelectorAll(".pele-member")).map((member) =>
      toText(member, root, options.fontSize, {
        id: nanoid(),
        groupId,
        metadata,
      })
    ),
  ];

  return { container, lines, text };
};

const parseRelations = (
  model: ClassModel,
  root: Element,
  classes: Map<string, Container>,
  options: PeleClassOptions
) => {
  const labels = getElementsByDataId(root, "g.pele-edge-label[data-id]");
  const selfRelationLabels: Text[] = [];
  // Relation ids end with the relation's (1-based) index, e.g. `id_A_B_1`
  const groups = new Map(
    Array.from(getElementsByDataId(root, "g.pele-edge.pele-relation[data-id]"))
      .map(([id, group]) => [id.match(/_(\d+)$/)?.[1], group] as const)
      .filter(([index]) => index !== undefined)
  );

  const arrows = model.relations.flatMap((relation, index): Arrow[] => {
    const group = groups.get(String(index + 1));
    const edge = group && readEdge(group, root);
    // Either end can be an interface (lollipop) instead of a class
    const start = classes.get(relation.id1);
    const end = classes.get(relation.id2);
    if (!group || !edge || edge.route.length < 2 || (!start && !end)) {
      return [];
    }
    const isSelfRelation = relation.id1 === relation.id2;
    // Relations go from the first class to the second one
    const route = isSelfRelation
      ? edge.route
      : orientRoute(edge.route, start && toBounds(start), end && toBounds(end));

    const getArrowhead = (type: number | "none") =>
      type === "none" ? null : RELATION_ARROWHEADS[type] ?? "arrow";
    const title = relation.title ? decodeMermaidText(relation.title) : "";
    // A self-relation is a small loop, which its label would cover: the label
    // is put next to it, where Pele drew it, instead.
    const label = labels.get(group.getAttribute("data-id")!);
    const selfRelationLabel = isSelfRelation && label?.querySelector("text");
    if (selfRelationLabel) {
      selfRelationLabels.push(
        toText(selfRelationLabel, root, options.fontSize)
      );
    }

    return [
      routeToArrow(route, {
        label:
          title && !selfRelationLabel
            ? {
                text: title,
                labelPosition: getLabelPosition(route, label, root),
              }
            : undefined,
        strokeStyle:
          relation.relation.lineType === DOTTED_LINE ? "dotted" : "solid",
        startArrowhead: getArrowhead(relation.relation.type1),
        endArrowhead: getArrowhead(relation.relation.type2),
        ...(start ? { start: { type: "rectangle", id: relation.id1 } } : {}),
        ...(end ? { end: { type: "rectangle", id: relation.id2 } } : {}),
        // Pele routes relations orthogonally, with corners too tight for
        // Excalidraw to round without overshooting
        ...(route.length > 2 && !isSelfRelation ? { roundness: null } : {}),
      }),
    ];
  });

  return { arrows, labels: selfRelationLabels };
};

/** Notes, and the dotted connectors from them to the class they're for. */
const parseNotes = (
  model: ClassModel,
  root: Element,
  options: PeleClassOptions
) => {
  const notes: Container[] = [];
  const connectors: Arrow[] = [];
  const edges = getElementsByDataId(root, "g.pele-note-edge[data-id]");

  getElementsByDataId(root, "g.pele-node.pele-note[data-id]").forEach(
    (group, id) => {
      const bounds = getShapeBounds(group, root);
      const note = model.notes.get(id);
      if (!bounds) {
        return;
      }
      const label = group.querySelector(".pele-label");
      notes.push({
        type: "rectangle",
        id,
        ...bounds,
        label: {
          text: note
            ? withPeleLineBreaks(decodeMermaidText(note.text), label)
            : getTextLines(label).join("\n"),
          fontSize: label
            ? getFontSize(label, root, options.fontSize)
            : options.fontSize,
        },
        strokeStyle: "dashed",
        subtype: "note",
      });

      const edge = edges.get(`edgeNote${id.replace(/^note/, "")}`);
      const path = edge?.querySelector("path");
      const route = path && simplifyRoute(getPathRoute(path, root));
      if (!note?.class || !route || route.length < 2) {
        return;
      }
      connectors.push(
        routeToArrow(route, {
          strokeStyle: "dotted",
          startArrowhead: null,
          endArrowhead: null,
          start: { type: "rectangle", id },
          end: { type: "rectangle", id: note.class },
        })
      );
    }
  );

  return { notes, connectors };
};

/**
 * Reads a class diagram from Pele's parsed model (relations, notes,
 * namespaces) and the SVG Pele rendered it to (positions, sizes, the text of
 * members and methods, styles).
 */
export const parsePeleClass = (
  model: ClassModel,
  root: Element,
  options: PeleClassOptions
): Class => {
  const containers: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];
  const classes = new Map<string, Container>();

  // An interface (lollipop) is just a label, above its relation's circle
  root
    .querySelectorAll("g.pele-node.pele-interface .pele-label")
    .forEach((label) => text.push(toText(label, root, options.fontSize)));

  root.querySelectorAll("g.pele-node.pele-class[data-id]").forEach((group) => {
    const parsed = parseClass(group, root, options);
    if (parsed) {
      containers.push(parsed.container);
      lines.push(...parsed.lines);
      text.push(...parsed.text);
      classes.set(parsed.container.id!, parsed.container);
    }
  });

  const { arrows, labels } = parseRelations(model, root, classes, options);
  const { notes, connectors } = parseNotes(model, root, options);

  root
    .querySelectorAll(".pele-cardinality")
    .forEach((cardinality) =>
      text.push(toText(cardinality, root, options.fontSize))
    );
  text.push(...labels);

  return {
    type: "class",
    nodes: [containers, notes],
    lines,
    arrows: [...arrows, ...connectors],
    text,
    // The converter frames each namespace's classes
    namespaces: Array.from(model.namespaces.values()).map(
      (namespace) =>
        ({
          ...namespace,
          classes: Object.fromEntries(namespace.classes),
        } as unknown as NamespaceNode)
    ),
  };
};
