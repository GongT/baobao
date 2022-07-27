import { registerProjectToRush } from '../api/register';
import { argumentError } from '../common/arguments';
import { description } from '../common/description';

const argumentDefines = [
	{
		name: 'project-name-or-path',
		description: 'Name or path of the new project',
	},
];

/** @internal */
export default async function runRegister(argv: string[]) {
	const _projectPath = argv[0];
	if (!_projectPath) {
		argumentError('Require project argument.', argumentDefines);
	}

	await registerProjectToRush(_projectPath);
}

description(runRegister, 'Register a newly created package.json into rush.json');
