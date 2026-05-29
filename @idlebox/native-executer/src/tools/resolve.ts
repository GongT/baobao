import { moduleResolve } from 'import-meta-resolve';
import { realpathSync } from 'node:fs';
import { isBuiltin, type ResolveFnOutput, type ResolveHookContext, type ResolveHookSync } from 'node:module';
import { extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { theState } from './global.js';
import { isModuleNotFoundError, throwIt } from './share.js';
import { log, tryExtensions, type NextResolve } from './types.js';

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
		if (log.resolve.enabled) log.resolve(`[EL]       ← [覆盖] ${over}`);
		r.url = over;

		debug_why = `${debug_why} /override/`;
	}

	if (log.resolve.enabled) {
		if (!r.url.startsWith('node:') && !r.url.startsWith('data:')) {
			log.resolve(`[EL]       ← ${r.url}`);
		}

		(r as ResolveOutput).reason = debug_why;
	}

	if (!r.format) {
		r.format = getFormat(r.url);
	}

	return r as ResolveOutput;
}

function getFormat(url: string): string | undefined {
	const path = new URL(url).pathname;
	if (path.endsWith('.ts') || path.endsWith('.tsx')) {
		return 'module-typescript';
	}
	return undefined;
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
	if (context.importAttributes?.type) return originalReturn('特殊类型');
	if (!context.parentURL) return originalReturn('缺少父级 URL');
	if (specifier.startsWith('node:') || isBuiltin(specifier)) return originalReturn('内置模块');
	if (specifier.startsWith('data:')) return originalReturn('数据 URL');
	if (!context.conditions.includes('import')) return originalReturn('CommonJS');

	if (specifier.startsWith('#')) {
		// 私有路径，目前不知道怎么加扩展名
		return originalReturn('私有映射');
	}

	if (specifier[0] === '.' || specifier.startsWith('file://') || specifier.startsWith('/') || isAbsolute(specifier)) {
		// 相对路径、绝对文件路径，只进行直接解析，用多种扩展名，肯定用不到 source 条件
		if (log.resolve.enabled) log.resolve(`[EL]       尝试使用扩展名解析文件`);
		const r = throwIt(resolveWithFileTypes(specifier, context.parentURL, context.conditions, defaultResolve));
		if (hasNodeModules.test(r.url)) {
			return originalReturn('在 node_modules 中');
		}
		return replaceReturn(r, '通常');
	}

	const conditions = [...context.conditions, 'source'];

	/** 剩下的大概率是modules导入 */

	// 先尝试exports导出+early-loader条件
	const f1 = maybeResolve(specifier, new URL(context.parentURL), new Set(['early-loader', ...conditions]));
	const f2 = maybeResolve(specifier, new URL(context.parentURL), new Set(conditions));
	if (f1 && f1 !== f2) {
		if (log.generate.enabled) log.generate(`即将生成:\nf1=${f1}\nf2=${f2}`);
		const real = realpathSync(fileURLToPath(f1));
		if (hasNodeModules.test(real)) {
			if (log.generate.enabled) log.generate(`  ! f1 在 node_modules 中，回退到默认解析`);
			return originalReturn('f1 在 node_modules 中');
		}
		return {
			url: `${f1}#generate`,
			shortCircuit: true,
			format: 'module-typescript',
			reason: 'generator',
		};
	}

	if (f1 && f2 && f1 !== f2) {
		if (log.generate.enabled) log.generate(`冲突检测: f1=${f1}, f2=${f2}`);
		throw new Error(`未实现: f1=${f1}, f2=${f2}`);
	}

	if (f1) {
		return replaceReturn(
			{
				url: `${f1}`,
				shortCircuit: true,
			},
			'通常',
		);
	}

	if (log.resolve.enabled) log.resolve(`[EL]       fallback module resolve`);
	// 然后尝试过时的文件扩展名方式
	const r = throwIt(resolveWithFileTypes(specifier, context.parentURL, conditions, defaultResolve));
	if (hasNodeModules.test(r.url)) {
		return originalReturn('在 node_modules 中');
	}
	return replaceReturn(r, '通过过时方式');
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
			log.resolve('[EL] \x1b[38;5;14;1m尝试找到\x1B[0m "%s" 从 "%s"', specifier, context?.parentURL ?? '<unknown>');
			log.resolve('[EL] - 条件 [%s], 类型 [%s]', context.conditions?.join(', ') ?? 'no conditions', t);
			const r = original(specifier, context, loggedDefaultResolve);

			log.resolve(
				'[EL] \x1b[38;5;14;1m✓\x1B[0m 解析为 类型[%s], 格式[%s], \x1B[38;5;11;1m%s\x1B[0m, 短路=[%s]',
				r.importAttributes?.type,
				r.format,
				r.reason,
				r.shortCircuit,
			);
			return r;
		} catch (e: any) {
			log.resolve('[EL] \x1b[38;5;14;1m✗\x1B[0m 失败 %s', e.code);
			throw e;
		}

		function loggedDefaultResolve(specifier: string, context?: Partial<ResolveHookContext>): ResolveFnOutput {
			// 这是默认的resolve函数（defaultResolve）
			try {
				log.resolve('[EL]   ○ 尝试解析 "%s" / [%s]', specifier, context?.conditions?.join(', ') ?? 'no conditions');
				const r = defaultResolve(specifier, context);
				log.resolve('[EL]     → 成功 %s', r.url);
				return r;
			} catch (e: any) {
				log.resolve('[EL]     → 失败 %s', e.code);
				throw e;
			}
		}
	};
}

function wrapResolveInner(original: typeof maybeResolve1): typeof maybeResolve1 {
	return (specifier, parent, conditions) => {
		log.resolve('[EL]   ○ 尝试解析 "%s" / [%s]', specifier, Array.from(conditions).join(', '));
		const r = original(specifier, parent, conditions);
		log.resolve('[EL]     → 自定义结果 %s', r);
		return r;
	};
}

const maybeResolve = log.resolve.enabled ? wrapResolveInner(maybeResolve1) : maybeResolve1;
export const resolveFunction = log.resolve.enabled ? wrapResolveWithLogging(myResolve) : myResolve;
