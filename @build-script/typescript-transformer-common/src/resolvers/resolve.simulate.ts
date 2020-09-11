import { dirname, extname, resolve } from 'path';
import { pathExistsSync } from 'fs-extra';
import { debugOut } from '../debug';

type IExportDefine = IExportDefineObj | string;

interface IExportDefineObj {
	import?: string;
	require?: string;
	default?: string;
}
interface IExportMap {
	[path: string]: IExportDefine;
}

interface PackageJson {
	type?: 'module' | 'commonjs';
	main?: string;
	module?: string;
	exports?: IExportMap;
}

function getFile(def: IExportDefine, wantModule: boolean) {
	if (typeof def === 'string') return def;
	if (wantModule) {
		return def.import || def.default;
	} else {
		return def.require || def.default;
	}
}

// const regExtension = /\.[^\.]+$/;
const prefixRelative = /^[\.\/]+/;

function match(path: string, file: string) {
	path = path.replace(prefixRelative, '');
	file = file.replace(prefixRelative, '');
	if (file.startsWith(path)) {
		return file.slice(path.length).replace(prefixRelative, '');
	} else {
		return null;
	}
}

function findPath(exportPaths: string[], file: string) {
	for (const path of exportPaths) {
		if (file === path) return { index: path, file: '.' };

		if (path.endsWith('/')) {
			const m = match(path, file);
			if (m) {
				return { index: path, file: m };
			}
		}
	}
	return null;
}
export function findPackageFileExtension(pkg: PackageJson, wantModule: boolean): string {
	if (pkg.exports && pkg.exports['.']) {
		const ex: IExportDefine = pkg.exports['.'];
		if (typeof ex === 'string') {
			return extname(ex);
		}
		if (wantModule && ex.import) {
			return extname(ex.import);
		}
		if (!wantModule && ex.require) {
			return extname(ex.require);
		}
		if (ex.default) {
			return extname(ex.default);
		}
	}
	if (pkg.module && wantModule) {
		return extname(pkg.module);
	}
	if (pkg.type !== 'module' && !wantModule && pkg.main) {
		return extname(pkg.main);
	}

	return '';
}

function resolveInPackage(pkgPath: string, ...seg: string[]) {
	const root = resolve(pkgPath, '..');
	const p = resolve(root, ...seg);
	if (p.startsWith(root)) {
		return p;
	} else {
		throw new Error('Resolve to outside package: ' + p);
	}
}

/**
 * resolve module file in target package
 * emulate nodejs version 14+'s
 * @param wantType resolve type, esm or cjs
 * @param packageJsonFilePath  absolute path to package's package.json
 * @param file resolve file inside package
 * @param useModuleField if true, use "module" field when package type=commonjs
 */
export function resolveModule(
	wantType: 'module' | 'commonjs',
	packageJsonFilePath: string,
	file: string = '.',
	useModuleField = false
): string | null {
	const wantModule = wantType === 'module';
	if (!file) {
		file = '.';
	}

	if (!pathExistsSync(packageJsonFilePath)) {
		debugOut('! missing file: %s', packageJsonFilePath);
		return null;
	}

	const pkg: PackageJson = require(packageJsonFilePath);

	if (pkg.exports) {
		const exportPaths = Object.keys(pkg.exports);
		const found = findPath(exportPaths, file);

		if (found) {
			const result = getFile(pkg.exports[found.index], wantModule);

			if (result) {
				const foundFile = found.file;
				if (foundFile !== '.') {
					const extension = findPackageFileExtension(pkg, wantModule);
					if (extname(file) !== extension) {
						file += extension;
					}
				}
				return resolveInPackage(packageJsonFilePath, result.replace(/^[\.\/]+/, ''), foundFile);
			}
		}
	}

	const isPackageDefaultCommonjs = pkg.type !== 'module';
	if (isPackageDefaultCommonjs) {
		if (wantModule) {
			if (!useModuleField) {
				return null;
			}
			if (file === '.') {
				if (pkg.module) {
					return resolveInPackage(packageJsonFilePath, pkg.module);
				}
				return null;
			}
			if (pkg.module && pkg.main) {
				const ext = extname(pkg.module);

				const pmain = dirname(pkg.main).split('/').reverse();
				const pmdl = dirname(pkg.module).split('/').reverse();

				while (pmain[0] === pmdl[0] && pmdl.length > 0) {
					pmain.shift();
					pmdl.shift();
				}

				const moduleSubRoot = pmdl.reverse().join('/') || '.';

				if (!extname(file)) {
					file += ext;
				}

				return resolveInPackage(packageJsonFilePath, moduleSubRoot, file);
			}
		} else {
			if (file === '.') {
				if (pkg.main) {
					return resolveInPackage(packageJsonFilePath, pkg.main);
				}
			} else {
				const extension = findPackageFileExtension(pkg, false);
				if (extname(file) !== extension) {
					file += extension;
				}
				return resolveInPackage(packageJsonFilePath, file);
			}
		}
	}
	return null; //
}
