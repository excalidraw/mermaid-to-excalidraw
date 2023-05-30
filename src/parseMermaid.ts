import { Mermaid } from "mermaid";

interface Cluster {
  id: string;
  labelType: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  link?: string;
}
interface Vertice {
  id: string;
  nodes: string[];
  title: string;
  labelType: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
interface Position {
  x: number;
  y: number;
}
interface Edge {
  start: string;
  end: string;
  type: string;
  labelType: string;
  stroke: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}
interface Graph {
  clusters: Cluster[];
  vertices: { [key: string]: Vertice };
  edges: Edge[];
}

interface ParseMermaidOptions {
  fontSize?: number;
}
export const parseMermaid = async (
  mermaid: Mermaid,
  diagramDefinition: string,
  options: ParseMermaidOptions = {}
): Promise<Graph> => {
  const fontSize = options.fontSize || 16;

  // Check supported diagram type
  if (!isSupportedDiagram(diagramDefinition)) {
    throw new Error("Unsupported diagram type");
  }

  // Add options for rendering flowchart in linear curves (for better extracting arrow path points) and custom font size
  const definition = `%%{init: {"flowchart": {"curve": "linear"}, "themeVariables": {"fontSize": "${fontSize}px"}} }%%\n${diagramDefinition}`;

  // Render the SVG diagram
  const div = document.createElement("div");
  div.id = `mermaidToExcalidraw`;
  div.setAttribute(
    "style",
    `opacity: 0; position: absolute; top: -10000px; left: -10000px;`
  );
  const { svg } = await mermaid.render(div.id, definition);
  div.innerHTML = `<div id="diagram">${svg}</div>`;
  document.body.appendChild(div);
  const diagramEl = div.querySelector("#diagram");

  // Parse the diagram
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(definition);
  diagram.parse();
  const mermaidParser = diagram.parser.yy;
  const root = parseRoot(mermaidParser, diagramEl);

  // Remove the rendered diagram
  div.remove();

  return root;
};

/* Parsing Functions */
const parseRoot = (mermaidParser, containerEl: Element): Graph => {
  const vertices = mermaidParser.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });
  const edges = mermaidParser
    .getEdges()
    .map((data) => parseEdge(data, containerEl));
  const clusters = mermaidParser
    .getSubGraphs()
    .map((data) => parseCluster(data, containerEl));

  return {
    clusters,
    vertices,
    edges,
  };
};

const computeElementPosition = (
  el: Element,
  containerEl: Element
): Position => {
  let root = el.parentElement.parentElement;
  const rect = el.querySelector("rect");
  let position = {
    x: +(rect.getAttribute("x") || 0),
    y: +(rect.getAttribute("y") || 0),
  };
  while (root && root.id !== containerEl.id) {
    if (root.classList.value === "root" && root.hasAttribute("transform")) {
      const style = getComputedStyle(root);
      const matrix = new DOMMatrixReadOnly(style.transform);
      position.x += matrix.m41;
      position.y += matrix.m42;
    }

    root = root.parentElement;
  }
  return position;
};

const parseCluster = (data, containerEl: Element): Cluster => {
  // Extract only node id
  const nodes = data.nodes.map((n) => {
    if (n.startsWith("flowchart-")) {
      return n.split("-")[1];
    }
    return n;
  });

  // Get position
  const el: SVGSVGElement = containerEl.querySelector("#" + data.id);
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
    nodes,
    ...position,
    ...dimension,
    title: entityCodesToText(data.title),
  };
};

const parseVertice = (v, containerEl) => {
  // find vertice element
  const el = containerEl.querySelector(`[id*="flowchart-${v.id}-"]`);
  // if element not found (mean el = cluster), ignore
  if (!el) return;

  // check if vertice have a link
  let link;
  if (el.parentElement.tagName.toLowerCase() === "a")
    link = el.parentElement.getAttribute("xlink:href");

  const boundingBox = el.getBBox();
  const style = getComputedStyle(link ? el.parentElement : el);
  const matrix = new DOMMatrixReadOnly(style.transform);

  const position = {
    x: matrix.m41 - boundingBox.width / 2,
    y: matrix.m42 - boundingBox.height / 2,
  };
  let root = el.parentElement.parentElement;
  while (true) {
    if (root.classList.value === "root" && root.hasAttribute("transform")) {
      const style = getComputedStyle(root);
      const matrix = new DOMMatrixReadOnly(style.transform);
      position.x += matrix.m41;
      position.y += matrix.m42;
    }

    root = root.parentElement;
    if (root.id === containerEl.id) break;
  }

  return {
    id: v.id,
    labelType: v.labelType, // text, markdown
    text: entityCodesToText(v.text),
    type: v.type,
    link,
    ...position,
    width: boundingBox.width,
    height: boundingBox.height,
  };
};

const parseEdge = (node, containerEl) => {
  // extract edge position start, end, and points (reflectionPoints)
  function extractPositions(pathElement, offset = { x: 0, y: 0 }) {
    if (pathElement.tagName.toLowerCase() !== "path") {
      throw new Error(
        'Invalid input: Expected an HTMLElement of tag "path", got ' +
          pathElement.tagName
      );
    }

    const dAttribute = pathElement.getAttribute("d");
    if (!dAttribute) {
      throw new Error('Path element does not contain a "d" attribute');
    }

    const commands = dAttribute.split(/(?=[LM])/);
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
  }

  // find edge element
  const el = containerEl.querySelector(`[id*="L-${node.start}-${node.end}"]`);

  let offset = { x: 0, y: 0 };
  let root = el.parentElement.parentElement;
  while (true) {
    if (root.classList.value === "root" && root.hasAttribute("transform")) {
      const style = getComputedStyle(root);
      const matrix = new DOMMatrixReadOnly(style.transform);
      offset.x += matrix.m41;
      offset.y += matrix.m42;
    }

    root = root.parentElement;
    if (root.id === containerEl.id) break;
  }

  const position = extractPositions(el, offset);
  node.length = undefined;

  return {
    ...node,
    ...position,
    text: entityCodesToText(node.text),
  };
};

/* Helper Functions */
// Check if the definition is a supported diagram
const isSupportedDiagram = (definition: string): boolean => {
  if (definition.trim().startsWith("flowchart")) {
    return true;
  }
  return false;
};

// Convert mermaid entity codes to text
const entityCodesToText = (input: string): string => {
  const modifiedInput = input
    .replace(/#(\d+);/g, "&#$1;")
    .replace(/#([a-z]+);/g, "&$1;");
  const element = document.createElement("textarea");
  element.innerHTML = modifiedInput;
  return element.value;
};
