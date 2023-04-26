import autoprefixer = require("autoprefixer");
import TerserPlugin = require("terser-webpack-plugin");
export const mode: string;
export const entry: {
    "excalidraw.production.min": string;
};
export namespace output {
    const path: string;
    const library: string;
    const libraryTarget: string;
    const filename: string;
    const chunkFilename: string;
    const assetModuleFilename: string;
    const publicPath: string;
}
export namespace resolve {
    const extensions: string[];
}
export namespace module {
    const rules: ({
        test: RegExp;
        exclude: RegExp;
        use: (string | {
            loader: string;
            options?: undefined;
        } | {
            loader: string;
            options: {
                postcssOptions: {
                    plugins: (import("postcss").Plugin & autoprefixer.ExportedAPI)[];
                };
            };
        })[];
        type?: undefined;
    } | {
        test: RegExp;
        exclude: RegExp;
        use: ({
            loader: string;
            options: {
                transpileOnly: boolean;
                configFile: string;
                presets?: undefined;
                plugins?: undefined;
            };
        } | {
            loader: string;
            options: {
                presets: (string | (string | {
                    runtime: string;
                })[])[];
                plugins: string[];
                transpileOnly?: undefined;
                configFile?: undefined;
            };
        })[];
        type?: undefined;
    } | {
        test: RegExp;
        type: string;
        exclude?: undefined;
        use?: undefined;
    })[];
}
export namespace optimization {
    const minimize: boolean;
    const minimizer: TerserPlugin<import("terser").MinifyOptions>[];
    namespace splitChunks {
        const chunks: string;
        namespace cacheGroups {
            namespace vendors {
                const test: RegExp;
                const name: string;
            }
        }
    }
}
export const plugins: any[];
export const externals: {
    react: {
        root: string;
        commonjs2: string;
        commonjs: string;
        amd: string;
    };
    "react-dom": {
        root: string;
        commonjs2: string;
        commonjs: string;
        amd: string;
    };
};
