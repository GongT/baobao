const isAlreadyProxy = Symbol('@gongt/smartClass');

interface IConstructorOf<T> extends Object {
	new(...args: any[]): T;
}

interface IHooks<T, TC> {
	afterConstruct?: ((obj: T) => void)[];
	beforeConstruct?: ((obj: TC) => T | void)[];
}

export function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC> {
	if ((target as any)[isAlreadyProxy]) {
		return (target as any)[isAlreadyProxy];
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

	Object.defineProperty(proxyTarget, isAlreadyProxy, { value: hooks, enumerable: false, configurable: false, writable: false });

	return hooks;
}
