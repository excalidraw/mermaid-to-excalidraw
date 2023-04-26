/// <reference types="react" />
import { AppState, ExcalidrawProps } from "../types";
import { NonDeletedExcalidrawElement } from "./types";
import { Bounds } from "./bounds";
import "./Hyperlink.scss";
export declare const EXTERNAL_LINK_IMG: HTMLImageElement;
export declare const Hyperlink: ({ element, setAppState, onLinkOpen, }: {
    element: NonDeletedExcalidrawElement;
    setAppState: React.Component<any, AppState>["setState"];
    onLinkOpen: ExcalidrawProps["onLinkOpen"];
}) => JSX.Element | null;
export declare const normalizeLink: (link: string) => string;
export declare const isLocalLink: (link: string | null) => boolean;
export declare const actionLink: {
    name: "hyperlink";
    perform: (elements: readonly import("./types").ExcalidrawElement[], appState: Readonly<AppState>) => false | {
        elements: readonly import("./types").ExcalidrawElement[];
        appState: {
            showHyperlinkPopup: "editor";
            openMenu: null;
            contextMenu: {
                items: import("../components/ContextMenu").ContextMenuItems;
                top: number;
                left: number;
            } | null;
            showWelcomeScreen: boolean;
            isLoading: boolean;
            errorMessage: import("react").ReactNode;
            draggingElement: NonDeletedExcalidrawElement | null;
            resizingElement: NonDeletedExcalidrawElement | null;
            multiElement: import("./types").NonDeleted<import("./types").ExcalidrawLinearElement> | null;
            selectionElement: NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: import("./types").NonDeleted<import("./types").ExcalidrawBindableElement> | null;
            suggestedBindings: import("./binding").SuggestedBinding[];
            editingElement: NonDeletedExcalidrawElement | null;
            editingLinearElement: import("./linearElementEditor").LinearElementEditor | null;
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
            currentItemFillStyle: import("./types").FillStyle;
            currentItemStrokeWidth: number;
            currentItemStrokeStyle: import("./types").StrokeStyle;
            currentItemRoughness: number;
            currentItemOpacity: number;
            currentItemFontFamily: number;
            currentItemFontSize: number;
            currentItemTextAlign: string;
            currentItemStartArrowhead: import("./types").Arrowhead | null;
            currentItemEndArrowhead: import("./types").Arrowhead | null;
            currentItemRoundness: import("./types").StrokeRoundness;
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
            openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
            openSidebar: "library" | "customSidebar" | null;
            openDialog: "imageExport" | "help" | "jsonExport" | null;
            isSidebarDocked: boolean;
            lastPointerDownWith: import("./types").PointerType;
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
            currentChartType: import("./types").ChartType;
            pasteDialog: {
                shown: false;
                data: null;
            } | {
                shown: true;
                data: import("../charts").Spreadsheet;
            };
            pendingImageElementId: string | null;
            selectedLinearElement: import("./linearElementEditor").LinearElementEditor | null;
        };
        commitToHistory: true;
    };
    trackEvent: {
        category: "hyperlink";
        action: string;
    };
    keyTest: (event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean;
    contextItemLabel: (elements: readonly import("./types").ExcalidrawElement[], appState: Readonly<AppState>) => "labels.link.edit" | "labels.link.create";
    predicate: (elements: readonly import("./types").ExcalidrawElement[], appState: AppState) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("../actions/types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: KeyboardEvent | import("react").KeyboardEvent<Element>) => boolean) | undefined;
};
export declare const getContextMenuLabel: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => "labels.link.edit" | "labels.link.create";
export declare const getLinkHandleFromCoords: ([x1, y1, x2, y2]: Bounds, angle: number, appState: AppState) => [x: number, y: number, width: number, height: number];
export declare const isPointHittingLinkIcon: (element: NonDeletedExcalidrawElement, appState: AppState, [x, y]: readonly [number, number], isMobile: boolean) => boolean;
export declare const showHyperlinkTooltip: (element: NonDeletedExcalidrawElement, appState: AppState) => void;
export declare const hideHyperlinkToolip: () => void;
export declare const shouldHideLinkPopup: (element: NonDeletedExcalidrawElement, appState: AppState, [clientX, clientY]: readonly [number, number]) => Boolean;
