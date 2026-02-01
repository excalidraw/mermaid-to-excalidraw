import { nanoid } from "nanoid";
import { computeEdgePositions, entityCodesToText } from "../utils.js";
import {
    Arrow,
    Container,
    Text,
    createArrowSkeletion,
} from "../elementSkeleton.js";
import type { Diagram } from "mermaid/dist/Diagram.js";
import type { ExcalidrawLinearElement } from "@excalidraw/excalidraw/types/element/types.js";

export interface ER {
    type: "er";
    entities: Container[];
    relationships: Arrow[];
    text: Text[];
}

// Mermaid ER relationship cardinality types
const CARDINALITY = {
    ZERO_OR_ONE: "ZERO_OR_ONE",
    ZERO_OR_MORE: "ZERO_OR_MORE",
    ONE_OR_MORE: "ONE_OR_MORE",
    ONLY_ONE: "ONLY_ONE",
    MD_PARENT: "MD_PARENT",
};

// Convert Mermaid ER cardinality to Excalidraw arrowhead

const cardinalityToArrowhead = (
    cardinality: string | undefined
): ExcalidrawLinearElement["startArrowhead"] => {
    switch (cardinality) {
        case CARDINALITY.ONLY_ONE:
            return "bar";
        case CARDINALITY.ONE_OR_MORE:
            return "arrow";
        case CARDINALITY.ZERO_OR_ONE:
        case CARDINALITY.ZERO_OR_MORE:
        case CARDINALITY.MD_PARENT:
        default:
            return null;
    }
};

// Parse entity boxes directly from SVG by finding all entity groups

const parseEntities = (
    containerEl: Element
): { entities: Container[]; entityMap: Map<string, Container> } => {
    const parsedEntities: Container[] = [];
    const entityMap = new Map<string, Container>();

    // Find all entity groups - Mermaid uses g elements with id starting with "entity-"
    const entityGroups = containerEl.querySelectorAll('g[id^="entity-"]');

    entityGroups.forEach((entityGroup) => {
        const groupId = nanoid();
        const entityId = entityGroup.getAttribute("id") || "";
        // Extract entity name from id (e.g., "entity-CUSTOMER" -> "CUSTOMER")
        const entityName = entityId.replace(/^entity-/, "");

        if (!entityName) {
            return;
        }

        // Find the rect element (entity box) - look for the outer entity box
        const rectNode = entityGroup.querySelector("rect.er.entityBox") as SVGRectElement | null
            || entityGroup.querySelector("rect") as SVGRectElement | null;

        if (!rectNode) {
            console.warn(`Rect not found for entity ${entityName}`);
            return;
        }

        // Use the rect's absolute position via transformation matrix
        const rectCtm = (rectNode as SVGGraphicsElement).getCTM();
        if (!rectCtm) {
            console.warn(`Could not get CTM for entity ${entityName}`);
            return;
        }

        // Get the bounding box for dimensions (in local coordinates)
        const boundingBox = rectNode.getBBox();

        // Calculate the absolute position
        // CTM.e and CTM.f give us the translation, but we need to account for the rect's local x, y
        const absX = rectCtm.e + (boundingBox.x * rectCtm.a);
        const absY = rectCtm.f + (boundingBox.y * rectCtm.d);

        // Create container with absolute coordinates
        const container: Container = {
            type: "rectangle",
            id: entityName,
            groupId,
            x: absX,
            y: absY,
            width: boundingBox.width,
            height: boundingBox.height,
        };

        // Find the entity label text
        const textNode = entityGroup.querySelector("text.er.entityLabel, text");
        const labelText = textNode?.textContent || entityName;

        // Set label
        container.label = {
            text: entityCodesToText(labelText),
            fontSize: 16,
            verticalAlign: "middle",
        };

        parsedEntities.push(container);
        entityMap.set(entityName, container);
    });

    return { entities: parsedEntities, entityMap };
};

// Parse relationships from SVG paths

const parseRelationships = (
    relationships: any[],
    entityMap: Map<string, Container>,
    containerEl: Element
): { relationships: Arrow[]; text: Text[] } => {
    const arrows: Arrow[] = [];
    const textElements: Text[] = [];

    // Find all relationship line paths
    const relationshipPaths = Array.from(
        containerEl.querySelectorAll("path.er.relationshipLine")
    ) as SVGPathElement[];

    // Find all relationship labels
    const relationshipLabels = Array.from(
        containerEl.querySelectorAll("text.er.relationshipLabel")
    ) as SVGTextElement[];

    relationships.forEach((rel, index) => {
        const { entityA, entityB, relSpec, roleA } = rel;

        // Get the corresponding path element
        const pathNode = relationshipPaths[index];
        if (!pathNode) {
            console.warn(`Relationship path not found for ${entityA} - ${entityB}`);
            return;
        }

        try {
            // Get the transformation matrix for the path element
            const pathCtm = pathNode.getCTM();
            const offset = pathCtm ? { x: pathCtm.e, y: pathCtm.f } : { x: 0, y: 0 };

            // Compute edge positions from path with CTM offset
            const edgeData = computeEdgePositions(pathNode, offset);

            // Determine arrowheads based on cardinality
            const startArrowhead = cardinalityToArrowhead(relSpec?.cardA);
            const endArrowhead = cardinalityToArrowhead(relSpec?.cardB);

            // Determine stroke style based on relationship type
            const strokeStyle: Arrow["strokeStyle"] =
                relSpec?.relType === "NON_IDENTIFYING" ? "dashed" : "solid";

            // Get entity refs for binding
            const entityARef = entityMap.get(entityA);
            const entityBRef = entityMap.get(entityB);

            // Convert reflection points to relative coordinates for Excalidraw
            const points = edgeData.reflectionPoints?.map((p) => [
                p.x - edgeData.startX,
                p.y - edgeData.startY,
            ]);

            const arrow = createArrowSkeletion(
                edgeData.startX,
                edgeData.startY,
                edgeData.endX,
                edgeData.endY,
                {
                    strokeStyle,
                    startArrowhead,
                    endArrowhead,
                    start: entityARef
                        ? { type: "rectangle", id: entityARef.id }
                        : undefined,
                    end: entityBRef
                        ? { type: "rectangle", id: entityBRef.id }
                        : undefined,
                    points: points && points.length > 0 ? points : undefined,
                    // Add relationship label directly to the arrow
                    label: roleA ? { text: roleA, fontSize: 14 } : undefined,
                }
            );

            arrows.push(arrow);
        } catch (e) {
            console.warn(`Error parsing relationship ${entityA}-${entityB}:`, e);
        }
    });

    return { relationships: arrows, text: textElements };
};

//  Main parser for ER diagrams
export const parseMermaidERDiagram = (
    diagram: Diagram,
    containerEl: Element
): ER => {
    diagram.parse();

    // @ts-ignore
    const mermaidParser = diagram.parser.yy;

    // Get relationships from mermaid parser
    const relationshipsData = mermaidParser.getRelationships
        ? mermaidParser.getRelationships()
        : [];

    // Parse entities directly from SVG (more reliable than matching by name)
    const { entities, entityMap } = parseEntities(containerEl);

    // Parse relationships
    const { relationships, text } = parseRelationships(
        relationshipsData,
        entityMap,
        containerEl
    );

    return {
        type: "er",
        entities,
        relationships,
        text,
    };
};
