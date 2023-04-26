import { PointerType, ExcalidrawLinearElement, NonDeletedExcalidrawElement, NonDeleted, TextAlign, ExcalidrawElement, GroupId, ExcalidrawBindableElement, Arrowhead, ChartType, FontFamilyValues, FileId, ExcalidrawImageElement, Theme, StrokeRoundness } from "./element/types";
import { SHAPES } from "./shapes";
import { Point as RoughPoint } from "roughjs/bin/geometry";
import { LinearElementEditor } from "./element/linearElementEditor";
import { SuggestedBinding } from "./element/binding";
import { ImportedDataState } from "./data/types";
import type App from "./components/App";
import type { ResolvablePromise, throttleRAF } from "./utils";
import { Spreadsheet } from "./charts";
import { Language } from "./i18n";
import { ClipboardData } from "./clipboard";
import { isOverScrollBars } from "./scene";
import { MaybeTransformHandleType } from "./element/transformHandles";
import Library from "./data/library";
import type { FileSystemHandle } from "./data/filesystem";
import type { IMAGE_MIME_TYPES, MIME_TYPES } from "./constants";
import { ContextMenuItems } from "./components/ContextMenu";
import { Merge, ForwardRef, ValueOf } from "./utility-types";
import React from "react";
export declare type Point = Readonly<RoughPoint>;
export declare type Collaborator = {
    pointer?: {
        x: number;
        y: number;
    };
    button?: "up" | "down";
    selectedElementIds?: AppState["selectedElementIds"];
    username?: string | null;
    userState?: UserIdleState;
    color?: {
        background: string;
        stroke: string;
    };
    avatarUrl?: string;
    id?: string;
};
export declare type DataURL = string & {
    _brand: "DataURL";
};
export declare type BinaryFileData = {
    mimeType: ValueOf<typeof IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary;
    id: FileId;
    dataURL: DataURL;
    /**
     * Epoch timestamp in milliseconds
     */
    created: number;
    /**
     * Indicates when the file was last retrieved from storage to be loaded
     * onto the scene. We use this flag to determine whether to delete unused
     * files from storage.
     *
     * Epoch timestamp in milliseconds.
     */
    lastRetrieved?: number;
};
export declare type BinaryFileMetadata = Omit<BinaryFileData, "dataURL">;
export declare type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>;
export declare type LastActiveTool = {
    type: typeof SHAPES[number]["value"] | "eraser" | "hand";
    customType: null;
} | {
    type: "custom";
    customType: string;
} | null;
export declare type AppState = {
    contextMenu: {
        items: ContextMenuItems;
        top: number;
        left: number;
    } | null;
    showWelcomeScreen: boolean;
    isLoading: boolean;
    errorMessage: React.ReactNode;
    draggingElement: NonDeletedExcalidrawElement | null;
    resizingElement: NonDeletedExcalidrawElement | null;
    multiElement: NonDeleted<ExcalidrawLinearElement> | null;
    selectionElement: NonDeletedExcalidrawElement | null;
    isBindingEnabled: boolean;
    startBoundElement: NonDeleted<ExcalidrawBindableElement> | null;
    suggestedBindings: SuggestedBinding[];
    editingElement: NonDeletedExcalidrawElement | null;
    editingLinearElement: LinearElementEditor | null;
    activeTool: {
        /**
         * indicates a previous tool we should revert back to if we deselect the
         * currently active tool. At the moment applies to `eraser` and `hand` tool.
         */
        lastActiveTool: LastActiveTool;
        locked: boolean;
    } & ({
        type: typeof SHAPES[number]["value"] | "eraser" | "hand";
        customType: null;
    } | {
        type: "custom";
        customType: string;
    });
    penMode: boolean;
    penDetected: boolean;
    exportBackground: boolean;
    exportEmbedScene: boolean;
    exportWithDarkMode: boolean;
    exportScale: number;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: ExcalidrawElement["fillStyle"];
    currentItemStrokeWidth: number;
    currentItemStrokeStyle: ExcalidrawElement["strokeStyle"];
    currentItemRoughness: number;
    currentItemOpacity: number;
    currentItemFontFamily: FontFamilyValues;
    currentItemFontSize: number;
    currentItemTextAlign: TextAlign;
    currentItemStartArrowhead: Arrowhead | null;
    currentItemEndArrowhead: Arrowhead | null;
    currentItemRoundness: StrokeRoundness;
    viewBackgroundColor: string;
    scrollX: number;
    scrollY: number;
    cursorButton: "up" | "down";
    scrolledOutside: boolean;
    name: string;
    isResizing: boolean;
    isRotating: boolean;
    zoom: Zoom;
    openMenu: "canvas" | "shape" | null;
    openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
    openSidebar: "library" | "customSidebar" | null;
    openDialog: "imageExport" | "help" | "jsonExport" | null;
    isSidebarDocked: boolean;
    lastPointerDownWith: PointerType;
    selectedElementIds: {
        [id: string]: boolean;
    };
    previousSelectedElementIds: {
        [id: string]: boolean;
    };
    shouldCacheIgnoreZoom: boolean;
    toast: {
        message: string;
        closable?: boolean;
        duration?: number;
    } | null;
    zenModeEnabled: boolean;
    theme: Theme;
    gridSize: number | null;
    viewModeEnabled: boolean;
    /** top-most selected groups (i.e. does not include nested groups) */
    selectedGroupIds: {
        [groupId: string]: boolean;
    };
    /** group being edited when you drill down to its constituent element
      (e.g. when you double-click on a group's element) */
    editingGroupId: GroupId | null;
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    fileHandle: FileSystemHandle | null;
    collaborators: Map<string, Collaborator>;
    showStats: boolean;
    currentChartType: ChartType;
    pasteDialog: {
        shown: false;
        data: null;
    } | {
        shown: true;
        data: Spreadsheet;
    };
    /** imageElement waiting to be placed on canvas */
    pendingImageElementId: ExcalidrawImageElement["id"] | null;
    showHyperlinkPopup: false | "info" | "editor";
    selectedLinearElement: LinearElementEditor | null;
};
export declare type NormalizedZoomValue = number & {
    _brand: "normalizedZoom";
};
export declare type Zoom = Readonly<{
    value: NormalizedZoomValue;
}>;
export declare type PointerCoords = Readonly<{
    x: number;
    y: number;
}>;
export declare type Gesture = {
    pointers: Map<number, PointerCoords>;
    lastCenter: {
        x: number;
        y: number;
    } | null;
    initialDistance: number | null;
    initialScale: number | null;
};
export declare class GestureEvent extends UIEvent {
    readonly rotation: number;
    readonly scale: number;
}
/** @deprecated legacy: do not use outside of migration paths */
export declare type LibraryItem_v1 = readonly NonDeleted<ExcalidrawElement>[];
/** @deprecated legacy: do not use outside of migration paths */
declare type LibraryItems_v1 = readonly LibraryItem_v1[];
/** v2 library item */
export declare type LibraryItem = {
    id: string;
    status: "published" | "unpublished";
    elements: readonly NonDeleted<ExcalidrawElement>[];
    /** timestamp in epoch (ms) */
    created: number;
    name?: string;
    error?: string;
};
export declare type LibraryItems = readonly LibraryItem[];
export declare type LibraryItems_anyVersion = LibraryItems | LibraryItems_v1;
export declare type LibraryItemsSource = ((currentLibraryItems: LibraryItems) => Blob | LibraryItems_anyVersion | Promise<LibraryItems_anyVersion | Blob>) | Blob | LibraryItems_anyVersion | Promise<LibraryItems_anyVersion | Blob>;
export declare type ExcalidrawAPIRefValue = ExcalidrawImperativeAPI | {
    readyPromise?: ResolvablePromise<ExcalidrawImperativeAPI>;
    ready?: false;
};
export declare type ExcalidrawInitialDataState = Merge<ImportedDataState, {
    libraryItems?: Required<ImportedDataState>["libraryItems"] | Promise<Required<ImportedDataState>["libraryItems"]>;
}>;
export interface ExcalidrawProps {
    onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void;
    initialData?: ExcalidrawInitialDataState | null | Promise<ExcalidrawInitialDataState | null>;
    excalidrawRef?: ForwardRef<ExcalidrawAPIRefValue>;
    isCollaborating?: boolean;
    onPointerUpdate?: (payload: {
        pointer: {
            x: number;
            y: number;
        };
        button: "down" | "up";
        pointersMap: Gesture["pointers"];
    }) => void;
    onPaste?: (data: ClipboardData, event: ClipboardEvent | null) => Promise<boolean> | boolean;
    renderTopRightUI?: (isMobile: boolean, appState: AppState) => JSX.Element | null;
    langCode?: Language["code"];
    viewModeEnabled?: boolean;
    zenModeEnabled?: boolean;
    gridModeEnabled?: boolean;
    libraryReturnUrl?: string;
    theme?: Theme;
    name?: string;
    renderCustomStats?: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => JSX.Element;
    UIOptions?: Partial<UIOptions>;
    detectScroll?: boolean;
    handleKeyboardGlobally?: boolean;
    onLibraryChange?: (libraryItems: LibraryItems) => void | Promise<any>;
    autoFocus?: boolean;
    generateIdForFile?: (file: File) => string | Promise<string>;
    onLinkOpen?: (element: NonDeletedExcalidrawElement, event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
    }>) => void;
    onPointerDown?: (activeTool: AppState["activeTool"], pointerDownState: PointerDownState) => void;
    onScrollChange?: (scrollX: number, scrollY: number) => void;
    /**
     * Render function that renders custom <Sidebar /> component.
     */
    renderSidebar?: () => JSX.Element | null;
    children?: React.ReactNode;
}
export declare type SceneData = {
    elements?: ImportedDataState["elements"];
    appState?: ImportedDataState["appState"];
    collaborators?: Map<string, Collaborator>;
    commitToHistory?: boolean;
};
export declare enum UserIdleState {
    ACTIVE = "active",
    AWAY = "away",
    IDLE = "idle"
}
export declare type ExportOpts = {
    saveFileToDisk?: boolean;
    onExportToBackend?: (exportedElements: readonly NonDeletedExcalidrawElement[], appState: AppState, files: BinaryFiles, canvas: HTMLCanvasElement | null) => void;
    renderCustomUI?: (exportedElements: readonly NonDeletedExcalidrawElement[], appState: AppState, files: BinaryFiles, canvas: HTMLCanvasElement | null) => JSX.Element;
};
declare type CanvasActions = Partial<{
    changeViewBackgroundColor: boolean;
    clearCanvas: boolean;
    export: false | ExportOpts;
    loadScene: boolean;
    saveToActiveFile: boolean;
    toggleTheme: boolean | null;
    saveAsImage: boolean;
}>;
declare type UIOptions = Partial<{
    dockedSidebarBreakpoint: number;
    canvasActions: CanvasActions;
    /** @deprecated does nothing. Will be removed in 0.15 */
    welcomeScreen?: boolean;
}>;
export declare type AppProps = Merge<ExcalidrawProps, {
    UIOptions: Merge<UIOptions, {
        canvasActions: Required<CanvasActions> & {
            export: ExportOpts;
        };
    }>;
    detectScroll: boolean;
    handleKeyboardGlobally: boolean;
    isCollaborating: boolean;
    children?: React.ReactNode;
}>;
/** A subset of App class properties that we need to use elsewhere
 * in the app, eg Manager. Factored out into a separate type to keep DRY. */
export declare type AppClassProperties = {
    props: AppProps;
    canvas: HTMLCanvasElement | null;
    focusContainer(): void;
    library: Library;
    imageCache: Map<FileId, {
        image: HTMLImageElement | Promise<HTMLImageElement>;
        mimeType: ValueOf<typeof IMAGE_MIME_TYPES>;
    }>;
    files: BinaryFiles;
    device: App["device"];
    scene: App["scene"];
    pasteFromClipboard: App["pasteFromClipboard"];
};
export declare type PointerDownState = Readonly<{
    origin: Readonly<{
        x: number;
        y: number;
    }>;
    originInGrid: Readonly<{
        x: number;
        y: number;
    }>;
    scrollbars: ReturnType<typeof isOverScrollBars>;
    lastCoords: {
        x: number;
        y: number;
    };
    originalElements: Map<string, NonDeleted<ExcalidrawElement>>;
    resize: {
        handleType: MaybeTransformHandleType;
        isResizing: boolean;
        offset: {
            x: number;
            y: number;
        };
        arrowDirection: "origin" | "end";
        center: {
            x: number;
            y: number;
        };
    };
    hit: {
        element: NonDeleted<ExcalidrawElement> | null;
        allHitElements: NonDeleted<ExcalidrawElement>[];
        wasAddedToSelection: boolean;
        hasBeenDuplicated: boolean;
        hasHitCommonBoundingBoxOfSelectedElements: boolean;
    };
    withCmdOrCtrl: boolean;
    drag: {
        hasOccurred: boolean;
        offset: {
            x: number;
            y: number;
        } | null;
    };
    eventListeners: {
        onMove: null | ReturnType<typeof throttleRAF>;
        onUp: null | ((event: PointerEvent) => void);
        onKeyDown: null | ((event: KeyboardEvent) => void);
        onKeyUp: null | ((event: KeyboardEvent) => void);
    };
    boxSelection: {
        hasOccurred: boolean;
    };
    elementIdsToErase: {
        [key: ExcalidrawElement["id"]]: {
            opacity: ExcalidrawElement["opacity"];
            erase: boolean;
        };
    };
}>;
export declare type ExcalidrawImperativeAPI = {
    updateScene: InstanceType<typeof App>["updateScene"];
    updateLibrary: InstanceType<typeof Library>["updateLibrary"];
    resetScene: InstanceType<typeof App>["resetScene"];
    getSceneElementsIncludingDeleted: InstanceType<typeof App>["getSceneElementsIncludingDeleted"];
    history: {
        clear: InstanceType<typeof App>["resetHistory"];
    };
    scrollToContent: InstanceType<typeof App>["scrollToContent"];
    getSceneElements: InstanceType<typeof App>["getSceneElements"];
    getAppState: () => InstanceType<typeof App>["state"];
    getFiles: () => InstanceType<typeof App>["files"];
    refresh: InstanceType<typeof App>["refresh"];
    setToast: InstanceType<typeof App>["setToast"];
    addFiles: (data: BinaryFileData[]) => void;
    readyPromise: ResolvablePromise<ExcalidrawImperativeAPI>;
    ready: true;
    id: string;
    setActiveTool: InstanceType<typeof App>["setActiveTool"];
    setCursor: InstanceType<typeof App>["setCursor"];
    resetCursor: InstanceType<typeof App>["resetCursor"];
    toggleMenu: InstanceType<typeof App>["toggleMenu"];
};
export declare type Device = Readonly<{
    isSmScreen: boolean;
    isMobile: boolean;
    isTouchScreen: boolean;
    canDeviceFitSidebar: boolean;
}>;
export {};
