import { GraphConverter } from "../GraphConverter";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";
import {
  CONTAINER_STYLE_PROPERTY,
  Edge,
  Graph,
  LABEL_STYLE_PROPERTY,
  Position,
  SubGraph,
  VERTEX_TYPE,
  Vertex,
} from "../../interfaces";
import {
  computeGroupIds,
  getText,
  computeExcalidrawVertexStyle,
  computeExcalidrawVertexLabelStyle,
  computeExcalidrawArrowType,
} from "../helpers";
import { entityCodesToText } from "../../utils";

import { Diagram } from "mermaid/dist/Diagram";

export const FlowchartToExcalidrawSkeletonConverter = new GraphConverter({
  converter: (graph, options) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const fontSize = options.fontSize;
    const { getGroupIds, getParentId } = computeGroupIds(graph);

    // SubGraphs
    graph.subGraphs.reverse().forEach((subGraph) => {
      const groupIds = getGroupIds(subGraph.id);

      const containerElement: ExcalidrawElementSkeleton = {
        id: subGraph.id,
        type: "rectangle",
        groupIds,
        x: subGraph.x,
        y: subGraph.y,
        width: subGraph.width,
        height: subGraph.height,
        label: {
          groupIds,
          text: getText(subGraph),
          fontSize,
          verticalAlign: "top",
        },
      };

      elements.push(containerElement);
    });

    // Vertices
    Object.values(graph.vertices).forEach((vertex) => {
      if (!vertex) {
        return;
      }
      const groupIds = getGroupIds(vertex.id);

      // Compute custom style
      const containerStyle = computeExcalidrawVertexStyle(
        vertex.containerStyle
      );
      const labelStyle = computeExcalidrawVertexLabelStyle(vertex.labelStyle);

      let containerElement: ExcalidrawElementSkeleton = {
        id: vertex.id,
        type: "rectangle",
        groupIds,
        x: vertex.x,
        y: vertex.y,
        width: vertex.width,
        height: vertex.height,
        strokeWidth: 2,
        label: {
          groupIds,
          text: getText(vertex),
          fontSize,
          ...labelStyle,
        },
        link: vertex.link || null,
        ...containerStyle,
      };

      switch (vertex.type) {
        case VERTEX_TYPE.STADIUM: {
          containerElement = { ...containerElement, roundness: { type: 3 } };
          break;
        }
        case VERTEX_TYPE.ROUND: {
          containerElement = { ...containerElement, roundness: { type: 3 } };
          break;
        }
        case VERTEX_TYPE.DOUBLECIRCLE: {
          const CIRCLE_MARGIN = 5;
          // Create new groupId for double circle
          groupIds.push(`doublecircle_${vertex.id}}`);
          // Create inner circle element
          const innerCircle: ExcalidrawElementSkeleton = {
            type: "ellipse",
            groupIds,
            x: vertex.x + CIRCLE_MARGIN,
            y: vertex.y + CIRCLE_MARGIN,
            width: vertex.width - CIRCLE_MARGIN * 2,
            height: vertex.height - CIRCLE_MARGIN * 2,
            strokeWidth: 2,
            roundness: { type: 3 },
            label: {
              groupIds,
              text: getText(vertex),
              fontSize,
            },
          };
          containerElement = { ...containerElement, groupIds, type: "ellipse" };
          elements.push(innerCircle);
          break;
        }
        case VERTEX_TYPE.CIRCLE: {
          containerElement.type = "ellipse";
          break;
        }
        case VERTEX_TYPE.DIAMOND: {
          containerElement.type = "diamond";
          break;
        }
      }

      elements.push(containerElement);
    });

    // Edges
    graph.edges.forEach((edge) => {
      let groupIds: string[] = [];
      const startParentId = getParentId(edge.start);
      const endParentId = getParentId(edge.end);
      if (startParentId && startParentId === endParentId) {
        groupIds = getGroupIds(startParentId);
      }

      // Get arrow position data
      const { startX, startY, reflectionPoints } = edge;

      // Calculate Excalidraw arrow's points
      const points = reflectionPoints.map((point) => [
        point.x - reflectionPoints[0].x,
        point.y - reflectionPoints[0].y,
      ]);

      // Get supported arrow type
      const arrowType = computeExcalidrawArrowType(edge.type);

      const arrowId = `${edge.start}_${edge.end}`;
      const containerElement: ExcalidrawElementSkeleton = {
        id: arrowId,
        type: "arrow",
        groupIds,
        x: startX,
        y: startY,
        // 4 and 2 are the Excalidraw's stroke width of thick and thin respectively
        // TODO: use constant exported from Excalidraw package
        strokeWidth: edge.stroke === "thick" ? 4 : 2,
        strokeStyle: edge.stroke === "dotted" ? "dashed" : undefined,
        points,
        ...(edge.text
          ? { label: { text: getText(edge), fontSize, groupIds } }
          : {}),
        roundness: {
          type: 2,
        },
        ...arrowType,
      };

      // Bind start and end vertex to arrow
      const startVertex = elements.find((e) => e.id === edge.start);
      const endVertex = elements.find((e) => e.id === edge.end);
      if (!startVertex || !endVertex) {
        return;
      }

      containerElement.start = {
        id: startVertex.id || "",
      };
      containerElement.end = {
        id: endVertex.id || "",
      };

      elements.push(containerElement);
    });

    return {
      elements,
    };
  },
});

export const parseMermaidFlowChartDiagram = (
  diagram: Diagram,
  containerEl: Element
): Graph => {
  // This does some cleanup and initialization making sure
  // diagram is parsed correctly. Useful when multiple diagrams are
  // parsed together one after another, eg in playground
  // https://github.com/mermaid-js/mermaid/blob/e561cbd3be2a93b8bedfa4839484966faad92ccf/packages/mermaid/src/Diagram.ts#L43
  diagram.parse();

  // Get mermaid parsed data from parser shared variable `yy`
  const mermaidParser = diagram.parser.yy;
  const vertices = mermaidParser.getVertices();
  Object.keys(vertices).forEach((id) => {
    vertices[id] = parseVertex(vertices[id], containerEl);
  });
  const edges = mermaidParser
    .getEdges()
    .map((data: any) => parseEdge(data, containerEl));
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
