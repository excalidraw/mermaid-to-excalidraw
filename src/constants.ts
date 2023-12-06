export const DEFAULT_FONT_SIZE = 20;

export const SVG_TO_SHAPE_MAPPER: { [key: string]: "rectangle" | "ellipse" } = {
  rect: "rectangle",
  circle: "ellipse",
};

export const MERMAID_CONFIG = {
  startOnLoad: false,
  flowchart: { curve: "linear" },
  themeVariables: {
    fontSize: `${DEFAULT_FONT_SIZE * 1.25}px`,
  },
};
