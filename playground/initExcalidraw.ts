import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { graphToExcalidraw } from "../src";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import React from "react";
import { createRoot } from "react-dom/client";

// Create Excalidraw Wrapper element
const excalidrawWrapper = document.createElement("div");
excalidrawWrapper.id = "excalidraw";
document.body.appendChild(excalidrawWrapper);

// Init Excalidraw
const root = createRoot(excalidrawWrapper);
root.render(React.createElement(ExcalidrawWrapper));

// Render to Excalidraw
export const renderExcalidraw = (
  mermaidGraphDataString: string,
  fontSize = DEFAULT_FONT_SIZE
) => {
  const mermaidGraphData = JSON.parse(mermaidGraphDataString);
  const { elements, files } = graphToExcalidraw(mermaidGraphData, { fontSize });

  console.info("renderExcalidraw", elements);

  root.render(
    React.createElement(ExcalidrawWrapper, {
      elements,
      files,
    })
  );
};
