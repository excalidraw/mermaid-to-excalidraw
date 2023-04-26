/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const actionFlipHorizontal: {
    name: "flipHorizontal";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        elements: readonly ExcalidrawElement[];
        appState: Readonly<AppState>;
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    contextItemLabel: string;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionFlipVertical: {
    name: "flipVertical";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        elements: readonly ExcalidrawElement[];
        appState: Readonly<AppState>;
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    contextItemLabel: string;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
