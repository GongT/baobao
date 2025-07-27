type KeyType = string | number | symbol;

type FunctionType = (...rest: any[]) => any;
/**
 * Primitive类型包括：string、number、boolean、null、undefined、BigInt、RegExp、Date、function
 */
type Primitive = string | number | boolean | null | undefined | bigint | RegExp | Date | FunctionType;

type MergeFn<T> = (left: T, right: any, keyPath: KeyType[]) => NonNullable<any> | undefined;
type Constructor<T> = new (...args: any[]) => T;

/**
 * 如果对象有这个属性，则会调用这个函数进行合并
 * 例如：[custom](b, keypath) { return this.value + b.value; }
 */
export const custom = Symbol('idlebox/deepmerge/custom');

/**
 * 所有的keyPath是当前值对应的key
 * 顶级对象本身为 []
 *
 * 所有“right”值不一定和“left”值类型相同，例如尝试合并 {a:1} 和 {a:{b:1}}，会调用
 *    primitive(1, {b:1}, ['a']);
 * 所有类型的选择均以左侧对象为准
 */
export interface MergeStrategy {
	/**
	 * 合并简单值
	 * @param left a中的值
	 * @param right b中的值
	 */
	primitive?: MergeFn<Primitive>;

	/**
	 * 合并数组
	 * @param left a中的值
	 * @param right b中的值
	 * @returns 合并后的值，如果为undefined，则返回right
	 */
	array?: MergeFn<Array<any>>;

	/**
	 * 合并普通对象
	 * 其中left一定是其他合并函数无法处理的object类型
	 *
	 * @param left a中的值
	 * @param right b中的值
	 * @returns 合并后的值，如果为undefined，则执行深复制逻辑
	 */
	object?: MergeFn<object>;

	/**
	 * 根据 a.constructor 合并特殊对象
	 * 返回不做判断直接当作结果
	 */
	special?: Map<Constructor<any>, MergeFn<any>>;
}

interface StrategyRequired {
	primitive: MergeFn<Primitive>;
	array: MergeFn<Array<any>>;
	object?: MergeFn<object>;
	special: ReadonlyMap<Constructor<any>, MergeFn<any>>;
}

function isPrimitive(value: any): value is Primitive {
	return (
		value === undefined ||
		value === null ||
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		typeof value === 'bigint' ||
		typeof value === 'function' ||
		value instanceof RegExp ||
		value instanceof Date
	);
}

const defaults: StrategyRequired = {
	primitive: (left, right, _keyPath) => {
		return right === undefined ? left : right;
	},
	array: (left, right, _keyPath) => {
		return right === undefined ? left : right;
	},
	special: new Map(),
};

/**
 * 深复制并合并两个对象，原对象不会修改（当然，无法限制options传入的回调）。
 */
export function deepmerge<A, B = any>(a: A, b: B, options?: MergeStrategy): A & B {
	return _deepmerge(a, b, [], { ...defaults, ...options });
}
function _deepmerge(a: any, b: any, keypath: KeyType[], options: StrategyRequired): any {
	if (isPrimitive(a)) {
		return options.primitive(a, b, keypath);
	}

	if (custom in a) {
		return a[custom](b, keypath);
	}

	if (options.special.size) {
		const special = options.special.get(a.constructor);
		if (special) {
			return special(a, b, keypath);
		}
	}
	if (Array.isArray(a)) {
		const r = options.array(a, b, keypath);
		if (r === undefined) {
			if (Array.isArray(b)) {
				return b;
			} else {
				return a;
			}
		}
		return r;
	}

	if (!isPlainObject(a)) {
		throw new TypeError(`can not merge object with type ${typeof a} (constructor: ${a.constructor.name})`);
	}

	const objMerged = options.object?.(a, b, keypath);
	if (objMerged !== undefined) {
		return objMerged;
	}

	let copy: any = {};
	const keys = new Set([...Object.getOwnPropertyNames(a), ...Object.getOwnPropertyNames(b ?? {})]);
	for (const key of keys) {
		copy[key] = _deepmerge(a[key], b?.[key], [...keypath, key], options);
		// console.log('merge: %s %s + %s = %s', key, a[key], b?.[key], copy[key]);
	}
	return copy;
}

function isPlainObject(a: any) {
	// 判断是否为普通对象
	if (typeof a !== 'object' || a === null) return false;
	const proto = Object.getPrototypeOf(a);
	return proto === Object.prototype || proto === null;
}
