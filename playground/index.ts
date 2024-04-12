import mermaid from "mermaid";
import { parseMermaid } from "../src/parseMermaid.ts";
import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart.ts";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";
import "./initCustomTest.ts";
import { renderExcalidraw } from "./initExcalidraw.tsx";
import { DEFAULT_FONT_SIZE, MERMAID_CONFIG } from "../src/constants.ts";
import { EXCALIDRAW_ACTIVE_ATTR, EXCALIDRAW_WRAPPER_ID } from "./constants.ts";

// Initialize Mermaid
mermaid.initialize({
  ...MERMAID_CONFIG,
  themeVariables: {
    fontSize: `${DEFAULT_FONT_SIZE}px`,
  },
});

const flowchartContainer = document.getElementById("flowchart-container")!;
const sequenceContainer = document.getElementById("sequence-container")!;
const classContainer = document.getElementById("class-container")!;
const unsupportedContainer = document.getElementById("unsupported")!;
const spinner = document.getElementById("diagram-loading-spinner")!;
unsupportedContainer.innerHTML = `
    <p>Unsupported diagram will be rendered as SVG image.</p>
  `;

(async () => {
  // Render flowchart diagrams
  await Promise.all(
    FLOWCHART_DIAGRAM_TESTCASES.map(async ({ name, definition }, index) => {
      await renderDiagram(
        flowchartContainer,
        name,
        definition,
        index,
        "flowchart"
      );
    })
  );
  // Render Sequence diagrams
  await Promise.all(
    SEQUENCE_DIAGRAM_TESTCASES.map(({ name, definition }, index) => {
      return renderDiagram(
        sequenceContainer,
        name,
        definition,
        index,
        "sequence"
      );
    })
  );

  // Render Class diagrams
  await Promise.all(
    CLASS_DIAGRAM_TESTCASES.map(({ name, definition }, index) => {
      return renderDiagram(classContainer, name, definition, index, "class");
    })
  );

  // Render unsupported diagrams
  await Promise.all(
    UNSUPPORTED_DIAGRAM_TESTCASES.map(async (testcase, index) => {
      const { name, definition } = testcase;

      await renderDiagram(
        unsupportedContainer,
        name,
        definition,
        index,
        "unsupported"
      );
    })
  );

  spinner.style.display = "none";
})();

function generateDiagramId(base: string, number: number) {
  return `${base}-${number}`;
}

async function renderDiagram(
  containerEl: HTMLElement,
  name: string,
  diagramDefinition: string,
  i: number,
  baseId: string
) {
  const id = generateDiagramId(baseId, i);

  const diagramContainerEl = document.createElement("div");
  diagramContainerEl.setAttribute("id", `diagram-container-${id}`);
  diagramContainerEl.innerHTML = `<h2 id="diagram-title-${id}" style="margin-top: 50px; color:#f06595;">${name}
  </h2>
  
  <pre style="font-size:16px; font-weight:600;font-style:italic;background:#eeeef1;white-space:pre-wrap;width:45vw;padding:5px" id="mermaid-syntax-${id}"></pre>

  <button id="diagram-btn-${id}" data="${id}">Render to Excalidraw</button>
  <div id="diagram-${id}" style="width:50%"></div>`;

  const btn = diagramContainerEl.querySelector(`#diagram-btn-${id}`)!;

  btn.addEventListener("click", async () => {
    const data = await parseMermaid(diagramDefinition);

    // In HMR we use this attribute to trigger a rerender for active test case for Excalidraw
    const excalidraw = document.getElementById(EXCALIDRAW_WRAPPER_ID);
    excalidraw?.setAttribute(EXCALIDRAW_ACTIVE_ATTR, id);

    renderExcalidraw(JSON.stringify(data));
  });

  const diagramEl = diagramContainerEl.querySelector(`#diagram-${id}`)!;
  const { svg } = await mermaid.render(`diagram-${id}`, diagramDefinition);

  diagramEl.innerHTML = svg;
  containerEl.append(diagramContainerEl);

  // Render mermaid syntax
  const mermaidSyntaxEl = diagramContainerEl.querySelector(
    `#mermaid-syntax-${id}`
  )!;
  mermaidSyntaxEl.innerHTML = diagramDefinition;
}

async function updateDiagram(
  name: string,
  diagramDefinition: string,
  index: number,
  baseId: string
) {
  const id = generateDiagramId(baseId, index);

  const diagramContainerEl = document.getElementById(
    `diagram-container-${id}`
  )!;
  const diagramEl = document.getElementById(`diagram-${id}`)!;
  const titleEl = document.getElementById(`diagram-title-${id}`)!;
  const { svg } = await mermaid.render(`diagram-${id}`, diagramDefinition);
  const mermaidSyntaxEl = document.getElementById(`mermaid-syntax-${id}`)!;

  titleEl.textContent = name;
  diagramEl.innerHTML = svg;
  diagramContainerEl.append(diagramEl);
  mermaidSyntaxEl.innerHTML = diagramDefinition;
}

if (import.meta.hot) {
  function hmrUpdateTestcase(
    baseId: string,
    newTestCases: { name: string; definition: string }[]
  ) {
    if (!newTestCases) {
      return import.meta.hot?.invalidate();
    }

    for (let i = 0; i < newTestCases.length; i++) {
      const { name, definition } = newTestCases[i];

      const excalidraw = document.getElementById(EXCALIDRAW_WRAPPER_ID);

      if (
        excalidraw?.getAttribute(EXCALIDRAW_ACTIVE_ATTR) ===
        generateDiagramId(baseId, i)
      ) {
        parseMermaid(definition).then((data) => {
          renderExcalidraw(JSON.stringify(data));
        });
      }

      updateDiagram(name, definition, i, baseId);
    }
  }

  import.meta.hot.accept("./testcases/flowchart.ts", (newModule) =>
    hmrUpdateTestcase("flowchart", newModule?.FLOWCHART_DIAGRAM_TESTCASES)
  );

  import.meta.hot.accept("./testcases/class.ts", (newModule) =>
    hmrUpdateTestcase("class", newModule?.CLASS_DIAGRAM_TESTCASES)
  );

  import.meta.hot.accept("./testcases/sequence.ts", (newModule) =>
    hmrUpdateTestcase("sequence", newModule?.SEQUENCE_DIAGRAM_TESTCASES)
  );

  import.meta.hot.accept("./testcases/unsupported.ts", (newModule) =>
    hmrUpdateTestcase("unsupported", newModule?.UNSUPPORTED_DIAGRAM_TESTCASES)
  );
}
