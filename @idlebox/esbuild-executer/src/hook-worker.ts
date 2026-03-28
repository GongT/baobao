/**
 * 本文件是nodejs的 module.register worker
 *
 * 启动后会调用一次 initialize 方法，然后 node运行时 执行每个 import语句 时会调用 resolve、load 方法
 */

import type { LoadFnOutput, LoadHookContext, ResolveFnOutput, ResolveHookContext } from 'node:module';
import { isTypeOf, type IAddFileResponse, type IImportOptions, type InitializeData } from './common/message.types.js';
import { debounceRefresh } from './worker/alive.js';
import { _set_init_staff, postMessage } from './worker/bridge.js';
import { compileFile } from './worker/compiler.js';
import { logger } from './worker/logger.js';
import { compiledFiles } from './worker/post-process.js';

type P<T> = T | Promise<T>;

export type NextResolve = (specifier: string, context?: Partial<ResolveHookContext>) => P<ResolveFnOutput>;
export type NextLoad = (url: string, context?: Partial<LoadHookContext>) => P<LoadFnOutput>;

export async function initialize(input: InitializeData) {
	_set_init_staff(input);

	input.port.on('message', (data) => {
		if (isTypeOf(data, 'compile')) {
			addSourceFile(data.tsFile, data.options);
		} else if (isTypeOf(data, 'ping')) {
			postMessage({ type: 'pong', id: data.id });
		} else if (isTypeOf(data, 'quit')) {
			process.exit(0);
		} else {
			throw new Error(`unknown message type: ${data?.type ?? JSON.stringify(data)}`);
		}
	});

	postMessage({ type: 'initialize' });
}

/**
 *
 */
async function addSourceFile(tsFileUrl: string, options: IImportOptions) {
	try {
		logger.worker`initialize worker with options: ${tsFileUrl}, ${options}`;
		// const { result, outDir, ancestor } =
		await compileFile(tsFileUrl, options);
	} catch (e: any) {
		postMessage({
			type: 'compiled',
			tsFile: tsFileUrl,
			success: false,
			message: e.message,
			stack: e.stack,
			options: options,
		} satisfies IAddFileResponse);
	}
}

export async function resolve(specifier: string, context: ResolveHookContext, nextResolve: NextResolve): Promise<ResolveFnOutput> {
	if (!specifier.startsWith('file:') && specifier.includes(':')) {
		return await nextResolve(specifier, context);
	}

	logger.hook`try resolve: ${specifier}`;

	let absoluteUrl: string = '';
	if (specifier.startsWith('.') && context.parentURL) {
		absoluteUrl = new URL(specifier, context.parentURL).toString();
		logger.hook`    turn to absolute: ${absoluteUrl}`;
	} else if (specifier.startsWith('file:')) {
		absoluteUrl = specifier;
		logger.hook`    originally absolute`;
	} else {
		logger.hook`    non-relative and non-file`;
		logger.hook`   - default resolve: ${specifier} | ${context.parentURL}`;
	}

	if (absoluteUrl) {
		const compiled = compiledFiles.get(absoluteUrl);
		if (compiled) {
			debounceRefresh();
			logger.hook`    resolve result: ${compiled.kind}:${compiled.fileUrl}`;
			return {
				url: compiled.fileUrl,
				format: 'module',
				shortCircuit: true,
			};
		} else {
			logger.hook`    not found in compiled files`;
		}
		logger.hook`   - default resolve: ${specifier}`;
	}

	try {
		return await nextResolve(specifier, context);
	} catch (e: any) {
		compiledFiles.dump();

		logger.error`default resolve failed: ${e.message}`;
		throw e;
	}
}

export function load(url: string, context: LoadHookContext, nextLoad: NextLoad): P<LoadFnOutput> {
	logger.hook`try load: ${url} (${context.importAttributes.type})`;

	const data = compiledFiles.get(url);
	if (data?.kind === 'virtual') {
		logger.hook`    load from memory`;
		debounceRefresh();
		return {
			format: 'module',
			source: data.content,
			shortCircuit: true,
		};
	} else {
		//
	}
	return nextLoad(url, context);
}
