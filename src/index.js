import { parseNode } from "./parser";
import "./styles.css";
import * as xml from "xml-js";
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

// extract elements info from SVG
const nodes = [...ele.querySelector(".nodes").childNodes].map(parseNode);
console.log("nodes", nodes);

var svgAsJson = xml.xml2json(svg, { compact: true, spaces: 2 });
p.innerHTML = svgAsJson;
