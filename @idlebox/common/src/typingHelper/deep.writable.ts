import type { Primitive } from './literal.js';

export type DeepWriteable<T> = T extends Primitive ? T : T extends ReadonlyArray<infer U> ? DeepWriteableArray<U> : T extends ReadonlyMap<infer K, infer V> ? DeepWriteableMap<K, V> : T extends ReadonlySet<infer M> ? DeepWriteableSet<M> : DeepWriteableObject<T>;

type DeepWriteableArray<T> = Array<DeepWriteable<T>>;
type DeepWriteableMap<K, V> = Map<DeepWriteable<K>, DeepWriteable<V>>;
type DeepWriteableSet<T> = Set<DeepWriteable<T>>;
type DeepWriteableObject<T> = { -readonly [K in keyof T]: DeepWriteable<T[K]> };
