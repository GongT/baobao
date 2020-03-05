import { writeJsonFileBack, loadJsonFileSync } from '@idlebox/node-json-edit';
import { access } from 'fs-extra';
import { resolve, relative, dirname } from 'path';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

export default async function runRegisterProject() {
	const _projectPath = process.argv[3];
	if (!_projectPath) {
		throw new Error('Require project argument.');
	}

	const projectPath = resolve(process.cwd(), _projectPath);

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

	const rush = new RushProject();

	const absPath = normalize(rush.absolute(projectPath));
	let relPath = normalize(relative(dirname(rush.configFile), absPath));
	console.log('register project %s at %s', name, relPath);

	if (relPath.startsWith('..')) {
		throw new Error('project is out of root.');
	}
	relPath = relPath.replace(/^\.\//, '');

	const config = loadJsonFileSync(rush.configFile);
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

description(runRegisterProject, 'Register a newly created package.json into rush.json');
