import { Mermaid } from "mermaid";

const mermaidToExcalidraw = (
  mermaid: Mermaid,
  options?: {
    fontSize: number;
    diagramWidth: number;
    diagramHeight: number;
    offset: { x: number; y: number };
  }
): {
  transform: (diagramDefinition: string) => Promise<any[]>;
} => {
  const transform = async (diagramDefinition: string) => {
    const definition = `%%{init: {"flowchart": {"curve": "linear"}} }%%\n${diagramDefinition}`;
    const { svg } = await mermaid.render(`diagram-test`, diagramDefinition);

    const diagram = await mermaid.mermaidAPI.getDiagramFromText(definition);
    diagram.parse();

    const graph = diagram.parser.yy;

    return [svg, diagram, graph];
  };

  return {
    transform,
  };
};

export default mermaidToExcalidraw;
