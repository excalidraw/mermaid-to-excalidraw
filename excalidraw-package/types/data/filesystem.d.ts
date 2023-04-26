import { FileSystemHandle, supported as nativeFileSystemSupported } from "browser-fs-access";
import { MIME_TYPES } from "../constants";
declare type FILE_EXTENSION = Exclude<keyof typeof MIME_TYPES, "binary">;
export declare const fileOpen: <M extends boolean | undefined = false>(opts: {
    extensions?: FILE_EXTENSION[] | undefined;
    description: string;
    multiple?: M | undefined;
}) => Promise<M extends false | undefined ? File : File[]>;
export declare const fileSave: (blob: Blob, opts: {
    /** supply without the extension */
    name: string;
    /** file extension */
    extension: FILE_EXTENSION;
    description: string;
    /** existing FileSystemHandle */
    fileHandle?: FileSystemHandle | null;
}) => Promise<FileSystemHandle | null>;
export type { FileSystemHandle };
export { nativeFileSystemSupported };
