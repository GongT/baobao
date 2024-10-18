import { exists } from '@idlebox/node';
import { command, flag, option, string, subcommands } from 'cmd-ts';
import { readdir } from 'fs/promises';
import { dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as SubCmds from './commands.generated.js';
import { description } from './common/description';
import { NormalError } from './common/error';
import { parseArgs } from 'util';

const __filename = fileURLToPath(
	// @ts-ignore
	import.meta.url,
);
const __extname = extname(__filename);
const __dirname = dirname(__filename);

export default async function main() {
	let argv = process.argv.slice(2);

	const output = parseArgs({
		options:{
			debug: {
				type:'boolean',
			},
		},
		args:[],
		
	})

	for (const [v] of Object.entries(SubCmds)) {
	}

	const fpath = resolve(__dirname, 'commands', rcommand + '.js');
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
		console.error('[rush-tools] No such command: ' + command);
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
