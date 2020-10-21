import { exists } from '@idlebox/node';
import { emptyDir, mkdirp, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { log } from './log';

export async function prepareWorkingFolder(workingRoot: string, name: string, version: string) {
	await mkdirp(workingRoot);

	const workingFile = resolve(workingRoot, 'package.json');
	const workingJson = {
		name: 'check-working',
		version: '1.0.0',
		main: 'index.js',
		license: 'MIT',
		dependencies: {} as any,
	};
	if (await exists(workingFile)) {
		workingJson.dependencies = require(workingFile).dependencies || {};
	}

	workingJson.dependencies[name] = '=' + version;

	await writeFile(workingFile, JSON.stringify(workingJson, null, 4));

	const tempDir = resolve(workingRoot, 'node_modules', name);
	await mkdirp(tempDir);
	await emptyDir(tempDir);

	log('Working at temp dir %s', tempDir);
	return tempDir;
}
