import { convertCaughtError, SoftwareDefectError } from '@idlebox/common';
import { createRootLogger, logger } from '@idlebox/logger';
import { getLoadedFiles } from '@idlebox/native-executer';
import { registerNodejsExitHandler, shutdown } from '@idlebox/node';
import { getCancelSignal, getEachMessage, sendMessage } from 'execa';
import { fileURLToPath } from 'node:url';
import { callGenerateFunction } from '../../client/call-generate-function.js';
import type { IGenerateFunction } from '../../client/generate-context.js';
import { isTypeOf, type IGenerateResult, type IMessage } from './messages.js';

registerNodejsExitHandler();
const cancelSignal = await getCancelSignal();

cancelSignal.addEventListener('abort', () => {
	shutdown(0);
});

const generatorFile = process.argv[2];
if (!generatorFile) {
	throw new SoftwareDefectError('no generator file specified');
}

createRootLogger('executer:child');
logger.info`starting child process for generator ${generatorFile}`;

Object.assign(globalThis, { logger });

let generateFunction: IGenerateFunction;
try {
	const exports = await import(generatorFile);
	generateFunction = exports.generate;
	if (typeof generateFunction !== 'function') {
		throw new Error('生成器文件必须导出一个名为 generate 的函数');
	}
} catch (e) {
	sendMessage({
		type: 'initialize',
		files: files(),
		error: convertCaughtError(e),
	} satisfies IMessage);
	throw e;
}

Object.assign(globalThis, { logger: undefined });

sendMessage({ type: 'initialize', files: files() } satisfies IMessage);

for await (const event of getEachMessage()) {
	if (isTypeOf(event, 'execute')) {
		let r: IGenerateResult;
		try {
			r = await callGenerateFunction({
				generate: generateFunction,
				logger: logger,
				projectRoot: process.cwd(),
				sourceFile: generatorFile,
			});
		} catch (e) {
			r = {
				outputs: `${(e as Error).message}\n${(e as Error).stack || '<no stack trace available>'}`,
				userWatchFiles: [],
				success: false,
				changes: 0,
				totalFiles: 0,
				error: convertCaughtError(e),
			};
		}

		sendMessage({
			type: 'execute-result',
			result: r,
		} satisfies IMessage);
	} else {
		throw new Error(`unexpected message type: ${(event as any)?.type ?? event}`);
	}
}

function files() {
	return Array.from(getLoadedFiles()).map((item) => {
		return fileURLToPath(item);
	});
}
