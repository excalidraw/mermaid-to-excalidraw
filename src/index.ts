import { graphToExcalidraw } from "./graphToExcalidraw";
import { parseMermaid } from "./parseMermaid";

export interface MermaidOptions {
  fontSize?: number;
}
const parseMermaidToExcalidraw = async (
  definition: string,
  options: MermaidOptions = {}
) => {
  const parsedMermaidData = await parseMermaid(definition, options);
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, options);
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
