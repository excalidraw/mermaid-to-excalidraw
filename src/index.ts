import { DEFAULT_FONT_SIZE } from "./constants.js";
import { GraphImageConverter } from "./converter/types/graphImage.js";
import { convertGraph } from "./diagrams/index.js";
import type { MermaidConfig } from "./interfaces.js";
import { parseDiagram } from "./parseDiagram.js";
import { normalizeLinearElementPoints } from "./utils.js";

export interface ExcalidrawConfig {
  fontSize?: number;
}

const parseMermaidToExcalidraw = async (
  definition: string,
  config?: MermaidConfig
) => {
  const fontSize =
    parseInt(config?.themeVariables?.fontSize ?? "") || DEFAULT_FONT_SIZE;
  const graph = await parseDiagram(definition, config);
  // Only font size supported for excalidraw elements. Not with
  // `graphToExcalidraw`, which would bundle every diagram type's converter.
  return normalizeLinearElementPoints(
    graph.type === "graphImage"
      ? GraphImageConverter.convert(graph, { fontSize })
      : await convertGraph(graph, { fontSize })
  );
};

export { parseMermaidToExcalidraw };
export type { MermaidConfig };
