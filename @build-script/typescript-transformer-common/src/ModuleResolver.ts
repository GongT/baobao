import { builtinModules, createRequire } from 'module';
import { dirname } from 'path';
import { findUpUntilSync, relativePath } from '@idlebox/node';
import { readJsonSync } from 'fs/promises';
import ts from 'typescript';
import { IDebug } from './logger';
import { ProjectConfig } from './ProjectConfig';

class ResolveResult {
	protected readonly resolvedModule: ts.ResolvedModuleFull | undefined;
	protected readonly failedLookupLocations: ReadonlyArray<string>;
	public readonly isInternal: boolean;
	constructor(
		private readonly self: string,
		private readonly id: string,
		private readonly options: ts.CompilerOptions,
		private readonly getPacakgeJson: () => string | undefined,
		resolved: ts.ResolvedModuleWithFailedLookupLocations,
		private readonly logger: IDebug
	) {
		this.resolvedModule = resolved.resolvedModule;
		this.failedLookupLocations = (resolved as any).failedLookupLocations;
		// resolutionDiagnostics

		this.isInternal = false;
		if (!this.resolvedModule) {
			if (builtinModules.includes(id)) {
				this.isInternal = true;
			}
		}
	}

	get success() {
		return !!this.resolvedModule || this.isInternal;
	}
	get isNodeModules() {
		return this.resolvedModule?.isExternalLibraryImport || false;
	}
	get moduleName() {
		return this.resolvedModule?.packageId?.name;
	}
	get modulePath() {
		return this.resolvedModule?.packageId?.subModuleName;
	}
	get absoluteRealpath() {
		return this.resolvedModule?.resolvedFileName;
	}
	get absolutePathWithExtension(): string {
		return (this.resolvedModule as any)?.originalPath || this.resolvedModule?.resolvedFileName;
	}
	get absolutePath() {
		const abs = this.absolutePathWithExtension;
		return abs.slice(0, abs.length - this.extension.length);
	}
	get extension() {
		return this.resolvedModule?.extension || '';
	}
	get relativeToSource() {
		const r = relativePath(dirname(this.self), this.absolutePath);
		if (r.startsWith('.')) return r;
		return './' + r;
	}
	get relativeToSourceRoot() {
		const root = this.options.rootDir || dirname(this.options['configFilePath'] as any);
		const r = relativePath(root, this.absolutePath);
		if (r.startsWith('.')) return r;
		return './' + r;
	}

	readPackageJson() {
		if (!this.success) throw new Error('not valid import target');

		if (this.isNodeModules) {
			const require = createRequire(this.self);
			const target = this.moduleName!;
			try {
				return require(target + '/package.json');
			} catch (e: any) {
				if (e && (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' || e.code === 'PACKAGE_PATH_NOT_EXPORTED')) {
					let packageJson: any = undefined;
					let curr = require.resolve(target);
					while (true) {
						const file = findUpUntilSync(curr, 'package.json');
						if (!file) {
							packageJson = undefined;
							throw e;
						}

						packageJson = readJsonSync(file);
						if (packageJson.name === target) {
							return packageJson;
						}

						curr = dirname(dirname(curr));
					}
				}
				throw e;
			}
		} else {
			const pkgpath = this.getPacakgeJson();
			if (pkgpath) {
				return require(pkgpath);
			}
			throw new Error(`failed find package.json (from ${this.self})`);
		}
	}

	printWhyFailed() {
		if (this.success) {
			return;
		}

		this.logger.warn(
			'failed resolve module "%s" from (%s)\nFind Paths:\n  - %s',
			this.id,
			this.self,
			this.failedLookupLocations.join('\n  - ')
		);
	}
}

// const dependenciesFields = [
// 	'dependencies',
// 	'devDependencies',
// 	'optionalDependencies',
// 	'peerDependencies',
// 	'bundledDependencies',
// ];
export class ModuleResolver extends ProjectConfig {
	// private readonly nodeResolve: NodeRequire;
	// private readonly dependencies: Set<string>;
	// private readonly config: ProjectConfig;
	private readonly resolveCache?: ts.ModuleResolutionCache;

	// private readonly paths: ts.CompilerOptions['paths'];
	// private readonly mapRoot: ts.CompilerOptions['mapRoot'];

	constructor(compilerOptions: ts.CompilerOptions, logger: IDebug, host?: ts.CompilerHost) {
		super(compilerOptions, logger);

		this.resolveCache = host?.getModuleResolutionCache?.();
		if (!this.resolveCache) {
			logger.warn(new Error('missing compiler host, or missing resolve cache.').stack);
		}

		// this.mapRoot = compilerOptions.mapRoot;
		// this.paths = compilerOptions.paths;

		// this.config = new ProjectConfig(compilerOptions, logger);

		// const pkg = require(this.config.packageJson);

		// this.nodeResolve = createRequire(config.packageJson);

		// this.dependencies = new Set();
		// for (const item of dependenciesFields) {
		// 	if (pkg[item]) {
		// 		for (const key of Object.keys(pkg[item])) {
		// 			this.dependencies.add(key);
		// 		}
		// 	}
		// }
	}

	resolve(self: string, id: string) {
		return new ResolveResult(
			self,
			id,
			this.options,
			this.findPackageJson,
			ts.resolveModuleName(id, self, this.options, ts.sys, this.resolveCache, undefined, ts.ModuleKind.CommonJS),
			this.logger
		);
	}

	getPathInfo(id: string) {
		const packageName = id.startsWith('@') ? id.split('/', 2).join('/') : id.split('/', 1)[0];
		const fileName = id.slice(packageName!.length + 1);
		return { packageName, fileName };
	}
}
