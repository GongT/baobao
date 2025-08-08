import { app, argv } from '@idlebox/cli';

export class DieError extends Error {
	constructor(msg: string) {
		super(msg);
		this.stack = this.message;
	}
}

/** @deprecated */
export const isQuiet = app.silent;
export const isJsonOutput = argv.flag(['--json']) > 0;

/** @deprecated */
export const isHelp = app.showHelp;

export const distTagInput = argv.single(['--dist-tag']) || 'latest';
export const registryInput = argv.single(['--registry']) || 'detect';

/** @deprecated */
export const isDebugMode = app.debug;
/** @deprecated */
export const isVerbose = app.verbose;

export function pArgS(s: string) {
	return `\x1B[3;38;5;14m${s}\x1B[0m`;
}
export function pDesc(s: string) {
	return `\x1B[3;2m${s}\x1B[0m`;
}
export function pCmd(s: string) {
	return `\x1B[38;5;10m${s}\x1B[0m`;
}
