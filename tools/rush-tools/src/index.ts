import { readdir } from 'fs-extra';
import { resolve } from 'path';
import { exists } from '@idlebox/node-helpers';
import { description } from './common/description';
import { NormalError } from './common/error';

export default async function main() {
	const command: undefined | string = process.argv.slice(2).find(item => !item.startsWith('-'));
	if (!command) {
		await showHelp();
		return;
	}

	const fpath = resolve(__dirname, 'commands', command + '.js');
	if (await exists(fpath)) {
		const argv = process.argv.slice(2).filter(item => item !== command);
		try {
			await require(fpath).default(argv);
		} catch (e) {
			if (e instanceof NormalError) {
				console.error(e.message);
				process.exit(1);
			}
			throw e;
		}
	} else {
		console.error('No such command: ' + command);
		process.exit(1);
	}
}

async function showHelp() {
	const list: [string, string][] = [];
	const fdir = resolve(__dirname, 'commands');
	for (const fname of await readdir(fdir)) {
		if (fname.endsWith('.js')) {
			const command = fname.replace(/\.js$/, '');
			const fn = require(resolve(fdir, fname)).default;
			const desc = description(fn);

			list.push([command, desc]);
		}
	}

	const maxLen = list.reduce((p, [cmd]) => Math.max(p, cmd.length), 0);

	console.error('Available commands: ');
	for (const [cmd, desc] of list) {
		console.error('  %s%s  %s', cmd, Buffer.alloc(maxLen - cmd.length, ' ').toString(), desc);
	}

	process.exit(1);
}
