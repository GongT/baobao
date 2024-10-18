export function definePublicConstant(object: any, propertyKey: string | symbol, value: any) {
	Object.defineProperty(object, propertyKey, {
		configurable: false,
		enumerable: true,
		writable: false,
		value,
	});
}

export function definePrivateConstant(object: any, propertyKey: string | symbol, value: any) {
	Object.defineProperty(object, propertyKey, {
		configurable: false,
		enumerable: false,
		writable: false,
		value,
	});
}
