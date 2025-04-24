import { arrayDiff, sortByString } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';

const dependenciesFields: readonly string[] = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies',
	'peerDependenciesMeta',
	'bundleDependencies',
	'bundledDependencies',
	'overrides', // npm
	'resolutions', // yarn v1
];

const noDeepFields: readonly string[] = ['licenses', 'funding', 'maintainers', 'contributors'];
const scriptFields: readonly string[] = [
	'prepare',
	'pack',
	'publish',
	'publishOnly',
	'version',
	'install',
	'uninstall',
	'start',
	'stop',
	'restart',
	// 'build',
	// 'watch',
	'test',
	'serve',
	'lint',
];

const packageJsonSort: readonly string[] = [
	// pnpm
	'workspaces',

	// basic
	'name',
	'type',
	'version',

	// npm registry info
	'description',
	'keywords',
	'homepage',
	'bugs',
	'license',
	'licenses',
	'author',
	'maintainers',
	'contributors',
	'funding',

	// environment validation
	'engines',
	'engineStrict',
	'os',
	'cpu',

	// entry points
	'main',
	'module',
	'esnext',
	'es2015',
	'esm',
	'browser',
	'exports',
	'bin',
	'directories',

	// third party tool
	'umd:main',
	'flow:main',
	'jsnext:main',
	'unpkg',
	'bolt',
	'module-browser',
	'browserslist',
	'react-native',

	// entry:typescript
	'typings',
	'types',
	'typesVersions',

	// tree-shaking
	'sideEffects',

	// information
	'man',
	'source',

	// development fields
	'packageManager',
	'scripts',
	'config',
	'publishConfig',
	'private',
	'files',
	'repository',
	'preferGlobal',

	...dependenciesFields,

	// miscs
	'monorepo',
	'flat',
	'dist',
	'readme',

	// wellknown config fields
	'jspm',
	'eslintConfig',
	'prettier',
	'stylelint',
	'ava',
	'release',
	'jscpd',

	// pnpm overrides
	'pnpm',
];

function sortSimpleDeep(obj: any): any {
	if (!obj || typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj
			.slice()
			.map(sortSimpleDeep)
			.sort((a, b) => {
				if (typeof a === 'object' || typeof b === 'object') {
					return 0;
				}
				if (a === b) return 0;
				return a > b ? 1 : -1;
			});
	}

	const ret: any = {};
	const sortedKey = Object.keys(obj).sort(sortByString);
	for (const k of sortedKey) {
		ret[k] = typeof obj[k] === 'object' ? sortSimpleDeep(obj[k]) : obj[k];
	}
	return ret;
}

function sortNative(obj: any): any {
	if (typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.sort();
	const ret: any = {};
	const sortedKey = Object.keys(obj).sort(sortByString);
	for (const k of sortedKey) {
		ret[k] = obj[k];
	}
	return ret;
}

function sortRegular(obj: any, knowns: readonly string[]) {
	const keys = new Set(Object.keys(obj));
	const ret: any = {};
	for (const key of knowns) {
		if (key in obj) {
			ret[key] = obj[key];
			keys.delete(key);
		}
	}
	for (const key of keys.values()) {
		ret[key] = obj[key];
	}
	return ret;
}

export async function resortPackage(file: string) {
	const original: any = await loadJsonFile(file);

	for (const k of dependenciesFields) {
		if (original[k]) {
			original[k] = sortSimpleDeep(original[k]);
		}
	}
	await writeJsonFileBack(original);
}

function sortScripts({ ...scripts }: any): any {
	const ret: any = {};
	for (const action of scriptFields) {
		for (const field of [`pre${action}`, action, `post${action}`]) {
			if (scripts[field]) {
				ret[field] = scripts[field];
				delete scripts[field];

				for (const k of Object.keys(scripts)) {
					if (k.startsWith(`${field}:`)) {
						ret[k] = scripts[k];
						delete scripts[k];
					}
				}
			}
		}
	}
	for (const [k, v] of Object.entries(scripts)) {
		ret[k] = v;
	}
	return ret;
}

function sortExports(exports: any) {
	if (!exports || typeof exports !== 'object') return exports;
	const isPathMapping = Object.keys(exports)[0]?.startsWith('.');
	if (isPathMapping) {
		const ret: any = {};
		const sortedKey = Object.keys(exports).sort(sortByString);
		for (const k of sortedKey) {
			ret[k] = sortExports(exports[k]);
		}
		return ret;
	}
	const { default: defaultVal, node, import: importVal, require, types, typings, typescript, ...other } = exports;
	return {
		typescript,
		types,
		typings,
		...other,
		node,
		require,
		import: importVal,
		default: defaultVal,
	};
}

export async function deletePackageDependency(file: string, ...deps: string[]) {
	const original: any = await loadJsonFile(file);
	for (const k of ['devDependencies', 'dependencies']) {
		if (!original[k]) {
			continue;
		}

		let found = false;
		for (const name of deps) {
			if (original[k][name]) {
				delete original[k][name];
				found = true;
			}
		}
		if (found) {
			original[k] = sortNative(original[k]);
		}
	}
	await writeJsonFileBack(original);
}

export function reformatPackageJson(packageJson: any): typeof packageJson {
	const output: any = {};
	const existsKeys = Object.keys(packageJson);

	const unknownKeys = arrayDiff(packageJsonSort, existsKeys).add;
	if (process.stderr.isTTY) console.error('Unknown keys in package.json: %s ...', unknownKeys.slice(0, 3).join(', '));

	for (const key of packageJsonSort) {
		if (!(key in packageJson)) continue;

		let value = packageJson[key];
		if (key === 'scripts') {
			value = sortScripts(value);
		} else if (key === 'exports') {
			value = sortExports(value);
		} else if (key === 'publishConfig') {
			value = reformatPackageJson(value);
		} else if (noDeepFields.includes(value)) {
			// no action
		} else {
			value = sortSimpleDeep(packageJson[key]);
		}
		output[key] = value;
	}

	packageJson = sortRegular(packageJson, packageJsonSort);

	return packageJson;
}
