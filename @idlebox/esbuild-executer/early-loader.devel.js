import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const built = resolve(import.meta.dirname, './lib/index.js');

export let execute;
if (!existsSync(built)) {
	const p = spawnSync('tsc -p src --noCheck', {
		stdio: 'inherit',
		shell: true,
		cwd: import.meta.dirname,
		encoding: 'utf-8',
	});

	if (p.error) {
		throw p.error;
	}

	if (p.signal) {
		throw new Error(`tsc was killed with signal ${p.signal}`);
	}

	if (p.status) {
		throw new Error(`tsc exited with code ${p.status}`);
	}
}

execute = await import(built).then((m) => m.execute);
