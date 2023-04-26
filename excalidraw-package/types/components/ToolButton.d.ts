import "./ToolIcon.scss";
import React from "react";
import { PointerType } from "../element/types";
export declare type ToolButtonSize = "small" | "medium";
declare type ToolButtonBaseProps = {
    icon?: React.ReactNode;
    "aria-label": string;
    "aria-keyshortcuts"?: string;
    "data-testid"?: string;
    label?: string;
    title?: string;
    name?: string;
    id?: string;
    size?: ToolButtonSize;
    keyBindingLabel?: string | null;
    showAriaLabel?: boolean;
    hidden?: boolean;
    visible?: boolean;
    selected?: boolean;
    className?: string;
    isLoading?: boolean;
};
declare type ToolButtonProps = (ToolButtonBaseProps & {
    type: "button";
    children?: React.ReactNode;
    onClick?(event: React.MouseEvent): void;
}) | (ToolButtonBaseProps & {
    type: "submit";
    children?: React.ReactNode;
    onClick?(event: React.MouseEvent): void;
}) | (ToolButtonBaseProps & {
    type: "icon";
    children?: React.ReactNode;
    onClick?(): void;
}) | (ToolButtonBaseProps & {
    type: "radio";
    checked: boolean;
    onChange?(data: {
        pointerType: PointerType | null;
    }): void;
    onPointerDown?(data: {
        pointerType: PointerType;
    }): void;
});
export declare const ToolButton: React.ForwardRefExoticComponent<ToolButtonProps & React.RefAttributes<unknown>>;
export {};
