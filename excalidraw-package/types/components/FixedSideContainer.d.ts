import "./FixedSideContainer.scss";
import React from "react";
declare type FixedSideContainerProps = {
    children: React.ReactNode;
    side: "top" | "left" | "right";
    className?: string;
};
export declare const FixedSideContainer: ({ children, side, className, }: FixedSideContainerProps) => JSX.Element;
export {};
