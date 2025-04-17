import { RushProject } from '../../api/rushProject.js';
import type { ArgOf } from '../../common/args.js';
import { NormalError } from '../../common/error.js';
import { CmdListWhat } from './arguments.js';

/** @internal */
export async function runList({ what }: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();
	let list: string[];

	switch (what) {
		case CmdListWhat.name:
			list = rush.projects.map(({ packageName }) => packageName);
			break;
		case CmdListWhat.path:
			list = rush.projects.map((p) => rush.absolute(p));
			break;
		case CmdListWhat.relpath:
			list = rush.projects.map(({ projectFolder }) => projectFolder);
			break;
		default:
			throw new NormalError('Usage: rush-tools list <name|path|relpath>');
	}
	for (const item of list) {
		console.log(item);
	}
}
