import {
  computeEdgePositions,
  entityCodesToText,
  getTransformAttr,
} from "../utils.js";
import {
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  Position,
  SubGraph,
  Vertex,
} from "../interfaces.js";

import type { Diagram } from "mermaid/dist/Diagram.js";

export interface Flowchart {
  type: "flowchart";
  subGraphs: SubGraph[];
  vertices: { [key: string]: Vertex | undefined };
  edges: Edge[];
}

export interface Edge {
  id?: string;
  start: string;
  end: string;
  type: string;
  text: string;
  labelType: string;
  stroke: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}

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

const parseEdge = (
  data: any,
  edgeIndex: number,
  containerEl: Element
): Edge => {
  // Find edge element
  const edge = containerEl.querySelector<SVGPathElement>(
    `[id*="L-${data.start}-${data.end}-${edgeIndex}"]`
  );

  if (!edge) {
    throw new Error("Edge element not found");
  }

  // Compute edge position data
  const position = computeElementPosition(edge, containerEl);
  const edgePositionData = computeEdgePositions(edge, position);

  // Remove irrelevant properties
  data.length = undefined;

  return {
    ...data,
    ...edgePositionData,
    text: entityCodesToText(data.text),
  };
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

export const parseMermaidFlowChartDiagram = (
  diagram: Diagram,
  containerEl: Element
): Flowchart => {
  // This does some cleanup and initialization making sure
  // diagram is parsed correctly. Useful when multiple diagrams are
  // parsed together one after another, eg in playground
  // https://github.com/mermaid-js/mermaid/blob/e561cbd3be2a93b8bedfa4839484966faad92ccf/packages/mermaid/src/Diagram.ts#L43
  diagram.parse();

  // Get mermaid parsed data from parser shared variable `yy`
  //@ts-ignore
  const mermaidParser = diagram.parser.yy;
  const vertices = mermaidParser.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertex(vertices[id], containerEl);
  });

  // Track the count of edges based on the edge id
  const edgeCountMap = new Map<string, number>();
  const edges = mermaidParser
    .getEdges()
    .filter((edge: any) => {
      // Sometimes mermaid parser returns edges which are not present in the DOM hence this is a safety check to only consider edges present in the DOM, issue - https://github.com/mermaid-js/mermaid/issues/5516
      return containerEl.querySelector(`[id*="L-${edge.start}-${edge.end}"]`);
    })
    .map((data: any) => {
      const edgeId = `${data.start}-${data.end}`;

      const count = edgeCountMap.get(edgeId) || 0;
      edgeCountMap.set(edgeId, count + 1);

      return parseEdge(data, count, containerEl);
    });

  const subGraphs = mermaidParser
    .getSubGraphs()
    .map((data: any) => parseSubGraph(data, containerEl));

  return {
    type: "flowchart",
    subGraphs,
    vertices,
    edges,
  };
};
