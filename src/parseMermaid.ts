import mermaid, { Mermaid } from "mermaid";
import {
  CONTAINER_STYLE_PROPERTY,
  Edge,
  Graph,
  GraphImage,
  LABEL_STYLE_PROPERTY,
  Position,
  SubGraph,
  Vertex,
} from "./interfaces";
import flowDb from "mermaid/dist/diagrams/flowchart/flowDb";
import { DEFAULT_FONT_SIZE } from "./constants";
import { MermaidOptions } from ".";
import { entityCodesToText, isSupportedDiagram } from "./utils";

const getTransformAttr = (el: Element) => {
  const transformAttr = el.getAttribute("transform");
  const translateMatch = transformAttr?.match(
    /translate\(([\d.-]+),\s*([\d.-]+)\)/
  );
  let transformX = 0;
  let transformY = 0;
  if (translateMatch) {
    transformX = Number(translateMatch[1]);
    transformY = Number(translateMatch[2]);
  }
  return { transformX, transformY };
};

export const parseMermaid = async (
  definition: string,
  options: MermaidOptions = {}
): Promise<Graph | GraphImage> => {
  mermaid.initialize({ startOnLoad: false });

  // Check supported diagram type, fallback to image if diagram type not-supported
  if (!isSupportedDiagram(definition)) {
    // Render the diagram with default curve and export as svg image
    const { svg } = await renderMermaidToSvg(mermaid, definition, {
      curve: "basis",
      fontSize: options.fontSize,
    });

    // Extract SVG width and height
    // TODO: make width and height change dynamically based on user's screen dimension
    const svgContainer = document.createElement("div");
    svgContainer.innerHTML = svg;
    svgContainer.setAttribute(
      "style",
      `opacity: 0; position: relative; z-index: -1;`
    );
    document.body.appendChild(svgContainer);
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

    svgContainer.remove();

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
  }

  // Render the SVG diagram
  const { svg, fullDefinition } = await renderMermaidToSvg(
    mermaid,
    definition,
    {
      curve: "linear",
      fontSize: options.fontSize,
    }
  );

  const diagramEl = document.createElement("div");
  diagramEl.setAttribute(
    "style",
    `opacity: 0; position: relative; z-index: -1;`
  );
  diagramEl.innerHTML = svg;
  diagramEl.id = "mermaid-diagram";
  document.body.appendChild(diagramEl);

  // Parse the diagram
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(fullDefinition);
  diagram.parse();

  // Get mermaid parsed data from Jison parser shared variable `yy`
  const mermaidParser = diagram.parser.yy;
  const root = parseRoot(mermaidParser, diagramEl);
  diagramEl.remove();

  return root;
};

/* Parsing Functions */

const parseRoot = (
  mermaidParser: typeof flowDb,
  containerEl: Element
): Graph => {
  const vertices = mermaidParser.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertex(vertices[id], containerEl);
  });
  const edges = mermaidParser
    .getEdges()
    .map((data: any) => parseEdge(data, containerEl));
  const subGraphs = mermaidParser
    .getSubGraphs()
    .map((data) => parseSubGraph(data, containerEl));

  return {
    type: "flowchart",
    subGraphs,
    vertices,
    edges,
  };
};

const parseSubGraph = (data: any, containerEl: Element): SubGraph => {
  // Extract only node id for better reference
  // e.g. full element id = "flowchart-c1-205" will map to "c1"
  const nodeIds = data.nodes.map((n: string) => {
    if (n.startsWith("flowchart-")) {
      return n.split("-")[1];
    }
    return n;
  });

  // Get position
  const el: SVGSVGElement | null = containerEl.querySelector(
    `[id='${data.id}']`
  );
  if (!el) {
    throw new Error("SubGraph element not found");
  }
  const position = computeElementPosition(el, containerEl);

  // Get dimension
  const boundingBox = el.getBBox();
  const dimension = {
    width: boundingBox.width,
    height: boundingBox.height,
  };

  // Remove irrelevant properties
  data.classes = undefined;
  data.dir = undefined;

  return {
    ...data,
    nodeIds,
    ...position,
    ...dimension,
    text: entityCodesToText(data.title),
  };
};

const parseVertex = (data: any, containerEl: Element): Vertex | undefined => {
  // Find Vertex element
  const el: SVGSVGElement | null = containerEl.querySelector(
    `[id*="flowchart-${data.id}-"]`
  );
  if (!el) {
    return undefined;
  }

  // Check if Vertex attached with link
  let link;
  if (el.parentElement?.tagName.toLowerCase() === "a") {
    link = el.parentElement.getAttribute("xlink:href");
  }

  // Get position
  const position = computeElementPosition(
    link ? el.parentElement : el,
    containerEl
  );
  // Get dimension
  const boundingBox = el.getBBox();
  const dimension = {
    width: boundingBox.width,
    height: boundingBox.height,
  };

  // Extract style
  const labelContainerStyleText = el
    .querySelector(".label-container")
    ?.getAttribute("style");
  const labelStyleText = el.querySelector(".label")?.getAttribute("style");

  const containerStyle: Vertex["containerStyle"] = {};
  labelContainerStyleText?.split(";").forEach((property) => {
    if (!property) {
      return;
    }

    const key = property.split(":")[0].trim() as CONTAINER_STYLE_PROPERTY;
    const value = property.split(":")[1].trim();
    containerStyle[key] = value;
  });
  const labelStyle: Vertex["labelStyle"] = {};
  labelStyleText?.split(";").forEach((property) => {
    if (!property) {
      return;
    }

    const key = property.split(":")[0].trim() as LABEL_STYLE_PROPERTY;
    const value = property.split(":")[1].trim();
    labelStyle[key] = value;
  });

  return {
    id: data.id,
    labelType: data.labelType,
    text: entityCodesToText(data.text),
    type: data.type,
    link: link || undefined,
    ...position,
    ...dimension,
    containerStyle,
    labelStyle,
  };
};

const parseEdge = (data: any, containerEl: Element): Edge => {
  // Find edge element
  const el: SVGPathElement | null = containerEl.querySelector(
    `[id*="L-${data.start}-${data.end}"]`
  );
  if (!el) {
    throw new Error("Edge element not found");
  }

  // Compute edge position data
  const position = computeElementPosition(el, containerEl);
  const edgePositionData = computeEdgePositions(el, position);

  // Remove irrelevant properties
  data.length = undefined;

  return {
    ...data,
    ...edgePositionData,
    text: entityCodesToText(data.text),
  };
};

/* Helper Functions */

// Render mermaid diagram
interface MermaidDefinitionOptions {
  curve?: "linear" | "basis";
  fontSize?: number;
}
const renderMermaidToSvg = async (
  mermaid: Mermaid,
  definition: string,
  options?: MermaidDefinitionOptions
): Promise<{ svg: string; fullDefinition: string }> => {
  // Create mermaid diagram definition
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

  // Render the SVG diagram
  const renderResult = await mermaid.render(
    "mermaid-to-excalidraw",
    fullDefinition
  );
  return { svg: renderResult.svg, fullDefinition };
};

// Compute element position
const computeElementPosition = (
  el: Element | null,
  containerEl: Element
): Position => {
  if (!el) {
    throw new Error("Element not found");
  }

  let root = el.parentElement?.parentElement;

  const childElement = el.childNodes[0] as SVGSVGElement;
  let childPosition = { x: 0, y: 0 };
  if (childElement) {
    const { transformX, transformY } = getTransformAttr(childElement);

    const boundingBox = childElement.getBBox();
    childPosition = {
      x:
        Number(childElement.getAttribute("x")) ||
        transformX + boundingBox.x ||
        0,
      y:
        Number(childElement.getAttribute("y")) ||
        transformY + boundingBox.y ||
        0,
    };
  }

  const { transformX, transformY } = getTransformAttr(el);
  const position = {
    x: transformX + childPosition.x,
    y: transformY + childPosition.y,
  };
  while (root && root.id !== containerEl.id) {
    if (root.classList.value === "root" && root.hasAttribute("transform")) {
      const { transformX, transformY } = getTransformAttr(root);
      position.x += transformX;
      position.y += transformY;
    }

    root = root.parentElement;
  }

  return position;
};

// Extract edge position start, end, and points (reflectionPoints)
interface EdgePositionData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}
const computeEdgePositions = (
  pathElement: SVGPathElement,
  offset: Position = { x: 0, y: 0 }
): EdgePositionData => {
  if (pathElement.tagName.toLowerCase() !== "path") {
    throw new Error(
      `Invalid input: Expected an HTMLElement of tag "path", got ${pathElement.tagName}`
    );
  }

  const dAttr = pathElement.getAttribute("d");
  if (!dAttr) {
    throw new Error('Path element does not contain a "d" attribute');
  }

  // Split the d attribute based on M (Move To) and L (Line To) commands
  const commands = dAttr.split(/(?=[LM])/);
  const startPosition = commands[0]
    .substring(1)
    .split(",")
    .map((coord) => parseFloat(coord));
  const endPosition = commands[commands.length - 1]
    .substring(1)
    .split(",")
    .map((coord) => parseFloat(coord));
  const reflectionPoints = commands
    .map((command) => {
      const coords = command
        .substring(1)
        .split(",")
        .map((coord) => parseFloat(coord));
      return { x: coords[0], y: coords[1] };
    })
    .filter((point, index, array) => {
      if (index === array.length - 1) {
        return true;
      }
      const prevPoint = array[index - 1];
      return (
        index === 0 || (point.x !== prevPoint.x && point.y !== prevPoint.y)
      );
    })
    .map((p) => {
      return {
        x: p.x + offset.x,
        y: p.y + offset.y,
      };
    });

  return {
    startX: startPosition[0] + offset.x,
    startY: startPosition[1] + offset.y,
    endX: endPosition[0] + offset.x,
    endY: endPosition[1] + offset.y,
    reflectionPoints,
  };
};
