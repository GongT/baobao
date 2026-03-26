import { isV8 } from '@idlebox/common';
import { consoleCompatibleInternal } from '../common/create.compability.js';
import { createLoggerObject } from '../common/logger.create.js';
import { createGlobalLogger } from '../common/logger.global.js';
import type { IInstrestedConsole } from '../common/types.js';
import { EnableLogLevel } from '../loglevels/loglevel.js';
import { NodejsOutput } from '../outputs/nodejs.js';
import type { ILoggerOptions } from './share.js';

export * from './share.js';
export { NodejsOutput };
export const consoleCompatible = /*@__PURE__*/ consoleCompatibleInternal.bind(undefined, {});

const defaultConsole = {
	...console,
	colorEnabled: isV8,
};

export function createRootLogger(tag: string, defaultLevel: EnableLogLevel = EnableLogLevel.auto, output: IInstrestedConsole = defaultConsole) {
	createGlobalLogger(output, tag, defaultLevel);
}

export function createLogger(tag: string, options: ILoggerOptions = {}) {
	return createLoggerObject(tag, {
		console: defaultConsole,
		...options,
	});
}
