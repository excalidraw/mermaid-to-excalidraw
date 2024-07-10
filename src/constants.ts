export const DEFAULT_FONT_SIZE = 20;

export const SVG_TO_SHAPE_MAPPER: { [key: string]: "rectangle" | "ellipse" } = {
  rect: "rectangle",
  circle: "ellipse",
};

// visit https://mermaid.js.org/schemas/config.schema.json for default schema
export const MERMAID_CONFIG = {
  startOnLoad: false,
  flowchart: { curve: "linear" },
  themeVariables: {
    // Multiplying by 1.25 to increase the font size by 25% and render correctly in Excalidraw
    fontSize: `${DEFAULT_FONT_SIZE * 1.25}px`,
  },
  maxEdges: 500,
  maxTextSize: 50000,
};
