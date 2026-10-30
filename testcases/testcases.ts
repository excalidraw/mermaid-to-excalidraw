/// <reference types="vite/client" />

/**
 * The test cases, one Mermaid definition per file:
 *
 * - `features/<type>-<feature>.mmd`: one syntax feature each. The playground
 *   lists them, the visual tests render them (a snapshot per file), and the
 *   unit tests parse them.
 * - `examples/<type>-<topic>.mmd`: whole diagrams that models wrote for the
 *   prompts in `examples/prompts.md`, with the model and prompt in `%%`
 *   comments at the top. Nothing here loads them: they're for layout and
 *   performance checks of whole diagrams (e.g. Excalidraw+'s MCP evals).
 *
 * A file's name is its id: add a case as a new file rather than renaming one,
 * so snapshots and other references keep matching.
 */

export const TESTCASE_TYPES = [
  "flowchart",
  "sequence",
  "class",
  "erd",
  "state",
  "unsupported",
  "swimlane",
] as const;

export type TestCaseType = (typeof TESTCASE_TYPES)[number];

export interface TestCase {
  /** The file name without `.mmd`, e.g. `flowchart-subgraphs`. */
  id: string;
  type: TestCaseType;
  /** The id without its type, as words, e.g. `Subgraphs`. */
  name: string;
  definition: string;
}

const load = (files: Record<string, string>) =>
  Object.entries(files)
    .map(([path, definition]): TestCase => {
      const id = path.replace(/^.*\//, "").replace(/\.mmd$/, "");
      const type = TESTCASE_TYPES.find((prefix) => id.startsWith(`${prefix}-`));
      if (!type) {
        throw new Error(
          `${path}: name test cases <type>-<name>.mmd, with a type of ${TESTCASE_TYPES.join(
            ", "
          )}`
        );
      }
      const name = id.slice(type.length + 1).replace(/-/g, " ");
      return {
        id,
        type,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        definition,
      };
    })
    .sort(
      (a, b) =>
        TESTCASE_TYPES.indexOf(a.type) - TESTCASE_TYPES.indexOf(b.type) ||
        a.id.localeCompare(b.id)
    );

/** The feature test cases, by type (in `TESTCASE_TYPES` order), then name. */
export const TESTCASES = load(
  import.meta.glob<string>("./features/*.mmd", {
    query: "?raw",
    import: "default",
    eager: true,
  })
);

export const testcasesOfType = (type: TestCaseType) =>
  TESTCASES.filter((testcase) => testcase.type === type);

export const getTestCase = (id: string) => {
  const testcase = TESTCASES.find((candidate) => candidate.id === id);
  if (!testcase) {
    throw new Error(`No test case ${id} (testcases/features/${id}.mmd)`);
  }
  return testcase;
};
