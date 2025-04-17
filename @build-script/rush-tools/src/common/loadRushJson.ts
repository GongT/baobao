import { findRushJson, findRushJsonSync } from '../api/load.js';

export async function requireRushPath(path: string = process.cwd()): Promise<string> {
	const rushFile = await findRushJson(path);
	if (!rushFile) {
		throw new Error('Can not find a "rush.json" from "' + path + '"');
	}

	process.env._RUSH_ROOT = rushFile;

	return rushFile;
}

export function requireRushPathSync(path: string = process.cwd()): string {
	const rushFile = findRushJsonSync(path);
	if (!rushFile) {
		throw new Error('Can not find a "rush.json" from "' + path + '"');
	}

	process.env._RUSH_ROOT = rushFile;

	return rushFile;
}
