///<reference types="node"/>

import { existsSync, lstatSync } from 'fs';
import { platform, tmpdir } from 'os';
import { resolve } from 'path';
import { findUp } from './findUp';

const item = process.argv[process.argv.length - 1] || '.';
const project = resolve(process.cwd(), item);
let configFilePath = '';

if (existsSync(project)) {
	if (existsSync(resolve(project, 'tsconfig.json'))) {
		configFilePath = resolve(project, 'tsconfig.json');
	} else if (lstatSync(project).isFile()) {
		configFilePath = project;
	}
}

if (!configFilePath) {
	throw new Error('Cannot find tsconfig.json file: ' + project);
}

// modify this if some IDE supports other source root
export const SOURCE_ROOT = resolve(configFilePath, '..');
export const CONFIG_FILE = configFilePath;

const packageJsonFile = findUp(configFilePath, 'package.json');
if (!packageJsonFile) {
	throw new Error('Cannot find any package.json from tsconfig to root');
}
export const PROJECT_ROOT = resolve(packageJsonFile, '..');

interface IExtraPackageJsonConfig {
	exportEverything: boolean;
}
export const exportConfig: IExtraPackageJsonConfig = require(packageJsonFile).apiExportOne || {
	exportEverything: true,
};

function getTemp() {
	if (process.env.RUSH_TEMP_FOLDER) {
		return process.env.RUSH_TEMP_FOLDER;
	} else {
		return tmpdir();
	}
}

export const EXPORT_TEMP_PATH = resolve(
	getTemp(),
	'export-all-in-one-working.' // + (Math.random()*10000).toFixed()
);
export const DTS_CONFIG_FILE = resolve(EXPORT_TEMP_PATH, 'tsconfig.json');
export const API_CONFIG_FILE = resolve(EXPORT_TEMP_PATH, 'api-extractor.json');

export const IS_WINDOWS = platform() === 'win32';

export const targetIndexFile = resolve(EXPORT_TEMP_PATH, 'extracted-source/_export_all_in_one_index.ts');
