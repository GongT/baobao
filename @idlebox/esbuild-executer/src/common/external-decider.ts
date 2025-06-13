import type esbuild from 'esbuild';
import type { OnResolveResult } from 'esbuild';
import { moduleResolve } from 'import-meta-resolve';
import { builtinModules } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from './logger.js';

const notRelative = /^[^.]/;
const extraHiddenModules = ['pnpapi', 'esbuild', 'source-map-support'];

export const decideExternal: esbuild.Plugin = {
	name: 'execute-external-decider',
	setup(build) {
		const basedir = build.initialOptions.absWorkingDir;
		if (!basedir) {
			throw new Error('esbuild initialOptions.absWorkingDir is not set');
		}

		if (basedir.includes('/node_modules/')) {
			throw new Error(
				'esbuild initialOptions.absWorkingDir is inside node_modules, maybe running in production code, that is not supported. if you installed this package from npm, please file an issue to it.',
			);
		}

		const resolver = new ModuleResolver(build.initialOptions.conditions || ['node', 'import', 'default']);

		build.onResolve({ filter: notRelative, namespace: 'file' }, (args): OnResolveResult | undefined => {
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

			return resolver.resolve(args.path, args.importer);
		});
	},
};

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

	constructor(input_conditions: ReadonlyArray<string>) {
		this.conditions = new Set(input_conditions);
		const conditionsNoSource = new Set(input_conditions);
		conditionsNoSource.delete('source');
		this.prodConditions = conditionsNoSource;
	}

	private _resolve(id: string, importer: string, prod: boolean, symlink: boolean) {
		return fileURLToPath(
			moduleResolve(id, pathToFileURL(importer), prod ? this.prodConditions : this.conditions, symlink),
		);
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
			if (absPath.includes('/node_modules/')) {
				// 路径中包含node_modules，说明是一个依赖
				return this._external(id, importer);
			} else {
				// 否则说明是monorepo包，或者link:过来的本地开发包
				logger.resolve`   * bundled.`;
				return { path: absPath };
			}
		} catch (e: any) {
			if (e instanceof Error && e.message.includes('Cannot find module') && e.message.includes('/node_modules/')) {
				// 有些依赖包设置了source，但没有提供source文件，重新解析一次
				return this._external(id, importer);
			}
			throw e;
		}
	}

	resolve(id: string, importer: string): OnResolveResult | undefined {
		try {
			return this.do_resolve(id, importer);
		} catch (e: any) {
			logger.error`??????? 发生什么事了 ${e.constructor.name} ${e.message}`;
			return undefined;
		}
	}
}

// interface IPackageJson {
// 	dependencies?: Record<string, string>;
// 	devDependencies?: Record<string, string>;
// }
