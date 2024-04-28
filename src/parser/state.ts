import type { Diagram } from "mermaid/dist/Diagram.js";
import {
  createContainerSkeletonFromSVG,
  type Node,
} from "../elementSkeleton.js";
import {
  computeEdge2Positions,
  computeEdgePositions,
  computeElementPosition,
} from "../utils.js";
import { ExcalidrawElementType } from "@excalidraw/excalidraw/types/element/types.js";

export interface State {
  type: "state";
  nodes: any[];
  edges: any[];
}

// the names are taken from mermaidParser.lineType
export enum LineType {
  DOTTED_LINE = 1,
  LINE = 0,
}

// the names are taken from mermaidParser.relationType
export enum RelationType {
  AGGREGATION = 0,
  COMPOSITION = 2,
  DEPENDENCY = 3,
  EXTENSION = 1,
}

export interface StateNode {
  width: number;
  height: number;
}

export interface RelationState {
  description?: string;
  [state: `state${number}`]: {
    description: string;
    id: string;
    start?: boolean;
    stmt: "state";
    type: string;
  };
  stmt: "relation";
}

export interface CompositeState {
  doc?: Array<ParsedDoc>;
  description: string;
  id: string;
  type: string;
  stmt: "state";
}

export type ParsedDoc = CompositeState | RelationState;

const createInnerEllipseExcalidrawElement = (
  element: SVGSVGElement,
  position: { x: number; y: number; width: number; height: number },
  size = 4
) => {
  const innerEllipse = createContainerSkeletonFromSVG(element, "ellipse", {
    id: `${element.id}-inner`,
    groupId: element.id,
  });

  innerEllipse.width = size;
  innerEllipse.height = size;

  innerEllipse.x =
    position.x + (position.width as number) / 2 - innerEllipse.width / 2;
  innerEllipse.y =
    position.y + (position.height as number) / 2 - innerEllipse.height / 2;

  innerEllipse.strokeColor = "black";
  innerEllipse.bgColor = "black";

  return innerEllipse;
};

const createExcalidrawElement = (
  node: SVGSVGElement,
  containerEl: Element,
  shape: "ellipse" | "rectangle",
  additionalProps: Parameters<typeof createContainerSkeletonFromSVG>[2]
) => {
  const nodePosition = computeElementPosition(node, containerEl);

  const nodeElement = createContainerSkeletonFromSVG(node, shape, {
    id: node.id,
    ...additionalProps,
  });

  nodeElement.x = nodePosition.x;
  nodeElement.y = nodePosition.y;

  return nodeElement;
};

const parseRelation = (
  relation: Extract<ParsedDoc, { stmt: "relation" }>,
  containerEl: Element,
  nodes: Array<Node>,
  processedNodeRelations: Set<string>
) => {
  const relationStart = relation.state1;
  const relationEnd = relation.state2;

  const cluster1 = containerEl.querySelector<SVGSVGElement>(
    `[id="${relationStart.id}"]`
  );
  const cluster2 = containerEl.querySelector<SVGSVGElement>(
    `[id="${relationEnd.id}"]`
  );

  const relationStartNode = containerEl.querySelector<SVGSVGElement>(
    `[data-id="${relationStart.id}"]`
  );
  const relationEndNode = containerEl.querySelector<SVGSVGElement>(
    `[data-id="${relationEnd.id}"]`
  );

  if (cluster1 || cluster2) {
    return;
  }

  if (!relationStartNode || !relationEndNode) {
    throw new Error("Relation nodes not found");
  }

  if (!processedNodeRelations.has(relationStartNode.id)) {
    const nodeOneContainer = createExcalidrawElement(
      relationStartNode,
      containerEl,
      relationStart?.start !== undefined ? "ellipse" : "rectangle",
      relationStart?.start === undefined
        ? { label: { text: relationStart.description || relationStart.id } }
        : { subtype: "highlight" }
    );

    if (!nodeOneContainer.bgColor && relationStart.start) {
      nodeOneContainer.bgColor = "#000";
    }

    nodes.push(nodeOneContainer);
    processedNodeRelations.add(relationStartNode.id);
  }

  if (!processedNodeRelations.has(relationEndNode.id)) {
    const nodeTwoContainer = createExcalidrawElement(
      relationEndNode,
      containerEl,
      relationEnd?.start !== undefined ? "ellipse" : "rectangle",
      relationEnd?.start === undefined
        ? { label: { text: relationEnd.description || relationEnd.id } }
        : { groupId: relationEndNode.id }
    );
    nodes.push(nodeTwoContainer);
    processedNodeRelations.add(relationEndNode.id);

    if (relationEnd.id === "root_end") {
      const innerEllipse = createInnerEllipseExcalidrawElement(
        relationEndNode,
        {
          x: nodeTwoContainer.x,
          y: nodeTwoContainer.y,
          width: nodeTwoContainer.width!,
          height: nodeTwoContainer.height!,
        },
        4
      );

      nodes.push(innerEllipse);
    }
  }
};

const parseRelations = (data: ParsedDoc[], containerEl: Element) => {
  const nodes: Array<Node> = [];
  const processedNodeRelations = new Set<string>();

  data.forEach((state) => {
    const isSingleState = state.stmt === "state" && !state?.doc;

    if (isSingleState) {
      const singleStateNode = containerEl.querySelector<SVGSVGElement>(
        `[data-id="${state.id}"]`
      )!;

      const stateElement = createExcalidrawElement(
        singleStateNode,
        containerEl,
        "rectangle",
        { label: { text: state.description || state.id } }
      );

      nodes.push(stateElement);

      return;
    }

    if (state.stmt === "state" && state.doc) {
      console.debug("TODO: make a recursive call to parse nested states");

      return;
    }

    if (state.stmt === "relation") {
      return parseRelation(state, containerEl, nodes, processedNodeRelations);
    }
  });

  return nodes;
};

const parseEdges = (nodes: ParsedDoc[], containerEl: Element) => {
  const edges = containerEl.querySelector(".edgePaths")?.children;

  if (!edges) {
    throw new Error("Edges not found");
  }

  return (
    nodes
      .filter((node) => node.stmt === "relation")
      //@ts-expect-error
      .map((edge: StateRoot, i) => {
        const startId = edge.state1.id;
        const endId = edge.state2.id;

        const nodeStartElement = containerEl.querySelector<SVGPathElement>(
          `[data-id*="${startId}"]`
        )!;
        const nodeEndElement = containerEl.querySelector<SVGPathElement>(
          `[data-id*="${endId}"]`
        )!;

        const edgeStartElement = edges[i] as SVGPathElement;

        const position = computeElementPosition(edgeStartElement, containerEl);
        const edgePositionData = computeEdge2Positions(
          edgeStartElement,
          position
        );

        return {
          start: nodeStartElement.id,
          end: nodeEndElement.id,
          label: {
            text: edge?.description,
          },
          ...edgePositionData,
        };
      })
  );
};

export const parseMermaidStateDiagram = (
  diagram: Diagram,
  containerEl: Element
): State => {
  diagram.parse();

  // Get mermaid parsed data from parser shared variable `yy`
  //@ts-ignore
  const mermaidParser = diagram.parser.yy;
  const nodes: Array<Node> = [];
  const rootDocV2 = mermaidParser.getRootDocV2();

  console.debug({
    document: rootDocV2,
    mermaidParser,
    states: mermaidParser.getStates(),
    relations: mermaidParser.getRelations(),
    classes: mermaidParser.getClasses(),
    logDocuments: mermaidParser.logDocuments(),
  });

  const relations = parseRelations(rootDocV2.doc, containerEl);

  const edges = parseEdges(rootDocV2.doc, containerEl);

  nodes.push(...relations);

  return { type: "state", nodes, edges };
};
