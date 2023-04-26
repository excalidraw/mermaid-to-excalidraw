/// <reference types="react" />
import { NonDeleted, ExcalidrawLinearElement, ExcalidrawElement, PointBinding, ExcalidrawBindableElement, ExcalidrawTextElementWithContainer } from "./types";
import { Point, AppState, PointerCoords } from "../types";
import History from "../history";
import Scene from "../scene/Scene";
declare const editorMidPointsCache: {
    version: number | null;
    points: (Point | null)[];
    zoom: number | null;
};
export declare class LinearElementEditor {
    readonly elementId: ExcalidrawElement["id"] & {
        _brand: "excalidrawLinearElementId";
    };
    /** indices */
    readonly selectedPointsIndices: readonly number[] | null;
    readonly pointerDownState: Readonly<{
        prevSelectedPointsIndices: readonly number[] | null;
        /** index */
        lastClickedPoint: number;
        origin: Readonly<{
            x: number;
            y: number;
        }> | null;
        segmentMidpoint: {
            value: Point | null;
            index: number | null;
            added: boolean;
        };
    }>;
    /** whether you're dragging a point */
    readonly isDragging: boolean;
    readonly lastUncommittedPoint: Point | null;
    readonly pointerOffset: Readonly<{
        x: number;
        y: number;
    }>;
    readonly startBindingElement: ExcalidrawBindableElement | null | "keep";
    readonly endBindingElement: ExcalidrawBindableElement | null | "keep";
    readonly hoverPointIndex: number;
    readonly segmentMidPointHoveredCoords: Point | null;
    constructor(element: NonDeleted<ExcalidrawLinearElement>, scene: Scene);
    static POINT_HANDLE_SIZE: number;
    /**
     * @param id the `elementId` from the instance of this class (so that we can
     *  statically guarantee this method returns an ExcalidrawLinearElement)
     */
    static getElement(id: InstanceType<typeof LinearElementEditor>["elementId"]): NonDeleted<ExcalidrawLinearElement> | null;
    static handleBoxSelection(event: PointerEvent, appState: AppState, setState: React.Component<any, AppState>["setState"]): false | undefined;
    /** @returns whether point was dragged */
    static handlePointDragging(event: PointerEvent, appState: AppState, scenePointerX: number, scenePointerY: number, maybeSuggestBinding: (element: NonDeleted<ExcalidrawLinearElement>, pointSceneCoords: {
        x: number;
        y: number;
    }[]) => void, linearElementEditor: LinearElementEditor): boolean;
    static handlePointerUp(event: PointerEvent, editingLinearElement: LinearElementEditor, appState: AppState): LinearElementEditor;
    static getEditorMidPoints: (element: NonDeleted<ExcalidrawLinearElement>, appState: AppState) => (typeof editorMidPointsCache)["points"];
    static updateEditorMidPointsCache: (element: NonDeleted<ExcalidrawLinearElement>, appState: AppState) => void;
    static getSegmentMidpointHitCoords: (linearElementEditor: LinearElementEditor, scenePointer: {
        x: number;
        y: number;
    }, appState: AppState) => readonly [number, number] | null;
    static isSegmentTooShort(element: NonDeleted<ExcalidrawLinearElement>, startPoint: Point, endPoint: Point, zoom: AppState["zoom"]): boolean;
    static getSegmentMidPoint(element: NonDeleted<ExcalidrawLinearElement>, startPoint: Point, endPoint: Point, endPointIndex: number): readonly [number, number];
    static getSegmentMidPointIndex(linearElementEditor: LinearElementEditor, appState: AppState, midPoint: Point): number;
    static handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>, appState: AppState, history: History, scenePointer: {
        x: number;
        y: number;
    }, linearElementEditor: LinearElementEditor): {
        didAddPoint: boolean;
        hitElement: NonDeleted<ExcalidrawElement> | null;
        linearElementEditor: LinearElementEditor | null;
    };
    static arePointsEqual(point1: Point | null, point2: Point | null): boolean;
    static handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>, scenePointerX: number, scenePointerY: number, appState: AppState): LinearElementEditor | null;
    /** scene coords */
    static getPointGlobalCoordinates(element: NonDeleted<ExcalidrawLinearElement>, point: Point): readonly [number, number];
    /** scene coords */
    static getPointsGlobalCoordinates(element: NonDeleted<ExcalidrawLinearElement>): Point[];
    static getPointAtIndexGlobalCoordinates(element: NonDeleted<ExcalidrawLinearElement>, indexMaybeFromEnd: number): Point;
    static pointFromAbsoluteCoords(element: NonDeleted<ExcalidrawLinearElement>, absoluteCoords: Point): Point;
    static getPointIndexUnderCursor(element: NonDeleted<ExcalidrawLinearElement>, zoom: AppState["zoom"], x: number, y: number): number;
    static createPointAt(element: NonDeleted<ExcalidrawLinearElement>, scenePointerX: number, scenePointerY: number, gridSize: number | null): Point;
    /**
     * Normalizes line points so that the start point is at [0,0]. This is
     * expected in various parts of the codebase. Also returns new x/y to account
     * for the potential normalization.
     */
    static getNormalizedPoints(element: ExcalidrawLinearElement): {
        points: (readonly [number, number])[];
        x: number;
        y: number;
    };
    static normalizePoints(element: NonDeleted<ExcalidrawLinearElement>): void;
    static duplicateSelectedPoints(appState: AppState): false | {
        appState: {
            editingLinearElement: {
                selectedPointsIndices: number[];
                elementId: string & {
                    _brand: "excalidrawLinearElementId";
                };
                pointerDownState: Readonly<{
                    prevSelectedPointsIndices: readonly number[] | null;
                    /** index */
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
                startBindingElement: ExcalidrawBindableElement | "keep" | null;
                endBindingElement: ExcalidrawBindableElement | "keep" | null;
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
            draggingElement: import("./types").NonDeletedExcalidrawElement | null;
            resizingElement: import("./types").NonDeletedExcalidrawElement | null;
            multiElement: NonDeleted<ExcalidrawLinearElement> | null;
            selectionElement: import("./types").NonDeletedExcalidrawElement | null;
            isBindingEnabled: boolean;
            startBoundElement: NonDeleted<ExcalidrawBindableElement> | null;
            suggestedBindings: import("./binding").SuggestedBinding[];
            editingElement: import("./types").NonDeletedExcalidrawElement | null;
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
            openMenu: "canvas" | "shape" | null;
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
            showHyperlinkPopup: false | "info" | "editor";
            selectedLinearElement: LinearElementEditor | null;
        };
    };
    static deletePoints(element: NonDeleted<ExcalidrawLinearElement>, pointIndices: readonly number[]): void;
    static addPoints(element: NonDeleted<ExcalidrawLinearElement>, appState: AppState, targetPoints: {
        point: Point;
    }[]): void;
    static movePoints(element: NonDeleted<ExcalidrawLinearElement>, targetPoints: {
        index: number;
        point: Point;
        isDragging?: boolean;
    }[], otherUpdates?: {
        startBinding?: PointBinding;
        endBinding?: PointBinding;
    }): void;
    static shouldAddMidpoint(linearElementEditor: LinearElementEditor, pointerCoords: PointerCoords, appState: AppState): boolean;
    static addMidpoint(linearElementEditor: LinearElementEditor, pointerCoords: PointerCoords, appState: AppState): {
        pointerDownState: LinearElementEditor["pointerDownState"];
        selectedPointsIndices: LinearElementEditor["selectedPointsIndices"];
    } | undefined;
    private static _updatePoints;
    private static _getShiftLockedDelta;
    static getBoundTextElementPosition: (element: ExcalidrawLinearElement, boundTextElement: ExcalidrawTextElementWithContainer) => {
        x: number;
        y: number;
    };
    static getMinMaxXYWithBoundText: (element: ExcalidrawLinearElement, elementBounds: [number, number, number, number], boundTextElement: ExcalidrawTextElementWithContainer) => [number, number, number, number, number, number];
    static getElementAbsoluteCoords: (element: ExcalidrawLinearElement, includeBoundText?: boolean) => [number, number, number, number, number, number];
}
export {};
