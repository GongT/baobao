import { basename, resolve } from 'path';
import { findUpUntil } from '@idlebox/node';
import {
	defaultJsonFormatConfig,
	insertKeyAlphabet,
	loadJsonFile,
	reformatJson,
	writeJsonFile,
	writeJsonFileBack,
} from '@idlebox/node-json-edit';
import { pathExists } from 'fs-extra';
import { getPackageManager, resolveLatestVersionOnNpm } from 'unipm';
import { debug } from '../inc/debug';
import { getGitName } from '../inc/gitName';

export const prodPackages: string[] = [];
export const devPackages = [
	'@build-script/builder',
	'@build-script/single-dog-asset',
	'typescript',
	'ttypescript',
	'gulp',
];

interface MapLike {
	[id: string]: any;
}

export interface IPackageJson extends MapLike {
	name: string;
}

const PACKAGE_JSON_PATH = resolve(CONTENT_ROOT, 'package.json');

export async function reloadPackageJson(): Promise<IPackageJson> {
	let packageJson: any;
	if (await pathExists(PACKAGE_JSON_PATH)) {
		packageJson = await loadJsonFile(PACKAGE_JSON_PATH);
		if (!packageJson.name) {
			console.error('please add name to your package.json');
			process.exit(1);
		}
	} else {
		packageJson = {};
		reformatJson(packageJson, defaultJsonFormatConfig);
		const gitInfo = await getGitName();
		if (!gitInfo.user) {
			console.error('please configure your git username and email');
			process.exit(1);
		}
		packageJson.name = `@${gitInfo.user}/${basename(CONTENT_ROOT)}`;
		packageJson.version = '0.0.0';
		packageJson.license = 'MIT';
		await writeJsonFile(PACKAGE_JSON_PATH, packageJson);
	}
	return packageJson;
}

export type IRunMode = { appMode: boolean; libMode: boolean };

export async function initArgs(): Promise<IRunMode> {
	const packageJson = await reloadPackageJson();
	const appMode = 'bin' in packageJson || process.argv.includes('--bin');
	const libMode = 'main' in packageJson || 'module' in packageJson || process.argv.includes('--lib');
	if (!appMode && !libMode) {
		console.error('Can not detect package type, please add <--bin> or/and <--lib> argument.');
		process.exit(1);
	}

	return { appMode, libMode };
}

export async function updatePackageJson(mode: IRunMode) {
	const packageJson = await reloadPackageJson();
	// package
	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}

	if (mode.appMode && !packageJson.bin) {
		insertKeyAlphabet(packageJson, 'bin', {
			[basename(packageJson.name)]: './bin.js',
		});
	}

	const parentDir = resolve(PACKAGE_JSON_PATH, '../..');
	const foundPackageJson = await findUpUntil(parentDir, 'package.json');
	const foundRush = await findUpUntil(parentDir, 'rush.json');
	if (foundPackageJson || foundRush) {
		if (foundRush) {
			debug('This should be a monorepo, because "rush.json" found in upper folder.');
			packageJson['monorepo'] = 'rush';
		} else if (foundPackageJson && (await pathExists(resolve(foundPackageJson, '../yarn.lock')))) {
			debug('This should be a monorepo, because "package.json" and "yarn.lock" found in same upper folder.');
			packageJson['monorepo'] = 'yarn';
		} else {
			delete packageJson['monorepo'];
		}
	}

	const prodPackagesCopy = prodPackages.slice();
	const devPackagesCopy = devPackages.slice();
	if (mode.appMode) {
		prodPackagesCopy.push('source-map-support');
	}
	if (mode.libMode) {
		devPackagesCopy.push('@build-script/typescript-transformer-dual-package');
	}

	// package deps
	if (!packageJson.dependencies) {
		packageJson.dependencies = {};
	}
	for (const item of prodPackagesCopy) {
		if (!packageJson.dependencies[item]) {
			packageJson.dependencies[item] = await resolveLatestVersionOnNpm(item);
		}
	}

	if (!packageJson.devDependencies) {
		packageJson.devDependencies = {};
	}
	for (const item of devPackagesCopy) {
		if (!packageJson.devDependencies[item]) {
			packageJson.devDependencies[item] = await resolveLatestVersionOnNpm(item);
		}
	}

	debug('write package.json file');
	await writeJsonFileBack(packageJson);

	debug('Installing packages:');
	const pm = await getPackageManager({ cwd: CONTENT_ROOT, ask: false });
	await pm.sync();
}
