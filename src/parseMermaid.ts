import mermaid from "mermaid";
import { Graph, GraphImage } from "./interfaces";
import { DEFAULT_FONT_SIZE } from "./constants";
import { MermaidOptions } from ".";
import { parseMermaidFlowChartDiagram } from "./converter/types/flowchart";
import { isSupportedDiagram } from "./utils";

interface MermaidDefinitionOptions {
  curve?: "linear" | "basis";
  fontSize?: number;
}

const processMermaidTextWithOptions = (
  definition: string,
  options?: MermaidDefinitionOptions
) => {
  const diagramInitOptions = {
    // Add options for rendering flowchart in linear curves (for better extracting arrow path points) and custom font size
    flowchart: {
      curve: options?.curve || "basis",
    },
    // Increase the Mermaid's font size by multiplying with 1.25 to match the Excalidraw Virgil font
    themeVariables: {
      fontSize: `${(options?.fontSize || DEFAULT_FONT_SIZE) * 1.25}px`,
    },
  };
  const fullDefinition = `%%{init: ${JSON.stringify(
    diagramInitOptions
  )}}%%\n${definition}`;

  return fullDefinition;
};

const appendSvgToDOMAndGetContainer = (svg: string) => {
  const svgContainer = document.createElement("div");
  svgContainer.setAttribute(
    "style",
    `opacity: 0; position: relative; z-index: -1;`
  );
  svgContainer.innerHTML = svg;
  svgContainer.id = "mermaid-diagram";
  document.body.appendChild(svgContainer);
  return svgContainer;
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
  options: MermaidOptions = {}
): Promise<Graph | GraphImage> => {
  mermaid.initialize({ startOnLoad: false });

  const diagramSupported = isSupportedDiagram(definition);

  const fullDefinition = processMermaidTextWithOptions(definition, {
    curve: diagramSupported ? "linear" : "basis",
    fontSize: options.fontSize,
  });
  // Parse the diagram
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(fullDefinition);

  // Render the SVG diagram
  const { svg } = await mermaid.render("mermaid-to-excalidraw", fullDefinition);
  const svgContainer = appendSvgToDOMAndGetContainer(svg);

  let data;
  switch (diagram.type) {
    case "flowchart-v2": {
      data = parseMermaidFlowChartDiagram(diagram, svgContainer);
      break;
    }
    // fallback to image if diagram type not-supported
    default: {
      data = convertSvgToGraphImage(svgContainer);
    }
  }
  svgContainer.remove();

  return data;
};
