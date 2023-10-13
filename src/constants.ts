export const DEFAULT_FONT_SIZE = 20;
export const SUPPORTED_DIAGRAM_TYPES = ["flowchart", "sequenceDiagram"];

export const SVG_TO_SHAPE_MAPPER: { [key: string]: string } = {
  rect: "rectangle",
  circle: "ellipse",
  text: "text",
  line: "line",
};
