import { nanoid } from "nanoid";
import { entityCodesToText } from "../utils.js";
import {
    Arrow,
    Container,
    Line,
    Text,
    createArrowSkeletion,
} from "../elementSkeleton.js";
import type { Diagram } from "mermaid/dist/Diagram.js";

// Mermaid ER cardinality types
const ER_CARDINALITY = {
    ZERO_OR_ONE: "ZERO_OR_ONE",
    ZERO_OR_MORE: "ZERO_OR_MORE",
    ONE_OR_MORE: "ONE_OR_MORE",
    ONLY_ONE: "ONLY_ONE",
} as const;

// Configuration constants
const ALIGNMENT_THRESHOLD = 20;     // Pixels threshold for considering entities aligned
const SYMBOL_OFFSET = 25;           // Distance from entity edge to place symbols
const DEFAULT_STROKE_WIDTH = 1;     // Default line thickness

// Symbol dimension constants
const BAR_LENGTH = 10;              // Half-length of perpendicular bars
const PRONG_LENGTH = 12;            // Length of crow's foot prongs  
const PRONG_SPREAD = 8;             // How far prongs spread from center
const CIRCLE_RADIUS = 5;            // Radius for zero circle

// Table dimensions for entities with attributes
const TABLE_CONFIG = {
    fontSize: 13,
    rowHeight: 22,
    headerHeight: 28,
    typeColWidth: 65,
    nameColWidth: 140,
} as const;

interface MermaidRelationship {
    entityA: string;
    entityB: string;
    relSpec?: {
        relType: string;
        cardA?: string;
        cardB?: string;
    };
    roleA?: string;
}

type SymbolDirection = "up" | "down" | "left" | "right";

const drawCrowsFootSymbol = (
    x: number,
    y: number,
    lineDirection: SymbolDirection,
    cardinality: string | undefined
): Line[] => {
    const lines: Line[] = [];
    if (!cardinality) return lines;

    let perpX = 0, perpY = 0;
    let towardEntityX = 0, towardEntityY = 0;

    switch (lineDirection) {
        case "up": perpX = 1; perpY = 0; towardEntityX = 0; towardEntityY = 1; break;
        case "down": perpX = 1; perpY = 0; towardEntityX = 0; towardEntityY = -1; break;
        case "left": perpX = 0; perpY = 1; towardEntityX = 1; towardEntityY = 0; break;
        case "right": perpX = 0; perpY = 1; towardEntityX = -1; towardEntityY = 0; break;
    }

    const hasOne = cardinality === ER_CARDINALITY.ONLY_ONE ||
        cardinality === ER_CARDINALITY.ZERO_OR_ONE ||
        cardinality === ER_CARDINALITY.ONE_OR_MORE;

    const hasZero = cardinality === ER_CARDINALITY.ZERO_OR_ONE ||
        cardinality === ER_CARDINALITY.ZERO_OR_MORE;

    const hasMany = cardinality === ER_CARDINALITY.ONE_OR_MORE ||
        cardinality === ER_CARDINALITY.ZERO_OR_MORE;

    let currentOffset = 0;

    if (hasOne) {
        const bar1X = x + towardEntityX * currentOffset;
        const bar1Y = y + towardEntityY * currentOffset;
        const bar1: Line = {
            type: "line",
            startX: bar1X - perpX * BAR_LENGTH,
            startY: bar1Y - perpY * BAR_LENGTH,
            endX: bar1X + perpX * BAR_LENGTH,
            endY: bar1Y + perpY * BAR_LENGTH,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(bar1);
        currentOffset += 6;

        if (cardinality === ER_CARDINALITY.ONLY_ONE) {
            const bar2X = x + towardEntityX * currentOffset;
            const bar2Y = y + towardEntityY * currentOffset;
            const bar2: Line = {
                type: "line",
                startX: bar2X - perpX * BAR_LENGTH,
                startY: bar2Y - perpY * BAR_LENGTH,
                endX: bar2X + perpX * BAR_LENGTH,
                endY: bar2Y + perpY * BAR_LENGTH,
                strokeWidth: 1,
                strokeColor: "#000",
            };
            lines.push(bar2);
            currentOffset += 6;
        }
    }

    if (hasZero) {
        const circleX = x + towardEntityX * (currentOffset + CIRCLE_RADIUS + 2);
        const circleY = y + towardEntityY * (currentOffset + CIRCLE_RADIUS + 2);
        const diamond1: Line = {
            type: "line",
            startX: circleX,
            startY: circleY - CIRCLE_RADIUS,
            endX: circleX + CIRCLE_RADIUS,
            endY: circleY,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(diamond1);

        const diamond2: Line = {
            type: "line",
            startX: circleX + CIRCLE_RADIUS,
            startY: circleY,
            endX: circleX,
            endY: circleY + CIRCLE_RADIUS,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(diamond2);

        const diamond3: Line = {
            type: "line",
            startX: circleX,
            startY: circleY + CIRCLE_RADIUS,
            endX: circleX - CIRCLE_RADIUS,
            endY: circleY,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(diamond3);

        const diamond4: Line = {
            type: "line",
            startX: circleX - CIRCLE_RADIUS,
            startY: circleY,
            endX: circleX,
            endY: circleY - CIRCLE_RADIUS,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(diamond4);

        currentOffset += CIRCLE_RADIUS * 2 + 4;
    }

    if (hasMany) {
        const prongStartX = x + towardEntityX * (currentOffset + 2);
        const prongStartY = y + towardEntityY * (currentOffset + 2);
        const prongEndBaseX = prongStartX + towardEntityX * PRONG_LENGTH;
        const prongEndBaseY = prongStartY + towardEntityY * PRONG_LENGTH;

        const centerProng: Line = {
            type: "line",
            startX: prongStartX,
            startY: prongStartY,
            endX: prongEndBaseX,
            endY: prongEndBaseY,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(centerProng);

        const leftProng: Line = {
            type: "line",
            startX: prongStartX,
            startY: prongStartY,
            endX: prongEndBaseX - perpX * PRONG_SPREAD,
            endY: prongEndBaseY - perpY * PRONG_SPREAD,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(leftProng);

        const rightProng: Line = {
            type: "line",
            startX: prongStartX,
            startY: prongStartY,
            endX: prongEndBaseX + perpX * PRONG_SPREAD,
            endY: prongEndBaseY + perpY * PRONG_SPREAD,
            strokeWidth: 1,
            strokeColor: "#000",
        };
        lines.push(rightProng);
    }

    return lines;
};

export interface ER {
    type: "er";
    entities: Container[];
    relationships: Arrow[];
    lines: Line[];
    text: Text[];
}

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

// Helper function to find entity data with multiple lookup strategies
const findEntityData = (
    entitiesData: Record<string, any>,
    entityName: string,
    labelText: string
): any => {
    // Try direct lookups first
    if (entitiesData[entityName]) return entitiesData[entityName];
    if (entitiesData[labelText]) return entitiesData[labelText];
    
    // Try partial match (ignore hyphens and case)
    const keys = Object.keys(entitiesData);
    for (const key of keys) {
        if (key.replace(/-/g, '') === entityName.replace(/-/g, '') ||
            key.toLowerCase() === entityName.toLowerCase()) {
            return entitiesData[key];
        }
    }
    
    return null;
};

// Helper function to determine symbol direction from delta values
const getSymbolDirection = (
    dx: number,
    dy: number,
    reverse: boolean = false
): SymbolDirection => {
    let direction: SymbolDirection;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "right" : "left";
    } else {
        direction = dy > 0 ? "down" : "up";
    }
    
    // Reverse direction if needed (for end symbols)
    if (reverse) {
        const opposites: Record<SymbolDirection, SymbolDirection> = {
            right: "left",
            left: "right",
            down: "up",
            up: "down",
        };
        return opposites[direction];
    }
    
    return direction;
};

const parseEntities = (
    containerEl: Element,
    mermaidParser: any
): { entities: Container[]; entityMap: Map<string, Container>; entityTableMap: Map<string, EntityTableInfo> } => {
    const parsedEntities: Container[] = [];
    const entityMap = new Map<string, Container>();
    const entityTableMap = new Map<string, EntityTableInfo>();

    const entitiesData = mermaidParser.getEntities ? mermaidParser.getEntities() : {};
    const entityGroups = containerEl.querySelectorAll('g[id^="entity-"]');

    entityGroups.forEach((entityGroup) => {
        const groupId = nanoid();
        const entityId = entityGroup.getAttribute("id") || "";
        let entityName = entityId.replace(/^entity-/, "");
        const uuidPattern = /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        entityName = entityName.replace(uuidPattern, "");

        if (!entityName) {
            return;
        }

        const labelTextNode = entityGroup.querySelector("text.er.entityLabel");
        const labelText = labelTextNode?.textContent || entityName;

        const entityData = findEntityData(entitiesData, entityName, labelText);

        const attributes: { type: string; name: string }[] = [];
        if (entityData && entityData.attributes && entityData.attributes.length > 0) {
            entityData.attributes.forEach((attr: any) => {
                attributes.push({
                    type: attr.attributeType || '',
                    name: attr.attributeName || ''
                });
            });
        }

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
            const { fontSize, rowHeight, headerHeight, typeColWidth, nameColWidth } = TABLE_CONFIG;
            const tableWidth = typeColWidth + nameColWidth;
            const totalHeight = headerHeight + (attributes.length * rowHeight);
            const strokeWidth = DEFAULT_STROKE_WIDTH;

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
            const strokeWidth = DEFAULT_STROKE_WIDTH;

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
    relationships: MermaidRelationship[],
    entityMap: Map<string, Container>,
    entityTableMap: Map<string, EntityTableInfo>
): { relationships: Arrow[]; lines: Line[]; text: Text[] } => {
    const arrows: Arrow[] = [];
    const allLines: Line[] = [];
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
            const isVerticallyAligned = deltaX < ALIGNMENT_THRESHOLD;
            const isHorizontallyAligned = deltaY < ALIGNMENT_THRESHOLD;

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
                    strokeWidth: DEFAULT_STROKE_WIDTH,
                    startArrowhead: null,
                    endArrowhead: null,
                    start: entityARef
                        ? { type: "rectangle", id: entityARef.id }
                        : undefined,
                    end: entityBRef
                        ? { type: "rectangle", id: entityBRef.id }
                        : undefined,
                    points,
                    label: roleA ? { text: roleA, fontSize: TABLE_CONFIG.fontSize } : undefined,
                    roundness: null,  // Sharp 90-degree corners, no curves
                }
            );

            arrows.push(arrow);

            // Calculate segment directions for multi-segment lines
            let firstSegDx: number, firstSegDy: number;
            let lastSegDx: number, lastSegDy: number;

            if (points && points.length >= 2) {
                firstSegDx = points[1][0] - points[0][0];
                firstSegDy = points[1][1] - points[0][1];
                const lastIdx = points.length - 1;
                lastSegDx = points[lastIdx][0] - points[lastIdx - 1][0];
                lastSegDy = points[lastIdx][1] - points[lastIdx - 1][1];
            } else {
                // Simple straight line
                firstSegDx = endX - startX;
                firstSegDy = endY - startY;
                lastSegDx = endX - startX;
                lastSegDy = endY - startY;
            }

            // Calculate start symbol position and direction using first segment
            const startDist = Math.sqrt(firstSegDx * firstSegDx + firstSegDy * firstSegDy) || 1;
            const startSymbolX = startX + (firstSegDx / startDist) * SYMBOL_OFFSET;
            const startSymbolY = startY + (firstSegDy / startDist) * SYMBOL_OFFSET;
            const startLineDirection = getSymbolDirection(firstSegDx, firstSegDy);

            // Calculate end symbol position and direction (reversed)
            const lastDist = Math.sqrt(lastSegDx * lastSegDx + lastSegDy * lastSegDy) || 1;
            const endSymbolX = endX - (lastSegDx / lastDist) * SYMBOL_OFFSET;
            const endSymbolY = endY - (lastSegDy / lastDist) * SYMBOL_OFFSET;
            const endLineDirection = getSymbolDirection(lastSegDx, lastSegDy, true);

            // Note: Mermaid swaps cardA/cardB for start/end positioning
            const startSymbols = drawCrowsFootSymbol(startSymbolX, startSymbolY, startLineDirection, relSpec?.cardB);
            const endSymbols = drawCrowsFootSymbol(endSymbolX, endSymbolY, endLineDirection, relSpec?.cardA);

            allLines.push(...startSymbols, ...endSymbols);
        } catch (e) {
            console.warn(`Error parsing relationship ${entityA}-${entityB}:`, e);
        }
    });

    return { relationships: arrows, lines: allLines, text: textElements };
};

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
    const { relationships, lines, text } = parseRelationships(
        relationshipsData,
        entityMap,
        entityTableMap
    );

    return {
        type: "er",
        entities,
        relationships,
        lines,
        text,
    };
};
