export const DEFAULT_FONT_SIZE = 20;

// Nodes (flowchart nodes, classes, entities, states) are opaque, in the
// canvas' color (also in the dark theme, which inverts it), and drawn above
// the arrows between them: nothing passing behind them crosses their labels.
export const NODE_BACKGROUND_COLOR = "#ffffff";

export const SVG_TO_SHAPE_MAPPER: { [key: string]: "rectangle" | "ellipse" } = {
  rect: "rectangle",
  circle: "ellipse",
};

// visit https://mermaid.js.org/schemas/config.schema.json for default schema
export const MERMAID_CONFIG = {
  startOnLoad: false,
  flowchart: { curve: "linear" },
  themeVariables: {
    fontSize: `${DEFAULT_FONT_SIZE}px`,
  },
  maxEdges: 500,
  maxTextSize: 50000,
} as const;
