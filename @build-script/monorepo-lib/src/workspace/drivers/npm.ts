import { NotImplementedError } from '@idlebox/common';

export function npmListProjects(_projectRoot: string): never {
	throw new NotImplementedError('npm workspaces is not not implemented yet.');
}
