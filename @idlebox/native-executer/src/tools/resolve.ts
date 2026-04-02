import { moduleResolve } from 'import-meta-resolve';
import { realpathSync } from 'node:fs';
import { isBuiltin, type ResolveFnOutput, type ResolveHookContext, type ResolveHookSync } from 'node:module';
import { extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { theState } from './global.ts';
import { isModuleNotFoundError, throwIt } from './share.ts';
import { log, tryExtensions, type NextResolve } from './types.ts';

type ResolveOutput = ResolveFnOutput & { reason: string };
type ResolveHookSyncEx = (...args: Parameters<ResolveHookSync>) => ResolveOutput;

function maybeResolve1(specifier: string, parent: URL, conditions: Set<string>): string | undefined {
	try {
		const r = moduleResolve(specifier, parent, conditions);
		if (r) {
			return r.href;
		}
	} catch {}
	return;
}

const hasNodeModules = /[/\\]node_modules[/\\]/i;

function replaceReturn(r: ResolveFnOutput, debug_why: string): ResolveOutput {
	if (theState.overrides?.has(r.url)) {
		// biome-ignore lint/style/noNonNullAssertion: we just checked it
		const over = theState.overrides.get(r.url)!;
		if (log.resolve.enabled) log.resolve(`[EL]       ← [override] ${over}`);
		r.url = over;

		debug_why = `${debug_why} /override/`;
	}

	if (log.resolve.enabled) {
		if (!r.url.startsWith('node:') && !r.url.startsWith('data:')) {
			log.resolve(`[EL]       ← ${r.url}`);
		}

		(r as ResolveOutput).reason = debug_why;
	}

	return r as ResolveOutput;
}

function myResolve(specifier: string, context: ResolveHookContext, defaultResolve: NextResolve): ResolveOutput {
	let originalResult: ResolveFnOutput | undefined;
	let originalError: Error | undefined;
	try {
		originalResult = defaultResolve(specifier, context);
	} catch (e: any) {
		originalError = e;
	}

	const originalReturn = (debug_why: string) => {
		if (originalResult) return replaceReturn(originalResult, debug_why);
		else throw originalError;
	};

	// 特殊类型、main（似乎不可能）、内置模块、data URL，直接默认解析
	if (context.importAttributes?.type) return originalReturn('special');
	if (!context.parentURL) return originalReturn('missing parent');
	if (specifier.startsWith('node:') || isBuiltin(specifier)) return originalReturn('builtin');
	if (specifier.startsWith('data:')) return originalReturn('data URL');
	if (!context.conditions.includes('import')) return originalReturn('commonjs');

	if (specifier.startsWith('#')) {
		// 私有路径，目前不知道怎么加扩展名
		return originalReturn('private mapping');
	}

	if (specifier[0] === '.' || specifier.startsWith('file://') || specifier.startsWith('/') || isAbsolute(specifier)) {
		// 相对路径、绝对文件路径，只进行直接解析，用多种扩展名，肯定用不到 source 条件
		if (log.resolve.enabled) log.resolve(`[EL]       try file with extensions`);
		const r = throwIt(resolveWithFileTypes(specifier, context.parentURL, context.conditions, defaultResolve));
		if (hasNodeModules.test(r.url)) {
			return originalReturn('inside node_modules');
		}
		return replaceReturn(r, 'normal');
	}

	const conditions = [...context.conditions, 'source'];

	/** 剩下的大概率是modules导入 */

	// 先尝试exports导出+early-loader条件
	const f1 = maybeResolve(specifier, new URL(context.parentURL), new Set(['early-loader', ...conditions]));
	const f2 = maybeResolve(specifier, new URL(context.parentURL), new Set(conditions));
	if (f1 && f1 !== f2) {
		if (log.generate.enabled) log.generate(`to generate:\nf1=${f1}\nf2=${f2}`);
		const real = realpathSync(fileURLToPath(f1));
		if (hasNodeModules.test(real)) {
			if (log.generate.enabled) log.generate(`  ! f1 is in node_modules, fallback to default resolve`);
			return originalReturn('f1 inside node_modules');
		}
		return {
			url: `${f1}#generate`,
			shortCircuit: true,
			format: 'module-typescript',
			reason: 'generator',
		};
	}

	if (f1 && f2 && f1 !== f2) {
		if (log.generate.enabled) log.generate(`conflict detected: f1=${f1}, f2=${f2}`);
		throw new Error(`not imple: f1=${f1}, f2=${f2}`);
	}

	if (f1) {
		return replaceReturn(
			{
				url: `${f1}`,
				shortCircuit: true,
			},
			'normal',
		);
	}

	if (log.resolve.enabled) log.resolve(`[EL]       fallback module resolve`);
	// 然后尝试过时的文件扩展名方式
	const r = throwIt(resolveWithFileTypes(specifier, context.parentURL, conditions, defaultResolve));
	if (hasNodeModules.test(r.url)) {
		return originalReturn('inside node_modules');
	}
	return replaceReturn(r, 'legacy');
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

function wrapResolveWithLogging(original: ResolveHookSyncEx): ResolveHookSync {
	// function addLog(specifier: string, context: ResolveHookContext, r: ResolveFnOutput) {
	// 	verboseLines.push(`[RESOLVE] ${specifier}`);
	// 	verboseLines.push(` → ${r.url}`);
	// 	verboseLines.push(`parentURL: ${context.parentURL ?? '<unknown>'}`);
	// 	verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
	// 	verboseLines.push(``);
	// 	return r;
	// }

	return (specifier, context, defaultResolve) => {
		// 这是resolve函数

		if (specifier.startsWith('node:') || specifier.startsWith('data:') || isBuiltin(specifier)) {
			// 内置模块和data URL不记录日志，太多了
			return original(specifier, context, defaultResolve);
		}

		try {
			const t = context.importAttributes?.type;
			log.resolve('[EL] \x1b[38;5;14;1mfinding\x1B[0m "%s" from "%s"', specifier, context?.parentURL ?? '<unknown>');
			log.resolve('[EL] - with conditions [%s], type [%s]', context.conditions?.join(', ') ?? 'no conditions', t);
			const r = original(specifier, context, loggedDefaultResolve);

			log.resolve(
				'[EL] \x1b[38;5;14;1m✓\x1B[0m resolved as type [%s], format [%s], \x1B[38;5;11;1m%s\x1B[0m, shortCircuit [%s]',
				r.importAttributes?.type,
				r.format,
				r.reason,
				r.shortCircuit,
			);
			return r;
		} catch (e: any) {
			log.resolve('[EL] \x1b[38;5;14;1m✗\x1B[0m failed %s', e.code);
			throw e;
		}

		function loggedDefaultResolve(specifier: string, context?: Partial<ResolveHookContext>): ResolveFnOutput {
			// 这是默认的resolve函数（defaultResolve）
			try {
				log.resolve('[EL]   ○ resolve "%s" / [%s]', specifier, context?.conditions?.join(', ') ?? 'no conditions');
				const r = defaultResolve(specifier, context);
				log.resolve('[EL]     → success %s', r.url);
				return r;
			} catch (e: any) {
				log.resolve('[EL]     → failed %s', e.code);
				throw e;
			}
		}
	};
}

function wrapResolveInner(original: typeof maybeResolve1): typeof maybeResolve1 {
	return (specifier, parent, conditions) => {
		log.resolve('[EL]   ○ resolve "%s" / [%s]', specifier, Array.from(conditions).join(', '));
		const r = original(specifier, parent, conditions);
		log.resolve('[EL]     → custom %s', r);
		return r;
	};
}

const maybeResolve = log.resolve.enabled ? wrapResolveInner(maybeResolve1) : maybeResolve1;
export const resolveFunction = log.resolve.enabled ? wrapResolveWithLogging(myResolve) : myResolve;
