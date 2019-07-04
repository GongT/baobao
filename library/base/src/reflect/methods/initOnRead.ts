import { InitFunc, initOnRead } from '../../../../basic-helpers/src/object/initOnRead';

export function init<O, T extends keyof O>(init: InitFunc<O, O[T]>): PropertyDecorator {
	return function (target: O, propertyKey: T) {
		initOnRead<O, T>(target, propertyKey, init);
	} as any;
}
