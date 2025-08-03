/**
 * Auto bind `this` to class method
 */
export const bindThis: MethodDecorator = <T>(_target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
	const oldFunc = descriptor.value;
	if (typeof oldFunc === 'function') {
		return {
			enumerable: true,
			configurable: true,
			get: function (this: any) {
				delete this[propertyKey];

				const fn = oldFunc.bind(this);
				Object.defineProperty(this, propertyKey, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false,
				});
				return fn;
			},
		};
	}
	throw new TypeError('@bindThis can only use with method, but not property.');
};
