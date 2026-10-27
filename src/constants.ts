export const DEFAULT_FONT_SIZE = 20;

// Nodes (flowchart nodes, classes, entities, states) are opaque, in the
// canvas' color (also in the dark theme, which inverts it), and drawn above
// the arrows between them: nothing passing behind them crosses their labels.
export const NODE_BACKGROUND_COLOR = "#ffffff";

// Gap between a (composite state's, subgraph's) title band and the top stroke
// of its box, which it'd otherwise cover: hand-drawn, a long stroke bows a few
// pixels inwards.
export const TITLE_BAND_STROKE_CLEARANCE = 4;

// Excalidraw's default stroke (and so text) color
export const DEFAULT_TEXT_COLOR = "#1e1e1e";

// The defaults of the Mermaid config options supported (see `MermaidConfig`)
export const MERMAID_CONFIG = {
  flowchart: { curve: "linear" },
  maxEdges: 500,
  maxTextSize: 50000,
} as const;
