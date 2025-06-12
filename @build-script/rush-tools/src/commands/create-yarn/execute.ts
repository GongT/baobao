import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/json-edit';
import { resolve } from 'node:path';
import { findRushRootPath } from '../../api/load.js';
import { RushProject } from '../../api/rushProject.js';

export async function runCreateYarn(_argv: any) {
	const root = await findRushRootPath(process.cwd());
	if (!root) {
		throw new Error('invalid file struct (no rush.json)');
	}
	const rush = new RushProject(root);

	const pkg = await loadJsonFileIfExists(resolve(rush.projectRoot, 'package.json'), {});
	pkg.private = true;
	if (!pkg.workspaces) pkg.workspaces = {};
	pkg.workspaces.packages = rush.config.projects.map(({ projectFolder }) => projectFolder);
	await writeJsonFileBack(pkg);
}
