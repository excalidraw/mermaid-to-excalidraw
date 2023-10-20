import { graphToExcalidraw } from "./graphToExcalidraw.js";
import { parseMermaid } from "./parseMermaid.js";

export interface MermaidOptions {
  fontSize?: number;
}
const parseMermaidToExcalidraw = async (
  definition: string,
  options: MermaidOptions = {}
) => {
  const parsedMermaidData = await parseMermaid(definition);
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, options);
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
