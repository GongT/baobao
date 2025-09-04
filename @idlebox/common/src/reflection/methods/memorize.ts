import { nameObject } from '../../debugging/object-with-name.js';
import { definePrivateConstant } from '../../object/definePublicConstant.js';

const memoizeSymbol = Symbol('@gongt/memorize');

/**
 * Decorate class method
 *
 * remember first return value of method, directly return memorized value when call it again
 */
export function memo<T extends (...args: any[]) => any>(method: T, context: ClassMethodDecoratorContext): T {
	context.addInitializer(function (this: any) {
		definePrivateConstant(this, memoizeSymbol, {});
	});

	const wrapMethod = nameObject(context.name.toString(), function (this: any, ...args: any) {
		if (!this[memoizeSymbol][context.name]) {
			const val = method.apply(this, args);
			this[memoizeSymbol][context.name] = val;
		}
		return this[memoizeSymbol][context.name];
	});

	definePrivateConstant(wrapMethod, memoizeSymbol, true);
	return wrapMethod as any;
}

/**
 * remove memo from object
 */
export function forgetMemorized<T>(self: T, methodName: keyof T): void {
	const method: any = self[methodName];
	if (!method[memoizeSymbol]) {
		throw new Error('Method is not decorated by @memo');
	}
	delete (self as any)[memoizeSymbol][methodName];
}
