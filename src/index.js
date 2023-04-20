import { flowDiagrams } from "./flowDiagrams";
import { parseRoot } from "./parser";
import "./styles.css";
import mermaid from "mermaid";

// TODO: how to connect label with edge since label have no id attached.
//    sol1: get graph data from parser (didn't find public function for this yet)
//    sol2: check position overlapping
// TODO: how to handle element type like database, hexagon, etc. (how to transform into other type?)
// TODO: how to identify arrow head
// TODO: how to render arrow curve in Excalidraw
//    sol: use "curve": "linear" options, find a way to detect breaking point -> replicate on Excalidraw

// initialize Mermaid
mermaid.initialize({ startOnLoad: false });
const container = document.getElementById("diagrams");

// skips some diagrams #n
const SKIPS = [39, 40];

// render the diagram
flowDiagrams.forEach(async (diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;

  const div = document.createElement("div");
  div.id = `diagram-container-${i}`;
  div.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><pre id="parsed-${i}"></pre>`;

  const dg = div.querySelector(`#diagram-${i}`);
  const { svg } = await mermaid.render(`diagram-${i}`, diagramDefinition);

  // get parsed data
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(
    diagramDefinition
  );
  diagram.parse(diagramDefinition);
  const { getDirection, getEdges, getVertices } = diagram.parser.yy;
  console.log(i + 1, getDirection(), getEdges(), getVertices());

  dg.innerHTML = svg;
  container.append(div);
});

// implement the parser
// import m from "mermaid";
// m.initialize({ startOnLoad: false });
// let diagram;
flowDiagrams.forEach(async (diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;
  // if (!diagram) {
  //   diagram = await m.mermaidAPI.getDiagramFromText("flowchart");
  //   console.log("...");
  // }

  // const div = document.querySelector(`#diagram-container-${i}`);
  // const p = div.querySelector(`#parsed-${i}`);

  // m.mermaidAPI.render(`diagram-${i}`, diagramDefinition);

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
  // } = diagram.parser.yy;

  // console.log(diagram, m);
  // console.log(i + 1, getAccDescription(), getAccTitle(), getVertices());

  // parse relevant info from SVG
  // const root = parseRoot(div);

  // parsed data to Excalidraw element
  // p.innerHTML = JSON.stringify(root, null, 2);

  // diagram.parser.yy.clear();
});
