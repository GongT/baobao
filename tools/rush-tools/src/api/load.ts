import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { findUpUntilSync, lrelative } from '@idlebox/platform';
import { resolve } from 'path';

let config: any;
let configPath: string;

function loadRushJson(path?: string) {
	if (!path) {
		const foundPath = findUpUntilSync(process.cwd(), 'rush.json');
		if (!foundPath) {
			throw new Error(`Cannot found rush.json`);
		}
		path = foundPath;
	}
	configPath = path!;
	config = loadJsonFileSync(configPath);
	return config;
}

export function getCurrentRushConfigPath() {
	if (!config) {
		loadRushJson();
	}
	return configPath;
}

export function getCurrentRushRootPath() {
	if (!config) {
		loadRushJson();
	}
	return resolve(configPath, '..');
}

export function getCurrentRushConfig() {
	if (!config) {
		loadRushJson();
	}
	return config;
}

export function toProjectPathAbsolute(projectFolder: string) {
	return resolve(getCurrentRushRootPath(), projectFolder);
}

export function toProjectPathRelative(projectFolder: string) {
	return lrelative(getCurrentRushRootPath(), projectFolder);
}
