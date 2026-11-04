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

/** A color's channels (0–255) and alpha (0–1). */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const COLOR_FUNCTION = /^(rgba?|hsla?)\(\s*([^)]*)\)$/i;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseHexColor = (value: string): RGBA | undefined => {
  const hex = value.match(HEX_COLOR)?.[1];
  if (!hex) {
    return undefined;
  }
  const digits =
    hex.length <= 4 ? hex.replace(/./g, (digit) => digit + digit) : hex;
  const [r, g, b, a = 255] = (digits.match(/../g) ?? []).map((pair) =>
    parseInt(pair, 16)
  );
  return { r, g, b, a: a / 255 };
};

/** A number, or a percentage of `max` (`50%`). */
const parseNumberOrPercentage = (value: string, max: number) => {
  const number = parseFloat(value);
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?%?$/i.test(value)) {
    return undefined;
  }
  return value.endsWith("%") ? (number / 100) * max : number;
};

const HUE_UNITS: Record<string, number> = {
  "": 1,
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360,
};

const parseHue = (value: string) => {
  const [, number, unit] =
    value.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)([a-z]*)$/i) ?? [];
  const scale = HUE_UNITS[unit?.toLowerCase() ?? ""];
  return number === undefined || scale === undefined
    ? undefined
    : (((parseFloat(number) * scale) % 360) + 360) % 360;
};

const hslToRgb = (hue: number, saturation: number, lightness: number) => {
  const amount = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    return (lightness - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return { r: channel(0), g: channel(8), b: channel(4) };
};

/** `rgb()`, `rgba()`, `hsl()` and `hsla()`, with commas or spaces. */
const parseColorFunction = (value: string): RGBA | undefined => {
  const [, name, args] = value.match(COLOR_FUNCTION) ?? [];
  if (!name) {
    return undefined;
  }
  const parts = args.split(/\s*[\s,/]\s*/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) {
    return undefined;
  }
  const alpha =
    parts[3] === undefined ? 1 : parseNumberOrPercentage(parts[3], 1);
  let rgb;
  if (name.toLowerCase().startsWith("rgb")) {
    const [r, g, b] = parts
      .slice(0, 3)
      .map((part) => parseNumberOrPercentage(part, 255));
    rgb =
      r === undefined || g === undefined || b === undefined
        ? undefined
        : { r, g, b };
  } else {
    const hue = parseHue(parts[0]);
    const [saturation, lightness] = parts
      .slice(1, 3)
      .map((part) => parseNumberOrPercentage(part.replace(/%?$/, "%"), 1));
    rgb =
      hue === undefined || saturation === undefined || lightness === undefined
        ? undefined
        : hslToRgb(hue, clamp(saturation, 0, 1), clamp(lightness, 0, 1));
  }
  if (!rgb || alpha === undefined) {
    return undefined;
  }
  return {
    r: clamp(rgb.r, 0, 255),
    g: clamp(rgb.g, 0, 255),
    b: clamp(rgb.b, 0, 255),
    a: clamp(alpha, 0, 1),
  };
};

let colorContext:
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D
  | null
  | undefined;

/**
 * A color as a canvas serializes it (hex, or `rgba()` if translucent), e.g.
 * `#663399` for `rebeccapurple`, if there's a canvas.
 */
const normalizeWithCanvas = (value: string) => {
  if (colorContext === undefined) {
    try {
      colorContext =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(1, 1).getContext("2d")
          : typeof document !== "undefined"
          ? document.createElement("canvas").getContext("2d")
          : null;
    } catch {
      colorContext = null;
    }
  }
  if (!colorContext) {
    return undefined;
  }
  // (an invalid color leaves the previous one)
  colorContext.fillStyle = "#000000";
  colorContext.fillStyle = value;
  const normalized = colorContext.fillStyle;
  return typeof normalized === "string" ? normalized : undefined;
};

/**
 * A CSS color's channels: hex, `rgb()` and `hsl()` colors, and others (e.g.
 * named colors) where there's a canvas to normalize them with.
 */
export const parseCSSColor = (value: string): RGBA | undefined => {
  const color = cleanCSSValue(value);
  const parse = (candidate: string) =>
    parseHexColor(candidate) ?? parseColorFunction(candidate);
  const parsed = parse(color);
  if (parsed || !isValidCSSColor(color)) {
    return parsed;
  }
  const normalized = normalizeWithCanvas(color);
  return normalized ? parse(normalized) : undefined;
};
