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
      id: cluster.id,
      // groupIds,
      x: cluster.x,
      y: cluster.y,
      width: cluster.width,
      height: cluster.height,
      strokeColor: "#495057",
      label: {
        text: cluster.title,
        fontSize: fontSize,
        textAlign: "center",
        verticalAlign: "top",
      },
      // boundElements: [
      //   {
      //     type: "text",
      //     id: `${cluster.id}_title`,
      //   },
      // ],
    };

    // const textElement = {
    //   id: `${cluster.id}_title`,
    //   containerId: cluster.id,
    //   groupIds,
    //   type: "text",
    //   strokeColor: "black",
    //   backgroundColor: "transparent",
    //   text: cluster.title,
    //   originalText: cluster.title,
    //   width: 5 * cluster.title.length,
    //   height: 18,
    //   fontSize,
    //   fontFamily: 1,
    //   lineHeight: 1.25,
    //   textAlign: "center",
    //   verticalAlign: "top",
    //   x: cluster.x + cluster.width / 2,
    //   y: cluster.y,
    //   opacity: 100,
    // };

    // ExcalidrawLib.redrawTextBoundingBox(textElement, containerElement);
    elements.push(containerElement);
    // elements.push(textElement);
  });

  // Vertices
  Object.values(graph.vertices).forEach((vertex: any) => {
    const groupIds = groupMapper[vertex.id] ? groupMapper[vertex.id] : [];

    // const textElement = {
    //   id: `${vertex.id}_text`,
    //   groupIds,
    //   type: "text",
    //   strokeColor: "black",
    //   backgroundColor: "transparent",
    //   text: vertex.text,
    //   originalText: vertex.text,
    //   fontSize,
    //   fontFamily: 1,
    //   lineHeight: 1.25,
    //   textAlign: "center",
    //   verticalAlign: "center",
    //   containerId: vertex.id,
    //   x: vertex.x + vertex.width / 2,
    //   y: vertex.y + 10,
    //   opacity: 100,
    // };

    const containerElement = {
      type: "rectangle",
      id: vertex.id,
      // groupIds,
      x: vertex.x,
      y: vertex.y,
      width: vertex.width,
      height: vertex.height,
      strokeWidth: 2,
      ...(vertex.type === "round" && { roundness: { type: 3 } }),
      // boundElements: [
      //   {
      //     type: "text",
      //     id: textElement.id,
      //   },
      // ],
      label: {
        text: vertex.text,
        fontSize: fontSize,
      },
    };

    // ExcalidrawLib.redrawTextBoundingBox(textElement, containerElement);

    if (vertex.type === "circle" || vertex.type === "doublecircle") {
      containerElement.type = "ellipse";
    }
    if (vertex.type === "diamond") {
      containerElement.type = "diamond";
    }

    elements.push(containerElement);
    // elements.push(textElement);
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
    // calculate reflection point
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

    // let textElement;
    // if (edge.text) {
    //   textElement = {
    //     id: `${arrowId}_text`,
    //     groupIds,
    //     type: "text",
    //     strokeColor: "black",
    //     backgroundColor: "transparent",
    //     text: edge.text,
    //     originalText: edge.text,
    //     width: 5 * edge.text.length,
    //     height: 18,
    //     fontSize,
    //     fontFamily: 1,
    //     lineHeight: 1.25,
    //     textAlign: "center",
    //     verticalAlign: "center",
    //     containerId: arrowId,
    //     x: startX + (endX - startX) / 2,
    //     y: startY + (endY - startY) / 2,
    //     opacity: 100,
    //   };
    // }

    const containerElement: any = {
      type: "arrow",
      id: arrowId,
      // groupIds,
      x: startX,
      y: startY,
      x2: endX,
      y2: endY,
      strokeColor: "black",
      backgroundColor: "transparent",
      strokeWidth: edge.stroke === "thick" ? 4 : 2,
      // strokeLinejoin: "round",
      // strokeLinecap: "round",
      strokeStyle: edge.stroke === "dotted" ? "dashed" : undefined,
      points: points,
      ...(edge.text ? { label: { text: edge.text, fontSize: fontSize } } : {}),
      roundness: {
        type: 2,
      },
      // ...(textElement
      //   ? { boundElements: [{ type: "text", id: textElement.id }] }
      //   : {}),
      ...arrowType,
    };

    // if (textElement)
    //   ExcalidrawLib.redrawTextBoundingBox(textElement, containerElement);

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
    // if (textElement) elements.push(textElement);
  });

  return elements;
};
