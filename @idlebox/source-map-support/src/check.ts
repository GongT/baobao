import { createStackTraceHolder, prettyPrintError } from '@idlebox/common';
import inspector from 'node:inspector';
import process from 'node:process';
import { install } from './index.js';

export function shouldInstallSourceMapSupport(): boolean {
	if (process.env.DISABLE_SOURCE_MAP || inspector.url() || process.argv.some(filterInspectArgs)) {
		return false;
	}

	return true;
}

function filterInspectArgs(arg: string) {
	return arg === '--enable-source-maps' || arg === '--inspect' || arg.startsWith('--inspect=') || arg === '--inspect-brk' || arg.startsWith('--inspect-brk=');
}

export const duplicate = Symbol.for('@idlebox/source-map-support');

export let hasInstalled = false;

const globalObj = globalThis as any;

export function recordDuplicate() {
	if (Object.hasOwn(globalObj, duplicate)) {
		const thisTime = createStackTraceHolder('stacktrace', install);
		prettyPrintError('@idlebox/source-map-support duplicate call to install()', {
			cause: globalObj[duplicate],
			message: thisTime.message,
			stack: thisTime.stack,
		});
		return;
	}

	hasInstalled = true;
	globalObj[duplicate] = createStackTraceHolder('last installed at', install);
}

export function hasInstalledSourceMapSupport() {
	return Object.hasOwn(globalObj, duplicate);
}
