import { access } from 'fs/promises';
import { dirname, relative, resolve } from 'path';
import { exists } from '@idlebox/node';
import { writeJsonFileBack } from '@idlebox/node-json-edit';
import { IRushConfig } from '../api/limitedJson';
import { RushProject } from '../api/rushProject';

export async function registerProjectToRush(projectPath: string, log = console.log) {
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

	const absolutePathToRegister = normalize(rush.absolute(projectPath));
	let pathToRegister = normalize(relative(dirname(rush.configFile), absolutePathToRegister));

	if (pathToRegister.startsWith('..')) {
		throw new Error('project is out of root.');
	}
	pathToRegister = pathToRegister.replace(/^\.\//, '').replace(/\\/g, '/');

	const config = { ...rush.config } as IRushConfig;

	const nameConflict = config.projects.find(({ packageName }) => {
		return packageName === name;
	});
	const pathConflict = config.projects.find(({ projectFolder }) => {
		return normalize(projectFolder) === pathToRegister;
	});

	let msg: string;
	if (nameConflict) {
		const conflictPath = rush.absolute(nameConflict);
		if (absolutePathToRegister === conflictPath) {
			log('register success (no change)');
			return false;
		}

		if (await exists(conflictPath)) {
			throw new Error(`project name "${name}" is already used at "${nameConflict.projectFolder}".`);
		}

		msg = 'move previous package from ' + nameConflict.projectFolder;
		nameConflict.projectFolder = pathToRegister;
	} else if (pathConflict) {
		msg = 'rename previous package ' + pathConflict.packageName;
		pathConflict.packageName = name;
	} else {
		msg = '';
		config.projects.push({
			packageName: name,
			projectFolder: pathToRegister,
		});
	}

	const changed = await writeJsonFileBack(config);
	if (changed) {
		log('register success: %s', msg);
	} else {
		log('%s. but result file not changed.', msg);
	}
	return changed;
}

function normalize(s: string) {
	return s.replace(/^\.+[\/\\]+/g, '').replace(/\\/g, '/');
}
