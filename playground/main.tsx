import React from "react";
import ReactDOM from "react-dom/client";
import App from "./index.tsx";
import mermaid from "mermaid";
import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../src/constants.ts";

// Initialize Mermaid
mermaid.initialize({
  ...MERMAID_CONFIG,
  themeVariables: {
    fontSize: `${DEFAULT_FONT_SIZE}px`,
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
