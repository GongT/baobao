import { readdir } from 'fs-extra';
import { resolve } from 'path';
import { setProjectDir } from './api/context';
import { getBuildContext } from './common/buildContextInstance';

export default async function () {
	setProjectDir(process.cwd());
	const cmds = new Map();
	let size = 0;

	const cmddir = resolve(__dirname, 'cmd');
	for (const item of await readdir(cmddir)) {
		if (item.endsWith('.js')) {
			const n = item.replace(/\.js/, '');
			size = Math.max(n.length, size);
			cmds.set(n, require(resolve(cmddir, item)).usage || '???');
		}
	}

	const projectJson = getBuildContext();
	for (const [key, { title }] of projectJson.projectJson.job.entries()) {
		if (cmds.has(key)) {
			continue;
		}
		cmds.set(key, title || '???');
	}

	console.error('Usage: build-script [command to run].');
	for (const [k, v] of cmds) {
		const pk = k + Buffer.alloc(size - k.length, ' ').toString();
		console.error('  %s  %s', pk, v);
	}

	process.exit(1);
}