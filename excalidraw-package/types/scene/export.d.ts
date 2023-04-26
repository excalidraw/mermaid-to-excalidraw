import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState, BinaryFiles } from "../types";
import { serializeAsJSON } from "../data/json";
export declare const SVG_EXPORT_TAG = "<!-- svg-source:excalidraw -->";
export declare const exportToCanvas: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState, files: BinaryFiles, { exportBackground, exportPadding, viewBackgroundColor, }: {
    exportBackground: boolean;
    exportPadding?: number | undefined;
    viewBackgroundColor: string;
}, createCanvas?: (width: number, height: number) => {
    canvas: HTMLCanvasElement;
    scale: number;
}) => Promise<HTMLCanvasElement>;
export declare const exportToSvg: (elements: readonly NonDeletedExcalidrawElement[], appState: {
    exportBackground: boolean;
    exportPadding?: number;
    exportScale?: number;
    viewBackgroundColor: string;
    exportWithDarkMode?: boolean;
    exportEmbedScene?: boolean;
}, files: BinaryFiles | null, opts?: {
    serializeAsJSON?: () => string;
}) => Promise<SVGSVGElement>;
export declare const getExportSize: (elements: readonly NonDeletedExcalidrawElement[], exportPadding: number, scale: number) => [number, number];
