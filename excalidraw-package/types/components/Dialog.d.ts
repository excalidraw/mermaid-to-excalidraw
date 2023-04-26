import React from "react";
import "./Dialog.scss";
import { AppState } from "../types";
export interface DialogProps {
    children: React.ReactNode;
    className?: string;
    small?: boolean;
    onCloseRequest(): void;
    title: React.ReactNode;
    autofocus?: boolean;
    theme?: AppState["theme"];
    closeOnClickOutside?: boolean;
}
export declare const Dialog: (props: DialogProps) => JSX.Element;
