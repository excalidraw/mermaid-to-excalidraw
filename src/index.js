import { flowDiagrams } from "./flowDiagrams";
import { parseRoot } from "./parser";
import "./styles.css";
import mermaid from "mermaid";

// TODO: how to handle element type like database, hexagon, etc. (how to transform into other type?)
// TODO: how to identify arrow head
// TODO: how to render arrow curve in Excalidraw
//    sol: use "curve": "linear" options, find a way to detect breaking point -> replicate on Excalidraw

// TODO: transform dimention

// initialize Mermaid
mermaid.initialize({ startOnLoad: false });
const container = document.getElementById("diagrams");

// skips some diagrams #n
const SKIPS = [6, 9, 27, 28, 29, 39, 40, 42, 43];

// render the diagram
flowDiagrams.forEach(async (_diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;
  const diagramDefinition = `%%{init: {"flowchart": {"curve": "linear"}} }%%\n${_diagramDefinition}`;

  const div = document.createElement("div");
  div.id = `diagram-container-${i}`;
  div.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><pre id="parsed-${i}"></pre>`;

  const dg = div.querySelector(`#diagram-${i}`);
  const { svg } = await mermaid.render(`diagram-${i}`, diagramDefinition);

  dg.innerHTML = svg;
  container.append(div);

  // get parsed data
  const p = div.querySelector(`#parsed-${i}`);

  const diagram = await mermaid.mermaidAPI.getDiagramFromText(
    diagramDefinition
  );
  diagram.parse(diagramDefinition);
  // const {
  //   getAccDescription,
  //   getAccTitle,
  //   getClasses,
  //   getDepthFirstPos,
  //   getDiagramTitle,
  //   getDirection,
  //   getEdges,
  //   getSubGraphs,
  //   getTooltip,
  //   getVertices,
  // } = graph;
  const graph = diagram.parser.yy;
  console.log(i + 1, diagram, graph.getVertices());

  const root = parseRoot(graph, dg);
  p.innerHTML = JSON.stringify(root, null, 2);
});
