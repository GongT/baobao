import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { spawn } from 'node:child_process';
import { createMonorepoObject } from '../common/workspace.js';

export async function runList() {
	const reverse = argv.flag(['--reverse', '-r']) > 0;
	const noPager = argv.flag(['--no-pager']) > 0 || !process.stdout.isTTY;
	const depth = parseInt(argv.single(['--depth']) || '0', 10);
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject();
	repo._finalize();

	const text = repo.dump({
		depth: depth,
		reverse: reverse,
		short: false,
		summary: false,
	});

	if (noPager) {
		console.log(text);
	} else {
		const less = spawnLess();
		less.stdin.end(text);
		await new Promise((resolve) => {
			less.on('exit', resolve);
		});
	}
}

function spawnLess() {
	return spawn('less', ['-r'], {
		stdio: ['pipe', process.stdout, process.stderr],
	});
}
