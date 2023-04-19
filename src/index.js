import { flowDiagrams } from "./flowDiagrams";
import { parseCluster, parseEdge, parseLabel, parseNode } from "./parser";
import "./styles.css";
const mermaid = window.mermaid;

// initialize Mermaid
mermaid.initialize({ startOnLoad: true });
const container = document.getElementById("diagrams");

// render the diagram
flowDiagrams.forEach((diagramDefinition, i) => {
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

// TODO: how to handle element type like database, hexagon, etc.
// TODO: how to connect label with edge since label have no id attached.
// TODO: handle parser recursively (e.g. .root > .nodes > .root)

// implement the parser
flowDiagrams.forEach((diagramDefinition, i) => {
  const div = document.querySelector(`#diagram-container-${i}`);
  const p = div.querySelector(`#parsed-${i}`);
  // 1. extract relevant info from SVG
  const clusters = [...div.querySelector(".clusters").childNodes].map(
    parseCluster
  );
  const nodes = [...div.querySelector(".nodes").childNodes].map(parseNode);
  const edgePaths = [...div.querySelector(".edgePaths").childNodes].map(
    parseEdge
  );
  const edgeLabels = [...div.querySelector(".edgeLabels").childNodes].map(
    parseLabel
  );

  // 2. transform to Excalidraw markup (JSON)
  // TODO: transform dimention, create elements relationship e.g. node, arrow

  // 3. markup to Excalidraw Element
  p.innerHTML = JSON.stringify(
    { clusters, nodes, edgePaths, edgeLabels },
    null,
    2
  );
});
