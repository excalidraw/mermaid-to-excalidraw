import { DEFAULT_FONT_SIZE } from "./constants.js";
import type { MermaidConfig } from "./interfaces.js";
import { parsePele } from "./pele/parsePele.js";

export type ParsedDiagram = Awaited<ReturnType<typeof parsePele>>;

/**
 * Parses and lays out a Mermaid definition with Pele (https://pele.run), a
 * Mermaid renderer that needs no DOM to lay diagrams out.
 */
export const parseDiagram = (
  definition: string,
  config: MermaidConfig = {}
): Promise<ParsedDiagram> =>
  parsePele(definition, {
    fontSize:
      parseInt(config.themeVariables?.fontSize ?? "") || DEFAULT_FONT_SIZE,
    maxEdges: config.maxEdges,
    maxTextSize: config.maxTextSize,
    curve: config.flowchart?.curve,
  });
