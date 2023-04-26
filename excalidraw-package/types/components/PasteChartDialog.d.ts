import React from "react";
import { AppState, LibraryItem } from "../types";
import "./PasteChartDialog.scss";
export declare const PasteChartDialog: ({ setAppState, appState, onClose, onInsertChart, }: {
    appState: AppState;
    onClose: () => void;
    setAppState: React.Component<any, AppState>["setState"];
    onInsertChart: (elements: LibraryItem["elements"]) => void;
}) => JSX.Element;
