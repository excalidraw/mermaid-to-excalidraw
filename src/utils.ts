import { SUPPORTED_CHART_TYPES } from "./constants";

// Check if the definition is a supported diagram
export const isSupportedDiagram = (definition: string): boolean => {
  return SUPPORTED_CHART_TYPES.some((chartType) =>
    definition.trim().startsWith(chartType)
  );
};

// Convert mermaid entity codes to text e.g. "#9829;" to "♥"
export const entityCodesToText = (input: string): string => {
  const modifiedInput = input
    .replace(/#(\d+);/g, "&#$1;")
    .replace(/#([a-z]+);/g, "&$1;");
  const element = document.createElement("textarea");
  element.innerHTML = modifiedInput;
  return element.value;
};
