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

// Inline HTML Mermaid renders in labels (e.g. `<sub>`, `<b>`). Excalidraw text
// is plain, so only their content is kept. Lowercase only, so generic type
// parameters (e.g. `Map<K, V>`, `List<A>`) are kept.
const MERMAID_INLINE_HTML_TAG =
  /<\/?(?:a|abbr|b|big|cite|code|del|em|font|i|ins|kbd|mark|q|s|samp|small|span|strike|strong|sub|sup|tt|u|var)(?:\s[^<>]*)?\/?>/g;

/**
 * Normalizes real Mermaid break syntax and strips inline HTML before decoding
 * entities. Keeping this order is important: `&lt;br&gt;` and `&lt;sub&gt;`
 * are literal text, not markup.
 */
export const decodeMermaidText = (text: string) =>
  entityCodesToText(normalizeText(text).replace(MERMAID_INLINE_HTML_TAG, ""));

/**
 * Runs a parse or render `task` with `definition`. `<br>` doesn't parse
 * everywhere `\n` does (e.g. bare flowchart ids and subgraph titles, sequence
 * participants), so if the task fails, it's retried once with `<br>` replaced
 * by `\n`. If that fails too, the original error is thrown. Definitions that
 * parse cost nothing extra.
 */
export const withLineBreakFallback = async <T>(
  definition: string,
  task: (definition: string) => Promise<T>
) => {
  try {
    return await task(definition);
  } catch (error) {
    const fallback = definition.replace(MERMAID_LINE_BREAK_TAG, "\\n");
    if (fallback === definition) {
      throw error;
    }
    try {
      return await task(fallback);
    } catch {
      throw error;
    }
  }
};

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
