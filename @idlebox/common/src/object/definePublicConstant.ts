export function definePublicConstant(object: any, propertyKey: string | symbol, value: any) {
	if (object[propertyKey] === value) return;
	delete object[propertyKey];
	Object.defineProperty(object, propertyKey, {
		configurable: false,
		enumerable: true,
		writable: false,
		value,
	});
}
