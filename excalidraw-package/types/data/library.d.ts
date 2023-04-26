import { LibraryItems, ExcalidrawImperativeAPI, LibraryItemsSource } from "../types";
import type App from "../components/App";
import { ExcalidrawElement } from "../element/types";
export declare const libraryItemsAtom: import("jotai").Atom<{
    status: "loading" | "loaded";
    isInitialized: boolean;
    libraryItems: LibraryItems;
}> & {
    write: (get: {
        <Value>(atom: import("jotai").Atom<Value | Promise<Value>>): Value;
        <Value_1>(atom: import("jotai").Atom<Promise<Value_1>>): Value_1;
        <Value_2>(atom: import("jotai").Atom<Value_2>): Value_2 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_2;
    } & {
        <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>, options: {
            unstable_promise: true;
        }): Value_3 | Promise<Value_3>;
        <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>, options: {
            unstable_promise: true;
        }): Value_4 | Promise<Value_4>;
        <Value_5>(atom: import("jotai").Atom<Value_5>, options: {
            unstable_promise: true;
        }): (Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5) | Promise<Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5>;
    }, set: {
        <Value_6, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_6, undefined, Result>): Result;
        <Value_7, Update, Result_1 extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_7, Update, Result_1>, update: Update): Result_1;
    }, update: {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    } | ((prev: {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    }) => {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    })) => void;
    onMount?: (<S extends (update: {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    } | ((prev: {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    }) => {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    })) => void>(setAtom: S) => void | (() => void)) | undefined;
} & {
    init: {
        status: "loading" | "loaded";
        isInitialized: boolean;
        libraryItems: LibraryItems;
    };
};
/** Merges otherItems into localItems. Unique items in otherItems array are
    sorted first. */
export declare const mergeLibraryItems: (localItems: LibraryItems, otherItems: LibraryItems) => LibraryItems;
declare class Library {
    /** latest libraryItems */
    private lastLibraryItems;
    /** indicates whether library is initialized with library items (has gone
     * though at least one update) */
    private isInitialized;
    private app;
    constructor(app: App);
    private updateQueue;
    private getLastUpdateTask;
    private notifyListeners;
    resetLibrary: () => Promise<LibraryItems>;
    /**
     * @returns latest cloned libraryItems. Awaits all in-progress updates first.
     */
    getLatestLibrary: () => Promise<LibraryItems>;
    updateLibrary: ({ libraryItems, prompt, merge, openLibraryMenu, defaultStatus, }: {
        libraryItems: LibraryItemsSource;
        merge?: boolean | undefined;
        prompt?: boolean | undefined;
        openLibraryMenu?: boolean | undefined;
        defaultStatus?: "published" | "unpublished" | undefined;
    }) => Promise<LibraryItems>;
    setLibrary: (libraryItems: LibraryItems | Promise<LibraryItems> | ((latestLibraryItems: LibraryItems) => LibraryItems | Promise<LibraryItems>)) => Promise<LibraryItems>;
}
export default Library;
export declare const distributeLibraryItemsOnSquareGrid: (libraryItems: LibraryItems) => ExcalidrawElement[];
export declare const parseLibraryTokensFromUrl: () => {
    libraryUrl: string;
    idToken: string | null;
} | null;
export declare const useHandleLibrary: ({ excalidrawAPI, getInitialLibraryItems, }: {
    excalidrawAPI: ExcalidrawImperativeAPI | null;
    getInitialLibraryItems?: (() => LibraryItemsSource) | undefined;
}) => void;
