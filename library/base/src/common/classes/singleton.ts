import { hookClass } from './hookClass';

const singletonSymbol = Symbol.for('@gongt/singleton');

export const singleton: ClassDecorator = (target: any): any => {
	const hook = hookClass(target);
	if (!hook.beforeConstruct) {
		hook.beforeConstruct = [];
	}
	if (!hook.afterConstruct) {
		hook.afterConstruct = [];
	}

	hook.beforeConstruct.push((cls) => {
		if (cls[singletonSymbol]) {
			return cls[singletonSymbol];
		}
	});
	hook.afterConstruct.push((obj) => {
		const cls = obj.constructor as any;
		cls[singletonSymbol] = obj;
	});
};
