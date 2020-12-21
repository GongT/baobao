import { dirname, relative, resolve } from 'path';
import { writeJsonFileBack } from '@idlebox/node-json-edit';
import { access } from 'fs-extra';
import { IRushConfig } from '../api/limitedJson';
import { RushProject } from '../api/rushProject';

export async function registerProjectToRush(projectPath: string) {
	projectPath = resolve(process.cwd(), projectPath);

	if (
		!(await access(projectPath + '/package.json').then(
			() => true,
			() => false
		))
	) {
		throw new Error('Can not find package.json at ' + projectPath + '.');
	}

	const name = require(projectPath + '/package.json').name;
	if (!name) {
		throw new Error('No "name" in package.json.');
	}

	const rush = new RushProject(projectPath);

	const absPath = normalize(rush.absolute(projectPath));
	let relPath = normalize(relative(dirname(rush.configFile), absPath));

	if (relPath.startsWith('..')) {
		throw new Error('project is out of root.');
	}
	relPath = relPath.replace(/^\.\//, '');

	const config = { ...rush.config } as IRushConfig;
	if (testConfilict(config, name, relPath)) {
		return false;
	}

	config.projects.push({
		packageName: name,
		projectFolder: relPath,
		shouldPublish: true,
	});

	await writeJsonFileBack(config);
	return true;
}

function normalize(s: string) {
	return s.replace(/^\.+[\/\\]+/g, '').replace(/\\/g, '/');
}

function testConfilict(config: IRushConfig, name: string, relPath: string) {
	const nameConflict = config.projects.find(({ packageName }) => {
		return packageName === name;
	});

	if (nameConflict) {
		if (relPath === nameConflict.projectFolder) {
			return true;
		}
		throw new Error(`Project name "${name}" is already used at "${nameConflict.projectFolder}".`);
	}

	const pathConflict = config.projects.find(({ projectFolder }) => {
		return normalize(projectFolder) === relPath;
	});
	if (pathConflict) {
		if (name === pathConflict.packageName) {
			return true;
		}
		throw new Error(`Path "${relPath}" is another project "${pathConflict.packageName}".`);
	}

	return false;
}
