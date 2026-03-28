import { moduleResolve } from 'import-meta-resolve';
import { isBuiltin, type ResolveFnOutput, type ResolveHookContext, type ResolveHookSync } from 'node:module';
import { extname, isAbsolute } from 'node:path';
import { verboseLines } from './collect.ts';
import { isModuleNotFoundError, throwIt } from './share.ts';
import { log, tryExtensions, type NextResolve } from './types.ts';

function maybeResolve(specifier: string, parent: URL, conditions: Set<string>): string | undefined {
	try {
		const r = moduleResolve(specifier, parent, conditions);
		if (r) return r.href;
	} catch {}
	return;
}

function myResolve(specifier: string, context: ResolveHookContext, defaultResolve: NextResolve): ResolveFnOutput {
	if (
		context.importAttributes?.type ||
		!context.parentURL ||
		specifier.startsWith('node:') ||
		isBuiltin(specifier) ||
		specifier.startsWith('data:') ||
		!context.conditions.includes('import')
	) {
		// 特殊类型、main（似乎不可能）、内置模块、data URL，直接默认解析
		return defaultResolve(specifier, context);
	}

	if (specifier.startsWith('#')) {
		// 私有路径，目前不知道怎么加扩展名
		return defaultResolve(specifier, context);
	}

	const conditions = [...context.conditions, 'source'];

	if (specifier.startsWith('.') || specifier.startsWith('file://') || specifier.startsWith('/') || isAbsolute(specifier)) {
		// 相对路径、绝对文件路径，只进行直接解析，用多种扩展名
		return throwIt(resolveWithFileTypes(specifier, context.parentURL, conditions, defaultResolve));
	}

	/** 剩下的大概率是modules导入 */

	// 先尝试新的exports导出，early-loader条件
	const f1 = maybeResolve(specifier, new URL(context.parentURL), new Set(['early-loader', ...conditions]));
	const f2 = maybeResolve(specifier, new URL(context.parentURL), new Set(conditions));
	if (f1 && f1 !== f2) {
		log.generate(`to generate:\nf1=${f1}\nf2=${f2}`);
		return {
			url: `${f1}#generate`,
			shortCircuit: true,
			format: 'module-typescript',
		};
	}

	if (f1 && f2 && f1 !== f2) {
		log.generate(`conflict detected: f1=${f1}, f2=${f2}`);
		throw new Error(`not imple: f1=${f1}, f2=${f2}`);
	}

	// 然后尝试过时的文件扩展名方式
	return throwIt(resolveWithFileTypes(specifier, context.parentURL, conditions, defaultResolve));
}

function resolveWithFileTypes(specifier: string, parentUrl: string, conditions: string[], defaultResolve: NextResolve): ResolveFnOutput | Error {
	let firstError!: Error;
	const ext = extname(specifier);
	specifier = specifier.slice(0, specifier.length - ext.length);
	for (const extname of [ext, ...tryExtensions]) {
		try {
			return defaultResolve(specifier + extname, { conditions: conditions, parentURL: parentUrl });
		} catch (e) {
			if (!isModuleNotFoundError(e)) throw e;
			if (!firstError) firstError = e as any;
		}
	}
	return firstError;
}

function wrapResolve(original: ResolveHookSync): ResolveHookSync {
	function addLog(specifier: string, context: ResolveHookContext, r: ResolveFnOutput) {
		verboseLines.push(`[RESOLVE] ${specifier}`);
		verboseLines.push(` → ${r.url}`);
		verboseLines.push(`parentURL: ${context.parentURL ?? '<unknown>'}`);
		verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
		verboseLines.push(``);
		return r;
	}

	return (specifier, context, defaultResolve) => {
		if (specifier.startsWith('node:') || specifier.startsWith('data:') || isBuiltin(specifier)) {
			// 内置模块和data URL不记录日志，太多了
			return addLog(specifier, context, original(specifier, context, defaultResolve));
		}
		try {
			const t = context.importAttributes?.type;
			log.resolve('[EL][resolve] finding "%s" from "%s"', specifier, context?.parentURL ?? '<unknown>');
			log.resolve('[EL][resolve]      with conditions [%s], type [%s]', context.conditions?.join(', ') ?? 'no conditions', t);
			const r = original(specifier, context, (specifier, context) => {
				try {
					const r = defaultResolve(specifier, context);
					log.resolve('[EL][resolve]     success "%s" → %s / [%s]', specifier, r.url, context?.conditions?.join(', ') ?? 'no conditions');
					return r;
				} catch (e: any) {
					log.resolve('[EL][resolve]     failed "%s" = %s / [%s]', specifier, e.code, context?.conditions?.join(', ') ?? 'no conditions');
					throw e;
				}
			});

			log.resolve('[EL][resolve] resolved as type [%s], format [%s], shortCircuit [%s]', r.importAttributes?.type, r.format, r.shortCircuit);
			return addLog(specifier, context, r);
		} catch (e: any) {
			log.resolve('[EL][resolve] failed %s', e.code);
			throw e;
		}
	};
}

export const resolveFunction = log.resolve.enabled ? wrapResolve(myResolve) : myResolve;
