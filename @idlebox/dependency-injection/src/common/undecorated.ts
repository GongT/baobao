import { definePublicConstant } from '@idlebox/common';
import { diSymbol, getClassMeta, type ConvertDependencyArgs, type IInjectableClass } from './types.js';

export interface IInjectableOptions {
	/**
	 * If true, the same instance will be returned for each injection.
	 * If false, everything depend on different instance of this class.
	 * Default is true.
	 */
	cacheable?: boolean;
}

const defaults: IInjectableOptions = {
	cacheable: true,
};

export function getAllOptionsTree(Class: IInjectableClass): IInjectableOptions[] {
	const result: IInjectableOptions[] = [];
	let current: Function | null = Class;
	while (current) {
		if (current === Function.prototype) {
			break; // 到达Object基类，停止遍历
		}

		const meta = getClassMeta(current as any, false);
		if (meta) {
			result.unshift(meta.options);
		}

		current = Object.getPrototypeOf(current);
	}
	return result;
}

export function makeClassInjectable(Class: IInjectableClass, options?: IInjectableOptions): void {
	const meta = getClassMeta(Class, false);
	if (meta) {
		throw new Error(`Class ${Class.name} is already injectable`);
	}

	definePublicConstant(Class, diSymbol, {
		options: Object.assign({}, defaults, ...getAllOptionsTree(Class), options),
		dependencyStart: -1,
	});
}

export function isClassInjectable(Class: unknown): Class is IInjectableClass {
	return !!getClassMeta(Class as any);
}

export function injectConstructorDependency<T extends IInjectableClass>(Class: T, ...dependencies: ConvertDependencyArgs<ConstructorParameters<T>>): void {
	const meta = getClassMeta(Class, false);
	if (!meta) throw new Error(`Class ${Class.name} is not injectable`);

	meta.dependencyStart = dependencies.findIndex((e) => !!e);
	meta.dependencies = dependencies.filter((e) => !!e) as any;
}
