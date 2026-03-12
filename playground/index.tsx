import { useState, useCallback, useDeferredValue, useEffect, useRef } from "react";
import {
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
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

const THEME_STORAGE_KEY = "mermaid-to-excalidraw-theme";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  isUserPreference: boolean;
}

const getSystemThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const readStoredThemeMode = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedThemeMode = window.sessionStorage.getItem(THEME_STORAGE_KEY);
    return storedThemeMode === "dark" || storedThemeMode === "light"
      ? storedThemeMode
      : null;
  } catch (error) {
    console.error("Failed to read theme from sessionStorage:", error);
    return null;
  }
};

const writeStoredThemeMode = (mode: ThemeMode) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.error("Failed to save theme to sessionStorage:", error);
  }
};

const App = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const [mermaidData, setMermaidData] = useState<MermaidData>({
    definition: "",
    error: null,
    output: null,
  });

  const [activeTestCaseIndex, setActiveTestCaseIndex] =
    useState<ActiveTestCaseIndex>(null);
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const storedThemeMode = readStoredThemeMode();
    if (storedThemeMode) {
      return {
        mode: storedThemeMode,
        isUserPreference: true,
      };
    }

    return {
      mode: getSystemThemeMode(),
      isUserPreference: false,
    };
  });
  const isDarkMode = themeState.mode === "dark";
  const deferredMermaidData = useDeferredValue(mermaidData);

  const toggleTheme = useCallback(() => {
    setThemeState((currentThemeState) => {
      const nextThemeMode =
        currentThemeState.mode === "dark" ? "light" : "dark";
      writeStoredThemeMode(nextThemeMode);

      return {
        mode: nextThemeMode,
        isUserPreference: true,
      };
    });
  }, []);

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
      setThemeState((currentThemeState) => {
        if (currentThemeState.isUserPreference) {
          return currentThemeState;
        }

        return {
          mode: e.matches ? "dark" : "light",
          isUserPreference: false,
        };
      });
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Add keyboard shortcut for dark mode toggle (Alt+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const handleInsertMermaidSvg = useCallback(
    (svgHtml: string, width: number, height: number) => {
      const api = excalidrawAPIRef.current;
      if (!api || api.isDestroyed) {
        return;
      }

      const dataURL = `data:image/svg+xml;base64,${btoa(
        unescape(encodeURIComponent(svgHtml))
      )}`;
      const fileId = `mermaid-svg-${Date.now()}`;

      api.addFiles([
        {
          id: fileId as any,
          dataURL: dataURL as any,
          mimeType: "image/svg+xml" as any,
          created: Date.now(),
          lastRetrieved: Date.now(),
        },
      ]);

      api.updateScene({
        elements: [
          ...api.getSceneElements(),
          ...convertToExcalidrawElements([
            {
              type: "image",
              fileId: fileId as any,
              width,
              height,
              x: 0,
              y: 0,
            },
          ]),
        ],
      });
      api.scrollToContent(api.getSceneElements(), { fitToContent: true });
    },
    []
  );

  const handleOnChange = useCallback(
    async (
      definition: MermaidData["definition"],
      activeTestCaseIndex: ActiveTestCaseIndex
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
    []
  );

  return (
    <>
      <button
        className="playground-button"
        id="dark-mode-toggle"
        onClick={toggleTheme}
        title={
          isDarkMode
            ? "Switch to light mode (Alt+Shift+D)"
            : "Switch to dark mode (Alt+Shift+D)"
        }
      >
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="left-side">
        <header className="playground-hero">
          <div className="playground-hero-copy">
            <p className="playground-kicker">{"Mermaid to Excalidraw"}</p>
          </div>
          <a
            className="playground-doc-link"
            target="_blank"
            rel="noreferrer"
            href="https://mermaid.js.org/intro/syntax-reference.html"
          >
            {"Mermaid docs"}
          </a>
          <GitHubCorner />
        </header>

        <section id="custom-test" className="">
          <CustomTest
            activeTestCaseIndex={activeTestCaseIndex}
            mermaidData={deferredMermaidData}
            onChange={handleOnChange}
          />
        </section>

        <section className="playground-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">{"Examples"}</p>
            </div>
          </div>
          <Testcases
            activeTestCaseIndex={activeTestCaseIndex}
            onChange={handleOnChange}
            onInsertMermaidSvg={handleInsertMermaidSvg}
          />
        </section>
      </div>
      <div id="excalidraw">
        <ExcalidrawWrapper
          mermaidDefinition={deferredMermaidData.definition}
          mermaidOutput={deferredMermaidData.output}
          theme={isDarkMode ? "dark" : "light"}
          apiRef={excalidrawAPIRef}
        />
      </div>
    </>
  );
};

export default App;
