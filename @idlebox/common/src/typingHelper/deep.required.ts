import { Primitive } from './literal';

export type DeepNonNullable<T> = T extends Primitive
	? T
	: T extends ReadonlyArray<infer U> | Array<infer U>
	? DeepNonNullableArray<U>
	: T extends ReadonlyMap<infer K, infer V> | Map<infer K, infer V>
	? DeepNonNullableMap<K, V>
	: T extends ReadonlySet<infer M>
	? DeepNonNullableSet<M>
	: DeepNonNullableObject<T>;

type DeepNonNullableArray<T> = Array<DeepNonNullable<T>>;
type DeepNonNullableMap<K, V> = Map<DeepNonNullable<K>, DeepNonNullable<V>>;
type DeepNonNullableSet<T> = Set<DeepNonNullable<T>>;
type DeepNonNullableObject<T> = { [K in keyof T]-?: NonNullable<T[K]> };
