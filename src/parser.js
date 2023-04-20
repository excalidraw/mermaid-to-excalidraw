// TODO: transform dimention, create elements relationship e.g. node, arrow, cluster
export const parseRoot = (graph, containerEl) => {
  const vertices = graph.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });

  const edges = graph.getEdges().map(parseEdge);

  // const clusters = [...node.querySelector(".clusters").childNodes].map(
  //   parseCluster
  // );
  // const edgePaths = [...node.querySelector(".edgePaths").childNodes].map(
  //   parseEdge
  // );
  // const edgeLabels = [...node.querySelector(".edgeLabels").childNodes]
  //   .map(parseLabel)
  //   .filter((label) => label.textContent.length !== 0);

  return {
    vertices,
    edges,
    // clusters,
    // edgePaths,
    // edgeLabels,
  };
};

export const parseCluster = (node) => {
  const rect = node.querySelector("rect");

  return {
    id: node.id,
    type: "cluster",
    width: +(rect.getAttribute("width") || 0),
    height: +(rect.getAttribute("height") || 0),
    x: +(rect.getAttribute("x") || 0),
    y: +(rect.getAttribute("y") || 0),
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

  let link;
  if (el && el.parentElement.tagName.toLowerCase() === "a")
    link = el.parentElement.getAttribute("xlink:href");

  let coords = {};
  if (el) {
    const style = getComputedStyle(el);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const rect = el.getBoundingClientRect();
    coords = {
      x: matrix.m41,
      y: matrix.m42,
      width: rect.width,
      height: rect.height,
    };
  }

  return {
    id: v.id,
    labelType: v.labelType, // text, markdown
    text: v.text,
    type: v.type,
    link,
    ...coords,
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
export const parseEdge = (node) => {
  node.length = undefined;
  return node;
};
