/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
export declare const actionSelectAll: {
    name: "selectAll";
    trackEvent: {
        category: "canvas";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<import("../types").AppState>, value: any, app: import("../types").AppClassProperties) => false | {
        appState: import("../types").AppState;
        commitToHistory: true;
    };
    contextItemLabel: string;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
