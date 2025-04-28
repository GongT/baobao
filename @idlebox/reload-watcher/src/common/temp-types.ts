// https://nodejs.org/api/module.html#resolvespecifier-context-nextresolve
import type { LoadFnOutput, ResolveFnOutput, ResolveHookContext } from 'node:module';

// 目前types里没有
interface ISyncHook {
	resolve?(specifier: string, context: ResolveHookContext, nextResolve: NextFunction<ResolveFnOutput>): ResolveFnOutput;
	load?(url: string, context: ResolveHookContext, nextLoad: NextFunction<LoadFnOutput>): LoadFnOutput;
}

export type NextFunction<R> = (specifier: string, context?: ResolveHookContext) => R;

export interface Module {
	registerHooks(hooks: ISyncHook): void;
}
