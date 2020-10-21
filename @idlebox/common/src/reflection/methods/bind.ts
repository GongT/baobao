/**
 * Auto bind `this` to class method
 */
export const bindThis: MethodDecorator = <T>(
	_target: Object,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<T>
) => {
	const oldFunc = descriptor.value;
	if (typeof oldFunc === 'function') {
		return {
			configurable: true,
			writable: false,
			get: function (this: any) {
				delete this[propertyKey];

				const fn = oldFunc.bind(this);
				this[propertyKey] = fn;
				return fn;
			},
		};
	} else {
		throw new TypeError('@bindThis can only use with method, but not property.');
	}
};
