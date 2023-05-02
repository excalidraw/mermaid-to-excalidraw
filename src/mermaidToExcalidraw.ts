import mermaid from "mermaid";

// TODO: fix type
type ExcalidrawElement = object;

const mermaidToExcalidraw = async (
  diagramDefinition: string,
  options?: {
    fontSize: number;
    diagramWidth: number;
    diagramHeight: number;
    offset: { x: number; y: number };
  }
): Promise<ExcalidrawElement[]> => {
  mermaid.initialize({});
  const definition = `%%{init: {"flowchart": {"curve": "linear"}} }%%\n${diagramDefinition}`;
  const { svg } = await mermaid.render(`diagram-test`, diagramDefinition);

  console.log(svg);

  const diagram = await mermaid.mermaidAPI.getDiagramFromText(definition);
  diagram.parse();

  const graph = diagram.parser.yy;

  return [];
};

export default mermaidToExcalidraw;
