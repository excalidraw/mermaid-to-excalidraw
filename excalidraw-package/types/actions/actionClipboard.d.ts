/// <reference types="react" />
export declare const actionCopy: {
    name: "copy";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>, _: any, app: import("../types").AppClassProperties) => {
        commitToHistory: false;
    };
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[], appState: import("../types").AppState, appProps: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
    contextItemLabel: string;
    keyTest: undefined;
} & {
    keyTest?: undefined;
};
export declare const actionPaste: {
    name: "paste";
    trackEvent: {
        category: "element";
    };
    perform: (elements: any, appStates: any, data: any, app: import("../types").AppClassProperties) => {
        commitToHistory: false;
    };
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[], appState: import("../types").AppState, appProps: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
    contextItemLabel: string;
    keyTest: undefined;
} & {
    keyTest?: undefined;
};
export declare const actionCut: {
    name: "cut";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>, data: any, app: import("../types").AppClassProperties) => false | {
        elements: import("../element/types").ExcalidrawElement[];
        appState: {
            editingLinearElement: null;
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
                value: import("../types").NormalizedZoomValue;
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
    } | {
        elements: readonly import("../element/types").ExcalidrawElement[];
        appState: {
            editingLinearElement: {
                selectedPointsIndices: number[];
                startBindingElement: import("../element/types").ExcalidrawBindableElement | "keep" | null;
                endBindingElement: import("../element/types").ExcalidrawBindableElement | "keep" | null;
                elementId: string & {
                    _brand: "excalidrawLinearElementId";
                };
                pointerDownState: Readonly<{
                    prevSelectedPointsIndices: readonly number[] | null;
                    lastClickedPoint: number;
                    origin: Readonly<{
                        x: number;
                        y: number;
                    }> | null;
                    segmentMidpoint: {
                        value: readonly [number, number] | null;
                        index: number | null;
                        added: boolean;
                    };
                }>;
                isDragging: boolean;
                lastUncommittedPoint: readonly [number, number] | null;
                pointerOffset: Readonly<{
                    x: number;
                    y: number;
                }>;
                hoverPointIndex: number;
                segmentMidPointHoveredCoords: readonly [number, number] | null;
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
                value: import("../types").NormalizedZoomValue;
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
    } | {
        elements: import("../element/types").ExcalidrawElement[];
        appState: {
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
            multiElement: null;
            selectedElementIds: {};
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
                value: import("../types").NormalizedZoomValue;
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
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[], appState: import("../types").AppState, appProps: import("../types").ExcalidrawProps, app: import("../types").AppClassProperties) => boolean;
    contextItemLabel: string;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const actionCopyAsSvg: {
    name: "copyAsSvg";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>, _data: any, app: import("../types").AppClassProperties) => Promise<{
        commitToHistory: false;
        appState?: undefined;
    } | {
        appState: {
            errorMessage: any;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
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
                value: import("../types").NormalizedZoomValue;
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
    }>;
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[]) => boolean;
    contextItemLabel: string;
} & {
    keyTest?: undefined;
};
export declare const actionCopyAsPng: {
    name: "copyAsPng";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>, _data: any, app: import("../types").AppClassProperties) => Promise<{
        commitToHistory: false;
        appState?: undefined;
    } | {
        appState: {
            errorMessage: any;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
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
                value: import("../types").NormalizedZoomValue;
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
    }>;
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[]) => boolean;
    contextItemLabel: string;
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const copyText: {
    name: "copyText";
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        commitToHistory: false;
    };
    predicate: (elements: readonly import("../element/types").ExcalidrawElement[], appState: import("../types").AppState) => boolean;
    contextItemLabel: string;
} & {
    keyTest?: undefined;
};
