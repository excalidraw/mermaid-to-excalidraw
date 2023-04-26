import { EVENT } from "./constants";
import { FontFamilyValues, FontString } from "./element/types";
import { AppState, LastActiveTool, Zoom } from "./types";
import { SHAPES } from "./shapes";
export declare const setDateTimeForTests: (dateTime: string) => void;
export declare const getDateTime: () => string;
export declare const capitalizeString: (str: string) => string;
export declare const isToolIcon: (target: Element | EventTarget | null) => target is HTMLElement;
export declare const isInputLike: (target: Element | EventTarget | null) => target is HTMLBRElement | HTMLDivElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare const isWritableElement: (target: Element | EventTarget | null) => target is HTMLBRElement | HTMLDivElement | HTMLInputElement | HTMLTextAreaElement;
export declare const getFontFamilyString: ({ fontFamily, }: {
    fontFamily: FontFamilyValues;
}) => string;
/** returns fontSize+fontFamily string for assignment to DOM elements */
export declare const getFontString: ({ fontSize, fontFamily, }: {
    fontSize: number;
    fontFamily: FontFamilyValues;
}) => FontString;
export declare const debounce: <T extends any[]>(fn: (...args: T) => void, timeout: number) => {
    (...args: T): void;
    flush(): void;
    cancel(): void;
};
export declare const throttleRAF: <T extends any[]>(fn: (...args: T) => void, opts?: {
    trailing?: boolean;
}) => {
    (...args: T): void;
    flush(): void;
    cancel(): void;
};
/**
 * Compute new values based on the same ease function and trigger the
 * callback through a requestAnimationFrame call
 *
 * use `opts` to define a duration and/or an easeFn
 *
 * for example:
 * ```ts
 * easeToValuesRAF([10, 20, 10], [0, 0, 0], (a, b, c) => setState(a,b, c))
 * ```
 *
 * @param fromValues The initial values, must be numeric
 * @param toValues The destination values, must also be numeric
 * @param callback The callback receiving the values
 * @param opts default to 250ms duration and the easeOut function
 */
export declare const easeToValuesRAF: (fromValues: number[], toValues: number[], callback: (...values: number[]) => void, opts?: {
    duration?: number | undefined;
    easeFn?: ((value: number) => number) | undefined;
} | undefined) => () => void;
export declare const chunk: <T extends unknown>(array: readonly T[], size: number) => T[][];
export declare const selectNode: (node: Element) => void;
export declare const removeSelection: () => void;
export declare const distance: (x: number, y: number) => number;
export declare const updateActiveTool: (appState: Pick<AppState, "activeTool">, data: ({
    type: (typeof SHAPES)[number]["value"] | "eraser" | "hand";
} | {
    type: "custom";
    customType: string;
}) & {
    lastActiveToolBeforeEraser?: LastActiveTool;
}) => AppState["activeTool"];
export declare const resetCursor: (canvas: HTMLCanvasElement | null) => void;
export declare const setCursor: (canvas: HTMLCanvasElement | null, cursor: string) => void;
export declare const setEraserCursor: (canvas: HTMLCanvasElement | null, theme: AppState["theme"]) => void;
export declare const setCursorForShape: (canvas: HTMLCanvasElement | null, appState: AppState) => void;
export declare const isFullScreen: () => boolean;
export declare const allowFullScreen: () => Promise<void>;
export declare const exitFullScreen: () => Promise<void>;
export declare const getShortcutKey: (shortcut: string) => string;
export declare const viewportCoordsToSceneCoords: ({ clientX, clientY }: {
    clientX: number;
    clientY: number;
}, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
}) => {
    x: number;
    y: number;
};
export declare const sceneCoordsToViewportCoords: ({ sceneX, sceneY }: {
    sceneX: number;
    sceneY: number;
}, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
}) => {
    x: number;
    y: number;
};
export declare const getGlobalCSSVariable: (name: string) => string;
/**
 * Checks whether first directional character is RTL. Meaning whether it starts
 *  with RTL characters, or indeterminate (numbers etc.) characters followed by
 *  RTL.
 * See https://github.com/excalidraw/excalidraw/pull/1722#discussion_r436340171
 */
export declare const isRTL: (text: string) => boolean;
export declare const tupleToCoors: (xyTuple: readonly [number, number]) => {
    x: number;
    y: number;
};
/** use as a rejectionHandler to mute filesystem Abort errors */
export declare const muteFSAbortError: (error?: Error) => void;
export declare const findIndex: <T>(array: readonly T[], cb: (element: T, index: number, array: readonly T[]) => boolean, fromIndex?: number) => number;
export declare const findLastIndex: <T>(array: readonly T[], cb: (element: T, index: number, array: readonly T[]) => boolean, fromIndex?: number) => number;
export declare const isTransparent: (color: string) => boolean;
export declare type ResolvablePromise<T> = Promise<T> & {
    resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
    reject: (error: Error) => void;
};
export declare const resolvablePromise: <T>() => ResolvablePromise<T>;
/**
 * @param func handler taking at most single parameter (event).
 */
export declare const withBatchedUpdates: <TFunction extends ((event: any) => void) | (() => void)>(func: Parameters<TFunction>["length"] extends 0 | 1 ? TFunction : never) => TFunction;
/**
 * barches React state updates and throttles the calls to a single call per
 * animation frame
 */
export declare const withBatchedUpdatesThrottled: <TFunction extends ((event: any) => void) | (() => void)>(func: Parameters<TFunction>["length"] extends 0 | 1 ? TFunction : never) => {
    (...args: Parameters<TFunction>): void;
    flush(): void;
    cancel(): void;
};
export declare const nFormatter: (num: number, digits: number) => string;
export declare const getVersion: () => string;
export declare const supportsEmoji: () => boolean;
export declare const getNearestScrollableContainer: (element: HTMLElement) => HTMLElement | Document;
export declare const focusNearestParent: (element: HTMLInputElement) => void;
export declare const preventUnload: (event: BeforeUnloadEvent) => void;
export declare const bytesToHexString: (bytes: Uint8Array) => string;
export declare const getUpdatedTimestamp: () => number;
/**
 * Transforms array of objects containing `id` attribute,
 * or array of ids (strings), into a Map, keyd by `id`.
 */
export declare const arrayToMap: <T extends string | {
    id: string;
}>(items: readonly T[]) => Map<string, T>;
export declare const arrayToMapWithIndex: <T extends {
    id: string;
}>(elements: readonly T[]) => Map<string, [element: T, index: number]>;
export declare const isTestEnv: () => boolean;
export declare const wrapEvent: <T extends Event>(name: EVENT, nativeEvent: T) => CustomEvent<{
    nativeEvent: T;
}>;
export declare const updateObject: <T extends Record<string, any>>(obj: T, updates: Partial<T>) => T;
export declare const isPrimitive: (val: any) => boolean;
export declare const getFrame: () => "top" | "iframe";
export declare const isPromiseLike: (value: any) => value is Promise<any>;
export declare const queryFocusableElements: (container: HTMLElement | null) => HTMLElement[];
export declare const isShallowEqual: <T extends Record<string, any>>(objA: T, objB: T) => boolean;
export declare const composeEventHandlers: <E>(originalEventHandler?: ((event: E) => void) | undefined, ourEventHandler?: ((event: E) => void) | undefined, { checkForDefaultPrevented }?: {
    checkForDefaultPrevented?: boolean | undefined;
}) => (event: E) => void;
