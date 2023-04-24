export const parseRoot = (graph, containerEl) => {
  const vertices = graph.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });
  const edges = graph.getEdges().map((e) => parseEdge(e, containerEl));
  const clusters = graph
    .getSubGraphs()
    .map((c) => parseCluster(c, containerEl));

  return {
    clusters,
    vertices,
    edges,
  };
};

// {
//   "id": "B1",
//   "nodes": [
//     "flowchart-f1-506",
//     "flowchart-i1-505"
//   ],
//   "title": "B1",
//   "dir": "RL",
//   "labelType": "text"
// },
export const parseCluster = (node, containerEl) => {
  const el = containerEl.querySelector("#" + node.id);

  let dimention;
  const root = el.parentElement.parentElement;
  if (root.classList.value === "root" && root.hasAttribute("transform")) {
    const style = getComputedStyle(root);
    const matrix = new DOMMatrixReadOnly(style.transform);
    dimention = {
      x: matrix.m41,
      y: matrix.m42,
    };
  } else {
    const rect = el.querySelector("rect");
    dimention = {
      x: +(rect.getAttribute("x") || 0),
      y: +(rect.getAttribute("y") || 0),
    };
  }

  // const style = getComputedStyle(el);
  // const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = el.getBoundingClientRect();
  const nodes = node.nodes.map((n) => {
    if (n.startsWith("flowchart-")) {
      return n.split("-")[1];
    }
    return n;
  });

  return {
    ...node,
    nodes,
    classes: undefined,
    dir: undefined,
    ...dimention,
    width: rect.width,
    height: rect.height,
  };
};

// "vertices": {
//   "Start": {
//     "id": "Start",
//     "labelType": "text",
//     "domId": "flowchart-Start-14",
//     "styles": [],
//     "classes": [],
//     "text": "Start",
//     "props": {}
//   },
//   "Stop": {
//     "id": "Stop",
//     "labelType": "text",
//     "domId": "flowchart-Stop-15",
//     "styles": [],
//     "classes": [],
//     "text": "Stop",
//     "props": {}
//   }
// }
export const parseVertice = (v, containerEl) => {
  const el = containerEl.querySelector(`[id*="flowchart-${v.id}"]`);
  // if element not found (mean el = cluster), ignore
  if (!el) return;

  let link;
  if (el.parentElement.tagName.toLowerCase() === "a")
    link = el.parentElement.getAttribute("xlink:href");

  const rect = el.getBoundingClientRect();
  const root = el.parentElement.parentElement;
  const style = getComputedStyle(link ? el.parentElement : el);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const position = {
    x: matrix.m41 - rect.width / 2,
    y: matrix.m42 - rect.height / 2,
  };
  if (root.classList.value === "root" && root.hasAttribute("transform")) {
    const style = getComputedStyle(root);
    const matrix = new DOMMatrixReadOnly(style.transform);
    position.x += matrix.m41;
    position.y += matrix.m42;
  }

  return {
    id: v.id,
    labelType: v.labelType, // text, markdown
    text: v.text,
    type: v.type,
    link,
    ...position,
    width: rect.width,
    height: rect.height,
  };
};

// {
//   "start": "A",
//   "end": "B",
//   "type": "arrow_point",
//   "text": "text",
//   "labelType": "text",
//   "stroke": "thick",
//   "length": 1
// }
export const parseEdge = (node, containerEl) => {
  node.length = undefined;
  function extractPositions(pathElement, offset = { x: 0, y: 0 }) {
    if (pathElement.tagName.toLowerCase() !== "path") {
      throw new Error(
        'Invalid input: Expected an HTMLElement of tag "path", got ' +
          pathElement.tagName
      );
    }

    const dAttribute = pathElement.getAttribute("d");
    if (!dAttribute) {
      throw new Error('Path element does not contain a "d" attribute');
    }

    const commands = dAttribute.split(/(?=[LM])/);
    const startPosition = commands[0]
      .substring(1)
      .split(",")
      .map((coord) => parseFloat(coord));
    const endPosition = commands[commands.length - 1]
      .substring(1)
      .split(",")
      .map((coord) => parseFloat(coord));
    const reflectionPoints = commands
      .map((command) => {
        const coords = command
          .substring(1)
          .split(",")
          .map((coord) => parseFloat(coord));
        return { x: coords[0], y: coords[1] };
      })
      .filter((point, index, array) => {
        if (index === array.length - 1) {
          return true;
        }

        const prevPoint = array[index - 1];
        return (
          index === 0 || (point.x !== prevPoint.x && point.y !== prevPoint.y)
        );
      })
      .map((p) => {
        return {
          x: p.x + offset.x,
          y: p.y + offset.y,
        };
      });

    return {
      startX: startPosition[0] + offset.x,
      startY: startPosition[1] + offset.y,
      endX: endPosition[0] + offset.x,
      endY: endPosition[1] + offset.y,
      reflectionPoints,
    };
  }

  const el = containerEl.querySelector(`[id*="L-${node.start}-${node.end}"]`);

  let offset;
  const root = el.parentElement.parentElement;
  if (root.classList.value === "root" && root.hasAttribute("transform")) {
    const style = getComputedStyle(root);
    const matrix = new DOMMatrixReadOnly(style.transform);
    offset = {
      x: matrix.m41,
      y: matrix.m42,
    };
  }

  const position = extractPositions(el, offset);

  return {
    ...node,
    ...position,
  };
};

// Excalidraw
export function jsonToExcalidraw(json) {
  const elements = [];

  json.clusters.forEach((cluster) => {
    elements.push({
      type: "rectangle",
      id: cluster.id,
      x: cluster.x,
      y: cluster.y,
      fillStyle: "solid",
      width: cluster.width,
      height: cluster.height,
      strokeColor: "#495057",
      backgroundColor: "transparent",
      strokeWidth: 1,
      roughness: 1,
      opacity: 100,
      boundElements: [
        {
          type: "text",
          id: `${cluster.id}_title`,
        },
      ],
    });

    elements.push({
      id: `${cluster.id}_title`,
      containerId: cluster.id,
      type: "text",
      strokeColor: "black",
      backgroundColor: "transparent",
      text: cluster.title,
      originalText: cluster.title,
      width: 5 * cluster.title.length,
      height: 18,
      fontSize: 14,
      fontFamily: 1,
      lineHeight: 1.25,
      textAlign: "center",
      verticalAlign: "top",
      x: cluster.x + cluster.width / 2,
      y: cluster.y,
      opacity: 100,
    });
  });

  Object.values(json.vertices).forEach((vertex) => {
    const textElement = {
      id: `${vertex.id}_text`,
      type: "text",
      strokeColor: "black",
      backgroundColor: "transparent",
      text: vertex.text,
      originalText: vertex.text,
      width: 5 * vertex.text.length,
      height: 18,
      fontSize: 14,
      fontFamily: 1,
      lineHeight: 1.25,
      textAlign: "center",
      verticalAlign: "center",
      containerId: vertex.id,
      x: vertex.x + vertex.width / 2,
      y: vertex.y + 10,
      opacity: 100,
    };

    const containerElement = {
      type: "rectangle",
      id: vertex.id,
      x: vertex.x,
      y: vertex.y,
      width: vertex.width,
      height: vertex.height,
      strokeColor: "black",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      boundElements: [
        {
          type: "text",
          id: textElement.id,
        },
      ],
    };

    if (vertex.type === "circle" || vertex.type === "doublecircle") {
      containerElement.type = "ellipse";
    }
    if (vertex.type === "diamond") {
      containerElement.type = "diamond";
    }

    elements.push(containerElement);
    elements.push(textElement);
  });

  json.edges.forEach((edge) => {
    // calculate arrow position
    const { startX, startY, endX, endY, reflectionPoints } = edge;
    const arrowId = `${edge.start}_${edge.end}`;
    // calculate reflection point
    const points = reflectionPoints.map((point) => [
      point.x - reflectionPoints[0].x,
      point.y - reflectionPoints[0].y,
    ]);

    let textElement;
    if (edge.text) {
      textElement = {
        id: `${arrowId}_text`,
        type: "text",
        strokeColor: "black",
        backgroundColor: "transparent",
        text: edge.text,
        originalText: edge.text,
        width: 5 * edge.text.length,
        height: 18,
        fontSize: 14,
        fontFamily: 1,
        lineHeight: 1.25,
        textAlign: "center",
        verticalAlign: "center",
        containerId: arrowId,
        x: startX + (endX - startX) / 2,
        y: startY + (endY - startY) / 2,
        opacity: 100,
      };
    }

    const containerElement = {
      type: "arrow",
      id: arrowId,
      x: startX,
      y: startY,
      x2: endX,
      y2: endY,
      strokeColor: "black",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      strokeLinejoin: "round",
      strokeLinecap: "round",
      points: points,
      roundness: {
        type: 2,
      },
      ...(textElement
        ? { boundElements: [{ type: "text", id: textElement.id }] }
        : {}),
    };

    // bound arrow to vertex
    const startV = elements.find((e) => e.id === edge.start);
    const endV = elements.find((e) => e.id === edge.end);
    if (!startV.boundElements) startV.boundElements = [];
    startV.boundElements.push({
      type: "arrow",
      id: arrowId,
    });
    if (!endV.boundElements) endV.boundElements = [];
    endV.boundElements.push({
      type: "arrow",
      id: arrowId,
    });
    // TODO: calculate focus and gap
    containerElement.startBinding = {
      elementId: startV.id,
      focus: 0.2717252745455439,
      gap: 6.261578457263113,
    };
    containerElement.endBinding = {
      elementId: endV.id,
      focus: 0.2717252745455439,
      gap: 6.261578457263113,
    };

    elements.push(containerElement);
    if (textElement) elements.push(textElement);
  });

  return ExcalidrawLib.restoreElements(elements, null);
}
