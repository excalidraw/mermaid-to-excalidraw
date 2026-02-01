import { Position } from "./interfaces.js";

// Convert mermaid entity codes to text e.g. "#9829;" to "♥"
export const entityCodesToText = (input: string): string => {
  input = decodeEntities(input);
  // Append & before the pattern #(\d+); or #([a-z]+); to convert to decimal code
  // so it can be rendered as html character
  // eg #9829; => &#9829;
  const inputWithDecimalCode = input
    .replace(/#(\d+);/g, "&#$1;")
    .replace(/#([a-z]+);/g, "&$1;");

  // Render the decimal code as html character, eg &#9829; => ♥
  const element = document.createElement("textarea");
  element.innerHTML = inputWithDecimalCode;
  return element.value;
};

export const getTransformAttr = (el: Element) => {
  const transformAttr = el.getAttribute("transform");
  const translateMatch = transformAttr?.match(
    /translate\(([ \d.-]+),\s*([\d.-]+)\)/
  );
  let transformX = 0;
  let transformY = 0;
  if (translateMatch) {
    transformX = Number(translateMatch[1]);
    transformY = Number(translateMatch[2]);
  }
  return { transformX, transformY };
};

//TODO Once fixed in mermaid this will be removed
export const encodeEntities = (text: string) => {
  let txt = text;

  txt = txt.replace(/style.*:\S*#.*;/g, (s) => {
    return s.substring(0, s.length - 1);
  });
  txt = txt.replace(/classDef.*:\S*#.*;/g, (s) => {
    return s.substring(0, s.length - 1);
  });

  txt = txt.replace(/#\w+;/g, (s) => {
    const innerTxt = s.substring(1, s.length - 1);

    const isInt = /^\+?\d+$/.test(innerTxt);
    if (isInt) {
      return `ﬂ°°${innerTxt}¶ß`;
    }
    return `ﬂ°${innerTxt}¶ß`;
  });

  return txt;
};

export const decodeEntities = function (text: string): string {
  return text.replace(/ﬂ°°/g, "#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");
};

// Extract edge position start, end, and points (reflectionPoints)
interface EdgePositionData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}

// Parse coordinates from a path command string

const parseCoordinates = (coordStr: string): number[] => {
  // Split by comma or space, filter empty strings, and parse as numbers
  return coordStr
    .trim()
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map((coord) => parseFloat(coord));
};

/**
 * Extract the endpoint from a path command
 * For curves (C, S, Q, T), this is the last coordinate pair
 * For lines (L, M), this is the coordinate pair
 */
const getEndpointFromCommand = (command: string): Position | null => {
  const type = command[0].toUpperCase();
  const coordStr = command.substring(1).trim();
  const coords = parseCoordinates(coordStr);

  if (coords.length < 2) {
    return null;
  }

  switch (type) {
    case "M": // Move to: x,y
    case "L": // Line to: x,y
      return { x: coords[0], y: coords[1] };

    case "C": // Cubic Bezier: x1,y1 x2,y2 x,y (endpoint is last pair)
      if (coords.length >= 6) {
        return { x: coords[4], y: coords[5] };
      }
      break;

    case "S": // Smooth cubic Bezier: x2,y2 x,y (endpoint is last pair)
    case "Q": // Quadratic Bezier: x1,y1 x,y (endpoint is last pair)
      if (coords.length >= 4) {
        return { x: coords[2], y: coords[3] };
      }
      break;

    case "T": // Smooth quadratic Bezier: x,y
      return { x: coords[0], y: coords[1] };

    case "A": // Arc: rx ry x-axis-rotation large-arc-flag sweep-flag x y
      if (coords.length >= 7) {
        return { x: coords[5], y: coords[6] };
      }
      break;

    case "H": // Horizontal line: x (y stays the same - we can't determine this without context)
    case "V": // Vertical line: y (x stays the same - we can't determine this without context)
      // These are relative and need context, return null
      return null;

    case "Z": // Close path
      return null;
  }

  return null;
};

// Compute edge postion start, end and points (reflection points)
export const computeEdgePositions = (
  pathElement: SVGPathElement,
  offset: Position = { x: 0, y: 0 }
): EdgePositionData => {
  // Check if the element is a path else throw an error
  if (pathElement.tagName.toLowerCase() !== "path") {
    throw new Error(
      `Invalid input: Expected an HTMLElement of tag "path", got ${pathElement.tagName}`
    );
  }

  // Get the d attribute from the path element else throw an error
  const dAttr = pathElement.getAttribute("d");
  if (!dAttr) {
    throw new Error('Path element does not contain a "d" attribute');
  }

  // Split the d attribute based on SVG path commands
  // Handles M (Move), L (Line), C (Cubic Bezier), S (Smooth Cubic), Q (Quadratic), T (Smooth Quadratic), A (Arc)
  // eg "M50,100C60,80,80,60,100,50L150,50" => ["M50,100", "C60,80,80,60,100,50", "L150,50"]
  const commands = dAttr.match(/[MLCSQTAHVZ][^MLCSQTAHVZ]*/gi) || [];

  if (commands.length === 0) {
    throw new Error("No valid path commands found in path element");
  }

  // Extract all endpoints from commands
  const points: Position[] = [];

  for (const command of commands) {
    const endpoint = getEndpointFromCommand(command);
    if (endpoint) {
      points.push(endpoint);
    }
  }

  if (points.length === 0) {
    throw new Error("Could not extract any points from path commands");
  }

  // Get start and end positions
  const startPosition = points[0];
  const endPosition = points[points.length - 1];

  // Filter reflection points to remove duplicates and unnecessary points
  const reflectionPoints = points
    .filter((point, index, array) => {
      // Always include the first and last points
      if (index === 0 || index === array.length - 1) {
        return true;
      }

      // Exclude points that are the same as the previous point
      if (point.x === array[index - 1].x && point.y === array[index - 1].y) {
        return false;
      }

      // For second-to-last point, check if it's too close to the last point
      if (
        index === array.length - 2 &&
        (array[index - 1].x === point.x || array[index - 1].y === point.y)
      ) {
        const lastPoint = array[array.length - 1];

        // Get the distance between the last point and second last point using Euclidean distance formula
        const distance = Math.hypot(
          lastPoint.x - point.x,
          lastPoint.y - point.y
        );
        // Include only if distance > 20 to ensure visible edge rendering
        return distance > 20;
      }

      // Include if different from previous point
      return point.x !== array[index - 1].x || point.y !== array[index - 1].y;
    })
    .map((p) => ({
      x: p.x + offset.x,
      y: p.y + offset.y,
    }));

  // Return the edge positions
  return {
    startX: startPosition.x + offset.x,
    startY: startPosition.y + offset.y,
    endX: endPosition.x + offset.x,
    endY: endPosition.y + offset.y,
    reflectionPoints,
  };
};
