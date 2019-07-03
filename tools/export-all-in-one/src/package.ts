import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { CONFIG_FILE } from './argParse';
import { readJsonSync } from './writeFile';

export interface IMyPackageJson {
	[key: string]: any;

	scripts: { [key: string]: string };
}

let pathCache: string;

export function projectPackagePath() {
	if (pathCache) {
		return pathCache;
	}
	let dir = CONFIG_FILE;
	while (dir !== '/') {
		dir = dirname(dir);
		const pack = resolve(dir, 'package.json');
		if (existsSync(pack)) {
			pathCache = pack;
			return pack;
		}
	}
	throw new Error('Cannot find a package.json at any level up from tsconfig.json.');
}

export function projectPackage(): IMyPackageJson {
	return readJsonSync(projectPackagePath());
}
