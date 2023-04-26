import React from "react";
import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState, BinaryFiles } from "../types";
import "./ExportDialog.scss";
import { ActionManager } from "../actions/manager";
export declare const ErrorCanvasPreview: () => JSX.Element;
export declare type ExportCB = (elements: readonly NonDeletedExcalidrawElement[], scale?: number) => void;
export declare const ImageExportDialog: ({ elements, appState, setAppState, files, exportPadding, actionManager, onExportToPng, onExportToSvg, onExportToClipboard, }: {
    appState: AppState;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    files: BinaryFiles;
    exportPadding?: number | undefined;
    actionManager: ActionManager;
    onExportToPng: ExportCB;
    onExportToSvg: ExportCB;
    onExportToClipboard: ExportCB;
}) => JSX.Element;
