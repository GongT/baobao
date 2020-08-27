import { description } from '../common/description';
import { NormalError } from '../common/error';
import { RushProject } from '../api/rushProject';

enum GetWhat {
	name = 1,
	path,
	relpath,
}

/** @internal */
export default async function runList(argv: string[]) {
	const type: GetWhat = GetWhat[argv[0] as any] as any;

	const rush = new RushProject();
	let list: string[];

	switch (type) {
		case GetWhat.name:
			list = rush.projects.map(({ packageName }) => packageName);
			break;
		case GetWhat.path:
			list = rush.projects.map((p) => rush.absolute(p));
			break;
		case GetWhat.relpath:
			list = rush.projects.map(({ projectFolder }) => projectFolder);
			break;
		default:
			throw new NormalError('Usage: rush-tools list <name|path|relpath>');
	}
	for (const item of list) {
		console.log(item);
	}
}

description(runList, 'List project name or path or relative-path, can process with pipe.');
