import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughSVG } from "roughjs/bin/svg";
import { AppState, BinaryFiles } from "../types";
import { NonDeletedExcalidrawElement } from "../element/types";
import { RenderConfig } from "../scene/types";
export declare const DEFAULT_SPACING = 2;
export declare const _renderScene: ({ elements, appState, scale, rc, canvas, renderConfig, }: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState: AppState;
    scale: number;
    rc: RoughCanvas;
    canvas: HTMLCanvasElement;
    renderConfig: RenderConfig;
}) => {
    atLeastOneVisibleElement: boolean;
    scrollBars?: undefined;
} | {
    atLeastOneVisibleElement: boolean;
    scrollBars: import("../scene/types").ScrollBars | undefined;
};
/** renderScene throttled to animation framerate */
export declare const renderScene: <T extends boolean = false>(config: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState: AppState;
    scale: number;
    rc: RoughCanvas;
    canvas: HTMLCanvasElement;
    renderConfig: RenderConfig;
    callback?: ((data: ReturnType<typeof _renderScene>) => void) | undefined;
}, throttle?: T | undefined) => T extends true ? void : {
    atLeastOneVisibleElement: boolean;
    scrollBars?: undefined;
} | {
    atLeastOneVisibleElement: boolean;
    scrollBars: import("../scene/types").ScrollBars | undefined;
};
export declare const renderSceneToSvg: (elements: readonly NonDeletedExcalidrawElement[], rsvg: RoughSVG, svgRoot: SVGElement, files: BinaryFiles, { offsetX, offsetY, exportWithDarkMode, }?: {
    offsetX?: number | undefined;
    offsetY?: number | undefined;
    exportWithDarkMode?: boolean | undefined;
}) => void;
