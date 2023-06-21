import React from "react";
import * as ReactDOM from "react-dom/client";
import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { graphToExcalidraw } from "../src";
import { DEFAULT_FONT_SIZE } from "../src/constants";

// Create Excalidraw Wrapper element
const excalidrawWrapper = document.createElement("div");
excalidrawWrapper.id = "excalidraw";
document.body.appendChild(excalidrawWrapper);

// Init Excalidraw
let root: ReactDOM.Root = ReactDOM.createRoot(excalidrawWrapper);
root.render(React.createElement(ExcalidrawWrapper));

// Render to Excalidraw
export const renderExcalidraw = (
  mermaidGraphDataString: string,
  fontSize = DEFAULT_FONT_SIZE
) => {
  const mermaidGraphData = JSON.parse(mermaidGraphDataString);
  const { elements, files } = graphToExcalidraw(mermaidGraphData, { fontSize });

  console.info("renderExcalidraw", elements);

  root.unmount();
  root = ReactDOM.createRoot(excalidrawWrapper);
  root.render(
    React.createElement(ExcalidrawWrapper, {
      elements,
      files,
    })
  );
};
