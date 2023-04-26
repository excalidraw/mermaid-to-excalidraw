import { AppState, NormalizedZoomValue } from "../types";
export declare const getNormalizedZoom: (zoom: number) => NormalizedZoomValue;
export declare const getStateForZoom: ({ viewportX, viewportY, nextZoom, }: {
    viewportX: number;
    viewportY: number;
    nextZoom: NormalizedZoomValue;
}, appState: AppState) => {
    scrollX: number;
    scrollY: number;
    zoom: {
        value: NormalizedZoomValue;
    };
};
