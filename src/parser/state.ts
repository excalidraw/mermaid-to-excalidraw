import type { Diagram } from "mermaid/dist/Diagram.js";
import {
  Line,
  createContainerSkeletonFromSVG,
  type Node,
} from "../elementSkeleton.js";
import { computeEdge2Positions, computeElementPosition } from "../utils.js";

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

const MARGIN_TOP_LINE_X_AXIS = 25;

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

  innerEllipse.x = position.x + position.width / 2 - innerEllipse.width / 2;
  innerEllipse.y = position.y + position.height / 2 - innerEllipse.height / 2;

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

const createClusterExcalidrawElement = (
  clusterNode: SVGSVGElement,
  containerEl: Element,
  state: Extract<ParsedDoc, { stmt: "state" }>
) => {
  const clusterElementPosition = computeElementPosition(
    clusterNode,
    containerEl
  );

  const clusterElementSkeleton = createContainerSkeletonFromSVG(
    clusterNode,
    "rectangle",
    {
      id: state.id,
      label: { text: state.description || state.id, verticalAlign: "top" },
      groupId: state.id,
    }
  );

  clusterElementSkeleton.x = clusterElementPosition.x;
  clusterElementSkeleton.y = clusterElementPosition.y;

  const topLine: Line = {
    type: "line",
    startX: clusterElementPosition.x,
    startY: clusterElementPosition.y + MARGIN_TOP_LINE_X_AXIS,
    endX: clusterElementPosition.x + (clusterElementSkeleton.width || 0),
    endY: clusterElementPosition.y + MARGIN_TOP_LINE_X_AXIS,
    strokeColor: "black",
    strokeWidth: 1,
    groupId: state.id,
  };

  return { clusterElementSkeleton, topLine };
};

const getClusterElement = (containerEl: Element, id: string) => {
  return containerEl.querySelector<SVGSVGElement>(`[id="${id}"]`)!;
};

const parseRelation = (
  relation: Extract<ParsedDoc, { stmt: "relation" }>,
  containerEl: Element,
  nodes: Array<Node>,
  processedNodeRelations: Set<string>,
  groupId?: string
) => {
  const relationStart = relation.state1;
  const relationEnd = relation.state2;

  let relationStartNode = containerEl.querySelector<SVGSVGElement>(
    `[data-id*="${relationStart.id}"]`
  )!;
  let relationEndNode = containerEl.querySelector<SVGSVGElement>(
    `[data-id*="${relationEnd.id}"]`
  )!;

  const isRelationEndCluster =
    relationEndNode.id.includes(`${relationEnd.id}_start`) ||
    relationEndNode.id.includes(`${relationEnd.id}_end`);

  // Binding the relation to the cluster, if we don't make this will bind to end node ellipse
  if (isRelationEndCluster) {
    relationEndNode = getClusterElement(containerEl, relationEnd.id);
  }

  const isRelationStartCluster =
    relationStartNode.id.includes(`${relationStart.id}_start`) ||
    relationStartNode.id.includes(`${relationStart.id}_end`);

  // Binding the relation to the cluster, if we don't make this will bind to start node ellipse
  if (isRelationStartCluster) {
    relationStartNode = getClusterElement(containerEl, relationStart.id);
  }

  if (!relationStartNode || !relationEndNode) {
    throw new Error("Relation nodes not found");
  }

  if (
    !processedNodeRelations.has(relationStartNode.id) &&
    !isRelationStartCluster
  ) {
    const relationStartContainer = createExcalidrawElement(
      relationStartNode,
      containerEl,
      relationStart?.start !== undefined ? "ellipse" : "rectangle",
      relationStart?.start === undefined
        ? {
            label: { text: relationStart.description || relationStart.id },
          }
        : { subtype: "highlight" }
    );

    if (!relationStartContainer.bgColor && relationStart.start) {
      relationStartContainer.bgColor = "#000";
    }

    relationStartContainer.groupId = groupId;
    nodes.push(relationStartContainer);
    processedNodeRelations.add(relationStartNode.id);
  }

  if (
    !processedNodeRelations.has(relationEndNode.id) &&
    !isRelationEndCluster
  ) {
    const relationEndContainer = createExcalidrawElement(
      relationEndNode,
      containerEl,
      relationEnd?.start !== undefined ? "ellipse" : "rectangle",
      relationEnd?.start === undefined
        ? {
            label: { text: relationEnd.description || relationEnd.id },
          }
        : undefined
    );

    relationEndContainer.groupId = groupId;
    nodes.push(relationEndContainer);
    processedNodeRelations.add(relationEndNode.id);

    if (relationEnd?.start === false) {
      const innerEllipse = createInnerEllipseExcalidrawElement(
        relationEndNode,
        {
          x: relationEndContainer.x,
          y: relationEndContainer.y,
          width: relationEndContainer.width!,
          height: relationEndContainer.height!,
        }
      );
      nodes.push(innerEllipse);
    }
  }
};

const parseDoc = (
  doc: ParsedDoc[],
  containerEl: Element,
  nodes: Array<Node> = [],
  processedNodeRelations: Set<string> = new Set<string>(),
  groupId?: string
) => {
  doc.forEach((state) => {
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
    }

    // Relation state
    if (state.stmt === "relation") {
      parseRelation(state, containerEl, nodes, processedNodeRelations, groupId);
    }

    // Composite state
    if (state.stmt === "state" && state?.doc) {
      const clusterElement = getClusterElement(containerEl, state.id);

      const { clusterElementSkeleton, topLine } =
        createClusterExcalidrawElement(clusterElement, containerEl, state);

      nodes.push(clusterElementSkeleton);
      nodes.push(topLine);

      parseDoc(state.doc, containerEl, nodes, processedNodeRelations, state.id);
    }
  });

  return nodes;
};

const parseEdges = (nodes: ParsedDoc[], containerEl: Element): any[] => {
  let rootEdgeIndex = 0;

  function parse(
    nodes: ParsedDoc[],
    retrieveEdgeFromClusterSvg = false,
    clusterId?: string
  ): any[] {
    return nodes.flatMap((node, index) => {
      if (node.stmt === "state" && node?.doc) {
        const clusters = getClusterElement(containerEl, node.id)?.closest(
          ".root"
        );

        const clusterHasOwnEdges = clusters?.hasAttribute("transform");

        return parse(node.doc, clusterHasOwnEdges, node.id);
      } else if (node.stmt === "relation") {
        const startId = node.state1.id;
        const endId = node.state2.id;

        let nodeStartElement = containerEl.querySelector(
          `[data-id*="${startId}"]`
        )!;

        let nodeEndElement = containerEl.querySelector(
          `[data-id*="${endId}"]`
        )!;

        const isClusterStartRelation =
          nodeStartElement.id.includes(`${startId}_start`) ||
          nodeStartElement.id.includes(`${startId}_end`);
        const isClusterEndRelation =
          nodeEndElement.id.includes(`${endId}_end`) ||
          nodeEndElement.id.includes(`${endId}_start`);

        if (isClusterStartRelation) {
          nodeStartElement = containerEl.querySelector(`[id="${startId}"]`)!;
        }

        if (isClusterEndRelation) {
          nodeEndElement = containerEl.querySelector(`[id="${endId}"]`)!;
        }

        const rootContainer = nodeStartElement.closest(".root");

        if (!rootContainer) {
          throw new Error("Root container not found");
        }

        const edges = retrieveEdgeFromClusterSvg
          ? rootContainer.querySelector(".edgePaths")?.children
          : containerEl.querySelector(".edgePaths")?.children;

        if (!edges) {
          throw new Error("Edges not found");
        }

        const edgeStartElement = edges[
          retrieveEdgeFromClusterSvg ? index : rootEdgeIndex
        ] as SVGPathElement;

        const position = computeElementPosition(edgeStartElement, containerEl);
        const edgePositionData = computeEdge2Positions(
          edgeStartElement,
          position
        );

        /**
         * Edge case where cluster don't have the .edgePaths in SVG,
         * so we need to increment the index manually and get from the root container svg
         * */
        rootEdgeIndex++;

        return {
          start: nodeStartElement.id,
          end: nodeEndElement.id,
          groupId: clusterId,
          label: {
            text: node?.description,
          },
          ...edgePositionData,
        };
      }

      // This is neither a "state" node nor a "relation" node. Return an empty array.
      return [];
    });
  }

  return parse(nodes);
};

export const parseMermaidStateDiagram = (
  diagram: Diagram,
  containerEl: Element
): State => {
  diagram.parse();

  // Get mermaid parsed data from parser shared variable `yy`
  //@ts-ignore
  const mermaidParser = diagram.parser.yy;
  // const nodes: Array<Node> = [];
  const rootDocV2 = mermaidParser.getRootDocV2();

  console.debug({
    document: rootDocV2,
    mermaidParser,
    states: mermaidParser.getStates(),
    relations: mermaidParser.getRelations(),
    classes: mermaidParser.getClasses(),
    logDocuments: mermaidParser.logDocuments(),
  });

  const nodes = parseDoc(rootDocV2.doc, containerEl);
  const edges = parseEdges(rootDocV2.doc, containerEl);

  return { type: "state", nodes, edges };
};
