import React from "react";
import "./Popover.scss";
declare type Props = {
    top?: number;
    left?: number;
    children?: React.ReactNode;
    onCloseRequest?(event: PointerEvent): void;
    fitInViewport?: boolean;
    offsetLeft?: number;
    offsetTop?: number;
    viewportWidth?: number;
    viewportHeight?: number;
};
export declare const Popover: ({ children, left, top, onCloseRequest, fitInViewport, offsetLeft, offsetTop, viewportWidth, viewportHeight, }: Props) => JSX.Element;
export {};
