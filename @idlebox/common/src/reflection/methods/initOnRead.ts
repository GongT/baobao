import { type InitFunc, initOnRead } from '../../object/initOnRead.js';

/**
 * Decorater version of `initOnRead`
 * @see initOnRead
 */
export function init<O, T extends keyof O>(init: InitFunc<O, O[T]>): PropertyDecorator {
	return ((target: O, propertyKey: T) => {
		initOnRead<O, T>(target, propertyKey, init);
	}) as any;
}
