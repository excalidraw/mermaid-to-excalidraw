import { AppClassProperties, DataURL, BinaryFiles } from "../types";
import { ExcalidrawElement, FileId, InitializedExcalidrawImageElement } from "./types";
export declare const loadHTMLImageElement: (dataURL: DataURL) => Promise<HTMLImageElement>;
/** NOTE: updates cache even if already populated with given image. Thus,
 * you should filter out the images upstream if you want to optimize this. */
export declare const updateImageCache: ({ fileIds, files, imageCache, }: {
    fileIds: FileId[];
    files: BinaryFiles;
    imageCache: AppClassProperties["imageCache"];
}) => Promise<{
    imageCache: Map<FileId, {
        image: HTMLImageElement | Promise<HTMLImageElement>;
        mimeType: import("../utility-types").ValueOf<{
            readonly svg: "image/svg+xml";
            readonly png: "image/png";
            readonly jpg: "image/jpeg";
            readonly gif: "image/gif";
            readonly webp: "image/webp";
            readonly bmp: "image/bmp";
            readonly ico: "image/x-icon";
            readonly avif: "image/avif";
            readonly jfif: "image/jfif";
        }>;
    }>;
    /** includes errored files because they cache was updated nonetheless */
    updatedFiles: Map<FileId, true>;
    /** files that failed when creating HTMLImageElement */
    erroredFiles: Map<FileId, true>;
}>;
export declare const getInitializedImageElements: (elements: readonly ExcalidrawElement[]) => InitializedExcalidrawImageElement[];
export declare const isHTMLSVGElement: (node: Node | null) => node is SVGElement;
export declare const normalizeSVG: (SVGString: string) => Promise<string>;
