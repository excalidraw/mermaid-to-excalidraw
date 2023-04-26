/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const actionAlignTop: {
    name: "alignTop";
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
export declare const actionAlignBottom: {
    name: "alignBottom";
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
export declare const actionAlignLeft: {
    name: "alignLeft";
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
export declare const actionAlignRight: {
    name: "alignRight";
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
export declare const actionAlignVerticallyCentered: {
    name: "alignVerticallyCentered";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionAlignHorizontallyCentered: {
    name: "alignHorizontallyCentered";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: Readonly<AppState>;
        elements: ExcalidrawElement[];
        commitToHistory: true;
    };
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
