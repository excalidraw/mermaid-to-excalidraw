import React from "react";
export declare const actionSendBackward: {
    name: "sendBackward";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: (import("../element/types").ExcalidrawLinearElement | import("../element/types").ExcalidrawSelectionElement | import("../element/types").ExcalidrawRectangleElement | import("../element/types").ExcalidrawDiamondElement | import("../element/types").ExcalidrawEllipseElement | import("../element/types").ExcalidrawImageElement | import("../element/types").ExcalidrawTextElement | import("../element/types").ExcalidrawFreeDrawElement)[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    contextItemLabel: string;
    keyPriority: number;
    keyTest: (event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionBringForward: {
    name: "bringForward";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: (import("../element/types").ExcalidrawLinearElement | import("../element/types").ExcalidrawSelectionElement | import("../element/types").ExcalidrawRectangleElement | import("../element/types").ExcalidrawDiamondElement | import("../element/types").ExcalidrawEllipseElement | import("../element/types").ExcalidrawImageElement | import("../element/types").ExcalidrawTextElement | import("../element/types").ExcalidrawFreeDrawElement)[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    contextItemLabel: string;
    keyPriority: number;
    keyTest: (event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionSendToBack: {
    name: "sendToBack";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: readonly import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    contextItemLabel: string;
    keyTest: (event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionBringToFront: {
    name: "bringToFront";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: readonly import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    contextItemLabel: string;
    keyTest: (event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | React.KeyboardEvent<Element>) => boolean) | undefined;
};
