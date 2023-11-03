import {
  Arrowhead,
  ExcalidrawTextElement,
} from "@excalidraw/excalidraw/types/element/types.js";
import {
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  SubGraph,
  Vertex,
} from "../interfaces.js";
import { ExcalidrawVertexElement } from "../types.js";
import { Mutable } from "@excalidraw/excalidraw/types/utility-types.js";
import { removeMarkdown } from "@excalidraw/markdown-to-text";
import { Edge } from "../parser/flowchart.js";

/**
 * Compute groupIds for each element
 */
export interface ArrowType {
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
}
/**
 * Convert mermaid edge type to Excalidraw arrow type
 */
const MERMAID_EDGE_TYPE_MAPPER: { [key: string]: ArrowType } = {
  arrow_circle: {
    endArrowhead: "dot",
  },
  arrow_cross: {
    endArrowhead: "bar",
  },
  double_arrow_circle: {
    endArrowhead: "dot",
    startArrowhead: "dot",
  },
  double_arrow_cross: {
    endArrowhead: "bar",
    startArrowhead: "bar",
  },
  double_arrow_point: {
    endArrowhead: "arrow",
    startArrowhead: "arrow",
  },
};

export const computeExcalidrawArrowType = (
  mermaidArrowType: string
): ArrowType => {
  return MERMAID_EDGE_TYPE_MAPPER[mermaidArrowType];
};

// Get text from graph elements, fallback markdown to text
export const getText = (element: Vertex | Edge | SubGraph): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    text = removeMarkdown(element.text);
  }

  return removeFontAwesomeIcons(text);
};

/**
 * Remove font awesome icons support from text
 */
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};

/**
 * Compute style for vertex
 */
export const computeExcalidrawVertexStyle = (
  style: Vertex["containerStyle"]
): Partial<Mutable<ExcalidrawVertexElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawVertexElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case CONTAINER_STYLE_PROPERTY.FILL: {
        excalidrawProperty.backgroundColor = style[property];
        excalidrawProperty.fillStyle = "solid";
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH: {
        excalidrawProperty.strokeWidth = Number(
          style[property]?.split("px")[0]
        );
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY: {
        excalidrawProperty.strokeStyle = "dashed";
        break;
      }
    }
  });
  return excalidrawProperty;
};

/**
 * Compute style for label
 */
export const computeExcalidrawVertexLabelStyle = (
  style: Vertex["labelStyle"]
): Partial<Mutable<ExcalidrawTextElement>> => {
  const excalidrawProperty: Partial<Mutable<ExcalidrawTextElement>> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case LABEL_STYLE_PROPERTY.COLOR: {
        excalidrawProperty.strokeColor = style[property];
        break;
      }
    }
  });
  return excalidrawProperty;
};
