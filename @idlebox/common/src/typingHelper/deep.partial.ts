import { Primitive } from './literal.js';

export type DeepPartial<T> = T extends Primitive
	? T
	: T extends ReadonlyArray<infer U>
	? DeepPartialArray<U>
	: T extends ReadonlyMap<infer K, infer V>
	? DeepPartialMap<K, V>
	: T extends ReadonlySet<infer M>
	? DeepPartialSet<M>
	: DeepPartialObject<T>;

type DeepPartialArray<T> = Array<DeepPartial<T>>;
type DeepPartialMap<K, V> = Map<DeepPartial<K>, DeepPartial<V>>;
type DeepPartialSet<T> = Set<DeepPartial<T>>;
type DeepPartialObject<T> = { [K in keyof T]?: DeepPartial<T[K]> };
