/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState, NormalizedZoomValue } from "../types";
export declare const actionChangeViewBackgroundColor: {
    name: "changeViewBackgroundColor";
    trackEvent: false;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState, props: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
    perform: (_: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        appState: any;
        commitToHistory: boolean;
    };
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionClearCanvas: {
    name: "clearCanvas";
    trackEvent: {
        category: "canvas";
    };
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState, props: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        elements: ExcalidrawElement[];
        appState: {
            files: {};
            theme: string;
            penMode: boolean;
            penDetected: boolean;
            exportBackground: boolean;
            exportEmbedScene: boolean;
            gridSize: number | null;
            showStats: boolean;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
                customType: null;
            } | {
                type: "custom";
                customType: string;
            });
            name: string;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            exportWithDarkMode: boolean;
            exportScale: number;
            currentItemStrokeColor: string;
            currentItemBackgroundColor: string;
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            scrollX: number;
            scrollY: number;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            isResizing: boolean;
            isRotating: boolean;
            zoom: Readonly<{
                value: NormalizedZoomValue;
            }>;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            currentChartType: import("../element/types").ChartType;
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: true;
    };
} & {
    keyTest?: undefined;
};
export declare const actionZoomIn: {
    name: "zoomIn";
    viewMode: true;
    trackEvent: {
        category: "canvas";
    };
    perform: (_elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        appState: {
            scrollX: number;
            scrollY: number;
            zoom: {
                value: NormalizedZoomValue;
            };
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: false;
    };
    PanelComponent: ({ updateData }: import("./types").PanelComponentProps) => JSX.Element;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionZoomOut: {
    name: "zoomOut";
    viewMode: true;
    trackEvent: {
        category: "canvas";
    };
    perform: (_elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        appState: {
            scrollX: number;
            scrollY: number;
            zoom: {
                value: NormalizedZoomValue;
            };
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: false;
    };
    PanelComponent: ({ updateData }: import("./types").PanelComponentProps) => JSX.Element;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionResetZoom: {
    name: "resetZoom";
    viewMode: true;
    trackEvent: {
        category: "canvas";
    };
    perform: (_elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        appState: {
            scrollX: number;
            scrollY: number;
            zoom: {
                value: NormalizedZoomValue;
            };
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: false;
    };
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const zoomToFitElements: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, zoomToSelection: boolean) => {
    appState: {
        zoom: {
            value: NormalizedZoomValue;
        };
        scrollX: number;
        scrollY: number;
        contextMenu: {
            items: import("../components/ContextMenu").ContextMenuItems;
            top: number;
            left: number;
        } | null;
        showWelcomeScreen: boolean;
        isLoading: boolean;
        errorMessage: import("react").ReactNode;
        draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
        resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
        multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
        selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
        isBindingEnabled: boolean;
        startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
        suggestedBindings: import("../element/binding").SuggestedBinding[];
        editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
        editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        activeTool: {
            lastActiveTool: import("../types").LastActiveTool;
            locked: boolean;
        } & ({
            type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
        currentItemFillStyle: import("../element/types").FillStyle;
        currentItemStrokeWidth: number;
        currentItemStrokeStyle: import("../element/types").StrokeStyle;
        currentItemRoughness: number;
        currentItemOpacity: number;
        currentItemFontFamily: number;
        currentItemFontSize: number;
        currentItemTextAlign: string;
        currentItemStartArrowhead: import("../element/types").Arrowhead | null;
        currentItemEndArrowhead: import("../element/types").Arrowhead | null;
        currentItemRoundness: import("../element/types").StrokeRoundness;
        viewBackgroundColor: string;
        cursorButton: "up" | "down";
        scrolledOutside: boolean;
        name: string;
        isResizing: boolean;
        isRotating: boolean;
        openMenu: "canvas" | "shape" | null;
        openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
        openSidebar: "library" | "customSidebar" | null;
        openDialog: "imageExport" | "help" | "jsonExport" | null;
        isSidebarDocked: boolean;
        lastPointerDownWith: import("../element/types").PointerType;
        selectedElementIds: {
            [id: string]: boolean;
        };
        previousSelectedElementIds: {
            [id: string]: boolean;
        };
        shouldCacheIgnoreZoom: boolean;
        toast: {
            message: string;
            closable?: boolean | undefined;
            duration?: number | undefined;
        } | null;
        zenModeEnabled: boolean;
        theme: string;
        gridSize: number | null;
        viewModeEnabled: boolean;
        selectedGroupIds: {
            [groupId: string]: boolean;
        };
        editingGroupId: string | null;
        width: number;
        height: number;
        offsetTop: number;
        offsetLeft: number;
        fileHandle: import("browser-fs-access").FileSystemHandle | null;
        collaborators: Map<string, import("../types").Collaborator>;
        showStats: boolean;
        currentChartType: import("../element/types").ChartType;
        pasteDialog: {
            shown: false;
            data: null;
        } | {
            shown: true;
            data: import("../charts").Spreadsheet;
        };
        pendingImageElementId: string | null;
        showHyperlinkPopup: false | "info" | "editor";
        selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
    };
    commitToHistory: boolean;
};
export declare const actionZoomToSelected: {
    name: "zoomToSelection";
    trackEvent: {
        category: "canvas";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: {
            zoom: {
                value: NormalizedZoomValue;
            };
            scrollX: number;
            scrollY: number;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: boolean;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionZoomToFit: {
    name: "zoomToFit";
    viewMode: true;
    trackEvent: {
        category: "canvas";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: {
            zoom: {
                value: NormalizedZoomValue;
            };
            scrollX: number;
            scrollY: number;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: boolean;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionToggleTheme: {
    name: "toggleTheme";
    viewMode: true;
    trackEvent: {
        category: "canvas";
    };
    perform: (_: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        appState: {
            theme: any;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
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
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            scrollX: number;
            scrollY: number;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            zoom: Readonly<{
                value: NormalizedZoomValue;
            }>;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            selectedElementIds: {
                [id: string]: boolean;
            };
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            gridSize: number | null;
            viewModeEnabled: boolean;
            selectedGroupIds: {
                [groupId: string]: boolean;
            };
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: false;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    predicate: (elements: readonly ExcalidrawElement[], appState: AppState, props: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionToggleEraserTool: {
    name: "toggleEraserTool";
    trackEvent: {
        category: "toolbar";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>) => {
        appState: {
            selectedElementIds: {};
            selectedGroupIds: {};
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
                customType: null;
            } | {
                type: "custom";
                customType: string;
            });
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            penMode: boolean;
            penDetected: boolean;
            exportBackground: boolean;
            exportEmbedScene: boolean;
            exportWithDarkMode: boolean;
            exportScale: number;
            currentItemStrokeColor: string;
            currentItemBackgroundColor: string;
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            scrollX: number;
            scrollY: number;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            zoom: Readonly<{
                value: NormalizedZoomValue;
            }>;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionToggleHandTool: {
    name: "toggleHandTool";
    trackEvent: {
        category: "toolbar";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        appState: {
            selectedElementIds: {};
            selectedGroupIds: {};
            activeTool: {
                lastActiveTool: import("../types").LastActiveTool;
                locked: boolean;
            } & ({
                type: "line" | "arrow" | "text" | "selection" | "rectangle" | "diamond" | "ellipse" | "image" | "freedraw" | "eraser" | "hand";
                customType: null;
            } | {
                type: "custom";
                customType: string;
            });
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            resizingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            multiElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            penMode: boolean;
            penDetected: boolean;
            exportBackground: boolean;
            exportEmbedScene: boolean;
            exportWithDarkMode: boolean;
            exportScale: number;
            currentItemStrokeColor: string;
            currentItemBackgroundColor: string;
            currentItemFillStyle: import("../element/types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("../element/types").Arrowhead | null;
            currentItemEndArrowhead: import("../element/types").Arrowhead | null;
            currentItemRoundness: import("../element/types").StrokeRoundness;
            viewBackgroundColor: string;
            scrollX: number;
            scrollY: number;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            zoom: Readonly<{
                value: NormalizedZoomValue;
            }>;
            openMenu: "canvas" | "shape" | null;
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("../element/types").PointerType;
            previousSelectedElementIds: {
                [id: string]: boolean;
            };
            shouldCacheIgnoreZoom: boolean;
            toast: {
                message: string;
                closable?: boolean | undefined;
                duration?: number | undefined;
            } | null;
            zenModeEnabled: boolean;
            theme: string;
            gridSize: number | null;
            viewModeEnabled: boolean;
            editingGroupId: string | null;
            width: number;
            height: number;
            offsetTop: number;
            offsetLeft: number;
            fileHandle: import("browser-fs-access").FileSystemHandle | null;
            collaborators: Map<string, import("../types").Collaborator>;
            showStats: boolean;
            currentChartType: import("../element/types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: true;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
