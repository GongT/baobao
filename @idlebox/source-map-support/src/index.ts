import { globalObject } from '@idlebox/common';
import { hasInspector } from '@idlebox/node';
import process from 'node:process';
import { install as installHook, type Options } from 'source-map-support';
import { hasNativeSourceMapSupport } from './check.js';
export * from 'source-map-support';

let installed = false;
export function hasInstalledSourceMapSupport() {
	return installed;
}

/**
 */
export function install(options: Options = {}) {
	const hasOptions = Object.keys(options).length > 0;
	if (!hasOptions) {
		if (installed) {
			// 安装过，没有新的选项
			return false;
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
	}

	installHook(options);
	installed = true;
	return true;
}

export { convertToSourcePath } from './reflect.js';
