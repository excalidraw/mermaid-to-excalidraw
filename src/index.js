import { Excalidraw } from "./Excalidraw";
import { flowDiagrams } from "./flowDiagrams";
import { jsonToExcalidraw, parseRoot } from "./parser";
import "./styles.css";
import mermaid from "mermaid";

// Research Backlog
// TODO: how to handle element type like database, hexagon, etc. (how to transform into other type?)

// initialize Mermaid
mermaid.initialize({ startOnLoad: false });
const container = document.getElementById("diagrams");

// skips some diagrams #n
// skip this because it a minor feature e.g. dashed arrow line, link, etc.
// we can support this later.
const SKIPS = [];

// render the diagram
flowDiagrams.forEach(async (_diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;
  let diagramDefinition = `%%{init: {"flowchart": {"curve": "linear"}} }%%\n${_diagramDefinition}`;

  const div = document.createElement("div");
  div.id = `diagram-container-${i}`;
  div.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><button onclick="renderExcalidraw(document.getElementById('parsed-${i}').innerText)">Render to Excalidraw</button><pre id="parsed-${i}"></pre>`;

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
  // console.log(i + 1, diagram, graph.getVertices());

  const root = parseRoot(graph, dg);
  p.innerHTML = JSON.stringify(root, null, 2);
});

// render default excalidraw
const excalidrawWrapper = document.getElementById("excalidraw");
let root = ReactDOM.createRoot(excalidrawWrapper);
root.render(React.createElement(Excalidraw));

// Render to Excalidraw
function renderExcalidraw(mermaidDataString) {
  const data = JSON.parse(mermaidDataString);
  const elements = jsonToExcalidraw(data);

  console.log("renderExcalidraw", elements);

  root.unmount();
  root = ReactDOM.createRoot(excalidrawWrapper);
  root.render(
    React.createElement(Excalidraw, {
      elements,
    })
  );
}

window.renderExcalidraw = renderExcalidraw;
