/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const distributeHorizontally: {
    name: "distributeHorizontally";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const distributeVertically: {
    name: "distributeVertically";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
