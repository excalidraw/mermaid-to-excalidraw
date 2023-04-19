import { parseEdge, parseNode } from "./parser";
import "./styles.css";
const mermaid = window.mermaid;

// initialize Mermaid
mermaid.initialize({ startOnLoad: true });
const container = document.getElementById("diagrams");

// diagrams
const diagrams = [
  `flowchart TD
    Hello --> World`,
  `flowchart LR
    id1([This is the text in the box])`,
];

diagrams.forEach((diagramDefinition, i) => {
  const div = document.createElement("div");
  div.id = `diagram-container-${i}`;
  div.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><pre id="parsed-${i}"></pre>`;
  const dg = div.querySelector(`#diagram-${i}`);
  const p = div.querySelector(`#parsed-${i}`);

  // render the diagram
  const svg = mermaid.mermaidAPI.render(`diagram-${i}`, diagramDefinition);
  dg.innerHTML = svg;

  // 1. extract elements info from SVG
  // TODO: try out flowchart in different ways (from simple to complex)
  const nodes = [...div.querySelector(".nodes").childNodes].map(parseNode);
  const edgePaths = [...div.querySelector(".edgePaths").childNodes].map(
    parseEdge
  );

  // 2. transform to Excalidraw markup (JSON)
  // TODO: transform dimention, create elements relationship e.g. node, arrow

  // 3. markup to Excalidraw Element
  p.innerHTML = JSON.stringify({ nodes, edgePaths }, null, 2);

  container.append(div);
});
