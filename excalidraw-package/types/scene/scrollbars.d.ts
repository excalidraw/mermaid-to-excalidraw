import { ExcalidrawElement } from "../element/types";
import { Zoom } from "../types";
import { ScrollBars } from "./types";
export declare const SCROLLBAR_MARGIN = 4;
export declare const SCROLLBAR_WIDTH = 6;
export declare const SCROLLBAR_COLOR = "rgba(0,0,0,0.3)";
export declare const getScrollBars: (elements: readonly ExcalidrawElement[], viewportWidth: number, viewportHeight: number, { scrollX, scrollY, zoom, }: {
    scrollX: number;
    scrollY: number;
    zoom: Zoom;
}) => ScrollBars;
export declare const isOverScrollBars: (scrollBars: ScrollBars, x: number, y: number) => {
    isOverEither: boolean;
    isOverHorizontal: boolean;
    isOverVertical: boolean;
};
