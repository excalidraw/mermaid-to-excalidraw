export const parseNode = (node) => {
  const style = getComputedStyle(node);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = node.getBoundingClientRect();

  return {
    id: node.id,
    type: "node",
    x: matrix.m41,
    y: matrix.m42,
    width: rect.width,
    height: rect.height,
    textContent: node.textContent,
  };
};
