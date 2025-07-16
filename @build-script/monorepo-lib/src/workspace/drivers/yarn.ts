import { NotImplementedError } from '@idlebox/common';

export function yarnListProjects(_projectRoot: string): never {
	throw new NotImplementedError('yarn workspaces is not not implemented yet.');
}
