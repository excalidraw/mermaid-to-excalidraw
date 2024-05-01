import type { Diagram } from "mermaid/dist/Diagram.js";
import {
  type Container,
  type Line,
  type Node,
  createContainerSkeletonFromSVG,
} from "../elementSkeleton.js";
import { computeEdgePositions, computeElementPosition } from "../utils.js";
import type { Edge } from "./flowchart.js";

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
    type: "default";
  };
  stmt: "relation";
}

export interface CompositeState {
  doc: Array<ParsedDoc>;
  description: string;
  id: string;
  type: "default";
  stmt: "state";
}

export interface SingleState {
  description: string;
  id: string;
  type: "default";
  stmt: "state";
}

export interface NoteState {
  id: string;
  note: {
    position: string;
    text: string;
  };
  stmt: "state";
}

export interface SpecialState {
  id: string;
  type: "choice";
  stmt: "state";
}

export type ParsedDoc =
  | NoteState
  | SpecialState
  | SingleState
  | CompositeState
  | RelationState;

const MARGIN_TOP_LINE_X_AXIS = 25;

const isNoteState = (node: ParsedDoc): node is NoteState => {
  return node.stmt === "state" && "note" in node;
};

const isCompositeState = (node: ParsedDoc): node is CompositeState => {
  return node.stmt === "state" && "doc" in node;
};

const isSingleState = (node: ParsedDoc): node is SingleState => {
  return (
    node.stmt === "state" &&
    "doc" in node === false &&
    "type" in node &&
    node.type === "default"
  );
};

const isSpecialState = (node: ParsedDoc): node is SpecialState => {
  return node.stmt === "state" && "type" in node && node.type !== "default";
};

const isRelationState = (node: ParsedDoc): node is RelationState => {
  return node.stmt === "relation";
};

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
  state: Extract<ParsedDoc, { stmt: "state"; type: "default" }>
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
  specialTypes: Record<string, unknown>,
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
    !processedNodeRelations.has(relationStart.id) &&
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

    if (specialTypes[relationStart.id]) {
      relationStartContainer.type = "diamond";
      relationStartContainer.label = undefined;
    }

    if (!relationStartContainer.bgColor && relationStart.start) {
      relationStartContainer.bgColor = "#000";
    }

    relationStartContainer.groupId = groupId;
    nodes.push(relationStartContainer);
    processedNodeRelations.add(relationStart.id);
  }

  if (!processedNodeRelations.has(relationEnd.id) && !isRelationEndCluster) {
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
    processedNodeRelations.add(relationEnd.id);

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

    if (specialTypes[relationEnd.id]) {
      relationEndContainer.type = "diamond";
      relationEndContainer.label = undefined;
    }
  }
};

const parseDoc = (
  doc: ParsedDoc[],
  containerEl: Element,
  nodes: Array<Node> = [],
  processedNodeRelations: Set<string> = new Set<string>(),
  specialTypes: Record<string, unknown> = {},
  groupId?: string
) => {
  doc.forEach((state) => {
    if (isSingleState(state)) {
      console.debug(state);
      const singleStateNode = containerEl.querySelector<SVGSVGElement>(
        `[data-id="${state.id}"]`
      )!;

      const stateElement = createExcalidrawElement(
        singleStateNode,
        containerEl,
        "rectangle",
        { label: { text: state.description || state.id } }
      );

      processedNodeRelations.add(state.id);
      nodes.push(stateElement);
    }

    if (isSpecialState(state)) {
      specialTypes[state.id] = state;
      return;
    }

    if (isRelationState(state)) {
      parseRelation(
        state,
        containerEl,
        nodes,
        processedNodeRelations,
        specialTypes,
        groupId
      );
    }

    if (isCompositeState(state)) {
      const clusterElement = getClusterElement(containerEl, state.id);

      const { clusterElementSkeleton, topLine } =
        createClusterExcalidrawElement(clusterElement, containerEl, state);

      nodes.push(clusterElementSkeleton);
      nodes.push(topLine);

      parseDoc(
        state.doc,
        containerEl,
        nodes,
        processedNodeRelations,
        specialTypes,
        state.id
      );
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
    return nodes
      .filter((node) => {
        return (
          isCompositeState(node) || isRelationState(node) || isNoteState(node)
        );
      })
      .flatMap((node, index) => {
        if (isCompositeState(node)) {
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

          const position = computeElementPosition(
            edgeStartElement,
            containerEl
          );
          const edgePositionData = computeEdgePositions(
            edgeStartElement,
            position,
            "MC"
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

        if (isNoteState(node)) {
          rootEdgeIndex++;
        }

        return [];
      });
  }

  return parse(nodes);
};

const parseNotes = (doc: ParsedDoc[], containerEl: Element) => {
  let rootIndex = 0;
  const noteIndex: Record<string, number> = {};
  const notes: Container[] = [];
  const edges: Partial<Edge>[] = [];

  const processNote = (state: NoteState): [Container, Partial<Edge>] => {
    if (!noteIndex[state.id]) {
      noteIndex[state.id] = 0;
    }
    const noteNodes = Array.from(
      containerEl.querySelectorAll<SVGSVGElement>(
        `[data-id*="${state.id}----note"]`
      )
    );

    const noteNode = noteNodes[noteIndex[state.id]];

    const noteElement = createExcalidrawElement(
      noteNode,
      containerEl,
      "rectangle",
      {
        label: { text: state.note.text },
        id: noteNode.id,
        subtype: "note",
      }
    );

    const rootContainer = noteNode.closest(".root")!;

    const edge = rootContainer.querySelector(".edgePaths")?.children[
      rootIndex
    ] as SVGPathElement;

    const position = computeElementPosition(edge, containerEl);

    const edgePositionData = computeEdgePositions(edge, position, "MCL");

    let startNode = rootContainer.querySelector<SVGSVGElement>(
      `[data-id*="${state.id}"]:not([data-id*="note"])`
    )!;

    const isClusterStartRelation =
      startNode.id.includes(`_start`) || startNode.id.includes(`_end`);

    if (isClusterStartRelation) {
      startNode = getClusterElement(containerEl, state.id);
    }

    const edgeElement: Partial<Edge> = {
      start: startNode.id,
      end: noteNode.id,
      ...edgePositionData,
    };

    if (state.note.position.includes("left")) {
      edgeElement.end = startNode.id;
      edgeElement.start = noteNode.id;
    }

    noteIndex[state.id]++;
    return [noteElement, edgeElement];
  };

  doc
    .filter(
      (state) =>
        isNoteState(state) || isCompositeState(state) || isRelationState(state)
    )
    .flatMap((state) => {
      if (isNoteState(state)) {
        const [noteElement, edgeElement] = processNote(state);

        rootIndex++;
        notes.push(noteElement);
        edges.push(edgeElement);
      }

      if (isCompositeState(state)) {
        const { notes: compositeNotes, edges: compositeEdges } = parseNotes(
          state.doc,
          containerEl
        );
        notes.push(...compositeNotes);
        edges.push(...compositeEdges);
      }

      if (isRelationState(state)) {
        rootIndex++;
      }
    });

  return { notes, edges };
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

  const { notes, edges: edgeNotes } = parseNotes(rootDocV2.doc, containerEl);

  nodes.push(...notes);
  edges.push(...edgeNotes);

  return { type: "state", nodes, edges };
};
