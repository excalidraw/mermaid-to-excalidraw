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

export const parseNode = (node) => {
  const style = getComputedStyle(node);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = node.getBoundingClientRect();

  let nodeType;
  if (node.querySelector("rect")) nodeType = "rect";
  if (node.querySelector("circle")) nodeType = "circle";
  if (node.querySelector("polygon")) nodeType = "polygon";

  return {
    id: node.id,
    type: "node",
    nodeType,
    x: matrix.m41,
    y: matrix.m42,
    width: rect.width,
    height: rect.height,
    textContent: node.textContent,
  };
};

export const parseEdge = (node) => {
  return {
    id: node.id,
    type: "edge",
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
