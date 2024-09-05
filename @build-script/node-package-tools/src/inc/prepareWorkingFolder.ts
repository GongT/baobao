import { emptyDir, exists } from '@idlebox/node';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { readJsonSync } from './fs';
import { log } from './log';

export async function prepareWorkingFolder(workingRoot: string, name: string, version: string) {
	await mkdir(workingRoot, { recursive: true });

	const workingFile = resolve(workingRoot, 'package.json');
	const workingJson = {
		name: 'check-working',
		version: '1.0.0',
		main: 'index.js',
		license: 'MIT',
		dependencies: {} as any,
	};
	if (await exists(workingFile)) {
		workingJson.dependencies = readJsonSync(workingFile).dependencies || {};
	}

	workingJson.dependencies[name] = '=' + version;

	await writeFile(workingFile, JSON.stringify(workingJson, null, 4));

	const tempDir = resolve(workingRoot, 'node_modules', name);
	await emptyDir(tempDir);

	log('Working at temp dir %s', tempDir);
	return tempDir;
}
