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

  const style = getComputedStyle(link ? el.parentElement : el);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = el.getBoundingClientRect();

  return {
    id: v.id,
    labelType: v.labelType, // text, markdown
    text: v.text,
    type: v.type,
    link,
    x: matrix.m41,
    y: matrix.m42,
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
  function extractPositions(pathElement) {
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

    return {
      startX: startPosition[0],
      startY: startPosition[1],
      endX: endPosition[0],
      endY: endPosition[1],
    };
  }

  const el = containerEl.querySelector(`[id*="L-${node.start}-${node.end}"]`);
  const position = extractPositions(el);

  return {
    ...node,
    ...position,
  };
};

// Excalidraw
export function jsonToExcalidraw(json) {
  const elements = [];

  // json.clusters.forEach((cluster) => {
  //   elements.push({
  //     type: "rectangle",
  //     id: cluster.id,
  //     x: cluster.x,
  //     y: cluster.y,
  //     width: cluster.width,
  //     height: cluster.height,
  //     strokeColor: "black",
  //     backgroundColor: "transparent",
  //     strokeWidth: 2,
  //     roughness: 1,
  //     opacity: 100,
  //   });

  //   elements.push({
  //     type: "text",
  //     id: `${cluster.id}_title`,
  //     x: cluster.x + cluster.width / 2,
  //     y: cluster.y + 10,
  //     text: cluster.title,
  //     fontSize: 20,
  //     fontFamily: 1,
  //     textAlign: "center",
  //     verticalAlign: "top",
  //     strokeColor: "black",
  //     backgroundColor: "transparent",
  //     strokeWidth: 1,
  //     roughness: 0,
  //     opacity: 100,
  //   });
  // });

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

    elements.push(containerElement);
    elements.push(textElement);
  });

  json.edges.forEach((edge) => {
    const vStart = json.vertices[edge.start];
    const vEnd = json.vertices[edge.end];
    const startX = edge.startX + vStart.width / 2;
    const startY = edge.startY + vStart.height / 2;
    const endX = edge.endX + vEnd.width / 2;
    const endY = edge.endY + vEnd.height / 2;
    const arrowId = `${edge.start}_${edge.end}`;

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
      points: [
        [0, 0],
        [endX - startX, endY - startY],
      ],
      ...(textElement
        ? { boundElements: [{ type: "text", id: textElement.id }] }
        : {}),
    };

    elements.push(containerElement);
    if (textElement) elements.push(textElement);
  });

  return ExcalidrawLib.restoreElements(elements, null);
}
