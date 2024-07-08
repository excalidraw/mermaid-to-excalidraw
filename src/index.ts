import { DEFAULT_FONT_SIZE } from "./constants.js";
import { graphToExcalidraw } from "./graphToExcalidraw.js";
import { parseMermaid } from "./parseMermaid.js";

export interface MermaidConfig {
  startOnLoad?: boolean;
  flowchart?: {
    curve?: "linear" | "basis";
  };
  themeVariables?: {
    fontSize?: number;
  };
  maxEdges?: number;
  maxTextSize?: number;
}

const parseMermaidToExcalidraw = async (
  definition: string,
  config: MermaidConfig = {}
) => {
  const parsedMermaidData = await parseMermaid(definition, config);

  // Only font size supported for excalidraw elements
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, {
    themeVariables: {
      ...config.themeVariables,
      fontSize: config.themeVariables?.fontSize || DEFAULT_FONT_SIZE,
    },
  });
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
