import { noop, vscEscapeValue } from '@idlebox/common';
import { syncBuiltinESMExports } from 'node:module';
import process from 'node:process';

const originalChdir = process.chdir;
const originalCwd = process.cwd;

let currentEnvironmentChdir = originalChdir;
const currentEnvironmentCwd = originalCwd;
let patch = noop;

const wd = {
	cwd() {
		return currentEnvironmentCwd();
	},
	chdir(dir: string) {
		currentEnvironmentChdir(dir);
	},
	patchGlobal() {
		patch();
		wd.cwd = currentEnvironmentCwd;
		wd.chdir = currentEnvironmentChdir;
		wd.patchGlobal = noop;
	},
	escapeVscodeCwd,
	isVscodeShellIntegration: process.env.VSCODE_SHELL_INTEGRATION || process.env.VSCODE_SHELL_INTEGRATION_SHELL_SCRIPT,
};

export const workingDirectory: Readonly<typeof wd> = wd;

function escapeVscodeCwd(path: string) {
	return `\x1B]633;P;Cwd=${vscEscapeValue(path)}\x07`;
}

if (wd.isVscodeShellIntegration) {
	currentEnvironmentChdir = (newRoot: string) => {
		process.stderr.write(escapeVscodeCwd(newRoot));
		originalChdir(newRoot);
	};
	patch = () => {
		process.chdir = currentEnvironmentChdir;
		globalThis.process.chdir = currentEnvironmentChdir;
		syncBuiltinESMExports();
	};
}
