import { globalObject } from '@idlebox/common';
import process from 'node:process';
import { install as installHook, type Options as SMSOptions } from 'source-map-support';
import { hasInspector, hasInstalledSourceMapSupport, hasNativeSourceMapSupport, recordDuplicate } from './check.js';
export * from 'source-map-support';

export interface Options extends SMSOptions {
	force?: boolean;
	ignore?: boolean;
}

export function install({ ignore = false, force = false, ...options }: Options = {}) {
	if (ignore && hasInstalledSourceMapSupport()) {
		return false;
	}
	recordDuplicate(force);

	if (force) {
		installHook(options);
		return true;
	}
	if (hasInspector()) {
		globalObject.DISABLE_PRETTY_ERROR = true;
		return false;
	}
	if (process.env.DISABLE_SOURCE_MAP) {
		return false;
	}
	if (hasNativeSourceMapSupport()) {
		return false;
	}

	installHook(options);
	return true;
}

export { hasInspector, hasInstalledSourceMapSupport } from './check.js';
