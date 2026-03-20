import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import inspector from 'node:inspector';
import { resolve } from 'node:path';

const built = resolve(import.meta.dirname, './lib/index.js');

function isInspectArg(arg) {
	for (const inspectArg of ['--inspect', '--inspect-brk', '--inspect-port', '--inspect-wait']) {
		if (arg === inspectArg) {
			return true;
		}
		if (arg.startsWith(`${inspectArg}=`)) {
			return true;
		}
	}
	return false;
}

const hasInspect = inspector.url() || process.execArgv.some(isInspectArg);
if (hasInspect) {
	process.env.INSPECTOR_MODE = '1';
	console.error('force rebuilding executer!');
}

if (!existsSync(built) || hasInspect) {
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

export const execute = await import(built).then((m) => m.execute);
