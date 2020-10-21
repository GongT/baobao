export const memorizeValueSymbol = Symbol('@gongt/memorizeValue');

/**
 * Decorate class method/getter
 *
 * remember first return value of method/getter, directlly return memorized value when call it again
 */
export const memo: MethodDecorator = <T>(
	_target: Object,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<T>
) => {
	const original: Function = (descriptor.value ? descriptor.value : descriptor.get) as any;
	if (descriptor.set || typeof original !== 'function') {
		throw new TypeError('@memo should only use on method, or getter. Not property and setter.');
	}

	if (descriptor.get) {
		descriptor.get = function memo_getter(this: any) {
			const value = original.call(this, arguments);
			Object.defineProperty(this, propertyKey, { value });
			return value;
		};
	} else {
		descriptor.value = function memo_method(this: any) {
			const value = original.call(this, arguments);
			Object.defineProperty(this, propertyKey, { value: () => value });
			return value;
		} as any;
	}

	return descriptor;
};
