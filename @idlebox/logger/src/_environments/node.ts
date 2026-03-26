import { consoleCompatibleInternal } from '../common/create.compability.js';
import { createLoggerObject } from '../common/logger.create.js';
import { createGlobalLogger } from '../common/logger.global.js';
import type { IInstrestedConsole } from '../common/types.js';
import { EnableLogLevel } from '../loglevels/loglevel.js';
import { NodejsOutput } from '../outputs/nodejs.js';
import type { ILoggerOptions } from './share.js';

export { createLogFile } from '../printers/file.js';
export * from './share.js';

export const consoleCompatible = /*@__PURE__*/ consoleCompatibleInternal.bind(undefined, {});

export function createRootLogger(tag: string, defaultLevel: EnableLogLevel = EnableLogLevel.auto, output: IInstrestedConsole = NodejsOutput.defaultInstance()) {
	createGlobalLogger(output, tag, defaultLevel);
}

export function createLogger(tag: string, options: ILoggerOptions = {}) {
	return createLoggerObject(tag, {
		console: NodejsOutput.defaultInstance(),
		...options,
	});
}

export { applyControllerByEnvironment as getControllerByEnvironment } from '../outputs/node-controllers/index.js';
export { NodejsOutput };
