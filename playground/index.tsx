import { useState, useCallback, useDeferredValue, useEffect } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";
import GitHubCorner from "./GitHubCorner.tsx";

import "@excalidraw/excalidraw/index.css";

export interface MermaidData {
  definition: string;
  output: Awaited<ReturnType<typeof parseMermaid>> | null;
  error: string | null;
}

export type ActiveTestCaseIndex = number | "custom" | null;

const App = () => {
  const [mermaidData, setMermaidData] = useState<MermaidData>({
    definition: "",
    error: null,
    output: null,
  });

  const [activeTestCaseIndex, setActiveTestCaseIndex] =
    useState<ActiveTestCaseIndex>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check system preference for dark mode
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const deferredMermaidData = useDeferredValue(mermaidData);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Add keyboard shortcut for dark mode toggle (Alt+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        setIsDarkMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOnChange = useCallback(
    async (
      definition: MermaidData["definition"],
      activeTestCaseIndex: ActiveTestCaseIndex,
    ) => {
      try {
        setActiveTestCaseIndex(activeTestCaseIndex);

        const mermaid = await parseMermaid(definition);

        setMermaidData({
          definition,
          output: mermaid,
          error: null,
        });

        // Save to localStorage whenever a diagram is successfully rendered
        try {
          localStorage.setItem("mermaid-to-excalidraw-definition", definition);
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError);
        }
      } catch (error) {
        console.error({ error, definition });
        setMermaidData({
          definition,
          output: null,
          error: String(error),
        });
      }
    },
    [],
  );

  return (
    <>
      <button
        id="dark-mode-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={
          isDarkMode
            ? "Switch to light mode (Alt+Shift+D)"
            : "Switch to dark mode (Alt+Shift+D)"
        }
      >
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="left-side">
        <div style={{ display: "flex" }}>
          <section id="custom-test">
            <h1>{"Custom Test"}</h1>
            {"Supports only "}
            <a
              target="_blank"
              href="https://mermaid.js.org/syntax/flowchart.html"
            >
              {"Flowchart"}
            </a>
            {", "}
            <a
              target="_blank"
              href="https://mermaid.js.org/syntax/sequenceDiagram.html"
            >
              {"Sequence "}
            </a>
            {"and "}
            <a
              target="_blank"
              href="https://mermaid.js.org/syntax/classDiagram.html"
            >
              {"Class "}
            </a>
            {"diagrams."}
            <br />
            <CustomTest
              activeTestCaseIndex={activeTestCaseIndex}
              mermaidData={deferredMermaidData}
              onChange={handleOnChange}
            />
          </section>
          <GitHubCorner />
        </div>

        <Testcases
          activeTestCaseIndex={activeTestCaseIndex}
          onChange={handleOnChange}
        />
      </div>
      <div id="excalidraw">
        <ExcalidrawWrapper
          mermaidDefinition={deferredMermaidData.definition}
          mermaidOutput={deferredMermaidData.output}
          theme={isDarkMode ? "dark" : "light"}
        />
      </div>
    </>
  );
};

export default App;
