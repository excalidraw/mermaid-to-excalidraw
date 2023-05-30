// compute arrow type from mermaid edge type
interface ArrowType {
  startArrowhead?: string;
  endArrowhead?: string;
}
export const computeExcalidrawArrowType = (
  mermaidEdgeType: string
): ArrowType => {
  const arrowType: ArrowType = {};
  if (mermaidEdgeType === "arrow_circle") {
    arrowType.endArrowhead = "dot";
  } else if (mermaidEdgeType === "arrow_cross") {
    arrowType.endArrowhead = "bar";
  } else if (mermaidEdgeType === "double_arrow_circle") {
    arrowType.endArrowhead = "dot";
    arrowType.startArrowhead = "dot";
  } else if (mermaidEdgeType === "double_arrow_cross") {
    arrowType.endArrowhead = "bar";
    arrowType.startArrowhead = "bar";
  } else if (mermaidEdgeType === "double_arrow_point") {
    arrowType.endArrowhead = "arrow";
    arrowType.startArrowhead = "arrow";
  }

  return arrowType;
};
