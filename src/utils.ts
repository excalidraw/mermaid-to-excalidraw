import { Position } from "./interfaces.js";

// Convert mermaid entity codes to text e.g. "#9829;" to "♥"
export const entityCodesToText = (input: string): string => {
  input = decodeEntities(input);
  const modifiedInput = input
    .replace(/#(\d+);/g, "&#$1;")
    .replace(/#([a-z]+);/g, "&$1;");
  const element = document.createElement("textarea");
  element.innerHTML = modifiedInput;
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

export const computeEdgePositions = (
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
