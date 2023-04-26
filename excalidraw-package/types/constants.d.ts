import { AppProps } from "./types";
import { ExcalidrawElement, FontFamilyValues } from "./element/types";
export declare const isDarwin: boolean;
export declare const isWindows: boolean;
export declare const isAndroid: boolean;
export declare const isFirefox: boolean;
export declare const isChrome: boolean;
export declare const isSafari: boolean;
export declare const isBrave: () => boolean;
export declare const APP_NAME = "Excalidraw";
export declare const DRAGGING_THRESHOLD = 10;
export declare const LINE_CONFIRM_THRESHOLD = 8;
export declare const ELEMENT_SHIFT_TRANSLATE_AMOUNT = 5;
export declare const ELEMENT_TRANSLATE_AMOUNT = 1;
export declare const TEXT_TO_CENTER_SNAP_THRESHOLD = 30;
export declare const SHIFT_LOCKING_ANGLE: number;
export declare const CURSOR_TYPE: {
    TEXT: string;
    CROSSHAIR: string;
    GRABBING: string;
    GRAB: string;
    POINTER: string;
    MOVE: string;
    AUTO: string;
};
export declare const POINTER_BUTTON: {
    readonly MAIN: 0;
    readonly WHEEL: 1;
    readonly SECONDARY: 2;
    readonly TOUCH: -1;
};
export declare enum EVENT {
    COPY = "copy",
    PASTE = "paste",
    CUT = "cut",
    KEYDOWN = "keydown",
    KEYUP = "keyup",
    MOUSE_MOVE = "mousemove",
    RESIZE = "resize",
    UNLOAD = "unload",
    FOCUS = "focus",
    BLUR = "blur",
    DRAG_OVER = "dragover",
    DROP = "drop",
    GESTURE_END = "gestureend",
    BEFORE_UNLOAD = "beforeunload",
    GESTURE_START = "gesturestart",
    GESTURE_CHANGE = "gesturechange",
    POINTER_MOVE = "pointermove",
    POINTER_UP = "pointerup",
    STATE_CHANGE = "statechange",
    WHEEL = "wheel",
    TOUCH_START = "touchstart",
    TOUCH_END = "touchend",
    HASHCHANGE = "hashchange",
    VISIBILITY_CHANGE = "visibilitychange",
    SCROLL = "scroll",
    EXCALIDRAW_LINK = "excalidraw-link",
    MENU_ITEM_SELECT = "menu.itemSelect"
}
export declare const ENV: {
    TEST: string;
    DEVELOPMENT: string;
};
export declare const CLASSES: {
    SHAPE_ACTIONS_MENU: string;
};
export declare const FONT_FAMILY: {
    Virgil: number;
    Helvetica: number;
    Cascadia: number;
};
export declare const THEME: {
    LIGHT: string;
    DARK: string;
};
export declare const WINDOWS_EMOJI_FALLBACK_FONT = "Segoe UI Emoji";
export declare const DEFAULT_FONT_SIZE = 20;
export declare const DEFAULT_FONT_FAMILY: FontFamilyValues;
export declare const DEFAULT_TEXT_ALIGN = "left";
export declare const DEFAULT_VERTICAL_ALIGN = "top";
export declare const DEFAULT_VERSION = "{version}";
export declare const CANVAS_ONLY_ACTIONS: string[];
export declare const GRID_SIZE = 20;
export declare const IMAGE_MIME_TYPES: {
    readonly svg: "image/svg+xml";
    readonly png: "image/png";
    readonly jpg: "image/jpeg";
    readonly gif: "image/gif";
    readonly webp: "image/webp";
    readonly bmp: "image/bmp";
    readonly ico: "image/x-icon";
    readonly avif: "image/avif";
    readonly jfif: "image/jfif";
};
export declare const MIME_TYPES: {
    readonly svg: "image/svg+xml";
    readonly png: "image/png";
    readonly jpg: "image/jpeg";
    readonly gif: "image/gif";
    readonly webp: "image/webp";
    readonly bmp: "image/bmp";
    readonly ico: "image/x-icon";
    readonly avif: "image/avif";
    readonly jfif: "image/jfif";
    readonly json: "application/json";
    readonly excalidraw: "application/vnd.excalidraw+json";
    readonly excalidrawlib: "application/vnd.excalidrawlib+json";
    readonly "excalidraw.svg": "image/svg+xml";
    readonly "excalidraw.png": "image/png";
    readonly binary: "application/octet-stream";
};
export declare const EXPORT_DATA_TYPES: {
    readonly excalidraw: "excalidraw";
    readonly excalidrawClipboard: "excalidraw/clipboard";
    readonly excalidrawLibrary: "excalidrawlib";
};
export declare const EXPORT_SOURCE: string;
export declare const IMAGE_RENDER_TIMEOUT = 500;
export declare const TAP_TWICE_TIMEOUT = 300;
export declare const TOUCH_CTX_MENU_TIMEOUT = 500;
export declare const TITLE_TIMEOUT = 10000;
export declare const VERSION_TIMEOUT = 30000;
export declare const SCROLL_TIMEOUT = 100;
export declare const ZOOM_STEP = 0.1;
export declare const MIN_ZOOM = 0.1;
export declare const HYPERLINK_TOOLTIP_DELAY = 300;
export declare const IDLE_THRESHOLD = 60000;
export declare const ACTIVE_THRESHOLD = 3000;
export declare const THEME_FILTER: any;
export declare const URL_QUERY_KEYS: {
    readonly addLibrary: "addLibrary";
};
export declare const URL_HASH_KEYS: {
    readonly addLibrary: "addLibrary";
};
export declare const DEFAULT_UI_OPTIONS: AppProps["UIOptions"];
export declare const MQ_SM_MAX_WIDTH = 640;
export declare const MQ_MAX_WIDTH_PORTRAIT = 730;
export declare const MQ_MAX_WIDTH_LANDSCAPE = 1000;
export declare const MQ_MAX_HEIGHT_LANDSCAPE = 500;
export declare const MQ_RIGHT_SIDEBAR_MIN_WIDTH = 1229;
export declare const LIBRARY_SIDEBAR_WIDTH: number;
export declare const MAX_DECIMALS_FOR_SVG_EXPORT = 2;
export declare const EXPORT_SCALES: number[];
export declare const DEFAULT_EXPORT_PADDING = 10;
export declare const DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT = 1440;
export declare const MAX_ALLOWED_FILE_BYTES: number;
export declare const SVG_NS = "http://www.w3.org/2000/svg";
export declare const ENCRYPTION_KEY_BITS = 128;
export declare const VERSIONS: {
    readonly excalidraw: 2;
    readonly excalidrawLibrary: 2;
};
export declare const BOUND_TEXT_PADDING = 5;
export declare const VERTICAL_ALIGN: {
    TOP: string;
    MIDDLE: string;
    BOTTOM: string;
};
export declare const TEXT_ALIGN: {
    LEFT: string;
    CENTER: string;
    RIGHT: string;
};
export declare const ELEMENT_READY_TO_ERASE_OPACITY = 20;
export declare const DEFAULT_PROPORTIONAL_RADIUS = 0.25;
export declare const DEFAULT_ADAPTIVE_RADIUS = 32;
export declare const ROUNDNESS: {
    readonly LEGACY: 1;
    readonly PROPORTIONAL_RADIUS: 2;
    readonly ADAPTIVE_RADIUS: 3;
};
/** key containt id of precedeing elemnt id we use in reconciliation during
 * collaboration */
export declare const PRECEDING_ELEMENT_KEY = "__precedingElement__";
export declare const DEFAULT_ELEMENT_PROPS: {
    strokeColor: ExcalidrawElement["strokeColor"];
    backgroundColor: ExcalidrawElement["backgroundColor"];
    fillStyle: ExcalidrawElement["fillStyle"];
    strokeWidth: ExcalidrawElement["strokeWidth"];
    strokeStyle: ExcalidrawElement["strokeStyle"];
    roughness: ExcalidrawElement["roughness"];
    opacity: ExcalidrawElement["opacity"];
    locked: ExcalidrawElement["locked"];
};
