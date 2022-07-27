import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { sortByString } from '@idlebox/common';

const dependenciesFields = [
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

const nosortFields = ['licenses', 'funding', 'maintainers', 'contributors', 'scripts'];
const scriptFields = [
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
	'test',
	'serve',
	'lint',
];

const packageJsonSort = [
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
];

function sortSimpleDeep(obj: any): any {
	if (typeof obj !== 'object') return obj;

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

function sortRegular(obj: any, knowns: string[]) {
	const keys = new Set(Object.keys(obj));
	const ret: any = {};
	for (const key in knowns) {
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
		for (const field of ['pre' + action, action, 'post' + action]) {
			if (scripts[field]) {
				ret[field] = scripts[field];
				delete scripts[field];
			}
		}
	}
	for (const [k, v] of Object.keys(scripts)) {
		ret[k] = v;
	}
	return ret;
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

export function reformatPackageJson({ ...packageJson }: any): typeof packageJson {
	const toSort = new Set(packageJsonSort);
	nosortFields.forEach(toSort.delete, toSort);

	for (const key of toSort) {
		if (key in packageJson) {
			packageJson[key] = sortSimpleDeep(packageJson[key]);
		}
	}

	if (packageJson.scripts) {
		packageJson.scripts = sortScripts(packageJson.scripts);
	}

	packageJson = sortRegular(packageJson, packageJsonSort);

	return packageJson;
}
