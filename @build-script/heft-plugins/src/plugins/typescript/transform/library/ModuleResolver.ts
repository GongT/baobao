import type TypeScriptApi from 'typescript';
import type { IScopedLogger } from '@rushstack/heft';
import { readFileSync } from 'fs';
import { builtinModules, createRequire } from 'module';
import { platform } from 'os';
import { dirname, join, resolve } from 'path';
import { format } from 'util';
import { findUpUntilSync, relativePath } from '../../../../misc/functions';

interface IRequireResolved {
	path?: string;
	package?: {
		name: string;
		root: string;
	};
	nearestPackageJson?: string;
	source: string;
	target: string;
}

const extensions = ['.mjs', '.cjs', '.js', '.mjsx', '.cjsx', '.jsx', '.d.mts', '.d.cts', '.d.ts', '.ts', '.tsx'];

function hideProp(o: any, field: string) {
	const v = o[field];
	delete o[field];
	Object.defineProperty(o, field, {
		value: v,
		enumerable: false,
		writable: false,
		configurable: false,
	});
}

class ResolveResult {
	protected readonly resolvedModule: TypeScriptApi.ResolvedModuleFull | undefined;
	protected readonly failedLookupLocations: ReadonlyArray<string>;

	public readonly isInternal: boolean;
	public readonly success: boolean;
	public readonly isNodeModules: boolean;
	public readonly moduleName?: string;
	public readonly pathInModule?: string;
	public readonly absolutePath?: string;
	public readonly absolutePackagePath?: string;
	public readonly extension?: string;

	constructor(
		public readonly self: string,
		public readonly id: string,
		private readonly options: TypeScriptApi.CompilerOptions,
		resolved: TypeScriptApi.ResolvedModuleWithFailedLookupLocations,
		private readonly requireResolved: IRequireResolved,
		private readonly logger: IScopedLogger
	) {
		+this.requireResolved;

		const resolvedModule = (this.resolvedModule = resolved.resolvedModule);
		this.failedLookupLocations = (resolved as any).failedLookupLocations;
		// resolutionDiagnostics

		hideProp(this, 'options');
		hideProp(this, 'logger');

		this.isInternal = false;
		if (!this.resolvedModule) {
			if (builtinModules.includes(id)) {
				this.isInternal = true;
			}
		}

		this.success = !!resolvedModule || this.isInternal || !!requireResolved;
		this.isNodeModules = this.resolvedModule?.isExternalLibraryImport || false;

		if (!resolvedModule) return;

		const mName = resolvedModule.packageId?.name;
		if (mName?.startsWith('@types/')) {
			this.moduleName = mName.slice(7);
		} else {
			this.moduleName = mName;
		}

		if (requireResolved.package && requireResolved.path) {
			this.absolutePath = requireResolved.path;

			this.pathInModule = relativePath(requireResolved.package.root, requireResolved.path);
			this.absolutePackagePath = requireResolved.package.root;
		} else if (!resolvedModule.extension.startsWith('.d.')) {
			this.absolutePath = resolvedModule.resolvedFileName;

			const pid = resolvedModule.packageId;
			if (pid) {
				this.pathInModule = pid.subModuleName;
				const a = resolvedModule.resolvedFileName;
				this.absolutePackagePath = a.slice(0, a.length - pid.subModuleName.length);
			}
		}

		if (this.absolutePath) this.extension = extensions.find((ex) => this.absolutePath!.endsWith(ex));
	}

	relativeToSelf() {
		if (!this.absolutePath) throw new Error('not success resolved');

		const r = relativePath(dirname(this.self), this.absolutePath);
		if (r.startsWith('.')) return r;
		return './' + r;
	}

	relativeToSourceRoot() {
		if (!this.absolutePath) throw new Error('not success resolved');

		const root = this.options.rootDir || dirname(this.options['configFilePath'] as any);
		const r = relativePath(root, this.absolutePath);
		if (r.startsWith('.')) return r;
		return './' + r;
	}

	readPackageJson() {
		if (!this.success) throw new Error('readPackageJson: not valid import target');

		const pkgRoot = this.absolutePackagePath;
		if (!pkgRoot) throw new Error('readPackageJson: can not resolve package realpath of' + this.id);

		const packageJson = requireOrRead(pkgRoot + '/package.json');
		if (packageJson.name !== this.moduleName) {
			throw new Error(`package name mismatch: ${pkgRoot} (should be ${this.moduleName})`);
		}
		return packageJson;
	}

	printWhyFailed() {
		if (this.success) {
			return;
		}

		this.logger.terminal.writeWarningLine(`failed resolve module "${this.id}" from (${this.self})`);
		this.logger.terminal.writeWarningLine(`Find Paths:`);
		for (const item of this.failedLookupLocations) {
			this.logger.terminal.writeWarningLine(`  - ${item}`);
		}
	}
}

export enum WantModuleKind {
	CJS,
	ESM,
	ANY,
}

export class ModuleResolver {
	constructor(
		private readonly ts: typeof TypeScriptApi,
		private readonly host: TypeScriptApi.CompilerHost,
		private readonly options: TypeScriptApi.CompilerOptions,
		private readonly logger: IScopedLogger
	) {}

	resolve(source: string, target: string, resolveWhat: WantModuleKind = WantModuleKind.ANY) {
		let found;

		const resolve = (type: TypeScriptApi.ResolutionMode) => {
			found = this.ts.resolveModuleName(
				target,
				source,
				this.options,
				this.host,
				this.host.getModuleResolutionCache!(),
				undefined,
				type
			);
			return !!found.resolvedModule;
		};

		if (resolveWhat === WantModuleKind.CJS) {
			resolve(this.ts.ModuleKind.CommonJS);
		} else if (resolveWhat === WantModuleKind.ESM) {
			resolve(this.ts.ModuleKind.ESNext);
		} else {
			if (!resolve(this.ts.ModuleKind.CommonJS)) {
				resolve(this.ts.ModuleKind.ESNext);
			}
		}

		const rr = requireResolve(source, target);

		try {
			return new ResolveResult(source, target, this.options, found!, rr, this.logger);
		} catch (e) {
			this.logger.terminal.writeWarningLine(format('typescript resolve: %j', found));
			this.logger.terminal.writeWarningLine(format('require resolve: %j', rr));
			throw e;
		}
	}
}

function requireOrRead(path: string) {
	try {
		return require(path);
	} catch (e: any) {
		if (e && (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' || e.code === 'PACKAGE_PATH_NOT_EXPORTED')) {
			return JSON.parse(readFileSync(path, 'utf-8'));
		}
		throw e;
	}
}

const isWin = platform() === 'win32';

function requireResolve(source: string, target: string) {
	const require = createRequire(source);
	const d = dirname(source);
	const result: IRequireResolved = { source, target };

	if (target.startsWith('.')) {
		result.path = resolve(source, '..', target);
	} else {
		const paths = [];

		let a = isWin ? '' : '/';
		for (const c of d.split(/[\/\\]/g)) {
			const r = join(a, c, 'node_modules');
			paths.push(r);
			a = dirname(r);
		}
		paths.push(d);

		paths.reverse();

		try {
			result.path = require.resolve(target, { paths });
		} catch {
			return result;
		}
	}

	let pCur = result.path;
	while (true) {
		const pkgPath = findUpUntilSync(pCur, 'package.json');
		if (!pkgPath) break;

		const pkg = requireOrRead(pkgPath);

		if (!result.nearestPackageJson) {
			result.nearestPackageJson = pkgPath;
			result.package = {
				name: pkg.name,
				root: dirname(pkgPath),
			};
		}

		if (pkg.name && (target === pkg.name || target.startsWith(pkg.name + '/'))) {
			result.package = {
				name: pkg.name,
				root: dirname(pkgPath),
			};
			break;
		}

		pCur = resolve(pkgPath, '../..');
	}

	return result;
}
