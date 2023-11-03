import mermaid from "mermaid";
import { parseMermaid } from "../src/parseMermaid.js";
import { renderExcalidraw } from "./initExcalidraw.js";

const customTestEl = document.getElementById("custom-test")!;
const btn = document.getElementById("render-excalidraw-btn")!;
const errorEl = customTestEl.querySelector("#error")!;

// Handle render to Excalidraw event
btn.addEventListener("click", async () => {
  errorEl.setAttribute("style", "display: none");

  try {
    const mermaidInput = document.getElementById(
      "mermaid-input"
    ) as HTMLInputElement;

    const diagramDefinition = mermaidInput.value;

    // Render Mermaid diagram
    const diagramEl = document.getElementById("custom-diagram")!;
    const { svg } = await mermaid.render("custom-digaram", diagramDefinition);
    diagramEl.innerHTML = svg;

    // Parse Mermaid diagram and render to Excalidraw
    const parsedData = await parseMermaid(diagramDefinition);

    const parsedDataEl = document.getElementById("custom-parsed-data")!;
    parsedDataEl.parentElement!.style.display = "block";
    parsedDataEl.innerText = JSON.stringify(parsedData, null, 2);

    renderExcalidraw(JSON.stringify(parsedData));
  } catch (e) {
    errorEl.setAttribute("style", "display: block");
    errorEl.innerHTML = String(e);
    console.error("Custom Test Error:", e);
  }
});
