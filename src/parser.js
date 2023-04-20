export const parseRoot = (graph, containerEl) => {
  const vertices = graph.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });
  const edges = graph.getEdges().map(parseEdge);
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
    // x: matrix.m41,
    // y: matrix.m42,
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
export const parseEdge = (node) => {
  node.length = undefined;
  return node;
};
