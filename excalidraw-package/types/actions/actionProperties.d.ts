/// <reference types="react" />
import { AppState } from "../../src/types";
import { Arrowhead, ExcalidrawElement, ExcalidrawLinearElement } from "../element/types";
export declare const actionChangeStrokeColor: {
    name: "changeStrokeColor";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => any;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeBackgroundColor: {
    name: "changeBackgroundColor";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => any;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeFillStyle: {
    name: "changeFillStyle";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any, app: import("../../src/types").AppClassProperties) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemFillStyle: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeStrokeWidth: {
    name: "changeStrokeWidth";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemStrokeWidth: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStrokeStyle: import("../element/types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeSloppiness: {
    name: "changeSloppiness";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemRoughness: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeStrokeStyle: {
    name: "changeStrokeStyle";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemStrokeStyle: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeOpacity: {
    name: "changeOpacity";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemOpacity: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeFontSize: {
    name: "changeFontSize";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemFontSize: number;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionDecreaseFontSize: {
    name: "decreaseFontSize";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemFontSize: number;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
export declare const actionIncreaseFontSize: {
    name: "increaseFontSize";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemFontSize: number;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
export declare const actionChangeFontFamily: {
    name: "changeFontFamily";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemFontFamily: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeTextAlign: {
    name: "changeTextAlign";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemTextAlign: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeVerticalAlign: {
    name: "changeVerticalAlign";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeRoundness: {
    name: "changeRoundness";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: any) => {
        elements: ExcalidrawElement[];
        appState: {
            currentItemRoundness: any;
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
            viewBackgroundColor: string;
            scrollX: number;
            scrollY: number;
            cursorButton: "up" | "down";
            scrolledOutside: boolean;
            name: string;
            isResizing: boolean;
            isRotating: boolean;
            zoom: Readonly<{
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
export declare const actionChangeArrowhead: {
    name: "changeArrowhead";
    trackEvent: false;
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, value: {
        position: "start" | "end";
        type: Arrowhead;
    }) => {
        elements: ExcalidrawElement[];
        appState: {
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
            multiElement: import("../element/types").NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("../element/types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("../element/types").NonDeleted<import("../element/types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("../element/binding").SuggestedBinding[];
            editingElement: import("../element/types").NonDeletedExcalidrawElement | null;
            editingLinearElement: import("../element/linearElementEditor").LinearElementEditor | null;
            activeTool: {
                lastActiveTool: import("../../src/types").LastActiveTool;
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
            currentItemStartArrowhead: Arrowhead | null;
            currentItemEndArrowhead: Arrowhead | null;
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
                value: import("../../src/types").NormalizedZoomValue;
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
            collaborators: Map<string, import("../../src/types").Collaborator>;
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
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
