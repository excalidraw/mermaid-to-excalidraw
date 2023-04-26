export declare const toByteString: (data: string | Uint8Array | ArrayBuffer) => Promise<string>;
/**
 * @param isByteString set to true if already byte string to prevent bloat
 *  due to reencoding
 */
export declare const stringToBase64: (str: string, isByteString?: boolean) => Promise<string>;
export declare const base64ToString: (base64: string, isByteString?: boolean) => Promise<string>;
declare type EncodedData = {
    encoded: string;
    encoding: "bstring";
    /** whether text is compressed (zlib) */
    compressed: boolean;
    /** version for potential migration purposes */
    version?: string;
};
/**
 * Encodes (and potentially compresses via zlib) text to byte string
 */
export declare const encode: ({ text, compress, }: {
    text: string;
    /** defaults to `true`. If compression fails, falls back to bstring alone. */
    compress?: boolean | undefined;
}) => Promise<EncodedData>;
export declare const decode: (data: EncodedData) => Promise<string>;
/**
 * The returned buffer has following format:
 * `[]` refers to a buffers wrapper (see `concatBuffers`)
 *
 * [
 *   encodingMetadataBuffer,
 *   iv,
 *   [
 *      contentsMetadataBuffer
 *      contentsBuffer
 *   ]
 * ]
 */
export declare const compressData: <T extends Record<string, any> = never>(dataBuffer: Uint8Array, options: {
    encryptionKey: string;
} & ([T] extends [never] ? {
    metadata?: T | undefined;
} : {
    metadata: T;
})) => Promise<Uint8Array>;
export declare const decompressData: <T extends Record<string, any>>(bufferView: Uint8Array, options: {
    decryptionKey: string;
}) => Promise<{
    /** metadata source is always JSON so we can decode it here */
    metadata: T;
    /** data can be anything so the caller must decode it */
    data: Uint8Array;
}>;
export {};
