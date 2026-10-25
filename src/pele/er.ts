import type { ErModel } from "pele";
import { nanoid } from "nanoid";

import type {
  Arrow,
  CardinalityArrowhead,
  Container,
  Line,
  Text,
} from "../elementSkeleton.js";
import type { ERD } from "../parser/er.js";
import { decodeMermaidText } from "../text.js";
import {
  orientRoute,
  pathToLines,
  readEdge,
  routeToArrow,
  toBounds,
  toText,
} from "./elements.js";
import {
  getElementsByDataId,
  getFontSize,
  getShapeBounds,
  getStyleColor,
  getStyleValue,
  getTextLines,
  lengthenRouteEnds,
} from "./svg.js";

export interface PeleERDOptions {
  fontSize: number;
}

const CARDINALITY_ARROWHEADS: Record<string, CardinalityArrowhead> = {
  ONLY_ONE: "cardinality_exactly_one",
  ZERO_OR_ONE: "cardinality_zero_or_one",
  ZERO_OR_MORE: "cardinality_zero_or_many",
  ONE_OR_MORE: "cardinality_one_or_many",
  MD_PARENT: "cardinality_one",
};

type Entity = NonNullable<ReturnType<ErModel["entities"]["get"]>>;

/**
 * An entity: its box, labeled with its name, the divider below the name, and
 * its attributes' types, names, keys and comments, grouped.
 */
const parseEntity = (
  entity: Entity,
  group: Element,
  root: Element,
  options: PeleERDOptions
) => {
  const box = Array.from(group.children).find(
    (child) => child.tagName.toLowerCase() === "rect"
  );
  const bounds = box && getShapeBounds(box, root);
  if (!box || !bounds) {
    return undefined;
  }

  const hasAttributes = entity.attributes.length > 0;
  const groupId = hasAttributes ? nanoid() : undefined;
  const metadata = {
    entityId: entity.id,
    entityLabel: entity.label,
    entityAlias: entity.alias,
  };
  const strokeColor = getStyleColor(box, "stroke");
  const strokeWidth = parseFloat(getStyleValue(box, "stroke-width") || "");
  const strokeStyle = getStyleValue(box, "stroke-dasharray")
    ? "dashed"
    : undefined;

  const title = Array.from(group.children).find((child) =>
    (child.getAttribute("class") || "").includes("pele-label")
  );
  const container: Container = {
    type: "rectangle",
    id: entity.id,
    groupId,
    metadata,
    ...bounds,
    label: {
      text: getTextLines(title ?? null).join("\n"),
      fontSize: title
        ? getFontSize(title, root, options.fontSize)
        : options.fontSize,
      color: getStyleColor(title, "fill"),
      textAlign: "center",
      verticalAlign: hasAttributes ? "top" : "middle",
    },
    bgColor: getStyleColor(box, "fill"),
    strokeColor,
    strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : undefined,
    strokeStyle,
  };

  const lines: Line[] = Array.from(
    group.querySelectorAll(".pele-er-divider")
  ).flatMap((divider) =>
    pathToLines(divider, root).map((line) => ({
      ...line,
      id: nanoid(),
      strokeColor,
      strokeWidth: container.strokeWidth,
      strokeStyle,
      groupId,
      metadata: { entityId: entity.id },
    }))
  );

  const text = Array.from(
    group.querySelectorAll(".pele-er-attributes text")
  ).map((attribute) =>
    toText(attribute, root, options.fontSize, {
      id: nanoid(),
      groupId,
      metadata: { entityId: entity.id },
    })
  );

  return { container, lines, text };
};

const parseRelationships = (
  model: ErModel,
  root: Element,
  entities: Map<string, Container>,
  options: PeleERDOptions
) => {
  const labels = getElementsByDataId(root, "g.pele-edge-label[data-id]");
  const selfRelationshipLabels: Text[] = [];
  // Relationship ids end with the relationship's (0-based) index
  const groups = new Map(
    Array.from(getElementsByDataId(root, "g.pele-edges > g.pele-edge[data-id]"))
      .map(([id, group]) => [id.match(/_(\d+)$/)?.[1], group] as const)
      .filter(([index]) => index !== undefined)
  );

  const arrows = model.relationships.flatMap((relationship, index): Arrow[] => {
    const group = groups.get(String(index));
    const edge = group && readEdge(group, root);
    const start = entities.get(relationship.entityA);
    const end = entities.get(relationship.entityB);
    if (!group || !edge || edge.route.length < 2 || !start || !end) {
      return [];
    }

    const isSelfRelationship = relationship.entityA === relationship.entityB;
    // room for the cardinality markers at both ends
    const route = isSelfRelationship
      ? edge.route
      : lengthenRouteEnds(
          orientRoute(edge.route, toBounds(start), toBounds(end))
        );
    const role = decodeMermaidText(relationship.roleA || "");
    // A self-relationship is a small loop, which its label would cover:
    // the label is put next to it, where Pele drew it, instead.
    const selfRelationshipLabel =
      isSelfRelationship &&
      labels.get(group.getAttribute("data-id")!)?.querySelector("text");
    if (selfRelationshipLabel) {
      selfRelationshipLabels.push(
        toText(selfRelationshipLabel, root, options.fontSize)
      );
    }

    return [
      routeToArrow(route, {
        label:
          role && !selfRelationshipLabel
            ? { text: role, textAlign: "center" }
            : undefined,
        strokeStyle:
          relationship.relSpec.relType === "NON_IDENTIFYING"
            ? "dashed"
            : "solid",
        // `cardB` is the cardinality at entity A's end, `cardA` at B's
        startArrowhead:
          CARDINALITY_ARROWHEADS[relationship.relSpec.cardB] ?? null,
        endArrowhead:
          CARDINALITY_ARROWHEADS[relationship.relSpec.cardA] ?? null,
        start: { type: "rectangle", id: relationship.entityA },
        end: { type: "rectangle", id: relationship.entityB },
        // Pele routes relationships orthogonally, with corners too tight
        // for Excalidraw to round without overshooting
        ...(route.length > 2 && !isSelfRelationship ? { roundness: null } : {}),
      }),
    ];
  });

  return { arrows, labels: selfRelationshipLabels };
};

/**
 * Reads an ER diagram from Pele's parsed model (entities, relationships) and
 * the SVG Pele rendered it to (positions, sizes, the attributes' columns,
 * styles).
 */
export const parsePeleERD = (
  model: ErModel,
  root: Element,
  options: PeleERDOptions
): ERD => {
  const containers: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];
  const entities = new Map<string, Container>();

  // Entities are drawn with their name as id, related by their id
  const groups = getElementsByDataId(root, "g.pele-node.pele-entity[data-id]");
  model.entities.forEach((entity, name) => {
    const group = groups.get(name);
    const parsed = group && parseEntity(entity, group, root, options);
    if (parsed) {
      containers.push(parsed.container);
      lines.push(...parsed.lines);
      text.push(...parsed.text);
      entities.set(entity.id, parsed.container);
    }
  });

  const { arrows, labels } = parseRelationships(model, root, entities, options);

  return {
    type: "erd",
    nodes: [containers],
    lines,
    arrows,
    text: [...text, ...labels],
  };
};
