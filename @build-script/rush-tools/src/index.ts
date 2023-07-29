import { exists } from '@idlebox/node';
import { readdir } from 'fs/promises';
import { dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { description } from './common/description';
import { NormalError } from './common/error';

const __extname = extname(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function main() {
	let argv = process.argv.slice(2);

	const commandPos = argv.findIndex((item) => !item.startsWith('-'));
	if (commandPos === -1) {
		await showHelp();
		return;
	}
	const command = argv.splice(commandPos, 1)[0]!;
	const rcommand = compCommandName(command);

	const fpath = resolve(__dirname, 'commands', rcommand + '.mjs');
	if (await exists(fpath)) {
		try {
			process.env.__running_command = rcommand;
			const { default: fn } = await import(fpath);
			await fn(argv);
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

function compCommandName(n: string) {
	if (n === 'autofix') {
		return 'fix';
	} else if (n === 'check-update') {
		return 'upgrade';
	}
	return n;
}

async function showHelp() {
	const list: [string, string][] = [];
	const fdir = resolve(__dirname, 'commands');
	for (const fname of await readdir(fdir)) {
		if (fname.endsWith(__extname)) {
			const command = fname.substring(0, fname.length - __extname.length);
			const { default: fn } = await import(resolve(fdir, fname));
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
