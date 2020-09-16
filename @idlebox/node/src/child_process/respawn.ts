import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { platform } from 'os';
import { findBinary } from '../environment/findBinary';
import { spawnGetOutput } from './execa';

const unshareArgs = ['--pid', '--cgroup', '--fork', '--mount-proc', '--propagation=slave'];

export function respawnInScope(mainFunc: Function): unknown | never {
	if (insideScope() || !supportScope()) {
		mainFunc();
		return undefined;
	} else {
		respawnLinux(process.argv);
	}
}

let unshare: string;

function insideScope() {
	return process.pid === 1;
}
function supportScope() {
	if (platform() === 'linux') {
		unshare = findBinary('unshare');
		if (!unshare) {
			return false;
		}

		if (spawnGetOutput({ exec: [unshare, ...unshareArgs, 'echo', 'yes'], sync: true }) !== 'yes') {
			return false;
		}

		return true;
	} else {
		return false;
	}
}

function respawnLinux(cmds: string[]): never {
	const args = [...unshareArgs, '--wd=' + process.cwd(), ...cmds];

	try {
		const require = createRequire(import.meta.url);
		const kexec = require('kexec');
		kexec(unshare, args);
		throw new Error('kexec failed.');
	} catch (err) {
		if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'UNDECLARED_DEPENDENCY') {
			throw err;
		}
		console.error('[Linux] kexec failed:', err);

		const result = spawnSync(unshare, args, {
			stdio: 'inherit',
			windowsHide: true,
		});
		if (result.signal) {
			process.kill(process.pid, result.signal);
			throw new Error('self kill not quit');
		}
		process.exit(result.status || 1);
	}
}
