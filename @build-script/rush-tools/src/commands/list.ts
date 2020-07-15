import { description } from '../common/description';
import { NormalError } from '../common/error';

/** @internal */
export default async function runList(argv: string[]) {
	if (!argv[0]) {
		throw new NormalError('Usage: rush-tools list <name|path|relpath>');
	}
}

description(runList, 'List project name or path or relative-path, can process with pipe.');
