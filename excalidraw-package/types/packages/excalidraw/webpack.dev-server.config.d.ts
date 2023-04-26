export namespace entry {
    const bundle: string;
}
export namespace devServer {
    export const port: number;
    export const host: string;
    export const hot: boolean;
    export const compress: boolean;
    export namespace _static {
        const directory: string;
    }
    export { _static as static };
    export namespace client {
        const progress: boolean;
        const logging: string;
        const overlay: boolean;
    }
    export const open: string[];
}
