export const parseRoot = (node) => {
  const clusters = [...node.querySelector(".clusters").childNodes].map(
    parseCluster
  );
  const nodes = [...node.querySelector(".nodes").childNodes].map(parseNode);
  const edgePaths = [...node.querySelector(".edgePaths").childNodes].map(
    parseEdge
  );
  const edgeLabels = [...node.querySelector(".edgeLabels").childNodes]
    .map(parseLabel)
    .filter((label) => label.textContent.length !== 0);

  return {
    type: "root",
    clusters,
    nodes,
    edgePaths,
    edgeLabels,
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

export const parseNode = (node) => {
  if (node.classList.contains("root")) return parseRoot(node);

  const style = getComputedStyle(node);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = node.getBoundingClientRect();

  let nodeType;
  if (node.querySelector("rect")) nodeType = "rect";
  if (node.querySelector("circle")) nodeType = "circle";
  if (node.querySelector("polygon")) nodeType = "polygon";

  let link;
  if (node.tagName.toLowerCase() === "a")
    link = node.getAttribute("xlink:href");

  let id = node.id;
  if (node.tagName.toLowerCase() === "a") id = node.childNodes[0].id;

  return {
    id,
    type: "node",
    nodeType,
    link,
    x: matrix.m41,
    y: matrix.m42,
    width: rect.width,
    height: rect.height,
    textContent: node.textContent,
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
