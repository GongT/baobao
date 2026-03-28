import { earlyLoaderState } from './common/early-loader-bridge.js';
import type { IEsbuildResultInfo, IImportOptions, IQuitMessage } from './common/message.types.js';
import { masterOutput } from './master/cli.js';
import { waitFlush } from './master/misc-protocol.js';
import { wantPort } from './master/register-worker.js';
import { addFileToWorker } from './master/request-bridge.js';
export type { IImportOptions as IExecuteOptions };

const debug = masterOutput('cli')

if (earlyLoaderState.mainEntry) {
	if (earlyLoaderState.exports) {
		throw new Error('esbuild-executer: 发现多个实例', { cause: earlyLoaderState });
	} else {
		Error.captureStackTrace?.(earlyLoaderState);
	}
}

const infoRegistry = new WeakMap<any, IEsbuildResultInfo>();

export function getBuildInfo(exports: any): IEsbuildResultInfo | undefined {
	return infoRegistry.get(exports);
}

function defineInfo(exports: any, result: IEsbuildResultInfo) {
	if (!exports) exports = {};

	infoRegistry.set(exports, result);

	return exports;
}

/**
 * 实际上就是 importFile 唯一区别就是它会设置 process.argv[1]
 * 逻辑上相当于 node ./xxx.ts
 * 
 * 可以用 getBuildInfo(exports) 获取 esbuild 的结果信息
 */
export function execute<T = any>(tsFile: string, options?: IImportOptions): Promise<T> {
	return tryWithFlush(async () => {
		const data = await addFileToWorker(tsFile, options);
		process.argv[1] = data.resultEntryFile;
		debug(`Executing file: ${data.resultEntryFile}`);
		return defineInfo(await import(data.resultEntryFile), data);
	});
}

/**
 * 执行一个文件，返回它的导出，相当于 import() 方法
 * 如果它没有导出，也会返回一个空对象
 *
 * 可以用 getBuildInfo(exports) 获取 esbuild 的结果信息
 */
export function importFile<T = any>(tsFile: string, options?: IImportOptions): Promise<T> {
	return tryWithFlush(async () => {
		const data = await addFileToWorker(tsFile, options);
		debug(`Importing file: ${data.resultEntryFile}`);
		return defineInfo(await import(data.resultEntryFile), data);
	});
}

async function tryWithFlush(fn: () => Promise<any>) {
	try {
		return await fn();
	} catch (e) {
		await waitFlush();
		throw e;
	}
}

export function dispose() {
	wantPort()?.postMessage({ type: 'quit' } satisfies IQuitMessage);
}
