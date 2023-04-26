import { ExcalidrawElement } from "../element/types";
import { AppState, BinaryFiles, LibraryItem } from "../types";
import { ImportedDataState } from "./types";
declare type RestoredAppState = Omit<AppState, "offsetTop" | "offsetLeft" | "width" | "height">;
export declare const AllowedExcalidrawActiveTools: Record<AppState["activeTool"]["type"], boolean>;
export declare type RestoredDataState = {
    elements: ExcalidrawElement[];
    appState: RestoredAppState;
    files: BinaryFiles;
};
export declare const restoreElements: (elements: ImportedDataState["elements"], localElements: readonly ExcalidrawElement[] | null | undefined, opts?: {
    refreshDimensions?: boolean;
    repairBindings?: boolean;
} | undefined) => ExcalidrawElement[];
export declare const restoreAppState: (appState: ImportedDataState["appState"], localAppState: Partial<AppState> | null | undefined) => RestoredAppState;
export declare const restore: (data: Pick<ImportedDataState, "appState" | "elements" | "files"> | null, localAppState: Partial<AppState> | null | undefined, localElements: readonly ExcalidrawElement[] | null | undefined, elementsConfig?: {
    refreshDimensions?: boolean;
    repairBindings?: boolean;
}) => RestoredDataState;
export declare const restoreLibraryItems: (libraryItems: ImportedDataState["libraryItems"], defaultStatus: LibraryItem["status"]) => LibraryItem[];
export {};
