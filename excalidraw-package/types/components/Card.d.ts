/// <reference types="react" />
import OpenColor from "open-color";
import "./Card.scss";
export declare const Card: React.FC<{
    color: keyof OpenColor | "primary";
    children?: React.ReactNode;
}>;
