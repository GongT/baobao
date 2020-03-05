export interface InitFunc<O, T> {
	(this: O): T;
}

export function initOnRead<O, T extends keyof O>(target: any, propertyKey: T, init: InitFunc<O, O[T]>) {
	if (target.hasOwnProperty(propertyKey)) {
		return;
	}
	Object.defineProperty(target, propertyKey, {
		configurable: true,
		get: function(): O[T] {
			const data = init.call(this);
			delete target[propertyKey];
			target[propertyKey] = data;
			return data;
		},
		set(v: T) {
			delete target[propertyKey];
			target[propertyKey] = v;
		},
	});
}
