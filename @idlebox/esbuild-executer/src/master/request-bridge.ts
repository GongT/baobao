import assert from 'node:assert';
import { isMainThread } from 'node:worker_threads';
import type { IAddFileRequest, IAddFileResponse, IEsbuildResultInfo, IImportOptions } from '../common/message.types.js';
import { masterOutput } from './cli.js';
import { registerWorkerIfNot } from './register-worker.js';

assert.equal(isMainThread, true, 'Worker引用了主线程代码');

const compileWatting = new Map<string, PromiseWithResolvers<IEsbuildResultInfo>>();
const debug = masterOutput('bridge');
const debugCache = masterOutput('verbose');

export async function addFileToWorker(tsFile: string, options?: IImportOptions): Promise<IEsbuildResultInfo> {
	if (!tsFile.startsWith('file:')) {
		throw new Error(`execute() must be a file:// URL, got: ${tsFile}`);
	}

	const handler = await registerWorkerIfNot();

	if (options?.cache === false) {
		debugCache(`request no cache for file: ${tsFile}`);
		compileWatting.delete(tsFile);
	}

	return getOrInsertComputed(compileWatting, tsFile, () => {
		debug(`add file to worker: ${tsFile}, options: ${JSON.stringify(options)}`);

		const defer = Promise.withResolvers<IEsbuildResultInfo>();

		handler.postMessage({
			type: 'compile',
			tsFile,
			options: options ?? {},
		} satisfies IAddFileRequest);

		return defer;
	}).promise;
}

/**
 * 接收worker编译完成的文件
 */
export function onReceiveCompiledFile(data: IAddFileResponse) {
	const defer = compileWatting.get(data.tsFile);
	assert.ok(defer, `no watting promise for file: ${data.tsFile}`);

	if (data.success) {
		debug(`[success] received compiled file: ${data.tsFile} is ${data.buildInfo.resultEntryFile}`);
		defer.resolve(data.buildInfo);
	} else {
		debug(`[failed] received compiled file: ${data.tsFile}`);
		debug(data.message);

		const e = Object.create(Error.prototype, {
			file: { value: data.tsFile, enumerable: true, writable: false },
			message: { value: data.message, enumerable: true },
			stack: { value: data.stack, enumerable: true },
		});
		defer.reject(e);
	}
}

function getOrInsertComputed<K, V>(map: Map<K, V>, key: K, compute: (key: K) => V): V {
	const exists = map.get(key);
	if (exists !== undefined) {
		return exists;
	}
	const value = compute(key);
	map.set(key, value);
	return value;
}
