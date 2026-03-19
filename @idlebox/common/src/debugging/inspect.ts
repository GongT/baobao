import { definePrivateConstant } from '../object/definePublicConstant.js';

export const inspectSymbol = Symbol.for('nodejs.util.inspect.custom'); // high version node

export function defineInspectMethod<T>(obj: T, method: (this: T, depth: number, context: any, inspect: Function) => string): T {
	definePrivateConstant(obj, inspectSymbol, method);
	return obj;
}

/**
 * try to call `inspect` method of an object, if not exists, call `toString`.
 * @returns {string}
 */
export function tryInspect(object: any): string;
/** @internal */
export function tryInspect(object: any, options: any): string;
export function tryInspect(object: any, options?: any): string {
	if (!object || typeof object !== 'object') {
		return JSON.stringify(object);
	}

	if (object[inspectSymbol]) {
		if (options) {
			options.depth--;
		} else {
			options = {
				depth: 3,
				stylize(s: string) {
					return s;
				},
			};
		}
		return object[inspectSymbol](options.depth, options, tryInspect);
	}
	if (object.inspect) {
		return object.inspect();
	}

	const tst = object[Symbol.toStringTag];
	if (tst) {
		if (typeof tst === 'string') {
			return tst;
		} else if (typeof tst === 'function') {
			return tst.call(object);
		}
	}
	if (object.toJSON) {
		return object.toJSON();
	}
	if (object.constructor?.name) {
		return `unknown: ${object.constructor.name}`;
	}
	return `unknown: ${object}`;
}
