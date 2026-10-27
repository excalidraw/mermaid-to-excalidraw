import { DEFAULT_FONT_SIZE } from "./constants.js";
import { graphToExcalidraw } from "./graphToExcalidraw.js";
import type { MermaidConfig } from "./interfaces.js";
import { parseDiagram } from "./parseDiagram.js";

export interface ExcalidrawConfig {
  fontSize?: number;
}

const parseMermaidToExcalidraw = async (
  definition: string,
  config?: MermaidConfig
) => {
  const fontSize =
    parseInt(config?.themeVariables?.fontSize ?? "") || DEFAULT_FONT_SIZE;
  const parsedMermaidData = await parseDiagram(definition, config);
  // Only font size supported for excalidraw elements
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, {
    fontSize,
  });
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
export type { MermaidConfig };
