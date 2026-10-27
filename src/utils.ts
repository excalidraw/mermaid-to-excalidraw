// Pele (like Mermaid) encodes the entity codes in labels, e.g. "#quot;" as
// "ﬂ°quot¶ß", for them not to be parsed as syntax
const decodeEntities = (text: string): string =>
  text.replace(/ﬂ°°/g, "#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");

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
