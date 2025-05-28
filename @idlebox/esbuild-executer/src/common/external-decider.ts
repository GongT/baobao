import type esbuild from 'esbuild';
import { builtinModules, findPackageJSON } from 'node:module';
import { pathToFileURL } from 'node:url';
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

		const pkgCache = new Map<string, string>();
		async function loadJsonFor(fileUrl: string) {
			let path: string;
			if (fileUrl.startsWith('file:')) {
				path = fileUrl;
			} else {
				path = pathToFileURL(fileUrl).toString();
			}
			try {
				const packageJson = findPackageJSON(path);
				if (!packageJson) {
					throw new Error('missing file');
				}
				path = packageJson;
			} catch (e) {
				throw new Error(`failed to find package.json for "${path}": ${e instanceof Error ? e.message : String(e)}`);
			}

			const exists = pkgCache.get(path);
			if (exists) return { data: exists, path };

			try {
				const { default: data } = await import(path, { with: { type: 'json' } });

				pkgCache.set(path, data);
				return { data, path };
			} catch (e) {
				throw new Error(`failed to read package.json at "${path}": ${e instanceof Error ? e.message : String(e)}`);
			}
		}

		build.onResolve({ filter: notRelative, namespace: 'file' }, async (args) => {
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

			// 检查被import的模块是否是node_modules
			const wantPackage = pickPackage(args.path);

			// 如果是monorepo模块，则编进bundle
			const { data } = await loadJsonFor(args.importer);
			const versionString = data.dependencies?.[wantPackage] ?? data.devDependencies?.[wantPackage] ?? '';

			if (isLocalVersion(versionString)) {
				logger.resolve`   * bundled: ${wantPackage} = ${versionString}`;
				return undefined;
			}

			if (args.importer.startsWith(basedir)) {
				// 如果文件在工作目录下，一般来说可以找到node_modules，所以不需要特别处理
				// 有一个特殊情况是，多个入口不在同一个项目里，但这种情况不正常所以不考虑
				logger.resolve`   * locally external: ${args.path}`;
				return { path: args.path, external: true };
			}

			logger.resolve`   * external: ${wantPackage} = ${versionString}`;
			// 否则不编进bundle，运行时将从文件读取

			try {
				const { absolute, format } = await import(`${args.path}?_=${Math.random().toString()}`, {
					with: { type: 'metadata', parent: args.importer },
				});

				logger.resolve`       -> <${format}> ${absolute}`;
				return { path: absolute, external: true };
			} catch (e: any) {
				logger.error`??????? 发生什么事了 ${e.message}`;
				return undefined;
			}
		});
	},
};

function pickPackage(path: string) {
	const parts = path.split('/');
	if (path[0] === '@') {
		return parts.slice(0, 2).join('/');
	} else {
		return parts[0];
	}
}

function isLocalVersion(version: string) {
	return version.startsWith('workspace:') || version.startsWith('file:') || version.startsWith('link:');
}
