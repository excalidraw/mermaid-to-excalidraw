import mermaid from "mermaid";
import type { MermaidConfig } from "mermaid";
import type { Diagram } from "mermaid/dist/Diagram.js";
import type { FlowDB } from "mermaid/dist/diagrams/flowchart/flowDb.js";
import type { ErDB } from "mermaid/dist/diagrams/er/erDb.js";
import type { StateDB } from "mermaid/dist/diagrams/state/stateDb.js";

import { GraphImage } from "./interfaces.js";
import { MERMAID_CONFIG } from "./constants.js";
import { encodeEntities } from "./utils.js";
import { Flowchart, parseMermaidFlowChartDiagram } from "./parser/flowchart.js";
import { Sequence, parseMermaidSequenceDiagram } from "./parser/sequence.js";
import { Class, parseMermaidClassDiagram } from "./parser/class.js";
import { ERD, parseMermaidERDiagram } from "./parser/er.js";
import { State, parseMermaidStateDiagram } from "./parser/state.js";
import { runMermaidTaskSequentially } from "./mermaidExecutionQueue.js";

// Track initialization state to avoid redundant mermaid.initialize() calls
// which can cause performance issues during streaming
let lastConfigHash: string | null = null;
let renderCounter = 0;

const hashConfig = (config: MermaidConfig): string => {
  return JSON.stringify(config);
};

// Fallback to Svg
const convertSvgToGraphImage = (svgContainer: HTMLDivElement) => {
  // Extract SVG width and height
  // TODO: make width and height change dynamically based on user's screen dimension
  const svgEl = svgContainer.querySelector("svg");
  if (!svgEl) {
    throw new Error("SVG element not found");
  }
  const rect = svgEl.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Set width and height explictly since in firefox it gets set to 0
  // if the width and height are not expilcitly set
  // eg in some cases like er Diagram, gnatt, width and height is set as 100%
  // which sets the dimensions as 0 in firefox and thus the diagram isn't rendered
  svgEl.setAttribute("width", `${width}`);
  svgEl.setAttribute("height", `${height}`);

  // Convert SVG to image
  const mimeType = "image/svg+xml";
  const decoded = unescape(encodeURIComponent(svgEl.outerHTML));
  const base64 = btoa(decoded);
  const dataURL = `data:image/svg+xml;base64,${base64}`;

  const graphImage: GraphImage = {
    type: "graphImage",
    mimeType,
    dataURL,
    width,
    height,
  };

  return graphImage;
};

export const parseMermaid = async (
  definition: string,
  config: MermaidConfig = MERMAID_CONFIG
): Promise<Flowchart | GraphImage | Sequence | Class | ERD | State> => {
  return runMermaidTaskSequentially(async () => {
    const resolvedFontSize =
      config.themeVariables?.fontSize ?? MERMAID_CONFIG.themeVariables.fontSize;

    // Only re-initialize mermaid if config has changed (performance optimization)
    const mergedConfig = {
      ...MERMAID_CONFIG,
      ...config,
      fontSize: resolvedFontSize,
      themeVariables: {
        ...MERMAID_CONFIG.themeVariables,
        ...config.themeVariables,
        fontSize: resolvedFontSize,
      },
    };
    const configHash = hashConfig(mergedConfig);

    if (configHash !== lastConfigHash) {
      mermaid.initialize(mergedConfig);
      lastConfigHash = configHash;
    }

    // Parse the diagram definition
    // Note: mermaidAPI.getDiagramFromText is deprecated but there's no public
    // alternative that provides access to diagram.db (needed for extracting nodes/edges).
    // See: https://github.com/mermaid-js/mermaid/issues/XXX
    const diagram: Diagram = await mermaid.mermaidAPI.getDiagramFromText(
      encodeEntities(definition)
    );

    // Use unique render IDs to avoid conflicts when streaming (performance optimization)
    const renderId = `mermaid-to-excalidraw-${renderCounter++}`;

    // Use an off-screen container so Mermaid's temporary DOM insertions don't shift layout.
    const svgContainer = document.createElement("div");
    svgContainer.setAttribute(
      "style",
      `opacity: 0; position: fixed; z-index: -1; left: -99999px; top: -99999px;`
    );

    const containerId = `${renderId}-container`;
    svgContainer.id = containerId;
    // Clean up any previous container with the same ID (shouldn't exist due to unique IDs, but defensive)
    document.getElementById(containerId)?.remove();
    document.body.appendChild(svgContainer);

    try {
      // Render the SVG diagram to be able to query DOM elements
      const { svg } = await mermaid.render(renderId, definition, svgContainer);

      // Append SVG to DOM temporarily to allow querying element dimensions/positions
      svgContainer.innerHTML = svg;

      let data: Flowchart | GraphImage | Sequence | Class | ERD | State;

      try {
        switch (diagram.type) {
          case "flowchart-v2":
          case "graph": {
            data = parseMermaidFlowChartDiagram(
              diagram.db as FlowDB,
              svgContainer
            );
            break;
          }
          case "sequence": {
            data = parseMermaidSequenceDiagram(diagram, svgContainer);
            break;
          }
          case "class":
          case "classDiagram": {
            data = parseMermaidClassDiagram(diagram, svgContainer);
            break;
          }
          case "er": {
            data = parseMermaidERDiagram(diagram.db as ErDB, svgContainer);
            break;
          }
          case "state":
          case "stateDiagram": {
            data = parseMermaidStateDiagram(
              diagram.db as StateDB,
              svgContainer
            );
            break;
          }
          default: {
            data = convertSvgToGraphImage(svgContainer);
          }
        }
      } catch (error) {
        console.error("Error processing Mermaid diagram:", error);
        data = convertSvgToGraphImage(svgContainer);
      }

      return data;
    } finally {
      svgContainer.remove();
    }
  });
};
