import { nanoid } from "nanoid";
import { entityCodesToText } from "../utils.js";
import {
    Arrow,
    Container,
    Text,
    createArrowSkeletion,
} from "../elementSkeleton.js";
import type { Diagram } from "mermaid/dist/Diagram.js";

export interface ER {
    type: "er";
    entities: Container[];
    relationships: Arrow[];
    text: Text[];
}

// Parse entity boxes directly from SVG by finding all entity groups
interface EntityTableInfo {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    bottomY: number;
    topY: number;
}

const parseEntities = (
    containerEl: Element,
    mermaidParser: any
): { entities: Container[]; entityMap: Map<string, Container>; entityTableMap: Map<string, EntityTableInfo> } => {
    const parsedEntities: Container[] = [];
    const entityMap = new Map<string, Container>();
    const entityTableMap = new Map<string, EntityTableInfo>();

    // Get entities data from mermaid parser (contains attributes)
    const entitiesData = mermaidParser.getEntities ? mermaidParser.getEntities() : {};

    // Find all entity groups - Mermaid uses g elements with id starting with "entity-"
    const entityGroups = containerEl.querySelectorAll('g[id^="entity-"]');

    entityGroups.forEach((entityGroup) => {
        const groupId = nanoid();
        const entityId = entityGroup.getAttribute("id") || "";
        // Extract entity name from id (e.g., "entity-CUSTOMER-xxx" -> "CUSTOMER")
        let entityName = entityId.replace(/^entity-/, "");
        // Remove UUID suffix if present
        const uuidPattern = /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        entityName = entityName.replace(uuidPattern, "");
        // Handle LINE-ITEM -> LINEITEM conversion (mermaid removes hyphens in IDs)
        const entityNameWithHyphens = entityName;

        if (!entityName) {
            return;
        }

        // Find the entity label text first (need it for data lookup)
        const labelTextNode = entityGroup.querySelector("text.er.entityLabel");
        const labelText = labelTextNode?.textContent || entityName;

        // Get attributes from mermaid parser data
        let entityData = entitiesData[entityName] ||
            entitiesData[entityNameWithHyphens] ||
            entitiesData[labelText];

        // If not found, try to find by partial match
        if (!entityData) {
            const keys = Object.keys(entitiesData);
            for (const key of keys) {
                if (key.replace(/-/g, '') === entityName.replace(/-/g, '') ||
                    key.toLowerCase() === entityName.toLowerCase()) {
                    entityData = entitiesData[key];
                    break;
                }
            }
        }

        // Build attribute data
        const attributes: { type: string; name: string }[] = [];
        if (entityData && entityData.attributes && entityData.attributes.length > 0) {
            entityData.attributes.forEach((attr: any) => {
                attributes.push({
                    type: attr.attributeType || '',
                    name: attr.attributeName || ''
                });
            });
        }

        // Find the rect element for position reference
        const rectNode = entityGroup.querySelector("rect") as SVGRectElement | null;

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

        // Get the bounding box for position
        const boundingBox = rectNode.getBBox();

        // Calculate the absolute position
        const absX = rectCtm.e + (boundingBox.x * rectCtm.a);
        const absY = rectCtm.f + (boundingBox.y * rectCtm.d);

        // Check if entity has attributes - determines rendering style
        const hasAttributes = attributes.length > 0;

        if (hasAttributes) {
            // Table dimensions - clean, compact, minimalistic
            const fontSize = 13;
            const rowHeight = 22;
            const headerHeight = 28;
            const typeColWidth = 65;
            const nameColWidth = 140;
            const tableWidth = typeColWidth + nameColWidth;
            const totalHeight = headerHeight + (attributes.length * rowHeight);
            const strokeWidth = 1;  // Thin lines for clean look

            // Store table info for arrow positioning
            const tableInfo: EntityTableInfo = {
                x: absX,
                y: absY,
                width: tableWidth,
                height: totalHeight,
                centerX: absX + tableWidth / 2,
                centerY: absY + totalHeight / 2,
                topY: absY,
                bottomY: absY + totalHeight,
            };
            entityTableMap.set(entityName, tableInfo);

            // Also store with labelText key for lookup
            if (labelText !== entityName) {
                entityTableMap.set(labelText, tableInfo);
            }

            // Create the header row (entity name)
            const headerContainer: Container = {
                type: "rectangle",
                id: entityName,
                groupId,
                x: absX,
                y: absY,
                width: tableWidth,
                height: headerHeight,
                strokeWidth,
                label: {
                    text: entityCodesToText(labelText),
                    fontSize: fontSize + 1,
                    verticalAlign: "middle",
                },
            };
            parsedEntities.push(headerContainer);
            entityMap.set(entityName, headerContainer);

            // Create attribute rows
            attributes.forEach((attr, index) => {
                const rowY = absY + headerHeight + (index * rowHeight);

                // Type cell (left column)
                const typeCell: Container = {
                    type: "rectangle",
                    id: `${entityName}-attr-${index}-type`,
                    groupId,
                    x: absX,
                    y: rowY,
                    width: typeColWidth,
                    height: rowHeight,
                    strokeWidth,
                    label: {
                        text: attr.type,
                        fontSize: fontSize,
                        verticalAlign: "middle",
                    },
                };
                parsedEntities.push(typeCell);

                // Name cell (right column)
                const nameCell: Container = {
                    type: "rectangle",
                    id: `${entityName}-attr-${index}-name`,
                    groupId,
                    x: absX + typeColWidth,
                    y: rowY,
                    width: nameColWidth,
                    height: rowHeight,
                    strokeWidth,
                    label: {
                        text: attr.name,
                        fontSize: fontSize,
                        verticalAlign: "middle",
                    },
                };
                parsedEntities.push(nameCell);
            });
        } else {
            // Simple box - no attributes, use SVG dimensions directly
            const boxWidth = boundingBox.width * rectCtm.a;
            const boxHeight = boundingBox.height * rectCtm.d;
            const strokeWidth = 1;

            // Store entity info for arrow positioning
            const tableInfo: EntityTableInfo = {
                x: absX,
                y: absY,
                width: boxWidth,
                height: boxHeight,
                centerX: absX + boxWidth / 2,
                centerY: absY + boxHeight / 2,
                topY: absY,
                bottomY: absY + boxHeight,
            };
            entityTableMap.set(entityName, tableInfo);

            if (labelText !== entityName) {
                entityTableMap.set(labelText, tableInfo);
            }

            // Create simple rectangle with entity name
            const entityContainer: Container = {
                type: "rectangle",
                id: entityName,
                groupId,
                x: absX,
                y: absY,
                width: boxWidth,
                height: boxHeight,
                strokeWidth,
                label: {
                    text: entityCodesToText(labelText),
                    fontSize: 14,
                    verticalAlign: "middle",
                },
            };
            parsedEntities.push(entityContainer);
            entityMap.set(entityName, entityContainer);
        }
    });

    return { entities: parsedEntities, entityMap, entityTableMap };
};

// Parse relationships

const parseRelationships = (
    relationships: any[],
    entityMap: Map<string, Container>,
    entityTableMap: Map<string, EntityTableInfo>
): { relationships: Arrow[]; text: Text[] } => {
    const arrows: Arrow[] = [];
    const textElements: Text[] = [];

    relationships.forEach((rel) => {
        const { entityA, entityB, relSpec, roleA } = rel;

        try {
            // Determine stroke style based on relationship type
            const strokeStyle: Arrow["strokeStyle"] =
                relSpec?.relType === "NON_IDENTIFYING" ? "dashed" : "solid";

            // Get entity refs for binding
            const entityARef = entityMap.get(entityA);
            const entityBRef = entityMap.get(entityB);

            // Get entity table positions
            const tableA = entityTableMap.get(entityA);
            const tableB = entityTableMap.get(entityB);

            if (!tableA || !tableB) {
                console.warn(`Entity tables not found for ${entityA} or ${entityB}`);
                return;
            }

            let startX: number, startY: number, endX: number, endY: number;
            let points: [number, number][];

            // Calculate differences
            const deltaX = Math.abs(tableA.centerX - tableB.centerX);
            const deltaY = Math.abs(tableA.centerY - tableB.centerY);

            // Check if entities are aligned (within threshold)
            const isVerticallyAligned = deltaX < 20;
            const isHorizontallyAligned = deltaY < 20;

            if (isVerticallyAligned) {
                // Entities are stacked vertically - straight vertical line
                const aIsAbove = tableA.centerY < tableB.centerY;
                startX = tableA.centerX;
                startY = aIsAbove ? tableA.bottomY : tableA.topY;
                endX = tableA.centerX;
                endY = aIsAbove ? tableB.topY : tableB.bottomY;

                points = [
                    [0, 0],
                    [0, endY - startY],
                ];
            } else if (isHorizontallyAligned) {
                // Entities are side by side - straight horizontal line
                const aIsLeft = tableA.centerX < tableB.centerX;
                startX = aIsLeft ? (tableA.x + tableA.width) : tableA.x;
                startY = tableA.centerY;
                endX = aIsLeft ? tableB.x : (tableB.x + tableB.width);
                endY = tableA.centerY;

                points = [
                    [0, 0],
                    [endX - startX, 0],
                ];
            } else {
                // Entities are diagonal - need L-shaped routing
                const aIsAbove = tableA.centerY < tableB.centerY;
                const aIsLeft = tableA.centerX < tableB.centerX;

                // Start from bottom/top center of entity A
                startX = tableA.centerX;
                startY = aIsAbove ? tableA.bottomY : tableA.topY;

                // End at top/bottom of entity B at the appropriate X
                endX = tableB.centerX;
                endY = aIsAbove ? tableB.topY : tableB.bottomY;

                // Calculate midpoint Y for the L-shape bend
                const midY = (startY + endY) / 2;

                // Create L-shaped path: go vertical first, then horizontal, then vertical
                points = [
                    [0, 0],                           // Start
                    [0, midY - startY],               // Go down/up to mid point
                    [endX - startX, midY - startY],   // Go horizontal to target X
                    [endX - startX, endY - startY],   // Go down/up to end
                ];
            }

            const arrow = createArrowSkeletion(
                startX,
                startY,
                endX,
                endY,
                {
                    strokeStyle,
                    strokeWidth: 1,
                    startArrowhead: null,
                    endArrowhead: null,
                    start: entityARef
                        ? { type: "rectangle", id: entityARef.id }
                        : undefined,
                    end: entityBRef
                        ? { type: "rectangle", id: entityBRef.id }
                        : undefined,
                    points,
                    label: roleA ? { text: roleA, fontSize: 13 } : undefined,
                    roundness: null,  // Sharp 90-degree corners, no curves
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

    // Parse entities directly from SVG
    const { entities, entityMap, entityTableMap } = parseEntities(containerEl, mermaidParser);

    // Parse relationships
    const { relationships, text } = parseRelationships(
        relationshipsData,
        entityMap,
        entityTableMap
    );

    return {
        type: "er",
        entities,
        relationships,
        text,
    };
};
