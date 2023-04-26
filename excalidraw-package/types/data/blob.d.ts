import { IMAGE_MIME_TYPES, MIME_TYPES } from "../constants";
import { ExcalidrawElement, FileId } from "../element/types";
import { AppState, DataURL, LibraryItem } from "../types";
import { ValueOf } from "../utility-types";
import { FileSystemHandle } from "./filesystem";
import { ImportedLibraryData } from "./types";
export declare const getMimeType: (blob: Blob | string) => string;
export declare const getFileHandleType: (handle: FileSystemHandle | null) => string | null;
export declare const isImageFileHandleType: (type: string | null) => type is "svg" | "png";
export declare const isImageFileHandle: (handle: FileSystemHandle | null) => boolean;
export declare const isSupportedImageFile: (blob: Blob | null | undefined) => blob is Blob & {
    type: ValueOf<typeof IMAGE_MIME_TYPES>;
};
export declare const loadSceneOrLibraryFromBlob: (blob: Blob | File, localAppState: AppState | null, localElements: readonly ExcalidrawElement[] | null, fileHandle?: FileSystemHandle | null) => Promise<{
    type: "application/vnd.excalidraw+json";
    data: import("./restore").RestoredDataState;
} | {
    type: "application/vnd.excalidrawlib+json";
    data: ImportedLibraryData;
}>;
export declare const loadFromBlob: (blob: Blob, localAppState: AppState | null, localElements: readonly ExcalidrawElement[] | null, fileHandle?: FileSystemHandle | null) => Promise<import("./restore").RestoredDataState>;
export declare const parseLibraryJSON: (json: string, defaultStatus?: LibraryItem["status"]) => LibraryItem[];
export declare const loadLibraryFromBlob: (blob: Blob, defaultStatus?: LibraryItem["status"]) => Promise<LibraryItem[]>;
export declare const canvasToBlob: (canvas: HTMLCanvasElement) => Promise<Blob>;
/** generates SHA-1 digest from supplied file (if not supported, falls back
    to a 40-char base64 random id) */
export declare const generateIdFromFile: (file: File) => Promise<FileId>;
export declare const getDataURL: (file: Blob | File) => Promise<DataURL>;
export declare const dataURLToFile: (dataURL: DataURL, filename?: string) => File;
export declare const resizeImageFile: (file: File, opts: {
    /** undefined indicates auto */
    outputType?: (typeof MIME_TYPES)["jpg"];
    maxWidthOrHeight: number;
}) => Promise<File>;
export declare const SVGStringToFile: (SVGString: string, filename?: string) => File & {
    type: typeof MIME_TYPES.svg;
};
export declare const getFileFromEvent: (event: React.DragEvent<HTMLDivElement>) => Promise<{
    file: File | null;
    fileHandle: FileSystemHandle | null;
}>;
export declare const getFileHandle: (event: React.DragEvent<HTMLDivElement>) => Promise<FileSystemHandle | null>;
export declare const createFile: (blob: File | Blob | ArrayBuffer, mimeType: ValueOf<typeof MIME_TYPES>, name: string | undefined) => File;
/** attempts to detect correct mimeType if none is set, or if an image
 * has an incorrect extension.
 * Note: doesn't handle missing .excalidraw/.excalidrawlib extension  */
export declare const normalizeFile: (file: File) => Promise<File>;
export declare const blobToArrayBuffer: (blob: Blob) => Promise<ArrayBuffer>;
