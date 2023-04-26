import React from "react";
import { ActionManager } from "../actions/manager";
import { ExcalidrawElement, PointerType } from "../element/types";
import { AppState, Zoom } from "../types";
import "./Actions.scss";
export declare const SelectedShapeActions: ({ appState, elements, renderAction, }: {
    appState: AppState;
    elements: readonly ExcalidrawElement[];
    renderAction: ActionManager["renderAction"];
}) => JSX.Element;
export declare const ShapesSwitcher: ({ canvas, activeTool, setAppState, onImageAction, appState, }: {
    canvas: HTMLCanvasElement | null;
    activeTool: AppState["activeTool"];
    setAppState: React.Component<any, AppState>["setState"];
    onImageAction: (data: {
        pointerType: PointerType | null;
    }) => void;
    appState: AppState;
}) => JSX.Element;
export declare const ZoomActions: ({ renderAction, zoom, }: {
    renderAction: ActionManager["renderAction"];
    zoom: Zoom;
}) => JSX.Element;
export declare const UndoRedoActions: ({ renderAction, className, }: {
    renderAction: ActionManager["renderAction"];
    className?: string | undefined;
}) => JSX.Element;
export declare const ExitZenModeAction: ({ actionManager, showExitZenModeBtn, }: {
    actionManager: ActionManager;
    showExitZenModeBtn: boolean;
}) => JSX.Element;
export declare const FinalizeAction: ({ renderAction, className, }: {
    renderAction: ActionManager["renderAction"];
    className?: string | undefined;
}) => JSX.Element;
