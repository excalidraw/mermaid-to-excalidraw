import { graphToExcalidraw } from "./graphToExcalidraw";
import { ParseMermaidOptions, parseMermaid } from "./parseMermaid";

const parseMermaidToExcalidraw = async (
  definition: string,
  options: ParseMermaidOptions = {}
) => {
  const parsedMermaidData = await parseMermaid(definition, options);
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, options);
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
