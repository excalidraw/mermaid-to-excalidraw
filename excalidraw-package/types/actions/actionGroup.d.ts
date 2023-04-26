/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const actionGroup: {
    name: "group";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: readonly ExcalidrawElement[];
        commitToHistory: false;
    } | {
        appState: AppState;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    contextItemLabel: string;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState) => boolean;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionUngroup: {
    name: "ungroup";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: readonly ExcalidrawElement[];
        commitToHistory: false;
    } | {
        appState: AppState;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    contextItemLabel: string;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
