import { definePrivateConstant } from '../../object/definePublicConstant.js';

export const singletonSymbol = Symbol('@idlebox/singleton');

export enum SingletonType {
	Throw = 0,
	ReturnSame = 1,
}

type AnyClass = new (...args: any) => any;

/**
 * 单例类修饰器
 * @param type
 * @returns
 */
export function singleton(type: SingletonType = SingletonType.ReturnSame) {
	return <T extends AnyClass>(Class: T, ctx: ClassDecoratorContext): T => {
		if (ctx.kind !== 'class') throw new Error(`this decorator can only be applied to classes`);

		const name = ctx.name;
		return new Proxy(Class, {
			construct(target, args) {
				const exists = (Class as any)[singletonSymbol];
				if (exists) {
					if (type === SingletonType.Throw) throw new Error(`can not recreate singleton class #${name}`);
					return exists;
				}
				const instance = Reflect.construct(target, args);
				return instance;
			},
		});
	};
}

export function createSingleton<T>(Class: new () => T): T {
	if (!(Class as any)[singletonSymbol]) {
		definePrivateConstant(Class, singletonSymbol, new Class());
	}
	return (Class as any)[singletonSymbol];
}
