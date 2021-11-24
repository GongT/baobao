///<reference types="node"/>

import { existsSync, lstatSync } from 'fs-extra';
import { platform, tmpdir } from 'os';
import { resolve } from 'path';
import { findUp } from './findUp';
import { isDebug } from './debug';

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
export const exportConfig: IExtraPackageJsonConfig = require(packageJsonFile).exportAllInOne || {
	exportEverything: true,
};

function getTemp() {
	if (process.env.RUSH_TEMP_FOLDER) {
		return process.env.RUSH_TEMP_FOLDER;
	} else {
		return tmpdir();
	}
}

let tempNam = 'export-all-in-one-working';
if (!isDebug) {
	tempNam += '.' + (Math.random() * 10000).toFixed();
}

export const EXPORT_TEMP_PATH = resolve(getTemp(), tempNam);
export const DTS_CONFIG_FILE = resolve(EXPORT_TEMP_PATH, 'tsconfig.json');
export const API_CONFIG_FILE = resolve(EXPORT_TEMP_PATH, 'api-extractor.json');

export const IS_WINDOWS = platform() === 'win32';

export const INDEX_FILE_NAME = '_export_all_in_one_index';
export const TEMP_SOURCE_DIR_NAME = 'source';
export const TEMP_DIST_DIR_NAME = 'output';
