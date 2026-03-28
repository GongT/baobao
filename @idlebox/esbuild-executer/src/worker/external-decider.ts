import { prettyFormatError } from '@idlebox/common';
import type esbuild from 'esbuild';
import type { OnLoadResult, OnResolveResult } from 'esbuild';
import { execaNode } from 'execa';
import { moduleResolve } from 'import-meta-resolve';
import assert from 'node:assert';
import { realpath } from 'node:fs/promises';
import { builtinModules, findPackageJSON } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMainThread } from 'node:worker_threads';
import { earlyLoaderState } from '../common/early-loader-bridge.js';
import { logger as syncLogger, type ILogger } from './logger.js';

assert.equal(isMainThread, false, '主线程不应该加载这个模块');

const notRelative = /^[^.]/;
const nmReg = /\/node_modules\//g;
const extraHiddenModules = ['pnpapi', 'esbuild', 'source-map-support'];

const duplicateChecker = {
	seenSpecifiers: new Map<string, number>(),
	seenImporters: new Map<string, number>(),
};

export const decideExternal: esbuild.Plugin = {
	name: 'execute-external-decider',
	setup(build) {
		const basedir = build.initialOptions.absWorkingDir;
		if (!basedir) {
			throw new Error('esbuild initialOptions.absWorkingDir is not set');
		}
		syncLogger.resolve`create external decider with conditions: ${build.initialOptions.conditions?.join(', ')}`;

		const resolver = new ModuleResolver(basedir, build.initialOptions.conditions || ['node', 'import', 'default']);

		build.onResolve({ filter: notRelative, namespace: 'file' }, async (args): Promise<OnResolveResult | undefined> => {
			const logger = syncLogger.buffer();
			try {
				// nodejs built-in modules
				logger.resolve`import ${args.path}`;
				if (args.path.startsWith('node:')) {
					return { path: args.path, external: true };
				}
				if (builtinModules.includes(args.path)) {
					return { path: `node:${args.path}`, external: true };
				}
				if (extraHiddenModules.includes(args.path)) {
					return { path: args.path, external: true };
				}
				if (args.path === '@idlebox/esbuild-executer') {
					let path = earlyLoaderState.mainEntry;
					if (path) {
						logger.resolve`  ✓ special: ${path}`;
					} else {
						logger.resolve`  ✓ external (no early loader)`;
						const pkg = findPackageJSON(import.meta.url);
						assert.ok(pkg, `where am i? ${import.meta.dirname}`);
						path = resolve(pkg, '..', 'src/index.ts');
					}
					return { path: path, external: true };
				}

				logger.resolve`  * kind: ${args.kind}`;
				logger.resolve`  * importer: ${args.importer || '\x1B[38;5;166m???\x1B[0m'}`;
				logger.resolve`  * resolveDir: ${args.resolveDir}`;
				if (!args.importer) return undefined; // 不知道什么情况

				const specifierCount = duplicateChecker.seenSpecifiers.get(args.path) || 0;
				duplicateChecker.seenSpecifiers.set(args.path, specifierCount + 1);
				assert.ok(specifierCount < 100, `specifier "${args.path}" has been seen ${specifierCount} times, maybe there is a circular dependency?`);

				const importerCount = duplicateChecker.seenImporters.get(args.importer) || 0;
				duplicateChecker.seenImporters.set(args.importer, importerCount + 1);
				assert.ok(importerCount < 100, `importer "${args.importer}" has been seen ${importerCount} times, maybe there is a circular dependency?`);

				return await resolver.resolve(args.path, args.importer, logger);
			} finally {
				logger.flush();
			}
		});

		build.onLoad({ filter: notRelative, namespace: 'generate' }, async (args) => {
			const logger = syncLogger.buffer();
			try {
				return await resolver.generate(args.path, logger);
			} finally {
				logger.flush();
			}
		});

		// build.onLoad({ filter: anyFile }, async (args) => {
		// 	syncLogger.error`load: ${args.path}`;
		// 	return null;
		// });
	},
};

/**
 * 从类似 @scope/package/to/sub/file.js 提取出 "@scope/package"
 */
export function pickPackage(path: string) {
	const parts = path.split('/');
	if (path[0] === '@') {
		return parts.slice(0, 2).join('/');
	} else {
		return parts[0];
	}
}

function isNotFoundError(e: any) {
	return e && (e.code === 'ERR_MODULE_NOT_FOUND' || e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED');
}

class ModuleResolver {
	private readonly conditions: Set<string>;
	private readonly withSource: Set<string>;
	private readonly withGenerate: Set<string>;
	public readonly rootModuleCount: number;

	constructor(
		public readonly rootDir: string,
		input_conditions: ReadonlyArray<string>,
	) {
		const conditions = [...input_conditions, 'source', 'esbuild'];

		this.conditions = new Set(conditions);
		this.conditions.delete('source');

		this.withSource = new Set(conditions);

		this.withGenerate = new Set(conditions);
		this.withGenerate.add('generate');

		this.rootModuleCount = countSubstringRegex(rootDir, nmReg);
	}

	private readonly cache = new Map<string, OnResolveResult | undefined>();
	async resolve(id: string, importer: string, logger: ILogger) {
		const key = `${importer}|${id}`;
		if (this.cache.has(key)) {
			logger.error`duplicate processing: ${id} imported from ${relative(this.rootDir, importer)}`;
			return this.cache.get(key);
		}
		try {
			const result = await this.resolveLogic(id, importer, logger);
			this.cache.set(key, result);

			return result;
		} catch (e: unknown) {
			if (e instanceof ResultCarrier) {
				this.cache.set(key, e.result);
				return e.result;
			}
			if (e instanceof Error === false) {
				throw new Error(`unknown error type during resolve: ${typeof e} ${e}`);
			}

			logger.resolve`  ✗ ${(e as any).code ?? '<no code>'} ${e.message}`;
			if (isNotFoundError(e)) {
				this.cache.set(key, undefined);
				// 不存在的模块，交给 esbuild 处理，esbuild 会报错说找不到模块
				return undefined;
			}
			logger.error`??????? 发生什么事了 | id=${id} | importer=${importer}`;
			return { warnings: [{ text: `未知异常: ${e.message}`, detail: prettyFormatError(e) }] } satisfies OnResolveResult;
		}
	}

	private async resolveLogic(id: string, importer: string, logger: ILogger): Promise<OnResolveResult> {
		const { path: resolvedPath, source: resolvedSource, generate: resolvedGenerate } = await this.resolveModule(id, importer, logger);

		if (resolvedGenerate) {
			logger.resolve`  ✓ bundle with generate.`;
			return { external: false, namespace: 'generate', path: resolvedGenerate };
		} else if (resolvedSource) {
			logger.resolve`  ✓ bundle with source code.`;
		} else {
			logger.resolve`  ✓ bundle with default.`;
		}
		return { path: resolvedSource ?? resolvedPath, external: false };
	}

	/**
	 * 按规则，从 exports 中首次匹配到名称就应该返回，哪怕它指定的文件不存在（然后报错）
	 * 但实际上有很多包提供了 source 却没有提供 source 中指定的文件
	 *
	 * import-meta-resolve 并没有告诉我们到底是哪个条件匹配成功了
	 * 因此每个请求都要运行两次，处非重新实现一个模块解析算法，太麻烦了
	 */
	private async resolveModule(id: string, importer: string, logger: ILogger) {
		// 没有source的版本是不允许没有的
		let mainError;
		let resolved = '',
			resolvedReal = '',
			withGenerate = '',
			withSource = '',
			withSourceReal = '';
		try {
			resolved = fileURLToPath(moduleResolve(id, pathToFileURL(importer), this.conditions, true));
			logger.resolve`       -> ${resolved}`;

			resolvedReal = await this.checkExternal(resolved, logger);
		} catch (e) {
			allowNotFound(e);
			mainError = e;
			logger.resolve`       -> not present`;
		}

		try {
			withSource = fileURLToPath(moduleResolve(id, pathToFileURL(importer), this.withSource, true));
			logger.resolve`       -> (source) ${withSource}`;

			withSourceReal = await this.checkExternal(withSource, logger);
		} catch (e: any) {
			allowNotFound(e);
			logger.resolve`       -> (source) not present`;
		}

		// 扩展的生成器
		try {
			withGenerate = fileURLToPath(moduleResolve(id, pathToFileURL(importer), this.withGenerate, true));
			if (withGenerate === resolved || withGenerate === withSource) {
				logger.resolve`       -> (generate) not present`;
				withGenerate = '';
			} else {
				// generater 必须用真实路径，否则无法缓存
				withGenerate = await this.checkExternal(withGenerate, logger);
				logger.resolve`       -> (generate) ${withGenerate}`;
			}
		} catch (e: any) {
			allowNotFound(e);
			logger.resolve`       -> (generate) not present`;
		}

		if (!resolvedReal && !withSourceReal && !withGenerate) {
			throw mainError;
		}

		return { path: resolvedReal, source: withSourceReal, generate: withGenerate } as const;
	}

	private async checkExternal(resolvedPath: string, logger: ILogger) {
		const realPath = await realpath(resolvedPath);
		if (countSubstringRegex(realPath, nmReg) > this.rootModuleCount) {
			// 解析的文件路径中包含更多的 /node_modules/ （相比于根目录）
			// 这依赖于 import-meta-resolve 支持的 symlink=true 功能
			// 如果有人把根目录放在 名为node_modules的目录里，但依赖却用符号链接到不含node_modules的地方了，这个判断就会失效，有这种可能，但有这种的可能不太可能
			logger.resolve`  ✓ external: ${realPath}`;
			throw new ResolveResult({ path: realPath, external: true });
		}
		return realPath;
	}

	private readonly packageJsonCache = new Map<string, any>();
	async readPackageJson(file: string) {
		const path = findPackageJSON(pathToFileURL(file));
		if (!path) return undefined;

		const cached = this.packageJsonCache.get(path);
		if (cached) return { path, json: cached };

		const { default: pkgJson } = await import(path, { with: { type: 'json' } });
		this.packageJsonCache.set(path, pkgJson);
		return { path, json: pkgJson };
	}

	async generate(generater: string, logger: ILogger): Promise<OnLoadResult> {
		try {
			logger.resolve`generate ${generater}`;
			const buffer = await this.doGenerate(generater, logger);
			logger.resolve`  ✓ done (${buffer.byteLength} bytes)`;
			return {
				watchFiles: [generater],
				contents: buffer,
				loader: 'ts',
				resolveDir: dirname(generater),
			};
		} catch (e) {
			if (e instanceof ResultCarrier) {
				return e.result;
			}
			throw e;
		}
	}

	private async doGenerate(generater: string, logger: ILogger) {
		const p = await execaNode(generater, {
			stdio: ['ignore', 'pipe', 'pipe'],
			reject: false,
			encoding: 'utf8',
			cwd: dirname(generater),
			nodeOptions: [],
			timeout: 30000,
		});

		if (p.failed) {
			logger.resolve`${p.shortMessage}`;
			const stderr = p.stderr || '<no stderr>';

			throw new LoadResult({
				warnings: [
					{
						text: `子程序异常: ${p.shortMessage}`,
						location: { file: generater },
						detail: stderr,
						notes: [{ text: `commandline: node ${generater}` }, { text: new Error('spawn here').stack }],
					},
				],
			});
		}

		// const code = replaceConstant(p.stdout, pathToFileURL(generater).href);

		return Buffer.from(p.stdout, 'utf8');
	}
}

// function isAnyOfDeps(packageJson: any, name: string) {
// 	return Object.hasOwn(packageJson.dependencies, name) || Object.hasOwn(packageJson.devDpendencies, name) || Object.hasOwn(packageJson.dependencies, name);
// }

function countSubstringRegex(text: string, substring: RegExp) {
	// The 'g' flag ensures a global search (find all matches, not just the first)
	// The 'i' flag can be added for case-insensitive search (e.g., new RegExp(substring, 'gi'))
	const matches = text.match(substring);
	// Return the number of matches, or 0 if no matches are found (text.match() returns null)
	return matches ? matches.length : 0;
}

function allowNotFound(e: unknown) {
	if (!isNotFoundError(e)) {
		throw e;
	}
}

abstract class ResultCarrier {
	abstract readonly result: any;
}

class ResolveResult extends ResultCarrier {
	constructor(public readonly result: OnResolveResult) {
		super();
	}
}
class LoadResult extends ResultCarrier {
	constructor(public readonly result: OnLoadResult) {
		super();
	}
}
