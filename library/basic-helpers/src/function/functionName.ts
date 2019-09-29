export interface Callable {
	(...args: any[]): any;
	readonly name?: string;
}

export interface NamedFunction extends Callable {
	displayName: string;
}

export function functionName(func: Callable) {
	return (func as NamedFunction).displayName || func.name;
}

export function nameFunction<T extends Callable>(name: string, func: T): T & NamedFunction {
	return Object.assign(func, {
		displayName: name,
		inspect() {
			return `[Function: ${name}]`;
		},
	});
}

export interface MaybeNamedFunction extends Callable {
	displayName?: string;
}

export function assertFunctionHasName(func: MaybeNamedFunction) {
	if (!func.displayName && !func.name) {
		console.error(func);
		throw new TypeError('function must have name!');
	}
}
