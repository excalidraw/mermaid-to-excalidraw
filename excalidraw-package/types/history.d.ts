import { AppState } from "./types";
import { ExcalidrawElement } from "./element/types";
export interface HistoryEntry {
    appState: ReturnType<typeof clearAppStatePropertiesForHistory>;
    elements: ExcalidrawElement[];
}
declare const clearAppStatePropertiesForHistory: (appState: AppState) => {
    selectedElementIds: {
        [id: string]: boolean;
    };
    selectedGroupIds: {
        [groupId: string]: boolean;
    };
    viewBackgroundColor: string;
    editingLinearElement: import("./element/linearElementEditor").LinearElementEditor | null;
    editingGroupId: string | null;
    name: string;
};
declare class History {
    private elementCache;
    private recording;
    private stateHistory;
    private redoStack;
    private lastEntry;
    private hydrateHistoryEntry;
    private dehydrateHistoryEntry;
    getSnapshotForTest(): {
        recording: boolean;
        stateHistory: HistoryEntry[];
        redoStack: HistoryEntry[];
    };
    clear(): void;
    private generateEntry;
    shouldCreateEntry(nextEntry: HistoryEntry): boolean;
    pushEntry(appState: AppState, elements: readonly ExcalidrawElement[]): void;
    clearRedoStack(): void;
    redoOnce(): HistoryEntry | null;
    undoOnce(): HistoryEntry | null;
    /**
     * Updates history's `lastEntry` to latest app state. This is necessary
     *  when doing undo/redo which itself doesn't commit to history, but updates
     *  app state in a way that would break `shouldCreateEntry` which relies on
     *  `lastEntry` to reflect last comittable history state.
     * We can't update `lastEntry` from within history when calling undo/redo
     *  because the action potentially mutates appState/elements before storing
     *  it.
     */
    setCurrentState(appState: AppState, elements: readonly ExcalidrawElement[]): void;
    resumeRecording(): void;
    record(state: AppState, elements: readonly ExcalidrawElement[]): void;
}
export default History;
