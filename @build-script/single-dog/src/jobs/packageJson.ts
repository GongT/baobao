import { basename, resolve } from 'path';
import { createInterface } from 'readline';
import { registerProjectToRush } from '@build-script/rush-tools';
import { findUpUntil } from '@idlebox/node';
import { insertKeyAlphabet, loadJsonFile, writeJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { pathExists } from 'fs/promises';
import { getPackageManager, PackageManagerType, resolveLatestVersionOnNpm } from 'unipm';
import { debug } from '../inc/debug';
import { getGitName } from '../inc/gitName';
import { dirname } from 'path';

export const prodPackages: string[] = ['tslib'];
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
		const gitInfo = await getGitName();
		if (!gitInfo.user) {
			console.error('please configure your git username and email');
			process.exit(1);
		}
		packageJson.name = await ask(`@${gitInfo.user}/${basename(CONTENT_ROOT)}`.toLowerCase());
		packageJson.version = '0.0.0';
		packageJson.license = 'MIT';
		packageJson.author = `${gitInfo.full} https://github.com/${gitInfo.user}/`;
		await writeJsonFile(PACKAGE_JSON_PATH, packageJson);
	}
	return packageJson;
}

async function ask(defaultVal: string) {
	if (process.stdin.isTTY) {
		const rl = createInterface(process.stdin, process.stdout);
		return new Promise((resolve) => {
			rl.question('Package name> ', resolve);
			rl.write(defaultVal);
		});
	} else {
		return defaultVal;
	}
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

export async function detectMonoRepo() {
	const parentDir = resolve(PACKAGE_JSON_PATH, '..');
	const foundPackageJson = await findUpUntil(parentDir, 'package.json');
	const foundRush = await findUpUntil(parentDir, 'rush.json');
	if (foundPackageJson || foundRush) {
		if (foundRush) {
			debug('This should be a monorepo, because "rush.json" found in upper folder.');
			debug('       root = %s', dirname(foundRush));
			return { type: 'rush', root: dirname(foundRush) };
		} else if (foundPackageJson && (await pathExists(resolve(foundPackageJson, '../yarn.lock')))) {
			debug('This should be a monorepo, because "package.json" and "yarn.lock" found in same upper folder.');
			debug('       root = %s', dirname(foundPackageJson));
			return { type: 'yarn', root: dirname(foundPackageJson) };
		}
	}
	return undefined;
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

	delete packageJson['monorepo'];

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
	debug('    using package manager: %s', pm.friendlyName);
	if (pm.type === PackageManagerType.RUSH) {
		const r = await registerProjectToRush(CONTENT_ROOT);
		if (r) {
			debug('    added current package to rush.json');
		}
	}
	await pm.sync();
}
