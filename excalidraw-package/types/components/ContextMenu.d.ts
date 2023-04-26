import "./ContextMenu.scss";
import { Action } from "../actions/types";
import { ActionManager } from "../actions/manager";
import React from "react";
export declare type ContextMenuItem = typeof CONTEXT_MENU_SEPARATOR | Action;
export declare type ContextMenuItems = (ContextMenuItem | false | null | undefined)[];
declare type ContextMenuProps = {
    actionManager: ActionManager;
    items: ContextMenuItems;
    top: number;
    left: number;
};
export declare const CONTEXT_MENU_SEPARATOR = "separator";
export declare const ContextMenu: React.MemoExoticComponent<({ actionManager, items, top, left }: ContextMenuProps) => JSX.Element>;
export {};
