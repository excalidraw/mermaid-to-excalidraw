import { PrimitiveAtom } from "jotai";
export declare const jotaiScope: unique symbol;
export declare const jotaiStore: {
    get: <Value>(atom: import("jotai").Atom<Value>) => (Value extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value) | undefined;
    asyncGet: <Value_1>(atom: import("jotai").Atom<Value_1>) => Promise<Value_1 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_1>;
    set: <Value_2, Update, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_2, Update, Result>, update: Update) => Result;
    sub: (atom: {
        toString: () => string;
        debugLabel?: string | undefined;
        read: (get: {
            <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
            <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
            <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
        }) => unknown;
    }, callback: () => void) => () => void;
    SECRET_INTERNAL_store: {
        r: <Value_6>(readingAtom: import("jotai").Atom<Value_6>, version?: import("jotai/core/store").VersionObject | undefined) => import("jotai/core/store").AtomState<Value_6>;
        w: <Value_1_1, Update_1, Result_1 extends void | Promise<void>>(writingAtom: import("jotai").WritableAtom<Value_1_1, Update_1, Result_1>, update: Update_1, version?: import("jotai/core/store").VersionObject | undefined) => Result_1;
        c: (_atom: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        } | null, version?: import("jotai/core/store").VersionObject | undefined) => void;
        s: (atom: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }, callback: (version?: import("jotai/core/store").VersionObject | undefined) => void) => () => void;
        h: (values: Iterable<readonly [{
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }, unknown]>, version?: import("jotai/core/store").VersionObject | undefined) => void;
        n: (l: () => void) => () => void;
        l: () => IterableIterator<{
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }>;
        a: (a: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }) => import("jotai/core/store").AtomState<unknown> | undefined;
        m: (a: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }) => {
            l: Set<(version?: import("jotai/core/store").VersionObject | undefined) => void>;
            t: Set<{
                toString: () => string;
                debugLabel?: string | undefined;
                read: (get: {
                    <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                    <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                    <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
                }) => unknown;
            }>;
            u?: (() => void) | undefined;
        } | undefined;
    } | {
        r: <Value_7>(readingAtom: import("jotai").Atom<Value_7>, version?: import("jotai/core/store").VersionObject | undefined) => import("jotai/core/store").AtomState<Value_7>;
        w: <Value_1_2, Update_2, Result_2 extends void | Promise<void>>(writingAtom: import("jotai").WritableAtom<Value_1_2, Update_2, Result_2>, update: Update_2, version?: import("jotai/core/store").VersionObject | undefined) => Result_2;
        c: (_atom: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        } | null, version?: import("jotai/core/store").VersionObject | undefined) => void;
        s: (atom: {
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }, callback: (version?: import("jotai/core/store").VersionObject | undefined) => void) => () => void;
        h: (values: Iterable<readonly [{
            toString: () => string;
            debugLabel?: string | undefined;
            read: (get: {
                <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>): Value_3;
                <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>): Value_4;
                <Value_5>(atom: import("jotai").Atom<Value_5>): Value_5 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? V_1 extends Promise<infer V_1> ? any : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : V_1 : Value_5;
            }) => unknown;
        }, unknown]>, version?: import("jotai/core/store").VersionObject | undefined) => void;
        n?: undefined;
        l?: undefined;
        a?: undefined;
        m?: undefined;
    };
};
export declare const useAtomWithInitialValue: <T extends unknown, A extends PrimitiveAtom<T>>(atom: A, initialValue: T | (() => T)) => readonly [T extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : T, import("jotai/core/atom").SetAtom<T | ((prev: T) => T), void>];
