import process from 'node:process';
import { install as installHook, type Options as SMSOptions } from 'source-map-support';
import { hasInstalledSourceMapSupport, recordDuplicate, shouldInstallSourceMapSupport } from './check.js';
export * from 'source-map-support';

export interface Options extends SMSOptions {
	force?: boolean;
	ignore?: boolean;
}

export function install(options?: Options) {
	if (options?.ignore && hasInstalledSourceMapSupport()) {
		return false;
	}
	recordDuplicate();

	if (options?.force || shouldInstallSourceMapSupport()) {
		installHook(options);
		return true;
	} else {
		process.env.DISABLE_PRETTY_ERROR = 'yes';
		return false;
	}
}

export { hasInstalledSourceMapSupport, shouldInstallSourceMapSupport } from './check.js';
