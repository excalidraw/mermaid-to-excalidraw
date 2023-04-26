import { SubtypeOf } from "../utility-types";
import { ActionName } from "./types";
export declare type ShortcutName = SubtypeOf<ActionName, "toggleTheme" | "loadScene" | "clearCanvas" | "cut" | "copy" | "paste" | "copyStyles" | "pasteStyles" | "selectAll" | "deleteSelectedElements" | "duplicateSelection" | "sendBackward" | "bringForward" | "sendToBack" | "bringToFront" | "copyAsPng" | "copyAsSvg" | "group" | "ungroup" | "gridMode" | "zenMode" | "stats" | "addToLibrary" | "viewMode" | "flipHorizontal" | "flipVertical" | "hyperlink" | "toggleLock"> | "saveScene" | "imageExport";
export declare const getShortcutFromShortcutName: (name: ShortcutName) => string;
