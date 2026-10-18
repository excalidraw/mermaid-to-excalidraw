import { entityCodesToText } from "./utils.js";

const MERMAID_LINE_BREAK_TAG = /<br\s*\/?>/gi;
const ESCAPED_NEWLINE_RUN = /\\+n/g;

/**
 * Replaces `\n` line breaks with `lineBreak`. An odd number of slashes before
 * `n` denotes a line break; pairs of slashes escape one another, so `\\n`
 * becomes the literal two-character text `\n`.
 */
export const replaceEscapedNewlines = (text: string, lineBreak: string) =>
  text.replace(ESCAPED_NEWLINE_RUN, (match) => {
    const slashCount = match.length - 1;
    const literalSlashes = "\\".repeat(Math.floor(slashCount / 2));

    return slashCount % 2
      ? `${literalSlashes}${lineBreak}`
      : `${literalSlashes}n`;
  });

/**
 * Normalizes Mermaid text exactly once, before it is handed to a converter:
 * `<br>` tags and `\n` become line breaks.
 */
export const normalizeText = (text: string) =>
  replaceEscapedNewlines(text.replace(MERMAID_LINE_BREAK_TAG, "\n"), "\n");

/**
 * Normalizes real Mermaid break syntax before decoding entities. Keeping this
 * order is important: `&lt;br&gt;` is literal text, not a line break.
 */
export const decodeMermaidText = (text: string) =>
  entityCodesToText(normalizeText(text));

const getNodeText = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || "";
  }

  if (
    node.nodeType === Node.ELEMENT_NODE &&
    (node as Element).tagName.toLowerCase() === "br"
  ) {
    return "\n";
  }

  return Array.from(node.childNodes).map(getNodeText).join("");
};

/**
 * Reads rendered SVG/HTML label content without losing `<br>` elements.
 * Escaped textual `<br>` remains text because it is represented by a text node.
 */
export const getTextContentWithLineBreaks = (element: Element) => {
  const tspans = Array.from(element.querySelectorAll("tspan"));
  const text = tspans.length
    ? tspans
        .map((tspan) => getNodeText(tspan).trim())
        .filter(Boolean)
        .join("\n")
    : getNodeText(element).trim();

  return entityCodesToText(text);
};
