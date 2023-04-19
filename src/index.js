import { flowDiagrams } from "./flowDiagrams";
import { parseRoot } from "./parser";
import "./styles.css";
const mermaid = window.mermaid;

import m from "mermaid";

(async () => {
  const d = await m.mermaidAPI.getDiagramFromText(flowDiagrams[0]);
  console.log(d);
})();

// initialize Mermaid
mermaid.initialize({ startOnLoad: true });
const container = document.getElementById("diagrams");

// skips some diagrams #n
const SKIPS = [39, 40];

// render the diagram
flowDiagrams.forEach((diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;

  const div = document.createElement("div");
  div.id = `diagram-container-${i}`;
  div.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><pre id="parsed-${i}"></pre>`;
  const dg = div.querySelector(`#diagram-${i}`);

  const svg = mermaid.mermaidAPI.render(`diagram-${i}`, diagramDefinition);
  dg.innerHTML = svg;
  container.append(div);
});

// TODO: how to connect label with edge since label have no id attached.
//    sol1: get graph data from parser (didn't find public function for this yet)
//    sol2: check position overlapping
// TODO: how to handle element type like database, hexagon, etc. (how to transform into other type?)
// TODO: how to identify arrow head
// TODO: how to render arrow curve in Excalidraw
//    sol: use "curve": "linear" options, find a way to detect breaking point -> replicate on Excalidraw

// implement the parser
flowDiagrams.forEach((diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;

  const div = document.querySelector(`#diagram-container-${i}`);
  const p = div.querySelector(`#parsed-${i}`);

  // parse relevant info from SVG
  const root = parseRoot(div);

  // parsed data to Excalidraw element
  p.innerHTML = JSON.stringify(root, null, 2);
});
