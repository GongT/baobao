import { mkdir, readdir } from 'fs/promises';
import { basename, resolve } from 'path';
import { exists } from '@idlebox/node';
import { loadJsonFile } from '@idlebox/node-json-edit';
import { RushProject } from '../../api/rushProject';
import { description } from '../../common/description';
import { createExecuteWrapper } from '../../common/link';
import { updateAllInstallers } from './ai';

description(linkLocalBins, 'Link "bin"s from each project to common/temp/bin');

export default async function linkLocalBins() {
	const rush = new RushProject();

	const binTempDir = resolve(rush.tempRoot, 'bin');
	await mkdir(binTempDir, { recursive: true });

	const map = new Map<string, string>();

	await updateAllInstallers(rush, []);

	for (const ai of rush.autoinstallers) {
		console.log('\x1B[2m   - [auto-installer] %s:\x1B[0m', ai.packageName);
		const localBinPath = rush.absolute(ai, 'node_modules/.bin');
		if (!(await exists(localBinPath))) {
			continue;
		}
		for (const item of await readdir(localBinPath)) {
			console.log('\x1B[2m      * %s\x1B[0m', item);
			map.set(item, resolve(localBinPath, item));
		}
	}

	for (const project of [...rush.projects, ...rush.autoinstallers]) {
		const pkgJson = rush.packageJsonPath(project);
		if (!pkgJson) {
			console.error('Error: package.json not found in: %s', project.projectFolder);
			process.exit(1);
		}
		const packageJson = await loadJsonFile(pkgJson);
		console.log('\x1B[2m   - [project] %s:\x1B[0m', packageJson.name);
		if (typeof packageJson.bin == 'string') {
			const name = basename(packageJson.name);
			console.log('\x1B[2m      * %s\x1B[0m', name);
			map.set(name, rush.absolute(project, packageJson.bin));
		} else if (typeof packageJson.bin == 'object') {
			for (const [name, path] of Object.entries<string>(packageJson.bin)) {
				console.log('\x1B[2m      * %s\x1B[0m', name);
				map.set(name, rush.absolute(project, rush.absolute(project, path)));
			}
		}
	}

	for (const [name, path] of map.entries()) {
		createExecuteWrapper(rush, name, path);
	}
}
