import React from "react";
export declare const withUpstreamOverride: <P>(Component: React.ComponentType<P>) => readonly [React.FC<{
    children: React.ReactNode;
}>, {
    (props: P & {
        /** @private internal */
        __isFallback?: boolean | undefined;
    }): JSX.Element | null;
    displayName: string;
}];
