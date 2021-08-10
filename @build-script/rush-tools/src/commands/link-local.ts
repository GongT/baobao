import { basename, dirname, resolve } from 'path';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { relativePath } from '@idlebox/node';
import { loadJsonFile } from '@idlebox/node-json-edit';
import { mkdirp } from 'fs-extra';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

description(linkLocalBins, 'Link "bin"s from each project to common/temp/bin');

export default async function linkLocalBins() {
	const rush = new RushProject();

	const binTempDir = resolve(rush.tempRoot, 'bin');
	await mkdirp(binTempDir);

	for (const project of rush.projects) {
		const pkgJson = rush.packageJsonPath(project);
		if (!pkgJson) {
			console.error('Error: package.json not found in: %s', project.projectFolder);
			process.exit(1);
		}
		const packageJson = await loadJsonFile(pkgJson);
		if (typeof packageJson.bin == 'string') {
			await createLink(rush, basename(packageJson.name), rush.absolute(project, packageJson.bin));
		} else if (typeof packageJson.bin == 'object') {
			for (const [name, path] of Object.entries(packageJson.bin)) {
				await createLink(rush, name, rush.absolute(project, path as string));
			}
		}
	}
}

async function createLink(rush: RushProject, name: string, path: string) {
	const binTempDir = resolve(rush.tempRoot, 'bin');
	const distFile = resolve(binTempDir, name);

	const loader = relativePath(dirname(distFile), path);

	if (await ensureLinkTarget(loader, distFile)) {
		console.log('create link file %s => %s', relativePath(rush.projectRoot, distFile), loader);
	}
}
