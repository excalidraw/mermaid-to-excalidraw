import React from "react";
export declare const withInternalFallback: <P>(componentName: string, Component: React.FC<P>) => React.FC<P & {
    __fallback?: boolean | undefined;
}>;
