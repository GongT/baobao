import { hookClass } from './hookClass.js';

export const singletonSymbol = Symbol('@gongt/singleton');

export enum SingletonType {
	Throw = 0,
	Return = 1,
}

export function singleton(type: SingletonType = SingletonType.Return): ClassDecorator {
	return (target: any): any => {
		const hook = hookClass(target);
		if (!hook.beforeConstruct) {
			hook.beforeConstruct = [];
		}
		if (!hook.afterConstruct) {
			hook.afterConstruct = [];
		}

		hook.beforeConstruct.push((cls) => {
			if (cls[singletonSymbol]) {
				if (type === SingletonType.Return) {
					return cls[singletonSymbol];
				}
				throw new Error(`Duplicate new singleton class [${target.name}]`);
			}
		});
		hook.afterConstruct.push((obj) => {
			target[singletonSymbol] = obj;
		});
	};
}
