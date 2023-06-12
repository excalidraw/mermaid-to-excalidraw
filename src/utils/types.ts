export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};
