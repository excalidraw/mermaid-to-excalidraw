/// <reference types="react" />
import "./Sidebar.scss";
/** using a counter instead of boolean to handle race conditions where
 * the host app may render (mount/unmount) multiple different sidebar */
export declare const hostSidebarCountersAtom: import("jotai").Atom<{
    rendered: number;
    docked: number;
}> & {
    write: (get: {
        <Value>(atom: import("jotai").Atom<Value | Promise<Value>>): Value;
        <Value_1>(atom: import("jotai").Atom<Promise<Value_1>>): Value_1;
        <Value_2>(atom: import("jotai").Atom<Value_2>): Value_2 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_2;
    } & {
        <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>, options: {
            unstable_promise: true;
        }): Value_3 | Promise<Value_3>;
        <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>, options: {
            unstable_promise: true;
        }): Value_4 | Promise<Value_4>;
        <Value_5>(atom: import("jotai").Atom<Value_5>, options: {
            unstable_promise: true;
        }): (Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5) | Promise<Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5>;
    }, set: {
        <Value_6, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_6, undefined, Result>): Result;
        <Value_7, Update, Result_1 extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_7, Update, Result_1>, update: Update): Result_1;
    }, update: {
        rendered: number;
        docked: number;
    } | ((prev: {
        rendered: number;
        docked: number;
    }) => {
        rendered: number;
        docked: number;
    })) => void;
    onMount?: (<S extends (update: {
        rendered: number;
        docked: number;
    } | ((prev: {
        rendered: number;
        docked: number;
    }) => {
        rendered: number;
        docked: number;
    })) => void>(setAtom: S) => void | (() => void)) | undefined;
} & {
    init: {
        rendered: number;
        docked: number;
    };
};
export declare const Sidebar: import("react").ForwardRefExoticComponent<{
    children: import("react").ReactNode;
    onClose?: (() => boolean | void) | undefined;
    onDock?: ((docked: boolean) => void) | undefined;
    docked?: boolean | undefined;
    initialDockedState?: boolean | undefined;
    dockable?: boolean | undefined;
    className?: string | undefined;
} & {
    /** @private internal */
    __isInternal?: boolean | undefined;
} & import("react").RefAttributes<HTMLDivElement>> & {
    Header: {
        (props: {
            children?: import("react").ReactNode;
            className?: string | undefined;
        } & {
            __isFallback?: boolean | undefined;
        }): JSX.Element | null;
        displayName: string;
    };
};
