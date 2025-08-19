import { definePrivateConstant } from '../autoindex.js';

export interface NamedObject {
	displayName: string;
}

/**
 * Get displayName/name of a object
 */
export function objectName<T = unknown>(func: NonNullable<T>) {
	return (func as MaybeNamed).displayName || (func as MaybeNamed).name;
}

/**
 * Set displayName of a object
 */
export function nameObject<T extends {} = any>(name: string, object: T): T & NamedObject {
	if (typeof object === 'function') {
		definePrivateConstant(object, 'name', name);
	} else if ('name' in object) {
		definePrivateConstant(object, 'displayName', name);
	} else {
		definePrivateConstant(object, 'name', name);
	}
	definePrivateConstant(object, Symbol.toStringTag, `${object.constructor.name}: ${name}`);
	return object as any;
}

export interface MaybeNamed {
	readonly name?: string;
	readonly displayName?: string;
}

/**
 * Assert function must have oneof displayName/name property
 */
export function assertObjectHasName<T = unknown>(func: NonNullable<T>): asserts func is T & NamedObject {
	if (!(func as MaybeNamed).displayName && !(func as MaybeNamed).name) {
		console.error(func);
		throw new TypeError('object must have name!');
	}
}

/**
 * Function with displayName
 */
export interface NamedFunction extends Function {
	displayName: string;
}
/**
 * Function with displayName
 */
export interface MaybeNamedFunction extends Function {
	displayName?: string;
}

/** like objectName but return <anonymous> */
export function functionName(func: Function) {
	return objectName(func) || '<anonymous>';
}
/** @deprecated use nameObject */
export const nameFunction = nameObject;
/** @deprecated use assertObjectHasName */
export const assertFunctionHasName = assertObjectHasName;
