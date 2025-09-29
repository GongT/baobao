import type { IInjectableOptions } from './undecorated.js';

export const diSymbol = Symbol('@idlebox/dependency-injection');

export type AnyClass = abstract new (...v: any) => any;
export type AnyConstructor<T> = abstract new (...v: any) => T;

export interface InjectableClassData<T extends AnyClass = AnyClass> {
	readonly __class_brand: unique symbol;
	dependencies: GetFollowingServiceArgs<ConstructorParameters<T>>;
	dependencyStart: number;
	options: IInjectableOptions;
}

export type InjectableToken<CLS extends IInjectableClass = any> = symbol & {
	/** @deprecated type only, must not use */
	readonly _token_brand: CLS;
};

export function debug_stringify(token: InjectableToken) {
	if (typeof token === 'symbol') {
		return (token.description || token.toString()).replace('@idlebox/dependency-injection/', '');
	} else {
		return `NotSymbol(${String(token)})`;
	}
}

export const initialization = Symbol('@idlebox/dependency-injection/async-initialize');

export interface IAsyncInitializeProtocol {
	[initialization]?(): void | Promise<void>;
}

export interface IInjectable extends IAsyncInitializeProtocol {
	readonly __brand?: unique symbol;
}
export type IInjectableClass<T extends IInjectable = IInjectable> = abstract new (...v: any) => T;

/** @internal */
export function getClassMeta<T extends IInjectableClass>(Class: T, inherit = true): InjectableClassData<T> | undefined {
	if (inherit) {
		return (Class as any)[diSymbol];
	}

	return Object.hasOwn(Class, diSymbol) ? (Class as any)[diSymbol] : undefined;
}

export const noMetadata: InjectableClassData<any> = Object.freeze({
	dependencies: [],
	dependencyStart: -1,
} as any);

export function createInjectToken<T extends IInjectableClass>(ClassName: string): InjectableToken<T> {
	const symbol = Symbol.for(`@idlebox/dependency-injection/${ClassName}`);
	return symbol as InjectableToken<T>;
}

export type GetLeadingNonServiceArgs<TArgs> = TArgs extends [] ? [] : TArgs extends [...infer TFirst, IInjectable] ? GetLeadingNonServiceArgs<TFirst> : TArgs;

export type GetFollowingServiceArgs<TArgs, Result extends any[] = []> = TArgs extends [...infer TFirst, infer T]
	? T extends IInjectable
		? GetFollowingServiceArgs<TFirst, [T, ...Result]>
		: Result
	: Result;

export type GetFollowingServiceArgsAsToken<TArgs, Result extends any[] = []> = TArgs extends [...infer TFirst, infer T]
	? T extends IInjectable
		? GetFollowingServiceArgs<TFirst, [InjectableToken<AnyConstructor<T>>, ...Result]>
		: Result
	: Result;

export type ConvertDependencyArgs<T> = { [K in keyof T]: T[K] extends IInjectable ? InjectableToken<AnyConstructor<T[K]>> : undefined };
