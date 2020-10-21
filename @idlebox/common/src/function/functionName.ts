/**
 * Function with displayName
 */
export interface NamedFunction extends Function {
	displayName: string;
}

/**
 * Get displayName/name of a function
 */
export function functionName(func: Function) {
	return (func as NamedFunction).displayName || func.name;
}

/**
 * Set displayName of a function
 */
export function nameFunction<T extends Function>(name: string, func: T): T & NamedFunction {
	return Object.assign(func, {
		displayName: name,
		inspect() {
			return `[Function: ${name}]`;
		},
	});
}

export interface MaybeNamedFunction extends Function {
	displayName?: string;
}

/**
 * Assert function must have oneof displayName/name property
 */
export function assertFunctionHasName(func: MaybeNamedFunction) {
	if (!func.displayName && !func.name) {
		console.error(func);
		throw new TypeError('function must have name!');
	}
}
