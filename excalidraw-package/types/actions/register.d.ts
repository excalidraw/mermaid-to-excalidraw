import { Action } from "./types";
export declare let actions: readonly Action[];
export declare const register: <T extends Action>(action: T) => T & {
    keyTest?: (unknown extends T["keyTest"] ? never : T["keyTest"]) | undefined;
};
