import { ExcalidrawElement } from "../element/types";
import { AppState, BinaryFiles, LibraryItems } from "../types";
import { ImportedDataState, ImportedLibraryData } from "./types";
export declare const serializeAsJSON: (elements: readonly ExcalidrawElement[], appState: Partial<AppState>, files: BinaryFiles, type: "local" | "database") => string;
export declare const saveAsJSON: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => Promise<{
    fileHandle: import("browser-fs-access").FileSystemHandle | null;
}>;
export declare const loadFromJSON: (localAppState: AppState, localElements: readonly ExcalidrawElement[] | null) => Promise<import("./restore").RestoredDataState>;
export declare const isValidExcalidrawData: (data?: {
    type?: any;
    elements?: any;
    appState?: any;
}) => data is ImportedDataState;
export declare const isValidLibrary: (json: any) => json is ImportedLibraryData;
export declare const serializeLibraryAsJSON: (libraryItems: LibraryItems) => string;
export declare const saveLibraryAsJSON: (libraryItems: LibraryItems) => Promise<void>;
