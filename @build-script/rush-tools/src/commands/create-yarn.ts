import { resolve } from 'path';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { findRushRootPath } from '../api/load';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

export default async function createTasks() {
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

description(createTasks, 'Create yarn workspace file by rush.json.');
