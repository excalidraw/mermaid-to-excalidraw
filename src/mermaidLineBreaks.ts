import mermaid from "mermaid";

import { replaceEscapedNewlines } from "./text.js";

// Mermaid has no syntax for some line breaks (`\n` in labels, `<br>` in class
// members). Instead of rewriting the definition, they're converted in
// Mermaid's parsed model, after parsing and before layout, so that Mermaid
// lays the multi-line labels out itself.
//
// The model methods each renderer reads its labels from are wrapped on the db
// classes' prototypes, active only while `withMermaidLineBreaks` runs. Must
// be called inside the Mermaid queue (`runMermaidTaskSequentially`) since the
// wrappers are shared.
//
// Hooks are installed per diagram type, the first time that type renders, so
// we don't load the code of diagram types that aren't used (Mermaid
// lazy-loads each type).

type Label = string | string[] | undefined;
type LabeledEdge = {
  label?: Label;
  startLabelRight?: Label;
  endLabelLeft?: Label;
};
type LayoutData = {
  nodes: Array<{
    label?: Label;
    text?: Label;
    description?: Label;
    members?: Array<{ text: string }>;
    methods?: Array<{ text: string }>;
    attributes?: Array<{ comment: string }>;
  }>;
  edges: LabeledEdge[];
};

const toHtmlLineBreaks = (text: Label): Label =>
  Array.isArray(text)
    ? text.map((line) => replaceEscapedNewlines(line, "<br/>"))
    : typeof text === "string"
    ? replaceEscapedNewlines(text, "<br/>")
    : text;

// Class members are markdown labels with HTML escaped, where a newline is the
// only way to break a line.
const toMarkdownLineBreaks = (text: string) =>
  replaceEscapedNewlines(text.replace(/&lt;br\s*\/?&gt;/gi, "\n"), "\n");

// Only touches fields that exist: renderers check for their presence (e.g.
// class boxes render `text` when it's set, and `label` otherwise).
const normalizeLabels = <T extends Record<string, unknown>>(
  item: T,
  keys: Array<keyof T>
) => {
  keys.forEach((key) => {
    if (item[key] !== undefined) {
      item[key] = toHtmlLineBreaks(item[key] as Label) as T[keyof T];
    }
  });
};

const normalizeLayoutData = ({ nodes, edges }: LayoutData) => {
  nodes.forEach((node) => {
    normalizeLabels(node, ["label", "text", "description"]);
    [...(node.members ?? []), ...(node.methods ?? [])].forEach((member) => {
      member.text = toMarkdownLineBreaks(member.text);
    });
    node.attributes?.forEach((attribute) => {
      normalizeLabels(attribute, ["comment"]);
    });
  });
  edges.forEach((edge) => {
    normalizeLabels(edge, ["label", "startLabelRight", "endLabelLeft"]);
  });
};

type ModelHook = [method: string, normalize: (result: any) => void];

// Per diagram type: a minimal definition to obtain the type's db class from,
// and the db methods to wrap.
const MODEL_HOOKS: Record<string, { stub: string; hooks: ModelHook[] }> = {
  flowchart: {
    stub: "flowchart TD\n  A --> B",
    hooks: [["getData", normalizeLayoutData]],
  },
  state: {
    stub: "stateDiagram-v2\n  [*] --> A",
    hooks: [["getData", normalizeLayoutData]],
  },
  class: {
    stub: "classDiagram\n  class A",
    hooks: [["getData", normalizeLayoutData]],
  },
  er: {
    stub: "erDiagram\n  A ||--o{ B : has",
    hooks: [["getData", normalizeLayoutData]],
  },
  sequence: {
    stub: "sequenceDiagram\n  A->>B: message",
    hooks: [
      [
        "getActors",
        (actors: Map<string, { description: string }>) =>
          actors.forEach((actor) => {
            actor.description = toHtmlLineBreaks(actor.description) as string;
          }),
      ],
      [
        "getMessages",
        (messages: Array<{ message: string }>) =>
          messages.forEach((message) => {
            message.message = toHtmlLineBreaks(message.message) as string;
          }),
      ],
      [
        "getBoxes",
        (boxes: Array<{ name: string }>) =>
          boxes.forEach((box) => {
            box.name = toHtmlLineBreaks(box.name) as string;
          }),
      ],
    ],
  },
};

// `mermaid.detectType()` result → `MODEL_HOOKS` key
const DIAGRAM_TYPES: Record<string, keyof typeof MODEL_HOOKS> = {
  "flowchart-v2": "flowchart",
  flowchart: "flowchart",
  "flowchart-elk": "flowchart",
  stateDiagram: "state",
  state: "state",
  classDiagram: "class",
  class: "class",
  er: "er",
  sequence: "sequence",
};

let isActive = false;
const installations = new Map<string, Promise<void>>();

const installModelHooks = async (diagramType: string) => {
  const { stub, hooks } = MODEL_HOOKS[diagramType];
  // Also loads the diagram type's code, which its render needs anyway.
  const { db } = await mermaid.mermaidAPI.getDiagramFromText(stub);
  const prototype = Object.getPrototypeOf(db);

  if (hooks.some(([method]) => typeof prototype[method] !== "function")) {
    // Mermaid internals changed: render without these line breaks.
    console.error(`Line break support unavailable for ${diagramType}`);
    return;
  }

  hooks.forEach(([method, normalize]) => {
    const original = prototype[method];
    prototype[method] = function (this: unknown, ...args: unknown[]) {
      const result = original.apply(this, args);
      if (isActive) {
        normalize(result);
      }
      return result;
    };
  });
};

const ensureModelHooks = async (definition: string) => {
  let diagramType: string | undefined;
  try {
    diagramType = DIAGRAM_TYPES[mermaid.detectType(definition)];
  } catch {
    // Unknown or invalid diagram: Mermaid reports it when rendering.
  }
  if (!diagramType) {
    return;
  }

  let installation = installations.get(diagramType);
  if (!installation) {
    installation = installModelHooks(diagramType);
    installations.set(diagramType, installation);
    // Retry on the next render if loading the diagram's code failed (e.g.
    // offline); the render itself then reports the error.
    installation.catch(() => installations.delete(diagramType!));
  }
  await installation.catch(() => {});
};

/**
 * Renders a Mermaid `definition` with `\n` line breaks converted in Mermaid's
 * model, so that Mermaid lays out multi-line labels itself. Mermaid must
 * already be initialized.
 */
export const withMermaidLineBreaks = async <T>(
  definition: string,
  render: () => Promise<T>
) => {
  await ensureModelHooks(definition);

  isActive = true;
  try {
    return await render();
  } finally {
    isActive = false;
  }
};
