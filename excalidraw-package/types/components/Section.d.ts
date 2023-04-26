import React from "react";
export declare const Section: React.FC<{
    heading: string;
    children?: React.ReactNode | ((heading: React.ReactNode) => React.ReactNode);
    className?: string;
}>;
