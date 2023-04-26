import { AppState, BinaryFiles } from "../types";
import { ExcalidrawElement, NonDeleted } from "../element/types";
import { MIME_TYPES } from "../constants";
export { MIME_TYPES };
declare type ExportOpts = {
    elements: readonly NonDeleted<ExcalidrawElement>[];
    appState?: Partial<Omit<AppState, "offsetTop" | "offsetLeft">>;
    files: BinaryFiles | null;
    maxWidthOrHeight?: number;
    getDimensions?: (width: number, height: number) => {
        width: number;
        height: number;
        scale?: number;
    };
};
export declare const exportToCanvas: ({ elements, appState, files, maxWidthOrHeight, getDimensions, exportPadding, }: ExportOpts & {
    exportPadding?: number | undefined;
}) => Promise<HTMLCanvasElement>;
export declare const exportToBlob: (opts: ExportOpts & {
    mimeType?: string;
    quality?: number;
    exportPadding?: number;
}) => Promise<Blob>;
export declare const exportToSvg: ({ elements, appState, files, exportPadding, }: Omit<ExportOpts, "getDimensions"> & {
    exportPadding?: number | undefined;
}) => Promise<SVGSVGElement>;
export declare const exportToClipboard: (opts: ExportOpts & {
    mimeType?: string;
    quality?: number;
    type: "png" | "svg" | "json";
}) => Promise<void>;
export { serializeAsJSON, serializeLibraryAsJSON } from "../data/json";
export { loadFromBlob, loadSceneOrLibraryFromBlob, loadLibraryFromBlob, } from "../data/blob";
export { getFreeDrawSvgPath } from "../renderer/renderElement";
export { mergeLibraryItems } from "../data/library";
