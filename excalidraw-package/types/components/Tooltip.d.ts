import "./Tooltip.scss";
import React from "react";
export declare const getTooltipDiv: () => HTMLDivElement;
export declare const updateTooltipPosition: (tooltip: HTMLDivElement, item: {
    left: number;
    top: number;
    width: number;
    height: number;
}, position?: "bottom" | "top") => void;
declare type TooltipProps = {
    children: React.ReactNode;
    label: string;
    long?: boolean;
    style?: React.CSSProperties;
};
export declare const Tooltip: ({ children, label, long, style, }: TooltipProps) => JSX.Element;
export {};
