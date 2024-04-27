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

export interface StateRoot {
  description?: string;
  [state: `state${number}`]: {
    description: string;
    id: string;
    start?: boolean;
    stmt: string;
    type: string;
  };
  stmt: "relation";
}

export interface SingleState {
  stmt: "state";
  description: string;
  id: string;
  type: string;
}

export type ParsedDoc = SingleState | StateRoot;

const parseRelations = (data: ParsedDoc[], containerEl: Element) => {
  const nodes: Array<Node> = [];
  const parsedIds = new Set<string>();

  data.forEach((state) => {
    const isSingleState = state.stmt === "state";

    if (isSingleState) {
      const node1 = containerEl.querySelector<SVGSVGElement>(
        `[data-id="${state.id}"]`
      )!;

      const node1Position = computeElementPosition(node1, containerEl);

      const node1Element = createContainerSkeletonFromSVG(
        node1,
        "rectangle",

        {
          id: node1.id,
          label: {
            text: state.description || state.id,
          },
        }
      );

      node1Element.x = node1Position.x;
      node1Element.y = node1Position.y;

      nodes.push(node1Element);

      return;
    }

    const state1 = state.state1;
    const state2 = state.state2;

    const relationId = [state1.id, state2.id].sort().join("-");

    if (parsedIds.has(relationId)) {
      return;
    }

    const node1 = containerEl.querySelector<SVGSVGElement>(
      `[data-id="${state1.id}"]`
    );
    const node2 = containerEl.querySelector<SVGSVGElement>(
      `[data-id="${state2.id}"]`
    );

    if (!node1 || !node2) {
      throw new Error("State node not found");
    }

    if (!parsedIds.has(node1.id)) {
      const node1Element = createContainerSkeletonFromSVG(
        node1,
        state1?.start !== undefined ? "ellipse" : "rectangle",
        state1?.start === undefined
          ? {
              id: node1.id,
              label: {
                text: state1.description || state1.id,
              },
            }
          : {
              id: node1.id,
              subtype: "highlight",
            }
      );

      const node1Position = computeElementPosition(node1, containerEl);
      node1Element.x = node1Position.x;
      node1Element.y = node1Position.y;

      if (!node1Element.bgColor && state1.start) {
        node1Element.bgColor = "#000";
      }

      nodes.push(node1Element);
      parsedIds.add(node1.id);
    }

    if (!parsedIds.has(node2.id)) {
      const node2Element = createContainerSkeletonFromSVG(
        node2,
        state2?.start !== undefined ? "ellipse" : "rectangle",
        state2?.start === undefined
          ? {
              id: node2.id,
              label: {
                text: state2.description || state2.id,
              },
            }
          : {
              id: node2.id,
              groupId: node2.id,
            }
      );
      const node2Position = computeElementPosition(node2, containerEl);

      node2Element.x = node2Position.x;
      node2Element.y = node2Position.y;

      if (state2.id === "root_end") {
        const innerEllipse = createContainerSkeletonFromSVG(node2, "ellipse", {
          id: `${node2.id}-inner`,
          groupId: node2.id,
        });

        innerEllipse.width = 4;
        innerEllipse.height = 4;

        innerEllipse.x =
          node2Position.x +
          (node2Element.width as number) / 2 -
          innerEllipse.width / 2;
        innerEllipse.y =
          node2Position.y +
          (node2Element.height as number) / 2 -
          innerEllipse.height / 2;
        innerEllipse.strokeColor = "black";
        innerEllipse.bgColor = "black";

        nodes.push(innerEllipse);
      }

      nodes.push(node2Element);

      parsedIds.add(node2.id);
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
