import { computeExcalidrawArrowType } from "./utils";

// TODO: update types
// TODO: support grouping with new API
// TODO: refactor grouping algorithm

interface GraphToExcalidrawOptions {
  fontSize?: number;
}
export const graphToExcalidraw = (
  graph,
  options: GraphToExcalidrawOptions = {}
) => {
  // Adjust size for Virgil font
  // Note: I've tried changing the mermaid default font to Vergil so that I can use the same font size when converting to excalidraw,
  // but there is a text overflow problem when rendering on Mermaid.
  // So I manually decrease the Excalidraw font size by multiplying it by some number.
  const fontSize = (options.fontSize || 16) * 0.75;

  const elements: any = [];
  // parse the diagram into a tree for rendering and grouping
  const diagramTree = {}; // element: parent, isLeaf (type = vertex)
  graph.clusters.map((cluster) => {
    cluster.nodes.forEach((e) => {
      diagramTree[cluster.id] = {
        id: cluster.id,
        parent: null,
        isLeaf: false,
      };
      diagramTree[e] = {
        id: e,
        parent: cluster.id,
        isLeaf: graph.vertices[e] !== undefined,
      };
    });
  });
  const groupMapper = {}; // key = vertexId, value = groupId[]
  [...Object.keys(graph.vertices), ...graph.clusters.map((c) => c.id)].forEach(
    (id) => {
      if (!diagramTree[id]) return;
      let curr = diagramTree[id];
      const groupIds: any = [];
      if (!curr.isLeaf) groupIds.push(`cluster_group_${curr.id}`);

      while (true) {
        if (curr.parent) {
          groupIds.push(`cluster_group_${curr.parent}`);
          curr = diagramTree[curr.parent];
        } else {
          break;
        }
      }
      groupMapper[id] = groupIds;
    }
  );

  // Clusters
  graph.clusters.reverse().forEach((cluster) => {
    const groupIds = groupMapper[cluster.id] ? groupMapper[cluster.id] : [];

    const containerElement = {
      type: "rectangle",
      groupIds,
      x: cluster.x,
      y: cluster.y,
      width: cluster.width,
      height: cluster.height,
      label: {
        groupIds,
        text: cluster.title,
        fontSize: fontSize,
        verticalAlign: "top",
      },
    };

    elements.push(containerElement);
  });

  // Vertices
  Object.values(graph.vertices).forEach((vertex: any) => {
    const groupIds = groupMapper[vertex.id] ? groupMapper[vertex.id] : [];

    const containerElement = {
      id: vertex.id,
      type: "rectangle",
      groupIds,
      x: vertex.x,
      y: vertex.y,
      width: vertex.width,
      height: vertex.height,
      strokeWidth: 2,
      ...((vertex.type === "round" || vertex.type === "stadium") && {
        roundness: { type: 3 },
      }),
      label: {
        groupIds,
        text: vertex.text,
        fontSize: fontSize,
      },
      link: vertex.link || undefined,
    };

    if (vertex.type === "doublecircle") {
      // Create new groupId for double circle
      groupIds.push(`doublecircle_${vertex.id}}`);
      const innerCircle = {
        type: "ellipse",
        groupIds,
        x: vertex.x + 5,
        y: vertex.y + 5,
        width: vertex.width - 10,
        height: vertex.height - 10,
        strokeWidth: 2,
        ...(vertex.type === "round" && { roundness: { type: 3 } }),
        label: {
          groupIds,
          text: vertex.text,
          fontSize: fontSize,
        },
      };
      containerElement.label = undefined;
      containerElement.groupIds = groupIds;
      containerElement.type = "ellipse";
      elements.push(innerCircle);
    }
    if (vertex.type === "circle") {
      containerElement.type = "ellipse";
    }
    if (vertex.type === "diamond") {
      containerElement.type = "diamond";
    }

    elements.push(containerElement);
  });

  // Edges
  graph.edges.forEach((edge) => {
    let groupIds = [];
    if (
      diagramTree[edge.start] &&
      diagramTree[edge.end] &&
      diagramTree[edge.start].parent !== null &&
      diagramTree[edge.start].parent === diagramTree[edge.end].parent
    ) {
      const parent = diagramTree[edge.start].parent;
      groupIds = groupMapper[parent] ? groupMapper[parent] : [];
    }

    // calculate arrow position
    const { startX, startY, endX, endY, reflectionPoints } = edge;

    // calculate arrow points
    const points = reflectionPoints.map((point) => [
      point.x - reflectionPoints[0].x,
      point.y - reflectionPoints[0].y,
    ]);

    // support arrow types
    const arrowType = computeExcalidrawArrowType(edge.type);

    const arrowId = `${edge.start}_${edge.end}`;
    const containerElement: any = {
      id: arrowId,
      type: "arrow",
      groupIds,
      x: startX,
      y: startY,
      x2: endX,
      y2: endY,
      strokeWidth: edge.stroke === "thick" ? 4 : 2,
      strokeStyle: edge.stroke === "dotted" ? "dashed" : undefined,
      points: points,
      ...(edge.text
        ? { label: { text: edge.text, fontSize: fontSize, groupIds } }
        : {}),
      roundness: {
        type: 2,
      },
      ...arrowType,
    };

    const startVertex: any = elements.find((e: any) => e.id === edge.start);
    const endVertex: any = elements.find((e: any) => e.id === edge.end);
    containerElement.start = {
      id: startVertex.id,
    };
    containerElement.end = {
      id: endVertex.id,
    };

    elements.push(containerElement);
  });

  return elements;
};
