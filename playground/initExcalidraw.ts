import React from "react";
import * as ReactDOM from "react-dom/client";
import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { graphToExcalidraw } from "../src";
import { DEFAULT_FONT_SIZE } from "../src/constants";

let excalidrawWrapper: HTMLElement | null;
let root: ReactDOM.Root | null;

// Render to Excalidraw
export default function renderExcalidraw(
  mermaidDataString: string,
  fontSize = DEFAULT_FONT_SIZE
) {
  if (!excalidrawWrapper || !root) {
    // render default excalidraw
    excalidrawWrapper = document.getElementById("excalidraw");
    if (!excalidrawWrapper) {
      throw new Error("Excalidraw wrapper not found");
    }

    root = ReactDOM.createRoot(excalidrawWrapper);
    root.render(React.createElement(ExcalidrawWrapper));
  }

  const data = JSON.parse(mermaidDataString);
  const elements = graphToExcalidraw(data, { fontSize });
  if (!excalidrawWrapper) {
    throw new Error("Excalidraw wrapper not found");
  }

  console.info("renderExcalidraw", elements);

  root.unmount();
  root = ReactDOM.createRoot(excalidrawWrapper);
  root.render(
    React.createElement(ExcalidrawWrapper, {
      elements,
    })
  );
}
