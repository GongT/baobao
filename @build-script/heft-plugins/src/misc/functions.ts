import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';

export function posixPath(p: string) {
	return p.replace(/\\/g, '/');
}
export function relativePath(from: string, to: string) {
	return posixPath(relative(from, to));
}

export function writeFileIfChange(file: string, data: string | Buffer) {
	if (existsSync(file)) {
		if (readFileSync(file, 'utf-8') === data) {
			return false;
		}
	}
	writeFileSync(file, data, 'utf-8');
	return true;
}

export function camelCase(str: string) {
	return str.replace(/[-.\/_][a-z]/g, (s) => {
		return s[1]!.toUpperCase();
	});
}

export function ucfirst<T extends string>(str: T): Capitalize<T> {
	return <any>(str[0]!.toUpperCase() + str.slice(1));
}

export function findUpUntilSync(from: string, file: string): string | null {
	for (let _from = resolve(from); _from !== '/'; _from = dirname(_from)) {
		const want = resolve(_from, file);
		if (existsSync(want)) {
			return want;
		}
	}

	const final = resolve('/', file);
	if (existsSync(final)) {
		return final;
	}

	return null;
}

type Primitive = undefined | null | boolean | string | number | Function | bigint;

export type DeepReadonly<T> = T extends Primitive
	? T
	: T extends Array<infer U>
		? DeepReadonlyArray<U>
		: T extends Map<infer K, infer V>
			? DeepReadonlyMap<K, V>
			: T extends Set<infer M>
				? DeepReadonlySet<M>
				: DeepReadonlyObject<T>;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;
type DeepReadonlyMap<K, V> = ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>;
type DeepReadonlySet<T> = ReadonlySet<DeepReadonly<T>>;
type DeepReadonlyObject<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

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
