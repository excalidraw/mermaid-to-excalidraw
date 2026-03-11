import { useCallback, useState, type SyntheticEvent } from "react";

const STORAGE_KEY = "mermaid-to-excalidraw-playground-sections";

type PersistedSectionState = Record<string, boolean>;

const readPersistedSectionState = (): PersistedSectionState => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedState = window.localStorage.getItem(STORAGE_KEY);
    if (!storedState) {
      return {};
    }

    const parsedState = JSON.parse(storedState);
    if (!parsedState || typeof parsedState !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedState).filter(
        (entry): entry is [string, boolean] => typeof entry[1] === "boolean"
      )
    );
  } catch (error) {
    console.error("Failed to read section state from localStorage:", error);
    return {};
  }
};

const writePersistedSectionState = (state: PersistedSectionState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save section state to localStorage:", error);
  }
};

export const usePersistedSectionState = (
  sectionId: string,
  defaultExpanded = false
) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const persistedState = readPersistedSectionState();
    return persistedState[sectionId] ?? defaultExpanded;
  });

  const handleToggle = useCallback(
    (event: SyntheticEvent<HTMLDetailsElement>) => {
      const nextExpanded = event.currentTarget.open;
      setIsExpanded(nextExpanded);

      const persistedState = readPersistedSectionState();
      writePersistedSectionState({
        ...persistedState,
        [sectionId]: nextExpanded,
      });
    },
    [sectionId]
  );

  return { isExpanded, handleToggle };
};
