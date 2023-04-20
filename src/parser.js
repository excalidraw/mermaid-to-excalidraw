// TODO: transform dimention, create elements relationship e.g. node, arrow, cluster
export const parseRoot = (graph, containerEl) => {
  const vertices = graph.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });
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
  if (el.parentElement.tagName.toLowerCase() === "a")
    link = el.parentElement.getAttribute("xlink:href");

  const style = getComputedStyle(el);
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

export const parseEdge = (node) => {
  const edgeType = node.classList[1];

  return {
    id: node.id,
    type: "edge",
    edgeType,
    // start: "",
    // end: "",
  };
};

export const parseLabel = (node) => {
  const style = getComputedStyle(node);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = node.getBoundingClientRect();

  return {
    id: node.id,
    type: "label",
    // x: matrix.m41,
    // y: matrix.m42,
    // width: rect.width,
    // height: rect.height,
    textContent: node.textContent,
  };
};
