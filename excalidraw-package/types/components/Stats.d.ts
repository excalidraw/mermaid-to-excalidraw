import React from "react";
import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState, ExcalidrawProps } from "../types";
import "./Stats.scss";
export declare const Stats: (props: {
    appState: AppState;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    onClose: () => void;
    renderCustomStats: ExcalidrawProps["renderCustomStats"];
}) => JSX.Element;
