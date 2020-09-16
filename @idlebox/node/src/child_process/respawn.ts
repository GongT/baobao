import { spawnSync } from "child_process";
import { createRequire } from "module";
import { platform } from "os";
import { findBinary } from "../environment/findBinary";
import { spawnGetOutput } from "./execa";

const unshareArgs = [
	"--pid",
	"--cgroup",
	"--fork",
	"--mount-proc",
	"--propagation=slave",
];

/**
 * Spawn a command, replace current node process
 * If can't do that (eg. on Windows), spawn as normal, but quit self after it quit.
 */
export function trySpawnInScope(cmds: string[]): never {
	if (insideScope() || !supportScope()) {
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
	if (insideScope() || !supportScope()) {
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
	if (platform() === "linux") {
		unshare = findBinary("unshare");
		if (!unshare) {
			return false;
		}

		if (
			spawnGetOutput({
				exec: [unshare, ...unshareArgs, "echo", "yes"],
				sync: true,
			}) !== "yes"
		) {
			return false;
		}

		return true;
	} else {
		return false;
	}
}

function spawnSimulate(cmd: string, args: string[]): never {
	const result = spawnSync(cmd, args, {
		stdio: "inherit",
		windowsHide: true,
	});
	if (result.signal) {
		process.kill(process.pid, result.signal);
		throw new Error("self kill not quit");
	}
	process.exit(result.status || 1);
}

function execLinux(cmds: string[]): never {
	const args = [...unshareArgs, "--wd=" + process.cwd(), ...cmds];

	try {
		const require = createRequire(import.meta.url);
		const kexec = require("kexec");
		kexec(unshare, args);
		console.error("[Linux] kexec failed.");
	} catch (err) {
		if (
			err.code !== "MODULE_NOT_FOUND" &&
			err.code !== "UNDECLARED_DEPENDENCY"
		) {
			spawnSimulate(unshare, args);
		} else {
			console.error("[Linux] kexec failed:", err);
		}
	}
	process.exit(1);
}
