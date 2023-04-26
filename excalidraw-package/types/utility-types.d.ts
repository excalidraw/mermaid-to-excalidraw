/// <reference types="react" />
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare type ValueOf<T> = T[keyof T];
export declare type Merge<M, N> = Omit<M, keyof N> & N;
/** utility type to assert that the second type is a subtype of the first type.
 * Returns the subtype. */
export declare type SubtypeOf<Supertype, Subtype extends Supertype> = Subtype;
export declare type ResolutionType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer R> ? R : any;
export declare type MarkOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare type MarkRequired<T, RK extends keyof T> = Exclude<T, RK> & Required<Pick<T, RK>>;
export declare type MarkNonNullable<T, K extends keyof T> = {
    [P in K]-?: P extends K ? NonNullable<T[P]> : T[P];
} & {
    [P in keyof T]: T[P];
};
export declare type NonOptional<T> = Exclude<T, undefined>;
export declare type SignatureType<T> = T extends (...args: infer R) => any ? R : never;
export declare type CallableType<T extends (...args: any[]) => any> = (...args: SignatureType<T>) => ReturnType<T>;
export declare type ForwardRef<T, P = any> = Parameters<CallableType<React.ForwardRefRenderFunction<T, P>>>[1];
export declare type ExtractSetType<T extends Set<any>> = T extends Set<infer U> ? U : never;
