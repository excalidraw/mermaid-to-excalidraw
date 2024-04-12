import React from "react";
import ReactDOM from "react-dom/client";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import { graphToExcalidraw } from "../src/graphToExcalidraw.ts";
import { DEFAULT_FONT_SIZE } from "../src/constants.ts";
import { EXCALIDRAW_WRAPPER_ID } from "./constants.ts";

// Create Excalidraw Wrapper element
const excalidrawWrapper = document.createElement("div");
excalidrawWrapper.id = EXCALIDRAW_WRAPPER_ID;
document.body.appendChild(excalidrawWrapper);

// Init Excalidraw
const root = ReactDOM.createRoot(excalidrawWrapper);
root.render(<ExcalidrawWrapper elements={[]} />);

// Render to Excalidraw
export const renderExcalidraw = (
  mermaidGraphDataString: string,
  fontSize = DEFAULT_FONT_SIZE
) => {
  const mermaidGraphData = JSON.parse(mermaidGraphDataString);
  const { elements, files } = graphToExcalidraw(mermaidGraphData, { fontSize });

  console.info("renderExcalidraw", elements);

  root.render(<ExcalidrawWrapper elements={elements} files={files} />);
};
