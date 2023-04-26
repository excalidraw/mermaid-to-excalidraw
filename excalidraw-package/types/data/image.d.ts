export declare const getTEXtChunk: (blob: Blob) => Promise<{
    keyword: string;
    text: string;
} | null>;
export declare const encodePngMetadata: ({ blob, metadata, }: {
    blob: Blob;
    metadata: string;
}) => Promise<Blob>;
export declare const decodePngMetadata: (blob: Blob) => Promise<string>;
export declare const encodeSvgMetadata: ({ text }: {
    text: string;
}) => Promise<string>;
export declare const decodeSvgMetadata: ({ svg }: {
    svg: string;
}) => Promise<string>;
