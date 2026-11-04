import { DEFAULT_FONT_SIZE } from "../src/constants.js";
import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseMermaidToExcalidraw } from "../src/index.js";
import { parseDiagram } from "../src/parseDiagram.js";
import { TESTCASE_TYPES, TESTCASES } from "../testcases/testcases.ts";

describe("diagram types loaded on first use", () => {
  it("converts each diagram type as `graphToExcalidraw` does", async () => {
    for (const type of TESTCASE_TYPES) {
      const { definition } = TESTCASES.find(
        (testcase) => testcase.type === type
      )!;
      const { elements } = await parseMermaidToExcalidraw(definition);
      const expected = graphToExcalidraw(await parseDiagram(definition), {
        fontSize: DEFAULT_FONT_SIZE,
      }).elements;
      expect(
        elements.map((element) => element.type),
        type
      ).toEqual(expected.map((element) => element.type));
    }
  });
});
