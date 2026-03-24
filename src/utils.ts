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

const DEFAULT_POINT_DEDUPE_THRESHOLD = 0.5;

export const dedupeConsecutivePoints = <T extends [number, number]>(
  points: readonly T[],
  threshold = DEFAULT_POINT_DEDUPE_THRESHOLD
): T[] => {
  const dedupedPoints: T[] = [];

  points.forEach((point) => {
    const previousPoint = dedupedPoints[dedupedPoints.length - 1];
    if (!previousPoint) {
      dedupedPoints.push(point);
      return;
    }

    const distance = Math.hypot(
      point[0] - previousPoint[0],
      point[1] - previousPoint[1]
    );
    if (distance <= threshold) {
      return;
    }

    dedupedPoints.push(point);
  });

  return dedupedPoints;
};

export const getPathCoordinates = (path: SVGPathElement) => {
  const dAttr = path.getAttribute("d");
  if (!dAttr) {
    return null;
  }

  const numericTokens = Array.from(
    dAttr.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi),
    (match) => Number(match[0])
  );

  if (numericTokens.length < 4) {
    return null;
  }

  return {
    startX: numericTokens[0],
    startY: numericTokens[1],
    endX: numericTokens[numericTokens.length - 2],
    endY: numericTokens[numericTokens.length - 1],
  };
};

export const getDecodedEdgePoints = (
  edgePath: SVGPathElement
): Position[] => {
  const encodedPoints = edgePath.getAttribute("data-points");
  if (!encodedPoints) {
    const coords = getPathCoordinates(edgePath);
    return coords
      ? [
          { x: coords.startX, y: coords.startY },
          { x: coords.endX, y: coords.endY },
        ]
      : [];
  }

  try {
    const decoded = atob(encodedPoints);
    const points = JSON.parse(decoded);
    return Array.isArray(points)
      ? points.filter(
          (point): point is Position =>
            point &&
            typeof point.x === "number" &&
            typeof point.y === "number" &&
            Number.isFinite(point.x) &&
            Number.isFinite(point.y)
        )
      : [];
  } catch {
    return [];
  }
};

// Extract edge position start, end, and points (reflectionPoints)
interface EdgePositionData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  reflectionPoints: Position[];
}

// Compute edge postion start, end and points (reflection points)
export const computeEdgePositions = (
  pathElement: SVGPathElement,
  offset: Position = { x: 0, y: 0 },
  commandsPattern = "LM"
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

  // Split the d attribute based on the supported SVG path commands.
  // Ex: "M29.383,38.5L29.383,63.5L29.383,83.2"
  // => ["M29.383,38.5", "L29.383,63.5", "L29.383,83.2"]
  const commands = dAttr.split(new RegExp(`(?=[${commandsPattern}])`));

  // Get the start position from the first commands element => [29.383,38.5]
  const startPosition = commands[0]
    .substring(1)
    .split(",")
    .map((coord) => parseFloat(coord));

  // Get the last position from the last commands element => [29.383,83.2]
  const endPosition = commands[commands.length - 1]
    .substring(1)
    .split(",")
    .map((coord) => parseFloat(coord));

  // compute the reflection points -> [ {x: 29.383, y: 38.5}, {x: 29.383, y: 83.2} ]
  // These includes the start and end points and also points which are not the same as the previous points
  const reflectionPoints = commands
    .map((command) => {
      const commandType = command[0];
      const coords = command
        .substring(1)
        .split(",")
        .map((coord) => parseFloat(coord));

      if (commandType === "C") {
        return {
          x: coords[4],
          y: coords[5],
          command: commandType,
        };
      }

      return { x: coords[0], y: coords[1], command: commandType };
    })
    .filter((point, index, array) => {
      // Always include the last point
      if (index === 0 || index === array.length - 1) {
        return true;
      }

      // Exclude the points which are the same as the previous point
      if (point.x === array[index - 1].x && point.y === array[index - 1].y) {
        return false;
      }

      // Exclude the second last point for curves because the end point
      // already captures the rendered segment end.
      if (index === array.length - 2 && point.command === "C") {
        return false;
      }

      // The below check is exclusively for second last point
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
        // Include the second last point if the distance between the
        // last point and second last point is > 20.
        // This is to ensure we have a distance for render the edge.
        // 20 seems to be a good enough distance to render the edge
        return distance > 20;
      }

      // Always include if the current point is not the same as the previous point
      return point.x !== array[index - 1].x || point.y !== array[index - 1].y;
    })
    .map((p) => {
      // Offset the point by the provided offset
      return {
        x: p.x + offset.x,
        y: p.y + offset.y,
      };
    });

  // Return the edge positions
  return {
    startX: startPosition[0] + offset.x,
    startY: startPosition[1] + offset.y,
    endX: endPosition[0] + offset.x,
    endY: endPosition[1] + offset.y,
    reflectionPoints,
  };
};
