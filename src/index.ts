import { DEFAULT_FONT_SIZE } from "./constants.js";
import { graphToExcalidraw } from "./graphToExcalidraw.js";
import { DiagramEngine, parseDiagram } from "./parseDiagram.js";

export interface MermaidConfig {
  /**
   * Whether to start the diagram automatically when the page loads.
   * @default false
   */
  startOnLoad?: boolean;
  /**
   * The flowchart curve style.
   * @default "linear"
   */
  flowchart?: {
    curve?: "linear" | "basis";
  };
  /**
   * Theme variables
   * @default { fontSize: "25px" }
   */
  themeVariables?: {
    fontSize?: string;
  };
  /**
   * Maximum number of edges to be rendered.
   * @default 1000
   */
  maxEdges?: number;
  /**
   * Maximum number of characters to be rendered.
   * @default 1000
   */
  maxTextSize?: number;
  /**
   * The engine that parses and lays out the diagram. `"pele"` is
   * experimental. Both convert flowcharts, sequence, class, ER and state
   * diagrams to Excalidraw elements, and insert other diagrams as images.
   * @default "mermaid"
   */
  engine?: DiagramEngine;
}

export interface ExcalidrawConfig {
  fontSize?: number;
}

const parseMermaidToExcalidraw = async (
  definition: string,
  config?: MermaidConfig
) => {
  const { engine, ...mermaidConfig } = config || {};
  const fontSize =
    parseInt(mermaidConfig.themeVariables?.fontSize ?? "") || DEFAULT_FONT_SIZE;
  const parsedMermaidData = await parseDiagram(
    definition,
    {
      ...mermaidConfig,
      themeVariables: {
        ...mermaidConfig.themeVariables,
      },
    },
    engine
  );
  // Only font size supported for excalidraw elements
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, {
    fontSize,
  });
  return excalidrawElements;
};

export { parseMermaidToExcalidraw };
export type { DiagramEngine };
