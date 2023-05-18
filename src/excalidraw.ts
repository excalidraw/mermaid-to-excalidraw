// TODO: support arrow binding with new API
// TODO: support grouping with new API

interface GraphToExcalidrawOptions {
  fontSize?: number;
}
export const graphToExcalidraw = (
  graph,
  options: GraphToExcalidrawOptions = {}
) => {
  // Adjust size for Vergil font (x0.75)
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
      type: "rectangle",
      groupIds,
      x: vertex.x,
      y: vertex.y,
      width: vertex.width,
      height: vertex.height,
      strokeWidth: 2,
      ...(vertex.type === "round" && { roundness: { type: 3 } }),
      label: {
        groupIds,
        text: vertex.text,
        fontSize: fontSize,
      },
    };

    if (vertex.type === "circle" || vertex.type === "doublecircle") {
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
    const arrowId = `${edge.start}_${edge.end}`;
    // calculate arrow points
    const points = reflectionPoints.map((point) => [
      point.x - reflectionPoints[0].x,
      point.y - reflectionPoints[0].y,
    ]);

    // support arrow types
    const arrowType: any = {};
    if (edge.type === "arrow_circle") {
      arrowType.endArrowhead = "dot";
    } else if (edge.type === "arrow_cross") {
      arrowType.endArrowhead = "bar";
    } else if (edge.type === "double_arrow_circle") {
      arrowType.endArrowhead = "dot";
      arrowType.startArrowhead = "dot";
    } else if (edge.type === "double_arrow_cross") {
      arrowType.endArrowhead = "bar";
      arrowType.startArrowhead = "bar";
    } else if (edge.type === "double_arrow_point") {
      arrowType.endArrowhead = "arrow";
      arrowType.startArrowhead = "arrow";
    }

    const containerElement: any = {
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

    // bound arrow to vertex
    const startV: any = elements.find((e: any) => e.id === edge.start);
    const endV: any = elements.find((e: any) => e.id === edge.end);
    // if (!startV.boundElements) startV.boundElements = [];
    // startV.boundElements.push({
    //   type: "arrow",
    //   id: arrowId,
    // });
    // if (!endV.boundElements) endV.boundElements = [];
    // endV.boundElements.push({
    //   type: "arrow",
    //   id: arrowId,
    // });
    // const startFocusAndGap = ExcalidrawLib.calculateFocusAndGap(
    //   containerElement,
    //   startV,
    //   "start"
    // );
    // const endFocusAndGap = ExcalidrawLib.calculateFocusAndGap(
    //   containerElement,
    //   endV,
    //   "end"
    // );
    // containerElement.startBinding = {
    //   elementId: startV.id,
    //   ...startFocusAndGap,
    // };
    // containerElement.endBinding = {
    //   elementId: endV.id,
    //   ...endFocusAndGap,
    // };

    elements.push(containerElement);
  });

  return elements;
};
