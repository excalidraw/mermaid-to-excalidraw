import { ExcalidrawElement, NonDeletedExcalidrawElement } from "./element/types";
import { BinaryFiles } from "./types";
import { Spreadsheet } from "./charts";
export interface ClipboardData {
    spreadsheet?: Spreadsheet;
    elements?: readonly ExcalidrawElement[];
    files?: BinaryFiles;
    text?: string;
    errorMessage?: string;
}
export declare const probablySupportsClipboardReadText: boolean;
export declare const probablySupportsClipboardWriteText: boolean;
export declare const probablySupportsClipboardBlob: boolean;
export declare const copyToClipboard: (elements: readonly NonDeletedExcalidrawElement[], files: BinaryFiles | null) => Promise<string | undefined>;
/**
 * Retrieves content from system clipboard (either from ClipboardEvent or
 *  via async clipboard API if supported)
 */
export declare const getSystemClipboard: (event: ClipboardEvent | null) => Promise<string>;
/**
 * Attempts to parse clipboard. Prefers system clipboard.
 */
export declare const parseClipboard: (event: ClipboardEvent | null, isPlainPaste?: boolean) => Promise<ClipboardData>;
export declare const copyBlobToClipboardAsPng: (blob: Blob | Promise<Blob>) => Promise<void>;
export declare const copyTextToSystemClipboard: (text: string | null) => Promise<void>;
