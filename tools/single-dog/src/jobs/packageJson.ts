import { pathExists } from 'fs-extra';
import { basename, resolve } from 'path';
import { IGitInfo } from '../inc/gitName';
import { defaultJsonFormatConfig, insertKeyAlphabet, loadJsonFile, reformatJson, writeJsonFile } from './node-json-edit';
import { findUpUntil } from '../inc/findUpUntil';

const { manifest } = require('pacote');

export const prodPackages: string[] = [
	'source-map-support',
];
export const devPackages = [
	'@types/node',
	'@gongt/single-dog',
	'npm-check-updates',
	'typescript',
	'rimraf',
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
	addIfNot(packageJson.scripts, 'watch', 'tsc -w -p src');
	addIfNot(packageJson.scripts, 'build', 'tsc -p src');
	addIfNot(packageJson.scripts, 'prepublish', 'rimraf lib dist && npm run build');
	addIfNot(packageJson.scripts, 'upgrade', 'ncu --upgrade --packageFile ./package.json');
	addIfNot(packageJson.scripts, 'prepare', 'im-single-dog');

	if (packageJson.bin) {
		addIfNot(packageJson, 'main', './lib/index.js');
	}

	if (await findUpUntil(PACKAGE_JSON_PATH, 'rush.json')) {
		addIfNot(packageJson, 'monorepo', true);
		console.log('This should be a monorepo, because "rush.json" found in upper folder.');
	}

	// package deps
	if (!packageJson.dependencies) {
		packageJson.dependencies = {};
	}
	for (const item of prodPackages) {
		if (!packageJson.dependencies[item]) {
			packageJson.dependencies[item] = await resolveNpmVersion(item);
		}
	}
	if (!packageJson.devDependencies) {
		packageJson.devDependencies = {};
	}
	for (const item of devPackages) {
		if (!packageJson.devDependencies[item]) {
			packageJson.devDependencies[item] = await resolveNpmVersion(item);
		}
	}

	await writeJsonFile(PACKAGE_JSON_PATH, packageJson);

	return packageJson;
}

function addIfNot(data: any, key: string, val: any) {
	if (key in data) {
		return;
	}
	insertKeyAlphabet(data, key, val);
}

async function resolveNpmVersion(packageName: string) {
	console.log('Resolving package: %s', packageName);
	return '^' + (await manifest(packageName + '@latest')).version;
}
