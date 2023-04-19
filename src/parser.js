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
