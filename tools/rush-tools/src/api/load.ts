import { readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import { jsonc } from 'jsonc';
import { resolve } from 'path';

let config: any;
let configPath: string;

export function loadRushJson(path?: string) {
	if (!path) {
		path = resolve(process.cwd(), 'rush.json');
	}
	if (!pathExistsSync(path)) {
		throw new Error(`Cannot found rush.json at "${path}"`);
	}
	const text = readFileSync(path, 'utf-8');
	try {
		config = jsonc.parse(text);
	} catch (e) {
		throw new Error(`Cannot parse "${path}": ${e.message}`);
	}
	configPath = path;
	return config;
}

export function getCurrentRushConfigPath() {
	return configPath;
}

export function getCurrentRushRootPath() {
	return resolve(configPath, '..');
}

export function getCurrentRushConfig() {
	if (!config) {
		loadRushJson();
	}
	return config;
}

export function toAbsoluteProjectPath(projectFolder: string) {
	return resolve(getCurrentRushRootPath(), projectFolder);
}
