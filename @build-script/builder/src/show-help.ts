import { readdir } from 'fs-extra';
import { basename, extname, resolve } from 'path';
import { setProjectDir } from './api/context';
import { getBuildContext } from './common/buildContextInstance';

export default async function () {
	setProjectDir(process.cwd());
	const cmds = new Map();
	let size = 0;

	const filename = /*import.meta.url*/ __dirname.replace(/^file:\/\//, '');
	const ext = extname(filename);
	const cmddir = resolve(filename, '../cmd');
	for (const item of await readdir(cmddir)) {
		if (item.endsWith(ext)) {
			const n = basename(item, ext);
			size = Math.max(n.length, size);
			const mdl = await import(resolve(cmddir, item));
			cmds.set(n, mdl.usage || '???');
		}
	}

	const projectJson = getBuildContext();
	for (const [key, { title }] of projectJson.projectJson.job.entries()) {
		if (cmds.has(key)) {
			continue;
		}
		cmds.set(key, title || '???');
	}

	size = Math.max(size, ...[...cmds.keys()].map((v) => v.length));
	console.error('Usage: build-script [command to run].');
	for (const [k, v] of cmds.entries()) {
		const pk = k + ' '.repeat(size - k.length);
		console.error('  %s  %s', pk, v);
	}

	process.exit(1);
}
