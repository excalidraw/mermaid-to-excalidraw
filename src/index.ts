import { graphToExcalidraw } from "./graphToExcalidraw.js";
import { parseMermaid } from "./parseMermaid.js";

export interface MermaidConfig {
  startOnLoad?: boolean;
  flowchart?: {
    curve?: "linear" | "basis";
  };
  themeVariables?: {
    fontSize?: string;
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
    fontSize: config.themeVariables?.fontSize,
  });
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
