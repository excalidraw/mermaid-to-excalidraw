import { Mermaid } from "mermaid";

interface Graph {}
export const parseMermaid = async (
  mermaid: Mermaid,
  diagramDefinition: string
): Promise<Graph> => {
  const div = document.createElement("div");
  div.id = `mermaidToExcalidraw`;
  div.setAttribute(
    "style",
    `opacity: 0; position: absolute; top: -10000px; left: -10000px;`
  );
  const { svg } = await mermaid.render(div.id, diagramDefinition);
  div.innerHTML = `<div id="diagram">${svg}</div>`;
  document.body.appendChild(div);
  const diagramEl = div.querySelector("#diagram");

  const definition = `%%{init: {"flowchart": {"curve": "linear"}} }%%\n${diagramDefinition}`;
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(definition);
  diagram.parse();
  const graph = diagram.parser.yy;

  const root = parseRoot(graph, diagramEl);
  div.remove();
  return root;
};

const parseRoot = (graph, containerEl) => {
  const vertices = graph.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertice(vertices[id], containerEl);
  });
  const edges = graph.getEdges().map((e) => parseEdge(e, containerEl));
  const clusters = graph
    .getSubGraphs()
    .map((c) => parseCluster(c, containerEl));

  return {
    clusters,
    vertices,
    edges,
  };
};

// {
//   "id": "B1",
//   "nodes": [
//     "flowchart-f1-506",
//     "flowchart-i1-505"
//   ],
//   "title": "B1",
//   "dir": "RL",
//   "labelType": "text"
// },
const parseCluster = (node, containerEl) => {
  const el = containerEl.querySelector("#" + node.id);

  let dimention = { x: 0, y: 0 };
  let root = el.parentElement.parentElement;
  if (root.classList.value === "root" && root.hasAttribute("transform")) {
    while (true) {
      if (root.classList.value === "root" && root.hasAttribute("transform")) {
        const style = getComputedStyle(root);
        const matrix = new DOMMatrixReadOnly(style.transform);
        dimention.x += matrix.m41;
        dimention.y += matrix.m42;
      }

      root = root.parentElement;
      if (root.id === containerEl.id) break;
    }
  } else {
    const rect = el.querySelector("rect");
    dimention = {
      x: +(rect.getAttribute("x") || 0),
      y: +(rect.getAttribute("y") || 0),
    };
  }

  // const style = getComputedStyle(el);
  // const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = el.getBoundingClientRect();
  const nodes = node.nodes.map((n) => {
    if (n.startsWith("flowchart-")) {
      return n.split("-")[1];
    }
    return n;
  });

  return {
    ...node,
    nodes,
    classes: undefined,
    dir: undefined,
    ...dimention,
    width: rect.width,
    height: rect.height,
  };
};

// "vertices": {
//   "Start": {
//     "id": "Start",
//     "labelType": "text",
//     "domId": "flowchart-Start-14",
//     "styles": [],
//     "classes": [],
//     "text": "Start",
//     "props": {}
//   },
//   "Stop": {
//     "id": "Stop",
//     "labelType": "text",
//     "domId": "flowchart-Stop-15",
//     "styles": [],
//     "classes": [],
//     "text": "Stop",
//     "props": {}
//   }
// }
const parseVertice = (v, containerEl) => {
  const el = containerEl.querySelector(`[id*="flowchart-${v.id}-"]`);
  // if element not found (mean el = cluster), ignore
  if (!el) return;

  let link;
  if (el.parentElement.tagName.toLowerCase() === "a")
    link = el.parentElement.getAttribute("xlink:href");

  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(link ? el.parentElement : el);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const position = {
    x: matrix.m41 - rect.width / 2,
    y: matrix.m42 - rect.height / 2,
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

  // convert type
  let type = v.type;
  if (["stadium", "subroutine", "cylinder"].includes(type)) type = undefined;

  return {
    id: v.id,
    labelType: v.labelType, // text, markdown
    text: v.text,
    type,
    link,
    ...position,
    width: rect.width,
    height: rect.height,
  };
};

// {
//   "start": "A",
//   "end": "B",
//   "type": "arrow_point",
//   "text": "text",
//   "labelType": "text",
//   "stroke": "thick",
//   "length": 1
// }
const parseEdge = (node, containerEl) => {
  node.length = undefined;
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

  return {
    ...node,
    ...position,
  };
};
