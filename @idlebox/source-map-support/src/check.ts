import { createStackTraceHolder, prettyPrintError } from '@idlebox/common';
import inspector from 'node:inspector';
import process from 'node:process';
import { install } from './index.js';

let hasInspect: boolean | undefined;
export function hasInspector(): boolean {
	if (hasInspect === undefined) {
		hasInspect = !!inspector.url() || process.execArgv.some(filterInspectArgs) || checkInspectEnv();
	}
	return hasInspect;
}

const inspectArgs = /(^|\s)--inspect(-brk)?(\s|$|=)?/;
function checkInspectEnv(): boolean {
	return process.env.NODE_OPTIONS ? inspectArgs.test(process.env.NODE_OPTIONS) : false;
}

const sourceMapSupportArg = /(^|\s)--enable-source-maps($|\s)/;

export function hasNativeSourceMapSupport() {
	return process.execArgv.includes('--enable-source-maps') || (process.env.NODE_OPTIONS ? sourceMapSupportArg.test(process.env.NODE_OPTIONS) : false);
}

function filterInspectArgs(arg: string) {
	return arg === '--inspect' || arg.startsWith('--inspect=') || arg === '--inspect-brk' || arg.startsWith('--inspect-brk=');
}

const duplicate = Symbol.for('@idlebox/source-map-support');

const globalObj = globalThis as any;

export function recordDuplicate() {
	if (hasInstalledSourceMapSupport()) {
		const thisTime = createStackTraceHolder('stacktrace', install);
		prettyPrintError('@idlebox/source-map-support duplicate call to install()', {
			cause: globalObj[duplicate],
			message: thisTime.message,
			stack: thisTime.stack,
		});
		return;
	}

	globalObj[duplicate] = createStackTraceHolder('last installed at', install);
}

export function hasInstalledSourceMapSupport() {
	return Object.hasOwn(globalObj, duplicate);
}
