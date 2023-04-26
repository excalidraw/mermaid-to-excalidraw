import { AppState, PointerCoords, Zoom } from "../types";
import { ExcalidrawElement } from "../element/types";
export declare const centerScrollOn: ({ scenePoint, viewportDimensions, zoom, }: {
    scenePoint: PointerCoords;
    viewportDimensions: {
        height: number;
        width: number;
    };
    zoom: Zoom;
}) => {
    scrollX: number;
    scrollY: number;
};
export declare const calculateScrollCenter: (elements: readonly ExcalidrawElement[], appState: AppState, canvas: HTMLCanvasElement | null) => {
    scrollX: number;
    scrollY: number;
};
