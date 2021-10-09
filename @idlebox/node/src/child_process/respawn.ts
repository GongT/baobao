import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { platform } from 'os';
import { findBinary } from '../environment/findBinary';
import { spawnGetOutput } from './execa';

const unshareArgs = ['--pid', '--cgroup', '--fork', '--mount-proc', '--propagation=slave'];

if (platform() === 'linux' && process.getuid() !== 0) {
	unshareArgs.push('--map-root-user');
}

export function spawnRecreateEventHandlers() {
	process.on('SIGINT', () => shutdown_quit('SIGINT', 130));
	process.on('SIGTERM', () => shutdown_quit('SIGTERM', 143));
	process.on('SIGHUP', () => shutdown_quit('SIGHUP', 129));
}

function shutdown_quit(signal: string, code: number) {
	// console.error('receive signal', signal);
	if (process.listenerCount(signal) > 1) {
		return;
	}
	process.exit(code);
}

/**
 * Spawn a command, replace current node process
 * If can't do that (eg. on Windows), spawn as normal, but quit self after it quit.
 */
export function trySpawnInScope(cmds: string[]): never {
	if (process.env.NEVER_UNSHARE || insideScope() || !supportScope()) {
		spawnSimulate(cmds[0], cmds.slice(1));
	} else {
		execLinux(cmds);
	}
}

/**
 * Self restart in a pid/cgroup namespace on linux.
 * Your application must inside mainFunc, not before or after it.
 *
 * ```typescript
 * import {respawnInScope} from '@idlebox/node'
 * respawnInScope(() => {
 * 	import('./real-application');
 * });
 * ```
 */
export function respawnInScope(mainFunc: Function): unknown | never {
	if (process.env.NEVER_UNSHARE || insideScope() || !supportScope()) {
		spawnRecreateEventHandlers();
		mainFunc();
		return undefined;
	} else {
		execLinux(process.argv);
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

		try {
			const supported = spawnGetOutput({
				exec: [unshare, ...unshareArgs, 'echo', 'yes'],
				sync: true,
			});
			if (supported !== 'yes') {
				return false;
			}
		} catch {
			return false;
		}

		return true;
	} else {
		return false;
	}
}

function spawnSimulate(cmd: string, args: string[]): never {
	process.removeAllListeners('SIGINT');
	process.removeAllListeners('SIGTERM');
	const result = spawnSync(cmd, args, {
		stdio: 'inherit',
		windowsHide: true,
		env: {
			...process.env,
			NEVER_UNSHARE: 'true',
		},
	});
	if (result.signal) {
		process.kill(process.pid, result.signal);
		throw new Error('self kill not quit');
	}
	process.exit(result.status || 0);
}

function execLinux(cmds: string[]): never {
	const args = [...unshareArgs, '--wd=' + process.cwd(), ...cmds];

	try {
		process.env.NEVER_UNSHARE = 'true';
		const require = createRequire(import.meta.url);
		const kexec = require('kexec');

		process.removeAllListeners('SIGINT');
		process.removeAllListeners('SIGTERM');
		kexec(unshare, args);
		console.error('[Linux] kexec failed.');
	} catch (err: any) {
		if (err.code === 'MODULE_NOT_FOUND' || err.code === 'UNDECLARED_DEPENDENCY') {
			spawnSimulate(unshare, args);
		} else {
			console.error('[Linux] <%s> kexec failed:', err.code, err);
		}
	}
	process.exit(1);
}
