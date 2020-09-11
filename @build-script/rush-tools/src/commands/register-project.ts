import { registerProjectToRush } from '../api/register';
import { description } from '../common/description';

/** @internal */
export default async function runRegisterProject() {
	const _projectPath = process.argv[3];
	if (!_projectPath) {
		throw new Error('Require project argument.');
	}

	const added = registerProjectToRush(_projectPath);

	if (added) {
		console.log('register success. you should run \x1B[38;5;10mrush update\x1B[0m now.');
	} else {
		console.log('register success. (already exists)');
	}
}

description(runRegisterProject, 'Register a newly created package.json into rush.json');
