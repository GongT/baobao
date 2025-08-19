import type { Primitive } from './literal.js';

export type DeepReadonly<T> = T extends Primitive ? T : T extends Array<infer U> ? DeepReadonlyArray<U> : T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V> : T extends Set<infer M> ? DeepReadonlySet<M> : DeepReadonlyObject<T>;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;
type DeepReadonlyMap<K, V> = ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>;
type DeepReadonlySet<T> = ReadonlySet<DeepReadonly<T>>;
type DeepReadonlyObject<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
