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

const looksLikeDeclarationStart = (input: string, index: number) => {
  let cursor = index;
  while (cursor < input.length && /\s/.test(input[cursor])) {
    cursor += 1;
  }

  const propertyStart = cursor;
  while (cursor < input.length && /[a-z-]/i.test(input[cursor])) {
    cursor += 1;
  }

  if (cursor === propertyStart) {
    return false;
  }

  while (cursor < input.length && /\s/.test(input[cursor])) {
    cursor += 1;
  }

  return input[cursor] === ":";
};

export const parseCSSDeclarations = (
  input: string
): Array<{ property: string; value: string }> => {
  const declarations: Array<{ property: string; value: string }> = [];
  let cursor = 0;

  while (cursor < input.length) {
    while (cursor < input.length && /[\s;,]/.test(input[cursor])) {
      cursor += 1;
    }

    if (cursor >= input.length) {
      break;
    }

    const propertyStart = cursor;
    while (cursor < input.length && input[cursor] !== ":") {
      if (input[cursor] === ";" || input[cursor] === ",") {
        break;
      }
      cursor += 1;
    }

    if (cursor >= input.length || input[cursor] !== ":") {
      break;
    }

    const property = input
      .substring(propertyStart, cursor)
      .trim()
      .toLowerCase();
    cursor += 1;

    const valueStart = cursor;
    let parenthesesDepth = 0;
    let quote: '"' | "'" | null = null;

    while (cursor < input.length) {
      const currentChar = input[cursor];

      if (quote) {
        if (currentChar === quote && input[cursor - 1] !== "\\") {
          quote = null;
        }
        cursor += 1;
        continue;
      }

      if (currentChar === '"' || currentChar === "'") {
        quote = currentChar;
        cursor += 1;
        continue;
      }

      if (currentChar === "(") {
        parenthesesDepth += 1;
        cursor += 1;
        continue;
      }

      if (currentChar === ")") {
        parenthesesDepth = Math.max(0, parenthesesDepth - 1);
        cursor += 1;
        continue;
      }

      if (parenthesesDepth === 0) {
        if (currentChar === ";" || currentChar === ",") {
          break;
        }

        if (
          /\s/.test(currentChar) &&
          looksLikeDeclarationStart(input, cursor)
        ) {
          break;
        }
      }

      cursor += 1;
    }

    const value = cleanCSSValue(input.substring(valueStart, cursor));
    if (property && value) {
      declarations.push({ property, value });
    }

    if (
      cursor < input.length &&
      (input[cursor] === ";" || input[cursor] === ",")
    ) {
      cursor += 1;
    }
  }

  return declarations;
};

export const isValidCSSColor = (value: string): boolean => {
  const cleanedValue = cleanCSSValue(value);
  if (!cleanedValue) {
    return false;
  }

  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", cleanedValue);
  }

  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.style.color = "";
    element.style.color = cleanedValue;
    return element.style.color !== "";
  }

  return false;
};

const getStyleDeclarationValue = (element: Element, property: string) => {
  const styleText = element.getAttribute("style");
  if (!styleText) {
    return "";
  }

  return (
    parseCSSDeclarations(styleText).find(
      (declaration) => declaration.property === property
    )?.value || ""
  );
};

const resolveFirstValidCSSColor = (
  ...values: Array<string | null | undefined>
): string | undefined => {
  for (const rawValue of values) {
    const value = cleanCSSValue(rawValue || "");
    if (isValidCSSColor(value)) {
      return value;
    }
  }

  return undefined;
};

export const resolveElementTextColor = (
  node: Element,
  fallbackColor?: string
): string | undefined => {
  const textNode =
    node.querySelector<HTMLElement>("text, foreignObject, div, span, p") ||
    (node as HTMLElement);

  const inlineFill = resolveFirstValidCSSColor(
    textNode.getAttribute?.("fill"),
    getStyleDeclarationValue(textNode, "fill"),
    (textNode as any).style?.fill
  );
  if (inlineFill) {
    return inlineFill;
  }

  const inlineColor = resolveFirstValidCSSColor(
    textNode.getAttribute?.("color"),
    getStyleDeclarationValue(textNode, "color"),
    (textNode as any).style?.color
  );
  if (inlineColor) {
    return inlineColor;
  }

  const explicitFallbackColor = resolveFirstValidCSSColor(fallbackColor);
  if (explicitFallbackColor) {
    return explicitFallbackColor;
  }
  return undefined;
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
    .flatMap((style) =>
      parseCSSDeclarations(style).map(
        ({ property, value }) => `${property}:${value}`
      )
    )
    .filter((style) => style.length > 0);
};
