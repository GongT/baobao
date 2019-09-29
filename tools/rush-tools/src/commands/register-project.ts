import { writeJsonFileBack } from '@idlebox/node-json-edit';
import { access } from 'fs-extra';
import { resolve } from 'path';
import { getCurrentRushConfig, toProjectPath } from '../api/load';

export async function runRegisterProject() {
	const _projectPath = process.argv[3];
	if (!_projectPath) {
		throw new Error('Require project argument.');
	}

	const projectPath = resolve(process.cwd(), _projectPath);

	if (!await access(projectPath + '/package.json').then(() => true, () => false)) {
		throw new Error('Can not find package.json at ' + projectPath + '.');
	}

	const name = require(projectPath + '/package.json').name;
	if (!name) {
		throw new Error('No "name" in package.json.');
	}

	const config = getCurrentRushConfig();
	const relPath = normalize(toProjectPath(projectPath));

	console.log('register project %s at %s', name, relPath);

	const exists = config.projects.find(({ packageName, projectFolder }: any) => {
		return packageName === name || normalize(projectFolder) === relPath;
	});

	if (exists) {
		throw new Error(`Project "${name}" is already exists as "${exists.packageName}".`);
	}

	config.projects.push({
		packageName: name,
		projectFolder: relPath,
		shouldPublish: true,
	});

	await writeJsonFileBack(config);
}

function normalize(s: string) {
	return s.replace(/^\.+[\/\\]+/g, '').replace(/\\/g, '/');
}
