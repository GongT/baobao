import type { LoadFnOutput, LoadHookContext, ResolveFnOutput, ResolveHookContext } from 'node:module';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IInitializeMessage, InitializeData } from './common/message.types.js';
import { inspectEnabled } from './master/cli.js';
import { compileFile, createEntryMapping } from './worker/compiler.js';
import { logger, registerLogger } from './worker/logger.js';

type P<T> = T | Promise<T>;

export type NextResolve = (specifier: string, context?: Partial<ResolveHookContext>) => P<ResolveFnOutput>;

export type NextLoad = (url: string, context?: Partial<LoadHookContext>) => P<LoadFnOutput>;

let compiledFiles: undefined | Map<string, Uint8Array>;
let inspectModeEntryMapping: undefined | Map<string, string>;
export let messagePort: MessagePort | null = null;

export async function initialize({ options, port, tsFile }: InitializeData) {
	registerLogger(port);
	messagePort = port;

	port.on('message', (data) => {
		// handle messages
		if (data?.type === 'quit') {
			logger.worker`receive quit message`;
			port.postMessage({ type: 'quit' });
		}
	});

	let entryFileUrl: string = tsFile;
	try {
		logger.worker`initialize worker with options: ${tsFile}, ${options}`;
		compiledFiles = await compileFile(tsFile, options, port);

		if (inspectEnabled) {
			logger.worker`inspect mode enabled, entry mapping:`;
			inspectModeEntryMapping = new Map();
			const { entryPoints, outDir } = createEntryMapping([tsFile, ...(options?.entries ?? [])]);
			for (const entry of entryPoints) {
				const from = pathToFileURL(resolvePath(outDir, entry.in)).toString();
				// biome-ignore lint/style/useTemplate: 太长
				const to = pathToFileURL(resolvePath(outDir, entry.out)).toString() + '.js';
				logger.worker`  ${from} -> ${to}`;
				inspectModeEntryMapping.set(from, to);
			}
			const shouldFoundEntry = inspectModeEntryMapping.get(tsFile);

			if (!shouldFoundEntry) {
				throw new Error(`inspect mode entry file not found: ${tsFile}`);
			}
			entryFileUrl = shouldFoundEntry;
		}

		logger.worker`initialized | entry file: ${entryFileUrl}`;

		port.postMessage({ type: 'initialize', success: true, entryFileUrl: entryFileUrl } satisfies IInitializeMessage);
	} catch (e: any) {
		port.postMessage({ type: 'initialize', success: false, message: e.message, stack: e.stack } satisfies IInitializeMessage);
	}
}

export async function resolve(specifier: string, context: ResolveHookContext, nextResolve: NextResolve): Promise<ResolveFnOutput> {
	logger.hook`<${compiledFiles ? 'runtime' : 'compile'}> resolve: ${specifier} (${context.importAttributes.type})`;
	if (!compiledFiles) {
		// 编译没有完成时，插件正在尝试分析路径
		const r = await nextResolve(specifier, context);
		logger.hook`resolved default: ${r}`;
		return r;
	}

	let absolute: string = '';
	if (specifier.startsWith('.') && context.parentURL) {
		absolute = new URL(specifier, context.parentURL).href;
		logger.hook`    turn to absolute: ${absolute}`;
	} else if (specifier.startsWith('file:')) {
		absolute = specifier;
		logger.hook`    originally absolute`;
	} else {
		// logger.hook`    non-relative and non-file specifier, skip resolve: ${specifier}`;
	}

	const inspectEntry = absolute && inspectModeEntryMapping?.get(absolute);
	if (inspectEntry) {
		logger.hook`    found inspect mode entry!`;
		absolute = inspectEntry;
	}

	if (absolute && compiledFiles.has(absolute)) {
		logger.hook`    resolve memory result: ${absolute}`;
		return {
			url: absolute,
			format: 'module',
			shortCircuit: true,
		};
	}

	logger.hook`   - default resolve: ${specifier} | ${context.parentURL}`;
	try {
		return await nextResolve(specifier, context);
	} catch (e: any) {
		logger.error`default resolve failed: ${e.message}`;
		throw e;
	}
}

export function load(url: string, context: LoadHookContext, nextLoad: NextLoad): P<LoadFnOutput> {
	logger.hook`try load: ${url} (${context.importAttributes.type})`;
	if (!compiledFiles) {
		// esbuild plugin is loading package.json
		return nextLoad(url, context);
	}

	const data = compiledFiles.get(url);
	if (data) {
		logger.hook`    load from memory`;
		return {
			format: 'module',
			source: data,
			shortCircuit: true,
		};
		// } else {
		// 	const knowns = [...compiledFiles.keys()];
		// 	logger.hook(`not found this module (${knowns.length}): ${url}`);
		// 	for (const k of knowns) {
		// 		logger.hook(`  - ${k}`);
		// 	}
	}
	return nextLoad(url, context);
}
