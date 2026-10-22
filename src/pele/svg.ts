import { Position } from "../interfaces.js";
import { isValidCSSColor, parseCSSDeclarations } from "../parser/cssUtils.js";

// Pele renders diagrams to an SVG string in which every element carries its
// final geometry as attributes (shapes centered on a `translate()`, absolute
// edge paths), so it can be read without inserting it into the document or
// measuring it (`getBBox()` etc.).

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const parseSvg = (svg: string): Element => {
  const root = new DOMParser().parseFromString(
    svg,
    "image/svg+xml"
  ).documentElement;
  if (root.tagName !== "svg") {
    throw new Error("Pele returned an invalid SVG");
  }
  return root;
};

/** Maps `data-id` to the element for every element matching `selector`. */
export const getElementsByDataId = (root: Element, selector: string) => {
  const elements = new Map<string, Element>();
  root.querySelectorAll(selector).forEach((element) => {
    const id = element.getAttribute("data-id");
    if (id !== null && !elements.has(id)) {
      elements.set(id, element);
    }
  });
  return elements;
};

const TRANSLATE = /translate\(\s*([^\s,)]+)(?:[\s,]+([^\s,)]+))?\s*\)/;

/**
 * Sums the `translate()` transforms of `element` and its ancestors up to
 * `root`, i.e. the offset of `element`'s local coordinates in `root`.
 */
export const getOffset = (element: Element, root: Element): Position => {
  const offset = { x: 0, y: 0 };
  for (
    let node: Element | null = element;
    node && node !== root;
    node = node.parentElement
  ) {
    const match = node.getAttribute("transform")?.match(TRANSLATE);
    if (match) {
      offset.x += Number(match[1]) || 0;
      offset.y += Number(match[2]) || 0;
    }
  }
  return offset;
};

const numberAttr = (element: Element, name: string) =>
  Number(element.getAttribute(name)) || 0;

interface PathSegment {
  /** Absolute command, uppercase. */
  command: string;
  /** Absolute points: control points first, the segment's end point last. */
  points: Position[];
}

const PATH_TOKEN = /[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

export const parsePath = (d: string): PathSegment[] => {
  const tokens = d.match(PATH_TOKEN) || [];
  const segments: PathSegment[] = [];
  let index = 0;
  let command = "";
  let current: Position = { x: 0, y: 0 };
  let subpathStart: Position = { x: 0, y: 0 };

  const isCommand = (token: string | undefined) =>
    token !== undefined && /^[a-zA-Z]$/.test(token);
  const next = () => Number(tokens[index++]);

  while (index < tokens.length) {
    if (isCommand(tokens[index])) {
      command = tokens[index++];
    } else if (!command || command.toUpperCase() === "Z") {
      // Numbers without a command to apply them to
      break;
    }

    const isRelative = command === command.toLowerCase();
    const point = (x: number, y: number): Position =>
      isRelative ? { x: current.x + x, y: current.y + y } : { x, y };

    let points: Position[];
    switch (command.toUpperCase()) {
      case "M":
      case "L":
      case "T":
        points = [point(next(), next())];
        break;
      case "H": {
        const x = next();
        points = [{ x: isRelative ? current.x + x : x, y: current.y }];
        break;
      }
      case "V": {
        const y = next();
        points = [{ x: current.x, y: isRelative ? current.y + y : y }];
        break;
      }
      case "C":
        points = [
          point(next(), next()),
          point(next(), next()),
          point(next(), next()),
        ];
        break;
      case "S":
      case "Q":
        points = [point(next(), next()), point(next(), next())];
        break;
      case "A": {
        // rx ry x-axis-rotation large-arc-flag sweep-flag x y
        index += 5;
        points = [point(next(), next())];
        break;
      }
      case "Z":
        points = [subpathStart];
        break;
      default:
        throw new Error(`Unsupported SVG path command "${command}"`);
    }

    if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
      break;
    }

    segments.push({ command: command.toUpperCase(), points });
    current = points[points.length - 1];

    if (command.toUpperCase() === "M") {
      subpathStart = current;
      // Coordinates following a moveto are implicit linetos
      command = isRelative ? "l" : "L";
    }
  }

  return segments;
};

const unionBounds = (points: Position[]): Bounds | null => {
  if (!points.length) {
    return null;
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
};

/** Corner points of a shape element's bounds, in its local coordinates. */
const getShapeExtents = (element: Element): Position[] => {
  switch (element.tagName.toLowerCase()) {
    case "rect":
    case "image": {
      const x = numberAttr(element, "x");
      const y = numberAttr(element, "y");
      return [
        { x, y },
        {
          x: x + numberAttr(element, "width"),
          y: y + numberAttr(element, "height"),
        },
      ];
    }
    case "circle":
    case "ellipse": {
      const cx = numberAttr(element, "cx");
      const cy = numberAttr(element, "cy");
      const rx = numberAttr(element, element.hasAttribute("r") ? "r" : "rx");
      const ry = numberAttr(element, element.hasAttribute("r") ? "r" : "ry");
      return [
        { x: cx - rx, y: cy - ry },
        { x: cx + rx, y: cy + ry },
      ];
    }
    case "polygon":
    case "polyline": {
      const coords = (element.getAttribute("points") || "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      const points: Position[] = [];
      for (let index = 0; index + 1 < coords.length; index += 2) {
        points.push({ x: coords[index], y: coords[index + 1] });
      }
      return points;
    }
    case "path":
      // Includes curve control points, which bound the curve.
      return parsePath(element.getAttribute("d") || "").flatMap(
        (segment) => segment.points
      );
    default:
      return [];
  }
};

const SHAPE_SELECTOR = "rect, circle, ellipse, polygon, polyline, path, image";

const SHAPE_TAGS = new Set(SHAPE_SELECTOR.split(", "));

/**
 * Bounds of a shape, or of the shapes drawn inside a group (labels excluded),
 * in `root` coordinates.
 */
export const getShapeBounds = (group: Element, root: Element) => {
  const shapes = SHAPE_TAGS.has(group.tagName.toLowerCase())
    ? [group]
    : Array.from(group.querySelectorAll(SHAPE_SELECTOR));
  const points = shapes.flatMap((element) => {
    const offset = getOffset(element, root);
    return getShapeExtents(element).map((point) => ({
      x: point.x + offset.x,
      y: point.y + offset.y,
    }));
  });
  return unionBounds(points);
};

/**
 * The points an edge path passes through, in `root` coordinates. Cubic curves
 * keep their midpoint too (e.g. a self-loop drawn as a single curve).
 * Quadratic curves, which Pele only uses to round the corners of stepped
 * routes, keep their control point, i.e. the corner.
 */
export const getPathRoute = (path: Element, root: Element): Position[] => {
  const offset = getOffset(path, root);
  let current: Position = { x: 0, y: 0 };
  return parsePath(path.getAttribute("d") || "")
    .flatMap(({ command, points }) => {
      const start = current;
      current = points[points.length - 1];
      if (command === "Q") {
        return points;
      }
      if (command === "C") {
        const [c1, c2, end] = points;
        const midpoint = {
          x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8,
          y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8,
        };
        return [midpoint, end];
      }
      return [current];
    })
    .map((point) => ({ x: point.x + offset.x, y: point.y + offset.y }));
};

/** Removes consecutive duplicates and the middle of collinear runs. */
export const simplifyRoute = (points: Position[], epsilon = 0.5) => {
  const deduped = points.filter(
    (point, index) =>
      index === 0 ||
      Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y) >
        epsilon
  );

  return deduped.filter((point, index) => {
    if (index === 0 || index === deduped.length - 1) {
      return true;
    }
    const previous = deduped[index - 1];
    const next = deduped[index + 1];
    const cross =
      (point.x - previous.x) * (next.y - previous.y) -
      (point.y - previous.y) * (next.x - previous.x);
    const length = Math.hypot(next.x - previous.x, next.y - previous.y);
    return !length || Math.abs(cross) / length > epsilon;
  });
};

/**
 * Excalidraw draws a round arrow as a (uniform) Catmull-Rom spline through its
 * points, which overshoots the corners between long and short segments. Long
 * segments are split near such corners (the route stays the same), so that
 * segments next to each other are at most `maxRatio` times as long as each
 * other.
 */
export const evenOutRoute = (route: Position[], maxRatio = 3) => {
  const points = [...route];
  // Each split at most halves the gap to the ratio: the bound only stops
  // degenerate (e.g. near zero length) segments from splitting forever
  for (let splits = 0; splits < route.length * 8; splits++) {
    const lengths = points
      .slice(1)
      .map((point, index) =>
        Math.hypot(point.x - points[index].x, point.y - points[index].y)
      );
    const index = lengths.findIndex(
      (length, index) =>
        index > 0 &&
        Math.min(length, lengths[index - 1]) > 1 &&
        Math.max(length, lengths[index - 1]) >
          maxRatio * Math.min(length, lengths[index - 1])
    );
    if (index === -1) {
      break;
    }
    // `points[index]` is the corner between segments `index - 1` and `index`
    const isLongAfter = lengths[index] > lengths[index - 1];
    const corner = points[index];
    const far = points[isLongAfter ? index + 1 : index - 1];
    const long = lengths[isLongAfter ? index : index - 1];
    const short = lengths[isLongAfter ? index - 1 : index];
    const t = (2 * short) / long;
    points.splice(isLongAfter ? index + 1 : index, 0, {
      x: corner.x + (far.x - corner.x) * t,
      y: corner.y + (far.y - corner.y) * t,
    });
  }
  return points;
};

/**
 * How far along a route (0 at its start, 1 at its end, by length) the point
 * of it closest to `point` is.
 */
export const getRoutePosition = (route: Position[], point: Position) => {
  let length = 0;
  let closest = { distance: Infinity, length: 0 };
  for (let index = 1; index < route.length; index++) {
    const start = route[index - 1];
    const dx = route[index].x - start.x;
    const dy = route[index].y - start.y;
    const segmentLength = Math.hypot(dx, dy);
    const t = segmentLength
      ? Math.min(
          1,
          Math.max(
            0,
            ((point.x - start.x) * dx + (point.y - start.y) * dy) /
              segmentLength ** 2
          )
        )
      : 0;
    const distance = Math.hypot(
      start.x + t * dx - point.x,
      start.y + t * dy - point.y
    );
    if (distance < closest.distance) {
      closest = { distance, length: length + t * segmentLength };
    }
    length += segmentLength;
  }
  return length ? closest.length / length : 0.5;
};

interface MarkerShape {
  points: Position[];
  radius: number;
}

const getMarkerShape = (marker: Element, root: Element): MarkerShape => {
  const offset = getOffset(marker, root);
  const isCircle = marker.tagName.toLowerCase() === "circle";
  const points = isCircle
    ? [{ x: numberAttr(marker, "cx"), y: numberAttr(marker, "cy") }]
    : getShapeExtents(marker);
  return {
    points: points.map((point) => ({
      x: point.x + offset.x,
      y: point.y + offset.y,
    })),
    radius: isCircle ? numberAttr(marker, "r") : 0,
  };
};

const extendEndpoint = (
  end: Position,
  previous: Position,
  markers: MarkerShape[]
): Position => {
  const length = Math.hypot(end.x - previous.x, end.y - previous.y);
  if (!length || !markers.length) {
    return end;
  }
  const direction = {
    x: (end.x - previous.x) / length,
    y: (end.y - previous.y) / length,
  };
  const reach = Math.max(
    0,
    ...markers.flatMap(({ points, radius }) =>
      points.map(
        (point) =>
          (point.x - end.x) * direction.x +
          (point.y - end.y) * direction.y +
          radius
      )
    )
  );
  return {
    x: end.x + direction.x * reach,
    y: end.y + direction.y * reach,
  };
};

/** The markers (arrowheads) Pele drew at the start and at the end of a route. */
export const getRouteMarkers = (
  route: Position[],
  markerElements: Element[],
  root: Element
) => {
  const startMarkers: MarkerShape[] = [];
  const endMarkers: MarkerShape[] = [];
  if (!route.length) {
    return { startMarkers, endMarkers };
  }

  const first = route[0];
  const last = route[route.length - 1];
  markerElements.forEach((element) => {
    const marker = getMarkerShape(element, root);
    const center = unionBounds(marker.points);
    if (!center) {
      return;
    }
    const cx = center.x + center.width / 2;
    const cy = center.y + center.height / 2;
    const distanceToStart = Math.hypot(cx - first.x, cy - first.y);
    const distanceToEnd = Math.hypot(cx - last.x, cy - last.y);
    (distanceToStart < distanceToEnd ? startMarkers : endMarkers).push(marker);
  });
  return { startMarkers, endMarkers };
};

/**
 * Pele shortens edge paths by the length of their arrowheads, which it draws
 * as separate shapes (`.pele-marker`). Excalidraw draws arrowheads at the
 * arrow's end points, so the route is extended to the far end of the markers,
 * i.e. back to the node outline.
 */
export const extendRouteToMarkers = (
  route: Position[],
  markerElements: Element[],
  root: Element
): Position[] => {
  if (route.length < 2 || !markerElements.length) {
    return route;
  }

  const first = route[0];
  const last = route[route.length - 1];
  const { startMarkers, endMarkers } = getRouteMarkers(
    route,
    markerElements,
    root
  );
  const extended = [...route];
  extended[0] = extendEndpoint(first, route[1], startMarkers);
  extended[extended.length - 1] = extendEndpoint(
    last,
    route[route.length - 2],
    endMarkers
  );
  return extended;
};

/** SVG string to a data URL usable as an image source. */
export const svgToDataURL = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

/** Font size of an element, as set on it or inherited from its ancestors. */
export const getFontSize = (
  element: Element,
  root: Element,
  fallback: number
) => {
  for (
    let node: Element | null = element;
    node && node !== root;
    node = node.parentElement
  ) {
    const fontSize = Number(node.getAttribute("font-size"));
    if (fontSize) {
      return fontSize;
    }
  }
  return fallback;
};

/**
 * The lines Pele broke a text into (at line breaks, and wrapping long ones).
 * Each line starts with a positioned `<tspan>`; unpositioned ones (e.g. bold
 * text) continue it.
 */
export const getTextLines = (text: Element | null) => {
  if (!text) {
    return [];
  }
  const tspans = Array.from(text.querySelectorAll("tspan"));
  if (!tspans.length) {
    return [text.textContent || ""];
  }
  return tspans.reduce<string[]>((lines, tspan) => {
    if (tspan.hasAttribute("y") || !lines.length) {
      lines.push("");
    }
    lines[lines.length - 1] += tspan.textContent || "";
    return lines;
  }, []);
};

// Pele vertically centers text by putting its baseline this far (relative to
// the font size) below the middle of the line.
const BASELINE_OFFSET = 0.35;
const EXCALIDRAW_LINE_HEIGHT = 1.25;

export interface TextBlock {
  text: string;
  /** x of the anchor `textAlign` refers to, in `root` coordinates. */
  x: number;
  /** Top of the text, laid out with Excalidraw's line height. */
  y: number;
  height: number;
  fontSize: number;
  textAlign: "left" | "center" | "right";
}

/** Where Pele drew a text, as an Excalidraw text box. */
export const getTextBlock = (
  text: Element,
  root: Element,
  defaultFontSize: number
): TextBlock => {
  const offset = getOffset(text, root);
  const fontSize = getFontSize(text, root, defaultFontSize);
  const positioned = [
    text,
    ...Array.from(text.querySelectorAll("tspan")),
  ].filter((element) => element.hasAttribute("y"));
  const baselines = positioned.map((element) => numberAttr(element, "y"));
  const anchorX = positioned.length ? numberAttr(positioned[0], "x") : 0;
  const lines = getTextLines(text);
  const middle = baselines.length
    ? (Math.min(...baselines) + Math.max(...baselines)) / 2 -
      BASELINE_OFFSET * fontSize
    : 0;
  const height = lines.length * fontSize * EXCALIDRAW_LINE_HEIGHT;
  const anchor = text.getAttribute("text-anchor");

  return {
    text: lines.join("\n"),
    x: anchorX + offset.x,
    y: middle - height / 2 + offset.y,
    height,
    fontSize,
    textAlign:
      anchor === "middle" ? "center" : anchor === "end" ? "right" : "left",
  };
};

// Pele's own colors are CSS variables, which Excalidraw can't use.
const isUsableColor = (value: string) =>
  !/\bvar\(/i.test(value) && isValidCSSColor(value);

/** A color set in an element's inline style (by `style` or `classDef`). */
export const getStyleColor = (
  element: Element | null | undefined,
  property: "fill" | "stroke"
) => {
  const value = getStyleValue(element, property);
  return value && isUsableColor(value) ? value : undefined;
};

/** A property set in an element's inline style. */
export const getStyleValue = (
  element: Element | null | undefined,
  property: string
) =>
  parseCSSDeclarations(element?.getAttribute("style") || "").find(
    (declaration) => declaration.property === property
  )?.value;
