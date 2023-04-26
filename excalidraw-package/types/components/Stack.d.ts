import "./Stack.scss";
import React from "react";
declare type StackProps = {
    children: React.ReactNode;
    gap?: number;
    align?: "start" | "center" | "end" | "baseline";
    justifyContent?: "center" | "space-around" | "space-between";
    className?: string | boolean;
    style?: React.CSSProperties;
};
declare const _default: {
    Row: ({ children, gap, align, justifyContent, className, style, }: StackProps) => JSX.Element;
    Col: ({ children, gap, align, justifyContent, className, style, }: StackProps) => JSX.Element;
};
export default _default;
