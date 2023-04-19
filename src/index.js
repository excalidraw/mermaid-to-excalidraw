import { parseEdge, parseNode } from "./parser";
import "./styles.css";
const mermaid = window.mermaid;
const ele = document.getElementById("dg");
const p = document.getElementById("json");

// initialize Mermaid
mermaid.initialize({ startOnLoad: true });
// define the diagram
var diagramDefinition = "graph TD;\n  Hello-->World;\n";

// render the diagram
const svg = mermaid.mermaidAPI.render("diagram", diagramDefinition);
ele.innerHTML = svg;

// 1. extract elements info from SVG
// TODO: try out flowchart in different ways (from simple to complex)
const nodes = [...ele.querySelector(".nodes").childNodes].map(parseNode);
const edgePaths = [...ele.querySelector(".edgePaths").childNodes].map(
  parseEdge
);

// 2. transform to Excalidraw markup (JSON)
// TODO: transform dimention, create elements relationship e.g. node, arrow

// 3. markup to Excalidraw Element
p.innerHTML = JSON.stringify({ nodes, edgePaths }, null, 2);
