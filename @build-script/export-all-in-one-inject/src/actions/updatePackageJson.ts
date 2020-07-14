import { posix, resolve } from 'path';
import { getPlugin, registerPlugin } from '@build-script/builder';
import {
	getFormatInfo,
	loadJsonFile,
	reformatJson,
	writeJsonFileBack,
	sortObjectWithTargetOrder,
} from '@idlebox/node-json-edit';
import { getPackageManager } from 'unipm';
import { CONFIG_FILE, NO_DUAL_FLAG, PROJECT_ROOT } from '../inc/argParse';
import { INDEX_FILE_NAME, relativePosix } from '../inc/paths';

const dependenciesFields = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies',
	'bundledDependencies',
];

const packageJsonSort = [
	'workspaces',

	'name',
	'type',
	'version',
	'private',

	'description',
	'keywords',
	'author',
	'homepage',
	'bugs',
	'license',
	'contributors',
	'repository',

	'engines',
	'os',
	'cpu',

	'bin',
	'main',
	'flow:main',
	'jsnext:main',
	'module',
	'esnext',
	'es2015',
	'esm',
	'unpkg',
	'browser',
	'module-browser',
	'browserslist',
	'react-native',
	'typings',
	'types',
	'man',
	'sideEffects',
	'source',
	'umd:main',

	'exports',

	'scripts',
	'config',

	...dependenciesFields,

	'files',
	'publishConfig',
	'monorepo',

	'flat',
	'resolutions',

	'bolt',
	'jspm',
];

interface IOptions {
	hookMode: boolean;
	dualPackage: boolean;
	isESNext: boolean;
	outDir: string;
}
export async function updatePackageJson({ isESNext, hookMode, dualPackage, outDir }: IOptions) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));
	const relOut = './' + posix.relative(PROJECT_ROOT, outDir + '/' + INDEX_FILE_NAME);

	if (isESNext) {
		packageJson.type = 'module';
		if (dualPackage) {
			console.log('inserting dual package.');
			packageJson.main = relOut + '.cjs';
			packageJson.module = relOut + '.js';
			if (!packageJson.exports) {
				packageJson.exports = {};
			}
			if (!packageJson.exports['.']) {
				packageJson.exports['.'] = {};
			}
			packageJson.exports['.']['require'] = relOut + '.cjs';
			packageJson.exports['.']['import'] = relOut + '.js';
		} else {
			packageJson.main = relOut + '.js';
		}
	} else {
		packageJson.type = 'commonjs';
		packageJson.main = relOut + '.js';
	}

	packageJson.typings = 'docs/package-public.d.ts';

	if (hookMode) {
		const myFile = '@build-script/export-all-in-one/build-script-register';
		const previous = (await getPlugin(myFile)) || [];
		await registerPlugin(myFile, [dualPackage ? '' : NO_DUAL_FLAG, ...previous, configRel].filter(uniqNotEmpty));
	} else {
		if (!packageJson.scripts) {
			packageJson.scripts = {};
		}
		if (!packageJson.scripts['build:export-all-in-one']) {
			packageJson.scripts['export-all-in-one'] =
				'export-all-in-one ' + (dualPackage ? NO_DUAL_FLAG + ' ' : '') + configRel;
		}
	}

	if (!packageJson.devDependencies || !packageJson.devDependencies['@build-script/export-all-in-one']) {
		const oldFormat = getFormatInfo(await loadJsonFile(resolve(PROJECT_ROOT, 'package.json')))!;

		const pm = await getPackageManager({ cwd: PROJECT_ROOT });
		await pm.install('--dev', '@build-script/export-all-in-one');

		const packageJson = require(resolve(PROJECT_ROOT, 'package.json'));
		reformatJson(packageJson, oldFormat);
	}

	for (const item of dependenciesFields) {
		sortAlphabet(packageJson, item);
	}

	sortObjectWithTargetOrder(packageJson, packageJsonSort);
	await writeJsonFileBack(packageJson);
}

function uniqNotEmpty(item: string, index: number, self: string[]) {
	return item && index === self.lastIndexOf(item);
}

function sortAlphabet(packageJson: any, key: string) {
	if (!packageJson[key]) return;

	const keys = Object.keys(packageJson[key]).sort(strOrder);

	const ret: any = {};
	for (const item of keys) {
		ret[item] = packageJson[key][item];
	}

	packageJson[key] = ret;
}

function strOrder(a: string, b: string) {
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}
