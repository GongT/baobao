import { pathExists } from 'fs-extra';
import { basename, resolve } from 'path';
import { IGitInfo } from '../inc/gitName';
import { defaultJsonFormatConfig, insertKeyAlphabet, loadJsonFile, reformatJson, writeJsonFile } from '@idlebox/node-json-edit';
import { findUpUntil } from '../inc/findUpUntil';

const { manifest } = require('pacote');

export const prodPackages: string[] = [];
export const devPackages = [
	'@types/node',
	'@gongt/single-dog',
	'@idlebox/build-script',
	'typescript',
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

	packageJson.scripts['upgrade'] = 'ncu --upgrade --packageFile ./package.json';

	if (!packageJson.bin) {
		addIfNot(packageJson, 'main', './lib/index.js');
	}

	const foundPackageJson = await findUpUntil(PACKAGE_JSON_PATH, 'package.json');
	const foundRush = await findUpUntil(PACKAGE_JSON_PATH, 'rush.json');
	if (foundPackageJson || foundRush) {
		if (foundRush) {
			console.log('This should be a monorepo, because "rush.json" found in upper folder.');
			insertKeyAlphabet(packageJson, 'monorepo', 'rush');
		} else if (foundPackageJson && await pathExists(resolve(foundPackageJson, '../yarn.lock'))) {
			insertKeyAlphabet(packageJson, 'monorepo', 'yarn');
			console.log('This should be a monorepo, because ".git" found in upper folder.');
		} else {
			insertKeyAlphabet(packageJson, 'monorepo', 'simple');
		}
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
