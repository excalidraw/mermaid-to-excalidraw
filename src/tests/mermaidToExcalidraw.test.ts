import { expect, it } from "vitest";
import mermaidToExcalidraw from "../mermaidToExcalidraw.js";

it("mermaidToExcalidraw", async () => {
  const elements = await mermaidToExcalidraw("flowchart TD\nStart --> Stop");
  expect(elements.length).toBe(3);
});
