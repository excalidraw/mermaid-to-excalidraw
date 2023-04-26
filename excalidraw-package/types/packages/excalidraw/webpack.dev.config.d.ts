import autoprefixer = require("autoprefixer");
import webpack = require("webpack");
export const mode: string;
export const devtool: boolean;
export const entry: {
    "excalidraw.development": string;
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
        use: {
            loader: string;
            options: {
                transpileOnly: boolean;
                configFile: string;
            };
        }[];
        type?: undefined;
    } | {
        test: RegExp;
        type: string;
        exclude?: undefined;
        use?: undefined;
    })[];
}
export namespace optimization {
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
export const plugins: (webpack.EvalSourceMapDevToolPlugin | webpack.DefinePlugin)[];
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
