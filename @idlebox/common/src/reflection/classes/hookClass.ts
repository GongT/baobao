export const hookClassSymbol = Symbol('@gongt/hookClass');

interface IConstructorOf<T> extends Object {
	new (...args: any[]): T;
}

interface IHooks<T, TC> {
	afterConstruct?: ((obj: T) => void)[];
	beforeConstruct?: ((obj: TC) => T | undefined)[];
}

export function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC> {
	if ((target as any)[hookClassSymbol]) {
		return (target as any)[hookClassSymbol];
	}

	const hooks = {} as IHooks<T, TC>;

	const proxyTarget = new Proxy(target, {
		construct(target: any, argArray: any): object {
			if (hooks.beforeConstruct) {
				for (const beforeCb of hooks.beforeConstruct) {
					const ret = beforeCb(target);
					if (ret) {
						return ret as any;
					}
				}
			}
			const d = new target(...argArray);
			if (hooks.afterConstruct) {
				for (const afterCb of hooks.afterConstruct) {
					afterCb(d);
				}
			}
			return d;
		},
	});

	Object.defineProperty(proxyTarget, hookClassSymbol, {
		value: hooks,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	return hooks;
}
