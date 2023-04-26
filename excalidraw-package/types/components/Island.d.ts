import "./Island.scss";
import React from "react";
declare type IslandProps = {
    children: React.ReactNode;
    padding?: number;
    className?: string | boolean;
    style?: object;
};
export declare const Island: React.ForwardRefExoticComponent<IslandProps & React.RefAttributes<HTMLDivElement>>;
export {};
