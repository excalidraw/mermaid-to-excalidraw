/**
 * Cleans CSS property values by removing !important and trimming whitespace
 * This ensures that colors and other CSS values are valid and don't contain
 * CSS priority declarations that could cause issues in rendering.
 *
 * @param value - The CSS value to clean
 * @returns The cleaned CSS value without !important
 *
 * @example
 * cleanCSSValue("red !important") // => "red"
 * cleanCSSValue("  blue  ") // => "blue"
 * cleanCSSValue("#ff0000 !IMPORTANT") // => "#ff0000"
 */
export const cleanCSSValue = (value: string): string => {
  return value.replace(/\s*!important\s*$/i, "").trim();
};

/**
 * Cleans an array of CSS style strings, removing !important from each value
 * This is useful for processing style arrays from Mermaid data structures.
 *
 * @param styles - Array of CSS style strings (e.g., ["fill:#fff !important", "stroke:#000"])
 * @returns Array of cleaned CSS style strings
 *
 * @example
 * cleanCSSStyles(["fill:#fff !important", "stroke:#000"]) // => ["fill:#fff", "stroke:#000"]
 */
export const cleanCSSStyles = (styles: string[]): string[] => {
  return styles
    .map((style) => {
      // Split on colon to get property and value
      const colonIndex = style.indexOf(":");
      if (colonIndex === -1) {
        return style;
      }

      const property = style.substring(0, colonIndex).trim();
      const value = cleanCSSValue(style.substring(colonIndex + 1));

      return value ? `${property}:${value}` : "";
    })
    .filter((style) => style.length > 0);
};
