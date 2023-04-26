import { NonDeletedExcalidrawElement } from "../element/types";
import { ExportType } from "../scene/types";
import { AppState, BinaryFiles } from "../types";
import { FileSystemHandle } from "./filesystem";
export { loadFromBlob } from "./blob";
export { loadFromJSON, saveAsJSON } from "./json";
export declare const exportCanvas: (type: Omit<ExportType, "backend">, elements: readonly NonDeletedExcalidrawElement[], appState: AppState, files: BinaryFiles, { exportBackground, exportPadding, viewBackgroundColor, name, fileHandle, }: {
    exportBackground: boolean;
    exportPadding?: number | undefined;
    viewBackgroundColor: string;
    name: string;
    fileHandle?: FileSystemHandle | null | undefined;
}) => Promise<FileSystemHandle | null | undefined>;
