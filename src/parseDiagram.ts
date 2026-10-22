import type { MermaidConfig } from "mermaid";

import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "./constants.js";
import { parseMermaid, resolveMermaidConfig } from "./parseMermaid.js";
import { parsePele } from "./pele/parsePele.js";

/**
 * - `mermaid`: Mermaid parses and lays out the diagram, rendered in the DOM.
 * - `pele`: Pele (https://pele.run), a Mermaid renderer that needs no DOM.
 *   Experimental.
 */
export type DiagramEngine = "mermaid" | "pele";

export const DEFAULT_DIAGRAM_ENGINE: DiagramEngine = "mermaid";

export type ParsedDiagram = Awaited<ReturnType<typeof parseMermaid>>;

export const parseDiagram = (
  definition: string,
  config: MermaidConfig = MERMAID_CONFIG,
  engine: DiagramEngine = DEFAULT_DIAGRAM_ENGINE
): Promise<ParsedDiagram> => {
  if (engine === "pele") {
    const resolvedConfig = resolveMermaidConfig(config);

    return parsePele(definition, {
      fontSize:
        parseInt(String(resolvedConfig.themeVariables.fontSize)) ||
        DEFAULT_FONT_SIZE,
      maxEdges: resolvedConfig.maxEdges,
      maxTextSize: resolvedConfig.maxTextSize,
      curve: resolvedConfig.flowchart?.curve,
    });
  }

  return parseMermaid(definition, config);
};
