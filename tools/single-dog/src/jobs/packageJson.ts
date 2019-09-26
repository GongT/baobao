import { defaultJsonFormatConfig, insertKeyAlphabet, loadJsonFile, reformatJson, writeJsonFile } from '@idlebox/node-json-edit';
import { getPackageManager } from '@idlebox/package-manager';
import { findUpUntil } from '@idlebox/platform';
import { pathExists } from 'fs-extra';
import { basename, resolve } from 'path';
import { debug } from '../inc/debug';
import { IGitInfo } from '../inc/gitName';

export const prodPackages: string[] = [
	// 'source-map-support',
];
export const devPackages = [
	'@types/node',
	'@idlebox/build-script',
	'@idlebox/single-dog-asset',
	'typescript',
	'gulp',
];

interface MapLike {
	[id: string]: any
}

export interface IPackageJson extends MapLike {
	name: string;
}

const PACKAGE_JSON_PATH = resolve(CONTENT_ROOT, 'package.json');

async function load(gitInfo: IGitInfo): Promise<IPackageJson> {
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
		packageJson.name = `@${gitInfo.user}/${basename(CONTENT_ROOT)}`;
	}
	return packageJson;
}

export async function updatePackageJson(gitInfo: IGitInfo) {
	const packageJson = await load(gitInfo);
	// package
	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}

	if (!packageJson.bin) {
		addIfNot(packageJson, 'main', './lib/index.js');
	}

	const foundPackageJson = await findUpUntil(PACKAGE_JSON_PATH, 'package.json');
	const foundRush = await findUpUntil(PACKAGE_JSON_PATH, 'rush.json');
	if (foundPackageJson || foundRush) {
		if (foundRush) {
			debug('This should be a monorepo, because "rush.json" found in upper folder.');
			insertKeyAlphabet(packageJson, 'monorepo', 'rush');
		} else if (foundPackageJson && await pathExists(resolve(foundPackageJson, '../yarn.lock'))) {
			debug('This should be a monorepo, because "package.json" and "yarn.lock" found in same upper folder.');
			insertKeyAlphabet(packageJson, 'monorepo', 'yarn');
		} else {
			delete packageJson['monorepo'];
		}
	}

	// package deps
	const prodNeedInstall: string[] = [];
	if (!packageJson.dependencies) {
		packageJson.dependencies = {};
	}
	for (const item of prodPackages) {
		if (!packageJson.dependencies[item]) {
			prodNeedInstall.push(item);
		}
	}

	const devNeedInstall: string[] = [];
	if (!packageJson.devDependencies) {
		packageJson.devDependencies = {};
	}
	for (const item of devPackages) {
		if (!packageJson.devDependencies[item]) {
			devNeedInstall.push(item);
		}
	}

	debug('write package.json file');
	await writeJsonFile(PACKAGE_JSON_PATH, packageJson);

	await installPackages(prodNeedInstall, devNeedInstall);

	return packageJson;
}

function addIfNot(data: any, key: string, val: any) {
	if (key in data) {
		return;
	}
	insertKeyAlphabet(data, key, val);
}

async function installPackages(prod: string[], dev: string[]) {
	if (prod.length === 0 && dev.length === 0) {
		return;
	}
	debug('Installing packages: %s', prod.join(' '));
	const pm = await getPackageManager({ cwd: CONTENT_ROOT, ask: true });

	if (prod.length) {
		await pm.install(...prod);
	}
	if (dev.length) {
		await pm.install('--dev', ...dev);
	}
}
