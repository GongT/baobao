export interface NamedFunction extends Function {
	displayName: string;
}

export function functionName(func: Function) {
	return (func as any).displayName || func.name;
}

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

export function assertFunctionHasName(func: MaybeNamedFunction) {
	if (!func.displayName && !func.name) {
		console.error(func);
		throw new TypeError('function must have name!');
	}
}
