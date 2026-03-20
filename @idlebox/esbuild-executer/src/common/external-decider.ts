import type esbuild from 'esbuild';
import type { OnResolveResult } from 'esbuild';
import { moduleResolve } from 'import-meta-resolve';
import assert from 'node:assert';
import { builtinModules, findPackageJSON } from 'node:module';
import { relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from './logger.js';

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

		const resolver = new ModuleResolver(basedir, build.initialOptions.conditions || ['node', 'import', 'default']);

		build.onResolve({ filter: notRelative, namespace: 'file' }, async (args): Promise<OnResolveResult | undefined> => {
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

			logger.resolve`  * kind: ${args.kind}`;
			logger.resolve`  * from: ${args.importer || '???'}`;
			logger.resolve`  * resolveDir: ${args.resolveDir}`;
			if (!args.importer) return undefined; // 不知道什么情况

			const specifierCount = duplicateChecker.seenSpecifiers.get(args.path) || 0;
			duplicateChecker.seenSpecifiers.set(args.path, specifierCount + 1);
			assert.ok(specifierCount < 100, `specifier "${args.path}" has been seen ${specifierCount} times, maybe there is a circular dependency?`);

			const importerCount = duplicateChecker.seenImporters.get(args.importer) || 0;
			duplicateChecker.seenImporters.set(args.importer, importerCount + 1);
			assert.ok(importerCount < 100, `importer "${args.importer}" has been seen ${importerCount} times, maybe there is a circular dependency?`);

			return await resolver.resolve(args.path, args.importer);
		});
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

class ModuleResolver {
	private readonly conditions: Set<string>;
	private readonly prodConditions: Set<string>;
	public readonly rootModuleCount: number;

	constructor(
		public readonly rootDir: string,
		input_conditions: ReadonlyArray<string>,
	) {
		this.conditions = new Set(input_conditions);
		const conditionsNoSource = new Set(input_conditions);
		conditionsNoSource.delete('source');
		this.prodConditions = conditionsNoSource;
		this.rootModuleCount = countSubstringRegex(rootDir, nmReg);
	}

	private _resolve(id: string, importer: string, prod: boolean, symlink: boolean) {
		return fileURLToPath(moduleResolve(id, pathToFileURL(importer), prod ? this.prodConditions : this.conditions, symlink));
	}

	private _external(id: string, importer: string) {
		const absPath = this._resolve(id, importer, true, true);
		logger.resolve`   * external: ${absPath}`;
		return { path: absPath, external: true };
	}

	private do_resolve(id: string, importer: string): OnResolveResult | undefined {
		try {
			const absPath = this._resolve(id, importer, false, false);

			logger.resolve`       -> ${absPath}`;
			if (countSubstringRegex(absPath, nmReg) > this.rootModuleCount) {
				// 路径中包含更多的 /node_modules/ ，推测应该是一个依赖
				// 极为特殊的情况: 引用的工程被放在了 node_modules 里
				return this._external(id, importer);
			} else {
				// 否则说明是monorepo子项目、link:、overrides的本地包，因此应该将此文件打包
				logger.resolve`   * bundled.`;
				// return { path: absPath };
				return undefined;
			}
		} catch (e: any) {
			if (e instanceof Error && e.message.includes('Cannot find module') && e.message.includes('/node_modules/')) {
				// 有些依赖包设置了source，但没有提供source文件，重新解析一次
				return this._external(id, importer);
			}
			throw e;
		}
	}

	private readonly packageJsonCache = new Map<string, any>();
	async readPackageJson(file: string) {
		const path = findPackageJSON(file);
		if (!path) return undefined;

		const cached = this.packageJsonCache.get(path);
		if (cached) return { path, json: cached };

		const { default: pkgJson } = await import(path, { with: { type: 'json' } });
		this.packageJsonCache.set(path, pkgJson);
		return { path, json: pkgJson };
	}

	private readonly cache = new Map<string, OnResolveResult | undefined>();
	async resolve(id: string, importer: string) {
		const key = `${importer}|${id}`;
		if (this.cache.has(key)) {
			logger.error`duplicate processing: ${id} imported from ${relative(this.rootDir, importer)}`;
			return this.cache.get(key);
		}
		try {
			const result = this.do_resolve(id, importer);
			this.cache.set(key, result);
			return result;
		} catch (e: any) {
			if (e?.code === 'ERR_MODULE_NOT_FOUND') {
				this.cache.set(key, undefined);
				return undefined;
			}
			logger.error`??????? 发生什么事了 ${e.constructor.name} ${e.message}`;
			throw e;
		}
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
