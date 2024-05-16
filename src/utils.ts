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

  // Split the d attribute based on M (Move To) and L (Line To) commands
  // eg "M29.383,38.5L29.383,63.5L29.383,83.2" => ["M29.383,38.5", "L29.383,63.5", "L29.383,83.2"]
  const commands = dAttr.split(/(?=[LM])/);

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
      const coords = command
        .substring(1)
        .split(",")
        .map((coord) => parseFloat(coord));
      return { x: coords[0], y: coords[1] };
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
